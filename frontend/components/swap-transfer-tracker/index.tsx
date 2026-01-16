'use client'

import { ArrowLeftRight, Pointer, Send } from 'lucide-react'
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
    <div className="w-full flex flex-col">
      <SectionHeader
        title="Live Transaction Log"
        description="Real-time swaps and transfers observed directly from execution events."
      />

      <div className="flex flex-col border-x border-b border-zinc-800 overflow-hidden">
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

        {/* Footer with hover pause info */}
        <div className="flex items-center gap-4 px-6 sm:px-10 py-2.5 border-t border-zinc-800">
          {/* Mobile pause/resume button */}
          <button
            type="button"
            onClick={() => setIsFollowingData(!isFollowingData)}
            className={cn(
              'md:hidden h-9 px-4 py-2 rounded-md font-mono text-sm text-white uppercase cursor-pointer transition-all duration-200',
              isFollowingData
                ? 'bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(23,23,23,0.2)_0%,rgba(163,163,163,0.16)_100%),#0A0A0A] shadow-[0_0_0_1px_rgba(0,0,0,0.8)]'
                : 'bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(110,84,255,0)_0%,rgba(255,255,255,0.12)_100%),#6E54FF] shadow-[0_0_0_1px_rgba(79,71,235,0.9)]',
            )}
          >
            {isFollowingData ? 'Pause' : 'Resume'}
          </button>

          {/* Desktop hover pause info */}
          <div className="hidden md:flex items-center gap-4">
            <Pointer className="w-5 h-5 text-[#52525E]" />
            <span className="text-base text-[#52525E]">
              Hovering on the data stream pauses the update.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
