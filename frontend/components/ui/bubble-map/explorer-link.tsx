'use client'

import { ExternalLink } from 'lucide-react'

interface ExplorerLinkProps {
  href: string
}

/**
 * A link to the blockchain explorer.
 */
export function ExplorerLink({ href }: ExplorerLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      View on Explorer
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}
