import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { calculateBarMetrics, fromNsToMsPrecise } from '@/lib/block-metrics'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'

interface BlockTimeProps {
  block: Block
  maxBlockExecutionTime: number
}

const BlockTime = ({ block, maxBlockExecutionTime }: BlockTimeProps) => {
  const {
    barHeightPercentage,
    fillPercentage,
    totalTransactionTime,
    parallelizationRatio,
    isHighlyParallel,
  } = useMemo(
    () => calculateBarMetrics(block, maxBlockExecutionTime),
    [block, maxBlockExecutionTime],
  )

  const formattedBlockExecutionTime = fromNsToMsPrecise(
    block.executionTime ?? BigInt(0),
  ).toFixed(4)
  const formattedTotalTransactionTime = totalTransactionTime.toFixed(4)
  const numberOfTransactions = (block.transactions ?? []).length

  return (
    <motion.div
      key={block.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="flex flex-col items-center gap-2 min-w-20"
    >
      {/* Block number Label */}
      <div className="text-xs font-medium text-[#8888a0]">#{block.number}</div>

      {/* Block Bar Container */}
      <div className="relative w-full h-32 flex flex-col justify-end p-1">
        {/* Block Time Container (represents total block execution time) */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${barHeightPercentage}%` }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className={cn(
            'w-full rounded-t-md border-2 border-gray-400 relative',
            'bg-linear-to-t from-gray-300 to-gray-200',
            'hover:shadow-lg transition-all duration-200 cursor-pointer',
          )}
          title={`Block ${block.number}: ${formattedBlockExecutionTime}ms execution time, ${formattedTotalTransactionTime}ms total tx time, ${numberOfTransactions} transactions`}
        >
          {/* Parallelization Badge */}
          {isHighlyParallel && (
            <div className="absolute -top-4 right-1 text-[8px] bg-purple-600 text-white px-1 rounded z-10">
              {parallelizationRatio.toFixed(1)}x
            </div>
          )}
          {/* Transaction Time Fill */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${fillPercentage}%` }}
            transition={{
              duration: 1.2,
              delay: 0.05,
            }}
            className={cn(
              'absolute bottom-0 left-0 w-full rounded-t-md bg-linear-to-t from-purple-500 to-purple-300',
              isHighlyParallel && 'animate-pulse',
            )}
            style={{
              boxShadow: isHighlyParallel
                ? '0 0 15px #ffd700, 0 0 30px #ffd700, 0 0 20px #a855f7, 0 0 40px #a855f7, 0 0 60px #a855f7, inset 0 0 20px rgba(255, 215, 0, 0.2), inset 0 0 10px rgba(168, 85, 247, 0.3)'
                : undefined,
            }}
            title={`${formattedTotalTransactionTime}ms total transaction execution time`}
          />
        </motion.div>
      </div>

      {/* Block Stats */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <div className="font-medium">{formattedBlockExecutionTime} ms</div>
        <div className="text-xs text-gray-400">
          {formattedTotalTransactionTime} ms
        </div>
        <div>{numberOfTransactions}</div>
      </div>
    </motion.div>
  )
}

export default BlockTime
