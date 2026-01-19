'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CornerDecorationsContainerProps {
  className?: string
  children: ReactNode
}

export function CornerDecorationsContainer({
  className,
  children,
}: CornerDecorationsContainerProps) {
  return (
    <div className={cn('border relative', className)}>
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-border-corner" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-border-corner" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-border-corner" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-border-corner" />

      {children}
    </div>
  )
}
