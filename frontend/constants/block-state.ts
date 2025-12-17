import type { BlockState } from '@/types/block'

// Slow motion configuration
export const SLOW_MOTION_DURATION_SECONDS = 30
export const SLOW_MOTION_BLOCK_INTERVAL_MS = 800

/**
 * Tailwind color tokens for block states.
 * Using semantic colors that convey progression toward completion.
 */
export const BLOCK_STATE_COLORS = {
  proposed: {
    primary: '#f59e0b', // amber-500
    secondary: '#d97706', // amber-600
  },
  voted: {
    primary: '#818cf8', // indigo-400
    secondary: '#6366f1', // indigo-500
  },
  finalized: {
    primary: '#4ade80', // green-400 (light green)
    secondary: '#22c55e', // green-500
  },
  verified: {
    primary: '#16a34a', // green-600 (dark green)
    secondary: '#15803d', // green-700
  },
}

/**
 * Configuration for each block state including display label and gradient colors.
 *
 * Color progression conveys block lifecycle:
 * - Proposed: Amber - "pending", awaiting action
 * - Voted: Indigo - "confidence", has validator support (Monad brand)
 * - Finalized: Light Green - "confirmed", execution complete
 * - Verified: Dark Green - "complete", fully verified and immutable
 */
export const BLOCK_STATE_CONFIG: Record<
  BlockState,
  {
    label: string
    gradient: string
    shadow: string
  }
> = {
  proposed: {
    label: 'Proposed',
    gradient: `linear-gradient(to bottom right, ${BLOCK_STATE_COLORS.proposed.primary}, ${BLOCK_STATE_COLORS.proposed.secondary})`,
    shadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)',
  },
  voted: {
    label: 'Voted',
    gradient: `linear-gradient(to bottom right, ${BLOCK_STATE_COLORS.voted.primary}, ${BLOCK_STATE_COLORS.voted.secondary})`,
    shadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
  },
  finalized: {
    label: 'Finalized',
    gradient: `linear-gradient(to bottom right, ${BLOCK_STATE_COLORS.finalized.primary}, ${BLOCK_STATE_COLORS.finalized.secondary})`,
    shadow: '0 8px 16px -4px rgba(74, 222, 128, 0.4)',
  },
  verified: {
    label: 'Verified',
    gradient: `linear-gradient(to bottom right, ${BLOCK_STATE_COLORS.verified.primary}, ${BLOCK_STATE_COLORS.verified.secondary})`,
    shadow: '0 8px 16px -4px rgba(22, 163, 74, 0.4)',
  },
}
