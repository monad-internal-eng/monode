import { BlockStateTracker } from '@/components/block-state-tracker'
import { BlockTimeExecutionTracker } from '@/components/block-time-tracker'
import { PageHeader } from '@/components/common/page-header'
import { HotAccountsBubbleMap } from '@/components/hot-accounts-bubble-map'
import { HotSlotsBubbleMap } from '@/components/hot-slots-bubble-map'
import { SwapTransferTracker } from '@/components/swap-transfer-tracker'
import { TpsTracker } from '@/components/tps-tracker'

export default function Home() {
  return (
    <div className="min-h-screen text-white font-sans">
      <main className="py-6 px-4 max-w-7xl mx-auto sm:py-8 sm:px-6 md:py-12 flex flex-col gap-8 md:gap-12">
        <PageHeader />

        <TpsTracker />

        <BlockStateTracker />

        <BlockTimeExecutionTracker />

        <SwapTransferTracker />

        <section className="flex flex-col md:flex-row gap-8 md:gap-4">
          <HotAccountsBubbleMap />
          <HotSlotsBubbleMap />
        </section>
      </main>
    </div>
  )
}
