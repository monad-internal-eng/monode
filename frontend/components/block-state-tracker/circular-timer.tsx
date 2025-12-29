'use client'

import { motion } from 'framer-motion'

interface CircularTimerProps {
  remainingSeconds: number
  totalSeconds: number
  size?: number
}

const STROKE_WIDTH = 2.5

/**
 * Circular countdown timer that displays remaining time with an animated ring.
 * Uses strokeDashoffset for smooth countdown animation.
 */
export function CircularTimer({
  remainingSeconds,
  totalSeconds,
  size = 28,
}: CircularTimerProps) {
  const radius = (size - STROKE_WIDTH) / 2
  const circumference = 2 * Math.PI * radius
  const progress = remainingSeconds / totalSeconds
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <title>Time remaining: {remainingSeconds}s</title>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          className="text-purple-950/60"
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          className="text-purple-400"
          style={{
            strokeDasharray: circumference,
          }}
          animate={{
            strokeDashoffset,
          }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </svg>
      {/* Centered number */}
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-medium text-purple-300">
        {remainingSeconds}
      </span>
    </div>
  )
}
