'use client'

import { useCallback, useMemo, useState } from 'react'
import { DEX_CONFIGS, type DexProvider } from '@/constants/dex-config'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'
import type { SwapData, SwapsByProvider } from '@/types/swap'
import {
  cleanHexData,
  parseAddress,
  parseLFJPackedAmounts,
  parseSignedInt256,
  parseTopicsString,
  parseUint,
} from '@/utils/abi-decode'

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

  const { address, data } = event.payload
  const topics = parseTopicsString(event.payload.topics as string | string[])
  const blockNumber = event.block_number ?? 0
  const txnIdx = event.txn_idx ?? 0
  const txHash = event.txn_hash

  const id = `${blockNumber}-${txnIdx}-${event.seqno}`
  const timestamp = Number(BigInt(event.timestamp_ns) / BigInt(1_000_000))

  try {
    let swap: SwapData | null = null
    switch (provider) {
      case 'uniswap-v4':
        swap = parseUniswapV4Swap(
          id,
          address,
          topics,
          data,
          blockNumber,
          timestamp,
        )
        break
      case 'pancakeswap-v3':
        swap = parsePancakeSwapV3Swap(
          id,
          address,
          topics,
          data,
          blockNumber,
          timestamp,
        )
        break
      case 'lfj':
        swap = parseLFJSwap(id, address, topics, data, blockNumber, timestamp)
        break
      case 'kuru':
        swap = parseKuruTrade(id, address, topics, data, blockNumber, timestamp)
        break
    }
    if (swap) {
      swap.txHash = txHash ?? ''
    }
    return swap
  } catch {
    return null
  }
}

/**
 * Parse Uniswap V4 Swap event
 * event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, ...)
 * Positive = tokens sent (in), Negative = tokens received (out)
 * token0 = MON, token1 = AUSD for this pool
 */
function parseUniswapV4Swap(
  id: string,
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const sender = topics[2] ? parseAddress(topics[2].slice(2)) : address
  const hex = cleanHexData(data)

  const amount0 = parseSignedInt256(hex.slice(0, 64))
  const amount1 = parseSignedInt256(hex.slice(64, 128))

  // Positive = sent, Negative = received
  // token0 = MON, token1 = AUSD
  if (amount0 > BigInt(0)) {
    // Sending MON, receiving AUSD
    return {
      id,
      provider: 'uniswap-v4',
      blockNumber,
      timestamp,
      sender,
      amountIn: amount0.toString(),
      amountOut: (-amount1).toString(),
      tokenIn: 'MON',
      tokenOut: 'AUSD',
      txHash: '',
    }
  }
  // Sending AUSD, receiving MON
  return {
    id,
    provider: 'uniswap-v4',
    blockNumber,
    timestamp,
    sender,
    amountIn: amount1.toString(),
    amountOut: (-amount0).toString(),
    tokenIn: 'AUSD',
    tokenOut: 'MON',
    txHash: '',
  }
}

/**
 * Parse PancakeSwap V3 Swap event
 * event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, ...)
 * Positive = tokens sent (in), Negative = tokens received (out)
 * token0 = MON, token1 = AUSD for this pool
 */
function parsePancakeSwapV3Swap(
  id: string,
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const sender = topics[1] ? parseAddress(topics[1].slice(2)) : address
  const recipient = topics[2] ? parseAddress(topics[2].slice(2)) : undefined
  const hex = cleanHexData(data)

  const amount0 = parseSignedInt256(hex.slice(0, 64))
  const amount1 = parseSignedInt256(hex.slice(64, 128))

  if (amount0 > BigInt(0)) {
    return {
      id,
      provider: 'pancakeswap-v3',
      blockNumber,
      timestamp,
      sender,
      recipient,
      amountIn: amount0.toString(),
      amountOut: (-amount1).toString(),
      tokenIn: 'MON',
      tokenOut: 'AUSD',
      txHash: '',
    }
  }
  return {
    id,
    provider: 'pancakeswap-v3',
    blockNumber,
    timestamp,
    sender,
    recipient,
    amountIn: amount1.toString(),
    amountOut: (-amount0).toString(),
    tokenIn: 'AUSD',
    tokenOut: 'MON',
    txHash: '',
  }
}

/**
 * Parse LFJ Swap event
 * event Swap(address indexed sender, address indexed to, uint24 id, bytes32 amountsIn, bytes32 amountsOut, ...)
 * bytes32 layout: [amountY (upper 128 bits) | amountX (lower 128 bits)]
 */
function parseLFJSwap(
  id: string,
  address: string,
  topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const sender = topics[1] ? parseAddress(topics[1].slice(2)) : address
  const recipient = topics[2] ? parseAddress(topics[2].slice(2)) : undefined
  const hex = cleanHexData(data)

  // Data layout: uint24 id (slot 0), bytes32 amountsIn (slot 1), bytes32 amountsOut (slot 2), ...
  const [amountXIn, amountYIn] = parseLFJPackedAmounts(hex.slice(64, 128))
  const [amountXOut, amountYOut] = parseLFJPackedAmounts(hex.slice(128, 192))

  // Determine swap direction based on which token was input
  const isXIn = amountXIn > BigInt(0)

  return {
    id,
    provider: 'lfj',
    blockNumber,
    timestamp,
    sender,
    recipient,
    amountIn: (isXIn ? amountXIn : amountYIn).toString(),
    amountOut: (isXIn ? amountYOut : amountXOut).toString(),
    tokenIn: isXIn ? 'MON' : 'AUSD',
    tokenOut: isXIn ? 'AUSD' : 'MON',
    txHash: '',
  }
}

/**
 * Parse Kuru Trade event
 * event Trade(uint64 orderId, address makerAddress, bool isBuy, uint256 price, uint256 updatedSize, uint256 filledSize, address takerAddress)
 */
function parseKuruTrade(
  id: string,
  _address: string,
  _topics: string[],
  data: string,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const hex = cleanHexData(data)

  const makerAddress = parseAddress(hex.slice(0, 64))
  const isBuy = parseUint(hex.slice(64, 128)) !== BigInt(0)
  const price = parseUint(hex.slice(128, 192))
  const filledSize = parseUint(hex.slice(256, 320))
  const takerAddress = parseAddress(hex.slice(320, 384))

  return {
    id,
    provider: 'kuru',
    blockNumber,
    timestamp,
    sender: takerAddress,
    recipient: makerAddress,
    amountIn: filledSize.toString(),
    amountOut: ((filledSize * price) / BigInt(1e18)).toString(),
    tokenIn: isBuy ? 'AUSD' : 'MON',
    tokenOut: isBuy ? 'MON' : 'AUSD',
    price: price.toString(),
    txHash: '',
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
          { field: 'topics' as const, filter: { values: config.eventTopics } },
        ],
      })),
    [],
  )

  const handleEvent = useCallback((event: SerializableEventData) => {
    if (event.payload.type !== 'TxnLog') return

    const address = event.payload.address.toLowerCase()
    // Topics may come as concatenated string, parse into array
    const topics = parseTopicsString(event.payload.topics as string | string[])

    const matchingConfig = DEX_CONFIGS.find((config) => {
      if (config.contractAddress.toLowerCase() !== address) return false
      return config.eventTopics.every(
        (t, i) => topics[i]?.toLowerCase() === t.toLowerCase(),
      )
    })

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
