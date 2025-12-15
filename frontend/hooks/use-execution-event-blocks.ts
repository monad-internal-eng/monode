'use client'

import { useCallback, useState } from 'react'
import { useBlockchainSlowMotion } from '@/hooks/use-blockchain-slow-motion'
import { useEvents } from '@/hooks/use-events'
import { formatTimestamp } from '@/lib/timestamp'
import type { Block } from '@/types/block'
import type { SerializableEventData } from '@/types/events'

const MAX_BLOCKS = 50

interface UseExecutionEventBlocksReturn {
  blocks: Block[]
  isSlowMotion: boolean
  remainingSeconds: number
  startSlowMotion: () => void
  stopSlowMotion: () => void
}

export function useExecutionEventBlocks(): UseExecutionEventBlocksReturn {
  const [blocks, setBlocks] = useState<Block[]>([])

  // Process a single event and update blocks state
  const processEvent = useCallback((event: SerializableEventData) => {
    const { payload } = event
    const timestamp = formatTimestamp(event.timestamp_ns)

    switch (payload.type) {
      case 'BlockStart': {
        setBlocks((prev) => {
          const exists = prev.some((b) => b.id === payload.block_number)
          if (exists) return prev
          const newBlocks: Block[] = [
            ...prev,
            {
              id: payload.block_number,
              state: 'proposed',
              timestamp,
            },
          ]
          return newBlocks.length > MAX_BLOCKS
            ? newBlocks.slice(-MAX_BLOCKS)
            : newBlocks
        })
        break
      }

      case 'BlockQC': {
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === payload.block_number
              ? {
                  ...block,
                  state: 'voted',
                  timestamp,
                }
              : block,
          ),
        )
        break
      }

      case 'BlockFinalized': {
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === payload.block_number
              ? {
                  ...block,
                  state: 'finalized',
                  timestamp,
                }
              : block,
          ),
        )
        break
      }

      case 'BlockVerified': {
        setBlocks((prev) =>
          prev.map((block) =>
            block.id === payload.block_number
              ? {
                  ...block,
                  state: 'verified',
                  timestamp,
                }
              : block,
          ),
        )
        break
      }

      case 'BlockReject': {
        // BlockReject doesn't have block_number in payload, use event.block_number if available
        if (event.block_number !== undefined) {
          setBlocks((prev) =>
            prev.filter((block) => block.id !== event.block_number),
          )
        }
        break
      }

      default:
        break
    }
  }, [])

  // Flush all queued events at once when slow motion ends
  const flushEvents = useCallback((events: SerializableEventData[]) => {
    // Process all events to build final state
    setBlocks((prev) => {
      let updatedBlocks = [...prev]

      for (const event of events) {
        const { payload } = event
        const timestamp = formatTimestamp(event.timestamp_ns)

        switch (payload.type) {
          case 'BlockStart': {
            const exists = updatedBlocks.some(
              (b) => b.id === payload.block_number,
            )
            if (!exists) {
              updatedBlocks.push({
                id: payload.block_number,
                state: 'proposed',
                timestamp,
              })
            }
            break
          }

          case 'BlockQC': {
            updatedBlocks = updatedBlocks.map((block) =>
              block.id === payload.block_number
                ? { ...block, state: 'voted', timestamp }
                : block,
            )
            break
          }

          case 'BlockFinalized': {
            updatedBlocks = updatedBlocks.map((block) =>
              block.id === payload.block_number
                ? { ...block, state: 'finalized', timestamp }
                : block,
            )
            break
          }

          case 'BlockVerified': {
            updatedBlocks = updatedBlocks.map((block) =>
              block.id === payload.block_number
                ? { ...block, state: 'verified', timestamp }
                : block,
            )
            break
          }

          case 'BlockReject': {
            if (event.block_number !== undefined) {
              updatedBlocks = updatedBlocks.filter(
                (block) => block.id !== event.block_number,
              )
            }
            break
          }

          default:
            break
        }
      }

      // Apply MAX_BLOCKS limit
      return updatedBlocks.length > MAX_BLOCKS
        ? updatedBlocks.slice(-MAX_BLOCKS)
        : updatedBlocks
    })
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

  // Route incoming events through slow motion queue
  const handleEvent = useCallback(
    (event: SerializableEventData) => {
      queueEvent(event)
    },
    [queueEvent],
  )

  useEvents({
    subscribeToEvents: [
      'BlockStart',
      'BlockQC',
      'BlockFinalized',
      'BlockVerified',
      'BlockReject',
    ],
    onEvent: handleEvent,
  })

  return {
    blocks,
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
  }
}
