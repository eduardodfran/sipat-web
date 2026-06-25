import type { Metadata } from 'next'
import Script from 'next/script'
import AuthWrapper from '@/components/layout/AuthWrapper'
import './globals.css'

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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="min-h-screen bg-asphalt text-white antialiased">
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  )
}
