/**
 * Type definitions for backend execution events
 * These match the SerializableExecEvent enum from backend/src/lib/serializable_event.rs
 */
export type EventName =
  | 'RecordError'
  | 'BlockStart'
  | 'BlockReject'
  | 'BlockPerfEvmEnter'
  | 'BlockPerfEvmExit'
  | 'BlockEnd'
  | 'BlockQC'
  | 'BlockFinalized'
  | 'BlockVerified'
  | 'TxnHeaderStart'
  | 'TxnAccessListEntry'
  | 'TxnAuthListEntry'
  | 'TxnHeaderEnd'
  | 'TxnReject'
  | 'TxnPerfEvmEnter'
  | 'TxnPerfEvmExit'
  | 'TxnEvmOutput'
  | 'TxnLog'
  | 'TxnCallFrame'
  | 'TxnEnd'
  | 'AccountAccessListHeader'
  | 'AccountAccess'
  | 'StorageAccess'
  | 'EvmError'

export type SerializableExecEvent =
  | {
      type: 'RecordError'
      error_type: number
      dropped_event_type: number
      truncated_payload_size: number
      requested_payload_size: number
    }
  | {
      type: 'BlockStart'
      block_number: number
      block_id: string
      round: number
      epoch: number
      parent_eth_hash: string
      timestamp: number
      beneficiary: string
      gas_limit: number
      base_fee_per_gas: string
    }
  | { type: 'BlockReject'; reason: number }
  | { type: 'BlockPerfEvmEnter' }
  | { type: 'BlockPerfEvmExit' }
  | {
      type: 'BlockEnd'
      eth_block_hash: string
      state_root: string
      receipts_root: string
      logs_bloom: string
      gas_used: number
    }
  | {
      type: 'BlockQC'
      block_id: string
      block_number: number
      round: number
    }
  | {
      type: 'BlockFinalized'
      block_id: string
      block_number: number
    }
  | { type: 'BlockVerified'; block_number: number }
  | {
      type: 'TxnHeaderStart'
      txn_index: number
      txn_hash: string
      sender: string
      txn_type: number
      chain_id: string
      nonce: number
      gas_limit: number
      max_fee_per_gas: string
      max_priority_fee_per_gas: string
      value: string
      data: string
      to: string
      is_contract_creation: boolean
      r: string
      s: string
      y_parity: boolean
      access_list_count: number
      auth_list_count: number
    }
  | {
      type: 'TxnAccessListEntry'
      txn_index: number
      address: string
      storage_keys: string
    }
  | {
      type: 'TxnAuthListEntry'
      txn_index: number
      address: string
    }
  | { type: 'TxnHeaderEnd' }
  | { type: 'TxnReject'; txn_index: number; reason: number }
  | { type: 'TxnPerfEvmEnter' }
  | { type: 'TxnPerfEvmExit' }
  | {
      type: 'TxnEvmOutput'
      txn_index: number
      log_count: number
      status: boolean
      gas_used: number
    }
  | {
      type: 'TxnLog'
      txn_index: number
      log_index: number
      address: string
      topics: string[]
      data: string
    }
  | {
      type: 'TxnCallFrame'
      txn_index: number
      depth: number
      caller: string
      call_target: string
      value: string
      input: string
      output: string
    }
  | { type: 'TxnEnd' }
  | {
      type: 'AccountAccessListHeader'
      txn_index?: number
      entry_count: number
    }
  | {
      type: 'AccountAccess'
      txn_index?: number
      address: string
      balance: string
      nonce: number
      code_hash: string
    }
  | {
      type: 'StorageAccess'
      txn_index?: number
      account_index: number
      // When filtering by the key, use `storage_key` instead of `key`
      key: string
      // When filtering by the value, use `storage_value` instead of `value`
      value: string
    }
  | {
      type: 'EvmError'
      domain_id: number
      status_code: number
    }

export interface SerializableEventData {
  event_name: EventName
  block_number?: number
  txn_idx?: number
  txn_hash?: string
  payload: SerializableExecEvent
  seqno: number
  timestamp_ns: string
}

type RangeFilter<T> =
  | {
      min: T
    }
  | {
      max: T
    }
  | {
      min: T
      max: T
    }

interface ExactMatchFilter<T> {
  values: T[]
}

interface ArrayPrefixFilter<T> {
  values: T[]
}

export type FieldFilter =
  | { field: 'txn_index'; filter: RangeFilter<number> }
  | { field: 'address'; filter: ExactMatchFilter<string> }
  | { field: 'log_index'; filter: RangeFilter<number> }
  | { field: 'topics'; filter: ArrayPrefixFilter<string> }
