'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Gauge, X } from 'lucide-react'
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
        'flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-300',
        isActive
          ? 'bg-indigo-950/40 border-indigo-500/40 shadow-[0_0_12px_-3px_rgba(99,102,241,0.3)]'
          : 'bg-[#16162a]/60 border-[#2a2a4a]/50',
      )}
    >
      <motion.button
        type="button"
        onClick={onStart}
        disabled={isActive}
        whileHover={!isActive ? { scale: 1.02 } : undefined}
        whileTap={!isActive ? { scale: 0.98 } : undefined}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap',
          isActive
            ? 'bg-indigo-500/25 text-indigo-300 cursor-default border border-indigo-500/40'
            : 'bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 border border-indigo-500/25 hover:border-indigo-500/40 hover:text-indigo-300 hover:cursor-pointer',
        )}
        title={
          isActive
            ? 'Slow motion is active'
            : 'Slow down block updates to observe state transitions'
        }
      >
        <Gauge
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-300',
            isActive && 'animate-pulse',
          )}
        />
        {isActive ? 'Slow Mode On' : 'Slow Mode'}
      </motion.button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-300/70 whitespace-nowrap">
              <CircularTimer
                remainingSeconds={remainingSeconds}
                totalSeconds={SLOW_MOTION_DURATION_SECONDS}
              />
              <span className="hidden sm:inline">
                {remainingSeconds <= 5
                  ? 'Resuming soon…'
                  : 'until normal speed'}
              </span>
            </div>

            <motion.button
              type="button"
              onClick={onStop}
              whileHover={{
                scale: 1.1,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
              }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-md text-indigo-400/60 hover:text-red-400 transition-colors hover:cursor-pointer shrink-0"
              title="Resume normal speed"
              aria-label="Stop slow motion and resume normal speed"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
