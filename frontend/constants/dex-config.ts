import { keccak256, toBytes } from 'viem'

export type DexProvider = 'uniswap-v4' | 'pancakeswap-v3' | 'lfj' | 'kuru'

export interface DexConfig {
  name: string
  shortName: string
  provider: DexProvider
  contractAddress: string
  poolAddress?: string
  eventSignature: string
  eventTopic: string
  color: string
  explorerUrl: string
}

/**
 * Token addresses on Monad
 */
export const TOKEN_ADDRESSES = {
  MON: '0x0000000000000000000000000000000000000000', // Native token
  AUSD: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a',
} as const

/**
 * Uniswap V4 Swap event signature
 * event Swap(PoolId indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)
 */
const UNISWAP_V4_SWAP_SIGNATURE =
  'Swap(bytes32,address,int128,int128,uint160,uint128,int24,uint24)'

/**
 * PancakeSwap V3 / Uniswap V3 Swap event signature
 * event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)
 */
const PANCAKESWAP_V3_SWAP_SIGNATURE =
  'Swap(address,address,int256,int256,uint160,uint128,int24)'

/**
 * LFJ (Trader Joe V2) Swap event signature
 * event Swap(address indexed sender, address indexed to, uint24 id, bytes32 amountsIn, bytes32 amountsOut, uint24 volatilityAccumulator, bytes32 totalFees, bytes32 protocolFees)
 */
const LFJ_SWAP_SIGNATURE =
  'Swap(address,address,uint24,bytes32,bytes32,uint24,bytes32,bytes32)'

/**
 * Kuru Trade event signature
 * event Trade(uint64 orderId, address makerAddress, bool isBuy, uint256 price, uint256 updatedSize, uint256 filledSize, address takerAddress)
 */
const KURU_TRADE_SIGNATURE =
  'Trade(uint64,address,bool,uint256,uint256,uint256,address)'

/**
 * DEX configurations for MON/AUSD pair tracking
 */
export const DEX_CONFIGS: DexConfig[] = [
  {
    name: 'Uniswap V4',
    shortName: 'Uni V4',
    provider: 'uniswap-v4',
    contractAddress:
      '0xadaf30776f551bccdfb307c3fd8cdec198ca9a852434c8022ee32d1ccedd8219',
    eventSignature: UNISWAP_V4_SWAP_SIGNATURE,
    eventTopic: keccak256(toBytes(UNISWAP_V4_SWAP_SIGNATURE)),
    color: '#FF007A',
    explorerUrl: 'https://monadvision.com',
  },
  {
    name: 'PancakeSwap V3',
    shortName: 'Cake V3',
    provider: 'pancakeswap-v3',
    contractAddress: '0xd5b70d70cbe6c42bcd1aaa662a21673a83f4615b',
    eventSignature: PANCAKESWAP_V3_SWAP_SIGNATURE,
    eventTopic: keccak256(toBytes(PANCAKESWAP_V3_SWAP_SIGNATURE)),
    color: '#1FC7D4',
    explorerUrl: 'https://monadvision.com',
  },
  {
    name: 'LFJ (Trader Joe)',
    shortName: 'LFJ',
    provider: 'lfj',
    contractAddress: '0xdd0a93642B0e1e938a75B400f31095Af4C4BECE5',
    eventSignature: LFJ_SWAP_SIGNATURE,
    eventTopic: keccak256(toBytes(LFJ_SWAP_SIGNATURE)),
    color: '#E84142',
    explorerUrl: 'https://monadvision.com',
  },
  {
    name: 'Kuru',
    shortName: 'Kuru',
    provider: 'kuru',
    contractAddress: '0x0990a54d7abcaa35ac03814f5ed5c6afbbf45ac9',
    eventSignature: KURU_TRADE_SIGNATURE,
    eventTopic: keccak256(toBytes(KURU_TRADE_SIGNATURE)),
    color: '#836EF9',
    explorerUrl: 'https://monadvision.com',
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
export function getAllSwapEventTopics(): string[] {
  return DEX_CONFIGS.map((config) => config.eventTopic)
}
