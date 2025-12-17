'use client'

import { Eye } from 'lucide-react'
import { Switch } from '@/components/ui/switch'

interface FollowChainToggleProps {
  isFollowing: boolean
  onChange: (value: boolean) => void
}

export function FollowChainToggle({
  isFollowing,
  onChange,
}: FollowChainToggleProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-[#16162a]/60 rounded-lg border border-[#2a2a4a]/50">
      <div className="flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-[#6a6a7a]" />
        <span className="text-xs text-[#a0a0b0] font-medium whitespace-nowrap">
          Follow Chain
        </span>
      </div>
      <Switch
        checked={isFollowing}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-indigo-500 data-[state=unchecked]:bg-[#2a2a4a] h-5 w-9"
      />
    </div>
  )
}
