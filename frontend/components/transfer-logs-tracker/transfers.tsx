'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { TransferData } from '@/types/transfer'
import { TransferRow } from './transfer-row'

interface TransfersProps {
  data: TransferData[]
  isLoading: boolean
  className?: string
}

export function Transfers({ data, isLoading }: TransfersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col rounded-xl overflow-hidden',
        'bg-[#16162a]/80 border border-[#2a2a4a]/50',
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a4a]/50">
        <h3 className="text-sm font-semibold text-white">Transfers</h3>
      </div>

      <div className="p-2 h-[220px] overflow-y-auto scrollbar-none">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-zinc-500 text-center">
              {isLoading ? 'Waiting for events...' : 'No transfers yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence mode="popLayout">
              {data.map((transfer) => (
                <TransferRow key={transfer.id} transfer={transfer} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
