import { cn } from '@/lib/utils'

interface CornerContainerProps {
  children: React.ReactNode
  className?: string
  cornerClassName?: string
}

/**
 * A container component with white corner accents
 */
export function CornerContainer({
  children,
  className,
  cornerClassName = 'border-white',
}: CornerContainerProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Corner accents */}
      <div
        className={cn(
          'absolute -top-px -left-px w-4 h-4 border-t border-l',
          cornerClassName,
        )}
      />
      <div
        className={cn(
          'absolute -top-px -right-px w-4 h-4 border-t border-r',
          cornerClassName,
        )}
      />
      <div
        className={cn(
          'absolute -bottom-px -left-px w-4 h-4 border-b border-l',
          cornerClassName,
        )}
      />
      <div
        className={cn(
          'absolute -bottom-px -right-px w-4 h-4 border-b border-r',
          cornerClassName,
        )}
      />

      {children}
    </div>
  )
}
