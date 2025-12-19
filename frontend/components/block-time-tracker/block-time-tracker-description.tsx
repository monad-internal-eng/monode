const BlockTimeTrackerDescription = () => {
  return (
    <div className="text-sm text-[#8888a0] bg-[#16162a]/80 rounded-lg border border-[#2a2a4a]/50 p-4">
      <p className="mb-2">
        <strong>Real-time block execution visualization:</strong> Each bar
        represents a block with its container height showing total block
        execution time. The fill shows cumulative transaction execution time -
        if transactions run in parallel, it will be visible as a glowing fill
        and multiplier.
      </p>
      <p className="text-xs text-gray-500">
        Data updates live from blockchain events. Glowing fill indicates high
        parallelization (block execution would take longer if the transactions
        run sequentially).
      </p>
    </div>
  )
}

export default BlockTimeTrackerDescription
