'use client'

import { ArrowRightToLine } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface FollowChainToggleProps {
  isFollowing: boolean
  onChange: (value: boolean) => void
}

export function FollowChainToggle({
  isFollowing,
  onChange,
}: FollowChainToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 h-12 rounded-lg border transition-all duration-300',
        isFollowing
          ? 'bg-indigo-950/40 border-indigo-500/40 shadow-[0_0_12px_-3px_rgba(99,102,241,0.3)]'
          : 'bg-[#16162a]/60 border-[#2a2a4a]/50',
      )}
    >
      <div className="flex items-center gap-2">
        <ArrowRightToLine
          className={cn(
            'w-3.5 h-3.5 transition-colors duration-200',
            isFollowing ? 'text-indigo-400' : 'text-indigo-400/50',
          )}
        />
        <span
          className={cn(
            'text-xs font-medium whitespace-nowrap transition-colors duration-200',
            isFollowing ? 'text-indigo-300' : 'text-indigo-400/70',
          )}
        >
          Follow Chain
        </span>
      </div>
      <Switch
        checked={isFollowing}
        onCheckedChange={onChange}
        title={
          isFollowing
            ? 'Following latest blocks'
            : 'Click to auto-scroll to latest blocks'
        }
        className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-[#2a2a4a] h-5 w-9"
      />
    </div>
  )
}
