'use client'

import { useExecutionEventBlocks } from '@/hooks/use-execution-event-blocks'
import { Blockchain } from './blockchain'

// =============================================================================
// Main Component
// =============================================================================

/**
 * BlockStateTracker visualizes the blockchain with blocks progressing through states:
 * Proposed → Voted → Finalized → Verified
 *
 * Shows execution events from the SDK.
 */
export default function BlockStateTracker() {
  const executionBlocks = useExecutionEventBlocks()

  return (
    <div className="w-full">
      {/* Execution SDK Blockchain visualization */}
      <div className="flex flex-col bg-[#16162a]/80 rounded-xl border border-[#2a2a4a]/50">
        <div className="px-4 py-3 border-b border-[#2a2a4a]/50">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8888a0]">
            Blockchain
          </h3>
          <p className="text-xs text-[#6a6a7a] mt-1">
            Blocks progress through states:{' '}
            <span className="text-amber-400">Proposed</span> →{' '}
            <span className="text-indigo-400">Voted</span> →{' '}
            <span className="text-cyan-400">Finalized</span> →{' '}
            <span className="text-green-400">Verified</span>.{' '}
            <a
              href="https://docs.monad.xyz/monad-arch/consensus/block-states"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Learn more
            </a>
          </p>
        </div>
        <div className="p-4">
          <Blockchain blocks={executionBlocks} />
        </div>
      </div>
    </div>
  )
}
