'use client'

import { useCallback, useState } from 'react'
import { useBlockchainSlowMotion } from '@/hooks/use-blockchain-slow-motion'
import { useEvents } from '@/hooks/use-events'
import { formatTimestamp } from '@/lib/timestamp'
import type { Block, BlockState } from '@/types/block'
import type { SerializableEventData } from '@/types/events'

// Events we subscribe to for block state tracking
const BLOCK_EVENTS = [
  'BlockStart',
  'BlockQC',
  'BlockFinalized',
  'BlockVerified',
  'BlockReject',
] as const

interface UseExecutionEventBlocksReturn {
  blocks: Block[]
  isSlowMotion: boolean
  remainingSeconds: number
  startSlowMotion: () => void
  stopSlowMotion: () => void
  isFollowingChain: boolean
  setIsFollowingChain: (value: boolean) => void
}

// Map event types to block states
const EVENT_TO_STATE: Record<string, BlockState> = {
  BlockQC: 'voted',
  BlockFinalized: 'finalized',
  BlockVerified: 'verified',
}

/**
 * Applies a single event to a blocks array and returns the updated array.
 * Pure function with no side effects - used by both single event processing and batch flushing.
 */
function applyEventToBlocks(
  blocks: Block[],
  event: SerializableEventData,
): Block[] {
  const { payload } = event
  const timestamp = formatTimestamp(event.timestamp_ns)

  switch (payload.type) {
    case 'BlockStart': {
      const exists = blocks.some((b) => b.number === payload.block_number)
      if (exists) return blocks
      return [
        ...blocks,
        { number: payload.block_number, state: 'proposed', timestamp },
      ]
    }

    case 'BlockQC':
    case 'BlockFinalized':
    case 'BlockVerified': {
      const newState = EVENT_TO_STATE[payload.type]
      return blocks.map((block) =>
        block.number === payload.block_number
          ? { ...block, state: newState, timestamp }
          : block,
      )
    }

    case 'BlockReject': {
      // BlockReject doesn't have block_number in payload, use event.block_number if available
      if (event.block_number !== undefined) {
        return blocks.filter((block) => block.number !== event.block_number)
      }
      return blocks
    }

    default:
      return blocks
  }
}

export function useExecutionEventBlocks(): UseExecutionEventBlocksReturn {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isFollowingChain, setIsFollowingChain] = useState(true)

  // Process a single event and update blocks state
  const processEvent = useCallback((event: SerializableEventData) => {
    setBlocks((prev) => applyEventToBlocks(prev, event))
  }, [])

  // Flush all queued events at once when slow motion ends
  const flushEvents = useCallback((events: SerializableEventData[]) => {
    setBlocks((prev) => events.reduce(applyEventToBlocks, prev))
  }, [])

  const {
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
    queueEvent,
  } = useBlockchainSlowMotion({
    onProcessEvent: processEvent,
    onFlushEvents: flushEvents,
  })

  useEvents({
    subscribeToEvents: BLOCK_EVENTS,
    onEvent: queueEvent,
  })

  return {
    blocks,
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
    isFollowingChain,
    setIsFollowingChain,
  }
}
