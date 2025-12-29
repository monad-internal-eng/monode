'use client'

import { Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { BLOCK_STATE_LEGEND } from '@/constants/block-state'
import { useExecutionEventBlocks } from '@/hooks/use-execution-event-blocks'
import { cn } from '@/lib/utils'
import { Blockchain } from './blockchain'
import { SlowMotionControl } from './slow-motion-control'

/**
 * BlockStateTracker visualizes the blockchain with blocks progressing through states:
 * Proposed → Executing → Finalized → Verified
 *
 * Shows execution events from the SDK.
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

  // Pause when hovering or manually paused
  const isPaused = !isFollowingChain || isHovering

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="font-britti-sans text-2xl sm:text-[30px] font-medium leading-none text-white">
            Monad Block Tracker
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2 leading-6">
            Blocks advance through execution states in real time as execution
            events stream directly from the daemon.
          </p>
        </div>

        {/* Control Panel */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setIsFollowingChain(!isFollowingChain)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200',
              'text-sm font-medium',
              isFollowingChain
                ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white',
            )}
          >
            {isFollowingChain ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </button>
          <SlowMotionControl
            isActive={isSlowMotion}
            remainingSeconds={remainingSeconds}
            onStart={startSlowMotion}
            onStop={stopSlowMotion}
          />
        </div>
      </div>

      {/* Legend */}
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

      {/* Blockchain visualization */}
      <div
        className="flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Blockchain blocks={blocks} isFollowingChain={!isPaused} />
      </div>

      {/* Footer note */}
      <p className="text-xs text-zinc-500">
        Updates reflect execution events, not RPC polling. Hover to pause.
      </p>
    </div>
  )
}
