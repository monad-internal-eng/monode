'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { BLOCK_STATE_CONFIG } from '@/constants/block-state'
import { formatTimeDisplay } from '@/lib/timestamp'
import { cn } from '@/lib/utils'
import type { Block, BlockState } from '@/types/block'
import { formatBlockNumber } from '@/utils/ui'

interface BlockCardProps {
  block: Block
  isLatest?: boolean
  className?: string
}

const STATE_ORDER: BlockState[] = ['proposed', 'voted', 'finalized', 'verified']

/** Horizontal state tracker with circles, links, and state numbers */
function StateTracker({ currentState }: { currentState: BlockState }) {
  const currentIndex = STATE_ORDER.indexOf(currentState)

  return (
    <div className="flex items-center">
      {STATE_ORDER.map((state, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex
        const stateNumber = index + 1

        return (
          <div key={state} className="flex items-center">
            <motion.div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300',
                isDone && 'bg-zinc-800 border-zinc-700',
                isCurrent && 'bg-zinc-700 border-zinc-600',
                isPending && 'bg-zinc-800/50 border-zinc-800',
              )}
              animate={{ scale: isCurrent ? [1, 1.05, 1] : 1 }}
              transition={{
                duration: 1,
                repeat: isCurrent ? Infinity : 0,
                repeatDelay: 0.5,
              }}
            >
              {isDone ? (
                <Check className="w-2.5 h-2.5 text-zinc-500" />
              ) : (
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isCurrent && 'text-white',
                    isPending && 'text-zinc-600',
                  )}
                >
                  {stateNumber}
                </span>
              )}
            </motion.div>

            {index < STATE_ORDER.length - 1 && (
              <div
                className={cn(
                  'w-2 h-0.5 mx-1 transition-colors duration-300',
                  index < currentIndex ? 'bg-zinc-700' : 'bg-zinc-800/30',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Block card with state tracker and timestamp */
export function BlockCard({
  block,
  isLatest = false,
  className,
}: BlockCardProps) {
  const config = BLOCK_STATE_CONFIG[block.state]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.2, ease: 'easeIn' },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col gap-y-4 text-left rounded-xl select-none bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 w-48 h-52 sm:w-56 sm:h-54 p-4 transition-all duration-300',
        className,
      )}
    >
      {isLatest && (
        <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-400 rounded-full text-sm font-medium text-purple-400 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500" />
          </span>
          LIVE
        </div>
      )}

      <Link
        href={`https://monadvision.com/block/${block.number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xl sm:text-2xl font-medium text-white hover:underline underline-offset-2 cursor-pointer"
        title={`View block #${block.number} on MonadVision`}
      >
        {formatBlockNumber(block.number)}
      </Link>

      <StateTracker currentState={block.state} />

      <div className="flex flex-col gap-2.5">
        <span
          className="px-3 py-0.5 rounded-full text-sm font-medium border backdrop-blur-sm w-fit"
          style={{
            color: config.color,
            borderColor: config.color,
            backgroundColor: `${config.color}25`,
          }}
        >
          {config.label}
        </span>
        {config.description && (
          <span className="text-xs text-zinc-500">{config.description}</span>
        )}
      </div>

      {block.timestamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto"
        >
          <span className="text-sm sm:text-base text-zinc-500">
            {formatTimeDisplay(block.timestamp)}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
