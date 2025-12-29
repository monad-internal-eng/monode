'use client'

import { ArrowLeftRight } from 'lucide-react'
import { LiveIndicator } from '@/components/ui/live-indicator'
import { SectionHeader } from '@/components/ui/section-header'
import { useSwapEvents } from '@/hooks/use-swap-events'
import { Swaps } from './swaps'

export default function SwapLogsTracker() {
  const { allSwaps, isConnected } = useSwapEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Swap Tracker"
        description="Real-time swap events from Kuru and Monorail aggregators, Uniswap V4 and PancakeSwap V3 pools."
      />

      <div className="flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-white">Swaps</span>
          <LiveIndicator isConnected={isConnected} />
        </div>
        <Swaps data={allSwaps} isLoading={!isConnected} />
      </div>

      <p className="text-xs text-zinc-500">
        Swaps highlight DEX activity across multiple protocols.
      </p>
    </div>
  )
}
