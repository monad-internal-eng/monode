/**
 * Block state types for the state tracker visualization
 */

import type { Transaction } from './transaction'

export type BlockState = 'proposed' | 'voted' | 'finalized' | 'verified'

export interface Block {
  id?: string // Unique identifier for the block
  number: string // Number of the block, multiple different proposed block can have the same number
  state: BlockState
  startTimestamp: string
  endTimestamp?: string
  transactions: Transaction[]
  executionTime?: string // time between block start and block end - execution time of a block in ns
  timestamp?: string
}
