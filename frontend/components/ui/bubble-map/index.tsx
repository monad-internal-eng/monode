'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { SectionHeader } from '@/components/ui/section-header'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  bottomDescription?: string
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
  bottomDescription,
  minSize = 90,
  maxSize = 110,
}: BubbleMapProps<T>) {
  const maxHits = Math.max(...items.map((i) => i.hits), 1)

  const getSize = (hits: number) => {
    const ratio = hits / maxHits

    if (ratio > 0.7) return maxSize
    return minSize
  }

  const getColor = (hits: number) => {
    const ratio = hits / maxHits

    if (ratio > 0.7) return 'bg-[#B63537] text-white'
    return 'bg-[#C88328] text-black'
  }

  return (
    <div className="w-full flex flex-1 flex-col gap-4 sm:gap-6">
      <SectionHeader title={title} description={description} />

      <div className="relative min-h-[250px] sm:min-h-[350px] w-full dark-component-colors rounded-xl border p-3 sm:p-5 lg:p-7 flex grow flex-col gap-10 items-center justify-between">
        {items.length === 0 ? (
          <Spinner text="Waiting for data..." />
        ) : (
          <div className="max-w-5xl relative flex flex-wrap items-center justify-center gap-2 sm:gap-3 z-10 w-full">
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
                  {/* Bubble & Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full transition-all duration-300',
                          'flex items-center justify-center flex-col text-center p-1.5 sm:p-2',
                          'group-hover:z-20 group-hover:shadow-[0_0_0_2px_#17151E,0_0_0_4px_#9C6EF8]',
                          getColor(item.hits),
                        )}
                      >
                        {renderBubbleContent(item)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      sideOffset={5}
                      className="bg-tooltip-bg border border-tooltip-border rounded-lg p-2 sm:p-3 shadow-xl text-xs sm:text-sm w-[250px]"
                    >
                      {renderTooltip(item)}
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              )
            })}
          </div>
        )}
        {/* Bottom description */}
        {bottomDescription && (
          <div>
            <p className="text-center text-sm text-text-secondary">
              {bottomDescription}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
