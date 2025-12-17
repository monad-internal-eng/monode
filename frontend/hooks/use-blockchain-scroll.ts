'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import type { GridImperativeAPI } from 'react-window'
import type { Block } from '@/types/block'

interface UseBlockchainScrollOptions {
  blocks: Block[]
  isFollowingChain: boolean
}

export function useBlockchainScroll({
  blocks,
  isFollowingChain,
}: UseBlockchainScrollOptions) {
  const gridRef = useRef<GridImperativeAPI>(null)
  const prevNewestBlockIdRef = useRef<number | null>(null)

  // Sort blocks by ID (oldest on left, newest on right)
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.id - b.id),
    [blocks],
  )

  const newestBlockId =
    sortedBlocks.length > 0 ? sortedBlocks[sortedBlocks.length - 1].id : null

  // Auto-scroll to the end when new blocks are added (only if following chain)
  useLayoutEffect(() => {
    if (!gridRef.current || newestBlockId === null || !isFollowingChain) return

    const prevNewestId = prevNewestBlockIdRef.current
    const hasNewBlock = prevNewestId === null || newestBlockId > prevNewestId

    if (hasNewBlock) {
      requestAnimationFrame(() => {
        gridRef.current?.scrollToColumn({
          index: sortedBlocks.length - 1,
          align: 'end',
          behavior: 'smooth',
        })
      })
    }

    prevNewestBlockIdRef.current = newestBlockId
  }, [newestBlockId, isFollowingChain, sortedBlocks.length])

  return { gridRef, sortedBlocks }
}
