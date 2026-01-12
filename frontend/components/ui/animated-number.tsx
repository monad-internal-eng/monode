'use client'

import NumberFlow from '@number-flow/react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export { NumberFlowGroup as AnimatedNumberGroup } from '@number-flow/react'

const DEFAULT_FORMAT = {
  notation: 'standard',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
} as const

export type AnimatedNumberProps = ComponentProps<typeof NumberFlow>

export function AnimatedNumber({
  value,
  locales = 'en-US',
  format = DEFAULT_FORMAT,
  className,
  ...props
}: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      locales={locales}
      format={format}
      className={cn('tabular-nums', className)}
      {...props}
    />
  )
}
