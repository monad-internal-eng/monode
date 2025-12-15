'use client'

import { useCallback, useState } from 'react'
import { useEvents } from '@/hooks/use-events'
import { formatTimestamp } from '@/lib/timestamp'
import type { Block } from '@/types/block'
import type { SerializableEventData } from '@/types/events'

const MAX_BLOCKS = 50

export function useExecutionEventBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([])

  const handleEvent = useCallback((event: SerializableEventData) => {
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

  return blocks
}
