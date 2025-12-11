'use client'

import type { ReactNode } from 'react'
import { EventsProvider } from '@/contexts/events-context'

export function Providers({ children }: { children: ReactNode }) {
  return <EventsProvider>{children}</EventsProvider>
}
