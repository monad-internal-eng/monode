'use client'

import { LiveBadge } from '@/components/common/live-badge'
import { useEventsContext } from '@/contexts/events-context'

/**
 * Dashboard header for the Monad State Contention Explorer.
 */
export function DashboardHeader() {
  const { isConnected } = useEventsContext()

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl sm:text-5xl font-bold font-britti-sans text-white leading-tight">
            State Contention Explorer
          </h1>
          <LiveBadge isConnected={isConnected} />
        </div>
        <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-3xl">
          Real-time parallel execution contention intelligence for Monad.
          Analyzes storage access patterns to surface state conflicts,
          execution dependencies, and parallel efficiency metrics.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <span>Powered by Monad Execution Events SDK</span>
        <span>&middot;</span>
        <span>Built by Huginn</span>
      </div>
    </div>
  )
}
