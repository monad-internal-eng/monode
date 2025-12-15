'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  SLOW_MOTION_DURATION_SECONDS,
  SLOW_MOTION_SPEED,
} from '@/constants/block-state'
import { cn } from '@/lib/utils'

interface SlowMotionButtonProps {
  isSlowMotion: boolean
  remainingSeconds: number
  onActivate: () => void
  onCancel: () => void
}

export function SlowMotionButton({
  isSlowMotion,
  remainingSeconds,
  onActivate,
  onCancel,
}: SlowMotionButtonProps) {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={onActivate}
        disabled={isSlowMotion}
        whileHover={!isSlowMotion ? { scale: 1.02 } : undefined}
        whileTap={!isSlowMotion ? { scale: 0.98 } : undefined}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
          isSlowMotion
            ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed border border-indigo-500/50'
            : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 hover:border-indigo-500/50 hover:cursor-pointer',
        )}
      >
        {isSlowMotion
          ? `${SLOW_MOTION_SPEED}x Active`
          : `${SLOW_MOTION_SPEED}x Slow Motion`}
      </motion.button>

      <AnimatePresence>
        {isSlowMotion && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <title>Slow Motion Timer</title>
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#2a2a4a]"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-indigo-400"
                  initial={{ pathLength: 1 }}
                  animate={{
                    pathLength: remainingSeconds / SLOW_MOTION_DURATION_SECONDS,
                  }}
                  transition={{ duration: 0.3, ease: 'linear' }}
                  style={{
                    strokeDasharray: '100 100',
                  }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-indigo-300">
                {remainingSeconds}
              </span>
            </div>
            <span className="text-xs text-[#6a6a7a]">Syncing after timer</span>
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-md hover:bg-[#2a2a4a]/50 text-[#6a6a7a] hover:text-[#8888a0] transition-colors hover:cursor-pointer"
              title="Cancel slow motion"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
