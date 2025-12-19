/**
 * Parse concatenated topics string into array of individual topics.
 * Topics come as a single hex string where each topic is 32 bytes (64 hex chars).
 * This is needed because the backend sends topics as a concatenated string.
 */
export function parseTopicsString(topicsStr: string | string[]): string[] {
  if (Array.isArray(topicsStr)) return topicsStr

  const clean = topicsStr.startsWith('0x') ? topicsStr.slice(2) : topicsStr

  const topics: string[] = []
  for (let i = 0; i < clean.length; i += 64) {
    topics.push(`0x${clean.slice(i, i + 64)}`)
  }

  return topics
}
