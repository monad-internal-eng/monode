'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Spinner } from '@/components/spinner'
import { useBlockchainScroll } from '@/hooks/use-blockchain-scroll'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

interface BlockchainProps {
  blocks: Block[]
  isFollowingChain: boolean
}

/**
 * Horizontal blockchain visualization.
 * Blocks are added from the right and stay in place as their state changes.
 * Auto-scrolls to show the newest blocks.
 */
export function Blockchain({ blocks, isFollowingChain }: BlockchainProps) {
  const { scrollContainerRef, sortedBlocks } = useBlockchainScroll({
    blocks,
    isFollowingChain,
  })

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex-1 p-4 overflow-y-hidden scrollbar-none min-h-[152px] sm:min-h-[172px]',
        isFollowingChain ? 'overflow-x-hidden' : 'overflow-x-auto',
      )}
    >
      {sortedBlocks.length === 0 ? (
        <div className="flex items-center justify-center w-full h-[120px] sm:h-[140px]">
          <Spinner text="Waiting for blocks..." />
        </div>
      ) : (
        <motion.div
          className="flex items-center gap-2 h-[120px] sm:h-[140px] w-fit"
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
  )
}
