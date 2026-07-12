'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

const STATUS_STYLE: Record<string, { color: string; icon: string }> = {
  pending: { color: '#6b7280', icon: '?' },
  processed: { color: '#06b6d4', icon: '!' },
  no_detection: { color: '#3f3f46', icon: '—' },
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
          width: 32px; height: 32px; border-radius: 8px;
          background: ${style.color}; border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">${style.icon}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([p.latitude, p.longitude], { icon })

      const popupContent = `
        <div style="min-width: 180px;">
          <img src="${p.image_url}" style="width: 100%; border-radius: 6px; margin-bottom: 8px;" />
          <div style="font-size: 12px; color: #666;">
            ${p.formatted_address ?? `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`}
          </div>
          ${p.detection_status === 'processed' && p.confidence != null
            ? `<div style="margin-top: 4px; font-size: 12px; color: ${STATUS_STYLE[p.detection_status].color};">
                Detected: ${p.class_name} (${(p.confidence * 100).toFixed(0)}%)
              </div>`
            : p.detection_status === 'no_detection'
              ? `<div style="margin-top: 4px; font-size: 12px; color: #6b7280;">
                  No distress detected by system
                </div>`
              : `<div style="margin-top: 4px; font-size: 12px; color: #6b7280;">
                  Awaiting analysis...
                </div>`
          }
          <div style="margin-top: 4px; font-size: 11px; color: #999;">
            by ${p.reporter_username ?? 'Anonymous'} · ${new Date(p.created_at).toLocaleDateString()}
          </div>
        </div>
      `
      marker.bindPopup(popupContent)
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
