'use client'

import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Block } from '@/types/block'
import { BlockCard } from './block-card'

interface LaneProps {
  title: string
  blocks: Block[]
  className?: string
}

/**
 * Container lane that displays blocks in a particular state.
 * AnimatePresence with popLayout removes exiting items from layout flow,
 * enabling smooth layoutId transitions to other containers.
 */
export function Lane({ title, blocks, className }: LaneProps) {
  return (
    <div
      className={cn(
        'flex flex-col bg-[#16162a]/80 rounded-xl border border-[#2a2a4a]/50',
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-[#2a2a4a]/50">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8888a0]">
          {title}
        </h3>
      </div>
      <div className="flex-1 p-4 min-h-[140px] sm:min-h-[180px]">
        <div className="flex flex-wrap gap-3 content-start">
          <AnimatePresence mode="popLayout">
            {blocks.map((block) => (
              <BlockCard key={block.id} block={block} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
