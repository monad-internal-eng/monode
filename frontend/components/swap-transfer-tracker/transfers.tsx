'use client'

import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { CumulativeTransferCounter } from './cumulative-transfer-counter'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  transfers: TransferData[]
  isLoading: boolean
  cumulativeTransferred: bigint
}

const TABLE_GRID = 'grid grid-cols-6 gap-6 px-4'

export function Transfers({
  transfers,
  isLoading,
  cumulativeTransferred,
}: TransfersProps) {
  return (
    <div className="flex flex-col min-w-179.5 md:min-w-0">
      <CumulativeTransferCounter
        cumulativeTransferred={cumulativeTransferred}
      />

      <div
        className={cn(
          'py-3 text-xs font-medium text-zinc-400 border-b border-zinc-800',
          TABLE_GRID,
        )}
      >
        <span>Transaction Hash</span>
        <span>From</span>
        <span>To</span>
        <span>Amount</span>
        <span>Token</span>
        <span>Time</span>
      </div>

      <div className="h-96 overflow-y-auto scrollbar-none">
        {transfers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              {isLoading ? 'Waiting for events...' : 'No transfers yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {transfers.map((transfer) => (
              <TransferRow
                key={transfer.id}
                transfer={transfer}
                gridClass={TABLE_GRID}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
