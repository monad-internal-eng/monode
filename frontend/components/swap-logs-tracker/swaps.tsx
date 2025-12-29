'use client'

import { AnimatePresence } from 'framer-motion'
import type { SwapData } from '@/types/swap'
import { SwapRow } from './swap-row'

interface SwapsProps {
  data: SwapData[]
  isLoading: boolean
}

export function Swaps({ data, isLoading }: SwapsProps) {
  return (
    <div className="flex flex-col">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_1fr_100px_100px_120px] gap-4 px-4 py-3 text-xs font-medium text-zinc-500 border-b border-zinc-800">
        <span>From Token</span>
        <span>To Token</span>
        <span>Provider</span>
        <span>Sender</span>
        <span>Time</span>
      </div>

      {/* Table body */}
      <div className="h-[400px] overflow-y-auto scrollbar-none">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-500 text-center">
              {isLoading ? 'Waiting for events...' : 'No swaps yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence mode="popLayout">
              {data.map((swap) => (
                <SwapRow key={swap.id} swap={swap} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
