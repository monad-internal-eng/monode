/**
 * Utility functions for formatting timestamps from nanoseconds to readable format
 */

export function formatTimestamp(timestampNs: string): string {
  // Convert string nanoseconds to milliseconds
  const timestampMs = Number(timestampNs) / 1_000_000
  return new Date(timestampMs).toISOString()
}

export function formatTimeDisplay(timestamp: number | string) {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
  // Format as "12:39:31 p.m." with lowercase period-separated am/pm
  return time.replace(
    /\s?(AM|PM)$/i,
    (_, period) => ` ${period.toLowerCase().split('').join('.')}.`,
  )
}

export function formatDateDisplay(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}
