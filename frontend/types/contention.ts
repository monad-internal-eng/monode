/**
 * Type definitions for contention analytics data.
 * These match the ContentionData struct from backend/src/lib/contention_tracker.rs
 *
 * IMPORTANT: Contention metrics are INFERRED from storage access patterns.
 * They represent a necessary condition for re-execution, not a guarantee
 * that re-execution occurred. The Execution Events SDK does not expose
 * direct re-execution events.
 */

export interface ContendedSlotEntry {
  address: string
  slot: string
  txn_count: number
  access_count: number
}

export interface ContractContentionEntry {
  address: string
  total_slots: number
  contended_slots: number
  total_accesses: number
  contention_score: number
}

export interface ContractEdge {
  contract_a: string
  contract_b: string
  shared_txn_count: number
}

export interface ContentionData {
  block_number: number

  // Parallel efficiency
  block_wall_time_ns: number
  total_tx_time_ns: number
  parallel_efficiency_pct: number

  // Contention metrics
  total_unique_slots: number
  contended_slot_count: number
  contention_ratio: number
  total_txn_count: number

  // Top contended slots (max 20)
  top_contended_slots: ContendedSlotEntry[]

  // Top contracts by contention (max 15)
  top_contended_contracts: ContractContentionEntry[]

  // Contract co-access edges (max 15)
  contract_edges: ContractEdge[]
}
