use super::event_listener::EventData;
use alloy_primitives::{Address, Bytes, B256, U256};
use monad_exec_events::{ffi::*, ExecEvent};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;

/// Serializable version of ExecEvent using alloy-primitives for type safety
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum SerializableExecEvent {
    RecordError {
        error_type: u16,
    },
    BlockStart {
        block_number: u64,
        block_id: B256,
        round: u64,
        epoch: u64,
        parent_eth_hash: B256,
        timestamp: u64,
        beneficiary: Address,
        gas_limit: u64,
        base_fee_per_gas: U256,
        timestamp_ns: u128,
    },
    BlockReject {
        reason: u32,
    },
    BlockPerfEvmEnter {
        timestamp_ns: u128,
    },
    BlockPerfEvmExit {
        timestamp_ns: u128,
    },
    BlockEnd {
        eth_block_hash: B256,
        state_root: B256,
        receipts_root: B256,
        logs_bloom: Bytes,
        gas_used: u64,
        timestamp_ns: u128,
    },
    BlockQC {
        block_id: B256,
        block_number: u64,
        round: u64,
        timestamp_ns: u128,
    },
    BlockFinalized {
        block_number: u64,
        timestamp_ns: u128,
    },
    BlockVerified {
        block_number: u64,
        timestamp_ns: u128,
    },
    TxnHeaderStart {
        txn_index: usize,
        txn_hash: B256,
        sender: Address,
        to: Address,
        gas_limit: u64,
        max_fee_per_gas: U256,
        max_priority_fee_per_gas: U256,
        value: U256,
        data: Bytes,
        blob_data: Bytes,
        timestamp_ns: u128,
    },
    TxnAccessListEntry {
        txn_index: usize,
        address: Address,
        storage_keys: Bytes,
    },
    TxnAuthListEntry {
        txn_index: usize,
        address: Address,
    },
    TxnHeaderEnd,
    TxnReject {
        txn_index: usize,
        reason: u32,
    },
    TxnPerfEvmEnter {
        timestamp_ns: u128,
    },
    TxnPerfEvmExit {
        timestamp_ns: u128,
    },
    TxnEvmOutput {
        txn_index: usize,
        status: bool,
        gas_used: u64,
    },
    TxnLog {
        txn_index: usize,
        address: Address,
        topics: Bytes,
        data: Bytes,
    },
    TxnCallFrame {
        txn_index: usize,
        depth: u32,
        caller: Address,
        call_target: Address,
        value: U256,
        input: Bytes,
        output: Bytes,
    },
    TxnEnd {
        timestamp_ns: u128,
    },
    AccountAccessListHeader {
        txn_index: Option<usize>,
        entry_count: u32,
    },
    AccountAccess {
        txn_index: Option<usize>,
        address: Address,
        balance: U256,
        nonce: u64,
        code_hash: B256,
    },
    StorageAccess {
        txn_index: Option<usize>,
        account_index: u64,
        key: B256,
        value: B256,
    },
    EvmError {
        domain_id: u64,
        status_code: i64,
    },
}

/// Convert monad_c_uint256_ne (4 u64 limbs, little-endian) to U256
fn uint256_from_c(val: &monad_c_uint256_ne) -> U256 {
    let mut bytes = [0u8; 32];
    for (i, &limb) in val.limbs.iter().enumerate() {
        bytes[i * 8..(i + 1) * 8].copy_from_slice(&limb.to_le_bytes());
    }
    U256::from_le_bytes(bytes)
}

fn get_unix_time_ns() -> u128 {
    let duration_since_epoch = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .unwrap();
    duration_since_epoch.as_nanos()
}

/// Exhaustive conversion from ExecEvent to SerializableExecEvent
/// If upstream adds a variant, this match will fail to compile (no wildcard pattern)
impl From<&ExecEvent> for SerializableExecEvent {
    fn from(event: &ExecEvent) -> Self {
        match event {
            ExecEvent::RecordError(err) => Self::RecordError {
                error_type: err.error_type,
            },
            ExecEvent::BlockStart(block) => Self::BlockStart {
                block_number: block.block_tag.block_number,
                block_id: B256::from_slice(&block.block_tag.id.bytes),
                round: block.round,
                epoch: block.epoch,
                parent_eth_hash: B256::from_slice(&block.parent_eth_hash.bytes),
                timestamp: block.eth_block_input.timestamp,
                beneficiary: Address::from_slice(&block.eth_block_input.beneficiary.bytes),
                gas_limit: block.eth_block_input.gas_limit,
                base_fee_per_gas: uint256_from_c(&block.eth_block_input.base_fee_per_gas),
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::BlockReject(reject) => Self::BlockReject { reason: *reject },
            ExecEvent::BlockPerfEvmEnter => Self::BlockPerfEvmEnter {
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::BlockPerfEvmExit => Self::BlockPerfEvmExit {
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::BlockEnd(end) => Self::BlockEnd {
                eth_block_hash: B256::from_slice(&end.eth_block_hash.bytes),
                state_root: B256::from_slice(&end.exec_output.state_root.bytes),
                receipts_root: B256::from_slice(&end.exec_output.receipts_root.bytes),
                logs_bloom: Bytes::copy_from_slice(&end.exec_output.logs_bloom.bytes),
                gas_used: end.exec_output.gas_used,
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::BlockQC(qc) => Self::BlockQC {
                block_id: B256::from_slice(&qc.block_tag.id.bytes),
                block_number: qc.block_tag.block_number,
                round: qc.round,
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::BlockFinalized(finalized) => Self::BlockFinalized {
                block_number: finalized.block_number,
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::BlockVerified(verified) => Self::BlockVerified {
                block_number: verified.block_number,
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::TxnHeaderStart {
                txn_index,
                txn_header_start,
                data_bytes,
                blob_bytes,
            } => Self::TxnHeaderStart {
                txn_index: *txn_index,
                txn_hash: B256::from_slice(&txn_header_start.txn_hash.bytes),
                sender: Address::from_slice(&txn_header_start.sender.bytes),
                to: Address::from_slice(&txn_header_start.txn_header.to.bytes),
                gas_limit: txn_header_start.txn_header.gas_limit,
                max_fee_per_gas: uint256_from_c(&txn_header_start.txn_header.max_fee_per_gas),
                max_priority_fee_per_gas: uint256_from_c(
                    &txn_header_start.txn_header.max_priority_fee_per_gas,
                ),
                value: uint256_from_c(&txn_header_start.txn_header.value),
                data: Bytes::copy_from_slice(data_bytes),
                blob_data: Bytes::copy_from_slice(blob_bytes),
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::TxnAccessListEntry {
                txn_index,
                txn_access_list_entry,
                storage_key_bytes,
            } => Self::TxnAccessListEntry {
                txn_index: *txn_index,
                address: Address::from_slice(&txn_access_list_entry.entry.address.bytes),
                storage_keys: Bytes::copy_from_slice(storage_key_bytes),
            },
            ExecEvent::TxnAuthListEntry {
                txn_index,
                txn_auth_list_entry,
            } => Self::TxnAuthListEntry {
                txn_index: *txn_index,
                address: Address::from_slice(&txn_auth_list_entry.entry.address.bytes),
            },
            ExecEvent::TxnHeaderEnd => Self::TxnHeaderEnd,
            ExecEvent::TxnReject { txn_index, reject } => Self::TxnReject {
                txn_index: *txn_index,
                reason: *reject,
            },
            ExecEvent::TxnPerfEvmEnter => Self::TxnPerfEvmEnter {
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::TxnPerfEvmExit => Self::TxnPerfEvmExit {
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::TxnEvmOutput { txn_index, output } => Self::TxnEvmOutput {
                txn_index: *txn_index,
                status: output.receipt.status,
                gas_used: output.receipt.gas_used,
            },
            ExecEvent::TxnLog {
                txn_index,
                txn_log,
                topic_bytes,
                data_bytes,
            } => Self::TxnLog {
                txn_index: *txn_index,
                address: Address::from_slice(&txn_log.address.bytes),
                topics: Bytes::copy_from_slice(topic_bytes),
                data: Bytes::copy_from_slice(data_bytes),
            },
            ExecEvent::TxnCallFrame {
                txn_index,
                txn_call_frame,
                input_bytes,
                return_bytes,
            } => Self::TxnCallFrame {
                txn_index: *txn_index,
                depth: txn_call_frame.index,
                caller: Address::from_slice(&txn_call_frame.caller.bytes),
                call_target: Address::from_slice(&txn_call_frame.call_target.bytes),
                value: uint256_from_c(&txn_call_frame.value),
                input: Bytes::copy_from_slice(input_bytes),
                output: Bytes::copy_from_slice(return_bytes),
            },
            ExecEvent::TxnEnd => Self::TxnEnd {
                timestamp_ns: get_unix_time_ns(),
            },
            ExecEvent::AccountAccessListHeader {
                txn_index,
                account_access_list_header,
            } => Self::AccountAccessListHeader {
                txn_index: *txn_index,
                entry_count: account_access_list_header.entry_count,
            },
            ExecEvent::AccountAccess {
                txn_index,
                account_access,
            } => Self::AccountAccess {
                txn_index: *txn_index,
                address: Address::from_slice(&account_access.address.bytes),
                balance: uint256_from_c(&account_access.prestate.balance),
                nonce: account_access.prestate.nonce,
                code_hash: B256::from_slice(&account_access.prestate.code_hash.bytes),
            },
            ExecEvent::StorageAccess {
                txn_index,
                account_index,
                storage_access,
            } => Self::StorageAccess {
                txn_index: *txn_index,
                account_index: *account_index,
                key: B256::from_slice(&storage_access.key.bytes),
                value: B256::from_slice(&storage_access.start_value.bytes),
            },
            ExecEvent::EvmError(error) => Self::EvmError {
                domain_id: error.domain_id,
                status_code: error.status_code,
            },
            // NO wildcard pattern - if ExecEvent adds a variant, this will fail to compile
        }
    }
}

/// Serializable version of EventData with converted payload
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SerializableEventData {
    timestamp: String,
    event_name: String,
    event_type: u16,
    seqno: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    block_number: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    txn_idx: Option<usize>,
    payload: SerializableExecEvent,
}

impl From<&EventData> for SerializableEventData {
    fn from(data: &EventData) -> Self {
        Self {
            timestamp: data.timestamp.clone(),
            event_name: data.event_name.clone(),
            event_type: data.event_type,
            seqno: data.seqno,
            block_number: data.block_number,
            txn_idx: data.txn_idx,
            payload: SerializableExecEvent::from(&data.payload),
        }
    }
}
