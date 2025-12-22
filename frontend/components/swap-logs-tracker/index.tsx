'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { SWAP_PROVIDER_CONFIG } from '@/constants/swap-provider-config'
import { useSwapEvents } from '@/hooks/use-swap-events'
import { cn } from '@/lib/utils'
import { ProviderCard } from './provider-card'

export default function SwapLogsTracker() {
  const { swapsByProvider, isConnected, clearSwaps } = useSwapEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Swap Tracker</h2>
          <p className="text-sm text-[#a0a0b0]">
            Real-time swap events from Kuru and Monorail aggregators, Uniswap V4
            and PancakeSwap V3 pools.
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
            onClick={clearSwaps}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
              'bg-[#2a2a4a]/50 text-zinc-400 hover:text-white hover:bg-[#2a2a4a]',
              'border border-[#2a2a4a]/50 transition-colors',
            )}
            title="Clear all swaps"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {swapsByProvider.map((providerData) => (
          <ProviderCard key={providerData.provider} data={providerData} />
        ))}
      </div>
    </div>
  )
}
