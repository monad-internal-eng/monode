'use client'

import { ClockArrowUp, Hourglass } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PauseResumeControl } from '@/components/common/pause-resume-control'
import { SectionHeader } from '@/components/ui/section-header'
import { StatCard } from '@/components/ui/stat-card'
import { useBlockExecutionTracker } from '@/hooks/use-block-execution-tracker'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { fromNsToMsPrecise } from '@/lib/block-metrics'
import { BlockTimeLegend } from './block-time-legend'
import { BlockTimeTimeline } from './block-time-timeline'

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
      <div className="w-full flex flex-col gap-2 sm:gap-4">
        <SectionHeader
          title="Execution Block Time"
          description="Time taken to execute each block, observed in real time."
        />
        <div className="flex flex-col md:flex-row gap-6 px-6 md:px-10 py-6">
          <StatCard
            label="Average Execution Time"
            value={avgBlockExecutionTime.toFixed(0)}
            unit="ms"
            description="Calculated from live execution data, not after finalization."
            icon={Hourglass}
          />
          <StatCard
            label="Max Execution Time"
            value={maxBlockExecutionTime.toFixed(0)}
            unit="ms"
            description="Longest execution time observed in the current session."
            icon={ClockArrowUp}
          />
        </div>
      </div>

      {/* Block Execution Timeline */}
      <div className="w-full flex flex-col">
        <SectionHeader
          title="Block Execution Timeline"
          description="Visualize block and transaction execution times. Taller transaction bars indicate parallel execution within block."
        />

        {/* Main container */}
        <div className="w-full pt-4 flex flex-col bg-[#0E100F]">
          {/* Legend bar - visible on all screens */}
          <div className="flex items-center px-4 sm:px-10 py-4">
            <BlockTimeLegend />
          </div>

          {/* Mobile: Pause/Resume button */}
          <div className="md:hidden p-4">
            <PauseResumeControl
              isFollowingChain={isFollowingChain}
              onToggle={() => setIsFollowingChain(!isFollowingChain)}
            />
          </div>

          {/* Blocks timeline area */}
          <div className="relative pt-4 px-4 sm:pt-6 sm:px-10" {...hoverProps}>
            {/* Left fade gradient - only on sm and above */}
            <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-75 z-10 pointer-events-none bg-linear-to-r from-[#0E100F] to-transparent" />

            <BlockTimeTimeline
              blocks={finalizedBlocks}
              isFollowingChain={!isPaused}
              normalizedTimeScaleMs={normalizedTimeScaleMs}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
