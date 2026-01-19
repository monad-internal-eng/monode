import { BlockStateTracker } from '@/components/block-state-tracker'
import { BlockTimeExecutionTracker } from '@/components/block-time-tracker'
import { PageHeader } from '@/components/common/page-header'
import { SectionSeparator } from '@/components/common/section-separator'
import { HotAccountsBubbleMap } from '@/components/hot-accounts-bubble-map'
import { HotSlotsBubbleMap } from '@/components/hot-slots-bubble-map'
import { NetworkActivityTracker } from '@/components/network-activity-tracker'
import { SwapTransferTracker } from '@/components/swap-transfer-tracker'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">
      <main className="py-6 px-4 max-w-7xl mx-auto sm:py-8 sm:px-6 md:py-12 flex flex-col">
        {/* Sections container with continuous left/right borders */}
        <div className="flex flex-col gap-20 border border-zinc-800 relative">
          <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-white" />
          <div className="absolute -top-px -right-px w-4 h-4 border-t border-r border-white" />
          <div className="absolute -bottom-px -left-px w-4 h-4 border-b border-l border-white" />
          <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-white" />
          <PageHeader />

          <NetworkActivityTracker />

          <BlockStateTracker />

          <SectionSeparator />

          <BlockTimeExecutionTracker />

          <SwapTransferTracker />

          <section className="flex flex-col md:flex-row gap-8 md:gap-4 mt-8 md:mt-12">
            <HotAccountsBubbleMap />
            <HotSlotsBubbleMap />
          </section>
        </div>
      </main>
    </div>
  )
}
