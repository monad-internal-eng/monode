import type { BlockState } from '@/types/block'

// Slow motion configuration
export const SLOW_MOTION_DURATION_SECONDS = 30
export const SLOW_MOTION_BLOCK_INTERVAL_MS = 800

/**
 * Color tokens for block states.
 * Using semantic colors that convey progression toward completion.
 */
export const BLOCK_STATE_COLORS = {
  proposed: {
    primary: '#f59e0b', // amber-500
    dot: '#f59e0b',
  },
  voted: {
    primary: '#836ef9', // purple (Monad brand)
    dot: '#836ef9',
  },
  finalized: {
    primary: '#836ef9', // purple
    dot: '#836ef9',
  },
  verified: {
    primary: '#22c55e', // green-500
    dot: '#22c55e',
  },
}

/**
 * Configuration for each block state including display label and colors.
 *
 * Color progression conveys block lifecycle:
 * - Proposed: Amber - "pending", awaiting action
 * - Voted/Executing: Purple - "in progress", actively executing (Monad brand)
 * - Finalized: Purple - "confirmed", execution complete
 * - Verified: Green - "complete", fully verified on chain
 */
export const BLOCK_STATE_CONFIG: Record<
  BlockState,
  {
    label: string
    description: string
    badgeClass: string
    dotColor: string
  }
> = {
  proposed: {
    label: 'Proposed',
    description: 'Pending execution',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    dotColor: BLOCK_STATE_COLORS.proposed.dot,
  },
  voted: {
    label: 'Executing',
    description: 'Processing transactions',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dotColor: BLOCK_STATE_COLORS.voted.dot,
  },
  finalized: {
    label: 'Finalized',
    description: 'Execution complete',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dotColor: BLOCK_STATE_COLORS.finalized.dot,
  },
  verified: {
    label: 'Verified',
    description: 'On chain',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    dotColor: BLOCK_STATE_COLORS.verified.dot,
  },
}

/**
 * Legend items for the block state tracker
 */
export const BLOCK_STATE_LEGEND = [
  { label: 'Proposed', color: BLOCK_STATE_COLORS.proposed.dot },
  { label: 'Executing', color: BLOCK_STATE_COLORS.voted.dot },
  { label: 'Finalized', color: BLOCK_STATE_COLORS.finalized.dot },
  { label: 'Verified', color: BLOCK_STATE_COLORS.verified.dot },
]
