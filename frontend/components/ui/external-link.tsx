import Link from 'next/link'
import type { ComponentProps } from 'react'

interface ExternalLinkProps
  extends Omit<ComponentProps<typeof Link>, 'target' | 'rel'> {
  children: React.ReactNode
}

export function ExternalLink({
  children,
  className = '',
  ...props
}: ExternalLinkProps) {
  return (
    <Link
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {children}
    </Link>
  )
}
