'use client'

import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
import { BLOCK_STATE_LEGEND } from '@/constants/block-state'
import { useExecutionEventBlocks } from '@/hooks/use-execution-event-blocks'
import { cn } from '@/lib/utils'
import { Blockchain } from './blockchain'
import { SlowMotionControl } from './slow-motion-control'

/**
 * Visualizes the blockchain with blocks progressing through states:
 * Proposed → Executing → Finalized → Verified
 */
export default function BlockStateTracker() {
  const {
    blocks,
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
    isFollowingChain,
    setIsFollowingChain,
  } = useExecutionEventBlocks()

  const [isHovering, setIsHovering] = useState(false)
  const isPaused = !isFollowingChain || isHovering

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Monad Block Execution Tracker"
        description="Track blocks as they move through execution and verification, observed live via execution events."
      >
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsFollowingChain(!isFollowingChain)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200',
              isFollowingChain
                ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white',
            )}
          >
            {isFollowingChain ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isFollowingChain ? 'Pause' : 'Resume'}
          </button>
          <SlowMotionControl
            isActive={isSlowMotion}
            remainingSeconds={remainingSeconds}
            onStart={startSlowMotion}
            onStop={stopSlowMotion}
          />
        </div>
      </SectionHeader>

      <div className="flex items-center gap-4 sm:gap-6">
        {BLOCK_STATE_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs sm:text-sm text-zinc-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="overflow-visible"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Blockchain blocks={blocks} isFollowingChain={!isPaused} />
      </button>

      <p className="text-sm text-zinc-500">
        Updates reflect execution events, not RPC polling. <u>Hover to pause</u>
        .
      </p>
    </div>
  )
}
