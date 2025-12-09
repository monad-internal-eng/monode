use std::net::SocketAddr;

use alloy_primitives::{Address, B256};
use futures_util::stream::SplitSink;
use futures_util::{stream::SplitStream, SinkExt, StreamExt};
use monad_exec_events::ExecEvent;
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_tungstenite::{accept_async, tungstenite::Message, WebSocketStream};
use tracing::{error, info, warn};
use serde::{Deserialize, Serialize};

use crate::event_listener::EventName;
use crate::top_k_tracker::{AccessEntry, TopKTracker};

use super::event_filter::{ClientMessage, EventFilter};
use super::event_listener::EventData;
use super::serializable_event::SerializableEventData;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TopAccessesData {
    pub account: Vec<AccessEntry<Address>>,
    pub storage: Vec<AccessEntry<(Address, B256)>>,
}

#[derive(Debug, Clone)]
pub enum EventDataOrAccesses {
    Event(EventData),
    TopAccesses(TopAccessesData),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ServerMessage {
    Events(Vec<SerializableEventData>),
    TopAccesses(TopAccessesData),
}

/// Wait for the client to send a subscription message, with a timeout.
/// Returns the filter, or None if the client disconnects or times out.
async fn wait_for_subscription(
    ws_receiver: &mut SplitStream<WebSocketStream<TcpStream>>,
    addr: SocketAddr,
) -> Option<EventFilter> {
    let timeout = tokio::time::Duration::from_secs(10);

    match tokio::time::timeout(timeout, ws_receiver.next()).await {
        Ok(Some(Ok(Message::Text(text)))) => match serde_json::from_str::<ClientMessage>(&text) {
            Ok(ClientMessage::Subscribe { events }) => {
                let filter = EventFilter::from_event_names(events.clone());
                if filter.accepts_all() {
                    info!("Client {} subscribed to all events", addr);
                } else {
                    info!("Client {} subscribed to events: {:?}", addr, events);
                }
                Some(filter)
            }
            Err(e) => {
                warn!(
                    "Client {} sent invalid subscription: {} - {}",
                    addr, e, text
                );
                None
            }
        },
        Ok(Some(Ok(_))) => {
            warn!("Client {} sent non-text message before subscribing", addr);
            None
        }
        Ok(Some(Err(e))) => {
            warn!("WebSocket error from {} before subscription: {}", addr, e);
            None
        }
        Ok(None) => {
            warn!("Client {} disconnected before subscribing", addr);
            None
        }
        Err(_) => {
            warn!("Client {} timed out waiting for subscription", addr);
            None
        }
    }
}

async fn client_write_task(
    mut event_broadcast_receiver: broadcast::Receiver<EventDataOrAccesses>,
    filter: EventFilter,
    addr: SocketAddr,
    mut ws_sender: SplitSink<WebSocketStream<TcpStream>, Message>,
) {
    let mut events_buf: Vec<SerializableEventData> = Vec::new();
    let mut accesses_buf: Vec<TopAccessesData> = Vec::new();

    loop {
        let result = event_broadcast_receiver.recv().await;
        if result.is_err() {
            error!("Broadcast channel error for {}: {}", addr, result.err().unwrap());
            break;
        }
        let event = result.unwrap();
        match event {
            EventDataOrAccesses::Event(event_data) => {
                if filter.matches(&event_data.event_name) {
                    events_buf.push(SerializableEventData::from(&event_data));
                }
            }
            EventDataOrAccesses::TopAccesses(top_accesses_data) => {
                accesses_buf.push(top_accesses_data);
            }
        }
        while let Ok(event) = event_broadcast_receiver.try_recv() {
            match event {
                EventDataOrAccesses::Event(event_data) => {
                    if filter.matches(&event_data.event_name) {
                        events_buf.push(SerializableEventData::from(&event_data));
                    }
                }
                EventDataOrAccesses::TopAccesses(top_accesses_data) => {
                    accesses_buf.push(top_accesses_data);
                }
            }
        }

        if !events_buf.is_empty() {
            let server_msg = ServerMessage::Events(std::mem::take(&mut events_buf));
            // Serialize batch to JSON
            let json_message = serde_json::to_string(&server_msg).unwrap();

            // Send batch
            if let Err(e) = ws_sender.send(Message::Text(json_message)).await {
                error!("Failed to send batch to {}: {}", addr, e);
                break;
            }
        }
        if !accesses_buf.is_empty() {
            for accesses in std::mem::take(&mut accesses_buf) {
                let server_msg = ServerMessage::TopAccesses(accesses);
                let json_message = serde_json::to_string(&server_msg).unwrap();
                if let Err(e) = ws_sender.send(Message::Text(json_message)).await {
                    error!("Failed to send batch to {}: {}", addr, e);
                    break;
                }
            }
        }
    }
}

async fn client_read_task(
    addr: SocketAddr,
    mut ws_receiver: SplitStream<WebSocketStream<TcpStream>>,
) {
    while let Some(msg) = ws_receiver.next().await {
        match msg {
            Ok(Message::Close(_)) => {
                info!("Received close message from client {}, disconnecting", addr);
                break;
            }
            Ok(Message::Text(_) | Message::Binary(_)) => {
                // Don't allow any inbound messages after subscribing - disconnect when any received
                warn!(
                    "Client {} sent unsolicited message after subscribing - disconnecting",
                    addr
                );
                break;
            }
            Err(e) => {
                warn!("WebSocket error from {}: {}", addr, e);
                break;
            }
            _ => (),
        }
    }
}

async fn run_event_forwarder_task(
    mut event_receiver: tokio::sync::mpsc::Receiver<EventData>,
    event_broadcast_sender: broadcast::Sender<EventDataOrAccesses>,
) {
    let mut account_accesses = TopKTracker::new(10_000);
    let mut storage_accesses = TopKTracker::new(10_000);
    let mut stats_interval = tokio::time::interval(std::time::Duration::from_secs(5));

    loop {
        tokio::select! {
            event_data = event_receiver.recv() => {
                if event_data.is_none() {
                    warn!("Event receiver closed");
                    return;
                }
                let event_data = event_data.unwrap();

                if let EventName::AccountAccess = event_data.event_name {
                    if let ExecEvent::AccountAccess {
                        account_access,
                        ..
                    } = event_data.payload {
                        let address = Address::from_slice(&account_access.address.bytes);
                        account_accesses.record(address);
                    } else {
                        unreachable!();
                    }
                } else if let EventName::StorageAccess = event_data.event_name {
                    if let ExecEvent::StorageAccess {
                        storage_access,
                        ..
                    } = event_data.payload {
                        let address = Address::from_slice(&storage_access.address.bytes);
                        let key = B256::from_slice(&storage_access.key.bytes);
                        storage_accesses.record((address, key));
                    } else {
                        unreachable!();
                    }
                }

                let _ = event_broadcast_sender.send(EventDataOrAccesses::Event(event_data));
            },
            _ = stats_interval.tick() => {
                let top_accesses_data = TopAccessesData {
                    account: account_accesses.top_k(10),
                    storage: storage_accesses.top_k(10),
                };
                let _ = event_broadcast_sender.send(EventDataOrAccesses::TopAccesses(top_accesses_data));
            }
        }
    }
}

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    event_broadcast_receiver: broadcast::Receiver<EventDataOrAccesses>,
) {
    info!("New WebSocket connection from: {}", addr);

    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            error!("Error during WebSocket handshake: {}", e);
            return;
        }
    };

    let (ws_sender, mut ws_receiver) = ws_stream.split();

    // Wait for subscription message before streaming events
    let filter = match wait_for_subscription(&mut ws_receiver, addr).await {
        Some(f) => f,
        None => return,
    };

    // Spawn a task to receive events from the broadcast channel and send batches to this client
    let mut send_task = tokio::spawn(client_write_task(
        event_broadcast_receiver,
        filter,
        addr,
        ws_sender,
    ));

    // Spawn a task to handle incoming messages from the client (mostly for ping/pong)
    let mut recv_task = tokio::spawn(client_read_task(addr.clone(), ws_receiver));

    // Wait for either task to finish
    tokio::select! {
        result = &mut send_task => {
            recv_task.abort();
            if let Err(e) = result {
                error!("Send task panicked for {}: {}", addr, e);
            }
        }
        result = &mut recv_task => {
            send_task.abort();
            if let Err(e) = result {
                error!("Receive task panicked for {}: {}", addr, e);
            }
        }
    }

    info!("WebSocket connection closed: {}", addr);
}

pub async fn run_websocket_server(
    addr: SocketAddr,
    event_receiver: tokio::sync::mpsc::Receiver<EventData>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Create a broadcast channel for distributing events to all clients
    let (event_broadcast_sender, _) = broadcast::channel::<EventDataOrAccesses>(1_000_000);

    // Spawn a task to forward events from the mpsc channel to the broadcast channel
    let event_broadcast_sender_clone = event_broadcast_sender.clone();
    let broadcast_task = tokio::spawn(run_event_forwarder_task(
        event_receiver,
        event_broadcast_sender_clone,
    ));

    // Bind the TCP listener
    let listener = TcpListener::bind(&addr).await?;
    info!("WebSocket server listening on: {}", addr);

    // Accept incoming connections
    while let Ok((stream, addr)) = listener.accept().await {
        let event_broadcast_receiver = event_broadcast_sender.subscribe();
        tokio::spawn(handle_connection(stream, addr, event_broadcast_receiver));
    }

    broadcast_task.abort();

    Ok(())
}
