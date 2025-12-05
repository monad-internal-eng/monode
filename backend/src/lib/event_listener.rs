use std::{ffi::CStr, time::Duration};

use chrono::{DateTime, Local, TimeZone};
use lazy_static::lazy_static;
use monad_event_ring::{
    DecodedEventRing, EventDescriptor, EventDescriptorInfo, EventNextResult, EventPayloadResult,
    EventRingPath,
};
use monad_exec_events::ExecEvent;
use monad_exec_events::{
    ffi::{g_monad_exec_event_metadata, MONAD_EXEC_EVENT_COUNT},
    ExecEventDecoder, ExecEventDescriptorExt, ExecEventRing, ExecSnapshotEventRing,
};
use tracing::{debug, error, info, warn};

lazy_static! {
    static ref EXEC_EVENT_NAMES: [&'static str; MONAD_EXEC_EVENT_COUNT] =
        std::array::from_fn(|event_type| unsafe {
            CStr::from_ptr(g_monad_exec_event_metadata[event_type].c_name)
                .to_str()
                .unwrap()
        });
}

#[derive(Debug, Clone)]
pub struct EventData {
    pub timestamp: String,
    pub event_name: String,
    pub event_type: u16,
    pub seqno: u64,
    pub block_number: Option<u64>,
    pub txn_idx: Option<usize>,
    pub payload: ExecEvent,
}

enum OpenEventRing {
    Live(ExecEventRing),
    Snapshot(ExecSnapshotEventRing),
}

impl OpenEventRing {
    fn new(event_ring_path: EventRingPath) -> Result<Self, String> {
        if event_ring_path.is_snapshot_file()? {
            let snapshot = ExecSnapshotEventRing::new_from_zstd_path(event_ring_path, None)?;
            Ok(OpenEventRing::Snapshot(snapshot))
        } else {
            let live = ExecEventRing::new(event_ring_path)?;
            Ok(OpenEventRing::Live(live))
        }
    }
}

/// Convert event descriptor to EventData struct
fn event_to_data(event: &EventDescriptor<ExecEventDecoder>) -> Option<EventData> {
    let EventDescriptorInfo {
        seqno,
        event_type,
        record_epoch_nanos,
        flow_info,
    } = event.info();

    let timestamp = Local
        .timestamp_nanos(record_epoch_nanos as i64)
        .format("%H:%M:%S.%9f")
        .to_string();

    let event_name = EXEC_EVENT_NAMES[event_type as usize].to_string();

    // Get block number if present
    let block_number = if flow_info.block_seqno != 0 {
        event.get_block_number()
    } else {
        None
    };

    // Get transaction index if present
    let txn_idx = flow_info.txn_idx;

    // Try to read the payload
    let payload = match event.try_read() {
        EventPayloadResult::Expired => {
            error!("Payload expired for event seqno {}", seqno);
            return None;
        }
        EventPayloadResult::Ready(exec_event) => exec_event,
    };

    Some(EventData {
        timestamp,
        event_name,
        event_type,
        seqno,
        block_number,
        txn_idx,
        payload,
    })
}

pub fn start_event_listener(
    event_ring_path: EventRingPath,
    tx: tokio::sync::mpsc::Sender<EventData>,
) -> std::thread::JoinHandle<()> {
    std::thread::spawn(move || {
        info!("Starting event listener thread");

        // Try to open the event ring file
        let event_ring = match OpenEventRing::new(event_ring_path) {
            Ok(ring) => {
                info!("Successfully opened event ring");
                ring
            }
            Err(e) => {
                error!("Failed to open event ring: {}", e);
                return;
            }
        };

        let is_live = matches!(event_ring, OpenEventRing::Live(_));
        info!(
            "Event ring type: {}",
            if is_live { "Live" } else { "Snapshot" }
        );

        let mut event_reader = match event_ring {
            OpenEventRing::Live(ref live) => {
                let mut event_reader = live.create_reader();
                // Skip all buffered events by consuming them without processing
                info!("Skipping buffered events to reach latest position...");
                let mut skipped = 0;
                loop {
                    match event_reader.next_descriptor() {
                        EventNextResult::Ready(_) => {
                            skipped += 1;
                        }
                        EventNextResult::NotReady => {
                            info!(
                                "Skipped {} buffered events, now at latest position",
                                skipped
                            );
                            break;
                        }
                        EventNextResult::Gap => {
                            warn!("Gap while skipping buffered events");
                            event_reader.reset();
                        }
                    }
                }
                event_reader
            }
            OpenEventRing::Snapshot(ref snapshot) => snapshot.create_reader(),
        };

        let mut last_event_timestamp_ns: Option<u64> = None;
        let mut event_count: u64 = 0;
        info!("Entering event processing loop...");

        // Event processing loop
        loop {
            match event_reader.next_descriptor() {
                EventNextResult::Gap => {
                    error!("Event sequence number gap occurred!");
                    event_reader.reset();
                    continue;
                }
                EventNextResult::NotReady => {
                    match event_ring {
                        OpenEventRing::Snapshot(_) => {
                            // Snapshot finished, exit thread
                            info!("Snapshot replay complete");
                            return;
                        }
                        OpenEventRing::Live(_) => {
                            // Only check for dead ring if we've received at least one event
                            if let Some(last_ts) = last_event_timestamp_ns {
                                let now = Local::now();
                                let last_event_time =
                                    DateTime::from_timestamp_nanos(last_ts as i64);
                                if now.signed_duration_since(last_event_time).num_seconds() > 5 {
                                    warn!("Event ring appears dead, exiting listener thread");
                                    return;
                                }
                            }
                            std::thread::sleep(Duration::from_micros(100));
                        }
                    }
                    continue;
                }
                EventNextResult::Ready(event) => {
                    last_event_timestamp_ns = Some(event.info().record_epoch_nanos);
                    event_count += 1;

                    if event_count % 100 == 0 {
                        debug!("Processed {} events", event_count);
                    }

                    if let Some(event_data) = event_to_data(&event) {
                        // Send to channel; if receiver is dropped, exit thread
                        // Use blocking_send since we're in a blocking thread
                        if tx.blocking_send(event_data).is_err() {
                            warn!("Channel receiver dropped, exiting listener thread");
                            return;
                        }
                    } else {
                        event_reader.reset(); // Payload expired
                    }
                }
            };
        }
    })
}
