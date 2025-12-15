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

export interface SerializableEventData {
  event_name: EventName
  block_number?: number
  txn_idx?: number
  payload: SerializableExecEvent
  seqno: number
  timestamp_ns: string
}
