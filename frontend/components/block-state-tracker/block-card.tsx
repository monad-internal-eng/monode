'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BLOCK_STATE_CONFIG } from '@/constants/block-state'
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
export function BlockCard({ block, className }: BlockCardProps) {
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
        'w-20 h-20 text-base sm:w-24 sm:h-24 sm:text-lg',
        className,
      )}
    >
      <span className="font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
        #{block.id}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={config.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.9, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="text-xs mt-1 sm:text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
        >
          {config.label}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
