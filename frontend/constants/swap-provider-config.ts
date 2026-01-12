import { keccak256, parseAbi, toBytes } from 'viem'
import tokenList from '@/data/token-list.json'

export type SwapProvider =
  | 'kuru'
  | 'monorail'
  | 'uniswap-v4'
  | 'pancakeswap-v3'
  | 'kyberswap'
  | 'openocean'

export const EVENT_ABIS = {
  monorail: parseAbi([
    'event Aggregated(address indexed sender, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 protocolFeeAmount, uint256 referrerFeeAmount, uint64 referrer, uint64 quote)',
  ]),
  uniswapV4: parseAbi([
    'event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)',
  ]),
  pancakeswapV3: parseAbi([
    'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint128 protocolFeesToken0, uint128 protocolFeesToken1)',
  ]),
  kuru: parseAbi([
    'event KuruFlowSwap(address indexed user, address indexed referrer, address tokenIn, address tokenOut, bool isFeeInInput, uint256 amountIn, uint256 amountOut, uint256 referrerFeeBps, uint256 totalFeeBps)',
  ]),
  kyberswap: parseAbi([
    'event Swapped(address sender, address srcToken, address dstToken, address dstReceiver, uint256 spentAmount, uint256 returnAmount)',
  ]),
  openocean: parseAbi([
    'event Swapped(address indexed sender, address indexed srcToken, address indexed dstToken, address dstReceiver, uint256 amount, uint256 spentAmount, uint256 returnAmount, uint256 minReturnAmount, uint256 guaranteedAmount, address referrer)',
  ]),
} as const

export interface SwapProviderConfig {
  name: string
  provider: SwapProvider
  contractAddress: string
  eventTopics: string[]
  color: string
}

// Token lookup from token-list.json
interface TokenInfo {
  symbol: string
  decimals: number
}

const tokensByAddress = new Map<string, TokenInfo>(
  tokenList.tokens.map((t) => [
    t.address.toLowerCase(),
    { symbol: t.symbol, decimals: t.decimals },
  ]),
)

export function getTokenByAddress(address: string): TokenInfo | undefined {
  return tokensByAddress.get(address.toLowerCase())
}

export function getTokenDecimals(symbolOrAddress: string): number {
  const byAddress = tokensByAddress.get(symbolOrAddress.toLowerCase())
  if (byAddress) return byAddress.decimals
  if (symbolOrAddress === 'MON' || symbolOrAddress === 'WMON') return 18
  if (symbolOrAddress === 'AUSD') return 6
  return 18
}

const KURU_SWAP_SIGNATURE =
  'KuruFlowSwap(address,address,address,address,bool,uint256,uint256,uint256,uint256)'
const MONORAIL_SWAP_SIGNATURE =
  'Aggregated(address,address,address,uint256,uint256,uint256,uint256,uint64,uint64)'
const UNISWAP_V4_SWAP_SIGNATURE =
  'Swap(bytes32,address,int128,int128,uint160,uint128,int24,uint24)'
const PANCAKESWAP_V3_SWAP_SIGNATURE =
  'Swap(address,address,int256,int256,uint160,uint128,int24,uint128,uint128)'
const KYBERSWAP_SWAP_SIGNATURE =
  'Swapped(address,address,address,address,uint256,uint256)'
const OPENOCEAN_SWAP_SIGNATURE =
  'Swapped(address,address,address,address,uint256,uint256,uint256,uint256,uint256,address)'

export const SWAP_PROVIDER_CONFIG: SwapProviderConfig[] = [
  {
    name: 'Monorail',
    provider: 'monorail',
    contractAddress: '0xA68A7F0601effDc65C64d9C47cA1b18D96B4352c',
    eventTopics: [keccak256(toBytes(MONORAIL_SWAP_SIGNATURE))],
    color: 'var(--color-green-primary)',
  },
  {
    name: 'Uniswap V4',
    provider: 'uniswap-v4',
    contractAddress: '0x188d586ddcf52439676ca21a244753fa19f9ea8e',
    eventTopics: [
      keccak256(toBytes(UNISWAP_V4_SWAP_SIGNATURE)),
      '0xadaf30776f551bccdfb307c3fd8cdec198ca9a852434c8022ee32d1ccedd8219', // MON/AUSD poolId
    ],
    color: 'var(--color-pink-primary)',
  },
  {
    name: 'PancakeSwap V3',
    provider: 'pancakeswap-v3',
    contractAddress: '0xd5b70d70cbe6c42bcd1aaa662a21673a83f4615b',
    eventTopics: [keccak256(toBytes(PANCAKESWAP_V3_SWAP_SIGNATURE))],
    color: 'var(--color-cyan-primary)',
  },
  {
    name: 'Kuru',
    provider: 'kuru',
    contractAddress: '0xb3e6778480b2E488385E8205eA05E20060B813cb',
    eventTopics: [keccak256(toBytes(KURU_SWAP_SIGNATURE))],
    color: 'var(--color-purple-primary)',
  },
  {
    name: 'KyberSwap',
    provider: 'kyberswap',
    contractAddress: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    eventTopics: [keccak256(toBytes(KYBERSWAP_SWAP_SIGNATURE))],
    color: 'var(--color-magenta-primary)',
  },
  {
    name: 'OpenOcean',
    provider: 'openocean',
    contractAddress: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    eventTopics: [keccak256(toBytes(OPENOCEAN_SWAP_SIGNATURE))],
    color: 'var(--color-blue-primary)',
  },
]

export function getSwapProviderConfig(
  provider: SwapProvider,
): SwapProviderConfig | undefined {
  return SWAP_PROVIDER_CONFIG.find((config) => config.provider === provider)
}
