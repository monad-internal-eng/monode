'use client'

import { ArrowLeftRight } from 'lucide-react'
import { useSwapEvents } from '@/hooks/use-swap-events'
import { cn } from '@/lib/utils'
import { Swaps } from './swaps'

export default function SwapLogsTracker() {
  const { allSwaps, isConnected } = useSwapEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="font-britti-sans text-2xl sm:text-[30px] font-medium leading-none text-white">
            Swap Tracker
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2 leading-6">
            Real-time swap events from Kuru and Monorail aggregators, Uniswap V4
            and PancakeSwap V3 pools.
          </p>
        </div>
      </div>

      {/* Table with tab header */}
      <div className="flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Tab header */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">Swaps</span>
            <span
              className={cn(
                'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                isConnected
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-zinc-500/10 text-zinc-400',
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                )}
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-1.5 w-1.5',
                    isConnected ? 'bg-green-500' : 'bg-zinc-500',
                  )}
                />
              </span>
              Live
            </span>
          </div>
        </div>

        {/* Table content */}
        <Swaps data={allSwaps} isLoading={!isConnected} />
      </div>

      {/* Footer note */}
      <p className="text-xs text-zinc-500">
        Swaps highlight DEX activity across multiple protocols.
      </p>
    </div>
  )
}
