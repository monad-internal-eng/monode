'use client'

import { Clock, Info, Pause, Play, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
import { StatCard } from '@/components/ui/stat-card'
import { useBlockTracker } from '@/hooks/use-block-tracker'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { fromNsToMsPrecise } from '@/lib/block-metrics'
import { cn } from '@/lib/utils'
import BlockTimeLegend from './block-time-legend'
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
export default function BlockTimeExecutionTracker() {
  const {
    finalizedBlocks,
    maxBlockExecutionTime,
    normalizedBlockExecutionTime,
  } = useBlockTracker(5000)
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
            iconClassName="text-[#25C373]"
            iconBgClassName="bg-[#1D2727]"
          />
          <StatCard
            label="Max Execution Time"
            value={maxBlockExecutionTime.toFixed(0)}
            unit="ms"
            description="Peak execution time observed in the current session."
            icon={TrendingUp}
            iconClassName="text-[#F39E26]"
            iconBgClassName="bg-[#2F2423]"
          />
        </div>
      </div>

      {/* Block Execution Timeline */}
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <SectionHeader
          title="Block Execution Timeline"
          description="Each bar represents a block. Height shows execution time."
        >
          <button
            type="button"
            onClick={() => setIsFollowingChain(!isFollowingChain)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200 w-fit',
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
        </SectionHeader>
        {/* Info copy - only for mobile */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 md:hidden">
          <Info className="w-4 h-4" />
          <span>Tap Pause to freeze and scroll through blocks</span>
        </div>

        <div className="w-full flex flex-col gap-5 dark-component-colors rounded-xl border p-4 sm:p-6 lg:p-8">
          {/* Scrollable Blocks Container */}
          <button type="button" className="flex-1" {...hoverProps}>
            <BlockTimeTimeline
              blocks={finalizedBlocks}
              isFollowingChain={!isPaused}
              normalizedBlockExecutionTime={normalizedBlockExecutionTime}
            />
          </button>

          {/* Seperator */}
          <div className="w-full h-0.5 bg-[#2C2735]" />

          {/* Legend */}
          <BlockTimeLegend />
        </div>

        {/* Info copy - only for desktop */}
        <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500">
          <Info className="w-4 h-4" />
          <span>Hover to pause</span>
        </div>
      </div>
    </div>
  )
}
