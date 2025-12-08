use std::collections::HashMap;
use std::hash::Hash;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessEntry<T> {
    key: T,
    count: u64,
}

/// Probabilistic top-K tracker using the Space-Saving algorithm
/// Based on: https://stackoverflow.com/a/3260905
///
/// This maintains approximate counts for the most frequent items in a stream
/// without storing all unique items. When the capacity is reached, it uses
/// a probabilistic eviction strategy that ensures heavy hitters are retained.
pub struct TopKTracker<T> {
    /// Maximum number of items to track
    capacity: usize,
    /// Map of item -> count
    counts: HashMap<T, u64>,
}

impl<T: Hash + Eq + Clone> TopKTracker<T> {
    /// Create a new TopKTracker with the given capacity
    pub fn new(capacity: usize) -> Self {
        Self {
            capacity,
            counts: HashMap::new(),
        }
    }

    /// Record an occurrence of an item
    pub fn record(&mut self, item: T) {
        if let Some(count) = self.counts.get_mut(&item) {
            // Item already tracked, increment its count
            *count += 1;
        } else if self.counts.len() < self.capacity {
            // Still have space, add new item
            self.counts.insert(item, 1);
        } else {
            // At capacity - use Space-Saving algorithm
            // Decrement all counts and remove zeros
            let mut to_remove = Vec::new();
            for (key, count) in self.counts.iter_mut() {
                *count = count.saturating_sub(1);
                if *count == 0 {
                    to_remove.push(key.clone());
                }
            }

            // Remove items with zero count
            for key in to_remove {
                self.counts.remove(&key);
            }

            // Add the new item
            self.counts.insert(item, 1);
        }
    }

    /// Get the top N items by count
    pub fn top_k(&self, n: usize) -> Vec<AccessEntry<T>> {
        let mut items: Vec<_> = self.counts.iter().map(|(k, v)| AccessEntry {
            key: k.clone(),
            count: *v
        }).collect();

        // Sort by count descending
        items.sort_by(|a, b| b.count.cmp(&a.count));

        // Take top N
        items.truncate(n);
        items
    }
}
