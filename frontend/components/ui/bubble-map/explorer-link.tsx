'use client'

import { ExternalLink as ExternalLinkIcon } from 'lucide-react'
import { ExternalLink } from '@/components/ui/external-link'

interface ExplorerLinkProps {
  href: string
}

/**
 * A link to the blockchain explorer.
 */
export function ExplorerLink({ href }: ExplorerLinkProps) {
  return (
    <ExternalLink
      href={href}
      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      View on Explorer
      <ExternalLinkIcon className="w-3 h-3" />
    </ExternalLink>
  )
}
