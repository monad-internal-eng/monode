'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Block } from '@/types/block'

export function useBlockchainScroll(blocks: Block[]) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const prevNewestBlockIdRef = useRef<number | null>(null)

  // Sort blocks by ID (oldest on left, newest on right)
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.id - b.id),
    [blocks],
  )

  const newestBlockId =
    sortedBlocks.length > 0 ? sortedBlocks[sortedBlocks.length - 1].id : null

  // Auto-scroll to the right when new blocks are added
  useLayoutEffect(() => {
    const container = scrollContainerRef.current
    if (!container || newestBlockId === null) return

    const prevNewestId = prevNewestBlockIdRef.current
    const hasNewBlock = prevNewestId === null || newestBlockId > prevNewestId

    if (hasNewBlock) {
      requestAnimationFrame(() => {
        container.scrollTo({
          left: container.scrollWidth,
          behavior: 'smooth',
        })
      })
    }

    prevNewestBlockIdRef.current = newestBlockId
  }, [newestBlockId])

  return { scrollContainerRef, sortedBlocks }
}
