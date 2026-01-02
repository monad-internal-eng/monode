import type { BlockState } from '@/types/block'

export const SLOW_MOTION_DURATION_SECONDS = 30
export const SLOW_MOTION_EVENT_INTERVAL_MS = 75

/**
 * Color tokens for block states (hex values for inline styles).
 * - Proposed: Amber/orange - awaiting execution
 * - Voted: Purple - received votes
 * - Finalized: Blue - on chain
 * - Verified: Green - on chain, state verified
 */
export const STATE_COLORS: Record<BlockState, string> = {
  proposed: '#d4631f',
  voted: '#8b68d9',
  finalized: '#4680d6',
  verified: '#2aad7c',
}

/**
 * Configuration for each block state including display properties
 */
export const BLOCK_STATE_CONFIG: Record<
  BlockState,
  {
    label: string
    description?: string
    color: string
  }
> = {
  proposed: {
    label: 'Proposed',
    color: STATE_COLORS.proposed,
  },
  voted: {
    label: 'Voted',
    color: STATE_COLORS.voted,
  },
  finalized: {
    label: 'Finalized',
    description: 'On chain',
    color: STATE_COLORS.finalized,
  },
  verified: {
    label: 'Verified',
    description: 'On chain, state verified',
    color: STATE_COLORS.verified,
  },
}

/** Legend items for the block state tracker UI */
export const BLOCK_STATE_LEGEND = [
  { label: 'Proposed', color: STATE_COLORS.proposed },
  { label: 'Voted', color: STATE_COLORS.voted },
  { label: 'Finalized', color: STATE_COLORS.finalized },
  { label: 'Verified', color: STATE_COLORS.verified },
]
