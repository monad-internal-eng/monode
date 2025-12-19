import { keccak256, parseAbi, toBytes } from 'viem'

export type DexProvider = 'uniswap-v4' | 'pancakeswap-v3' | 'lfj' | 'kuru'

/**
 * Event ABIs for decoding with viem's decodeEventLog
 */
export const EVENT_ABIS = {
  uniswapV4: parseAbi([
    'event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)',
  ]),
  pancakeswapV3: parseAbi([
    'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint128 protocolFeesToken0, uint128 protocolFeesToken1)',
  ]),
  lfj: parseAbi([
    'event Swap(address indexed sender, address indexed to, uint24 id, bytes32 amountsIn, bytes32 amountsOut, uint24 volatilityAccumulator, bytes32 totalFees, bytes32 protocolFees)',
  ]),
  kuru: parseAbi([
    'event Trade(uint40 orderId, address makerAddress, bool isBuy, uint256 price, uint96 updatedSize, address takerAddress, address txOrigin, uint96 filledSize)',
  ]),
} as const

export interface DexConfig {
  name: string
  shortName: string
  provider: DexProvider
  contractAddress: string
  eventTopics: string[]
  color: string
}

/**
 * Token configuration
 */
export const TOKENS = {
  MON: {
    symbol: 'MON',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000', // Native token
  },
  WMON: {
    symbol: 'WMON',
    decimals: 18,
    address: '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A', // Wrapped MON
  },
  AUSD: {
    symbol: 'AUSD',
    decimals: 6,
    address: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a',
  },
} as const

export type TokenSymbol = keyof typeof TOKENS

export function getTokenDecimals(symbol: string): number {
  if (symbol === 'MON' || symbol === 'WMON') return 18
  if (symbol === 'AUSD') return 6
  return 18 // Default
}

/**
 * Uniswap V4 Swap event signature
 * event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)
 */
const UNISWAP_V4_SWAP_SIGNATURE =
  'Swap(bytes32,address,int128,int128,uint160,uint128,int24,uint24)'

/**
 * PancakeSwap V3 Swap event signature (extended from Uniswap V3 with protocol fees)
 * event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint128 protocolFeesToken0, uint128 protocolFeesToken1)
 */
const PANCAKESWAP_V3_SWAP_SIGNATURE =
  'Swap(address,address,int256,int256,uint160,uint128,int24,uint128,uint128)'

/**
 * LFJ Swap event signature
 * event Swap(address indexed sender, address indexed to, uint24 id, bytes32 amountsIn, bytes32 amountsOut, uint24 volatilityAccumulator, bytes32 totalFees, bytes32 protocolFees)
 */
const LFJ_SWAP_SIGNATURE =
  'Swap(address,address,uint24,bytes32,bytes32,uint24,bytes32,bytes32)'

/**
 * Kuru Trade event signature
 * event Trade(uint40 orderId, address makerAddress, bool isBuy, uint256 price, uint96 updatedSize, address takerAddress, address txOrigin, uint96 filledSize)
 */
const KURU_TRADE_SIGNATURE =
  'Trade(uint40,address,bool,uint256,uint96,address,address,uint96)'

/**
 * DEX configurations for MON/AUSD pair tracking
 */
export const DEX_CONFIGS: DexConfig[] = [
  {
    name: 'Uniswap V4',
    shortName: 'Uni V4',
    provider: 'uniswap-v4',
    contractAddress: '0x188d586ddcf52439676ca21a244753fa19f9ea8e', // Uniswap v4 PoolManager on Monad
    eventTopics: [
      keccak256(toBytes(UNISWAP_V4_SWAP_SIGNATURE)),
      '0xadaf30776f551bccdfb307c3fd8cdec198ca9a852434c8022ee32d1ccedd8219', // MON/AUSD poolId
    ],
    color: '#FF007A',
  },
  {
    name: 'PancakeSwap V3',
    shortName: 'Cake V3',
    provider: 'pancakeswap-v3',
    contractAddress: '0xd5b70d70cbe6c42bcd1aaa662a21673a83f4615b',
    eventTopics: [keccak256(toBytes(PANCAKESWAP_V3_SWAP_SIGNATURE))],
    color: '#1FC7D4',
  },
  {
    name: 'LFJ',
    shortName: 'LFJ',
    provider: 'lfj',
    contractAddress: '0xdd0a93642B0e1e938a75B400f31095Af4C4BECE5',
    eventTopics: [keccak256(toBytes(LFJ_SWAP_SIGNATURE))],
    color: '#E84142',
  },
  {
    name: 'Kuru',
    shortName: 'Kuru',
    provider: 'kuru',
    contractAddress: '0xf39c4fD5465Ea2dD7b0756CeBC48a258b34FeBf3',
    eventTopics: [keccak256(toBytes(KURU_TRADE_SIGNATURE))],
    color: '#836EF9',
  },
]

/**
 * Get DEX config by provider
 */
export function getDexConfigByProvider(
  provider: DexProvider,
): DexConfig | undefined {
  return DEX_CONFIGS.find((config) => config.provider === provider)
}

/**
 * Get all contract addresses for filtering
 */
export function getAllDexContractAddresses(): string[] {
  return DEX_CONFIGS.map((config) => config.contractAddress.toLowerCase())
}

/**
 * Get all event topics for filtering
 */
export function getAllSwapEventTopics(): string[][] {
  return DEX_CONFIGS.map((config) => config.eventTopics)
}
