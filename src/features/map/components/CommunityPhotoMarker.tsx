'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'
import type { DetectionComment } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import { buildVoteReportHtml, initPopupInteractions } from './PopupInteractions'

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

function popupHtml(p: CommunityPhoto, comments?: DetectionComment[], showInteractions?: boolean): string {
  const addrLines: string[] = []
  if (p.street) addrLines.push(p.street)
  if (p.barangay) addrLines.push(p.barangay)
  if (p.city) addrLines.push(p.city)
  if (p.province) addrLines.push(p.province)
  if (p.region && p.region !== p.province) addrLines.push(p.region)
  if (p.country) addrLines.push(p.country)

  const severityColor = SEVERITY_COLOR[p.worst_severity ?? ''] ?? '#6b7280'
  const pid = p.id

  let html = `<div id="photo-popup-${pid}" style="min-width:240px;max-width:300px;font-family:system-ui,sans-serif;background:#0c0c14;border-radius:10px;padding:10px;">`

  // Image — smaller
  html += `<img src="${p.image_url}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`

  // Row: badges + date
  html += `<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:6px;">`
  if (p.worst_severity) {
    html += `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;color:${severityColor};background:${severityColor}15;">${p.worst_severity}</span>`
  }
  html += `<span style="padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;color:${STATUS_STYLE[p.detection_status]?.color ?? '#6b7280'};background:${(STATUS_STYLE[p.detection_status]?.color ?? '#6b7280')}15;">${STATUS_STYLE[p.detection_status]?.label ?? p.detection_status}</span>`
  html += `<span style="font-size:10px;color:#52525b;margin-left:auto;">${new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>`
  html += `</div>`

  // Detection info — compact
  if (p.detection_status === 'processed' && p.class_name) {
    html += `<div style="font-size:11px;color:#a1a1aa;margin-bottom:6px;">`
    html += `<span style="color:#e4e4e7;font-weight:600;">${p.class_name}</span>`
    if (p.confidence != null) html += ` · ${(p.confidence * 100).toFixed(0)}%`
    html += `</div>`
  }

  // Address — no background box
  if (addrLines.length > 0) {
    html += `<div style="font-size:11px;color:#a1a1aa;margin-bottom:6px;line-height:1.4;">${addrLines.join(', ')}</div>`
  } else {
    html += `<div style="font-size:10px;color:#52525b;margin-bottom:6px;">${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>`
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
  } else if (comments && comments.length === 0) {
    html += `<div style="font-size:10px;color:#52525b;margin-bottom:6px;">No comments yet</div>`
  }

  // Interactive section
  if (showInteractions) {
    const verifyCount = comments ? comments.filter((c) => c.body.includes('✅')).length : 0

    // Verify + comment input in one row
    html += `<div style="display:flex;gap:4px;margin-bottom:6px;align-items:center;">`
    html += `<button id="photo-verify-stillhere-${pid}" style="padding:4px 6px;border-radius:4px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.05);color:#22c55e;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;">✓ Here</button>`
    html += `<button id="photo-verify-fixed-${pid}" style="padding:4px 6px;border-radius:4px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:#ef4444;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;">✗ Fixed</button>`
    html += `<input id="photo-comment-input-${pid}" type="text" placeholder="Comment..." style="flex:1;padding:4px 8px;border-radius:4px;border:1px solid rgba(255,255,255,0.06);background:#0c0c14;color:#e4e4e7;font-size:11px;outline:none;min-width:0;" />`
    html += `<button id="photo-comment-send-${pid}" style="padding:4px 8px;border-radius:4px;background:rgba(230,168,23,0.15);color:#e6a817;font-size:10px;font-weight:700;border:none;cursor:pointer;">Send</button>`
    html += `</div>`

    if (verifyCount > 0) {
      html += `<div style="font-size:9px;color:#71717a;text-align:center;margin-bottom:6px;">${verifyCount} verification${verifyCount !== 1 ? 's' : ''}</div>`
    }

    // Vote + Report
    html += buildVoteReportHtml('photo', pid)
  }

  // Footer — inline
  html += `<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">`
  html += `<span style="font-size:9px;color:#52525b;">by ${p.reporter_username ?? 'Anonymous'}</span>`
  html += `<a href="/feed/photo/${pid}" target="_blank" style="font-size:10px;font-weight:600;color:#06b6d4;text-decoration:none;">Open in Feed →</a>`
  html += `</div>`

  html += `</div>`
  return html
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
      const pid = p.id

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

      marker.on('popupopen', () => {
        const popup = marker.getPopup()
        if (!popup) return

        async function loadAndRender() {
          const myPopup = marker.getPopup() ?? popup
          if (!myPopup) return

          const { data: commentsData } = await supabase.rpc('get_community_photo_comments', {
            p_photo_id: pid,
          })
          const comments = (commentsData ?? []) as DetectionComment[]
          const html = popupHtml(p, comments, true)
          myPopup.setContent(html)

          setTimeout(() => {
            const stillHereBtn = document.getElementById(`photo-verify-stillhere-${pid}`)
            const fixedBtn = document.getElementById(`photo-verify-fixed-${pid}`)
            const commentInput = document.getElementById(`photo-comment-input-${pid}`) as HTMLInputElement | null
            const commentSend = document.getElementById(`photo-comment-send-${pid}`)

            const doVerify = async (body: string) => {
              await supabase.rpc('create_community_photo_comment', {
                p_photo_id: pid,
                p_body: body,
              })
              loadAndRender()
            }

            if (stillHereBtn) stillHereBtn.onclick = () => doVerify('✅ Still here')
            if (fixedBtn) fixedBtn.onclick = () => doVerify('✅ Fixed')

            if (commentSend && commentInput) {
              const sendComment = () => {
                const text = commentInput.value.trim()
                if (!text) return
                commentSend.textContent = '...'
                commentInput.disabled = true
                supabase
                  .rpc('create_community_photo_comment', {
                    p_photo_id: pid,
                    p_body: text,
                  })
                  .then(() => {
                    commentInput.value = ''
                    loadAndRender()
                  })
              }
              commentSend.onclick = sendComment
              commentInput.onkeydown = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendComment()
                }
              }
            }

            initPopupInteractions('photo', pid, supabase)
          }, 0)
        }

        loadAndRender()
      })

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
