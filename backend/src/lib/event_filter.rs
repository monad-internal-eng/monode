use alloy_primitives::{Address, B256, U256};
use serde::{Deserialize, Serialize};
use super::event_listener::EventName;
use super::serializable_event::{SerializableEventData, SerializableExecEvent};

/// Generic range filter for numeric types
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RangeFilter<T> {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub min: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max: Option<T>,
}

impl<T: PartialOrd> RangeFilter<T> {
    /// Checks if a value matches this range filter
    pub fn matches(&self, value: &T) -> bool {
        if let Some(min) = &self.min {
            if value < min {
                return false;
            }
        }
        if let Some(max) = &self.max {
            if value > max {
                return false;
            }
        }
        true
    }

    /// Checks if this is an empty filter (no constraints)
    pub fn is_empty(&self) -> bool {
        self.min.is_none() && self.max.is_none()
    }
}

/// Generic exact match filter for any type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ExactMatchFilter<T> {
    pub values: Vec<T>,
}

impl<T: PartialEq> ExactMatchFilter<T> {
    /// Checks if a value matches this exact match filter
    pub fn matches(&self, value: &T) -> bool {
        self.values.is_empty() || self.values.contains(value)
    }

    /// Checks if this is an empty filter (no constraints)
    pub fn is_empty(&self) -> bool {
        self.values.is_empty()
    }
}

/// Field-specific filters for event data
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "field", content = "filter")]
pub enum FieldFilter {
    // ========== Top-level SerializableEventData fields ==========
    BlockNumber(RangeFilter<u64>),
    TxnIdx(RangeFilter<usize>),
    Seqno(RangeFilter<u64>),
    TimestampNs(RangeFilter<u64>),

    // ========== RecordError fields ==========
    ErrorType(ExactMatchFilter<u16>),
    DroppedEventType(ExactMatchFilter<u16>),
    TruncatedPayloadSize(ExactMatchFilter<u32>),
    RequestedPayloadSize(RangeFilter<u64>),

    // ========== BlockStart fields ==========
    BlockId(ExactMatchFilter<B256>),
    Round(RangeFilter<u64>),
    Epoch(RangeFilter<u64>),
    ParentEthHash(ExactMatchFilter<B256>),
    Timestamp(RangeFilter<u64>),
    Beneficiary(ExactMatchFilter<Address>),
    GasLimit(RangeFilter<u64>),
    BaseFeePerGas(RangeFilter<U256>),

    // ========== BlockReject fields ==========
    Reason(ExactMatchFilter<u32>),

    // ========== BlockEnd fields ==========
    EthBlockHash(ExactMatchFilter<B256>),
    StateRoot(ExactMatchFilter<B256>),
    ReceiptsRoot(ExactMatchFilter<B256>),
    GasUsed(RangeFilter<u64>),
    // LogsBloom omitted (Bytes - too large for filtering)

    // ========== BlockQC fields ==========
    // BlockId (already defined above)
    // Round (already defined above)

    // ========== BlockFinalized fields ==========
    // BlockId (already defined above)

    // ========== BlockVerified fields ==========
    // BlockNumber (already defined above)

    // ========== TxnHeaderStart fields ==========
    TxnIndex(RangeFilter<usize>),
    TxnHash(ExactMatchFilter<B256>),
    Sender(ExactMatchFilter<Address>),
    TxnType(ExactMatchFilter<u8>),
    ChainId(ExactMatchFilter<U256>),
    Nonce(RangeFilter<u64>),
    MaxFeePerGas(RangeFilter<U256>),
    MaxPriorityFeePerGas(RangeFilter<U256>),
    Value(RangeFilter<U256>),
    To(ExactMatchFilter<Address>),
    IsContractCreation(ExactMatchFilter<bool>),
    AccessListCount(ExactMatchFilter<u32>),
    AuthListCount(ExactMatchFilter<u32>),
    // data, r, s, y_parity omitted

    // ========== TxnAccessListEntry fields ==========
    // TxnIndex (already defined above)
    AccessListAddress(ExactMatchFilter<Address>),
    // storage_keys omitted

    // ========== TxnAuthListEntry fields ==========
    // TxnIndex (already defined above)
    Address(ExactMatchFilter<Address>),

    // ========== TxnReject fields ==========
    // TxnIndex (already defined above)
    // Reason (already defined above)

    // ========== TxnEvmOutput fields ==========
    // TxnIndex (already defined above)
    LogCount(ExactMatchFilter<u32>),
    Status(ExactMatchFilter<bool>),
    // GasUsed (already defined above)

    // ========== TxnLog fields ==========
    // TxnIndex (already defined above)
    LogIndex(RangeFilter<u32>),
    // Address (already defined above)
    // topics, data omitted

    // ========== TxnCallFrame fields ==========
    // TxnIndex (already defined above)
    Depth(RangeFilter<u32>),
    Caller(ExactMatchFilter<Address>),
    CallTarget(ExactMatchFilter<Address>),
    // Value (already defined above)
    // input, output omitted

    // ========== AccountAccessListHeader fields ==========
    // TxnIndex (already defined above)
    EntryCount(ExactMatchFilter<u32>),

    // ========== AccountAccess fields ==========
    // TxnIndex (already defined above)
    // Address (already defined above)
    Balance(RangeFilter<U256>),
    // Nonce (already defined above)
    CodeHash(ExactMatchFilter<B256>),

    // ========== StorageAccess fields ==========
    // TxnIndex (already defined above)
    AccountIndex(RangeFilter<u64>),
    StorageKey(ExactMatchFilter<B256>),
    StorageValue(ExactMatchFilter<B256>),

    // ========== EvmError fields ==========
    DomainId(RangeFilter<u64>),
    StatusCode(RangeFilter<i64>),
}

impl FieldFilter {
    /// Checks if an event matches this field filter
    pub fn matches(&self, event: &SerializableEventData) -> bool {
        match self {
            // Top-level fields
            FieldFilter::BlockNumber(range) => {
                event.block_number.as_ref().map_or(true, |v| range.matches(v))
            }
            FieldFilter::TxnIdx(range) => {
                event.txn_idx.as_ref().map_or(true, |v| range.matches(v))
            }
            FieldFilter::Seqno(range) => range.matches(&event.seqno),
            FieldFilter::TimestampNs(range) => range.matches(&event.timestamp_ns),

            // Delegate to payload matching
            _ => self.matches_payload(&event.event_name, &event.payload),
        }
    }

    /// Checks if a payload matches this field filter
    fn matches_payload(&self, event_name: &EventName, payload: &SerializableExecEvent) -> bool {
        match (self, event_name, payload) {
            // ========== RecordError ==========
            (FieldFilter::ErrorType(filter), EventName::RecordError, SerializableExecEvent::RecordError { error_type, .. }) => {
                filter.matches(error_type)
            }
            (FieldFilter::DroppedEventType(filter), EventName::RecordError, SerializableExecEvent::RecordError { dropped_event_type, .. }) => {
                filter.matches(dropped_event_type)
            }
            (FieldFilter::TruncatedPayloadSize(filter), EventName::RecordError, SerializableExecEvent::RecordError { truncated_payload_size, .. }) => {
                filter.matches(truncated_payload_size)
            }
            (FieldFilter::RequestedPayloadSize(range), EventName::RecordError, SerializableExecEvent::RecordError { requested_payload_size, .. }) => {
                range.matches(requested_payload_size)
            }

            // ========== BlockStart ==========
            (FieldFilter::BlockId(filter), EventName::BlockStart, SerializableExecEvent::BlockStart { block_id, .. }) => {
                filter.matches(block_id)
            }
            (FieldFilter::Round(range), EventName::BlockStart, SerializableExecEvent::BlockStart { round, .. }) => {
                range.matches(round)
            }
            (FieldFilter::Epoch(range), EventName::BlockStart, SerializableExecEvent::BlockStart { epoch, .. }) => {
                range.matches(epoch)
            }
            (FieldFilter::ParentEthHash(filter), EventName::BlockStart, SerializableExecEvent::BlockStart { parent_eth_hash, .. }) => {
                filter.matches(parent_eth_hash)
            }
            (FieldFilter::Timestamp(range), EventName::BlockStart, SerializableExecEvent::BlockStart { timestamp, .. }) => {
                range.matches(timestamp)
            }
            (FieldFilter::Beneficiary(filter), EventName::BlockStart, SerializableExecEvent::BlockStart { beneficiary, .. }) => {
                filter.matches(beneficiary)
            }
            (FieldFilter::GasLimit(range), EventName::BlockStart, SerializableExecEvent::BlockStart { gas_limit, .. }) => {
                range.matches(gas_limit)
            }
            (FieldFilter::BaseFeePerGas(range), EventName::BlockStart, SerializableExecEvent::BlockStart { base_fee_per_gas, .. }) => {
                range.matches(base_fee_per_gas)
            }

            // ========== BlockReject ==========
            (FieldFilter::Reason(filter), EventName::BlockReject, SerializableExecEvent::BlockReject { reason }) => {
                filter.matches(reason)
            }

            // ========== BlockEnd ==========
            (FieldFilter::EthBlockHash(filter), EventName::BlockEnd, SerializableExecEvent::BlockEnd { eth_block_hash, .. }) => {
                filter.matches(eth_block_hash)
            }
            (FieldFilter::StateRoot(filter), EventName::BlockEnd, SerializableExecEvent::BlockEnd { state_root, .. }) => {
                filter.matches(state_root)
            }
            (FieldFilter::ReceiptsRoot(filter), EventName::BlockEnd, SerializableExecEvent::BlockEnd { receipts_root, .. }) => {
                filter.matches(receipts_root)
            }
            (FieldFilter::GasUsed(range), EventName::BlockEnd, SerializableExecEvent::BlockEnd { gas_used, .. }) => {
                range.matches(gas_used)
            }

            // ========== BlockQC ==========
            (FieldFilter::BlockId(filter), EventName::BlockQC, SerializableExecEvent::BlockQC { block_id, .. }) => {
                filter.matches(block_id)
            }
            (FieldFilter::Round(range), EventName::BlockQC, SerializableExecEvent::BlockQC { round, .. }) => {
                range.matches(round)
            }

            // ========== BlockFinalized ==========
            (FieldFilter::BlockId(filter), EventName::BlockFinalized, SerializableExecEvent::BlockFinalized { block_id, .. }) => {
                filter.matches(block_id)
            }

            // ========== TxnHeaderStart ==========
            (FieldFilter::TxnIndex(range), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::TxnHash(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { txn_hash, .. }) => {
                filter.matches(txn_hash)
            }
            (FieldFilter::Sender(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { sender, .. }) => {
                filter.matches(sender)
            }
            (FieldFilter::TxnType(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { txn_type, .. }) => {
                filter.matches(txn_type)
            }
            (FieldFilter::ChainId(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { chain_id, .. }) => {
                filter.matches(chain_id)
            }
            (FieldFilter::Nonce(range), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { nonce, .. }) => {
                range.matches(nonce)
            }
            (FieldFilter::GasLimit(range), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { gas_limit, .. }) => {
                range.matches(gas_limit)
            }
            (FieldFilter::MaxFeePerGas(range), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { max_fee_per_gas, .. }) => {
                range.matches(max_fee_per_gas)
            }
            (FieldFilter::MaxPriorityFeePerGas(range), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { max_priority_fee_per_gas, .. }) => {
                range.matches(max_priority_fee_per_gas)
            }
            (FieldFilter::Value(range), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { value, .. }) => {
                range.matches(value)
            }
            (FieldFilter::To(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { to, .. }) => {
                filter.matches(to)
            }
            (FieldFilter::IsContractCreation(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { is_contract_creation, .. }) => {
                filter.matches(is_contract_creation)
            }
            (FieldFilter::AccessListCount(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { access_list_count, .. }) => {
                filter.matches(access_list_count)
            }
            (FieldFilter::AuthListCount(filter), EventName::TxnHeaderStart, SerializableExecEvent::TxnHeaderStart { auth_list_count, .. }) => {
                filter.matches(auth_list_count)
            }

            // ========== TxnAccessListEntry ==========
            (FieldFilter::TxnIndex(range), EventName::TxnAccessListEntry, SerializableExecEvent::TxnAccessListEntry { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::AccessListAddress(filter), EventName::TxnAccessListEntry, SerializableExecEvent::TxnAccessListEntry { address, .. }) => {
                filter.matches(address)
            }

            // ========== TxnAuthListEntry ==========
            (FieldFilter::TxnIndex(range), EventName::TxnAuthListEntry, SerializableExecEvent::TxnAuthListEntry { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::Address(filter), EventName::TxnAuthListEntry, SerializableExecEvent::TxnAuthListEntry { address, .. }) => {
                filter.matches(address)
            }

            // ========== TxnReject ==========
            (FieldFilter::TxnIndex(range), EventName::TxnReject, SerializableExecEvent::TxnReject { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::Reason(filter), EventName::TxnReject, SerializableExecEvent::TxnReject { reason, .. }) => {
                filter.matches(reason)
            }

            // ========== TxnEvmOutput ==========
            (FieldFilter::TxnIndex(range), EventName::TxnEvmOutput, SerializableExecEvent::TxnEvmOutput { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::LogCount(filter), EventName::TxnEvmOutput, SerializableExecEvent::TxnEvmOutput { log_count, .. }) => {
                filter.matches(log_count)
            }
            (FieldFilter::Status(filter), EventName::TxnEvmOutput, SerializableExecEvent::TxnEvmOutput { status, .. }) => {
                filter.matches(status)
            }
            (FieldFilter::GasUsed(range), EventName::TxnEvmOutput, SerializableExecEvent::TxnEvmOutput { gas_used, .. }) => {
                range.matches(gas_used)
            }

            // ========== TxnLog ==========
            (FieldFilter::TxnIndex(range), EventName::TxnLog, SerializableExecEvent::TxnLog { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::LogIndex(range), EventName::TxnLog, SerializableExecEvent::TxnLog { log_index, .. }) => {
                range.matches(log_index)
            }
            (FieldFilter::Address(filter), EventName::TxnLog, SerializableExecEvent::TxnLog { address, .. }) => {
                filter.matches(address)
            }

            // ========== TxnCallFrame ==========
            (FieldFilter::TxnIndex(range), EventName::TxnCallFrame, SerializableExecEvent::TxnCallFrame { txn_index, .. }) => {
                range.matches(txn_index)
            }
            (FieldFilter::Depth(range), EventName::TxnCallFrame, SerializableExecEvent::TxnCallFrame { depth, .. }) => {
                range.matches(depth)
            }
            (FieldFilter::Caller(filter), EventName::TxnCallFrame, SerializableExecEvent::TxnCallFrame { caller, .. }) => {
                filter.matches(caller)
            }
            (FieldFilter::CallTarget(filter), EventName::TxnCallFrame, SerializableExecEvent::TxnCallFrame { call_target, .. }) => {
                filter.matches(call_target)
            }
            (FieldFilter::Value(range), EventName::TxnCallFrame, SerializableExecEvent::TxnCallFrame { value, .. }) => {
                range.matches(value)
            }

            // ========== AccountAccessListHeader ==========
            (FieldFilter::TxnIndex(range), EventName::AccountAccessListHeader, SerializableExecEvent::AccountAccessListHeader { txn_index: Some(idx), .. }) => {
                range.matches(idx)
            }
            (FieldFilter::EntryCount(filter), EventName::AccountAccessListHeader, SerializableExecEvent::AccountAccessListHeader { entry_count, .. }) => {
                filter.matches(entry_count)
            }

            // ========== AccountAccess ==========
            (FieldFilter::TxnIndex(range), EventName::AccountAccess, SerializableExecEvent::AccountAccess { txn_index: Some(idx), .. }) => {
                range.matches(idx)
            }
            (FieldFilter::Address(filter), EventName::AccountAccess, SerializableExecEvent::AccountAccess { address, .. }) => {
                filter.matches(address)
            }
            (FieldFilter::Balance(range), EventName::AccountAccess, SerializableExecEvent::AccountAccess { balance, .. }) => {
                range.matches(balance)
            }
            (FieldFilter::Nonce(range), EventName::AccountAccess, SerializableExecEvent::AccountAccess { nonce, .. }) => {
                range.matches(nonce)
            }
            (FieldFilter::CodeHash(filter), EventName::AccountAccess, SerializableExecEvent::AccountAccess { code_hash, .. }) => {
                filter.matches(code_hash)
            }

            // ========== StorageAccess ==========
            (FieldFilter::TxnIndex(range), EventName::StorageAccess, SerializableExecEvent::StorageAccess { txn_index: Some(idx), .. }) => {
                range.matches(idx)
            }
            (FieldFilter::AccountIndex(range), EventName::StorageAccess, SerializableExecEvent::StorageAccess { account_index, .. }) => {
                range.matches(account_index)
            }
            (FieldFilter::StorageKey(filter), EventName::StorageAccess, SerializableExecEvent::StorageAccess { key, .. }) => {
                filter.matches(key)
            }
            (FieldFilter::StorageValue(filter), EventName::StorageAccess, SerializableExecEvent::StorageAccess { value, .. }) => {
                filter.matches(value)
            }

            // ========== EvmError ==========
            (FieldFilter::DomainId(range), EventName::EvmError, SerializableExecEvent::EvmError { domain_id, .. }) => {
                range.matches(domain_id)
            }
            (FieldFilter::StatusCode(range), EventName::EvmError, SerializableExecEvent::EvmError { status_code, .. }) => {
                range.matches(status_code)
            }

            // No match
            _ => false,
        }
    }
}

/// A filter specification for a single event name with optional field filters
/// Represents: EventName AND field_filter1 AND field_filter2 AND ...
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct EventFilterSpec {
    /// Event name to match
    pub event_name: EventName,
    /// Field filters that must all match (AND logic between them)
    /// Optional - defaults to empty vec (no field filtering)
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub field_filters: Vec<FieldFilter>,
}

impl EventFilterSpec {
    /// Checks if an event matches this filter spec
    pub fn matches(&self, event: &SerializableEventData) -> bool {
        if event.event_name != self.event_name {
            return false;
        }

        for filter in &self.field_filters {
            if !filter.matches(event) {
                return false;
            }
        }

        true
    }
}

/// Message sent by client to subscribe to specific event types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ClientMessage {
    /// Subscribe to events with filter specs.
    /// Empty event_filters means subscribe to all events.
    /// OR logic between specs: event passes if it matches ANY spec.
    ///
    /// Example: Subscribe to all BlockStart OR TxnLog with address=0xABC:
    /// ```json
    /// {
    ///   "type": "subscribe",
    ///   "event_filters": [
    ///     { "event_name": "BlockStart" },
    ///     { "event_name": "TxnLog", "field_filters": [
    ///       { "field": "Address", "filter": { "values": ["0xABC"] } }
    ///     ]}
    ///   ]
    /// }
    /// ```
    #[serde(rename = "subscribe")]
    Subscribe {
        #[serde(default)]
        event_filters: Vec<EventFilterSpec>,
    },
}

/// Filter for events with support for multiple filter specs (OR logic between specs)
#[derive(Clone, Debug, Default)]
pub struct EventFilter {
    /// Filter specs with OR logic between them
    event_filters: Vec<EventFilterSpec>,
}

impl EventFilter {
    /// Create a filter from event filter specs
    pub fn new(event_filters: Vec<EventFilterSpec>) -> Self {
        Self { event_filters }
    }

    /// Checks if an event matches any filter spec (OR logic)
    /// Returns true if at least one spec matches (or if there are no specs)
    pub fn matches_event(&self, event: &SerializableEventData) -> bool {
        if self.event_filters.is_empty() {
            return true;
        }

        for spec in &self.event_filters {
            if spec.matches(event) {
                return true;
            }
        }

        false
    }

    /// Checks if filter accepts all events
    pub fn accepts_all(&self) -> bool {
        self.event_filters.is_empty()
    }
}
