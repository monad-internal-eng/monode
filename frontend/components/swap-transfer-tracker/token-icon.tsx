import Image from 'next/image'
import { getTokenFromList } from '@/lib/token-list'

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
  const symbol = token?.symbol

  if (logoURI) {
    return (
      <Image
        src={logoURI}
        alt={symbol ?? ''}
        width={size}
        height={size}
        className={`rounded-full ${className}`}
      />
    )
  }

  // Gray circle placeholder when no logo is available
  return (
    <div
      className={`rounded-full bg-zinc-600 ${className}`}
      style={{ width: size, height: size }}
      title={symbol ?? ''}
    />
  )
}
