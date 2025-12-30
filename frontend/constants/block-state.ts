import type { BlockState } from '@/types/block'

export const SLOW_MOTION_DURATION_SECONDS = 30
export const SLOW_MOTION_EVENT_INTERVAL_MS = 150

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
    description?: string
    badgeClass: string
    dotColor: string
  }
> = {
  proposed: {
    label: 'Proposed',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-400',
    dotColor: STATE_COLORS.proposed,
  },
  voted: {
    label: 'Voted',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-400',
    dotColor: STATE_COLORS.voted,
  },
  finalized: {
    label: 'Finalized',
    description: 'On chain',
    badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-400',
    dotColor: STATE_COLORS.finalized,
  },
  verified: {
    label: 'Verified',
    description: 'On chain, state verified',
    badgeClass: 'bg-green-500/15 text-green-400 border-green-400',
    dotColor: STATE_COLORS.verified,
  },
}

/** Legend items for the block state tracker UI */
export const BLOCK_STATE_LEGEND = [
  { label: 'Proposed', color: STATE_COLORS.proposed },
  { label: 'Voted', color: STATE_COLORS.voted },
  { label: 'Finalized', color: STATE_COLORS.finalized },
  { label: 'Verified', color: STATE_COLORS.verified },
]
