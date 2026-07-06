'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Severity = 'Severe' | 'Moderate' | 'Minor' | 'Unknown'

const SEVERITY_COLOR: Record<Severity, string> = {
  Severe: '#ef4444',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
  Unknown: '#71717a',
}

interface PotholeRow {
  consolidated_latitude: number | null
  consolidated_longitude: number | null
  worst_severity: Severity
}

export function LiveMapPreview() {
  const [potholes, setPotholes] = useState<PotholeRow[]>([])

  useEffect(() => {
    const fetchPotholes = async () => {
      const { data } = await supabase
        .from('v_unified_potholes')
        .select('consolidated_latitude, consolidated_longitude, worst_severity')

      if (data) setPotholes(data as PotholeRow[])
    }

    fetchPotholes()
  }, [])

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <div className="mb-6">
          <p className="text-cyan-accent text-[11px] font-semibold uppercase tracking-widest">
            Live data
          </p>
          <h2 className="text-text-primary mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            See hazards in real time
          </h2>
        </div>

        <div className="relative h-72 overflow-hidden rounded-xl border border-border sm:h-80">
          <MapContainer
            center={[14.5547, 121.0509]}
            zoom={12}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
            boxZoom={false}
            closePopupOnClick={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={19}
            />
            {potholes
              .filter(
                (p) =>
                  p.consolidated_latitude != null &&
                  p.consolidated_longitude != null,
              )
              .map((p, i) => (
                <CircleMarker
                  key={i}
                  center={[p.consolidated_latitude!, p.consolidated_longitude!]}
                  radius={6}
                  pathOptions={{
                    color: SEVERITY_COLOR[p.worst_severity] ?? SEVERITY_COLOR.Unknown,
                    fillColor: SEVERITY_COLOR[p.worst_severity] ?? SEVERITY_COLOR.Unknown,
                    fillOpacity: 0.85,
                    weight: 0,
                  }}
                />
              ))}
          </MapContainer>

          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-safe animate-pulse" />
            <span className="text-[10px] font-medium text-white/70">Live</span>
          </div>

          <Link
            href="/map"
            className="absolute right-3 bottom-3 z-[1000] rounded-md bg-black/60 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition-colors hover:text-white"
          >
            Open full map →
          </Link>
        </div>

        <p className="text-text-secondary mt-3 text-xs">{potholes.length} hazards plotted</p>
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
      </div>
    </section>
  )
}
