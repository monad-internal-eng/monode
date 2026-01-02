import BlockStateTracker from '@/components/block-state-tracker'
import BlockTimeExecutionTracker from '@/components/block-time-tracker'
import HotAccountsBubbleMap from '@/components/hot-accounts-bubble-map'
import HotSlotsBubbleMap from '@/components/hot-slots-bubble-map'
import SwapLogsTracker from '@/components/swap-logs-tracker'
import TransferLogsTracker from '@/components/transfer-logs-tracker'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">
      <main className="py-6 px-4 max-w-7xl mx-auto sm:py-8 sm:px-6 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="font-britti-sans text-3xl sm:text-4xl md:text-[48px] font-medium leading-none tracking-[-0.04em] text-white">
            Execution Events SDK Showcase
          </h1>
          <p className="mt-3 text-base font-normal leading-6 text-text-secondary">
            Live visualization of parallel EVM execution events streamed
            directly from Monad&apos;s execution engine.
          </p>
        </div>

        <BlockStateTracker />

        <div className="w-full h-px my-8 bg-linear-to-r from-transparent via-[#2a2a4a] to-transparent" />

        <div className="flex flex-col md:flex-row gap-4">
          <HotAccountsBubbleMap />
          <HotSlotsBubbleMap />
        </div>

        <div className="w-full h-px my-8 bg-linear-to-r from-transparent via-[#2a2a4a] to-transparent" />

        <BlockTimeExecutionTracker />

        <div className="w-full h-px my-8 bg-linear-to-r from-transparent via-[#2a2a4a] to-transparent" />

        <TransferLogsTracker />

        <div className="w-full h-px my-8 bg-linear-to-r from-transparent via-[#2a2a4a] to-transparent" />

        <SwapLogsTracker />
      </main>
    </div>
  )
}
