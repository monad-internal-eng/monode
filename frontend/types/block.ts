/**
 * Block state types for the state tracker visualization
 */

import type { Transaction } from './transaction'

export type BlockState = 'proposed' | 'voted' | 'finalized' | 'verified'

export interface Block {
  id: number
  state: BlockState
  blockTime: number // time between block start and block end - execution time of a block in ms
  transactions: Transaction[]
}
