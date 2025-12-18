'use client'

import { useCallback, useMemo, useState } from 'react'
import { DEX_CONFIGS, type DexProvider } from '@/constants/dex-config'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'
import type { SwapData, SwapsByProvider } from '@/types/swap'

const MAX_SWAPS_PER_PROVIDER = 10

/**
 * Parse raw log data into normalized SwapData based on the provider
 */
function parseSwapEvent(
  event: SerializableEventData,
  provider: DexProvider,
): SwapData | null {
  if (event.payload.type !== 'TxnLog') {
    return null
  }

  const { address, topics, data } = event.payload
  const blockNumber = event.block_number ?? 0
  const txnIdx = event.txn_idx ?? 0

  const id = `${blockNumber}-${txnIdx}-${event.seqno}`
  const timestamp = Number(BigInt(event.timestamp_ns) / BigInt(1_000_000))

  try {
    switch (provider) {
      case 'uniswap-v4':
        return parseUniswapV4Swap(
          id,
          address,
          topics,
          data,
          blockNumber,
          timestamp,
        )
      case 'pancakeswap-v3':
        return parsePancakeSwapV3Swap(
          id,
          address,
          topics,
          data,
          blockNumber,
          timestamp,
        )
      case 'lfj':
        return parseLFJSwap(id, address, topics, data, blockNumber, timestamp)
      case 'kuru':
        return parseKuruTrade(id, address, topics, data, blockNumber, timestamp)
      default:
        return null
    }
  } catch {
    return null
  }
}

/**
 * Parse Uniswap V4 Swap event
 */
function parseUniswapV4Swap(
  id: string,
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const sender = topics[2] ? `0x${topics[2].slice(26)}` : address

  const cleanData = data.startsWith('0x') ? data.slice(2) : data
  const amount0 = BigInt(`0x${cleanData.slice(0, 64)}`)
  const amount1 = BigInt(`0x${cleanData.slice(64, 128)}`)

  const isToken0In = amount0 > BigInt(0)

  return {
    id,
    provider: 'uniswap-v4',
    txHash: '',
    blockNumber,
    timestamp,
    sender,
    amountIn: (isToken0In ? amount0 : amount1).toString(),
    amountOut: (isToken0In ? -amount1 : -amount0).toString(),
    tokenIn: isToken0In ? 'MON' : 'AUSD',
    tokenOut: isToken0In ? 'AUSD' : 'MON',
  }
}

/**
 * Parse PancakeSwap V3 Swap event
 */
function parsePancakeSwapV3Swap(
  id: string,
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const sender = topics[1] ? `0x${topics[1].slice(26)}` : address
  const recipient = topics[2] ? `0x${topics[2].slice(26)}` : undefined

  const cleanData = data.startsWith('0x') ? data.slice(2) : data
  const amount0 = BigInt(`0x${cleanData.slice(0, 64)}`)
  const amount1 = BigInt(`0x${cleanData.slice(64, 128)}`)

  const isToken0In = amount0 > BigInt(0)

  return {
    id,
    provider: 'pancakeswap-v3',
    txHash: '',
    blockNumber,
    timestamp,
    sender,
    recipient,
    amountIn: (isToken0In ? amount0 : amount1).toString(),
    amountOut: (isToken0In ? -amount1 : -amount0).toString(),
    tokenIn: isToken0In ? 'MON' : 'AUSD',
    tokenOut: isToken0In ? 'AUSD' : 'MON',
  }
}

/**
 * Parse LFJ (Trader Joe V2) Swap event
 */
function parseLFJSwap(
  id: string,
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const sender = topics[1] ? `0x${topics[1].slice(26)}` : address
  const recipient = topics[2] ? `0x${topics[2].slice(26)}` : undefined

  const cleanData = data.startsWith('0x') ? data.slice(2) : data

  const amountsInHex = cleanData.slice(64, 128)
  const amountsOutHex = cleanData.slice(128, 192)

  const amountXIn = BigInt(`0x${amountsInHex.slice(0, 32)}`)
  const amountYIn = BigInt(`0x${amountsInHex.slice(32, 64)}`)
  const amountXOut = BigInt(`0x${amountsOutHex.slice(0, 32)}`)
  const amountYOut = BigInt(`0x${amountsOutHex.slice(32, 64)}`)

  const isXIn = amountXIn > BigInt(0)

  return {
    id,
    provider: 'lfj',
    txHash: '',
    blockNumber,
    timestamp,
    sender,
    recipient,
    amountIn: (isXIn ? amountXIn : amountYIn).toString(),
    amountOut: (isXIn ? amountYOut : amountXOut).toString(),
    tokenIn: isXIn ? 'MON' : 'AUSD',
    tokenOut: isXIn ? 'AUSD' : 'MON',
  }
}

/**
 * Parse Kuru Trade event
 */
function parseKuruTrade(
  id: string,
  _address: string,
  _topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const cleanData = data.startsWith('0x') ? data.slice(2) : data

  const makerAddress = `0x${cleanData.slice(24, 64)}`
  const isBuy = cleanData.slice(64, 128) !== '0'.repeat(64)
  const price = BigInt(`0x${cleanData.slice(128, 192)}`)
  const filledSize = BigInt(`0x${cleanData.slice(256, 320)}`)
  const takerAddress = `0x${cleanData.slice(344, 384)}`

  return {
    id,
    provider: 'kuru',
    txHash: '',
    blockNumber,
    timestamp,
    sender: takerAddress,
    recipient: makerAddress,
    amountIn: filledSize.toString(),
    amountOut: ((filledSize * price) / BigInt(1e18)).toString(),
    tokenIn: isBuy ? 'AUSD' : 'MON',
    tokenOut: isBuy ? 'MON' : 'AUSD',
    price: price.toString(),
  }
}

/**
 * Hook to subscribe to and process swap events from all configured DEXs
 */
export function useSwapEvents() {
  const [swapsByProvider, setSwapsByProvider] = useState<
    Map<DexProvider, SwapData[]>
  >(() => new Map(DEX_CONFIGS.map((config) => [config.provider, []])))

  const filters = useMemo(
    () =>
      DEX_CONFIGS.map((config) => ({
        eventName: 'TxnLog' as const,
        fieldFilters: [
          {
            field: 'address' as const,
            filter: { values: [config.contractAddress.toLowerCase()] },
          },
          { field: 'topics' as const, filter: { values: [config.eventTopic] } },
        ],
      })),
    [],
  )

  const handleEvent = useCallback((event: SerializableEventData) => {
    if (event.payload.type !== 'TxnLog') return

    const address = event.payload.address.toLowerCase()
    const topic0 = event.payload.topics[0]

    const matchingConfig = DEX_CONFIGS.find(
      (config) =>
        config.contractAddress.toLowerCase() === address &&
        config.eventTopic === topic0,
    )

    if (!matchingConfig) return

    const swapData = parseSwapEvent(event, matchingConfig.provider)
    if (!swapData) return

    setSwapsByProvider((prev) => {
      const newMap = new Map(prev)
      const existingSwaps = newMap.get(matchingConfig.provider) ?? []

      if (existingSwaps.some((s) => s.id === swapData.id)) {
        return prev
      }

      const updatedSwaps = [swapData, ...existingSwaps].slice(
        0,
        MAX_SWAPS_PER_PROVIDER,
      )
      newMap.set(matchingConfig.provider, updatedSwaps)
      return newMap
    })
  }, [])

  const { isConnected } = useEvents({
    filters,
    onEvent: handleEvent,
  })

  const swapsGrouped: SwapsByProvider[] = useMemo(
    () =>
      DEX_CONFIGS.map((config) => ({
        provider: config.provider,
        swaps: swapsByProvider.get(config.provider) ?? [],
        isLoading: !isConnected,
      })),
    [swapsByProvider, isConnected],
  )

  const allSwaps = useMemo(
    () =>
      Array.from(swapsByProvider.values())
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_SWAPS_PER_PROVIDER * 2),
    [swapsByProvider],
  )

  const clearSwaps = useCallback(() => {
    setSwapsByProvider(
      new Map(DEX_CONFIGS.map((config) => [config.provider, []])),
    )
  }, [])

  return {
    swapsByProvider: swapsGrouped,
    allSwaps,
    isConnected,
    clearSwaps,
  }
}
