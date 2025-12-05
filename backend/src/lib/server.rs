use std::net::SocketAddr;

use futures_util::{SinkExt, StreamExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::broadcast;
use tokio_tungstenite::{accept_async, tungstenite::Message};
use tracing::{error, info, warn};

use super::event_listener::EventData;
use super::serializable_event::SerializableEventData;

async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    mut event_rx: broadcast::Receiver<EventData>,
) {
    info!("New WebSocket connection from: {}", addr);

    let ws_stream = match accept_async(stream).await {
        Ok(ws) => ws,
        Err(e) => {
            error!("Error during WebSocket handshake: {}", e);
            return;
        }
    };

    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    // Spawn a task to receive events from the broadcast channel and send batches to this client
    let send_addr = addr;
    let mut send_task = tokio::spawn(async move {
        let mut buffer: Vec<SerializableEventData> = Vec::new();
        let batch_interval = tokio::time::Duration::from_millis(1);
        let mut interval = tokio::time::interval(batch_interval);
        interval.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Skip);

        loop {
            let result = event_rx.recv().await;
            match result {
                Ok(event_data) => {
                    buffer.push(SerializableEventData::from(&event_data));
                }
                Err(e) => {
                    error!("Broadcast channel error for {}: {}", send_addr, e);
                    break;
                }
            }
            while let Ok(event_data) = event_rx.try_recv() {
                buffer.push(SerializableEventData::from(&event_data));
            }

            if !buffer.is_empty() {
                // Serialize batch to JSON
                let json_message = match serde_json::to_string(&std::mem::take(&mut buffer)) {
                    Ok(json) => json,
                    Err(e) => {
                        error!("Failed to serialize batch for {}: {}", send_addr, e);
                        buffer.clear();
                        continue;
                    }
                };

                // Send batch
                if let Err(e) = ws_sender.send(Message::Text(json_message)).await {
                    error!("Failed to send batch to {}: {}", send_addr, e);
                    break;
                }
            }
        }
    });

    // Spawn a task to handle incoming messages from the client (mostly for ping/pong)
    let mut recv_task = tokio::spawn(async move {
        while let Some(msg) = ws_receiver.next().await {
            match msg {
                Ok(Message::Close(_)) => break,
                Ok(Message::Ping(_data)) => {
                    // Echo back pong
                    // Note: Most WebSocket libraries handle this automatically
                }
                Ok(Message::Pong(_)) => {}
                Ok(_) => {
                    // Ignore other message types from clients
                }
                Err(e) => {
                    warn!("WebSocket error from {}: {}", addr, e);
                    break;
                }
            }
        }
    });

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
    mut rx: tokio::sync::mpsc::Receiver<EventData>,
) -> Result<(), Box<dyn std::error::Error>> {
    // Create a broadcast channel for distributing events to all clients
    // Use very large capacity to effectively make it unbounded
    let (broadcast_tx, _) = broadcast::channel::<EventData>(1_000_000);

    // Spawn a task to forward events from the mpsc channel to the broadcast channel
    let broadcast_tx_clone = broadcast_tx.clone();
    let broadcast_task = tokio::spawn(async move {
        loop {
            let event_data = rx.recv().await;
            if event_data.is_none() {
                warn!("Event receiver closed");
                return;
            }
            let event_data = event_data.unwrap();
            let _ = broadcast_tx_clone.send(event_data);
        }
    });

    // Bind the TCP listener
    let listener = TcpListener::bind(&addr).await?;
    info!("WebSocket server listening on: {}", addr);

    // Accept incoming connections
    while let Ok((stream, addr)) = listener.accept().await {
        let event_rx = broadcast_tx.subscribe();
        tokio::spawn(handle_connection(stream, addr, event_rx));
    }

    broadcast_task.abort();

    Ok(())
}
