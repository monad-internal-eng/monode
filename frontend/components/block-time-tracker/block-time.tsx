import { motion } from 'framer-motion'
import { useMemo } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { EXPLORER_URL } from '@/constants/common'
import { calculateBarMetrics, fromNsToMsPrecise } from '@/lib/block-metrics'
import { formatBlockNumber } from '@/lib/ui'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'
import { ExternalLink } from '../ui/external-link'

interface BlockTimeProps {
  block: Block
  normalizedBlockExecutionTime: number
}

export const BlockTime = ({
  block,
  normalizedBlockExecutionTime,
}: BlockTimeProps) => {
  const {
    barHeightPercentage,
    fillPercentage,
    totalTransactionTime,
    isHighlyParallel,
  } = useMemo(
    () => calculateBarMetrics(block, normalizedBlockExecutionTime),
    [block, normalizedBlockExecutionTime],
  )

  const formattedBlockExecutionTime = fromNsToMsPrecise(
    block.executionTime ?? BigInt(0),
  ).toFixed(3)
  const formattedTotalTransactionTime = totalTransactionTime.toFixed(3)
  const numberOfTransactions = (block.transactions ?? []).length
  const parallelPercentage = isHighlyParallel
    ? (Number(formattedTotalTransactionTime) * 100) /
        Number(formattedBlockExecutionTime) -
      100
    : 0 // Compute actual percentage of difference tx time and execution between block
  const timeSaved =
    Number(formattedTotalTransactionTime) - Number(formattedBlockExecutionTime)

  return (
    <div className="flex flex-col items-center gap-4 min-w-20">
      {/* Block Bar Container */}
      <div className="relative w-full h-32 flex flex-col justify-end p-1.5">
        {/* Block Time Container (represents total block execution time) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${barHeightPercentage}%` }}
              transition={{ duration: 0.2 }}
              className={cn(
                'w-full rounded-t-md relative bg-zinc-600',
                'hover:shadow-lg transition-all duration-200 cursor-pointer',
              )}
              title={`Block ${block.number}: ${formattedBlockExecutionTime}ms execution time, ${formattedTotalTransactionTime}ms total tx time, ${numberOfTransactions} transactions`}
            >
              {/* Transaction Time Fill */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${fillPercentage}%` }}
                transition={{
                  duration: 0.4,
                }}
                className={cn(
                  'absolute bottom-0 left-0 w-full rounded-t-md bg-bg-card-darker',
                  isHighlyParallel && 'bg-[#7B66A2]',
                )}
                style={{
                  boxShadow: isHighlyParallel
                    ? '0 0 0.625rem var(--color-purple-glow), 0 0 1.25rem var(--color-purple-glow)'
                    : undefined,
                }}
                title={`${formattedTotalTransactionTime}ms total transaction execution time`}
              />
            </motion.div>
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
                      Block Execution Time
                    </p>
                    <p className="text-tooltip-text text-sm font-medium">
                      {formattedBlockExecutionTime}ms
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Transaction Execution Time
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
                      Time Saved
                    </p>
                    <p className="text-tooltip-text text-sm font-medium">
                      {timeSaved < 0 ? 0 : timeSaved.toFixed(3)}
                      ms
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between">
                    <p className="text-xs font-mono text-tooltip-text-secondary break-all">
                      Parallel Efficiency
                    </p>
                    <p className="text-tooltip-text-accent text-sm font-medium">
                      {parallelPercentage.toFixed(3)}%
                    </p>
                  </div>
                </div>
              </div>
              {isHighlyParallel && (
                <div className="flex flex-col gap-0">
                  <div className="border-t border-tooltip-separator my-2" />
                  <div className="flex flex-row items-center gap-2">
                    <div className="bg-tooltip-text-accent w-2 h-2 rounded-full" />
                    <p className="text-tooltip-text-accent font-medium">
                      High parallel execution detected
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Block Stats */}
      <div className="text-center space-y-1">
        <p className="text-zinc-600 font-medium text-base">
          {formattedBlockExecutionTime}ms
        </p>
        <p className="text-zinc-500 text-sm">{numberOfTransactions} tx</p>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-zinc-700" />

      {/* Block number Label */}
      <ExternalLink
        href={`${EXPLORER_URL}/block/${block.number}`}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-500"
      >
        {formatBlockNumber(block.number)}
      </ExternalLink>
    </div>
  )
}
