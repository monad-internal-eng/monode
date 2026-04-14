'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getTokenFromList } from '@/lib/token-list'
import type { ContractLabelsResponse } from '@/types/contract'

/** Evict old entries when the cache exceeds this size. */
const MAX_CACHED_LABELS = 500

interface ContractLabelInfo {
  address: string
  name: string | null
  label: string | null
  displayName: string | null
}

interface UseContractLabelsResult {
  labels: Map<string, ContractLabelInfo>
  isLoading: boolean
  getLabel: (address: string) => ContractLabelInfo | null
}

/**
 * Builds a display name from contract label data.
 */
function buildDisplayName(
  name: string | null,
  label: string | null,
): string | null {
  if (!name) return null
  return label ? `${name} (${label})` : name
}

/**
 * Hook to resolve contract labels for a list of addresses.
 *
 * Resolution order:
 * 1. Check static token-list.json (instant, no network)
 * 2. For unknown addresses, batch fetch from BlockVision API
 *
 * Behavior on list changes:
 * - Only NEW addresses trigger API calls (already-resolved addresses are cached)
 * - Removed addresses are simply not used (no cleanup needed)
 *
 * @param addresses - Array of contract addresses to resolve
 */
export function useContractLabels(
  addresses: string[],
): UseContractLabelsResult {
  const [labels, setLabels] = useState<Map<string, ContractLabelInfo>>(
    new Map(),
  )
  const [isLoading, setIsLoading] = useState(false)

  // Track which addresses have been processed (token list or API)
  // Persists across re-renders to prevent duplicate fetches
  const resolvedAddressesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (addresses.length === 0) return

    const normalizedAddresses = addresses.map((a) => a.toLowerCase())

    // Evict stale entries when the cache grows too large.
    // Clearing both lets currently-active addresses re-resolve on the next cycle.
    if (resolvedAddressesRef.current.size > MAX_CACHED_LABELS) {
      resolvedAddressesRef.current.clear()
      setLabels(new Map())
    }

    // Identify addresses that need resolution
    const tokenListResults: ContractLabelInfo[] = []
    const addressesToFetch: string[] = []

    for (const address of normalizedAddresses) {
      // Skip already-resolved addresses
      if (resolvedAddressesRef.current.has(address)) continue

      // Check static token list first
      const tokenInfo = getTokenFromList(address)
      if (tokenInfo) {
        tokenListResults.push({
          address,
          name: tokenInfo.name,
          label: tokenInfo.symbol,
          displayName: tokenInfo.name,
        })
        resolvedAddressesRef.current.add(address)
      } else {
        addressesToFetch.push(address)
      }
    }

    // Update state with token list results
    if (tokenListResults.length > 0) {
      setLabels((prev) => {
        const updated = new Map(prev)
        for (const info of tokenListResults) {
          updated.set(info.address, info)
        }
        return updated
      })
    }

    // Fetch remaining addresses from API
    if (addressesToFetch.length === 0) return

    const fetchLabels = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/contract-labels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: addressesToFetch }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data: ContractLabelsResponse = await response.json()

        setLabels((prev) => {
          const updated = new Map(prev)
          for (const [addr, label] of Object.entries(data.labels)) {
            updated.set(addr.toLowerCase(), {
              ...label,
              displayName: buildDisplayName(label.name, label.label),
            })
          }
          return updated
        })

        // Mark as resolving after async call completes
        for (const addr of addressesToFetch) {
          resolvedAddressesRef.current.add(addr)
        }
      } catch (error) {
        console.error('Failed to fetch contract labels:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabels()
  }, [addresses.join(',')]) // Stringify to create stable dependency

  const getLabel = useCallback(
    (address: string): ContractLabelInfo | null => {
      return labels.get(address.toLowerCase()) ?? null
    },
    [labels],
  )

  return { labels, isLoading, getLabel }
}
