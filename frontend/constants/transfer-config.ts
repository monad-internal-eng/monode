import { keccak256, parseAbi, toBytes } from 'viem'

/**
 * WMON (Wrapped MON) token contract address on Monad
 */
export const WMON_ADDRESS = '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A'

/**
 * AUSD token contract address on Monad
 */
export const AUSD_ADDRESS = '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a'

/**
 * ERC20 Transfer event signature and topic
 */
export const ERC20_TRANSFER_SIGNATURE = 'Transfer(address,address,uint256)'
export const ERC20_TRANSFER_TOPIC = keccak256(toBytes(ERC20_TRANSFER_SIGNATURE))

/**
 * ABI for ERC20 Transfer event
 */
export const ERC20_TRANSFER_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
])

/**
 * Transfer type display configuration
 */
export interface TransferTypeConfig {
  name: string
  color: string
}

export const TRANSFER_TYPE_CONFIG: Record<string, TransferTypeConfig> = {
  native: {
    name: 'MON',
    color: 'var(--color-purple-primary)',
  },
  wmon: {
    name: 'WMON',
    color: 'var(--color-green-primary)',
  },
}

export function getTransferTypeConfig(
  type: string,
): TransferTypeConfig | undefined {
  return TRANSFER_TYPE_CONFIG[type]
}
