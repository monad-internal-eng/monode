'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/ui/bubble-map'
import { ExplorerLink } from '@/components/ui/bubble-map/explorer-link'
import { useEvents } from '@/hooks/use-events'
import { shortenHex } from '@/lib/utils'
import { formatIntNumber } from '@/utils/ui'

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
      description="Storage slots with the highest concurrent access during block execution."
      items={slots}
      renderBubbleContent={(slot) => (
        <>
          <span className="text-xs font-normal w-full">
            {shortenHex(slot.slot)}
          </span>
          <span className="text-sm font-bold font-mono mt-0.5">
            {formatIntNumber(slot.hits)}
          </span>
        </>
      )}
      renderTooltip={(slot) => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            {/* TODO: Add contract detail as name */}
            <span className="text-sm text-[#9C6EF8] uppercase tracking-wider">
              Link
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-2xs font-mono text-[#8888a0] break-all">
                Contract:{' '}
                <span className="text-white text-xs">
                  {shortenHex(slot.address)}
                </span>
              </p>
              <p className="text-2xs font-mono text-[#8888a0] break-all">
                Slot:{' '}
                <span className="text-white text-xs">
                  {shortenHex(slot.slot)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            <div className="border-t border-[#2C2735] my-2" />
            <div className="flex flex-row justify-between">
              <p className="text-white font-medium">
                {formatIntNumber(slot.hits)}{' '}
                <span className="text-[#8888a0]">hits</span>
              </p>
              <ExplorerLink
                href={`https://monadvision.com/address/${slot.address}`}
              />
            </div>
          </div>
        </div>
      )}
      bottomDescription="Slots may be accessed simultaneously across parallel transactions."
    />
  )
}
