'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BLOCK_STATE_COLORS, BLOCK_STATE_CONFIG } from '@/constants/block-state'
import { formatTimeDisplay } from '@/lib/timestamp'
import { cn } from '@/lib/utils'
import type { Block, BlockState } from '@/types/block'

interface BlockCardProps {
  block: Block
  isLatest?: boolean
  className?: string
}

const STATE_ORDER: BlockState[] = ['proposed', 'voted', 'finalized', 'verified']

/**
 * Progress dots showing block state progression
 */
function ProgressDots({ currentState }: { currentState: BlockState }) {
  const currentIndex = STATE_ORDER.indexOf(currentState)

  return (
    <div className="flex items-center gap-1">
      {STATE_ORDER.map((state, index) => {
        const isActive = index <= currentIndex
        const dotColor = isActive ? BLOCK_STATE_COLORS[state].dot : undefined

        return (
          <div key={state} className="flex items-center">
            <motion.div
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-300',
                !isActive && 'bg-zinc-700',
              )}
              style={isActive ? { backgroundColor: dotColor } : undefined}
              animate={isActive ? { scale: [1, 1.2, 1] } : undefined}
              transition={{ duration: 0.3 }}
            />
            {index < STATE_ORDER.length - 1 && (
              <div
                className={cn(
                  'w-2 h-0.5 mx-0.5 rounded-full transition-colors duration-300',
                  index < currentIndex ? 'bg-zinc-600' : 'bg-zinc-800',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Individual block card in the blockchain visualization.
 * Dark card design with progress dots, status badge, and timestamp.
 */
export const BlockCard = ({
  block,
  isLatest = false,
  className,
}: BlockCardProps) => {
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
        'relative flex flex-col items-center rounded-xl',
        'select-none cursor-default',
        'bg-zinc-900/80 border border-zinc-800',
        'w-[120px] h-[150px] sm:w-[140px] sm:h-[170px]',
        'p-3 sm:p-4',
        'transition-all duration-300',
        'hover:border-zinc-700',
        className,
      )}
    >
      {/* LIVE indicator for latest block */}
      {isLatest && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          LIVE
        </div>
      )}

      {/* Progress dots */}
      <div className="mb-3">
        <ProgressDots currentState={block.state} />
      </div>

      {/* Block number */}
      <a
        href={`https://monadvision.com/block/${block.number}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-white hover:underline underline-offset-2 text-sm sm:text-base mb-2"
        title={`View block #${block.number} on MonadVision`}
      >
        #{block.number.toLocaleString()}
      </a>

      {/* Status badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={config.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'px-2 py-0.5 rounded text-xs font-medium border',
            config.badgeClass,
          )}
        >
          {config.label}
        </motion.div>
      </AnimatePresence>

      {/* Description */}
      <span className="text-[11px] text-zinc-500 mt-1.5">
        {config.description}
      </span>

      {/* Timestamp */}
      {block.timestamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto pt-2"
        >
          <span className="text-xs text-zinc-500">
            {formatTimeDisplay(block.timestamp)}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
