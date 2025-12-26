'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Spinner } from '@/components/spinner'
import { cn } from '@/lib/utils'

export interface BubbleItem {
  id: string
  hits: number
}

interface BubbleMapProps<T extends BubbleItem> {
  title: string
  description: string
  items: T[]
  renderBubbleContent: (item: T) => ReactNode
  renderTooltip: (item: T) => ReactNode
  minSize?: number
  maxSize?: number
}

/**
 * A bubble map component that displays a list of items as bubbles.
 * The bubbles are colored and sized based on the number of hits.
 * The tooltip displays the item's details on hover.
 */
export function BubbleMap<T extends BubbleItem>({
  title,
  description,
  items,
  renderBubbleContent,
  renderTooltip,
  minSize = 60,
  maxSize = 180,
}: BubbleMapProps<T>) {
  const maxHits = Math.max(...items.map((i) => i.hits), 1)

  const getSize = (hits: number) => {
    const scale = hits / maxHits
    return minSize + scale * (maxSize - minSize)
  }

  const getColor = (hits: number) => {
    const ratio = hits / maxHits

    if (ratio > 0.9)
      return 'from-red-600/80 to-red-500/80 border-red-500/50 shadow-red-500/20'
    if (ratio > 0.8)
      return 'from-red-500/80 to-orange-500/80 border-red-400/50 shadow-red-500/20'
    if (ratio > 0.7)
      return 'from-orange-500/80 to-yellow-500/80 border-orange-400/50 shadow-orange-500/20'
    if (ratio > 0.6)
      return 'from-yellow-500/80 to-green-500/80 border-yellow-400/50 shadow-yellow-500/20'
    if (ratio > 0.5)
      return 'from-green-500/80 to-emerald-500/80 border-green-400/50 shadow-green-500/20'
    if (ratio > 0.4)
      return 'from-emerald-500/80 to-cyan-500/80 border-emerald-400/50 shadow-emerald-500/20'
    if (ratio > 0.3)
      return 'from-cyan-500/80 to-sky-500/80 border-cyan-400/50 shadow-cyan-500/20'
    return 'from-blue-500/80 to-indigo-500/80 border-blue-400/50 shadow-blue-500/20'
  }

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
          <p className="text-xs sm:text-sm text-[#a0a0b0] mt-1">
            {description}
          </p>
        </div>
      </div>

      <div className="relative min-h-[300px] sm:min-h-[400px] w-full bg-[#16162a]/80 rounded-xl border border-[#2a2a4a]/50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        {items.length === 0 ? (
          <Spinner text="Waiting for data..." />
        ) : (
          <div className="max-w-5xl relative flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 z-10 w-full">
            {items.map((item) => {
              const size = getSize(item.hits)

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    width: size,
                    height: size,
                  }}
                  className="group relative cursor-pointer"
                >
                  {/* Bubble */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-full bg-linear-to-br backdrop-blur-sm border transition-all duration-300',
                      'flex items-center justify-center flex-col text-center p-1.5 sm:p-2',
                      'group-hover:scale-110 group-hover:z-20 group-hover:shadow-lg',
                      getColor(item.hits),
                    )}
                  >
                    {renderBubbleContent(item)}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50 w-max max-w-[200px] sm:max-w-[250px]">
                    <div className="bg-[#0e0e1a] border border-[#2a2a4a] rounded-lg p-2 sm:p-3 shadow-xl text-xs sm:text-sm">
                      {renderTooltip(item)}
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-[#0e0e1a] border-b border-r border-[#2a2a4a] rotate-45 -mt-1" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
