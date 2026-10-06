'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FEED_PAGE_SIZE, fetchPotholes, fetchPhotos, type FeedResponse } from '@/lib/feedApi'
import { shortAddress } from '@/lib/address'
import type { Pothole, Severity } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

export interface ReviewItem {
  key: string
  kind: 'pothole' | 'photo'
  id: number
  href: string
  imageUrl: string | null
  eyebrow: string
  severity: Severity | null
  address: string
  reporter: string | null
  time: string
  detail: string
  hot: number
  upvotes: number
  downvotes: number
  userVote: 0 | 1 | -1
}

function toPotholeItem(p: Pothole): ReviewItem {
  return {
    key: `pothole-${p.pothole_id}`,
    kind: 'pothole',
    id: p.pothole_id,
    href: `/feed/pothole/${p.pothole_id}`,
    imageUrl: p.image_url,
    eyebrow: `Detection ${p.pothole_id}`,
    severity: (p.worst_severity as Severity) ?? 'Unknown',
    address: shortAddress(p),
    reporter: p.reporter_username,
    time: p.latest_activity_at || p.citizen_first_reported_at || '',
    detail: `${p.total_detection_hits ?? 0} detections · ${p.detectors_count ?? 0} detectors`,
    hot: p.hot_score ?? 0,
    upvotes: p.upvote_count ?? 0,
    downvotes: p.downvote_count ?? 0,
    userVote: p.user_vote ?? 0,
  }
}

function photoStatusLabel(status: string | undefined): string {
  if (status === 'processed') return 'Detected'
  if (status === 'manually_tagged') return 'Tagged'
  if (status === 'pending') return 'Analyzing'
  return 'Clear'
}

const SEVERITIES: string[] = ['Severe', 'Moderate', 'Minor', 'Unknown']

function toPhotoItem(ph: CommunityPhoto): ReviewItem {
  const status = photoStatusLabel(ph.detection_status)
  const classified =
    ph.detection_status === 'processed' || ph.detection_status === 'manually_tagged'
  const detail = classified && ph.class_name
    ? `${status} · ${ph.class_name}${ph.confidence != null ? ` ${Math.round(ph.confidence * 100)}%` : ''}`
    : status
  const sev = ph.worst_severity
  return {
    key: `photo-${ph.id}`,
    kind: 'photo',
    id: ph.id,
    href: `/feed/photo/${ph.id}`,
    imageUrl: ph.image_url,
    eyebrow: `Community photo ${ph.id}`,
    severity: sev && SEVERITIES.includes(sev) ? (sev as Severity) : null,
    address: shortAddress(ph),
    reporter: ph.reporter_username,
    time: ph.created_at,
    detail,
    hot: ph.hot_score ?? 0,
    upvotes: ph.upvote_count ?? 0,
    downvotes: ph.downvote_count ?? 0,
    userVote: ph.user_vote ?? 0,
  }
}

function timeMs(iso: string): number {
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Unvoted items from both feed types, merged by hot score (descending). */
function buildBatch(pRows: Pothole[], phRows: CommunityPhoto[]): ReviewItem[] {
  const batch = [
    ...pRows.filter((p) => (p.user_vote ?? 0) === 0).map(toPotholeItem),
    ...phRows.filter((ph) => (ph.user_vote ?? 0) === 0).map(toPhotoItem),
  ]
  batch.sort((a, b) => b.hot - a.hot || timeMs(b.time) - timeMs(a.time))
  return batch
}

export function useReviewQueue(enabled: boolean) {
  const [items, setItems] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState({ potholes: false, photos: false })
  const [reloadKey, setReloadKey] = useState(0)

  const offsets = useRef({ potholes: 0, photos: 0 })

  const loadInitial = useCallback(async () => {
    try {
      const [p, ph] = await Promise.all([fetchPotholes(0), fetchPhotos(0)])
      const errors = [p.error, ph.error].filter(Boolean) as string[]
      setError(errors.length ? errors.join(' / ') : null)
      setItems(buildBatch(p.rows, ph.rows))
      setHasMore({
        potholes: p.rawCount === FEED_PAGE_SIZE,
        photos: ph.rawCount === FEED_PAGE_SIZE,
      })
      offsets.current = { potholes: p.rawCount, photos: ph.rawCount }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the review queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const run = async () => {
      if (cancelled) return
      await loadInitial()
    }
    run()
    return () => {
      cancelled = true
    }
  }, [enabled, loadInitial, reloadKey])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((k) => k + 1)
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return
    const needPotholes = hasMore.potholes
    const needPhotos = hasMore.photos
    if (!needPotholes && !needPhotos) return
    setLoadingMore(true)
    try {
      const [p, ph] = await Promise.all([
        needPotholes
          ? fetchPotholes(offsets.current.potholes)
          : Promise.resolve<FeedResponse<Pothole>>({ rows: [], rawCount: 0, error: null }),
        needPhotos
          ? fetchPhotos(offsets.current.photos)
          : Promise.resolve<FeedResponse<CommunityPhoto>>({ rows: [], rawCount: 0, error: null }),
      ])
      const errors = [needPotholes ? p.error : null, needPhotos ? ph.error : null].filter(
        Boolean,
      ) as string[]
      if (errors.length) {
        setError(errors.join(' / '))
        return
      }
      const batch = buildBatch(p.rows, ph.rows)
      if (needPotholes) offsets.current.potholes += p.rawCount
      if (needPhotos) offsets.current.photos += ph.rawCount
      setHasMore({
        potholes: needPotholes ? p.rawCount === FEED_PAGE_SIZE : false,
        photos: needPhotos ? ph.rawCount === FEED_PAGE_SIZE : false,
      })
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.key))
        const fresh = batch.filter((i) => !seen.has(i.key))
        return [...prev, ...fresh]
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the review queue')
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loading, loadingMore])

  const moreAvailable = hasMore.potholes || hasMore.photos

  return { items, loading, loadingMore, error, hasMore: moreAvailable, loadMore, retry }
}
