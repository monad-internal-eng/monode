use serde::{Deserialize, Serialize};
use std::collections::HashSet;

use super::event_listener::EventName;

/// Message sent by client to subscribe to specific event types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    /// Subscribe to specific event types. Empty list means subscribe to all events.
    /// If any event name fails to deserialize, the connection will be rejected.
    #[serde(rename = "subscribe")]
    Subscribe { events: Vec<EventName> },
}

/// Filter for event types
#[derive(Clone, Debug, Default)]
pub struct EventFilter {
    /// Set of event types to include. If empty, all events pass through.
    event_types: HashSet<EventName>,
}

impl EventFilter {
    /// Create a filter from a list of event names
    pub fn from_event_names(events: Vec<EventName>) -> Self {
        Self {
            event_types: events.into_iter().collect(),
        }
    }

    /// Check if an event name matches the filter using direct enum comparison
    /// Returns true if the filter is empty (accept all) or if the event name is in the filter
    pub fn matches(&self, event_name: &EventName) -> bool {
        self.event_types.is_empty() || self.event_types.contains(event_name)
    }

    /// Check if filter accepts all events
    pub fn accepts_all(&self) -> bool {
        self.event_types.is_empty()
    }
}
