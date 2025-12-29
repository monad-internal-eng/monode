import type { BlockState } from '@/types/block'

export const SLOW_MOTION_DURATION_SECONDS = 30
export const SLOW_MOTION_BLOCK_INTERVAL_MS = 800

/**
 * Color tokens for block states (hex values for inline styles).
 * - Proposed: Amber - awaiting execution
 * - Executing: Purple - actively processing (Monad brand)
 * - Finalized: Purple - execution complete
 * - Verified: Green - fully verified on chain
 */
const STATE_COLORS: Record<BlockState, string> = {
  proposed: '#f59e0b',
  voted: '#836ef9',
  finalized: '#836ef9',
  verified: '#22c55e',
}

/**
 * Configuration for each block state including display properties
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
    dotColor: STATE_COLORS.proposed,
  },
  voted: {
    label: 'Executing',
    description: 'Processing transactions',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dotColor: STATE_COLORS.voted,
  },
  finalized: {
    label: 'Finalized',
    description: 'Execution complete',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    dotColor: STATE_COLORS.finalized,
  },
  verified: {
    label: 'Verified',
    description: 'On chain',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/30',
    dotColor: STATE_COLORS.verified,
  },
}

/** Legend items for the block state tracker UI */
export const BLOCK_STATE_LEGEND = [
  { label: 'Proposed', color: STATE_COLORS.proposed },
  { label: 'Executing', color: STATE_COLORS.voted },
  { label: 'Finalized', color: STATE_COLORS.finalized },
  { label: 'Verified', color: STATE_COLORS.verified },
]
