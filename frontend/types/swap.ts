import type { SwapProvider } from '@/constants/swap-provider-config'

/**
 * Normalized swap data structure used across all DEXs
 */
export interface SwapData {
  id: string
  provider: SwapProvider
  txHash: string
  blockNumber: number
  timestamp: number
  sender: string
  recipient?: string
  amountIn: string
  amountOut: string
  tokenIn: string
  tokenOut: string
  tokenInAddress?: string
  tokenOutAddress?: string
  price?: string
}

/**
 * Swap event grouped by provider for UI display
 */
export interface SwapsByProvider {
  provider: SwapProvider
  swaps: SwapData[]
  isLoading: boolean
  error?: string
}
