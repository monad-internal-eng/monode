'use client'

import { LayoutGroup, motion } from 'framer-motion'
import { useCallback, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { Block, BlockState } from '@/types/block'
import { Blockchain } from './blockchain'
import { Lane } from './lane'

// =============================================================================
// Utilities
// =============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * BlockStateTracker visualizes the lifecycle of blocks through different states:
 * Proposed → Voted → Finalized → Verified
 *
 * The tracker displays:
 * - Row 1: Proposed and Voted blocks in separate lanes
 * - Row 2: A horizontal blockchain showing Finalized and Verified blocks
 *
 * @note Currently uses local state for demonstration. In production, block state
 * updates will come from the backend via the Execution Events SDK.
 */
export default function BlockStateTracker() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [speed, setSpeed] = useState(1)
  const blockNumRef = useRef(1)

  const updateBlockState = useCallback((id: number, state: BlockState) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, state } : block)),
    )
  }, [])

  /**
   * TEMPORARY: Manual block spawning for demonstration purposes.
   * In production, blocks will be received from backend events and their
   * state transitions will be driven by real blockchain data.
   */
  const spawnBlock = useCallback(async () => {
    const id = blockNumRef.current++

    // Start as proposed
    setBlocks((prev) => [{ id, state: 'proposed' }, ...prev])

    // TEMPORARY: Simulate state transitions with delays
    // In production, these transitions will come from backend events
    await sleep(500 / speed)
    updateBlockState(id, 'voted')

    await sleep(800 / speed)
    updateBlockState(id, 'finalized')

    await sleep(600 / speed)
    updateBlockState(id, 'verified')
  }, [speed, updateBlockState])

  // Filter blocks by state
  const proposedBlocks = blocks.filter((b) => b.state === 'proposed')
  const votedBlocks = blocks.filter((b) => b.state === 'voted')
  const finalizedBlocks = blocks.filter((b) => b.state === 'finalized')
  const verifiedBlocks = blocks.filter((b) => b.state === 'verified')

  return (
    <LayoutGroup>
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        {/* 
          TEMPORARY: Demo Controls
          This section will be removed in production. Block creation and state 
          transitions will be handled automatically by backend events.
        */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 bg-[#1a1a2e]/90 rounded-xl border border-[#2a2a4a]/50"
          >
            <div className="flex items-center gap-3 flex-1">
              <label
                htmlFor="speed"
                className="text-[#a0a0b0] font-medium text-sm whitespace-nowrap"
              >
                Speed:
              </label>
              <input
                type="range"
                id="speed"
                min="0.5"
                max="5"
                step="0.5"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1 max-w-[120px] sm:max-w-[150px] accent-indigo-500 h-2 rounded-full bg-[#2a2a4a] cursor-pointer"
              />
              <span className="text-gray-200 text-sm font-mono min-w-[3ch]">
                {speed}x
              </span>
            </div>
            <motion.button
              type="button"
              onClick={spawnBlock}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'px-6 py-2.5 rounded-lg font-semibold text-white text-sm',
                'bg-linear-to-br from-indigo-500 to-violet-600',
                'shadow-lg shadow-indigo-500/30',
                'transition-shadow duration-200',
                'hover:shadow-xl hover:shadow-indigo-500/40',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#1a1a2e]',
              )}
            >
              Spawn Block
            </motion.button>
          </motion.div>

          {/* Block states explanation */}
          <p className="text-xs text-[#6a6a7a] px-1">
            In MonadBFT, blocks progress through four states:{' '}
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

        {/* Row 1: Proposed & Voted */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Lane title="Proposed" blocks={proposedBlocks} />
          <Lane title="Voted" blocks={votedBlocks} />
        </div>

        {/* Row 2: Blockchain (Finalized + Verified) */}
        <Blockchain
          finalizedBlocks={finalizedBlocks}
          verifiedBlocks={verifiedBlocks}
        />
      </div>
    </LayoutGroup>
  )
}
