import { Info } from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { TpsChart } from './tps-chart'

export function NetworkActivityTracker() {
  return (
    <div className="w-full flex flex-col gap-4">
      <SectionHeader
        title="Network Activity"
        description="Live throughput and transaction count from execution events."
      />
      <div className="w-full py-3 px-5 md:py-6 md:px-10">
        <div className="bg-black rounded-xl border-[#737373] border p-6 sm:p-10 overflow-x-auto scrollbar-none">
          <div className="w-full h-92 md:h-72">
            <TpsChart />
          </div>
        </div>
      </div>
      <div className="flex items-center px-5 gap-2 text-sm text-text-secondary md:hidden">
        <Info className="w-4 h-lh" />
        <span>Scroll horizontally to see the latest data</span>
      </div>
    </div>
  )
}
