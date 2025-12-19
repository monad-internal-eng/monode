/**
 * Type definitions for backend execution events
 * These match the SerializableExecEvent enum from backend/src/lib/serializable_event.rs
 */
export type EventName =
  | 'BlockStart'
  | 'BlockReject'
  | 'BlockQC'
  | 'BlockFinalized'
  | 'BlockVerified'
  | 'BlockEnd'
  | 'TxnHeaderStart'
  | 'TxnEnd'
  | 'TxnEvmOutput'

export type SerializableExecEvent =
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
  | {
      type: 'BlockQC'
      block_id: string
      block_number: number
      round: number
    }
  | { type: 'BlockFinalized'; block_number: number }
  | { type: 'BlockVerified'; block_number: number }
  | { type: 'BlockEnd'; block_number: number }
  | {
      type: 'TxnHeaderStart'
      txn_index: number
      txn_hash: string
      sender: string
      to: string
      gas_limit: number
      max_fee_per_gas: string
      max_priority_fee_per_gas: string
      value: string
      data: string
      blob_data: string
    }
  | { type: 'TxnEnd' }
  | {
      type: 'TxnEvmOutput'
      txn_index: number
      status: boolean
      gas_used: number
    }

export interface SerializableEventData {
  event_name: EventName
  block_number?: number
  txn_idx?: number
  payload: SerializableExecEvent
  seqno: number
  timestamp_ns: string
}
