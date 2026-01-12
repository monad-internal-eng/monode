import { Info } from 'lucide-react'

const BlockTimeLegend = () => {
  return (
    <div className="flex flex-col justify-between gap-6 text-xs sm:gap-4 sm:flex-row sm:text-sm text-zinc-400">
      <div className="flex flex-row gap-2 sm:max-w-1/3 text-zinc-500">
        <Info className="w-4 h-lh" />
        <div className="flex flex-col gap-1">
          <span className="text-sm">Height = execution time</span>
          <span className="text-sm">
            Purple glow = concurrent transactions observed
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 xs:gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 bg-zinc-600 rounded-t-sm" />
          <p className="hidden xs:block">Block Execution Time</p>
          <p className="block xs:hidden">Block Exec. Time</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 bg-zinc-600 rounded-t-sm relative">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-bg-card-darker rounded-t-sm" />
          </div>
          <p className="hidden xs:block">Transaction Execution Time</p>
          <p className="block xs:hidden">Tx Exec. Time</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-10 bg-[#7B66A2] rounded-t-sm"
            style={{
              boxShadow:
                '0 0 0.3125rem var(--color-purple-glow), 0 0 0.625rem var(--color-purple-glow)',
            }}
          />
          <p className="hidden xs:block">Parallel Execution</p>
          <p className="block xs:hidden">Parallel Exec.</p>
        </div>
      </div>
    </div>
  )
}

export default BlockTimeLegend
