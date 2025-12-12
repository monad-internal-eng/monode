/**
 * Transaction types for the tracker visualization
 */

export interface Transaction {
  id: number
  txnIndex: number
  txnHash?: string
  startTimestamp?: string
  endTimestamp?: string
  transactionTime?: number // time between transaction start and transaction end - execution time of a transaction in ms
  status?: boolean
  gasUsed?: number
  gasLimit?: number
  sender?: string
  to?: string
}
