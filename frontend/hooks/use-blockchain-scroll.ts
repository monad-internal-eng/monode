'use client'

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
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
  const prevNewestBlockNumberRef = useRef<number | null>(null)
  const wasHiddenRef = useRef(false)

  // Sort blocks by Number (oldest on left, newest on right)
  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.number - b.number),
    [blocks],
  )

  const newestBlockNumber =
    sortedBlocks.length > 0
      ? sortedBlocks[sortedBlocks.length - 1].number
      : null

  // Auto-scroll to the end when new blocks are added (only if following chain)
  useLayoutEffect(() => {
    if (!gridRef.current || newestBlockNumber === null || !isFollowingChain)
      return
    const prevNewestNumber = prevNewestBlockNumberRef.current
    const hasNewBlock =
      prevNewestNumber === null || newestBlockNumber > prevNewestNumber

    if (hasNewBlock) {
      requestAnimationFrame(() => {
        gridRef.current?.scrollToColumn({
          index: sortedBlocks.length - 1,
          align: 'end',
          behavior: 'smooth',
        })
      })
    }

    prevNewestBlockNumberRef.current = newestBlockNumber
  }, [newestBlockNumber, isFollowingChain, sortedBlocks.length])

  // Handle tab visibility changes - scroll to end when tab becomes visible
  // This fixes the issue where requestAnimationFrame is paused in background tabs,
  // causing the auto-scroll to not work while the tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHiddenRef.current = true
      } else if (
        document.visibilityState === 'visible' &&
        wasHiddenRef.current &&
        isFollowingChain &&
        sortedBlocks.length > 0
      ) {
        // Tab became visible after being hidden - scroll to end immediately
        // Use 'auto' (instant) to avoid jarring smooth animation of large distance
        gridRef.current?.scrollToColumn({
          index: sortedBlocks.length - 1,
          align: 'end',
          behavior: 'auto',
        })
        wasHiddenRef.current = false
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isFollowingChain, sortedBlocks.length])

  return { gridRef, sortedBlocks }
}
