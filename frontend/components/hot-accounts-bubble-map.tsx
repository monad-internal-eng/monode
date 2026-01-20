'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/ui/bubble-map'
import { ExplorerLink } from '@/components/ui/bubble-map/explorer-link'
import { useContractLabels } from '@/hooks/use-contract-labels'
import { useEvents } from '@/hooks/use-events'
import { formatIntNumber } from '@/lib/ui'
import { shortenHex } from '@/lib/utils'

interface HotAccount {
  id: string
  address: string
  hits: number
}

function getBubbleTextSizes(size: number) {
  if (size >= 100) return { address: 'text-[0.625rem]', count: 'text-base' }
  if (size >= 80) return { address: 'text-[0.5625rem]', count: 'text-sm' }
  return { address: 'text-[0.5rem]', count: 'text-xs' }
}

/**
 * A bubble map component that displays the most accessed accounts.
 */
export function HotAccountsBubbleMap() {
  const { accountAccesses } = useEvents()

  const accounts: HotAccount[] = useMemo(() => {
    return accountAccesses
      .map((entry) => ({
        id: entry.key,
        address: entry.key,
        hits: entry.count,
      }))
      .sort((a, b) => b.hits - a.hits)
  }, [accountAccesses])

  const addresses = useMemo(() => accounts.map((a) => a.address), [accounts])
  const { getLabel } = useContractLabels(addresses)

  return (
    <BubbleMap
      title="Most Active Accounts"
      description="Accounts accessed most frequently during parallel transaction execution."
      items={accounts}
      renderBubbleContent={(account, size) => {
        const textSizes = getBubbleTextSizes(size)
        return (
          <>
            <span
              className={`${textSizes.address} font-normal font-mono text-center text-white leading-[1.2]`}
            >
              {shortenHex(account.address)}
            </span>
            <span
              className={`${textSizes.count} font-medium font-britti-sans text-white leading-[1.2]`}
            >
              {formatIntNumber(account.hits)}
            </span>
          </>
        )
      }}
      renderTooltip={(account) => {
        const label = getLabel(account.address)
        const displayName = label?.displayName ?? shortenHex(account.address)
        return (
          <div className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
              <span className="text-sm uppercase tracking-wider text-tooltip-text-accent">
                {displayName}
              </span>
              <p className="break-all font-mono text-xs text-tooltip-text-secondary">
                {account.address}
              </p>
            </div>
            <div className="flex flex-col gap-0">
              <div className="my-2 border-t border-tooltip-separator" />
              <div className="flex flex-row justify-between">
                <p className="font-medium text-white">
                  {formatIntNumber(account.hits)}{' '}
                  <span className="text-tooltip-text-secondary">hits</span>
                </p>
                <ExplorerLink
                  href={`https://monadvision.com/address/${account.address}`}
                />
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
