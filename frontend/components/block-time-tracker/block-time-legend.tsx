export const BlockTimeLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#38BDF8]" />
        <span className="text-base text-white">Block execution time</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#6E54FF]" />
        <span className="text-base text-white">
          Total transaction execution
        </span>
      </div>
    </div>
  )
}
