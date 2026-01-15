'use client'

import { Info, Timer, X } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SlowMotionControlProps {
  isActive: boolean
  remainingSeconds: number
  onStart: () => void
  onStop: () => void
}

function SlowModeInfoTooltip({ variant }: { variant: 'active' | 'inactive' }) {
  const iconClassName =
    variant === 'active'
      ? 'w-3.5 h-3.5 text-purple-400/70 hover:text-purple-300 transition-colors'
      : 'w-3.5 h-3.5 text-zinc-500/70 hover:text-purple-400 transition-colors'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className={iconClassName} />
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className="max-w-52.5">
        <p>
          Slow mode doesn't affect the chain. It only slows UI updates, so the
          display may lag behind the chain tip.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

export function SlowMotionControl({
  isActive,
  remainingSeconds,
  onStart,
  onStop,
}: SlowMotionControlProps) {
  if (isActive) {
    return (
      <div className="h-10.5 flex items-center gap-1.5 px-3 py-2.5 rounded-lg border bg-purple-500/20 border-purple-400 text-purple-300 text-sm font-medium">
        <div className="flex items-center gap-1">
          <Timer className="w-4 h-4" />
          <span>Slow Mode</span>
          <span className="tabular-nums">({remainingSeconds}s)</span>
          <SlowModeInfoTooltip variant="active" />
        </div>
        <button
          type="button"
          onClick={onStop}
          className="m-0 p-1 rounded-md text-purple-300 hover:text-red-400 hover:border-red-400/50 hover:bg-red-500/10 cursor-pointer transition-all duration-200"
          title="Stop slow mode"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 text-sm font-medium whitespace-nowrap cursor-pointer transition-all duration-200"
    >
      <Timer className="w-4 h-4" />
      <span>Slow Mode (30s)</span>
      <SlowModeInfoTooltip variant="inactive" />
    </button>
  )
}
