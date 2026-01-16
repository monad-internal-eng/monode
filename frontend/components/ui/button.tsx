import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-mono text-sm uppercase cursor-pointer transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: [
          'rounded-md text-white',
          'bg-[radial-gradient(50%_50%_at_50%_50%,rgba(110,84,255,0)_0%,rgba(255,255,255,0.12)_100%),#6E54FF]',
          'shadow-[0_1px_2px_0_rgba(0,0,0,0.20),0_1px_0.5px_0_rgba(255,255,255,0.25)_inset,0_-1px_0.5px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(79,71,235,0.90)]',
          'hover:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(110,84,255,0.66)_29.81%,rgba(255,255,255,0.50)_100%),#6E54FF]',
          'hover:shadow-[0_1px_2px_0_rgba(0,0,0,0.20),0_0.75px_0.66px_0_rgba(255,255,255,0.80)_inset,0_-0.75px_0.66px_0_rgba(255,255,255,0.80)_inset,0_0_0_1px_rgba(79,71,235,0.50)]',
        ],
        secondary: [
          'rounded-md text-white',
          'bg-[radial-gradient(50%_50%_at_50%_50%,rgba(23,23,23,0.20)_0%,rgba(163,163,163,0.16)_100%),#0A0A0A]',
          'shadow-[0_1px_2px_0_rgba(0,0,0,0.20),0_0.5px_0.5px_0_rgba(255,255,255,0.25)_inset,0_-0.5px_0.5px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(0,0,0,0.80)]',
          'hover:bg-[radial-gradient(50%_50%_at_50%_50%,rgba(23,23,23,0.66)_0%,rgba(163,163,163,0.53)_100%),#0A0A0A]',
          'hover:shadow-[0_1px_2px_0_rgba(0,0,0,0.20),0_0.5px_0.5px_0_rgba(255,255,255,0.25)_inset,0_-0.5px_0.5px_0_rgba(255,255,255,0.25)_inset,0_0_0_1px_rgba(0,0,0,0.80)]',
        ],
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 py-1.5',
        lg: 'h-10 px-6 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
