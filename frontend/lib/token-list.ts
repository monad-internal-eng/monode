import tokenListData from '@/data/token-list.json'

interface TokenInfo {
  address: string
  name: string
  symbol: string
  logoURI?: string
}

/**
 * Pre-built lookup map from token-list.json for O(1) lookups.
 * Addresses are normalized to lowercase.
 */
const TOKEN_MAP: Map<string, TokenInfo> = new Map(
  tokenListData.tokens.map((token) => [
    token.address.toLowerCase(),
    {
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      logoURI: token.logoURI,
    },
  ]),
)

/**
 * Looks up a token by address in the static token list.
 * Returns null if not found.
 */
export function getTokenFromList(address: string): TokenInfo | null {
  return TOKEN_MAP.get(address.toLowerCase()) ?? null
}
