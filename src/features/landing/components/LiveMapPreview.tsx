'use client'

import { useState, useEffect, useRef } from 'react'
import { useLandingData } from '@/features/landing/hooks/useLandingData'
import { useTheme } from '@/contexts/ThemeContext'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/FadeIn'

type Severity = 'Severe' | 'Moderate' | 'Minor' | 'Unknown'

const SEVERITY_COLOR: Record<Severity, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
  Unknown: '#71717a',
}

function MapInner({ potholes, theme }: { potholes: { consolidated_latitude: number | null; consolidated_longitude: number | null; worst_severity: Severity }[]; theme: string }) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null)
  const mapRef = useRef<any>(null)
  const tileRef = useRef<any>(null)

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      setL(leaflet)
    })
  }, [])

  useEffect(() => {
    if (!L) return

    const container = document.getElementById('sipat-preview-map')
    if (!container) return

    if (!mapRef.current) {
      const map = L.map(container, {
        center: [14.5547, 121.0509],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        boxZoom: false,
        closePopupOnClick: false,
      })

      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

      const tile = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map)
      mapRef.current = map
      tileRef.current = tile

      potholes
        .filter((p) => p.consolidated_latitude != null && p.consolidated_longitude != null)
        .forEach((p) => {
          L.circleMarker([p.consolidated_latitude!, p.consolidated_longitude!], {
            radius: 6,
            color: SEVERITY_COLOR[p.worst_severity] ?? SEVERITY_COLOR.Unknown,
            fillColor: SEVERITY_COLOR[p.worst_severity] ?? SEVERITY_COLOR.Unknown,
            fillOpacity: 0.85,
            weight: 0,
          }).addTo(map)
        })
    } else {
      // Theme changed — swap tile layer
      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

      if (tileRef.current) {
        mapRef.current.removeLayer(tileRef.current)
      }
      const tile = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(mapRef.current)
      tileRef.current = tile
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [L, theme])

  // Add markers when potholes data arrives
  useEffect(() => {
    if (!L || !mapRef.current) return

    // Clear existing markers
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.CircleMarker) {
        mapRef.current.removeLayer(layer)
      }
    })

    potholes
      .filter((p) => p.consolidated_latitude != null && p.consolidated_longitude != null)
      .forEach((p) => {
        L.circleMarker([p.consolidated_latitude!, p.consolidated_longitude!], {
          radius: 6,
          color: SEVERITY_COLOR[p.worst_severity] ?? SEVERITY_COLOR.Unknown,
          fillColor: SEVERITY_COLOR[p.worst_severity] ?? SEVERITY_COLOR.Unknown,
          fillOpacity: 0.85,
          weight: 0,
        }).addTo(mapRef.current)
      })
  }, [L, potholes])

  return <div id="sipat-preview-map" className="h-full w-full" />
}

export function LiveMapPreview() {
  const data = useLandingData()
  const { theme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <FadeIn>
          <div className="mb-6">
            <p className="text-cyan-accent text-[11px] font-semibold uppercase tracking-widest">
              Live data
            </p>
            <h2 className="text-text-primary mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              See hazards in real time
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="relative h-72 overflow-hidden rounded-xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:h-80">
            <MapInner potholes={data.markers} theme={theme} />

            <div className={`absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-white/80'}`}>
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-green-safe" />
              <span className={`text-[10px] font-medium ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Live</span>
            </div>

            <Link
              href="/map"
              className={`absolute right-3 bottom-3 z-[1000] rounded-md px-3 py-1.5 text-xs font-medium backdrop-blur-sm transition-colors ${isDark ? 'bg-black/60 text-white/70 hover:text-white' : 'bg-white/80 text-gray-600 hover:text-gray-900'}`}
            >
              Open full map →
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <p className="text-text-secondary mt-3 text-xs">{data.markers.length} hazards plotted</p>
          <div className="mt-3 flex items-center gap-4">
            {[
              { label: 'Severe', color: 'bg-red-500' },
              { label: 'Moderate', color: 'bg-amber-500' },
              { label: 'Minor', color: 'bg-green-500' },
              { label: 'Unknown', color: 'bg-zinc-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-text-muted text-xs">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-text-muted mt-3 text-xs">
            Live from Supabase • Last updated: just now
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
