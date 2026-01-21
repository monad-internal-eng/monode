import { cn } from '@/lib/utils'

interface UnknownTokenIconProps {
  symbol?: string
  size?: number
  className?: string
}

export function UnknownTokenIcon({
  symbol,
  size = 16,
  className,
}: UnknownTokenIconProps) {
  const displayText = symbol ? symbol.slice(0, 2).toUpperCase() : '?'
  const textSize =
    size <= 16 ? 'text-[0.5625rem]' : size <= 24 ? 'text-xs' : 'text-sm'

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium select-none shrink-0',
        textSize,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {displayText}
    </div>
  )
}
