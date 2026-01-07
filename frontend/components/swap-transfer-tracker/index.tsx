'use client'

import { ArrowLeftRight, Send } from 'lucide-react'
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

export default function SwapTransferTracker() {
  const { allSwaps, isConnected: isSwapConnected } = useSwapEvents()
  const {
    allTransfers,
    isConnected: isTransferConnected,
    cumulativeTransferred,
  } = useTransferEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Swap & Transfer Tracker"
        description="Live economic activity observed directly from execution events."
      />

      <div className="flex flex-col dark-component-colors rounded-xl border overflow-hidden">
        <Tabs defaultValue="transfers" className="w-full">
          <div className="flex flex-col">
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
            <div className="mt-1 w-full h-px bg-zinc-800" />
          </div>

          <TabsContent
            value="transfers"
            className="mt-0 overflow-x-auto scrollbar-none"
          >
            <Transfers
              transfers={allTransfers}
              isLoading={!isTransferConnected}
              cumulativeTransferred={cumulativeTransferred}
            />
          </TabsContent>

          <TabsContent
            value="swaps"
            className="mt-0 overflow-x-auto scrollbar-none"
          >
            <Swaps data={allSwaps} isLoading={!isSwapConnected} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
