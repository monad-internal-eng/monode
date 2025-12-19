const BlockTimeLegend = () => {
  return (
    <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#8888a0]">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-linear-to-t from-gray-200 to-gray-100 border border-gray-300 rounded" />
        <span>Block execution time (container)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-linear-to-t from-purple-500 to-purple-300 rounded" />
        <span>Transaction execution time</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 bg-linear-to-t from-purple-500 to-purple-300 rounded animate-pulse"
          style={{
            boxShadow:
              '0 0 6px #ffd700, 0 0 12px #ffd700, 0 0 8px #a855f7, 0 0 16px #a855f7, 0 0 24px #a855f7',
          }}
        />
        <span>High parallelization (&gt;1x ratio)</span>
      </div>
    </div>
  )
}

export default BlockTimeLegend
