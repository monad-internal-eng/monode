'use client'

import { AnimatePresence } from 'framer-motion'
import type { TransferData } from '@/types/transfer'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  data: TransferData[]
  isLoading: boolean
}

const TABLE_GRID = 'grid grid-cols-5 gap-6 px-4'

export function Transfers({ data, isLoading }: TransfersProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`${TABLE_GRID} py-3 text-xs font-medium text-zinc-400 border-b border-zinc-800`}
      >
        <span>From</span>
        <span>To</span>
        <span>Amount</span>
        <span>Token</span>
        <span>Time</span>
      </div>

      <div className="h-96 overflow-y-auto scrollbar-none">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              {isLoading ? 'Waiting for events...' : 'No transfers yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {data.map((transfer) => (
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
