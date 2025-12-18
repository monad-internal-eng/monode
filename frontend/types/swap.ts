import type { DexProvider } from '@/constants/dex-config'

/**
 * Normalized swap data structure used across all DEXs
 */
export interface SwapData {
  id: string
  provider: DexProvider
  txHash: string
  blockNumber: number
  timestamp: number
  sender: string
  recipient?: string
  amountIn: string
  amountOut: string
  tokenIn: string
  tokenOut: string
  price?: string
}

/**
 * Raw Uniswap V4 Swap event data
 * event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)
 */
export interface UniswapV4SwapEvent {
  poolId: string
  sender: string
  amount0: bigint
  amount1: bigint
  sqrtPriceX96: bigint
  liquidity: bigint
  tick: number
  fee: number
}

/**
 * Raw PancakeSwap V3 Swap event data
 * event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
 */
export interface PancakeSwapV3SwapEvent {
  sender: string
  recipient: string
  amount0: bigint
  amount1: bigint
  sqrtPriceX96: bigint
  liquidity: bigint
  tick: number
}

/**
 * Raw LFJ Swap event data
 * event Swap(address indexed sender, address indexed to, uint24 id, bytes32 amountsIn, bytes32 amountsOut, uint24 volatilityAccumulator, bytes32 totalFees, bytes32 protocolFees)
 */
export interface LFJSwapEvent {
  sender: string
  to: string
  id: number
  amountsIn: string
  amountsOut: string
  volatilityAccumulator: number
  totalFees: string
  protocolFees: string
}

/**
 * Raw Kuru Trade event data
 * event Trade(uint64 orderId, address makerAddress, bool isBuy, uint256 price, uint256 updatedSize, uint256 filledSize, address takerAddress)
 */
export interface KuruTradeEvent {
  orderId: bigint
  makerAddress: string
  isBuy: boolean
  price: bigint
  updatedSize: bigint
  filledSize: bigint
  takerAddress: string
}

/**
 * Swap event grouped by provider for UI display
 */
export interface SwapsByProvider {
  provider: DexProvider
  swaps: SwapData[]
  isLoading: boolean
  error?: string
}
