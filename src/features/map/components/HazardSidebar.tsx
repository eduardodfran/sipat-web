'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { usePotholeDetectors } from '@/hooks/usePotholeDetectors'
import type { Pothole } from '@/lib/types'

const SEVERITY_LABEL: Record<string, string> = {
  Severe: 'text-red-400',
  Moderate: 'text-yellow-400',
  Minor: 'text-green-400',
  Unknown: 'text-gray-400',
}

function DetailImage({ imageUrl }: { imageUrl: string | null }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    imageUrl ? 'loading' : 'error',
  )

  useEffect(() => {
    setStatus(imageUrl ? 'loading' : 'error')
  }, [imageUrl])

  if (!imageUrl || status === 'error') {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl bg-[#1a1a22]">
        <svg className="h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
        <span className="mt-2 text-sm text-gray-600">No image available</span>
      </div>
    )
  }

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-[#1a1a22]">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex animate-pulse flex-col items-center justify-center bg-[#1a1a22]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <span className="mt-3 text-sm text-gray-500">Loading evidence&hellip;</span>
        </div>
      )}
      <Image
        src={imageUrl}
        alt="Hazard detection image"
        fill
        sizes="400px"
        className={`object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}

export default function HazardSidebar({
  pothole,
  onClose,
}: {
  pothole: Pothole | null
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)
  const { detectors, loading } = usePotholeDetectors(
    pothole?.consolidated_latitude ?? null,
    pothole?.consolidated_longitude ?? null,
  )

  useEffect(() => {
    if (pothole) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [pothole])

  useEffect(() => {
    if (!pothole) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pothole, onClose])

  if (!pothole) return null

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed bottom-0 right-0 top-16 z-40 w-full border-l border-white/[0.06] bg-[#08080c] shadow-2xl shadow-black/40 transition-transform duration-300 will-change-transform sm:w-96 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <Badge severity={pothole.worst_severity} size="md" />
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <DetailImage imageUrl={pothole.image_url} />

            {/* Reporter */}
            {pothole.reporter_username && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1a1a22] px-4 py-3">
                {pothole.reporter_avatar ? (
                  <img
                    src={pothole.reporter_avatar}
                    alt={pothole.reporter_username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-600/20 text-sm font-bold text-amber-400">
                    {pothole.reporter_username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Reported by</p>
                  <p className="text-sm font-semibold text-white">{pothole.reporter_username}</p>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {/* Severity + hits row */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#1a1a22] px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Severity</p>
                  <p className={`mt-0.5 text-lg font-bold ${SEVERITY_LABEL[pothole.worst_severity] ?? 'text-gray-400'}`}>
                    {pothole.worst_severity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Detections</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{pothole.total_detection_hits}</p>
                </div>
              </div>

              {/* Coordinates grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-[#1a1a22] px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Latitude</p>
                  <p className="mt-1 font-mono text-sm text-white">
                    {pothole.consolidated_latitude?.toFixed(5) ?? '—'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-[#1a1a22] px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Longitude</p>
                  <p className="mt-1 font-mono text-sm text-white">
                    {pothole.consolidated_longitude?.toFixed(5) ?? '—'}
                  </p>
                </div>
              </div>

              {/* Activity dates */}
              <div className="rounded-xl border border-white/[0.06] bg-[#1a1a22] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">First reported</p>
                    <p className="mt-0.5 text-sm text-white">
                      {pothole.citizen_first_reported_at
                        ? new Date(pothole.citizen_first_reported_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Last activity</p>
                    <p className="mt-0.5 text-sm text-white">
                      {pothole.latest_activity_at
                        ? new Date(pothole.latest_activity_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hazard ID */}
              <p className="text-center font-mono text-xs text-gray-600">
                Hazard #{pothole.pothole_id}
              </p>

              {/* Detector list */}
              {loading && (
                <div className="flex justify-center py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                </div>
              )}
              {!loading && detectors.length > 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#1a1a22] p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Detected by ({detectors.length})
                  </p>
                  <div className="space-y-2">
                    {detectors.map((d, i) => (
                      <div key={`${d.user_id}-${i}`} className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600/20 text-xs font-bold text-amber-400">
                          {(d.username ?? d.full_name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {d.username ?? d.full_name ?? 'Unknown'}
                          </p>
                        </div>
                        <p className="shrink-0 text-[11px] text-gray-500">
                          {new Date(d.detected_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {i === detectors.length - 1 && (
                          <span className="rounded-md bg-amber-600/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Latest
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
