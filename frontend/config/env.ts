/**
 * Environment variable utilities with validation.
 */

function getEnvOrThrow(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }
  return value
}

function getEnvOrNull(key: string): string | null {
  return process.env[key] ?? null
}

/**
 * Server-side environment variables (not exposed to client).
 * Only use these in API routes or server components.
 */
export const serverEnv = {
  get BLOCKVISION_API_KEY() {
    return getEnvOrThrow('BLOCKVISION_API_KEY')
  },
}

/**
 * Public environment variables (exposed to client via NEXT_PUBLIC_ prefix).
 */
export const publicEnv = {
  get EVENTS_WS_URL() {
    return getEnvOrThrow('NEXT_PUBLIC_EVENTS_WS_URL')
  },
}

export { getEnvOrNull, getEnvOrThrow }
