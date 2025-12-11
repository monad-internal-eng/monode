'use client'

import { useEffect, useState } from 'react'
import { BubbleMap } from '@/components/bubble-map'
import { shortenHex } from '@/lib/utils'
import { ExplorerLink } from './bubble-map/explorer-link'

interface HotAccount {
  id: string
  address: string
  hits: number
}

/**
 * TEMPORARY: Generate mock data for the hot accounts bubble map.
 * TODO: Replace with actual data from the execution events backend.
 */
const generateMockData = (): HotAccount[] => {
  const accounts = [
    {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      baseHits: 80,
    },
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      baseHits: 95,
    },
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      baseHits: 90,
    },
    {
      address: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
      baseHits: 60,
    },
    {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
      baseHits: 40,
    },
    {
      address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      baseHits: 35,
    },
    {
      address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      baseHits: 75,
    },
    {
      address: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b',
      baseHits: 55,
    },
    {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      baseHits: 45,
    },
    {
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      baseHits: 50,
    },
  ]

  return accounts
    .map((acc) => ({
      id: acc.address,
      address: acc.address,
      hits: Math.max(10, Math.floor(acc.baseHits + (Math.random() * 40 - 20))),
    }))
    .sort((a, b) => b.hits - a.hits)
}

/**
 * A bubble map component that displays the most accessed accounts.
 */
export default function HotAccountsBubbleMap() {
  const [accounts, setAccounts] = useState<HotAccount[]>([])

  useEffect(() => {
    setAccounts(generateMockData())

    const interval = setInterval(() => {
      setAccounts(generateMockData())
    }, 3000)

    return () => clearInterval(interval)
  }, [])

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
