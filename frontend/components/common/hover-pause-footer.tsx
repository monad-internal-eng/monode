'use client'

import { Pointer } from 'lucide-react'

export function HoverPauseFooter() {
  return (
    <div className="hidden md:block px-6 sm:px-10 bg-[linear-gradient(153deg,#18181B_0%,rgba(24,24,27,0)_100%)] border-t border-l border-b border-zinc-800">
      <div className="flex items-center gap-4 py-3">
        <Pointer className="w-5 h-5 text-[#52525E]" />
        <span className="text-base text-[#52525E] font-normal leading-6">
          Hovering on the Block stream pauses the update.
        </span>
      </div>
    </div>
  )
}
