import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  iconClassName = 'text-tracker-active',
  iconBgClassName = 'bg-tracker-active/10',
}: StatCardProps) {
  return (
    <div className="dark-component-colors rounded-xl border p-5 w-full flex flex-col gap-4 items-start">
      <div className="flex flex-row justify-between w-full">
        <div className="flex flex-col items-start gap-1">
          <p className="text-sm sm:text-base text-[#8888a0]">{label}</p>
          <p className="text-lg sm:text-xl font-medium text-[#8888a0]">
            <span className="text-3xl sm:text-5xl text-white font-bold tabular-nums">
              {value}
            </span>
            {unit && <> {unit}</>}
          </p>
        </div>
        <div className={cn('p-2 rounded-lg h-fit w-fit', iconBgClassName)}>
          <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', iconClassName)} />
        </div>
      </div>
      {description && (
        <p className="text-sm sm:text-base text-[#8888a0]">{description}</p>
      )}
    </div>
  )
}
