'use client'

import { Pointer } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'
import { SectionHeader } from '@/components/ui/section-header'
import { Switch } from '@/components/ui/switch'
import { BLOCK_STATE_LEGEND } from '@/constants/block-state'
import { useBlockStateTracker } from '@/hooks/use-block-state-tracker'
import { useMouseHover } from '@/hooks/use-mouse-hover'
import { cn } from '@/lib/utils'
import { Blockchain } from './blockchain'

/**
 * Visualizes the blockchain with blocks progressing through states:
 * Proposed → Executing → Finalized → Verified
 */
export function BlockStateTracker() {
  const {
    blocks,
    isSlowMotion,
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

      {/* Main container - no rounded corners */}
      <div className="w-full flex flex-col border-x border-b border-zinc-800 bg-[#0E100F]">
        {/* Legend bar with slow mode toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 sm:px-10 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-4 sm:gap-6">
            {BLOCK_STATE_LEGEND.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-base text-white">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-white">Slow mode</span>
            <Switch
              checked={isSlowMotion}
              onCheckedChange={(checked) =>
                checked ? startSlowMotion() : stopSlowMotion()
              }
            />
          </div>
        </div>

        {/* Blockchain visualization */}
        <div className="relative" {...hoverProps}>
          {/* Left fade gradient - only on sm and above */}
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-[18.75rem] z-10 pointer-events-none bg-gradient-to-r from-[#0E100F] to-transparent" />
          <Blockchain blocks={blocks} isFollowingChain={!isPaused} />
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
  )
}
