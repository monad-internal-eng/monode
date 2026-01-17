import { BlockStateTracker } from '@/components/block-state-tracker'
import { BlockTimeExecutionTracker } from '@/components/block-time-tracker'
import { PageHeader } from '@/components/common/page-header'
import { HotAccountsBubbleMap } from '@/components/hot-accounts-bubble-map'
import { HotSlotsBubbleMap } from '@/components/hot-slots-bubble-map'
import { NetworkActivityTracker } from '@/components/network-activity-tracker'
import { SwapTransferTracker } from '@/components/swap-transfer-tracker'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">
      <main className="py-6 px-4 max-w-7xl mx-auto sm:py-8 sm:px-6 md:py-12 flex flex-col">
        <PageHeader />

        {/* Sections container with continuous left/right borders */}
        <div className="flex flex-col border-x border-zinc-800">
          <NetworkActivityTracker />

          <BlockStateTracker />

          <BlockTimeExecutionTracker />

          <SwapTransferTracker />
        </div>

        <section className="flex flex-col md:flex-row gap-8 md:gap-4 mt-8 md:mt-12">
          <HotAccountsBubbleMap />
          <HotSlotsBubbleMap />
        </section>
      </main>
    </div>
  )
}
