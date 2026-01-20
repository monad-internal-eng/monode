'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { CornerDecorationsContainer } from '@/components/ui/corner-decorations-container'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { type BubbleItem, useBubbleMap } from '@/hooks/use-bubble-map'
import { cn } from '@/lib/utils'

export type { BubbleItem }

interface BubbleMapProps<T extends BubbleItem> {
  title: string
  description: string
  items: T[]
  renderBubbleContent: (item: T, size: number) => ReactNode
  renderTooltip: (item: T) => ReactNode
}

/**
 * A bubble map component that displays a list of items as packed bubbles.
 * Uses framer-motion for smooth animations and transitions.
 */
export function BubbleMap<T extends BubbleItem>({
  title,
  description,
  items,
  renderBubbleContent,
  renderTooltip,
}: BubbleMapProps<T>) {
  const { containerRef, packedBubbles, isReady } = useBubbleMap(items)

  return (
    <div className="flex flex-1 flex-col">
      {/* Header section with title and description stacked */}
      <div className="flex flex-col gap-4 p-6 lg:p-10 border-t border-b border-zinc-800">
        <h2 className="text-2xl lg:text-4xl font-medium font-britti-sans leading-8 lg:leading-10 text-white">
          {title}
        </h2>
        <p className="text-sm lg:text-base font-normal leading-5 lg:leading-6 text-gray-400">
          {description}
        </p>
      </div>

      {/* Bubble map container */}
      <div className="px-4 py-4 lg:px-10 lg:py-6 flex-1 flex items-center justify-center">
        <CornerDecorationsContainer className="border-zinc-800 w-full">
          {items.length === 0 ? (
            <div className="flex h-128 items-center justify-center">
              <Spinner text="Waiting for data..." />
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative h-128 w-full overflow-hidden"
            >
              <AnimatePresence mode="popLayout">
                {isReady &&
                  packedBubbles.map(({ item, x, y, radius, colorClass }) => {
                    const size = radius * 2

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          x: x - radius,
                          y: y - radius,
                          width: size,
                          height: size,
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 120,
                          damping: 20,
                          mass: 0.8,
                        }}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                        }}
                        className="group"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.div
                              className={cn(
                                'flex h-full w-full cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-full px-1 text-white',
                                'hover:z-20 hover:shadow-[0_0_0_0.125rem_var(--color-shadow-accent),0_0_0_0.25rem_var(--color-brand-purple-hover)]',
                                'transition-colors duration-500 ease-out',
                                colorClass,
                              )}
                              whileHover={{ scale: 1.08 }}
                              transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 15,
                              }}
                            >
                              {renderBubbleContent(item, size)}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent
                            sideOffset={5}
                            className="w-[15.625rem] rounded-lg border border-tooltip-border bg-tooltip-bg p-3 text-sm shadow-xl"
                          >
                            {renderTooltip(item)}
                          </TooltipContent>
                        </Tooltip>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>
          )}
        </CornerDecorationsContainer>
      </div>
    </div>
  )
}
