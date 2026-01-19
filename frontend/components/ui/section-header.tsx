import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description?: string | ReactNode | null
  titleAdornment?: ReactNode
  children?: ReactNode
}

/**
 * Section header with title and description, optional action area
 * Horizontal layout with border on desktop, stacked on mobile
 */
export function SectionHeader({
  title,
  description,
  titleAdornment,
  children,
}: SectionHeaderProps) {
  return (
    <div className="w-full h-30 px-6 sm:px-10 border-t border-b border-zinc-800 flex items-center">
      {/* Title section */}
      <div className="flex-1 flex items-center gap-1 text-white text-2xl sm:text-4xl font-medium font-britti-sans leading-10">
        {title}
        {titleAdornment}
      </div>

      {description && (
        <>
          {/* Vertical divider in the middle - only when description exists */}
          <div className="hidden sm:block w-px h-full bg-zinc-800" />

          {/* Description section */}
          <div className="hidden sm:flex w-2/5 h-full px-10 items-center">
            <div className="flex-1 text-text-secondary text-base font-normal leading-6">
              {description}
            </div>
          </div>
        </>
      )}
      {children}
    </div>
  )
}
