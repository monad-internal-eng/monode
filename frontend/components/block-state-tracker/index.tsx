'use client'

import { useExecutionEventBlocks } from '@/hooks/use-execution-event-blocks'
import { Blockchain } from './blockchain'
import { FollowChainToggle } from './follow-chain-toggle'
import { SlowMotionControl } from './slow-motion-control'

/**
 * BlockStateTracker visualizes the blockchain with blocks progressing through states:
 * Proposed → Voted → Finalized → Verified
 *
 * Shows execution events from the SDK.
 */
export default function BlockStateTracker() {
  const {
    blocks,
    isSlowMotion,
    remainingSeconds,
    startSlowMotion,
    stopSlowMotion,
    isFollowingChain,
    setIsFollowingChain,
  } = useExecutionEventBlocks()

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Monad Block Tracker</h2>
          <p className="text-sm text-[#a0a0b0]">
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

        {/* Control Panel */}
        <div className="flex items-center gap-2">
          <FollowChainToggle
            isFollowing={isFollowingChain}
            onChange={setIsFollowingChain}
          />
          <SlowMotionControl
            isActive={isSlowMotion}
            remainingSeconds={remainingSeconds}
            onStart={startSlowMotion}
            onStop={stopSlowMotion}
          />
        </div>
      </div>

      {/* Execution SDK Blockchain visualization */}
      <div className="flex flex-col bg-[#16162a]/80 rounded-xl border border-[#2a2a4a]/50 p-4">
        <Blockchain blocks={blocks} isFollowingChain={isFollowingChain} />
      </div>
    </div>
  )
}
