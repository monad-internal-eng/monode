/**
 * Block state types for the state tracker visualization
 */

import type { Transaction } from './transaction'

export type BlockState = 'proposed' | 'voted' | 'finalized' | 'verified'

export interface Block {
  id: number
  state: BlockState
  startTimestamp: string
  endTimestamp?: string
  transactions: Transaction[]
  executionTime?: number
}
