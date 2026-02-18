'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/ui/bubble-map'
import { ExplorerLink } from '@/components/ui/bubble-map/explorer-link'
import { useContractLabels } from '@/hooks/use-contract-labels'
import { formatIntNumber } from '@/lib/ui'
import { shortenHex } from '@/lib/utils'
import type { ContendedSlotEntry } from '@/types/contention'

interface ContendedSlot {
  id: string
  address: string
  slot: string
  txnCount: number
  accessCount: number
  hits: number
}

function getBubbleTextSizes(size: number) {
  if (size >= 100) return { label: 'text-[0.625rem]', count: 'text-base' }
  if (size >= 80) return { label: 'text-[0.5625rem]', count: 'text-sm' }
  return { label: 'text-[0.5rem]', count: 'text-xs' }
}

interface ContendedSlotsMapProps {
  slots: ContendedSlotEntry[]
}

/**
 * Bubble map showing the most contended storage slots.
 * Sized by the number of competing transactions (not just total accesses).
 */
export function ContendedSlotsMap({ slots: rawSlots }: ContendedSlotsMapProps) {
  const slots: ContendedSlot[] = useMemo(() => {
    return rawSlots.map((entry) => ({
      id: `${entry.address}-${entry.slot}`,
      address: entry.address,
      slot: entry.slot,
      txnCount: entry.txn_count,
      accessCount: entry.access_count,
      hits: entry.txn_count, // BubbleMap uses 'hits' for sizing
    }))
  }, [rawSlots])

  const addresses = useMemo(
    () => [...new Set(slots.map((s) => s.address))],
    [slots],
  )
  const { getLabel } = useContractLabels(addresses)

  return (
    <BubbleMap
      title="Contended Storage Slots"
      description="Storage slots accessed by multiple transactions in the same block, indicating potential state contention."
      items={slots}
      renderBubbleContent={(slot, size) => {
        const textSizes = getBubbleTextSizes(size)
        return (
          <>
            <span
              className={`${textSizes.label} font-normal font-mono text-center text-white/80 leading-[1.2]`}
            >
              {shortenHex(slot.slot)}
            </span>
            <span
              className={`${textSizes.count} font-medium font-britti-sans text-white leading-[1.2]`}
            >
              {slot.txnCount} txns
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
            <div className="my-2 border-t border-tooltip-separator" />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-row justify-between">
                <span className="text-tooltip-text-secondary text-xs">
                  Competing txns
                </span>
                <span className="font-medium text-white">
                  {slot.txnCount}
                </span>
              </div>
              <div className="flex flex-row justify-between">
                <span className="text-tooltip-text-secondary text-xs">
                  Total accesses
                </span>
                <span className="font-medium text-white">
                  {formatIntNumber(slot.accessCount)}
                </span>
              </div>
            </div>
            <div className="my-2 border-t border-tooltip-separator" />
            <div className="flex justify-end">
              <ExplorerLink
                href={`https://monadvision.com/address/${slot.address}`}
              />
            </div>
          </div>
        )
      }}
    />
  )
}
