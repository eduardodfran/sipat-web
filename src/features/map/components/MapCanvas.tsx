'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.heat'

declare module 'leaflet' {
  function heatLayer(latlngs: Array<[number, number, number]>, options?: any): any
}

import type { Pothole, Severity, Detector, DetectionComment } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'
import type { RideRoute } from '@/hooks/useRideRoutes'
import { getRouteColor } from '@/hooks/useRideRoutes'
import { supabase } from '@/lib/supabase'
import { fullAddress } from '@/lib/address'
import CommunityPhotoMarker from './CommunityPhotoMarker'
import { buildVoteReportHtml, initPopupInteractions } from './PopupInteractions'

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

function getConfidence(detections: number): { label: string; color: string; percent: number } {
  if (detections >= 10) return { label: 'High', color: '#22c55e', percent: 100 }
  if (detections >= 5) return { label: 'Medium', color: '#f59e0b', percent: 65 }
  if (detections >= 2) return { label: 'Low', color: '#f59e0b', percent: 35 }
  return { label: 'Unverified', color: '#71717a', percent: 15 }
}

function buildPotholePopupHtml(p: Pothole, detectors?: Detector[], comments?: DetectionComment[], showInteractions?: boolean): string {
  const severityColor = SEVERITY_COLOR[p.worst_severity] ?? '#6b7280'
  const statusColors: Record<string, string> = { reported: '#3b82f6', confirmed: '#f59e0b', fixed: '#22c55e' }
  const statusLabels: Record<string, string> = { reported: 'Reported', confirmed: 'Confirmed', fixed: 'Fixed' }
  const addrLines = fullAddress(p)
  const conf = getConfidence(p.total_detection_hits)
  const pid = p.pothole_id
  const status = p.status ?? 'reported'

  let html = `<div id="pothole-popup-${pid}" style="min-width:240px;max-width:300px;font-family:system-ui,sans-serif;background:#0c0c14;border-radius:10px;padding:10px;">`

  // Image — smaller
  if (p.image_url) {
    html += `<img src="${p.image_url}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
  }

  // Row: badges + detectors + date
  html += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">`
  html += `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;color:${severityColor};background:${severityColor}15;">${p.worst_severity}</span>`
  html += `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;color:${statusColors[status]};background:${statusColors[status]}15;">${statusLabels[status]}</span>`
  html += `<span style="font-size:10px;color:#71717a;">${p.detectors_count} det</span>`
  html += `<span style="font-size:10px;color:#52525b;margin-left:auto;">${p.latest_activity_at ? new Date(p.latest_activity_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</span>`
  html += `</div>`

  // Address — no background box
  if (addrLines.length > 0) {
    html += `<div style="font-size:11px;color:#a1a1aa;margin-bottom:6px;line-height:1.4;">${addrLines.join(', ')}</div>`
  } else {
    html += `<div style="font-size:10px;color:#52525b;margin-bottom:6px;">${p.consolidated_latitude?.toFixed(4)}, ${p.consolidated_longitude?.toFixed(4)}</div>`
  }

  // Confidence bar — compact
  html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">`
  html += `<div style="flex:1;height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">`
  html += `<div style="height:100%;border-radius:2px;background:${conf.color};width:${conf.percent}%;"></div>`
  html += `</div>`
  html += `<span style="font-size:9px;font-weight:600;color:${conf.color};flex-shrink:0;">${conf.label}</span>`
  html += `</div>`

  // Detectors — max 3, scrollable
  if (detectors && detectors.length > 0) {
    const show = detectors.slice(0, 3)
    html += `<div style="max-height:80px;overflow-y:auto;margin-bottom:6px;">`
    html += `<div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:3px;">Detected by (${detectors.length})</div>`
    for (const d of show) {
      const initial = (d.username ?? d.full_name ?? '?').charAt(0).toUpperCase()
      html += `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;">`
      html += `<div style="width:18px;height:18px;border-radius:9px;background:rgba(230,168,23,0.15);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#e6a817;flex-shrink:0;">${initial}</div>`
      html += `<span style="font-size:11px;color:#e4e4e7;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${d.username ?? d.full_name ?? 'Unknown'}</span>`
      html += `<span style="font-size:9px;color:#52525b;flex-shrink:0;">${new Date(d.detected_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`
      html += `</div>`
    }
    if (detectors.length > 3) html += `<div style="font-size:10px;color:#71717a;text-align:center;">+${detectors.length - 3} more</div>`
    html += `</div>`
  } else if (detectors) {
    html += `<div style="font-size:10px;color:#52525b;margin-bottom:6px;">No detector data</div>`
  }

  // Comments — max 2, scrollable
  if (comments && comments.length > 0) {
    const show = comments.slice(0, 2)
    html += `<div style="max-height:70px;overflow-y:auto;margin-bottom:6px;">`
    html += `<div style="font-size:9px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:3px;">Comments (${comments.length})</div>`
    for (const c of show) {
      html += `<div style="display:flex;gap:5px;padding:2px 0;">`
      html += `<div style="width:16px;height:16px;border-radius:8px;background:rgba(230,168,23,0.15);display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;color:#e6a817;flex-shrink:0;">${(c.username ?? '?')[0].toUpperCase()}</div>`
      html += `<div style="flex:1;min-width:0;"><span style="font-size:10px;font-weight:600;color:#e4e4e7;">${c.username ?? 'Unknown'}</span> <span style="font-size:10px;color:#a1a1aa;">${c.body}</span></div>`
      html += `</div>`
    }
    if (comments.length > 2) html += `<div style="font-size:10px;color:#71717a;text-align:center;">+${comments.length - 2} more</div>`
    html += `</div>`
  } else if (comments) {
    html += `<div style="font-size:10px;color:#52525b;margin-bottom:6px;">No comments yet</div>`
  }

  // Interactive section
  if (showInteractions) {
    const verifyCount = comments ? comments.filter((c) => c.body.includes('✅')).length : 0

    // Verify + comment input in one row
    html += `<div style="display:flex;gap:4px;margin-bottom:6px;align-items:center;">`
    html += `<button id="verify-stillhere-${pid}" style="padding:4px 6px;border-radius:4px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.05);color:#22c55e;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;">✓ Here</button>`
    html += `<button id="verify-fixed-${pid}" style="padding:4px 6px;border-radius:4px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:#ef4444;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;">✗ Fixed</button>`
    html += `<input id="comment-input-${pid}" type="text" placeholder="Comment..." style="flex:1;padding:4px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);background:#0c0c14;color:#e4e4e7;font-size:11px;outline:none;min-width:0;" />`
    html += `<button id="comment-send-${pid}" style="padding:4px 8px;border-radius:4px;background:rgba(230,168,23,0.15);color:#e6a817;font-size:10px;font-weight:700;border:none;cursor:pointer;">Send</button>`
    html += `</div>`

    if (verifyCount > 0) {
      html += `<div style="font-size:9px;color:#71717a;text-align:center;margin-bottom:6px;">${verifyCount} verification${verifyCount !== 1 ? 's' : ''}</div>`
    }

    // Vote + Report in one row
    html += buildVoteReportHtml('pothole', pid)
  }

  // Footer — Open in Feed inline
  html += `<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">`
  html += `<span style="font-size:9px;color:#52525b;">Hazard #${pid}</span>`
  html += `<a href="/feed/pothole/${pid}" target="_blank" style="font-size:10px;font-weight:600;color:#06b6d4;text-decoration:none;">Open in Feed →</a>`
  html += `</div>`

  html += `</div>`
  return html
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const TILE_URL: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
}

export default function MapCanvas({
  allPotholes,
  routes,
  viewMode,
  filter,
  vizMode = 'markers',
  onViewModeChange,
  communityPhotos,
  showPotholeMarkers = true,
  theme = 'dark',
}: {
  allPotholes: Pothole[]
  routes: RideRoute[]
  viewMode: ViewMode
  filter: Severity | 'All'
  vizMode?: 'markers' | 'heatmap'
  onViewModeChange: (mode: ViewMode) => void
  communityPhotos?: CommunityPhoto[]
  showPotholeMarkers?: boolean
  theme?: 'light' | 'dark'
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const clusterGroupRef = useRef<any>(null)
  const routeLayerRef = useRef<any>(null)
  const heatLayerRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  const markersRef = useRef<Map<number, { marker: any; severity: string }>>(new Map())

  /* eslint-disable react-hooks/exhaustive-deps */
  // Draw data effect — runs when the underlying data/view changes (not filter)
  useEffect(() => {
    if (!mapRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, { zoomControl: false, preferCanvas: true })
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      const tile = L.tileLayer(TILE_URL[theme], {
        maxZoom: 19,
        attribution: '© CartoDB © OpenStreetMap',
        updateWhenIdle: true,
        keepBuffer: 4,
        opacity: theme === 'dark' ? 0.9 : 1,
      }).addTo(map)
      tileLayerRef.current = tile

      routeLayerRef.current = L.layerGroup().addTo(map)
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount()
          return L.divIcon({
            html: `<div class="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-accent text-asphalt text-xs font-bold">${count}</div>`,
            className: 'marker-cluster',
            iconSize: L.point(40, 40),
          })
        },
      })
      map.addLayer(clusterGroupRef.current)
      mapInstanceRef.current = map
      setMapReady(true)
    }

    const map = mapInstanceRef.current
    const showRoutes = viewMode === 'routes' || viewMode === 'all'
    const showPotholes = showPotholeMarkers && (viewMode === 'potholes' || viewMode === 'all')
    const bounds: [number, number][] = []
    const newMarkers = new Map<number, { marker: any; severity: string }>()

    routeLayerRef.current.clearLayers()
    clusterGroupRef.current.clearLayers()
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
          dashArray: route.status === 'queued' ? '6, 8' : undefined,
        }).addTo(routeLayerRef.current)

        bounds.push(latlngs[0], latlngs[latlngs.length - 1])
      })
    }

    // Draw all pothole markers (filter visibility handled separately)
    if (showPotholes && vizMode !== 'heatmap') {
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
          )
          clusterGroupRef.current.addLayer(marker)

          const pid = p.pothole_id
          const lat = p.consolidated_latitude!
          const lng = p.consolidated_longitude!

          marker.bindPopup(buildPotholePopupHtml(p), {
            maxWidth: 300,
            className: 'pothole-popup',
          })

          marker.on('popupopen', async () => {
            const popup = marker.getPopup()

            async function loadAndRender() {
              const myPopup = marker.getPopup() ?? popup
              if (!myPopup) return

              const [detectorsRes, commentsRes] = await Promise.all([
                supabase.rpc('get_pothole_detectors', { p_lat: lat, p_lng: lng }),
                supabase.rpc('get_detection_comments', { p_pothole_id: pid }),
              ])

              const detectors = (detectorsRes.data ?? []) as Detector[]
              const comments = (commentsRes.data ?? []) as DetectionComment[]
              const html = buildPotholePopupHtml(p, detectors, comments, true)
              myPopup.setContent(html)

              // Attach interactive event handlers after content renders
              setTimeout(() => {
                const el = (popup as any).getElement?.() ?? document.getElementById(`pothole-popup-${pid}`)
                if (!el) return

                const stillHereBtn = document.getElementById(`verify-stillhere-${pid}`)
                const fixedBtn = document.getElementById(`verify-fixed-${pid}`)
                const commentInput = document.getElementById(`comment-input-${pid}`) as HTMLInputElement | null
                const commentSend = document.getElementById(`comment-send-${pid}`)

                const doVerify = async (body: string) => {
                  await supabase.rpc('create_detection_comment', { p_pothole_id: pid, p_body: body })
                  loadAndRender()
                }

                if (stillHereBtn) {
                  stillHereBtn.onclick = () => doVerify('✅ Still here')
                }
                if (fixedBtn) {
                  fixedBtn.onclick = () => doVerify('✅ Fixed')
                }
                if (commentSend && commentInput) {
                  const sendComment = () => {
                    const text = commentInput.value.trim()
                    if (!text) return
                    commentSend.textContent = '...'
                    commentInput.disabled = true
                    supabase.rpc('create_detection_comment', { p_pothole_id: pid, p_body: text })
                      .then(() => {
                        commentInput.value = ''
                        loadAndRender()
                      })
                  }
                  commentSend.onclick = sendComment
                  commentInput.onkeydown = (e: KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment() }
                  }
                }

                initPopupInteractions('pothole', pid, supabase)
              }, 0)
            }

            loadAndRender()
          })

          newMarkers.set(pid, { marker, severity: p.worst_severity })
          bounds.push([lat, lng])
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
  }, [allPotholes, routes, viewMode, vizMode])

  // Filter visibility effect — runs only when filter changes (no fitBounds)
  useEffect(() => {
    markersRef.current.forEach(({ marker, severity }) => {
      const match = filter === 'All' || severity === filter
      marker.setStyle({ fillOpacity: match ? 0.9 : 0.08, opacity: match ? 0.9 : 0.08 })
    })
  }, [filter])

  // Theme tile swap
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return
    const map = mapInstanceRef.current
    const newUrl = TILE_URL[theme]
    map.removeLayer(tileLayerRef.current)
    const tile = L.tileLayer(newUrl, {
      maxZoom: 19,
      attribution: '© CartoDB © OpenStreetMap',
      updateWhenIdle: true,
      keepBuffer: 4,
      opacity: theme === 'dark' ? 0.9 : 1,
    }).addTo(map)
    tileLayerRef.current = tile
  }, [theme])

  // Heatmap layer effect
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current

    // Remove existing heatmap
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
      heatLayerRef.current = null
    }

    if (vizMode === 'heatmap') {
      const heatData: [number, number, number][] = []

      if (showPotholeMarkers) {
        allPotholes
          .filter(
            (p) =>
              p.consolidated_latitude != null && p.consolidated_longitude != null,
          )
          .forEach(
            (p) =>
              heatData.push([
                p.consolidated_latitude,
                p.consolidated_longitude,
                Math.min((p.total_detection_hits ?? 1) / 10, 1),
              ]),
          )
      }

      communityPhotos?.forEach((p) => {
        heatData.push([p.latitude, p.longitude, 0.5])
      })

      if (heatData.length > 0) {
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          max: 1.0,
          gradient: {
            0.2: '#22c55e',
            0.5: '#f59e0b',
            1.0: '#ef4444',
          },
        }).addTo(map)
      }
    }
  }, [allPotholes, vizMode, showPotholeMarkers, communityPhotos])

  const hasData = (showPotholeMarkers && allPotholes.length > 0) || routes.length > 0 || (communityPhotos && communityPhotos.length > 0)

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
          <p className="text-sm font-medium text-text-muted">
            No hazard data to display
          </p>
          <p className="mt-1 text-xs text-text-muted/60">
            {showPotholeMarkers ? 'Process a ride to see map markers' : 'No community photos yet'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-0 h-full w-full">
      {/* View mode toggle — only when pothole markers are shown */}
      {showPotholeMarkers && (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
          <div className="inline-flex overflow-hidden rounded-lg border border-border bg-surface/90 shadow-lg shadow-black/30 backdrop-blur-md">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => onViewModeChange(opt.key)}
                className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  viewMode === opt.key
                    ? 'bg-cyan-accent text-asphalt shadow-sm'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className="h-full w-full"
      />
      {mapReady && mapInstanceRef.current && communityPhotos && communityPhotos.length > 0 && vizMode !== 'heatmap' && (
        <CommunityPhotoMarker
          photos={communityPhotos}
          map={mapInstanceRef.current}
        />
      )}
    </div>
  )
}
