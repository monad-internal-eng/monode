import { motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EXPLORER_URL } from '@/constants/common'
import { PARALLEL_EXECUTION_RATIO_THRESHOLD } from '@/hooks/use-block-execution-tracker'
import { calculateBarMetrics } from '@/lib/block-metrics'
import { formatBlockNumber } from '@/lib/ui'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'

interface BlockTimeProps {
  block: Block
  normalizedTimeScaleMs: number
}

const BAR_CONTAINER_HEIGHT = 200

export const BlockTime = ({ block, normalizedTimeScaleMs }: BlockTimeProps) => {
  const {
    blockHeightPct,
    txHeightPct,
    blockMs,
    totalTransactionTime,
    parallelizationRatio,
    isParallelExecution,
    timeSavedMs,
    parallelEfficiencyPct,
  } = useMemo(
    () =>
      calculateBarMetrics(
        block,
        normalizedTimeScaleMs,
        PARALLEL_EXECUTION_RATIO_THRESHOLD,
      ),
    [block, normalizedTimeScaleMs],
  )

  const formattedBlockExecutionTime = blockMs.toFixed(2)
  const formattedTotalTransactionTime = totalTransactionTime.toFixed(2)
  const numberOfTransactions = (block.transactions ?? []).length
  const parallelRatioLabel = `${parallelizationRatio.toFixed(2)}×`
  const timeSaved = timeSavedMs

  return (
    <div className="flex flex-col items-center w-full min-w-[8.75rem] sm:min-w-[13.75rem] gap-6 px-6 sm:px-10 py-6">
      {/* Bar chart area */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="w-full flex justify-center items-end border-b border-zinc-800 cursor-pointer"
            style={{ height: `${BAR_CONTAINER_HEIGHT / 16}rem` }}
          >
            {/* Block execution bar (cyan) - overlaps right bar */}
            <div className="w-20 flex flex-col items-start gap-2.5 relative z-10 -mr-2">
              <span className="text-base text-white tabular-nums text-left w-full">
                {formattedBlockExecutionTime}ms
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: `${(blockHeightPct / 100) * (BAR_CONTAINER_HEIGHT - 40)}px`,
                }}
                transition={{ duration: 0.3 }}
                className="w-full rounded-t-lg bg-[#38BDF8] shadow-[0.25rem_0_1.5rem_rgba(0,0,0,0.32)]"
              />
            </div>

            {/* Tx execution bar (purple) */}
            <div className="w-20 flex flex-col items-end gap-2.5">
              <span className="text-base text-white tabular-nums text-right w-full">
                {formattedTotalTransactionTime}ms
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: `${(txHeightPct / 100) * (BAR_CONTAINER_HEIGHT - 40)}px`,
                }}
                transition={{ duration: 0.3 }}
                className="w-full rounded-t-lg bg-[#6E54FF]"
              />
            </div>
          </div>
        </TooltipTrigger>

        {/* Tooltip content */}
        <TooltipContent
          sideOffset={8}
          className="bg-[#18181B] border border-[#E5E5E5] text-white rounded-2xl p-0 shadow-[0_1rem_2.5rem_rgba(0,0,0,0.32)] overflow-hidden min-w-87"
        >
          <div className="flex flex-col">
            {/* Tooltip header */}
            <div className="flex flex-col gap-4 px-6 py-4">
              <span className="text-base text-white">
                Block {formatBlockNumber(block.number)}
              </span>

              {/* Stats rows */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[#A8A3B8] uppercase">
                    Block execution time:
                  </span>
                  <span className="text-sm text-white">
                    {formattedBlockExecutionTime}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[#A8A3B8] uppercase">
                    Transaction execution time:
                  </span>
                  <span className="text-sm text-white">
                    {formattedTotalTransactionTime}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[#A8A3B8] uppercase">
                    Transactions:
                  </span>
                  <span className="text-sm text-white">
                    {numberOfTransactions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[#A8A3B8] uppercase">
                    Time Saved
                  </span>
                  <span className="text-sm text-white">
                    {timeSaved.toFixed(2)}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-[#A8A3B8] uppercase">
                    Parallel Efficiency:
                  </span>
                  <span className="text-sm text-white">
                    {parallelEfficiencyPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tooltip footer */}
            <div className="flex justify-between items-center px-6 py-3 border-t border-[#27272A]">
              <span className="text-base text-[#A8A3B8]">
                {numberOfTransactions} tx{numberOfTransactions !== 1 ? 's' : ''}
              </span>
              <a
                href={`${EXPLORER_URL}/block/${block.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-4 py-2 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(23,23,23,0.2)_0%,rgba(163,163,163,0.16)_100%),#0A0A0A] shadow-[0_0_0_1px_rgba(0,0,0,0.8)] rounded-md flex items-center justify-center font-mono text-sm text-white uppercase hover:opacity-80 transition-opacity"
              >
                View on explorer
              </a>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Block info below bars */}
      <div className="flex flex-col items-center gap-2.5">
        <a
          href={`${EXPLORER_URL}/block/${block.number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base text-white tabular-nums hover:underline"
        >
          {formatBlockNumber(block.number)}
        </a>
        <span
          className={cn(
            'px-4 py-1 rounded-full border text-sm text-white tabular-nums',
            isParallelExecution
              ? 'bg-[#6E54FF]/20 border-[#6E54FF]'
              : 'bg-[#18181B] border-zinc-700',
          )}
        >
          Parallel {parallelRatioLabel}
        </span>
      </div>
    </div>
  )
}
