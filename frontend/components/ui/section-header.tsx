import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

/**
 * Section header with title and description, optional action area
 */
export function SectionHeader({
  title,
  description,
  children,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex-1">
        <h2 className="font-britti-sans text-2xl sm:text-[30px] font-medium leading-none text-white">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-text-secondary mt-2 leading-6">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
