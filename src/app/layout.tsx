import type { Metadata } from 'next'
import Script from 'next/script'
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
      <body className="min-h-screen bg-[#0a0a1a] text-white antialiased">
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  )
}
