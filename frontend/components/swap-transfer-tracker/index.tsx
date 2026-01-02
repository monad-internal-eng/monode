'use client'

import { ArrowLeftRight, Send } from 'lucide-react'
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

function LiveBadge({ isConnected }: { isConnected: boolean }) {
  return (
    <span
      className={cn(
        'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
        isConnected
          ? 'bg-tracker-active/10 text-tracker-active'
          : 'bg-zinc-500/10 text-zinc-400',
      )}
    >
      <span className="relative flex size-1.5">
        {isConnected && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-tracker-active opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex size-1.5 rounded-full',
            isConnected ? 'bg-tracker-active' : 'bg-zinc-500',
          )}
        />
      </span>
      Live
    </span>
  )
}

export default function SwapTransferTracker() {
  const { allSwaps, isConnected: isSwapConnected } = useSwapEvents()
  const { allTransfers, isConnected: isTransferConnected } = useTransferEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Swap & Transfer Tracker"
        description="Live economic activity observed directly from execution events."
      />

      <div className="flex flex-col bg-tracker-bg rounded-xl border border-zinc-800 overflow-hidden">
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

          <TabsContent value="transfers" className="mt-0">
            <Transfers data={allTransfers} isLoading={!isTransferConnected} />
          </TabsContent>

          <TabsContent value="swaps" className="mt-0">
            <Swaps data={allSwaps} isLoading={!isSwapConnected} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
