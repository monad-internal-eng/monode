'use client'

import { useMemo } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TrendPoint {
  blockNumber: number
  contentionRatio: number
  parallelEfficiency: number
  contentionSlots: number
  txnCount: number
}

interface ContentionTrendChartProps {
  data: TrendPoint[]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
}) {
  if (!active || !payload || payload.length === 0) return null

  const point = payload[0]?.payload as TrendPoint | undefined
  if (!point) return null

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 shadow-xl">
      <p className="text-xs text-zinc-400 mb-2 font-mono">
        Block #{point.blockNumber.toLocaleString()}
      </p>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-sm text-zinc-300">Contention:</span>
          <span className="text-sm font-medium text-white">
            {point.contentionRatio.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-violet-500" />
          <span className="text-sm text-zinc-300">Parallel Eff:</span>
          <span className="text-sm font-medium text-white">
            {point.parallelEfficiency.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-zinc-500" />
          <span className="text-sm text-zinc-300">Contended Slots:</span>
          <span className="text-sm font-medium text-white">
            {point.contentionSlots}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-zinc-500" />
          <span className="text-sm text-zinc-300">Txns:</span>
          <span className="text-sm font-medium text-white">
            {point.txnCount}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Dual-axis chart showing contention ratio and parallel efficiency over time.
 */
export function ContentionTrendChart({ data }: ContentionTrendChartProps) {
  const chartData = useMemo(() => {
    // Show at most last 100 points for readability
    return data.slice(-100)
  }, [data])

  if (chartData.length < 2) {
    return (
      <div className="flex h-72 items-center justify-center text-zinc-500 text-sm">
        Collecting data...
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient
            id="contentionGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient
            id="efficiencyGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="blockNumber"
          tick={{ fontSize: 10, fill: '#71717a' }}
          tickLine={false}
          axisLine={{ stroke: '#27272a' }}
          tickFormatter={(v) => `#${(v as number).toLocaleString()}`}
          interval="preserveStartEnd"
          minTickGap={60}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 10, fill: '#71717a' }}
          tickLine={false}
          axisLine={{ stroke: '#27272a' }}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 'auto']}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 10, fill: '#71717a' }}
          tickLine={false}
          axisLine={{ stroke: '#27272a' }}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: '#52525b', strokeDasharray: '3 3' }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="contentionRatio"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#contentionGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#f59e0b' }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="parallelEfficiency"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#8b5cf6' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
