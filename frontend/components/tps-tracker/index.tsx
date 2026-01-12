'use client'

import { Info } from 'lucide-react'
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
        <div className="w-full h-72 md:h-52">
          <TpsChart />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-zinc-500 md:hidden">
        <Info className="w-4 h-[1lh]" />
        <span>Scroll horizontally to see the latest data</span>
      </div>
    </div>
  )
}
