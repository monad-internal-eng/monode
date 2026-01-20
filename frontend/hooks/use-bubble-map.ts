'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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
}

interface UseBubbleMapResult<T extends BubbleItem> {
  containerRef: (node: HTMLDivElement | null) => void
  packedBubbles: PackedBubble<T>[]
  isReady: boolean
}

// Bubble sizing and layout constants
const MIN_BUBBLE_SIZE = 58
const MAX_BUBBLE_SIZE = 138
const MAX_BUBBLES = 10
const BUBBLE_PADDING = 5

/**
 * Get bubble color class based on normalized hit value (0 = lowest hits, 1 = highest)
 * Uses hit-value bands so bubbles with same/similar hits get same color
 */
function getBubbleColorClass(normalizedHits: number): string {
  if (normalizedHits >= 0.9) return 'bg-bubble-map-color-1'
  if (normalizedHits >= 0.7) return 'bg-bubble-map-color-2'
  if (normalizedHits >= 0.5) return 'bg-bubble-map-color-3'
  if (normalizedHits >= 0.3) return 'bg-bubble-map-color-4'
  if (normalizedHits >= 0.15) return 'bg-bubble-map-color-5'
  return 'bg-bubble-map-color-6'
}

/**
 * Hash string to number for deterministic positioning
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Circle packing with stable positions based on item ID.
 * Positions are determined by ID hash, not by hits - so small hit changes don't move bubbles.
 */
function packCircles<T extends BubbleItem>(
  items: T[],
  width: number,
  height: number,
  minRadius: number,
  maxRadius: number,
  padding: number,
): PackedBubble<T>[] {
  if (items.length === 0 || width <= 0 || height <= 0) return []

  const maxHits = Math.max(...items.map((i) => i.hits), 1)
  const minHits = Math.min(...items.map((i) => i.hits), 1)
  const hitRange = maxHits - minHits || 1

  // Sort by ID for stable ordering (not by hits!)
  const sorted = [...items].sort((a, b) => a.id.localeCompare(b.id))

  // Normalize hits to 0-1 range for both size and color
  const getNormalized = (hits: number): number => (hits - minHits) / hitRange

  const getRadius = (hits: number): number => {
    const normalized = getNormalized(hits)
    // Power > 1 spreads sizes - lower hits become much smaller than high hits
    return minRadius + (maxRadius - minRadius) * normalized ** 1.8
  }

  const packed: PackedBubble<T>[] = []
  const centerX = width / 2
  const centerY = height / 2

  const overlaps = (
    x: number,
    y: number,
    r: number,
    excludeId?: string,
  ): boolean => {
    for (const c of packed) {
      if (excludeId && c.item.id === excludeId) continue
      const dx = x - c.x
      const dy = y - c.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < r + c.radius + padding) return true
    }
    return false
  }

  const inBounds = (x: number, y: number, r: number): boolean => {
    const margin = 8
    return (
      x - r >= margin &&
      x + r <= width - margin &&
      y - r >= margin &&
      y + r <= height - margin
    )
  }

  for (const item of sorted) {
    const radius = getRadius(item.hits)
    // Color based on normalized hit value - same hits = same color
    const colorClass = getBubbleColorClass(getNormalized(item.hits))

    // Use ID hash for deterministic starting angle
    const idHash = hashString(item.id)
    const baseAngle = (idHash % 360) * (Math.PI / 180)

    let bestX = centerX
    let bestY = centerY
    let placed = false

    // Spiral outward from center with ID-based angle offset
    for (let dist = 0; dist < Math.max(width, height) && !placed; dist += 8) {
      for (
        let angleOffset = 0;
        angleOffset < Math.PI * 2;
        angleOffset += Math.PI / 16
      ) {
        const angle = baseAngle + angleOffset
        const x = centerX + dist * Math.cos(angle)
        const y = centerY + dist * Math.sin(angle)

        if (inBounds(x, y, radius) && !overlaps(x, y, radius)) {
          bestX = x
          bestY = y
          placed = true
          break
        }
      }
    }

    if (placed) {
      packed.push({ item, x: bestX, y: bestY, radius, colorClass })
    }
  }

  return packed
}

export function useBubbleMap<T extends BubbleItem>(
  items: T[],
): UseBubbleMapResult<T> {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainer(node)
  }, [])

  useEffect(() => {
    if (!container) return

    const measure = () => {
      const { offsetWidth, offsetHeight } = container
      if (offsetWidth > 0 && offsetHeight > 0) {
        setSize({ width: offsetWidth, height: offsetHeight })
      }
    }

    const rafId = requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(container)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [container])

  const displayItems = useMemo(() => items.slice(0, MAX_BUBBLES), [items])

  const packedBubbles = useMemo(
    () =>
      packCircles(
        displayItems,
        size.width,
        size.height,
        MIN_BUBBLE_SIZE / 2,
        MAX_BUBBLE_SIZE / 2,
        BUBBLE_PADDING,
      ),
    [displayItems, size],
  )

  const isReady = size.width > 0 && size.height > 0

  return { containerRef, packedBubbles, isReady }
}
