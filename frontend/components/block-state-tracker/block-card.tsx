'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BLOCK_STATE_CONFIG } from '@/constants/block-state'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'

interface BlockCardProps {
  block: Block
  showLabel?: boolean
  compact?: boolean
}

/**
 * Individual block card with animated state transitions.
 *
 * Uses framer-motion's layoutId for smooth position animations between containers.
 * Color transitions are handled via CSS transitions for smoother performance.
 * Label appearance and text changes are animated for visual smoothness.
 */
export function BlockCard({
  block,
  showLabel = false,
  compact = false,
}: BlockCardProps) {
  const config = BLOCK_STATE_CONFIG[block.state]

  return (
    <motion.div
      layoutId={`block-${block.id}`}
      initial={false}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      style={{
        background: config.gradient,
        boxShadow: config.shadow,
      }}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg font-semibold',
        'select-none cursor-default text-white',
        'transition-[background,box-shadow] duration-400 ease-in-out',
        compact
          ? 'w-14 h-14 text-xs sm:w-16 sm:h-16 sm:text-sm'
          : 'w-16 h-16 text-sm sm:w-20 sm:h-20 sm:text-base',
      )}
    >
      <span className="font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
        #{block.id}
      </span>
      <AnimatePresence mode="wait">
        {showLabel && (
          <motion.span
            key={config.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 0.9, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-[10px] mt-0.5 sm:text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
          >
            {config.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
