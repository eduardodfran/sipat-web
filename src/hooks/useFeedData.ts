'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pothole } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

export const FEED_PAGE_SIZE = 20

type SortBy = 'hot' | 'newest' | 'oldest'
type TypeFilter = 'all' | 'hazard' | 'community'

/* ─── row guards (mirror the RPC WHERE clauses; defense in depth) ─── */

function isPotholeVisible(row: Pothole): boolean {
  const visibility = (row as { visibility_status?: string }).visibility_status
  const activity = (row as { activity_status?: string }).activity_status
  return (
    (visibility === undefined || visibility === 'visible') &&
    (activity === undefined || activity === 'active') &&
    !String((row as { caption?: string }).caption ?? '').startsWith('[HIDDEN]')
  )
}

function isPhotoVisible(row: CommunityPhoto): boolean {
  return (
    (row.visibility_status ?? 'visible') === 'visible' &&
    (row.activity_status ?? 'active') === 'active' &&
    String(row.detection_status ?? 'processed') !== 'hidden'
  )
}

function dedupeById<T>(rows: T[], getId: (row: T) => string | number): T[] {
  const seen = new Set<string | number>()
  const result: T[] = []
  for (const row of rows) {
    const id = getId(row)
    if (seen.has(id)) continue
    seen.add(id)
    result.push(row)
  }
  return result
}

interface FeedResponse<T> {
  rows: T[]
  rawCount: number
  error: string | null
}

async function fetchPotholes(offset: number): Promise<FeedResponse<Pothole>> {
  const { data, error } = await supabase.rpc('get_feed_potholes', {
    p_offset: offset,
    p_limit: FEED_PAGE_SIZE,
  })
  const all = (data ?? []) as unknown as Pothole[]
  return {
    rows: all.filter(isPotholeVisible),
    rawCount: all.length,
    error: error?.message ?? null,
  }
}

async function fetchPhotos(offset: number): Promise<FeedResponse<CommunityPhoto>> {
  const { data, error } = await supabase.rpc('get_feed_photos', {
    p_offset: offset,
    p_limit: FEED_PAGE_SIZE,
  })
  const all = (data ?? []) as unknown as CommunityPhoto[]
  return {
    rows: all.filter(isPhotoVisible),
    rawCount: all.length,
    error: error?.message ?? null,
  }
}

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
