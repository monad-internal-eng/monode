import type { Metadata } from 'next'
import { Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const brittiSans = localFont({
  src: './britti-sans-variable.woff2',
  variable: '--font-britti-sans',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Monad State Contention Explorer',
  description:
    'Real-time parallel execution contention intelligence for Monad. Analyzes storage access patterns to surface state conflicts and execution dependencies.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(brittiSans.variable, robotoMono.variable, 'antialiased')}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
