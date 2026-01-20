'use client'

import { Info } from 'lucide-react'
import { PauseResumeControl } from '@/components/common/pause-resume-control'
import { SectionHeader } from '@/components/ui/section-header'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BLOCK_STATE_LEGEND } from '@/constants/block-state'
import { useBlockStateTracker } from '@/hooks/use-block-state-tracker'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { ExternalLink } from '../ui/external-link'
import { Blockchain } from './blockchain'

/**
 * Visualizes the blockchain with blocks progressing through states:
 * Proposed → Voted → Finalized → Verified
 */
export function BlockStateTracker() {
  const {
    blocks,
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
    isFollowingChain,
    setIsFollowingChain,
  } = useBlockStateTracker()

  const { isHovering, hoverProps } = useMouseHover()
  const isPaused = !isFollowingChain || isHovering

  return (
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Block Confirmation Progress"
        description={
          <>
            Shows how Monad blocks progress toward final confirmation.{' '}
            <ExternalLink
              href="https://docs.monad.xyz/monad-arch/consensus/block-states"
              className="text-text-secondary hover:text-white transition-colors underline"
            >
              Learn more
            </ExternalLink>
            .
          </>
        }
      />

      {/* Main container */}
      <div className="w-full flex flex-col bg-[#0E100F]">
        {/* Legend + Slow mode row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 px-4 sm:px-10 py-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {BLOCK_STATE_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm sm:text-base text-white">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Slow mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base text-white">
              {isSlowMotion ? `Slow mode (${remainingSeconds}s)` : 'Slow mode'}
            </span>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button type="button" className="cursor-help">
                  <Info className="w-4 h-4 text-zinc-500 hover:text-zinc-400 transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={6}
                className="bg-tooltip-bg border border-tooltip-border text-tooltip-text rounded-lg p-2 shadow-xl text-xs leading-snug max-w-52"
              >
                <p>
                  Slow mode doesn&apos;t affect the chain. It only slows UI
                  updates, so the display may lag behind the chain tip.
                </p>
              </TooltipContent>
            </Tooltip>
            <Switch
              checked={isSlowMotion}
              onCheckedChange={(checked) =>
                checked ? startSlowMotion() : stopSlowMotion()
              }
            />
          </div>
        </div>

        {/* Mobile: Pause/Resume button */}
        <div className="md:hidden px-4 pb-4">
          <PauseResumeControl
            isFollowingChain={isFollowingChain}
            onToggle={() => setIsFollowingChain(!isFollowingChain)}
          />
        </div>

        {/* Blockchain visualization */}
        <div className="relative pt-4 px-4 sm:pt-6 sm:px-10" {...hoverProps}>
          {/* Left fade gradient - only on sm and above */}
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-75 z-10 pointer-events-none bg-linear-to-r from-[#0E100F] to-transparent" />
          <Blockchain blocks={blocks} isFollowingChain={!isPaused} />
        </div>
      </div>
    </div>
  )
}
