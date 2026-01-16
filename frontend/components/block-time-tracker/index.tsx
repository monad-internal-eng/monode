'use client'

import { Clock, Pointer, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
import { StatCard } from '@/components/ui/stat-card'
import { useBlockExecutionTracker } from '@/hooks/use-block-execution-tracker'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { fromNsToMsPrecise } from '@/lib/block-metrics'
import { cn } from '@/lib/utils'
import { BlockTimeLegend } from './block-time-legend'
import { BlockTimeTimeline } from './block-time-timeline'

// =============================================================================
// Main Component
// =============================================================================

/**
 * Block Time Tracker visualizes block and transaction execution times in real-time.
 *
 * Uses the Execution Events SDK to receive real-time block lifecycle events
 * and calculates execution timing metrics for visualization.
 */
export function BlockTimeExecutionTracker() {
  const { finalizedBlocks, maxBlockExecutionTime, normalizedTimeScaleMs } =
    useBlockExecutionTracker()
  const [isFollowingChain, setIsFollowingChain] = useState(true)
  const { isHovering, hoverProps } = useMouseHover()
  const isPaused = !isFollowingChain || isHovering

  const avgBlockExecutionTime = useMemo(() => {
    if (finalizedBlocks.length === 0) {
      return 0
    }

    const totalBlockExecutionTime = finalizedBlocks.reduce(
      (sum, block) => sum + (block.executionTime ?? BigInt(0)),
      BigInt(0),
    )

    return Math.round(
      fromNsToMsPrecise(totalBlockExecutionTime) / finalizedBlocks.length,
    )
  }, [finalizedBlocks])

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* Execution Block Time */}
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <SectionHeader
          title="Execution Block Time"
          description="Execution time observed directly from execution events."
        />
        <div className="flex flex-col md:flex-row gap-4">
          <StatCard
            label="Average Execution Time"
            value={avgBlockExecutionTime.toFixed(0)}
            unit="ms"
            description="Measured during execution, not inferred post-finalization."
            icon={Clock}
            iconClassName="text-green-400"
            iconBgClassName="bg-green-950"
          />
          <StatCard
            label="Max Execution Time"
            value={maxBlockExecutionTime.toFixed(0)}
            unit="ms"
            description="Peak execution time observed in the current session."
            icon={TrendingUp}
            iconClassName="text-orange-400"
            iconBgClassName="bg-orange-950"
          />
        </div>
      </div>

      {/* Block Execution Timeline */}
      <div className="w-full flex flex-col">
        <SectionHeader
          title="Block Execution Timeline"
          description="Visualize block and transaction execution times. If transation execution time is greater than block execution time then it indicates parallel execution."
        />

        {/* Main container - no rounded corners, borders carry across */}
        <div className="w-full flex flex-col border-x border-b border-zinc-800 bg-[#0E100F]">
          {/* Legend bar */}
          <div className="flex items-center px-6 sm:px-10 py-4 border-b border-zinc-800">
            <BlockTimeLegend />
          </div>

          {/* Blocks timeline area */}
          <div className="relative" {...hoverProps}>
            {/* Left fade gradient - only on sm and above */}
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-[18.75rem] z-10 pointer-events-none bg-gradient-to-r from-[#0E100F] to-transparent" />

            <BlockTimeTimeline
              blocks={finalizedBlocks}
              isFollowingChain={!isPaused}
              normalizedTimeScaleMs={normalizedTimeScaleMs}
            />
          </div>

          {/* Footer with hover pause info (desktop) and pause button (mobile) */}
          <div className="flex items-center gap-4 px-6 sm:px-10 py-2.5 border-t border-zinc-800">
            {/* Mobile pause/resume button */}
            <button
              type="button"
              onClick={() => setIsFollowingChain(!isFollowingChain)}
              className={cn(
                'md:hidden h-9 px-4 py-2 rounded-md font-mono text-sm text-white uppercase cursor-pointer transition-all duration-200',
                isFollowingChain
                  ? 'bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(23,23,23,0.2)_0%,rgba(163,163,163,0.16)_100%),#0A0A0A] shadow-[0_0_0_1px_rgba(0,0,0,0.8)]'
                  : 'bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(110,84,255,0)_0%,rgba(255,255,255,0.12)_100%),#6E54FF] shadow-[0_0_0_1px_rgba(79,71,235,0.9)]',
              )}
            >
              {isFollowingChain ? 'Pause' : 'Resume'}
            </button>

            {/* Desktop hover pause info */}
            <div className="hidden md:flex items-center gap-4">
              <Pointer className="w-5 h-5 text-[#52525E]" />
              <span className="text-base text-[#52525E]">
                Hovering on the Block stream pauses the update.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
