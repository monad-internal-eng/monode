'use client'

import { Button } from '@/components/ui/button'

interface PauseResumeControlProps {
  isFollowingChain: boolean
  onToggle: () => void
  pausedText?: string
  resumedText?: string
}

export function PauseResumeControl({
  isFollowingChain,
  onToggle,
  pausedText = 'Resume to follow chain',
  resumedText = 'Pause to freeze and scroll',
}: PauseResumeControlProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" onClick={onToggle}>
        {isFollowingChain ? 'Pause' : 'Resume'}
      </Button>
      <span className="text-sm text-[#52525E]">
        {isFollowingChain ? resumedText : pausedText}
      </span>
    </div>
  )
}
