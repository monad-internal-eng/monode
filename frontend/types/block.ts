/**
 * Block state types for the state tracker visualization
 */

export type BlockState = 'proposed' | 'voted' | 'finalized' | 'verified'

export interface Block {
  id: number
  state: BlockState
  timestamp?: string
}
