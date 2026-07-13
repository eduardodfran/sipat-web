'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'
import type { DetectionComment } from '@/lib/types'
import { supabase } from '@/lib/supabase'

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

  let html = `<div id="photo-popup-${pid}" style="min-width:220px;font-family:system-ui,sans-serif;">`

  html += `<img src="${p.image_url}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:10px;" />`

  html += `<div style="display:flex;gap:6px;margin-bottom:10px;">`
  if (p.worst_severity) {
    html += `<span style="padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;color:${severityColor};background:${severityColor}15;">${p.worst_severity}</span>`
  }
  html += `<span style="padding:3px 10px;border-radius:4px;font-size:11px;font-weight:600;color:${STATUS_STYLE[p.detection_status]?.color ?? '#6b7280'};background:${(STATUS_STYLE[p.detection_status]?.color ?? '#6b7280')}15;">${STATUS_STYLE[p.detection_status]?.label ?? p.detection_status}</span>`
  html += `</div>`

  if (p.detection_status === 'processed' && p.class_name) {
    html += `<div style="font-size:12px;color:#a1a1aa;margin-bottom:8px;">
      <span style="color:#e4e4e7;font-weight:600;">${p.class_name}</span>
      ${p.confidence != null ? ` · ${(p.confidence * 100).toFixed(0)}% confidence` : ''}
    </div>`
  }
  if (p.detection_status === 'no_detection') {
    html += '<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">No distress detected by system</div>'
  }
  if (p.detection_status === 'pending') {
    html += '<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">Awaiting analysis...</div>'
  }

  if (addrLines.length > 0) {
    html += `<div style="padding:8px;background:#141420;border-radius:8px;margin-bottom:8px;">`
    for (const l of addrLines) {
      html += `<div style="font-size:12px;color:#e4e4e7;line-height:1.5;">${l}</div>`
    }
    html += `</div>`
  } else {
    html += `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;">${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>`
  }

  // Comments
  if (comments && comments.length > 0) {
    html += `<div style="padding:8px;background:#141420;border-radius:8px;margin-bottom:8px;">`
    html += `<div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:6px;">Comments (${comments.length})</div>`
    const showComments = comments.slice(0, 3)
    for (const c of showComments) {
      const initial = (c.username ?? '?').charAt(0).toUpperCase()
      html += `<div style="display:flex;gap:6px;padding:4px 0;">`
      html += `<div style="width:22px;height:22px;border-radius:11px;background:rgba(230,168,23,0.15);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#e6a817;flex-shrink:0;margin-top:1px;">${initial}</div>`
      html += `<div style="flex:1;min-width:0;"><div style="font-size:11px;font-weight:600;color:#e4e4e7;">${c.username ?? 'Unknown'}</div><div style="font-size:11px;color:#a1a1aa;margin-top:1px;">${c.body}</div></div>`
      html += `</div>`
    }
    if (comments.length > 3) {
      html += `<div style="font-size:11px;color:#71717a;text-align:center;padding-top:4px;">View all ${comments.length} comments</div>`
    }
    html += `</div>`
  } else if (comments && comments.length === 0) {
    html += `<div style="font-size:11px;color:#6b7280;margin-bottom:8px;padding:4px 0;">No comments yet</div>`
  } else {
    html += `<div id="comments-loading-${pid}" style="font-size:11px;color:#6b7280;padding:8px 0;text-align:center;">Loading comments...</div>`
  }

  // Verification buttons
  if (showInteractions) {
    const verifyCount = comments ? comments.filter((c) => c.body.includes('✅')).length : 0
    html += `<div style="padding:8px;background:#141420;border-radius:8px;margin-bottom:8px;">`
    html += `<div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:6px;">Is this hazard still here?</div>`
    html += `<div style="display:flex;gap:6px;margin-bottom:4px;">`
    html += `<button id="photo-verify-stillhere-${pid}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 8px;border-radius:6px;border:1px solid rgba(34,197,94,0.2);background:rgba(34,197,94,0.05);color:#22c55e;font-size:11px;font-weight:600;cursor:pointer;">Still here</button>`
    html += `<button id="photo-verify-fixed-${pid}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;padding:6px 8px;border-radius:6px;border:1px solid rgba(239,68,68,0.2);background:rgba(239,68,68,0.05);color:#ef4444;font-size:11px;font-weight:600;cursor:pointer;">Fixed</button>`
    html += `</div>`
    html += `<div style="font-size:10px;color:#71717a;text-align:center;">${verifyCount} community verification${verifyCount !== 1 ? 's' : ''}</div>`
    html += `</div>`

    html += `<div style="padding:8px;background:#141420;border-radius:8px;margin-bottom:8px;">`
    html += `<div style="display:flex;gap:6px;">`
    html += `<input id="photo-comment-input-${pid}" type="text" placeholder="Write a comment..." style="flex:1;padding:6px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:#0c0c14;color:#e4e4e7;font-size:12px;outline:none;min-width:0;" />`
    html += `<button id="photo-comment-send-${pid}" style="padding:6px 12px;border-radius:6px;background:rgba(230,168,23,0.15);color:#e6a817;font-size:11px;font-weight:700;border:none;cursor:pointer;">Send</button>`
    html += `</div>`
    html += `</div>`
  }

  html += `<div style="font-size:11px;color:#52525b;border-top:1px solid rgba(255,255,255,0.04);padding-top:6px;">`
  html += `by <span style="color:#a1a1aa;">${p.reporter_username ?? 'Anonymous'}</span> · ${new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  html += `</div></div>`
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
