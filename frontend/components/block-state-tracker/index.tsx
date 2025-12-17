'use client'

import { useCallback, useState } from 'react'
import { useEvents } from '@/hooks/use-events'
import type { Block } from '@/types/block'
import type { SerializableEventData } from '@/types/events'
import { Blockchain } from './blockchain'

// =============================================================================
// Main Component
// =============================================================================

/**
 * BlockStateTracker visualizes the blockchain with blocks progressing through states:
 * Proposed → Voted → Finalized → Verified
 *
 * Blocks are added to the chain from the right and their color/label updates
 * smoothly as they progress through consensus states.
 *
 * Block state updates come from the backend via the Execution Events.
 */
export default function BlockStateTracker() {
  const [blocks, setBlocks] = useState<Block[]>([])

  const handleEvent = useCallback((event: SerializableEventData) => {
    const { payload } = event

    switch (payload.type) {
      case 'BlockStart': {
        setBlocks((prev) => {
          const exists = prev.some(
            (b) => b?.id === payload.block_number.toString(),
          )
          if (exists) return prev
          return [
            ...prev,
            {
              id: payload.block_number.toString(),
              number: payload.block_number.toString(),
              state: 'proposed',
              startTimestamp: event.timestamp_ns,
              transactions: [],
            },
          ]
        })
        break
      }

      case 'BlockQC': {
        setBlocks((prev) =>
          prev.map((block) =>
            block?.id === payload.block_number.toString()
              ? { ...block, state: 'voted' }
              : block,
          ),
        )
        break
      }

      case 'BlockFinalized': {
        setBlocks((prev) =>
          prev.map((block) =>
            block?.id === payload.block_number.toString()
              ? { ...block, state: 'finalized' }
              : block,
          ),
        )
        break
      }

      case 'BlockVerified': {
        setBlocks((prev) =>
          prev.map((block) =>
            block?.id === payload.block_number.toString()
              ? { ...block, state: 'verified' }
              : block,
          ),
        )
        break
      }

      case 'BlockReject': {
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

  return (
    <div className="w-full flex flex-col gap-2 sm:gap-4">
      {/* Blockchain visualization */}
      <Blockchain blocks={blocks} />

      <div className="flex flex-col gap-3">
        <p className="text-sm text-[#6a6a7a] px-1">
          Blocks progress through states:{' '}
          <span className="text-amber-400">Proposed</span> →{' '}
          <span className="text-indigo-400">Voted</span> →{' '}
          <span className="text-cyan-400">Finalized</span> →{' '}
          <span className="text-green-400">Verified</span>.{' '}
          <a
            href="https://docs.monad.xyz/monad-arch/consensus/block-states"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            Learn more
          </a>
        </p>
      </div>
    </div>
  )
}
