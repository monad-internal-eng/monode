'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

export interface BubbleItem {
  id: string
  hits: number
}

export interface PackedBubble<T extends BubbleItem> {
  item: T
  x: number
  y: number
  radius: number
  colorClass: string
  ratio: number
}

interface UseBubbleMapOptions {
  minSize?: number
  maxSize?: number
  maxBubbles?: number
  padding?: number
}

interface UseBubbleMapResult<T extends BubbleItem> {
  containerRef: React.RefObject<HTMLDivElement | null>
  packedBubbles: PackedBubble<T>[]
  isReady: boolean
  maxHits: number
}

/**
 * Get bubble color class based on hit ratio.
 * Adjusted thresholds for better distribution across 10 bubbles.
 * Uses a more gradual color scale.
 */
function getBubbleColorClass(ratio: number): string {
  if (ratio >= 0.95) return 'bg-bubble-map-color-1'
  if (ratio >= 0.8) return 'bg-bubble-map-color-2'
  if (ratio >= 0.6) return 'bg-bubble-map-color-3'
  if (ratio >= 0.4) return 'bg-bubble-map-color-4'
  if (ratio >= 0.2) return 'bg-bubble-map-color-5'
  return 'bg-bubble-map-color-6'
}

/**
 * Circle packing algorithm using greedy spiral placement.
 * Optimized for visual appeal with tighter packing.
 */
function packCircles<T extends BubbleItem>(
  items: T[],
  containerWidth: number,
  containerHeight: number,
  minRadius: number,
  maxRadius: number,
  padding: number,
): PackedBubble<T>[] {
  if (items.length === 0 || containerWidth === 0 || containerHeight === 0) {
    return []
  }

  const maxHits = Math.max(...items.map((i) => i.hits), 1)
  const minHits = Math.min(...items.map((i) => i.hits), 1)
  const packed: PackedBubble<T>[] = []

  const getRadius = (hits: number) => {
    const ratio = (hits - minHits) / (maxHits - minHits || 1)
    return minRadius + (maxRadius - minRadius) * ratio
  }

  const getRatio = (hits: number) => {
    return hits / maxHits
  }

  const doesOverlap = (x: number, y: number, radius: number) => {
    for (const circle of packed) {
      const dx = x - circle.x
      const dy = y - circle.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < radius + circle.radius + padding) {
        return true
      }
    }
    return false
  }

  const isInBounds = (x: number, y: number, radius: number) => {
    const margin = 4
    return (
      x - radius >= margin &&
      x + radius <= containerWidth - margin &&
      y - radius >= margin &&
      y + radius <= containerHeight - margin
    )
  }

  // Sort by hits (largest first) for better packing
  const sortedItems = [...items].sort((a, b) => b.hits - a.hits)

  for (const item of sortedItems) {
    const radius = getRadius(item.hits)
    const ratio = getRatio(item.hits)
    let placed = false

    // Try to place near the center first, then spiral outward
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const maxAttempts = 800
    const spiralStep = 5

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      // Tighter spiral pattern from center
      const angle = attempt * 0.4
      const distance = spiralStep * Math.sqrt(attempt)
      const x = centerX + distance * Math.cos(angle)
      const y = centerY + distance * Math.sin(angle)

      if (isInBounds(x, y, radius) && !doesOverlap(x, y, radius)) {
        packed.push({
          item,
          x,
          y,
          radius,
          colorClass: getBubbleColorClass(ratio),
          ratio,
        })
        placed = true
      }
    }

    // Fallback: random placement
    if (!placed) {
      for (let attempt = 0; attempt < 200; attempt++) {
        const x = radius + Math.random() * (containerWidth - 2 * radius)
        const y = radius + Math.random() * (containerHeight - 2 * radius)

        if (isInBounds(x, y, radius) && !doesOverlap(x, y, radius)) {
          packed.push({
            item,
            x,
            y,
            radius,
            colorClass: getBubbleColorClass(ratio),
            ratio,
          })
          placed = true
          break
        }
      }
    }
  }

  return packed
}

/**
 * Custom hook for bubble map logic.
 * Handles container sizing, circle packing, and color calculations.
 */
export function useBubbleMap<T extends BubbleItem>(
  items: T[],
  options: UseBubbleMapOptions = {},
): UseBubbleMapResult<T> {
  const { minSize = 48, maxSize = 100, maxBubbles = 10, padding = 2 } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  const displayItems = useMemo(
    () => items.slice(0, maxBubbles),
    [items, maxBubbles],
  )

  const maxHits = useMemo(
    () => Math.max(...displayItems.map((i) => i.hits), 1),
    [displayItems],
  )

  const packedBubbles = useMemo(
    () =>
      packCircles(
        displayItems,
        dimensions.width,
        dimensions.height,
        minSize / 2,
        maxSize / 2,
        padding,
      ),
    [displayItems, dimensions, minSize, maxSize, padding],
  )

  const isReady = dimensions.width > 0 && dimensions.height > 0

  return {
    containerRef,
    packedBubbles,
    isReady,
    maxHits,
  }
}
