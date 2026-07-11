import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import AuthWrapper from '@/components/layout/AuthWrapper'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Sipat — Road Hazard Intelligence',
  description:
    'Public commuter dashboard for real-time road anomaly mapping and civic hazard awareness.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-asphalt text-white antialiased">
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  )
}
