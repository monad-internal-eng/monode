'use client'

import { useCallback, useRef, useState } from 'react'

interface Block {
  id: number
  state: 'proposed' | 'voted' | 'finalized' | 'verified'
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms))
}

export default function BlockSpawner() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [speed, setSpeed] = useState(1)
  const blockNumRef = useRef(1)

  const updateBlockState = useCallback((id: number, state: Block['state']) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, state } : block)),
    )
  }, [])

  const spawnBlock = useCallback(async () => {
    const id = blockNumRef.current++

    setBlocks((prev) => [{ id, state: 'proposed' }, ...prev])

    await sleep(100 * speed)
    updateBlockState(id, 'voted')

    await sleep(300 * speed)
    updateBlockState(id, 'finalized')

    await sleep(400 * speed)
    updateBlockState(id, 'verified')
  }, [speed, updateBlockState])

  const proposedBlocks = blocks.filter((b) => b.state === 'proposed')
  const votedBlocks = blocks.filter((b) => b.state === 'voted')
  const finalizedBlocks = blocks.filter((b) => b.state === 'finalized')
  const verifiedBlocks = blocks.filter((b) => b.state === 'verified')

  const blockBaseStyles =
    'px-4 py-3 rounded-md font-semibold text-sm text-center animate-slideIn transition-all duration-300 bg-linear-to-br'

  return (
    <div className="w-full flex-1 flex flex-col min-h-0 sm:block sm:flex-none md:p-6">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-2 p-3 bg-[#1a1a2e] rounded-lg flex-wrap shrink-0 md:gap-4 md:mb-8 md:p-4">
        <label htmlFor="speed" className="text-[#a0a0b0] font-medium">
          Speed:
        </label>
        <input
          type="range"
          id="speed"
          min="0.5"
          max="5"
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-30 accent-indigo-500"
        />
        <span className="text-gray-200 min-w-10">{speed}x</span>
        <button
          type="button"
          onClick={spawnBlock}
          className="w-full mt-2 px-4 py-2 bg-linear-to-br from-indigo-500 to-violet-500 text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 active:translate-y-0 sm:ml-auto sm:w-auto sm:mt-0 sm:px-6 sm:py-3"
        >
          Spawn Block
        </button>
      </div>

      {/* Lanes */}
      <div className="grid grid-cols-2 grid-rows-[1fr_1fr] flex-1 min-h-0 gap-2 sm:grid-cols-4 sm:grid-rows-none sm:flex-none md:gap-4">
        {/* Proposed Lane */}
        <div className="bg-[#16162a] rounded-lg p-3 min-h-0 flex flex-col overflow-hidden md:p-4 md:min-h-75 md:block md:overflow-visible">
          <h3 className="m-0 mb-4 pb-2 shrink-0 border-b-2 border-[#2a2a4a] text-sm font-medium uppercase tracking-wide text-[#8888a0] md:pb-3">
            Proposed
          </h3>
          <div className="flex flex-col gap-2 overflow-auto flex-1 min-h-0 md:overflow-visible md:flex-none">
            {proposedBlocks.map((block) => (
              <div
                key={block.id}
                className={`${blockBaseStyles} from-amber-500 to-amber-600 text-[#1a1a2e]`}
              >
                #{block.id}
              </div>
            ))}
          </div>
        </div>

        {/* Voted Lane */}
        <div className="bg-[#16162a] rounded-lg p-3 min-h-0 flex flex-col overflow-hidden md:p-4 md:min-h-75 md:block md:overflow-visible">
          <h3 className="m-0 mb-4 pb-2 shrink-0 border-b-2 border-[#2a2a4a] text-sm font-medium uppercase tracking-wide text-[#8888a0] md:pb-3">
            Voted
          </h3>
          <div className="flex flex-col gap-2 overflow-auto flex-1 min-h-0 md:overflow-visible md:flex-none">
            {votedBlocks.map((block) => (
              <div
                key={block.id}
                className={`${blockBaseStyles} from-blue-500 to-blue-600 text-white`}
              >
                #{block.id}
              </div>
            ))}
          </div>
        </div>

        {/* Finalized Lane */}
        <div className="bg-[#16162a] rounded-lg p-3 min-h-0 flex flex-col overflow-hidden md:p-4 md:min-h-75 md:block md:overflow-visible">
          <h3 className="m-0 mb-4 pb-2 shrink-0 border-b-2 border-[#2a2a4a] text-sm font-medium uppercase tracking-wide text-[#8888a0] md:pb-3">
            Finalized
          </h3>
          <div className="flex flex-col gap-2 overflow-auto flex-1 min-h-0 md:overflow-visible md:flex-none">
            {finalizedBlocks.map((block) => (
              <div
                key={block.id}
                className={`${blockBaseStyles} from-violet-500 to-violet-600 text-white`}
              >
                #{block.id}
              </div>
            ))}
          </div>
        </div>

        {/* Verified Lane */}
        <div className="bg-[#16162a] rounded-lg p-3 min-h-0 flex flex-col overflow-hidden md:p-4 md:min-h-75 md:block md:overflow-visible">
          <h3 className="m-0 mb-4 pb-2 shrink-0 border-b-2 border-[#2a2a4a] text-sm font-medium uppercase tracking-wide text-[#8888a0] md:pb-3">
            Verified
          </h3>
          <div className="flex flex-col gap-2 overflow-auto flex-1 min-h-0 md:overflow-visible md:flex-none">
            {verifiedBlocks.map((block) => (
              <div
                key={block.id}
                className={`${blockBaseStyles} from-emerald-500 to-emerald-600 text-white`}
              >
                #{block.id}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
