'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { getDexConfigByProvider } from '@/constants/dex-config'
import { cn } from '@/lib/utils'
import type { SwapsByProvider } from '@/types/swap'
import { SwapRow } from './swap-row'

interface ProviderCardProps {
  data: SwapsByProvider
  className?: string
}

export function ProviderCard({ data, className }: ProviderCardProps) {
  const config = getDexConfigByProvider(data.provider)

  if (!config) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col rounded-xl overflow-hidden',
        'bg-[#16162a]/80 border border-[#2a2a4a]/50',
        className,
      )}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a4a]/50"
        style={{
          background: `linear-gradient(135deg, ${config.color}15 0%, transparent 100%)`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <h3 className="text-sm font-semibold text-white">{config.name}</h3>
          <span className="text-xs text-zinc-500">MON/AUSD</span>
        </div>

        <a
          href={`${config.explorerUrl}/address/${config.contractAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="View contract"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="p-2 h-[220px] overflow-y-auto scrollbar-none">
        {data.swaps.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-zinc-500 text-center">
              {data.isLoading ? 'Waiting for events...' : 'No swaps yet'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence mode="popLayout">
              {data.swaps.map((swap) => (
                <SwapRow key={swap.id} swap={swap} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
