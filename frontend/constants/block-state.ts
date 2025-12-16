import type { BlockState } from '@/types/block'

// Slow motion configuration
export const SLOW_MOTION_SPEED = 0.5
export const SLOW_MOTION_DURATION_SECONDS = 30
export const NORMAL_BLOCK_INTERVAL_MS = 400
export const SLOW_MOTION_BLOCK_INTERVAL_MS =
  NORMAL_BLOCK_INTERVAL_MS / SLOW_MOTION_SPEED

/**
 * Configuration for each block state including display label and gradient colors.
 *
 * Color meanings:
 * - Proposed: Amber - "pending", awaiting action
 * - Voted: Indigo - "confidence", has validator support (Monad brand)
 * - Finalized: Cyan - "locked in", confirmed but awaiting verification
 * - Verified: Green - "complete", fully verified
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
    gradient: 'linear-gradient(to bottom right, #f59e0b, #d97706)',
    shadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4)',
  },
  voted: {
    label: 'Voted',
    gradient: 'linear-gradient(to bottom right, #818cf8, #6366f1)',
    shadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)',
  },
  finalized: {
    label: 'Finalized',
    gradient: 'linear-gradient(to bottom right, #22d3ee, #06b6d4)',
    shadow: '0 8px 16px -4px rgba(6, 182, 212, 0.4)',
  },
  verified: {
    label: 'Verified',
    gradient: 'linear-gradient(to bottom right, #22c55e, #16a34a)',
    shadow: '0 8px 16px -4px rgba(22, 163, 74, 0.4)',
  },
}
