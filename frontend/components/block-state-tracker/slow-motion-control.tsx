'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  SLOW_MOTION_DURATION_SECONDS,
  SLOW_MOTION_SPEED,
} from '@/constants/block-state'
import { cn } from '@/lib/utils'

interface SlowMotionControlProps {
  isActive: boolean
  remainingSeconds: number
  onStart: () => void
  onStop: () => void
}

export function SlowMotionControl({
  isActive,
  remainingSeconds,
  onStart,
  onStop,
}: SlowMotionControlProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#16162a]/60 rounded-lg border border-[#2a2a4a]/50">
      <motion.button
        type="button"
        onClick={onStart}
        disabled={isActive}
        whileHover={!isActive ? { scale: 1.02 } : undefined}
        whileTap={!isActive ? { scale: 0.98 } : undefined}
        className={cn(
          'px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap',
          isActive
            ? 'bg-indigo-500/30 text-indigo-300 cursor-not-allowed border border-indigo-500/50'
            : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 border border-indigo-500/30 hover:border-indigo-500/50 hover:cursor-pointer',
        )}
      >
        {isActive
          ? `${SLOW_MOTION_SPEED}x Active`
          : `${SLOW_MOTION_SPEED}x Slow Motion`}
      </motion.button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <div className="relative w-7 h-7 shrink-0">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
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
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-indigo-300">
                {remainingSeconds}
              </span>
            </div>
            <span className="text-[10px] text-[#6a6a7a] whitespace-nowrap">
              Syncing after
            </span>
            <motion.button
              type="button"
              onClick={onStop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-md hover:bg-[#2a2a4a]/50 text-[#6a6a7a] hover:text-[#8888a0] transition-colors hover:cursor-pointer shrink-0"
              title="Cancel slow motion"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
