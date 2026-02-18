use std::collections::{HashMap, HashSet};

use alloy_primitives::{Address, B256};
use serde::{Deserialize, Serialize};

/// A contended storage slot: accessed by 2+ transactions in the same block
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContendedSlotEntry {
    pub address: Address,
    pub slot: B256,
    pub txn_count: u32,
    pub access_count: u32,
}

/// Contention stats for a single contract
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractContentionEntry {
    pub address: Address,
    pub total_slots: u32,
    pub contended_slots: u32,
    pub total_accesses: u32,
    pub contention_score: f64,
}

/// Edge between two contracts that are co-accessed in the same transactions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractEdge {
    pub contract_a: Address,
    pub contract_b: Address,
    pub shared_txn_count: u32,
}

/// Per-block contention snapshot broadcast to frontend
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentionData {
    pub block_number: u64,

    // Parallel efficiency
    pub block_wall_time_ns: u64,
    pub total_tx_time_ns: u64,
    pub parallel_efficiency_pct: f64,

    // Contention metrics
    pub total_unique_slots: u32,
    pub contended_slot_count: u32,
    pub contention_ratio: f64,
    pub total_txn_count: u32,

    // Top contended slots (max 20)
    pub top_contended_slots: Vec<ContendedSlotEntry>,

    // Top contracts by contention (max 15)
    pub top_contended_contracts: Vec<ContractContentionEntry>,

    // Contract co-access edges (max 15)
    pub contract_edges: Vec<ContractEdge>,
}

/// Tracks per-block storage access patterns for contention analysis.
///
/// For each block, records which transactions access which storage slots.
/// On BlockEnd, computes contention metrics: slots accessed by multiple
/// transactions indicate state contention that may cause re-execution
/// in Monad's optimistic parallel execution model.
///
/// NOTE: This does not directly observe re-execution events (not exposed by
/// the SDK). Instead, it infers contention from overlapping storage access
/// patterns, which is a necessary (but not sufficient) condition for
/// re-execution.
pub struct ContentionTracker {
    current_block_number: Option<u64>,
    block_start_ns: u64,

    // Per-tx timestamps for parallel efficiency calculation
    tx_start_ns: HashMap<usize, u64>,
    tx_end_ns: HashMap<usize, u64>,

    // (contract_address, storage_slot) -> set of txn indices
    slot_txns: HashMap<(Address, B256), HashSet<usize>>,

    // (contract_address, storage_slot) -> total access count
    slot_access_counts: HashMap<(Address, B256), u32>,

    // Per-txn: which contracts it accesses (for co-access edges)
    txn_contracts: HashMap<usize, HashSet<Address>>,

    txn_count: u32,
}

impl ContentionTracker {
    pub fn new() -> Self {
        Self {
            current_block_number: None,
            block_start_ns: 0,
            tx_start_ns: HashMap::new(),
            tx_end_ns: HashMap::new(),
            slot_txns: HashMap::new(),
            slot_access_counts: HashMap::new(),
            txn_contracts: HashMap::new(),
            txn_count: 0,
        }
    }

    /// Reset state for a new block
    pub fn on_block_start(&mut self, block_number: u64, timestamp_ns: u64) {
        self.current_block_number = Some(block_number);
        self.block_start_ns = timestamp_ns;
        self.tx_start_ns.clear();
        self.tx_end_ns.clear();
        self.slot_txns.clear();
        self.slot_access_counts.clear();
        self.txn_contracts.clear();
        self.txn_count = 0;
    }

    /// Record transaction start for parallel efficiency calculation
    pub fn on_txn_start(&mut self, txn_idx: usize, timestamp_ns: u64) {
        self.tx_start_ns.insert(txn_idx, timestamp_ns);
        self.txn_count += 1;
    }

    /// Record transaction end for parallel efficiency calculation
    pub fn on_txn_end(&mut self, txn_idx: usize, timestamp_ns: u64) {
        self.tx_end_ns.insert(txn_idx, timestamp_ns);
    }

    /// Record a storage access event
    pub fn on_storage_access(
        &mut self,
        address: Address,
        slot: B256,
        txn_idx: Option<usize>,
    ) {
        let key = (address, slot);

        // Increment total access count
        *self.slot_access_counts.entry(key).or_insert(0) += 1;

        // Track which txn accessed this slot
        if let Some(idx) = txn_idx {
            self.slot_txns.entry(key).or_default().insert(idx);
            self.txn_contracts.entry(idx).or_default().insert(address);
        }
    }

    /// Compute contention snapshot for the current block
    pub fn on_block_end(&mut self, timestamp_ns: u64) -> Option<ContentionData> {
        let block_number = self.current_block_number?;

        // --- Parallel efficiency ---
        let block_wall_time_ns = timestamp_ns.saturating_sub(self.block_start_ns);
        let total_tx_time_ns: u64 = self
            .tx_start_ns
            .iter()
            .filter_map(|(idx, start)| {
                self.tx_end_ns.get(idx).map(|end| end.saturating_sub(*start))
            })
            .sum();

        let parallel_efficiency_pct = if total_tx_time_ns > 0 {
            let saved = total_tx_time_ns.saturating_sub(block_wall_time_ns);
            (saved as f64 / total_tx_time_ns as f64) * 100.0
        } else {
            0.0
        };

        // --- Contended slots ---
        let total_unique_slots = self.slot_txns.len() as u32;

        let mut contended_slots: Vec<ContendedSlotEntry> = self
            .slot_txns
            .iter()
            .filter(|(_, txns)| txns.len() >= 2)
            .map(|((addr, slot), txns)| {
                let access_count = self
                    .slot_access_counts
                    .get(&(*addr, *slot))
                    .copied()
                    .unwrap_or(0);
                ContendedSlotEntry {
                    address: *addr,
                    slot: *slot,
                    txn_count: txns.len() as u32,
                    access_count,
                }
            })
            .collect();

        contended_slots.sort_by(|a, b| b.txn_count.cmp(&a.txn_count));
        let contended_slot_count = contended_slots.len() as u32;
        contended_slots.truncate(20);

        let contention_ratio = if total_unique_slots > 0 {
            contended_slot_count as f64 / total_unique_slots as f64
        } else {
            0.0
        };

        // --- Per-contract contention stats ---
        // Group slots by contract address
        let mut contract_total_slots: HashMap<Address, HashSet<B256>> = HashMap::new();
        let mut contract_contended_slots: HashMap<Address, u32> = HashMap::new();
        let mut contract_total_accesses: HashMap<Address, u32> = HashMap::new();

        for ((addr, slot), txns) in &self.slot_txns {
            contract_total_slots
                .entry(*addr)
                .or_default()
                .insert(*slot);
            let acc = self
                .slot_access_counts
                .get(&(*addr, *slot))
                .copied()
                .unwrap_or(0);
            *contract_total_accesses.entry(*addr).or_insert(0) += acc;
            if txns.len() >= 2 {
                *contract_contended_slots.entry(*addr).or_insert(0) += 1;
            }
        }

        let mut top_contracts: Vec<ContractContentionEntry> = contract_total_slots
            .iter()
            .filter_map(|(addr, slots)| {
                let contended = contract_contended_slots.get(addr).copied().unwrap_or(0);
                if contended == 0 {
                    return None;
                }
                let total = slots.len() as u32;
                let accesses = contract_total_accesses.get(addr).copied().unwrap_or(0);
                let score = if total > 0 {
                    contended as f64 / total as f64
                } else {
                    0.0
                };
                Some(ContractContentionEntry {
                    address: *addr,
                    total_slots: total,
                    contended_slots: contended,
                    total_accesses: accesses,
                    contention_score: score,
                })
            })
            .collect();

        top_contracts.sort_by(|a, b| {
            b.contended_slots
                .cmp(&a.contended_slots)
                .then(b.contention_score.partial_cmp(&a.contention_score).unwrap_or(std::cmp::Ordering::Equal))
        });
        top_contracts.truncate(15);

        // --- Contract co-access edges ---
        // Two contracts are "co-accessed" if the same transaction touches both.
        // This indicates execution dependency between the contracts.
        let mut edge_counts: HashMap<(Address, Address), u32> = HashMap::new();

        for (_, contracts) in &self.txn_contracts {
            let addrs: Vec<&Address> = contracts.iter().collect();
            for i in 0..addrs.len() {
                for j in (i + 1)..addrs.len() {
                    let (a, b) = if addrs[i] < addrs[j] {
                        (*addrs[i], *addrs[j])
                    } else {
                        (*addrs[j], *addrs[i])
                    };
                    *edge_counts.entry((a, b)).or_insert(0) += 1;
                }
            }
        }

        let mut contract_edges: Vec<ContractEdge> = edge_counts
            .into_iter()
            .map(|((a, b), count)| ContractEdge {
                contract_a: a,
                contract_b: b,
                shared_txn_count: count,
            })
            .collect();

        contract_edges.sort_by(|a, b| b.shared_txn_count.cmp(&a.shared_txn_count));
        contract_edges.truncate(15);

        Some(ContentionData {
            block_number,
            block_wall_time_ns,
            total_tx_time_ns,
            parallel_efficiency_pct,
            total_unique_slots,
            contended_slot_count,
            contention_ratio,
            total_txn_count: self.txn_count,
            top_contended_slots: contended_slots,
            top_contended_contracts: top_contracts,
            contract_edges,
        })
    }
}
