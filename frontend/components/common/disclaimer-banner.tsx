'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="w-full bg-amber-900/80 border-b border-amber-700">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-amber-100 relative">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
        <span>
          <strong>Warning:</strong> This app is for demo purposes only and has
          not been audited or tested. Do not use in production without your own
          audits.
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="absolute right-2 sm:right-4 p-0 text-amber-100 hover:text-amber-200 hover:bg-transparent"
          aria-label="Close disclaimer"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
