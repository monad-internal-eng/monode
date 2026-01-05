import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { calculateBarMetrics, fromNsToMsPrecise } from '@/lib/block-metrics'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'
import { formatBlockNumber } from '@/utils/ui'

interface BlockTimeProps {
  block: Block
  maxBlockExecutionTime: number
}

const BlockTime = ({ block, maxBlockExecutionTime }: BlockTimeProps) => {
  const {
    barHeightPercentage,
    fillPercentage,
    totalTransactionTime,
    isHighlyParallel,
  } = useMemo(
    () => calculateBarMetrics(block, maxBlockExecutionTime),
    [block, maxBlockExecutionTime],
  )

  const formattedBlockExecutionTime = fromNsToMsPrecise(
    block.executionTime ?? BigInt(0),
  ).toFixed(3)
  const formattedTotalTransactionTime = totalTransactionTime.toFixed(3)
  const numberOfTransactions = (block.transactions ?? []).length

  return (
    <motion.div
      key={block.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="flex flex-col items-center gap-4 min-w-20"
    >
      {/* Block Bar Container */}
      <div className="relative w-full h-32 flex flex-col justify-end p-1.5">
        {/* Block Time Container (represents total block execution time) */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${barHeightPercentage}%` }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className={cn(
            'w-full rounded-t-md relative bg-[#454150]',
            'hover:shadow-lg transition-all duration-200 cursor-pointer',
          )}
          title={`Block ${block.number}: ${formattedBlockExecutionTime}ms execution time, ${formattedTotalTransactionTime}ms total tx time, ${numberOfTransactions} transactions`}
        >
          {/* Transaction Time Fill */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${fillPercentage}%` }}
            transition={{
              duration: 1.2,
              delay: 0.05,
            }}
            className={cn(
              'absolute bottom-0 left-0 w-full rounded-t-md bg-[#696274]',
              isHighlyParallel && 'bg-[#7B66A2]',
            )}
            style={{
              boxShadow: isHighlyParallel
                ? '0 0 10px #7B66A2, 0 0 20px #7B66A2'
                : undefined,
            }}
            title={`${formattedTotalTransactionTime}ms total transaction execution time`}
          />
        </motion.div>
      </div>

      {/* Block Stats */}
      <div className="text-center space-y-1">
        <p className="text-[#454150] font-medium text-base">
          {formattedBlockExecutionTime}ms
        </p>
        <p className="text-[#4A4554] text-sm">{numberOfTransactions} tx</p>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-[#2C2735]" />

      {/* Block number Label */}
      <div className="text-sm font-medium text-[#454150]">
        {formatBlockNumber(block.number)}
      </div>
    </motion.div>
  )
}

export default BlockTime
