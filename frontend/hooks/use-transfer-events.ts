'use client'

import { useCallback, useMemo, useState } from 'react'
import { decodeEventLog, type Hex } from 'viem'
import {
  ERC20_TRANSFER_ABI,
  ERC20_TRANSFER_TOPIC,
  WMON_ADDRESS,
} from '@/constants/transfer-config'
import { useEvents } from '@/hooks/use-events'
import type { SerializableEventData } from '@/types/events'
import type { TransferData } from '@/types/transfer'
import { parseTopicsString } from '@/utils/abi-decode'

const MAX_TRANSFERS = 50

/**
 * Parse native transfer event (TxnCallFrame with non-zero value)
 */
function parseNativeTransfer(
  event: SerializableEventData,
): TransferData | null {
  if (event.payload.type !== 'TxnCallFrame') {
    return null
  }

  const { caller, call_target, value } = event.payload
  const blockNumber = event.block_number ?? 0
  const txnIdx = event.txn_idx ?? 0
  const txHash = event.txn_hash ?? ''

  const id = `native-${blockNumber}-${txnIdx}-${event.seqno}`
  const timestamp = Number(BigInt(event.timestamp_ns) / BigInt(1_000_000))

  return {
    id,
    type: 'native',
    txHash,
    blockNumber,
    timestamp,
    from: caller,
    to: call_target,
    value,
  }
}

/**
 * Parse WMON ERC20 Transfer event
 */
function parseWmonTransfer(event: SerializableEventData): TransferData | null {
  if (event.payload.type !== 'TxnLog') {
    return null
  }

  const { data } = event.payload
  const topicsRaw = parseTopicsString(event.payload.topics as string | string[])
  const topics = topicsRaw as Hex[]
  const dataHex = data as Hex
  const blockNumber = event.block_number ?? 0
  const txnIdx = event.txn_idx ?? 0
  const txHash = event.txn_hash ?? ''

  const id = `wmon-${blockNumber}-${txnIdx}-${event.seqno}`
  const timestamp = Number(BigInt(event.timestamp_ns) / BigInt(1_000_000))

  try {
    const decoded = decodeEventLog({
      abi: ERC20_TRANSFER_ABI,
      data: dataHex,
      topics: topics as [Hex, ...Hex[]],
    })

    const { from, to, value } = decoded.args

    return {
      id,
      type: 'wmon',
      txHash,
      blockNumber,
      timestamp,
      from,
      to,
      value: value.toString(),
    }
  } catch {
    return null
  }
}

/**
 * Hook to subscribe to and process transfer events (native MON + WMON)
 */
export function useTransferEvents() {
  const [allTransfers, setAllTransfers] = useState<TransferData[]>([])
  const [cumulativeTransferred, setCumulativeTransferred] = useState<bigint>(
    BigInt(0),
  )

  const filters = useMemo(
    () => [
      {
        eventName: 'NativeTransfer' as const,
      },
      {
        eventName: 'TxnLog' as const,
        fieldFilters: [
          {
            field: 'address' as const,
            filter: { values: [WMON_ADDRESS.toLowerCase()] },
          },
          {
            field: 'topics' as const,
            filter: { values: [ERC20_TRANSFER_TOPIC] },
          },
        ],
      },
    ],
    [],
  )

  const handleEvent = useCallback((event: SerializableEventData) => {
    let transferData: TransferData | null = null

    if (event.payload.type === 'TxnCallFrame') {
      transferData = parseNativeTransfer(event)
    } else if (event.payload.type === 'TxnLog') {
      const address = event.payload.address.toLowerCase()
      if (address === WMON_ADDRESS.toLowerCase()) {
        transferData = parseWmonTransfer(event)
      }
    }

    if (!transferData) return

    setAllTransfers((prev) => [transferData, ...prev].slice(0, MAX_TRANSFERS))

    // Update cumulative total
    setCumulativeTransferred((prev) => prev + BigInt(transferData.value))
  }, [])

  const { isConnected } = useEvents({
    filters,
    onEvent: handleEvent,
  })

  const clearTransfers = useCallback(() => {
    setAllTransfers([])
    setCumulativeTransferred(BigInt(0))
  }, [])

  return {
    allTransfers,
    isConnected,
    clearTransfers,
    cumulativeTransferred,
  }
}
