use clap::Parser;
use execution_events_example::event_filter::ClientMessage;
use execution_events_example::event_listener::EventName;
use execution_events_example::serializable_event::SerializableEventData;
use futures_util::{SinkExt, StreamExt};
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

    #[arg(short, long, default_value = "false")]
    dump_events: bool,
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
    let mut events_witnessed = 0;
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
                        match serde_json::from_str::<Vec<SerializableEventData>>(&text) {
                            Ok(events) => {
                                info!("Received {} events", events.len());
                                if cli.dump_events {
                                    info!("Events: {:?}", events);
                                }
                                events_witnessed += events.len();
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
                info!("Events per second: {}", events_witnessed);
                events_witnessed = 0;
            }
        }
    }

    warn!("Disconnected from server");
    Ok(())
}
