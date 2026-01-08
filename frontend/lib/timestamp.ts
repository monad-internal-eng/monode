export function formatTimestamp(timestampNs: string): string {
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

export function formatRelativeTime(timestamp: number): string {
  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  const mins = Math.floor(diffSeconds / 60)
  const secs = diffSeconds % 60
  return secs === 0 ? `${mins}m ago` : `${mins}m ${secs}s`
}

export function formatTimeHMS(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
