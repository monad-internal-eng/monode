'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BLOCK_STATE_CONFIG } from '@/constants/block-state'
import { formatDateDisplay, formatTimeDisplay } from '@/lib/timestamp'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'

interface BlockCardProps {
  block: Block
  className?: string
}

/**
 * Individual block card in the blockchain visualization.
 * Color and label transition smoothly as the block progresses through states.
 */
export const BlockCard = ({ block, className }: BlockCardProps) => {
  const config = BLOCK_STATE_CONFIG[block.state]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0,
        transition: { duration: 0.3, ease: 'easeIn' },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        background: config.gradient,
        boxShadow: config.shadow,
      }}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl font-semibold',
        'select-none cursor-default text-white',
        'transition-[background,box-shadow] duration-500 ease-in-out',
        'w-34 h-34 text-lg p-3',
        className,
      )}
    >
      <a
        href={`https://monadvision.com/block/${block.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] hover:underline underline-offset-2"
        title={`View block #${block.id} on MonadVision`}
      >
        #{block.id}
      </a>
      <AnimatePresence mode="wait">
        <motion.span
          key={config.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.9, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] text-base mt-2"
        >
          {config.label}
        </motion.span>
      </AnimatePresence>
      {block.timestamp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-0.5 mt-3"
        >
          <span className="text-sm text-white/80 text-center leading-none">
            {formatTimeDisplay(block.timestamp)}
          </span>
          <span className="text-xs text-white/60 text-center leading-none">
            {formatDateDisplay(block.timestamp)}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
