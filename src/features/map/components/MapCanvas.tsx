'use client'

import { useEffect, useRef } from 'react'
import type { Pothole } from '@/lib/types'
import type { Severity } from '@/lib/types'
import type { RideRoute } from '@/hooks/useRideRoutes'
import { getRouteColor } from '@/hooks/useRideRoutes'

export type ViewMode = 'routes' | 'potholes' | 'all'

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

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'routes', label: 'Routes' },
  { key: 'potholes', label: 'Potholes' },
]

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MapCanvas({
  potholes,
  routes,
  viewMode,
  onViewModeChange,
}: {
  potholes: Pothole[]
  routes: RideRoute[]
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerLayerRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const L = (window as any).L
    if (!L) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, { zoomControl: false })
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }).addTo(map)

      routeLayerRef.current = L.layerGroup().addTo(map)
      markerLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current
    const showRoutes = viewMode === 'routes' || viewMode === 'all'
    const showPotholes = viewMode === 'potholes' || viewMode === 'all'
    const bounds: [number, number][] = []

    routeLayerRef.current.clearLayers()
    markerLayerRef.current.clearLayers()

    const LObj = L

    // Draw route polylines
    if (showRoutes) {
      routes.forEach((route) => {
        if (route.points.length < 2) return

        const latlngs = route.points.map((p) => [p.lat, p.lng] as [number, number])
        const color = getRouteColor(route.status)

        LObj.polyline(latlngs, {
          color,
          weight: 3,
          opacity: 0.7,
          dashArray: route.status === 'queued' ? '6, 8' : null,
        }).addTo(routeLayerRef.current)

        bounds.push(latlngs[0], latlngs[latlngs.length - 1])
      })
    }

    // Draw pothole markers
    if (showPotholes) {
      const features = potholes
        .filter(
          (p) =>
            p.consolidated_latitude != null && p.consolidated_longitude != null,
        )
        .map((p) => ({
          lat: p.consolidated_latitude!,
          lng: p.consolidated_longitude!,
          severity: p.worst_severity,
          hits: p.total_detection_hits,
          color: SEVERITY_COLOR[p.worst_severity],
          emoji: SEVERITY_EMOJI[p.worst_severity],
          imageUrl: p.image_url,
          firstReported: p.citizen_first_reported_at,
          latestActivity: p.latest_activity_at,
          potholeId: p.pothole_id,
        }))

      features.forEach((p: any) => {
        const marker = LObj.circleMarker([p.lat, p.lng], {
          radius: 7,
          color: p.color,
          fillColor: p.color,
          fillOpacity: 0.9,
          weight: 0,
        }).addTo(markerLayerRef.current)

        const label = p.severity === 'Severe' ? '!' : p.hits.toString()
        marker.bindTooltip(label, {
          permanent: true,
          direction: 'center',
          className: 'hazard-label',
        })

        const firstReported = p.firstReported
          ? new Date(p.firstReported).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : ''

        const lastActivity = p.latestActivity
          ? new Date(p.latestActivity).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : ''

        const popup =
          '<div class="hazard-popup">' +
          (p.imageUrl
            ? '<img class="hazard-popup-img" src="' +
              p.imageUrl +
              '" alt="Hazard detection" />'
            : '<div class="hazard-popup-img-placeholder">' +
              '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>' +
              '</div>') +
          '<div class="hazard-popup-body">' +
          '<div class="hazard-popup-header">' +
          '<span class="hazard-popup-severity" style="color:' +
          p.color +
          '">' +
          p.emoji +
          ' ' +
          p.severity +
          '</span>' +
          '<span class="hazard-popup-hits">' +
          p.hits +
          ' detection' +
          (p.hits !== 1 ? 's' : '') +
          '</span>' +
          '</div>' +
          (firstReported
            ? '<div class="hazard-popup-divider"></div>' +
              '<p class="hazard-popup-date" style="margin-top:8px">Reported: ' +
              firstReported +
              '</p>'
            : '') +
          (lastActivity && lastActivity !== firstReported
            ? '<p class="hazard-popup-date">Last seen: ' +
              lastActivity +
              '</p>'
            : '') +
          '<p class="hazard-popup-coords">' +
          p.lat.toFixed(5) +
          ', ' +
          p.lng.toFixed(5) +
          '</p>' +
          '<p class="hazard-popup-id">#' +
          p.potholeId +
          '</p>' +
          '</div>' +
          '</div>'
        marker.bindPopup(popup, { maxWidth: 320 })
        bounds.push([p.lat, p.lng])
      })
    }

    map.invalidateSize()

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      map.setView([14.5547, 121.0509], 13)
    }
  }, [potholes, routes, viewMode])

  const hasData = potholes.length > 0 || routes.length > 0

  if (!hasData) {
    return (
      <div className="flex h-full items-center justify-center">
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
          <p className="text-sm font-medium text-gray-500">
            No hazard data to display
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Process a ride to see map markers
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-0 h-full w-full">
      {/* View mode toggle */}
      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        <div className="inline-flex overflow-hidden rounded-lg border border-white/10 bg-[#14141c]/90 shadow-lg shadow-black/30 backdrop-blur-md">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onViewModeChange(opt.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === opt.key
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={mapRef}
        className="h-full w-full"
      />
    </div>
  )
}
