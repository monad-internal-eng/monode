'use client'

import { cn } from '@/lib/utils'

interface LiveBadgeProps {
  isConnected: boolean
}

/**
 * Reusable live badge component with animated ping effect.
 * Used to indicate real-time connection status.
 */
export function LiveBadge({ isConnected }: LiveBadgeProps) {
  return (
    <span
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
        isConnected
          ? 'bg-tracker-active/10 text-tracker-active'
          : 'bg-zinc-500/10 text-zinc-400',
      )}
    >
      <span className="relative flex size-1.5">
        {isConnected && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-tracker-active opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex size-1.5 rounded-full',
            isConnected ? 'bg-tracker-active' : 'bg-zinc-500',
          )}
        />
      </span>
      Live
    </span>
  )
}
