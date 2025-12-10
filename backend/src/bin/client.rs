use alloy_primitives::B256;
use clap::Parser;
use execution_events_example::event_listener::EventName;
use execution_events_example::serializable_event::SerializableExecEvent;
use execution_events_example::{event_filter::ClientMessage, server::ServerMessage};
use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
use tokio_tungstenite::{connect_async, tungstenite::Message};

use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use tracing::{error, info, warn};

#[derive(Debug, Parser)]
#[command(name = "client", about = "WebSocket client for execution events", long_about = None)]
struct Cli {
    /// WebSocket server URL
    #[arg(short, long, default_value = "ws://127.0.0.1:3000")]
    url: String,

    /// Filter events by type (comma-separated).
    /// If not specified, all events are received.
    #[arg(short, long, value_delimiter = ',')]
    events: Option<Vec<String>>,

    #[arg(long, default_value = "false")]
    verbose_events: bool,

    #[arg(long, default_value = "false")]
    verbose_accesses: bool,
}

macro_rules! log_event {
    // Entry: just message
    ($msg:expr) => {
        tracing::info!("------> {}", $msg)
    };
    // Entry: message with args - start recursion
    ($msg:expr, $($rest:tt)+) => {
        log_event!(@build [$msg] $($rest)+)
    };
    // Internal: final key=value pair
    (@build [$msg:expr] $key:ident = $value:expr) => {
        tracing::info!("------> {} {}={:?}", $msg, stringify!($key), $value)
    };
    // Internal: two pairs
    (@build [$msg:expr] $k1:ident = $v1:expr, $k2:ident = $v2:expr) => {
        tracing::info!("------> {} {}={:?} {}={:?}", $msg, stringify!($k1), $v1, stringify!($k2), $v2)
    };
    // Internal: three pairs
    (@build [$msg:expr] $k1:ident = $v1:expr, $k2:ident = $v2:expr, $k3:ident = $v3:expr) => {
        tracing::info!("------> {} {}={:?} {}={:?} {}={:?}", $msg, stringify!($k1), $v1, stringify!($k2), $v2, stringify!($k3), $v3)
    };
}

#[derive(Default)]
struct ClientState {
    events_witnessed: usize,
    block_start_ns: Option<u64>,
    txs_start_ns: HashMap<usize, (B256, u64)>,
    txs_execution_duration: std::time::Duration,
    current_block_number: Option<u64>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing subscriber
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cli = Cli::parse();

    info!("Connecting to {}...", cli.url);

    // Connect to the WebSocket server
    let (ws_stream, _) = connect_async(&cli.url).await?;
    info!("Connected!");

    let (mut write, mut read) = ws_stream.split();

    // Parse event names from strings to EventName enum
    let event_strings = cli.events.clone().unwrap_or_default();
    let events: Vec<EventName> = if event_strings.is_empty() {
        Vec::new()
    } else {
        event_strings
            .iter()
            .map(|s| {
                serde_json::from_value(serde_json::Value::String(s.clone()))
                    .map_err(|_| format!("Invalid event name: {}", s))
            })
            .collect::<Result<Vec<_>, _>>()?
    };

    // Send subscription message
    let subscribe_msg = ClientMessage::Subscribe {
        events: events.clone(),
    };
    let subscribe_json = serde_json::to_string(&subscribe_msg)?;
    write.send(Message::Text(subscribe_json)).await?;

    if events.is_empty() {
        info!("Subscribed to all events");
    } else {
        info!("Subscribed to events: {:?}", events);
    }

    // Read messages from the server
    let mut events_per_sec_interval = tokio::time::interval(tokio::time::Duration::from_secs(1));
    let mut client_state = ClientState::default();

    loop {
        tokio::select! {
            msg = read.next() => {
                if msg.is_none() {
                    warn!("Connection closed");
                    break;
                }
                let msg = msg.unwrap();
                match msg {
                    Ok(Message::Text(text)) => {
                        match serde_json::from_str::<ServerMessage>(&text) {
                            Ok(ServerMessage::Events(events)) => {
                                // Check for duplicate BlockStart events
                                for event in &events {
                                    match event.payload {
                                        SerializableExecEvent::BlockStart { block_number, base_fee_per_gas, .. } => {
                                            log_event!("BlockStart", height = block_number, base_fee = base_fee_per_gas);
                                            client_state.current_block_number = Some(u64::max(client_state.current_block_number.unwrap_or(0), block_number));
                                        }
                                        SerializableExecEvent::BlockPerfEvmEnter => {
                                            log_event!("BlockPerfEvmEnter", timestamp = event.timestamp_ns, block_number = client_state.current_block_number);
                                            client_state.block_start_ns = Some(event.timestamp_ns);
                                        }
                                        SerializableExecEvent::BlockPerfEvmExit => {
                                            if let Some(block_start_ns) = client_state.block_start_ns {
                                                let block_duration = std::time::Duration::from_nanos((event.timestamp_ns - block_start_ns) as u64);
                                                let parallel_execution_savings = client_state.txs_execution_duration.checked_sub(block_duration);
                                                let savings_pct = if parallel_execution_savings.is_none() { // This only happens with really small/empty blocks
                                                    error!("Parallel execution savings is negative: txs={:?} block={:?}", client_state.txs_execution_duration, block_duration);
                                                    None
                                                } else {
                                                    Some(100.0 * (1.0 - (block_duration.as_nanos() as f64 / client_state.txs_execution_duration.as_nanos() as f64)))
                                                };

                                                client_state.txs_execution_duration = std::time::Duration::from_nanos(0);

                                                log_event!("BlockPerfEvmExit", duration = block_duration, parallel_exec_savings = parallel_execution_savings, savings_pct = savings_pct);
                                            } else {
                                                warn!("BlockPerfEvmExit event received without BlockStart event");
                                            }
                                            client_state.block_start_ns = None;
                                        }
                                        SerializableExecEvent::BlockEnd { gas_used, .. } => {
                                            log_event!("BlockEnd", block_number = client_state.current_block_number, gas_used = gas_used);
                                            client_state.current_block_number = None;
                                        }
                                        SerializableExecEvent::BlockQC { block_number, .. } => {
                                            log_event!("BlockQC", block_number = block_number);
                                        },
                                        SerializableExecEvent::BlockFinalized { block_number, .. } => {
                                            log_event!("BlockFinalized", block_number = block_number);
                                        },
                                        SerializableExecEvent::TxnHeaderStart { txn_hash, txn_index, .. } => {
                                            log_event!("TxnHeaderStart", txn_index = txn_index, txn_hash = txn_hash);
                                            client_state.txs_start_ns.insert(txn_index, (txn_hash, event.timestamp_ns));
                                        },
                                        SerializableExecEvent::TxnEvmOutput { txn_index, .. } => {
                                            if let Some((txn_hash, txn_start_ns)) = client_state.txs_start_ns.remove(&txn_index) {
                                                let txn_evm_duration = std::time::Duration::from_nanos((event.timestamp_ns - txn_start_ns) as u64);
                                                client_state.txs_execution_duration += txn_evm_duration;
                                                log_event!("TxnEvmOutput", txn_index = txn_index, txn_hash = txn_hash, duration = txn_evm_duration);
                                            } else {
                                                warn!("TxnPerfEvmExit event received without TxnPerfEvmEnter event: {:?}", txn_index);
                                            }
                                        },
                                        _ => ()
                                    }
                                }

                                info!("Received {} events", events.len());
                                if cli.verbose_events {
                                    info!("Events: {:?}", events);
                                }
                                client_state.events_witnessed += events.len();
                            }
                            Ok(ServerMessage::TopAccesses(top_accesses)) => {
                                info!("Received top accesses");
                                if cli.verbose_accesses {
                                    for entry in &top_accesses.storage {
                                        info!("Storage access: address={}, key={}, count={}", entry.key.0, entry.key.1, entry.count);
                                    }
                                    for entry in &top_accesses.account {
                                        info!("Account access: address={}, count={}", entry.key, entry.count);
                                    }
                                }
                            }
                            Err(_) => {
                                error!("Failed to parse events: {}", text);
                            }
                        }
                    }
                    Ok(Message::Binary(data)) => {
                        info!("Received binary data: {} bytes", data.len());
                    }
                    Ok(Message::Close(frame)) => {
                        warn!("Connection closed: {:?}", frame);
                        break;
                    }
                    Ok(_) => (),
                    Err(e) => {
                        error!("Error receiving message: {}", e);
                        break;
                    },
                }
            }
            _ = events_per_sec_interval.tick() => {
                info!("Events per second: {}", client_state.events_witnessed);
                client_state.events_witnessed = 0;
            }
        }
    }

    warn!("Disconnected from server");
    Ok(())
}
