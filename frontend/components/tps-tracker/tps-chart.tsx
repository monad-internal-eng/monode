'use client'

import { Info } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  AnimatedNumber,
  AnimatedNumberGroup,
} from '@/components/ui/animated-number'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTps } from '@/hooks/use-tps'
import { formatRelativeTime, formatTimeHMS } from '@/lib/timestamp'
import { formatIntNumber } from '@/lib/ui'
import { cn } from '@/lib/utils'

const chartConfig = {
  tps: {
    label: 'TPS',
    color: 'var(--color-chart-1)',
  },
} satisfies ChartConfig

interface StatItemProps {
  label: string
  value: number
  info?: string
  colorClass?: string
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

export function TpsChart() {
  const { currentTps, peakTps, totalTransactions, history } = useTps()
  const hasData = history.length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-3 pb-4 xs:flex-row xs:items-start xs:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-medium text-zinc-400">Live TPS</span>
          <span className="text-sm text-zinc-600">Last 5 minutes</span>
        </div>
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
      </div>

      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        {hasData ? (
          <ChartContainer
            config={chartConfig}
            className="h-full min-w-2xl w-full"
          >
            <LineChart
              data={history}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="var(--chart-grid)"
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={80}
                tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
                tickFormatter={formatRelativeTime}
              />
              <YAxis
                domain={[0, 'auto']}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
                tickFormatter={formatIntNumber}
                width={48}
                allowDataOverflow={true}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'var(--chart-cursor)',
                  strokeDasharray: '4 4',
                }}
                content={
                  <ChartTooltipContent
                    className="bg-zinc-900 border-zinc-700"
                    labelClassName="text-zinc-400"
                    labelFormatter={(_, payload) => {
                      const ts = payload?.[0]?.payload?.timestamp
                      return ts ? formatTimeHMS(ts) : ''
                    }}
                    formatter={(value) => (
                      <span className="font-mono font-semibold tabular-nums text-white">
                        {formatIntNumber(Number(value))} TPS
                      </span>
                    )}
                    hideIndicator
                  />
                }
              />
              <Line
                type="linear"
                dataKey="tps"
                stroke="var(--color-tps)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="size-full flex items-center justify-center">
            <p className="text-sm text-zinc-600">Waiting for data...</p>
          </div>
        )}
      </div>
    </div>
  )
}
