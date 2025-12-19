'use client'

import { useCallback, useMemo, useState } from 'react'
import { decodeEventLog, type Hex } from 'viem'
import {
  DEX_CONFIGS,
  type DexProvider,
  EVENT_ABIS,
} from '@/constants/dex-config'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'
import type { SwapData, SwapsByProvider } from '@/types/swap'
import { parseTopicsString } from '@/utils/abi-decode'

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

  const { data } = event.payload
  const topicsRaw = parseTopicsString(event.payload.topics as string | string[])
  const topics = topicsRaw as Hex[]
  const dataHex = data as Hex
  const blockNumber = event.block_number ?? 0
  const txnIdx = event.txn_idx ?? 0
  const txHash = event.txn_hash

  const id = `${blockNumber}-${txnIdx}-${event.seqno}`
  const timestamp = Number(BigInt(event.timestamp_ns) / BigInt(1_000_000))

  try {
    let swap: SwapData | null = null
    switch (provider) {
      case 'uniswap-v4':
        swap = parseUniswapV4Swap(id, topics, dataHex, blockNumber, timestamp)
        break
      case 'pancakeswap-v3':
        swap = parsePancakeSwapV3Swap(
          id,
          topics,
          dataHex,
          blockNumber,
          timestamp,
        )
        break
      case 'lfj':
        swap = parseLFJSwap(id, topics, dataHex, blockNumber, timestamp)
        break
      case 'kuru':
        swap = parseKuruTrade(id, topics, dataHex, blockNumber, timestamp)
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
 * Parse Uniswap V4 Swap event using viem's decodeEventLog
 * Positive = tokens sent (in), Negative = tokens received (out)
 * token0 = MON, token1 = AUSD for this pool
 */
function parseUniswapV4Swap(
  id: string,
  topics: Hex[],
  data: Hex,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const decoded = decodeEventLog({
    abi: EVENT_ABIS.uniswapV4,
    data,
    topics: topics as [Hex, ...Hex[]],
  })

  const { sender, amount0, amount1 } = decoded.args

  if (amount0 > BigInt(0)) {
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
 * Parse PancakeSwap V3 Swap event using viem's decodeEventLog
 * Positive amount = tokens going INTO pool (user sends), Negative = tokens going OUT of pool (user receives)
 * Pool is AUSD/WMON: token0 = AUSD (6 decimals), token1 = WMON (18 decimals)
 */
function parsePancakeSwapV3Swap(
  id: string,
  topics: Hex[],
  data: Hex,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const decoded = decodeEventLog({
    abi: EVENT_ABIS.pancakeswapV3,
    data,
    topics: topics as [Hex, ...Hex[]],
  })

  const { sender, recipient, amount0, amount1 } = decoded.args
  const isSellingAUSD = amount0 > BigInt(0)

  return {
    id,
    provider: 'pancakeswap-v3',
    blockNumber,
    timestamp,
    sender,
    recipient,
    amountIn: isSellingAUSD ? amount0.toString() : amount1.toString(),
    amountOut: isSellingAUSD ? (-amount1).toString() : (-amount0).toString(),
    tokenIn: isSellingAUSD ? 'AUSD' : 'WMON',
    tokenOut: isSellingAUSD ? 'WMON' : 'AUSD',
    txHash: '',
  }
}

/**
 * Parse LFJ Swap event using viem's decodeEventLog
 * bytes32 layout: [amountY (upper 128 bits) | amountX (lower 128 bits)]
 */
function parseLFJSwap(
  id: string,
  topics: Hex[],
  data: Hex,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const decoded = decodeEventLog({
    abi: EVENT_ABIS.lfj,
    data,
    topics: topics as [Hex, ...Hex[]],
  })

  const { sender, to, amountsIn, amountsOut } = decoded.args

  // Parse packed bytes32: upper 128 bits = amountY, lower 128 bits = amountX
  const parsePackedAmounts = (packed: Hex): [bigint, bigint] => {
    const val = BigInt(packed)
    const amountX = val & ((BigInt(1) << BigInt(128)) - BigInt(1))
    const amountY = val >> BigInt(128)
    return [amountX, amountY]
  }

  const [amountXIn, amountYIn] = parsePackedAmounts(amountsIn)
  const [amountXOut, amountYOut] = parsePackedAmounts(amountsOut)
  const isXIn = amountXIn > BigInt(0)

  return {
    id,
    provider: 'lfj',
    blockNumber,
    timestamp,
    sender,
    recipient: to,
    amountIn: (isXIn ? amountXIn : amountYIn).toString(),
    amountOut: (isXIn ? amountYOut : amountXOut).toString(),
    tokenIn: isXIn ? 'MON' : 'AUSD',
    tokenOut: isXIn ? 'AUSD' : 'MON',
    txHash: '',
  }
}

/**
 * Parse Kuru Trade event using viem's decodeEventLog
 *
 * Kuru precision (from docs):
 * - price: constant precision of 1e18 (raw_price = price / 1e18)
 * - filledSize: in size_precision (market-specific, queried via getMarketParams())
 * - isBuy: true = market buy (taker buying base), false = market sell (taker selling base)
 *
 * Formulas from Kuru docs:
 * - base_raw = filledSize / size_precision
 * - quote_raw = price * filledSize / (size_precision * 1e18)
 *
 * For MON/AUSD market, size_precision = 1e6
 */
function parseKuruTrade(
  id: string,
  topics: Hex[],
  data: Hex,
  blockNumber: number,
  timestamp: number,
): SwapData {
  const decoded = decodeEventLog({
    abi: EVENT_ABIS.kuru,
    data,
    topics: topics as [Hex, ...Hex[]],
  })

  const { makerAddress, isBuy, price, takerAddress, filledSize } = decoded.args

  // size_precision = 1e6 for this market
  const SIZE_PRECISION = BigInt(1e6)
  const baseAmountWei = (filledSize * BigInt(1e18)) / SIZE_PRECISION
  const quoteAmountSmallest =
    (price * filledSize * BigInt(1e6)) / (SIZE_PRECISION * BigInt(1e18))

  return {
    id,
    provider: 'kuru',
    blockNumber,
    timestamp,
    sender: takerAddress,
    recipient: makerAddress,
    amountIn: isBuy ? quoteAmountSmallest.toString() : baseAmountWei.toString(),
    amountOut: isBuy
      ? baseAmountWei.toString()
      : quoteAmountSmallest.toString(),
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
