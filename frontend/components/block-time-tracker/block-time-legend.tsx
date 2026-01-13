import { Info } from 'lucide-react'

export const BlockTimeLegend = () => {
  return (
    <div className="flex flex-col justify-between gap-6 text-xs sm:gap-4 sm:flex-row sm:text-sm text-zinc-400">
      <div className="flex flex-row gap-2 sm:max-w-1/3 text-zinc-500">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-sm">Bar height reflects execution time.</span>
          <span className="text-sm">
            Factor = total tx exec time / block exec time.
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 xs:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 bg-tracker-active/25 rounded-t-sm ring-1 ring-tracker-active/25" />
          <p className="hidden xs:block">Block execution time</p>
          <p className="block xs:hidden">Block</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 bg-tracker-active rounded-t-sm" />
          <p className="hidden xs:block">Total tx execution time</p>
          <p className="block xs:hidden">Tx exec</p>
        </div>
      </div>
    </div>
  )
}
