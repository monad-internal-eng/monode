import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const brittiSans = localFont({
  src: './britti-sans-variable.woff2',
  variable: '--font-britti-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Execution Events SDK App',
  description: 'Execution Events SDK Showcase Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${brittiSans.variable} antialiased bg-[#0f0f1a]`}>
        {children}
      </body>
    </html>
  )
}
