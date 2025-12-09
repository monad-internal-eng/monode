'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { BLOCK_STATE_CONFIG } from '@/constants/block-state'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

interface BlockchainProps {
  finalizedBlocks: Block[]
  verifiedBlocks: Block[]
}

/**
 * Horizontal blockchain visualization showing finalized and verified blocks.
 * Auto-scrolls to show the newest blocks on the right.
 */
export function Blockchain({
  finalizedBlocks,
  verifiedBlocks,
}: BlockchainProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevBlockCountRef = useRef(0)

  // Combine and sort blocks: lower IDs on left, higher IDs on right
  const chainBlocks = [...verifiedBlocks, ...finalizedBlocks].sort(
    (a, b) => a.id - b.id,
  )

  // Scroll BEFORE paint so layout animation target is visible
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const currentCount = chainBlocks.length
    const prevCount = prevBlockCountRef.current

    if (currentCount > prevCount && currentCount > 0) {
      container.scrollLeft = container.scrollWidth
    }

    prevBlockCountRef.current = currentCount
  }, [chainBlocks.length])

  return (
    <div className="flex flex-col bg-[#16162a]/80 rounded-xl border border-[#2a2a4a]/50">
      <div className="px-4 py-3 border-b border-[#2a2a4a]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8888a0]">
          Blockchain
        </h3>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-[#6a6a7a]">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ background: BLOCK_STATE_CONFIG.finalized.gradient }}
            />
            <span>Finalized</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ background: BLOCK_STATE_CONFIG.verified.gradient }}
            />
            <span>Verified</span>
          </div>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-x-auto overflow-y-hidden scrollbar-none"
      >
        <div className="flex items-center min-h-[100px] sm:min-h-[120px] w-fit">
          <AnimatePresence mode="popLayout">
            {chainBlocks.map((block, index) => (
              <motion.div
                key={block.id}
                className="flex items-center shrink-0"
                layout
                transition={{
                  layout: { type: 'spring', stiffness: 300, damping: 30 },
                }}
              >
                {/* Chain connector */}
                {index > 0 && (
                  <div className="w-4 h-0.5 bg-[#3a3a5a] sm:w-6 shrink-0" />
                )}
                <BlockCard block={block} showLabel compact />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
