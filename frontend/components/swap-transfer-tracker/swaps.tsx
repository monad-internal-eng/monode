'use client'

import { AnimatePresence } from 'framer-motion'
import type { SwapData } from '@/types/swap'
import { SwapRow } from './swap-row'

interface SwapsProps {
  data: SwapData[]
  isLoading: boolean
}

const TABLE_GRID = 'grid grid-cols-5 gap-6 px-4'

export function Swaps({ data, isLoading }: SwapsProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`${TABLE_GRID} py-3 text-xs font-medium text-zinc-400 border-b border-zinc-800`}
      >
        <span>From Token</span>
        <span>To Token</span>
        <span>Provider</span>
        <span>Sender</span>
        <span>Time</span>
      </div>

      <div className="h-96 overflow-y-auto scrollbar-none">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400">
              {isLoading ? 'Waiting for events...' : 'No swaps yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {data.map((swap) => (
              <SwapRow key={swap.id} swap={swap} gridClass={TABLE_GRID} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
