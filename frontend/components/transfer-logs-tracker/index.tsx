'use client'

import { Send } from 'lucide-react'
import { LiveIndicator } from '@/components/ui/live-indicator'
import { SectionHeader } from '@/components/ui/section-header'
import { useTransferEvents } from '@/hooks/use-transfer-events'
import { Transfers } from './transfers'

export default function TransferLogsTracker() {
  const { allTransfers, isConnected } = useTransferEvents()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Transfer Tracker"
        description="Live economic activity observed directly from execution events."
      />

      <div className="flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <Send className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Transfers</span>
          <LiveIndicator isConnected={isConnected} />
        </div>
        <Transfers data={allTransfers} isLoading={!isConnected} />
      </div>

      <p className="text-xs text-zinc-500">Transfers highlight throughput.</p>
    </div>
  )
}
