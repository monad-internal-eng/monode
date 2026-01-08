'use client'

import { SectionHeader } from '@/components/ui/section-header'
import { TpsChart } from './tps-chart'

export default function TpsTracker() {
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <SectionHeader
        title="Network Activity"
        description="Live throughput and transaction count from execution events."
      />
      <div className="dark-component-colors rounded-xl border p-4 sm:p-5 overflow-x-auto scrollbar-none">
        <div className="w-full h-64 sm:h-52">
          <TpsChart />
        </div>
      </div>
    </div>
  )
}
