import type { Metadata } from 'next'
import Script from 'next/script'
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
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-asphalt text-white antialiased">
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
        <Script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js" strategy="beforeInteractive" />
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  )
}
