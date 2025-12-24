'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useTransferEvents } from '@/hooks/use-transfer-events'
import { cn } from '@/lib/utils'
import { Transfers } from './transfers'

export default function TransferLogsTracker() {
  const { allTransfers, isConnected, clearTransfers } = useTransferEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Transfer Tracker</h2>
          <p className="text-sm text-[#a0a0b0]">
            Real-time native MON and WMON token transfers on Monad.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
              isConnected
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20',
            )}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Connecting</span>
              </>
            )}
          </motion.div>

          <button
            type="button"
            onClick={clearTransfers}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
              'bg-[#2a2a4a]/50 text-zinc-400 hover:text-white hover:bg-[#2a2a4a]',
              'border border-[#2a2a4a]/50 transition-colors',
            )}
            title="Clear all transfers"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <Transfers data={allTransfers} isLoading={!isConnected} />
    </div>
  )
}
