import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getTokenFromList } from '@/lib/token-list'
import { cn, shortenHex } from '@/lib/utils'
import { UnknownTokenIcon } from './unknown-token-icon'

interface TokenIconProps {
  address?: string
  size?: number
  className?: string
}

export function TokenIcon({
  address,
  size = 16,
  className = '',
}: TokenIconProps) {
  const token = address ? getTokenFromList(address) : null
  const logoURI = token?.logoURI
  const name = token?.name
  const symbol = token?.symbol

  const getTooltipText = () => {
    if (name) return name
    if (symbol) return symbol
    if (address) return shortenHex(address)
    return 'Unknown token'
  }

  const getAltText = () => {
    if (symbol) return symbol.slice(0, 2).toUpperCase()
    return 'Unknown token'
  }

  // If we have a logo URI, show the image
  if (logoURI) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Image
            src={logoURI}
            alt={getAltText()}
            width={size}
            height={size}
            className={cn('rounded-full', className)}
          />
        </TooltipTrigger>
        <TooltipContent sideOffset={5}>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  // For unknown tokens, use the UnknownTokenIcon component
  return (
    <Tooltip>
      <TooltipTrigger>
        <UnknownTokenIcon symbol={symbol} size={size} className={className} />
      </TooltipTrigger>
      <TooltipContent sideOffset={5}>
        <p>{getTooltipText()}</p>
      </TooltipContent>
    </Tooltip>
  )
}
