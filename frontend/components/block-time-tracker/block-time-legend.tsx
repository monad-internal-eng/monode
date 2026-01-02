const BlockTimeLegend = () => {
  return (
    <div className="flex flex-row justify-between items-center text-xs sm:text-sm text-[#a0a0b0]">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 bg-[#454150] rounded-t-sm" />
          <p>Finalized</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-10 bg-[#454150] rounded-t-sm relative">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[#696274] rounded-t-sm" />
          </div>
          <p>Executing</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-10 bg-[#7B66A2] rounded-t-sm"
            style={{
              boxShadow: '0 0 5px #7B66A2, 0 0 10px #7B66A2',
            }}
          />
          <p>Parallel Execution</p>
        </div>
      </div>
      <p className="max-w-1/3 text-right">
        Height = execution time. Purple glow = concurrent transactions observed.
      </p>
    </div>
  )
}

export default BlockTimeLegend
