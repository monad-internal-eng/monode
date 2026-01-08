'use client'

import { ArrowLeftRight, Pause, Play, Send } from 'lucide-react'
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

export default function SwapTransferTracker() {
  const { allSwaps, isConnected: isSwapConnected } = useSwapEvents()
  const {
    allTransfers,
    isConnected: isTransferConnected,
    cumulativeTransferred,
  } = useTransferEvents()
  const [isFollowingChain, setIsFollowingChain] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const isPaused = !isFollowingChain || isHovering

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Swap & Transfer Tracker"
        description="Live economic activity observed directly from execution events."
      >
        <button
          type="button"
          onClick={() => setIsFollowingChain(!isFollowingChain)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200 w-fit',
            isFollowingChain
              ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
              : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white',
          )}
        >
          {isFollowingChain ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {isFollowingChain ? 'Pause' : 'Resume'}
        </button>
      </SectionHeader>

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

          <TabsContent value="transfers" className="mt-0">
            <button
              type="button"
              className="flex-1 p-0 m-0 w-full"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Transfers
                transfers={allTransfers}
                isLoading={!isTransferConnected}
                cumulativeTransferred={cumulativeTransferred}
                isFollowing={!isPaused}
              />
            </button>
          </TabsContent>

          <TabsContent
            value="swaps"
            className="mt-0 overflow-x-auto scrollbar-none"
          >
            <button
              type="button"
              className="flex-1 p-0 m-0 w-full"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Swaps
                data={allSwaps}
                isLoading={!isSwapConnected}
                isFollowing={!isPaused}
              />
            </button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
