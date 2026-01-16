import { motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EXPLORER_URL } from '@/constants/common'
import { PARALLEL_EXECUTION_RATIO_THRESHOLD } from '@/hooks/use-block-tracker'
import { calculateBarMetrics } from '@/lib/block-metrics'
import { formatBlockNumber } from '@/lib/ui'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'
import { ExternalLink } from '../ui/external-link'

interface BlockTimeProps {
  block: Block
  normalizedTimeScaleMs: number
}

export const BlockTime = ({ block, normalizedTimeScaleMs }: BlockTimeProps) => {
  const {
    blockHeightPct,
    txHeightPct,
    blockMs,
    totalTransactionTime,
    isParallelExecution,
    parallelizationRatio,
    timeSavedMs,
  } = useMemo(
    () =>
      calculateBarMetrics(
        block,
        normalizedTimeScaleMs,
        PARALLEL_EXECUTION_RATIO_THRESHOLD,
      ),
    [block, normalizedTimeScaleMs],
  )

  const formattedBlockExecutionTime = blockMs.toFixed(3)
  const formattedTotalTransactionTime = totalTransactionTime.toFixed(3)
  const numberOfTransactions = (block.transactions ?? []).length
  const parallelRatioLabel = `${parallelizationRatio.toFixed(2)}×`
  const timeSaved = timeSavedMs

  return (
    <div className="flex flex-col items-center gap-4 min-w-20 w-full">
      {/* Block Bar Container */}
      <div className="relative w-full h-32 flex flex-col justify-end">
        {/* Dual bar comparison (Block exec time vs total tx exec time) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'w-full h-full flex items-end gap-2 px-3.5 py-1.5 rounded-lg',
                'hover:bg-white/5 transition-all duration-200 cursor-pointer',
              )}
              title={`Block ${block.number}: ${formattedBlockExecutionTime}ms block execution time, ${formattedTotalTransactionTime}ms total tx execution time`}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${blockHeightPct}%` }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex-1 rounded-t-md bg-tracker-active/25 ring-1 ring-tracker-active/25',
                )}
                title={`${formattedBlockExecutionTime}ms block execution time`}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${txHeightPct}%` }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex-1 rounded-t-md bg-tracker-active ring-1 ring-tracker-active/25',
                  isParallelExecution && 'ring-1 ring-tracker-active/60',
                )}
                title={`${formattedTotalTransactionTime}ms total tx execution time`}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent
            sideOffset={5}
            className="bg-tooltip-bg border border-tooltip-border text-tooltip-text rounded-lg p-2 sm:p-3 shadow-xl text-xs sm:text-sm w-87.5"
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-2">
                <ExternalLink
                  href={`${EXPLORER_URL}/block/${block.number}`}
                  className="text-sm text-tooltip-text uppercase tracking-wider hover:underline"
                >
                  Block {formatBlockNumber(block.number)}
                </ExternalLink>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Block execution time
                    </p>
                    <p className="text-tooltip-text text-sm font-medium">
                      {formattedBlockExecutionTime}ms
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Total tx execution time
                    </p>
                    <p className="text-tooltip-text text-sm font-medium">
                      {formattedTotalTransactionTime}ms
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Transactions
                    </p>
                    <p className="text-tooltip-text text-sm font-medium">
                      {numberOfTransactions}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Time saved
                    </p>
                    <p className="text-tooltip-text text-sm font-medium">
                      {timeSaved.toFixed(3)}ms
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Parallel factor
                    </p>
                    <p
                      className={cn(
                        'text-sm font-medium',
                        isParallelExecution
                          ? 'text-tooltip-text-accent'
                          : 'text-tooltip-text',
                      )}
                    >
                      {parallelRatioLabel}
                    </p>
                  </div>
                </div>
              </div>
              {isParallelExecution && (
                <div className="flex flex-col gap-0">
                  <div className="border-t border-tooltip-separator my-2" />
                  <div className="flex flex-row items-center gap-2">
                    <div className="bg-tooltip-text-accent w-2 h-2 rounded-full" />
                    <p className="text-tooltip-text-accent font-medium">
                      Parallel execution: total tx execution time &gt; block
                      execution time
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Block Stats */}
      <div className="w-full px-3.5 flex flex-col gap-2 tabular-nums">
        <div className="w-full grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center leading-tight text-center">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
              Block
            </span>
            <span className="text-base font-semibold text-zinc-100">
              {blockMs.toFixed(2)}ms
            </span>
          </div>
          <div className="flex flex-col items-center leading-tight text-center">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wide">
              Tx exec
            </span>
            <span className="text-base font-semibold text-tracker-active">
              {totalTransactionTime.toFixed(2)}ms
            </span>
          </div>
        </div>

        <div className="w-full h-7 mt-1 flex items-center justify-center">
          <span
            className={cn(
              'inline-flex max-w-full items-center rounded-md border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap truncate',
              isParallelExecution
                ? 'border-tracker-active/60 bg-tracker-active/20 text-white shadow-[0_0_0_0.5px_rgba(131,110,249,0.35)]'
                : 'border-zinc-700 bg-zinc-800/40 text-zinc-300',
            )}
            title="Parallel factor (Tx exec / Block exec)"
          >
            {isParallelExecution
              ? `Parallel ${parallelRatioLabel}`
              : `Factor ${parallelRatioLabel}`}
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-zinc-700" />

      {/* Block number Label */}
      <ExternalLink
        href={`${EXPLORER_URL}/block/${block.number}`}
        className="text-sm font-medium text-zinc-600 hover:text-white"
      >
        {formatBlockNumber(block.number)}
      </ExternalLink>
    </div>
  )
}
