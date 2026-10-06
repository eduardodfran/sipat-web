'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FEED_PAGE_SIZE,
  dedupeById,
  fetchPotholes,
  fetchPhotos,
  type FeedResponse,
} from '@/lib/feedApi'
import type { Pothole } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

type SortBy = 'hot' | 'newest' | 'oldest'
type TypeFilter = 'all' | 'hazard' | 'community'

export { FEED_PAGE_SIZE }

export function useFeedData() {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [photos, setPhotos] = useState<CommunityPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState({ potholes: false, photos: false })

  const offsets = useRef({ potholes: 0, photos: 0 })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [p, ph] = await Promise.all([fetchPotholes(0), fetchPhotos(0)])
        if (cancelled) return
        const errors = [p.error, ph.error].filter(Boolean) as string[]
        setError(errors.length ? errors.join(' / ') : null)
        setPotholes(p.rows)
        setPhotos(ph.rows)
        setHasMore({
          potholes: p.rawCount === FEED_PAGE_SIZE,
          photos: ph.rawCount === FEED_PAGE_SIZE,
        })
        offsets.current = { potholes: p.rawCount, photos: ph.rawCount }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load feed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return
    setLoadingMore(true)
    try {
      const needPotholes = hasMore.potholes
      const needPhotos = hasMore.photos
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
      if (needPotholes) {
        setPotholes((prev) => dedupeById([...prev, ...p.rows], (r) => r.pothole_id))
        offsets.current.potholes += p.rawCount
      }
      if (needPhotos) {
        setPhotos((prev) => dedupeById([...prev, ...ph.rows], (r) => r.id))
        offsets.current.photos += ph.rawCount
      }
      setHasMore({
        potholes: needPotholes ? p.rawCount === FEED_PAGE_SIZE : false,
        photos: needPhotos ? ph.rawCount === FEED_PAGE_SIZE : false,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feed')
    } finally {
      setLoadingMore(false)
    }
  }, [hasMore, loading, loadingMore])

  return { potholes, photos, loading, loadingMore, error, hasMore, loadMore }
}

export type { SortBy, TypeFilter }
