'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

interface BlockchainProps {
  blocks: Block[]
}

/**
 * Horizontal blockchain visualization.
 * Blocks are added from the right and stay in place as their state changes.
 * Auto-scrolls to show the newest blocks.
 */
export function Blockchain({ blocks }: BlockchainProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevBlockCountRef = useRef(0)

  // Sort blocks by ID (oldest on left, newest on right)
  const sortedBlocks = [...blocks].sort((a, b) => a.id - b.id)

  // Auto-scroll to the right when new blocks are added
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const currentCount = blocks.length
    const prevCount = prevBlockCountRef.current

    if (currentCount > prevCount && currentCount > 0) {
      // Small delay to let the new block render first
      requestAnimationFrame(() => {
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth',
        })
      })
    }

    prevBlockCountRef.current = currentCount
  }, [blocks.length])

  return (
    <div className="flex flex-col bg-[#16162a]/80 rounded-xl border border-[#2a2a4a]/50">
      <div className="px-4 py-3 border-b border-[#2a2a4a]/50">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8888a0]">
          Blockchain
        </h3>
      </div>
      <div
        ref={scrollContainerRef}
        className="flex-1 p-4 overflow-x-auto overflow-y-hidden scrollbar-none"
      >
        {sortedBlocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 w-full py-8">
            <Loader2 className="text-[#6a6a7a] animate-spin size-12" />
            <p className="text-[#6a6a7a] text-sm">Waiting for blocks...</p>
          </div>
        ) : (
          <motion.div
            className="flex items-center gap-2 min-h-[120px] sm:min-h-[140px] w-fit"
            layout
            transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
          >
            <AnimatePresence mode="sync">
              {sortedBlocks.map((block, index) => (
                <motion.div
                  key={block.id}
                  className="flex items-center shrink-0"
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Chain connector */}
                  {index > 0 && (
                    <motion.div
                      className="w-3 h-1 bg-[#3a3a5a] rounded-full mr-2 sm:w-4 shrink-0"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{
                        scaleX: 0,
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    />
                  )}
                  <BlockCard block={block} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
