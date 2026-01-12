'use client'

import { ArrowLeftRight, Info, Pause, Play, Send } from 'lucide-react'
import { useState } from 'react'
import { LiveBadge } from '@/components/common/live-badge'
import { SectionHeader } from '@/components/ui/section-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSwapEvents } from '@/hooks/use-swap-events'
import { useTransferEvents } from '@/hooks/use-transfer-events'
import { cn } from '@/lib/utils'
import { Swaps } from './swaps'
import { Transfers } from './transfers'

const TAB_TRIGGER_CLASS = cn(
  'mx-1 w-36 flex items-center justify-center gap-2 px-4 py-3',
  'rounded-none border-0 bg-transparent cursor-pointer transition-colors',
  'text-zinc-400 data-[state=active]:text-tracker-active',
  'relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
  'after:bg-transparent data-[state=active]:after:bg-tracker-active',
  'data-[state=active]:bg-transparent data-[state=active]:shadow-none',
)

export function SwapTransferTracker() {
  const { allSwaps, isConnected: isSwapConnected } = useSwapEvents()
  const {
    allTransfers,
    isConnected: isTransferConnected,
    cumulativeTransferred,
  } = useTransferEvents()
  const [isFollowingData, setIsFollowingData] = useState(true)

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Swap & Transfer Tracker"
        description="Live economic activity observed directly from execution events."
      >
        <button
          type="button"
          onClick={() => setIsFollowingData(!isFollowingData)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200 w-fit',
            isFollowingData
              ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white',
          )}
        >
          {isFollowingData ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isFollowingData ? 'Pause' : 'Resume'}
        </button>
      </SectionHeader>

      {/* Info copy - only for mobile */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 md:hidden">
        <Info className="w-4 h-lh" />
        <span>Tap Pause to freeze and scroll through data</span>
      </div>

      <div className="flex flex-col dark-component-colors rounded-xl border overflow-hidden">
        <Tabs defaultValue="transfers" className="w-full">
          <div className="flex flex-col">
            <div className="overflow-x-auto scrollbar-none">
              <TabsList className="w-fit h-auto py-1 px-4 gap-2 bg-transparent rounded-none">
                <TabsTrigger value="transfers" className={TAB_TRIGGER_CLASS}>
                  <Send className="size-4" />
                  <span className="text-sm font-medium">Transfers</span>
                  <LiveBadge isConnected={isTransferConnected} />
                </TabsTrigger>
                <TabsTrigger value="swaps" className={TAB_TRIGGER_CLASS}>
                  <ArrowLeftRight className="size-4" />
                  <span className="text-sm font-medium">Swaps</span>
                  <LiveBadge isConnected={isSwapConnected} />
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="w-full h-px bg-zinc-800" />
          </div>

          <TabsContent value="transfers" className="mt-0">
            <Transfers
              transfers={allTransfers}
              isLoading={!isTransferConnected}
              cumulativeTransferred={cumulativeTransferred}
              isFollowingData={isFollowingData}
            />
          </TabsContent>

          <TabsContent value="swaps" className="mt-0">
            <Swaps
              data={allSwaps}
              isLoading={!isSwapConnected}
              isFollowingData={isFollowingData}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Info copy - only for desktop */}
      <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500">
        <Info className="w-4 h-lh" />
        <span>Hover to pause</span>
      </div>
    </div>
  )
}
