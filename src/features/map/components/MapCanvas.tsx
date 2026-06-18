'use client'

import { useEffect, useRef } from 'react'
import type { Pothole, Severity } from '@/lib/types'
import type { RideRoute } from '@/hooks/useRideRoutes'
import { getRouteColor } from '@/hooks/useRideRoutes'

export type ViewMode = 'routes' | 'potholes' | 'all'

const SEVERITY_COLOR: Record<Severity, string> = {
  Severe: '#ef4444',
  Moderate: '#eab308',
  Minor: '#22c55e',
  Unknown: '#6b7280',
}

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'routes', label: 'Routes' },
  { key: 'potholes', label: 'Potholes' },
]

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MapCanvas({
  allPotholes,
  routes,
  viewMode,
  filter,
  onViewModeChange,
  onPotholeSelect,
}: {
  allPotholes: Pothole[]
  routes: RideRoute[]
  viewMode: ViewMode
  filter: Severity | 'All'
  onViewModeChange: (mode: ViewMode) => void
  onPotholeSelect?: (pothole: Pothole) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerLayerRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const markersRef = useRef<Map<number, { marker: any; severity: string }>>(new Map())

  /* eslint-disable react-hooks/exhaustive-deps */
  // Draw data effect — runs when the underlying data/view changes (not filter)
  useEffect(() => {
    if (!mapRef.current) return

    const L = (window as any).L
    if (!L) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, { zoomControl: false, preferCanvas: true })
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        updateWhenIdle: true,
        keepBuffer: 4,
      }).addTo(map)

      routeLayerRef.current = L.layerGroup().addTo(map)
      markerLayerRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current
    const showRoutes = viewMode === 'routes' || viewMode === 'all'
    const showPotholes = viewMode === 'potholes' || viewMode === 'all'
    const bounds: [number, number][] = []
    const newMarkers = new Map<number, { marker: any; severity: string }>()

    routeLayerRef.current.clearLayers()
    markerLayerRef.current.clearLayers()
    markersRef.current.clear()

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

    // Draw all pothole markers (filter visibility handled separately)
    if (showPotholes) {
      allPotholes
        .filter(
          (p) =>
            p.consolidated_latitude != null && p.consolidated_longitude != null,
        )
        .forEach((p) => {
          const color = SEVERITY_COLOR[p.worst_severity]
          const marker = LObj.circleMarker(
            [p.consolidated_latitude!, p.consolidated_longitude!],
            {
              radius: 7,
              color,
              fillColor: color,
              fillOpacity: 0.9,
              weight: 0,
            },
          ).addTo(markerLayerRef.current)

          const pid = p.pothole_id
          marker.on('click', () => {
            onPotholeSelect?.(allPotholes.find((ph) => ph.pothole_id === pid)!)
          })

          newMarkers.set(pid, { marker, severity: p.worst_severity })
          bounds.push([p.consolidated_latitude!, p.consolidated_longitude!])
        })
    }

    markersRef.current = newMarkers

    // Apply current filter visibility after drawing
    newMarkers.forEach(({ marker, severity }) => {
      const match = filter === 'All' || severity === filter
      marker.setStyle({ fillOpacity: match ? 0.9 : 0.08, opacity: match ? 0.9 : 0.08 })
    })

    map.invalidateSize()

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] })
    } else {
      map.setView([14.5547, 121.0509], 13)
    }
  }, [allPotholes, routes, viewMode])

  // Filter visibility effect — runs only when filter changes (no fitBounds)
  useEffect(() => {
    markersRef.current.forEach(({ marker, severity }) => {
      const match = filter === 'All' || severity === filter
      marker.setStyle({ fillOpacity: match ? 0.9 : 0.08, opacity: match ? 0.9 : 0.08 })
    })
  }, [filter])

  const hasData = allPotholes.length > 0 || routes.length > 0

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
