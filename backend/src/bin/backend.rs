use std::{net::SocketAddr, path::PathBuf};

use clap::Parser;
use monad_event_ring::EventRingPath;
use tokio::sync::mpsc;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use execution_events_example::event_listener;
use execution_events_example::event_listener::EventData;
use execution_events_example::server;

#[derive(Debug, Parser)]
#[command(name = "eventwatch", about, long_about = None)]
pub struct Cli {
    #[arg(long)]
    event_ring_path: Option<PathBuf>,

    #[arg(short, long, default_value = "127.0.0.1:3000")]
    server_addr: String,
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

    let Cli {
        event_ring_path,
        server_addr,
    } = Cli::parse();

    // Resolve the event ring path
    let event_ring_path = EventRingPath::resolve(event_ring_path.unwrap_or(PathBuf::from(
        "/var/lib/hugetlbfs/user/monad/pagesize-2MB/event-rings/monad-exec-events",
    )))?;

    // Create a channel for communication between event listener thread and server
    // Use large buffer to handle bursts
    let (tx, rx) = mpsc::channel::<EventData>(100_000);

    // Spawn the event listener thread
    let _listener_handle = event_listener::start_event_listener(event_ring_path, tx);

    // Parse server address
    let addr: SocketAddr = server_addr.parse()?;

    // Run the WebSocket server
    server::run_websocket_server(addr, rx).await?;

    Ok(())
}
