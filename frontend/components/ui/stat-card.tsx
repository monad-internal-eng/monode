import type { LucideIcon } from 'lucide-react'
import { CornerDecorationsContainer } from './corner-decorations-container'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  description?: string
  icon: LucideIcon
  iconClassName?: string
  iconBgClassName?: string
}

/**
 * Reusable stat card component for displaying metrics with an icon
 */
export function StatCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <CornerDecorationsContainer className="bg-bg-primary border border-border-primary p-6 w-full flex flex-col gap-4 items-start">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-col items-start gap-2 md:gap-4 w-full">
          <div className="flex flex-row items-center justify-between w-full">
            <p className="text-sm sm:text-base text-tooltip-text-secondary leading-6">
              {label}
            </p>
            <div className="bg-bg-primary border border-border-primary p-2 rounded-lg h-fit w-fit">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <p className="text-lg sm:text-4xl font-medium text-white leading-10 flex items-baseline gap-2">
            <span className="text-4xl sm:text-6xl text-white font-bold tabular-nums font-britti-sans">
              {value}
            </span>
            {unit && <> {unit}</>}
          </p>
        </div>
      </div>
      {description && (
        <p className="text-sm sm:text-base text-text-muted leading-6">
          {description}
        </p>
      )}
    </CornerDecorationsContainer>
  )
}
