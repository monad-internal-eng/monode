import { cn } from '@/lib/utils'

interface LiveIndicatorProps {
  isConnected: boolean
  className?: string
}

/**
 * Animated live connection indicator with pulsing dot
 */
export function LiveIndicator({ isConnected, className }: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium',
        isConnected
          ? 'bg-green-500/10 text-green-400'
          : 'bg-zinc-500/10 text-zinc-400',
        className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-1.5 w-1.5',
            isConnected ? 'bg-green-500' : 'bg-zinc-500',
          )}
        />
      </span>
      Live
    </span>
  )
}
