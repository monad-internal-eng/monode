'use client'

import { useEffect, useState } from 'react'
import { BubbleMap } from '@/components/bubble-map'
import { shortenHex } from '@/lib/utils'
import { ExplorerLink } from './bubble-map/explorer-link'

interface HotSlot {
  id: string
  address: string
  slot: string
  hits: number
}

/**
 * TEMPORARY: Generate mock data for the hot slots bubble map.
 * TODO: Replace with actual data from the execution events backend.
 */
const generateMockData = (): HotSlot[] => {
  const slots = [
    {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000001',
      baseHits: 85,
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000003',
      baseHits: 72,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000009',
      baseHits: 68,
    },
    {
      address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000012',
      baseHits: 65,
    },
    {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000021',
      baseHits: 55,
    },
    {
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000045',
      baseHits: 48,
    },
    {
      address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000078',
      baseHits: 42,
    },
    {
      address: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b',
      slot: '0x0000000000000000000000000000000000000000000000000000000000000099',
      baseHits: 38,
    },
  ]

  return slots
    .map((s) => ({
      id: `${s.address}-${s.slot}`,
      address: s.address,
      slot: s.slot,
      hits: Math.max(10, Math.floor(s.baseHits + (Math.random() * 40 - 20))),
    }))
    .sort((a, b) => b.hits - a.hits)
}

/**
 * A bubble map component that displays the most accessed storage slots.
 */
export default function HotSlotsBubbleMap() {
  const [slots, setSlots] = useState<HotSlot[]>([])

  useEffect(() => {
    setSlots(generateMockData())

    const interval = setInterval(() => {
      setSlots(generateMockData())
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <BubbleMap
      title="Hot Slots Map"
      description="Most frequently accessed storage slots"
      items={slots}
      minSize={80}
      maxSize={160}
      renderBubbleContent={(slot) => (
        <>
          <span className="font-bold text-white drop-shadow-md text-sm truncate w-full px-2">
            {shortenHex(slot.address)}
          </span>
          <span className="text-[10px] text-white/90 font-mono mt-0.5 truncate w-full px-2">
            {shortenHex(slot.slot)}
          </span>
          <span className="text-xs text-white/80 font-mono mt-0.5">
            {slot.hits} hits
          </span>
        </>
      )}
      renderTooltip={(slot) => (
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-[10px] text-[#a0a0b0] uppercase tracking-wider">
              Contract
            </span>
            <p className="text-xs font-mono text-white break-all">
              {slot.address}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-[#a0a0b0] uppercase tracking-wider">
              Slot Key
            </span>
            <p className="text-xs font-mono text-white break-all">
              {slot.slot}
            </p>
          </div>
          <ExplorerLink
            href={`https://monadvision.com/address/${slot.address}`}
          />
        </div>
      )}
    />
  )
}
