'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/ui/bubble-map'
import { ExplorerLink } from '@/components/ui/bubble-map/explorer-link'
import { useEvents } from '@/hooks/use-events'
import { shortenHex } from '@/lib/utils'
import { formatIntNumber } from '@/utils/ui'

interface HotAccount {
  id: string
  address: string
  hits: number
}

/**
 * A bubble map component that displays the most accessed accounts.
 */
export default function HotAccountsBubbleMap() {
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

  return (
    <BubbleMap
      title="Hot Accounts Map"
      description="Accounts most frequently accessed during parallel transaction execution."
      items={accounts}
      renderBubbleContent={(account) => (
        <>
          <span className="text-xs font-normal w-full">
            {shortenHex(account.address)}
          </span>
          <span className="text-sm font-bold font-mono mt-0.5">
            {formatIntNumber(account.hits)}
          </span>
        </>
      )}
      renderTooltip={(account) => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            {/* TODO: Add contract detail as name */}
            <span className="text-sm text-[#9C6EF8] uppercase tracking-wider">
              Link
            </span>
            <p className="text-xs font-mono text-[#8888a0] break-all">
              {account.address}
            </p>
          </div>
          <div className="flex flex-col gap-0">
            <div className="border-t border-[#2C2735] my-2" />
            <div className="flex flex-row justify-between">
              <p className="text-white font-medium">
                {formatIntNumber(account.hits)}{' '}
                <span className="text-[#8888a0]">hits</span>
              </p>
              <ExplorerLink
                href={`https://monadvision.com/address/${account.address}`}
              />
            </div>
          </div>
        </div>
      )}
      bottomDescription="Account access frequencies during transaction execution."
    />
  )
}
