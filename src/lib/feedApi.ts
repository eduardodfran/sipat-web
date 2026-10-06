import { supabase } from '@/lib/supabase'
import type { Pothole } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

export const FEED_PAGE_SIZE = 20

/* ─── row guards (mirror the RPC WHERE clauses; defense in depth) ─── */

export function isPotholeVisible(row: Pothole): boolean {
  const visibility = (row as { visibility_status?: string }).visibility_status
  const activity = (row as { activity_status?: string }).activity_status
  return (
    (visibility === undefined || visibility === 'visible') &&
    (activity === undefined || activity === 'active') &&
    !String((row as { caption?: string }).caption ?? '').startsWith('[HIDDEN]')
  )
}

export function isPhotoVisible(row: CommunityPhoto): boolean {
  return (
    (row.visibility_status ?? 'visible') === 'visible' &&
    (row.activity_status ?? 'active') === 'active' &&
    String(row.detection_status ?? 'processed') !== 'hidden'
  )
}

export function dedupeById<T>(rows: T[], getId: (row: T) => string | number): T[] {
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

export interface FeedResponse<T> {
  rows: T[]
  rawCount: number
  error: string | null
}

export async function fetchPotholes(offset: number): Promise<FeedResponse<Pothole>> {
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

export async function fetchPhotos(offset: number): Promise<FeedResponse<CommunityPhoto>> {
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
