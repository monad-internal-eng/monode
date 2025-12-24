/**
 * Transfer type - native MON or WMON (ERC20)
 */
export type TransferType = 'native' | 'wmon'

/**
 * Normalized transfer data structure
 */
export interface TransferData {
  id: string
  type: TransferType
  txHash: string
  blockNumber: number
  timestamp: number
  from: string
  to: string
  value: string
}
