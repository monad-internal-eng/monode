'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/ui/external-link'

const BLOG_POST_URL = 'https://blog.monad.xyz/blog/execution-events-sdk'

export function BlogBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="w-full bg-brand-purple-primary">
      <div className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white relative">
        <span>
          To learn how this app uses Monad Execution Events SDK, check out the
          blog post{' '}
          <ExternalLink
            href={BLOG_POST_URL}
            className="underline hover:text-white/80 transition-colors"
          >
            here
          </ExternalLink>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="absolute right-2 sm:right-4 p-0"
          aria-label="Close banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
