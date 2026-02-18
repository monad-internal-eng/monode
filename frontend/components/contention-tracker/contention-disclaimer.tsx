'use client'

import { Info } from 'lucide-react'

/**
 * Transparency disclaimer explaining the inference methodology.
 * This is critical for credibility - clearly states what we can
 * and cannot measure directly from the Execution Events SDK.
 */
export function ContentionDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-5 py-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
      <div className="flex flex-col gap-1">
        <p className="text-sm text-zinc-400 leading-relaxed">
          Contention metrics are{' '}
          <span className="text-zinc-300 font-medium">
            inferred from storage access patterns
          </span>{' '}
          observed via the Execution Events SDK. When multiple transactions
          access the same storage slot within a single block, this indicates a{' '}
          <span className="text-zinc-300 font-medium">
            necessary condition
          </span>{' '}
          for re-execution in Monad&apos;s optimistic parallel execution model
          &mdash; but does not guarantee that re-execution occurred. Direct
          re-execution events are not currently exposed by the SDK.
        </p>
      </div>
    </div>
  )
}
