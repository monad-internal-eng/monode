'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Timer, X } from 'lucide-react'
import { SLOW_MOTION_DURATION_SECONDS } from '@/constants/block-state'
import { cn } from '@/lib/utils'
import { CircularTimer } from './circular-timer'

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
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border transition-all duration-300',
        isActive
          ? 'bg-purple-500/10 border-purple-500/30 px-2 py-1'
          : 'border-transparent',
      )}
    >
      <button
        type="button"
        onClick={onStart}
        disabled={isActive}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200',
          'text-sm font-medium whitespace-nowrap',
          isActive
            ? 'bg-transparent border-transparent text-purple-400 cursor-default'
            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:cursor-pointer',
        )}
        title={
          isActive
            ? 'Slow motion is active'
            : 'Slow down block updates to observe state transitions'
        }
      >
        <Timer
          className={cn(
            'w-4 h-4 transition-transform duration-300',
            isActive && 'text-purple-400',
          )}
        />
        Slow Mode
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            isActive
              ? 'bg-purple-500/20 text-purple-400'
              : 'bg-zinc-800 text-zinc-500',
          )}
        >
          (30s)
        </span>
      </button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <CircularTimer
              remainingSeconds={remainingSeconds}
              totalSeconds={SLOW_MOTION_DURATION_SECONDS}
            />

            <motion.button
              type="button"
              onClick={onStop}
              whileHover={{
                scale: 1.1,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
              }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 transition-colors hover:cursor-pointer shrink-0"
              title="Resume normal speed"
              aria-label="Stop slow motion and resume normal speed"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
