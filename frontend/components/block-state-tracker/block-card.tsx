'use client'

import { motion } from 'framer-motion'
import { ExternalLink } from '@/components/ui/external-link'
import { BLOCK_STATE_CONFIG } from '@/constants/block-state'
import { formatTimeDisplay } from '@/lib/timestamp'
import { formatBlockNumber } from '@/lib/ui'
import { cn } from '@/lib/utils'
import type { Block, BlockState } from '@/types/block'

interface BlockCardProps {
  block: Block
  isLatest?: boolean
  className?: string
}

const STATE_ORDER: BlockState[] = ['proposed', 'voted', 'finalized', 'verified']

/** Horizontal state tracker with step indicators */
function StateTracker({ currentState }: { currentState: BlockState }) {
  const currentIndex = STATE_ORDER.indexOf(currentState)

  return (
    <div className="flex items-center">
      {STATE_ORDER.map((state, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        return (
          <div key={state} className="flex items-center">
            <div className="relative">
              <motion.div
                className={cn(
                  'w-3 h-3 rounded-md transition-all duration-300',
                  (isDone || isCurrent) && 'bg-[#6E54FF]',
                  isPending && 'border border-zinc-800 bg-transparent',
                )}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : undefined}
                transition={{
                  duration: 1,
                  repeat: isCurrent ? Infinity : 0,
                  repeatDelay: 0.5,
                }}
              />
              {isCurrent && (
                <div className="absolute -inset-1 bg-[#6E54FF]/20 rounded-full" />
              )}
            </div>

            {index < STATE_ORDER.length - 1 && (
              <div className="w-4 h-px bg-zinc-800" />
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
  const formattedBlockNumber = formatBlockNumber(block.number)

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
        'relative flex flex-col gap-y-4 text-center rounded-4xl select-none bg-zinc-900 w-48 h-64 sm:w-56 sm:h-64 p-6 transition-all duration-300',
        isLatest
          ? 'border border-[#6E54FF]'
          : 'border border-zinc-800 hover:border-zinc-700',
        className,
      )}
    >
      {/* Status badge */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 px-1.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-white text-xs font-normal font-mono uppercase leading-3">
            {config.label}
          </span>
        </div>
      </div>

      {/* Block number and description */}
      <div className="flex-1 flex flex-col justify-start items-center gap-1">
        <ExternalLink
          href={`https://monadvision.com/block/${block.number}`}
          className="font-britti-sans text-2xl font-medium text-white hover:underline underline-offset-2 cursor-pointer"
          title={`View block ${formattedBlockNumber} on MonadVision`}
        >
          {formattedBlockNumber}
        </ExternalLink>
        {config.description && (
          <span className="text-sm text-gray-400">{config.description}</span>
        )}
      </div>

      {/* State tracker and timestamp */}
      <div className="flex flex-col items-center gap-4">
        <StateTracker currentState={block.state} />
        {block.timestamp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-base text-gray-400">
              {formatTimeDisplay(block.timestamp)}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
