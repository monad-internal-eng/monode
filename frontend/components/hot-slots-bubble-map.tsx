'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/bubble-map'
import { useEvents } from '@/hooks/use-events'
import { shortenHex } from '@/lib/utils'
import { ExplorerLink } from './bubble-map/explorer-link'

interface HotSlot {
  id: string
  address: string
  slot: string
  hits: number
}

/**
 * A bubble map component that displays the most accessed storage slots.
 */
export default function HotSlotsBubbleMap() {
  const { storageAccesses } = useEvents()

  const slots: HotSlot[] = useMemo(() => {
    return storageAccesses
      .map((entry) => ({
        id: `${entry.key[0]}-${entry.key[1]}`,
        address: entry.key[0],
        slot: entry.key[1],
        hits: entry.count,
      }))
      .sort((a, b) => b.hits - a.hits)
  }, [storageAccesses])

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
