'use client'

import { useState } from 'react'
import { LiveDot } from '@/components/ui/live-dot'
import { SectionHeader } from '@/components/ui/section-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSwapEvents } from '@/hooks/use-swap-events'
import { useTransferEvents } from '@/hooks/use-transfer-events'
import { HoverPauseFooter } from '../common/hover-pause-footer'
import { PauseResumeControl } from '../common/pause-resume-control'
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
            {/* Mobile: Pause/Resume button */}
            <div className="md:hidden pl-6 pb-6">
              <PauseResumeControl
                isFollowingChain={isFollowingData}
                onToggle={() => setIsFollowingData(!isFollowingData)}
              />
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

        <HoverPauseFooter label="Hovering on the tables pauses the update." />
      </div>
    </div>
  )
}
