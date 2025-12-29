'use client'

import { AnimatePresence } from 'framer-motion'
import type { TransferData } from '@/types/transfer'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  data: TransferData[]
  isLoading: boolean
}

export function Transfers({ data, isLoading }: TransfersProps) {
  return (
    <div className="flex flex-col">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_1fr_1fr_100px_120px] gap-4 px-4 py-3 text-xs font-medium text-zinc-500 border-b border-zinc-800">
        <span>From</span>
        <span>To</span>
        <span>Amount</span>
        <span>Token</span>
        <span>Time</span>
      </div>

      {/* Table body */}
      <div className="h-[400px] overflow-y-auto scrollbar-none">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-500 text-center">
              {isLoading ? 'Waiting for events...' : 'No transfers yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {data.map((transfer) => (
                <TransferRow key={transfer.id} transfer={transfer} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
