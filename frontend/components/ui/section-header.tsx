import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string | ReactNode | null
  children?: ReactNode
}

/**
 * Section header with title and description, optional action area
 * Horizontal layout with border on desktop, stacked on mobile
 */
export function SectionHeader({
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="w-full h-[7.5rem] px-6 sm:px-10 border-t border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center">
      <div className="flex-1 flex items-center text-white text-2xl sm:text-4xl font-medium font-britti-sans leading-10">
        {title}
      </div>
      {description && (
        <div className="hidden sm:flex w-[29rem] h-full p-10 border-l border-zinc-800 items-center">
          <div className="flex-1 text-gray-400 text-base font-normal leading-6">
            {description}
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
