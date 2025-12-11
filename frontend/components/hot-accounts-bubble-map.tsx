'use client'

import { useMemo } from 'react'
import { BubbleMap } from '@/components/bubble-map'
import { useEvents } from '@/hooks/use-events'
import { shortenHex } from '@/lib/utils'
import { ExplorerLink } from './bubble-map/explorer-link'

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
      description="Real-time visualization of most accessed accounts"
      items={accounts}
      renderBubbleContent={(account) => (
        <>
          <span className="font-bold text-white drop-shadow-md text-sm truncate w-full px-2">
            {shortenHex(account.address)}
          </span>
          <span className="text-xs text-white/80 font-mono mt-0.5">
            {account.hits} hits
          </span>
        </>
      )}
      renderTooltip={(account) => (
        <div className="flex flex-col gap-2">
          <div>
            <span className="text-[10px] text-[#a0a0b0] uppercase tracking-wider">
              Contract
            </span>
            <p className="text-xs font-mono text-white break-all">
              {account.address}
            </p>
          </div>
          <ExplorerLink
            href={`https://monadvision.com/address/${account.address}`}
          />
        </div>
      )}
    />
  )
}
