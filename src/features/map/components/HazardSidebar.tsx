'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { usePotholeDetectors } from '@/hooks/usePotholeDetectors'
import { useDetectionComments } from '@/hooks/useDetectionComments'
import { useAuth } from '@/contexts/AuthContext'
import type { Pothole, HazardStatus } from '@/lib/types'
import { fullAddress } from '@/lib/address'

const STATUS_CONFIG: Record<HazardStatus, { label: string; color: string }> = {
  reported: { label: 'Reported', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  confirmed: { label: 'Confirmed', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  fixed: { label: 'Fixed', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
}

function getConfidence(detections: number): { label: string; color: string; percent: number } {
  if (detections >= 10) return { label: 'High', color: 'text-green-400', percent: 100 }
  if (detections >= 5) return { label: 'Medium', color: 'text-amber-400', percent: 65 }
  if (detections >= 2) return { label: 'Low', color: 'text-amber-400', percent: 35 }
  return { label: 'Unverified', color: 'text-text-muted', percent: 15 }
}

const SEVERITY_LABEL: Record<string, string> = {
  Severe: 'text-red-400',
  Moderate: 'text-amber-400',
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
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl bg-surface-raised">
        <svg className="h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
        <span className="mt-2 text-sm text-text-muted">No image available</span>
      </div>
    )
  }

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-surface-raised">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10 flex animate-pulse flex-col items-center justify-center bg-surface-raised">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
          <span className="mt-3 text-sm text-text-secondary">Loading evidence&hellip;</span>
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
  top = 64,
}: {
  pothole: Pothole | null
  onClose: () => void
  top?: number
}) {
  const [visible, setVisible] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const { detectors, loading } = usePotholeDetectors(
    pothole?.consolidated_latitude ?? null,
    pothole?.consolidated_longitude ?? null,
  )
  const { comments, loading: commentsLoading, posting, postComment } = useDetectionComments(
    pothole?.pothole_id ?? null,
  )
  const { user } = useAuth()

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

  const conf = getConfidence(pothole.total_detection_hits)

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed bottom-0 right-0 z-[1001] w-full border-l border-white/[0.04] bg-[#0c0c14] shadow-2xl shadow-black/60 transition-transform duration-300 will-change-transform sm:w-96 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4">
            <div className="flex items-center gap-2">
              <Badge severity={pothole.worst_severity} size="md" />
              {(() => {
                const st = STATUS_CONFIG[pothole.status ?? 'reported']
                return (
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${st.color}`}>
                    {st.label}
                  </span>
                )
              })()}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
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

            <div className="mt-4 space-y-3">
              {/* Severity + confirmed row */}
              <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-surface-raised px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Severity</p>
                  <p className={`mt-0.5 text-lg font-bold ${SEVERITY_LABEL[pothole.worst_severity] ?? 'text-gray-400'}`}>
                    {pothole.worst_severity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Confirmed By</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{pothole.detectors_count}</p>
                </div>
              </div>

              <div className="border-t border-border px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Confidence</p>
                  <span className={`text-xs font-semibold ${conf.color}`}>{conf.label}</span>
                </div>
                <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${conf.percent === 100 ? 'bg-green-500' : conf.percent >= 65 ? 'bg-amber-500' : 'bg-text-muted'}`} style={{ width: `${conf.percent}%` }} />
                </div>
              </div>

              {/* Address */}
              {(() => {
                const addr = fullAddress(pothole)
                if (addr.length === 0) return null
                return (
                  <div className="rounded-xl border border-white/[0.04] bg-surface-raised px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Location</p>
                    <div className="mt-1 space-y-0.5">
                      {addr.map((line) => (
                        <p key={line} className="text-sm text-white">{line}</p>
                      ))}
                    </div>
                    <p className="mt-1.5 font-mono text-[10px] text-text-muted">
                      {pothole.consolidated_latitude?.toFixed(5)}, {pothole.consolidated_longitude?.toFixed(5)}
                    </p>
                  </div>
                )
              })()}

              {/* Activity dates */}
              <div className="rounded-xl border border-white/[0.04] bg-surface-raised px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">First reported</p>
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
                    <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">Last activity</p>
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
              <p className="text-center font-mono text-xs text-text-muted">
                Hazard #{pothole.pothole_id}
              </p>

              {/* Detector list */}
              {loading && (
                <div className="flex justify-center py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
                </div>
              )}
              {!loading && detectors.length > 0 && (
                <div className="rounded-xl border border-white/[0.04] bg-surface-raised p-3">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    Detected by ({detectors.length})
                  </p>
                  <div className="space-y-2">
                    {detectors.map((d, i) => (
                      <div key={`${d.user_id}-${i}`} className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-accent/15 text-xs font-bold text-cyan-accent">
                          {(d.username ?? d.full_name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {d.username ?? d.full_name ?? 'Unknown'}
                          </p>
                        </div>
                        <p className="shrink-0 text-[11px] text-text-secondary">
                          {new Date(d.detected_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {i === detectors.length - 1 && (
                          <span className="rounded-md bg-cyan-accent/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-accent">
                            Latest
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Community Verification */}
              <div className="rounded-xl border border-white/[0.04] bg-surface-raised px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-2">
                  Is this hazard still here?
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs font-semibold text-green-400 transition-colors hover:bg-green-500/10">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Still here
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Fixed
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] text-text-muted">
                  {pothole.detectors_count} community verifications
                </p>
              </div>

              {/* Detection comments */}
              <div className="rounded-xl border border-white/[0.04] bg-surface-raised p-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                  Detection comments ({comments.length})
                </p>

                {commentsLoading && (
                  <div className="flex justify-center py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
                  </div>
                )}

                {!commentsLoading && comments.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-accent/15 text-[10px] font-bold text-cyan-accent">
                          {(c.username ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-semibold text-white">
                              {c.username ?? 'Unknown'}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {new Date(c.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{c.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!commentsLoading && comments.length === 0 && (
                  <p className="mb-3 text-xs text-text-muted">No comments yet</p>
                )}

                {user ? (
                  <div className="flex gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-accent/15 text-xs font-bold text-cyan-accent">
                      {(user.email ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-1 gap-2">
                      <input
                        type="text"
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        placeholder="Write a comment..."
                        className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-asphalt px-3 py-1.5 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            if (commentDraft.trim() && !posting) {
                              postComment(commentDraft)
                              setCommentDraft('')
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (commentDraft.trim() && !posting) {
                            postComment(commentDraft)
                            setCommentDraft('')
                          }
                        }}
                        disabled={!commentDraft.trim() || posting}
                        className="rounded-lg bg-cyan-accent/15 px-2.5 py-1.5 text-xs font-semibold text-cyan-accent transition-colors hover:bg-cyan-accent/25 disabled:opacity-40"
                      >
                        {posting ? '...' : 'Send'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-muted">Sign in to comment</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
