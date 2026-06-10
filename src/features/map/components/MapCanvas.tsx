'use client'

import { useEffect, useRef } from 'react'
import type { Pothole } from '@/lib/types'
import type { Severity } from '@/lib/types'

const SEVERITY_COLOR: Record<Severity, string> = {
  Severe: '#ef4444',
  Moderate: '#eab308',
  Minor: '#22c55e',
  Unknown: '#6b7280',
}

const SEVERITY_EMOJI: Record<Severity, string> = {
  Severe: '\u{1F534}',
  Moderate: '\u{1F7E1}',
  Minor: '\u{1F7E2}',
  Unknown: '\u26AA',
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MapCanvas({ potholes }: { potholes: Pothole[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || potholes.length === 0) return

    const L = (window as any).L
    if (!L) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, { zoomControl: false }).setView([14.5547, 121.0509], 13)
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map)
      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    const features = potholes
      .filter((p) => p.consolidated_latitude != null && p.consolidated_longitude != null)
      .map((p) => ({
        lat: p.consolidated_latitude!,
        lng: p.consolidated_longitude!,
        severity: p.worst_severity,
        hits: p.total_detection_hits,
        color: SEVERITY_COLOR[p.worst_severity],
        emoji: SEVERITY_EMOJI[p.worst_severity],
      }))

    const bounds: [number, number][] = []
    features.forEach((p: any) => {
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 10,
        color: p.color,
        fillColor: p.color,
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(map)

      const label = p.severity === 'Severe' ? '!' : p.hits.toString()
      marker.bindTooltip(label, { permanent: true, direction: 'center', className: 'hazard-label' })

      const popup =
        '<div class="hazard-popup">' +
        '<strong>' + p.emoji + ' ' + p.severity + '</strong>' +
        '<span class="hits">This hazard has been reported <b>' + p.hits + ' times</b></span>' +
        '</div>'
      marker.bindPopup(popup)
      bounds.push([p.lat, p.lng])
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [potholes])

  if (potholes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-white/5 bg-[#0f0f2a]">
        <div className="text-center">
          <svg
            className="mx-auto mb-3 h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503-11.063a18.022 18.022 0 013.968 1.373 18.18 18.18 0 016.115 4.874 18.15 18.15 0 013.093 7.368M6.75 4.5v.75A.75.75 0 016 6H4.5a.75.75 0 01-.75-.75v-.75m0 0h1.5m-1.5 0V3.75A2.25 2.25 0 017.875 1.5h.375m0 0h-.375A2.25 2.25 0 006 3.75v.75m0 0H4.5"
            />
          </svg>
          <p className="text-sm font-medium text-gray-500">No hazard data to display</p>
          <p className="mt-1 text-xs text-gray-600">Process a ride to see map markers</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="h-full w-full overflow-hidden rounded-2xl border border-white/5"
    />
  )
}
