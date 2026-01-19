import { cn } from '@/lib/utils'

interface LiveDotProps {
  className?: string
}

export function LiveDot({ className }: LiveDotProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center w-6 h-6 animate-live-dot-pulse',
        className,
      )}
    >
      {/* Outer ring */}
      <div className="absolute w-6 h-6 rounded-full bg-[var(--color-tracker-live-dot-ring-outer)]" />

      {/* Middle ring */}
      <div className="absolute w-4 h-4 rounded-full bg-[var(--color-tracker-live-dot-ring-middle)]" />

      {/* Inner ring */}
      <div className="absolute w-3 h-3 rounded-full bg-[var(--color-tracker-live-dot-ring-inner)]" />

      {/* Core dot */}
      <div className="absolute w-2 h-2 rounded-full bg-[var(--color-tracker-live-dot-core)]" />
    </div>
  )
}
