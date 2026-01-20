'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/ui/bubble-map'
import { ExplorerLink } from '@/components/ui/bubble-map/explorer-link'
import { useContractLabels } from '@/hooks/use-contract-labels'
import { useEvents } from '@/hooks/use-events'
import { formatIntNumber } from '@/lib/ui'
import { shortenHex } from '@/lib/utils'

interface HotSlot {
  id: string
  address: string
  slot: string
  hits: number
}

/**
 * Returns responsive text sizes based on bubble diameter.
 */
function getBubbleTextSizes(size: number) {
  if (size >= 140) return { address: 'text-[0.625rem]', count: 'text-base' }
  if (size >= 100) return { address: 'text-[0.5rem]', count: 'text-sm' }
  return { address: 'text-[0.4375rem]', count: 'text-xs' }
}

/**
 * A bubble map component that displays the most accessed storage slots.
 */
export function HotSlotsBubbleMap() {
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

  const addresses = useMemo(
    () => [...new Set(slots.map((s) => s.address))],
    [slots],
  )
  const { getLabel } = useContractLabels(addresses)

  return (
    <BubbleMap
      title="Storage Contention Map"
      description="Storage slots with the highest concurrent access during block execution."
      items={slots}
      minSize={64}
      maxSize={160}
      renderBubbleContent={(slot, size) => {
        const textSizes = getBubbleTextSizes(size)
        return (
          <>
            <span
              className={`${textSizes.address} font-normal font-mono text-center leading-3`}
            >
              {shortenHex(slot.slot)}
            </span>
            <span
              className={`${textSizes.count} font-medium font-britti-sans leading-5`}
            >
              {formatIntNumber(slot.hits)}
            </span>
          </>
        )
      }}
      renderTooltip={(slot) => {
        const label = getLabel(slot.address)
        const displayName = label?.displayName ?? shortenHex(slot.address)
        return (
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wider text-tooltip-text-accent">
                {displayName}
              </span>
              <div className="flex flex-col gap-1">
                <p className="break-all font-mono text-2xs text-tooltip-text-secondary">
                  Contract:{' '}
                  <span className="text-xs text-white">
                    {shortenHex(slot.address)}
                  </span>
                </p>
                <p className="break-all font-mono text-2xs text-tooltip-text-secondary">
                  Slot:{' '}
                  <span className="text-xs text-white">
                    {shortenHex(slot.slot)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-0">
              <div className="my-2 border-t border-tooltip-separator" />
              <div className="flex flex-row justify-between">
                <p className="font-medium text-white">
                  {formatIntNumber(slot.hits)}{' '}
                  <span className="text-tooltip-text-secondary">hits</span>
                </p>
                <ExplorerLink
                  href={`https://monadvision.com/address/${slot.address}`}
                />
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
