'use client'

import { Pointer } from 'lucide-react'
import { useState } from 'react'
import { LiveDot } from '@/components/ui/live-dot'
import { SectionHeader } from '@/components/ui/section-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSwapEvents } from '@/hooks/use-swap-events'
import { useTransferEvents } from '@/hooks/use-transfer-events'
import { cn } from '@/lib/utils'
import { Swaps } from './swaps'
import { Transfers } from './transfers'

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
        titleAdornment={isSwapConnected && isTransferConnected && <LiveDot />}
        description="Real-time swaps and transfers observed directly from execution events."
      />

      <div className="flex flex-col border-b border-zinc-800 overflow-hidden">
        <Tabs defaultValue="transfers" className="w-full">
          <div className="flex flex-col">
            <div className="flex items-center justify-between overflow-x-auto scrollbar-none">
              <TabsList className="mx-6 my-4 sm:mx-10 sm:my-6">
                <TabsTrigger value="transfers">Transfers</TabsTrigger>
                <TabsTrigger value="swaps">Swaps</TabsTrigger>
              </TabsList>
            </div>
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
