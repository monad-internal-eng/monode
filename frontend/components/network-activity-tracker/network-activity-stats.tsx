import { Info } from 'lucide-react'
import {
  AnimatedNumber,
  AnimatedNumberGroup,
} from '@/components/ui/animated-number'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface StatItemProps {
  label: string
  value: number
  info?: string
  colorClass?: string
}

interface NetworkActivityStatsProps {
  currentTps: number
  peakTps: number
  totalTransactions: number
}

function StatItem({
  label,
  value,
  info,
  colorClass = 'text-white',
}: StatItemProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          {label}
        </span>
        {info && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3 text-zinc-600 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top">{info}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <AnimatedNumber
        value={value}
        className={cn(
          'text-2xl sm:text-3xl font-bold leading-none',
          colorClass,
        )}
      />
    </div>
  )
}

export const NetworkActivityStats = ({
  currentTps,
  peakTps,
  totalTransactions,
}: NetworkActivityStatsProps) => {
  return (
    <AnimatedNumberGroup>
      <div className="flex justify-between gap-3 sm:gap-7 xs:justify-end">
        <StatItem
          label="Live TPS"
          value={currentTps}
          colorClass="text-[var(--color-chart-1)]"
        />
        <StatItem
          label="Peak TPS"
          value={peakTps}
          info="Highest TPS since page load"
          colorClass="text-amber-400"
        />
        <StatItem
          label="Total Txns"
          value={totalTransactions}
          info="Total transactions since page load"
          colorClass="text-blue-400"
        />
      </div>
    </AnimatedNumberGroup>
  )
}
