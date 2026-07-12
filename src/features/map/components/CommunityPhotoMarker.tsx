'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

const STATUS_STYLE: Record<string, { color: string; icon: string; label: string }> = {
  pending: { color: '#6b7280', icon: '?', label: 'Analyzing...' },
  processed: { color: '#06b6d4', icon: '!', label: 'Detected' },
  no_detection: { color: '#3f3f46', icon: '—', label: 'No Distress' },
}

const SEVERITY_COLOR: Record<string, string> = {
  Severe: '#dc2626',
  Moderate: '#f59e0b',
  Minor: '#22c55e',
}

function popupHtml(p: CommunityPhoto): string {
  const addrLines: string[] = []
  if (p.street) addrLines.push(p.street)
  if (p.barangay) addrLines.push(p.barangay)
  if (p.city) addrLines.push(p.city)
  if (p.province) addrLines.push(p.province)
  if (p.region && p.region !== p.province) addrLines.push(p.region)
  if (p.country) addrLines.push(p.country)

  const severityColor = SEVERITY_COLOR[p.worst_severity ?? ''] ?? '#6b7280'

  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;">
      <img src="${p.image_url}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;" />

      <div style="display:flex;gap:6px;margin-bottom:10px;">
        ${p.worst_severity ? `<span style="padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;color:${severityColor};background:${severityColor}15;">${p.worst_severity}</span>` : ''}
        <span style="padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;color:${STATUS_STYLE[p.detection_status]?.color ?? '#6b7280'};background:${(STATUS_STYLE[p.detection_status]?.color ?? '#6b7280')}15;">
          ${STATUS_STYLE[p.detection_status]?.label ?? p.detection_status}
        </span>
      </div>

      ${p.detection_status === 'processed' && p.class_name ? `<div style="font-size:12px;color:#a1a1aa;margin-bottom:8px;">
        <span style="color:#e4e4e7;font-weight:600;">${p.class_name}</span>
        ${p.confidence != null ? ` · ${(p.confidence * 100).toFixed(0)}% confidence` : ''}
      </div>` : ''}
      ${p.detection_status === 'no_detection' ? '<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">No distress detected by system</div>' : ''}
      ${p.detection_status === 'pending' ? '<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Awaiting analysis...</div>' : ''}

      ${addrLines.length > 0 ? `
        <div style="padding:8px;background:#141420;border-radius:8px;margin-bottom:8px;">
          ${addrLines.map((l) => `<div style="font-size:12px;color:#e4e4e7;line-height:1.5;">${l}</div>`).join('')}
        </div>
      ` : `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>`}

      ${p.formatted_address && addrLines.length === 0 ? `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">${p.formatted_address}</div>` : ''}

      <div style="font-size:11px;color:#52525b;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">
        by <span style="color:#a1a1aa;">${p.reporter_username ?? 'Anonymous'}</span> · ${new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  `
}

type Props = {
  photos: CommunityPhoto[]
  map: L.Map
  onSelect?: (photo: CommunityPhoto) => void
}

export default function CommunityPhotoMarker({ photos, map, onSelect }: Props) {
  const groupRef = useRef<L.LayerGroup>(L.layerGroup())

  useEffect(() => {
    groupRef.current.clearLayers()

    for (const p of photos) {
      const style = STATUS_STYLE[p.detection_status] ?? STATUS_STYLE.pending

      const icon = L.divIcon({
        className: 'community-photo-marker',
        html: `<div style="
          width:32px;height:32px;border-radius:8px;
          background:${style.color};border:2px solid rgba(255,255,255,0.3);
          display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:14px;color:white;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
        ">${style.icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([p.latitude, p.longitude], { icon })
      marker.bindPopup(popupHtml(p), { maxWidth: 300, className: 'community-photo-popup' })
      marker.on('click', () => onSelect?.(p))
      groupRef.current.addLayer(marker)
    }

    groupRef.current.addTo(map)

    return () => {
      groupRef.current.clearLayers()
      groupRef.current.remove()
    }
  }, [photos, map])

  return null
}
