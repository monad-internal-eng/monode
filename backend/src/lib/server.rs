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
pub enum EventDataOrMetrics {
    Event(EventData),
    TopAccesses(TopAccessesData),
    TPS(usize)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ServerMessage {
    Events(Vec<SerializableEventData>),
    TopAccesses(TopAccessesData),
    TPS(usize),
}

#[derive(Default)]
struct TPSTracker {
    block_1_txs: usize,
    block_2_txs: usize,
    block_3_txs: usize,
    current_tx_count: usize,
}

impl TPSTracker {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn record_tx(&mut self) {
        self.current_tx_count += 1;
    }

    pub fn get_tps(&mut self) -> usize {
        self.block_1_txs = self.block_2_txs;
        self.block_2_txs = self.block_3_txs;
        self.block_3_txs = self.current_tx_count;
        self.current_tx_count = 0;
        return self.block_1_txs + self.block_2_txs + (self.block_3_txs / 2);
    }
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
            Ok(ClientMessage::Subscribe { event_filters }) => {
                let filter = EventFilter::new(event_filters.clone());
                if filter.accepts_all() {
                    info!("Client {} subscribed to all events", addr);
                } else {
                    info!("Client {} subscribed with {} event filters", addr, event_filters.len());
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

// Helper function to process events into buffers
fn process_event(
    event: EventDataOrMetrics,
    filter: &EventFilter,
    events_buf: &mut Vec<SerializableEventData>,
    accesses_buf: &mut Vec<TopAccessesData>,
    tps_buf: &mut Vec<usize>,
) {
    match event {
        EventDataOrMetrics::Event(event_data) => {
            let serializable = SerializableEventData::from(&event_data);
            if filter.matches_event(&serializable) {
                events_buf.push(serializable);
            }
        }
        EventDataOrMetrics::TopAccesses(top_accesses_data) => {
            accesses_buf.push(top_accesses_data);
        }
        EventDataOrMetrics::TPS(tps) => {
            tps_buf.push(tps);
        }
    }
}

// Helper function to serialize and send a message over WebSocket
async fn send_message(
    ws_sender: &mut SplitSink<WebSocketStream<TcpStream>, Message>,
    server_msg: ServerMessage,
) -> anyhow::Result<()> {
    let json_message = serde_json::to_string(&server_msg)?;
    ws_sender.send(Message::Text(json_message)).await?;
    Ok(())
}

async fn client_write_task(
    mut event_broadcast_receiver: broadcast::Receiver<EventDataOrMetrics>,
    filter: EventFilter,
    addr: SocketAddr,
    mut ws_sender: SplitSink<WebSocketStream<TcpStream>, Message>,
) {
    let mut events_buf: Vec<SerializableEventData> = Vec::new();
    let mut accesses_buf: Vec<TopAccessesData> = Vec::new();
    let mut tps_buf: Vec<usize> = Vec::new();

    loop {
        // Wait for first event
        match event_broadcast_receiver.recv().await {
            Ok(event) => process_event(event, &filter, &mut events_buf, &mut accesses_buf, &mut tps_buf),
            Err(e) => {
                error!("Event broadcast receiver error for {}: {}", addr, e);
                break;
            }
        }

        // Drain all available events without blocking
        while let Ok(event) = event_broadcast_receiver.try_recv() {
            process_event(event, &filter, &mut events_buf, &mut accesses_buf, &mut tps_buf);
        }

        // Send all accumulated buffers
        if !events_buf.is_empty() {
            let server_msg = ServerMessage::Events(std::mem::take(&mut events_buf));
            if let Err(e) = send_message(&mut ws_sender, server_msg).await {
                error!("Failed to send events to {}: {}", addr, e);
                break;
            }
        }

        if !accesses_buf.is_empty() {
            for accesses in std::mem::take(&mut accesses_buf) {
                let server_msg = ServerMessage::TopAccesses(accesses);
                if let Err(e) = send_message(&mut ws_sender, server_msg).await {
                    error!("Failed to send accesses to {}: {}", addr, e);
                    break;
                }
            }
        }

        if !tps_buf.is_empty() {
            for tps in std::mem::take(&mut tps_buf) {
                let server_msg = ServerMessage::TPS(tps);
                if let Err(e) = send_message(&mut ws_sender, server_msg).await {
                    error!("Failed to send TPS to {}: {}", addr, e);
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
    event_broadcast_sender: broadcast::Sender<EventDataOrMetrics>,
) {
    let mut account_accesses = TopKTracker::new(1_000);
    let mut storage_accesses = TopKTracker::new(1_000);
    let mut accesses_reset_interval = tokio::time::interval(std::time::Duration::from_mins(5));

    // Track current transaction hash per txn_idx
    let mut current_txn_hashes: Vec<Option<[u8; 32]>> = vec![None; 10_000];

    let mut tps_tracker = TPSTracker::new();

    loop {
        tokio::select! {
            event_data = event_receiver.recv() => {
                if event_data.is_none() {
                    error!("Event receiver closed");
                    return;
                }
                let mut event_data = event_data.unwrap();

                // Track txn_hash from TxnHeaderStart events
                if let EventName::TxnHeaderStart = event_data.event_name {
                    if let ExecEvent::TxnHeaderStart { txn_index, txn_header_start, .. } = &event_data.payload {
                        current_txn_hashes[*txn_index] = Some(txn_header_start.txn_hash.bytes);
                    } else {
                        unreachable!();
                    }
                }

                // Populate txn_hash for events that have txn_idx
                if let Some(txn_idx) = event_data.txn_idx {
                    if let Some(Some(hash)) = current_txn_hashes.get(txn_idx) {
                        event_data.txn_hash = Some(*hash);
                    }
                }

                let mut tps_event = None;
                
                match event_data.event_name {
                    EventName::BlockStart => {
                        tps_event = Some(EventDataOrMetrics::TPS(tps_tracker.get_tps()));
                    }
                    EventName::TxnHeaderStart => {
                        tps_tracker.record_tx();
                    }
                    EventName::TxnEnd => {
                        if let Some(txn_idx) = event_data.txn_idx {
                            current_txn_hashes[txn_idx] = None;
                        }
                    }
                    EventName::AccountAccess => {
                        if let ExecEvent::AccountAccess {
                            account_access,
                            ..
                        } = &event_data.payload {
                            let address = Address::from_slice(&account_access.address.bytes);
                            account_accesses.record(address);
                        } else {
                            unreachable!();
                        }
                    }
                    EventName::StorageAccess => {
                        if let ExecEvent::StorageAccess {
                            storage_access,
                            ..
                        } = &event_data.payload {
                            let address = Address::from_slice(&storage_access.address.bytes);
                            let key = B256::from_slice(&storage_access.key.bytes);
                            storage_accesses.record((address, key));
                        } else {
                            unreachable!();
                        }
                    }
                    _ => (),
                }

                // Send accesses update on BlockEnd events (after all access events are processed)
                let send_accesses_update = if let EventName::BlockEnd = event_data.event_name {
                    true
                } else {
                    false
                };

                let _ = event_broadcast_sender.send(EventDataOrMetrics::Event(event_data));

                if send_accesses_update {
                    let top_accesses_data = TopAccessesData {
                        account: account_accesses.top_k(10),
                        storage: storage_accesses.top_k(10),
                    };
                    let _ = event_broadcast_sender.send(EventDataOrMetrics::TopAccesses(top_accesses_data));
                }

                if let Some(tps_event) = tps_event {
                    let _ = event_broadcast_sender.send(tps_event);
                }

            },
            _ = accesses_reset_interval.tick() => {
                account_accesses.reset();
                storage_accesses.reset();
            }
        }
    }
}

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    event_broadcast_receiver: broadcast::Receiver<EventDataOrMetrics>,
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
    server_addr: SocketAddr,
    event_receiver: tokio::sync::mpsc::Receiver<EventData>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Create a broadcast channel for distributing events to all clients
    let (event_broadcast_sender, _) = broadcast::channel::<EventDataOrMetrics>(1_000_000);

    // Spawn a task to forward events from the mpsc channel to the broadcast channel
    let event_broadcast_sender_clone = event_broadcast_sender.clone();
    let _ = tokio::spawn(run_event_forwarder_task(
        event_receiver,
        event_broadcast_sender_clone,
    ));

    // Bind the TCP listener
    let listener = TcpListener::bind(&server_addr).await?;
    info!("WebSocket server listening on: {}", server_addr);

    // Accept incoming connections
    loop {
        match listener.accept().await {
            Ok((stream, client_addr)) => {                        
                let event_broadcast_receiver = event_broadcast_sender.subscribe();
                tokio::spawn(handle_connection(stream, client_addr, event_broadcast_receiver));
            }
            Err(e) => {
                error!("Error accepting connection: {}", e);
            }
        }
    }
}
