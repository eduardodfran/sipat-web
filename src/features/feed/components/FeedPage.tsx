'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useServerData, type ProxyParams } from '@/hooks/useServerData'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { VoteButtons } from '@/components/feed/VoteButtons'
import { ReportButton } from '@/components/feed/ReportButton'
import { shortAddress } from '@/lib/address'
import type { Pothole, Severity } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

/* ─── data mapping ─── */

function mapPothole(row: Record<string, unknown>): Pothole {
  return {
    pothole_id: row.pothole_id as number,
    consolidated_latitude: row.consolidated_latitude as number,
    consolidated_longitude: row.consolidated_longitude as number,
    worst_severity: (row.worst_severity as Severity) ?? 'Unknown',
    total_detection_hits: (row.total_detection_hits as number) ?? 0,
    citizen_first_reported_at: (row.citizen_first_reported_at as string) ?? '',
    latest_activity_at: (row.latest_activity_at as string) ?? '',
    image_url: (row.image_url as string | null) ?? null,
    reporter_username: (row.reporter_username as string | null) ?? null,
    reporter_avatar: (row.reporter_avatar as string | null) ?? null,
    detectors_count: (row.detectors_count as number) ?? 0,
    street: (row.street as string | null) ?? null,
    barangay: (row.barangay as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    province: (row.province as string | null) ?? null,
    region: (row.region as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    formatted_address: (row.formatted_address as string | null) ?? null,
    address_geocoded_at: (row.address_geocoded_at as string | null) ?? null,
  }
}

function mapPhoto(row: Record<string, unknown>): CommunityPhoto {
  return row as unknown as CommunityPhoto
}

/* ─── types ─── */

interface FeedItemBase {
  id: string
  type: 'hazard' | 'community'
  timestamp: string
}

interface HazardFeedItem extends FeedItemBase {
  type: 'hazard'
  pothole: Pothole
}

interface CommunityFeedItem extends FeedItemBase {
  type: 'community'
  photo: CommunityPhoto
}

type FeedItem = HazardFeedItem | CommunityFeedItem

/* ─── query params ─── */

const HAZARD_PARAMS: ProxyParams = {
  table: 'v_unified_potholes',
  columns:
    'pothole_id, consolidated_latitude, consolidated_longitude, worst_severity, total_detection_hits, citizen_first_reported_at, latest_activity_at, image_url, reporter_username, reporter_avatar, detectors_count, street, barangay, city, province, region, country, formatted_address, address_geocoded_at',
  order: { column: 'latest_activity_at', ascending: false },
  limit: 50,
  filters: [{ column: 'caption', operator: 'not.like', value: '[HIDDEN]%' }],
}

const PHOTO_PARAMS: ProxyParams = {
  table: 'community_photos',
  columns: '*',
  order: { column: 'created_at', ascending: false },
  limit: 50,
}

/* ─── helpers ─── */

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function getLocationKey(item: FeedItem): string {
  if (item.type === 'hazard') {
    return item.pothole.city ?? item.pothole.barangay ?? 'Unknown Location'
  }
  return item.photo.city ?? 'Unknown Location'
}

function Avatar({ name, size = 'sm' }: { name: string | null; size?: 'sm' | 'xs' }) {
  const initial = (name ?? '?')[0].toUpperCase()
  const colors = [
    'bg-cyan-dim text-cyan-accent',
    'bg-amber-500/15 text-amber-400',
    'bg-green-500/15 text-green-400',
    'bg-purple-500/15 text-purple-400',
    'bg-red-500/15 text-red-400',
  ]
  const color = colors[(name ?? '').charCodeAt(0) % colors.length]
  const dim = size === 'xs' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]'
  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-full font-bold ${color}`}>
      {initial}
    </div>
  )
}

/* ─── compact cards ─── */

function CompactHazardCard({ pothole, timestamp }: { pothole: Pothole; timestamp: string }) {
  const address = shortAddress(pothole)
  return (
    <Link
      href={`/feed/pothole/${pothole.pothole_id}`}
      className="group block rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-cyan-accent/30 hover:shadow-lg hover:shadow-black/10"
    >
      {/* Image */}
      {pothole.image_url ? (
        <div className="relative h-28 w-full">
          <Image
            src={pothole.image_url}
            alt=""
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 336px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <Badge severity={pothole.worst_severity} size="sm" />
            <span className="inline-flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              {pothole.total_detection_hits}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-20 w-full items-center justify-center bg-red-hazard/5">
          <svg className="h-6 w-6 text-red-hazard/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
      )}

      <div className="p-2.5">
        {/* Reporter + time */}
        <div className="flex items-center gap-1.5">
          <Avatar name={pothole.reporter_username} size="xs" />
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-text-primary">
            {pothole.reporter_username ?? 'Auto-detected'}
          </span>
          <span className="text-[9px] text-text-muted shrink-0">{formatTime(timestamp)}</span>
        </div>

        {/* Address */}
        {address && (
          <p className="mt-1 truncate text-[10px] text-text-muted">{address}</p>
        )}

        {/* Bottom row: votes + detectors */}
        <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <VoteButtons contentType="pothole" contentId={String(pothole.pothole_id)} />
          <span className="inline-flex items-center gap-0.5 text-[9px] text-text-muted">
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {pothole.detectors_count}
          </span>
        </div>
      </div>
    </Link>
  )
}

function CompactCommunityCard({ photo, timestamp }: { photo: CommunityPhoto; timestamp: string }) {
  const severity = (photo.worst_severity as Severity) ?? undefined
  return (
    <Link
      href={`/feed/photo/${photo.id}`}
      className="group block rounded-xl border border-border bg-surface overflow-hidden transition-all hover:border-cyan-accent/30 hover:shadow-lg hover:shadow-black/10"
    >
      {/* Image */}
      <div className="relative h-28 w-full">
        <Image
          src={photo.image_url}
          alt=""
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 336px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold backdrop-blur-sm ${
            photo.detection_status === 'processed'
              ? 'bg-green-500/30 text-green-300'
              : photo.detection_status === 'pending'
                ? 'bg-amber-500/30 text-amber-300'
                : 'bg-gray-500/30 text-gray-300'
          }`}>
            {photo.detection_status === 'processed' ? 'Detected' : photo.detection_status === 'pending' ? 'Analyzing' : 'Clear'}
          </span>
          {severity && <Badge severity={severity} size="sm" />}
        </div>
      </div>

      <div className="p-2.5">
        {/* Reporter + time */}
        <div className="flex items-center gap-1.5">
          <Avatar name={photo.reporter_username} size="xs" />
          <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-text-primary">
            {photo.reporter_username ?? 'Anonymous'}
          </span>
          <span className="text-[9px] text-text-muted shrink-0">{formatTime(timestamp)}</span>
        </div>

        {/* Detection detail */}
        {photo.detection_status === 'processed' && photo.class_name && (
          <p className="mt-1 truncate text-[10px] text-text-muted">
            {photo.class_name}{photo.confidence != null ? ` · ${(photo.confidence * 100).toFixed(0)}%` : ''}
          </p>
        )}

        {/* Bottom row: votes */}
        <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <VoteButtons contentType="photo" contentId={String(photo.id)} />
          <ReportButton contentType="photo" contentId={String(photo.id)} />
        </div>
      </div>
    </Link>
  )
}

/* ─── trending card (larger) ─── */

function TrendingCard({ item }: { item: FeedItem }) {
  if (item.type === 'hazard') {
    const p = item.pothole
    const address = shortAddress(p)
    return (
      <Link
        href={`/feed/pothole/${p.pothole_id}`}
        className="group relative block h-48 w-full overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-cyan-accent/30 hover:shadow-xl hover:shadow-black/20"
      >
        {p.image_url ? (
          <Image src={p.image_url} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="336px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-red-hazard/5">
            <svg className="h-10 w-10 text-red-hazard/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge severity={p.worst_severity} size="sm" />
            <span className="inline-flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              {p.total_detection_hits} hits
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
              {p.detectors_count} detectors
            </span>
          </div>
          {address && <p className="text-[11px] text-white/80 truncate">{address}</p>}
          <p className="text-[10px] text-white/50 mt-0.5">{p.reporter_username ?? 'Auto-detected'} · {formatTime(item.timestamp)}</p>
        </div>
      </Link>
    )
  }

  const photo = item.photo
  return (
    <Link
      href={`/feed/photo/${photo.id}`}
      className="group relative block h-48 w-full overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-cyan-accent/30 hover:shadow-xl hover:shadow-black/20"
    >
      <Image src={photo.image_url} alt="" fill className="object-cover transition-transform group-hover:scale-105" sizes="336px" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold backdrop-blur-sm ${
            photo.detection_status === 'processed' ? 'bg-green-500/30 text-green-300'
              : photo.detection_status === 'pending' ? 'bg-amber-500/30 text-amber-300'
                : 'bg-gray-500/30 text-gray-300'
          }`}>
            {photo.detection_status === 'processed' ? 'Detected' : photo.detection_status === 'pending' ? 'Analyzing' : 'Clear'}
          </span>
        </div>
        <p className="text-[10px] text-white/50">{photo.reporter_username ?? 'Anonymous'} · {formatTime(item.timestamp)}</p>
      </div>
    </Link>
  )
}

/* ─── main page ─── */

export default function FeedPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'hazard' | 'community'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_detected'>('newest')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const {
    data: hazards,
    loading: hazardsLoading,
    error: hazardsError,
  } = useServerData<Record<string, unknown>[]>(HAZARD_PARAMS)

  const {
    data: photos,
    loading: photosLoading,
    error: photosError,
  } = useServerData<Record<string, unknown>[]>(PHOTO_PARAMS)

  const allItems = useMemo<FeedItem[]>(() => {
    const result: FeedItem[] = []

    if ((typeFilter === 'all' || typeFilter === 'hazard') && hazards) {
      for (const row of hazards) {
        result.push({
          id: `hazard-${(row.pothole_id as number)}`,
          type: 'hazard',
          timestamp: (row.latest_activity_at as string) || (row.citizen_first_reported_at as string),
          pothole: mapPothole(row),
        })
      }
    }

    if ((typeFilter === 'all' || typeFilter === 'community') && photos) {
      for (const row of photos) {
        const p = mapPhoto(row)
        result.push({
          id: `photo-${p.id}`,
          type: 'community',
          timestamp: p.created_at,
          photo: p,
        })
      }
    }

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        break
      case 'most_detected':
        result.sort((a, b) => {
          const aHits = a.type === 'hazard' ? a.pothole.total_detection_hits : 0
          const bHits = b.type === 'hazard' ? b.pothole.total_detection_hits : 0
          return bHits - aHits
        })
        break
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        break
    }

    return result.slice(0, 50)
  }, [hazards, photos, typeFilter, sortBy])

  // Trending: top 3 by detection hits (hazards only)
  const trending = useMemo(() => {
    const hazardsOnly = allItems
      .filter((i) => i.type === 'hazard')
      .sort((a, b) => b.pothole.total_detection_hits - a.pothole.total_detection_hits)
    return hazardsOnly.slice(0, 3)
  }, [allItems])

  // Group by location
  const grouped = useMemo(() => {
    const map = new Map<string, FeedItem[]>()
    for (const item of allItems) {
      const key = getLocationKey(item)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return Array.from(map.entries())
  }, [allItems])

  const loading = hazardsLoading && photosLoading
  const error = hazardsError || photosError

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="border border-red-hazard/20 bg-red-hazard/5 p-6 text-center">
          <p className="text-xs font-medium text-red-400">Failed to load feed</p>
          <p className="mt-1 text-[10px] text-red-400/60">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Feed</h1>
          <p className="mt-0.5 text-[11px] text-text-muted">Hazard detections and community reports</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
            {([
              { key: 'newest' as const, label: 'New', icon: '↓' },
              { key: 'oldest' as const, label: 'Old', icon: '↑' },
              { key: 'most_detected' as const, label: 'Top', icon: '⚡' },
            ]).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                  sortBy === opt.key ? 'bg-cyan-accent text-asphalt' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-cyan-accent text-asphalt' : 'text-text-muted hover:text-text-secondary'}`}
              aria-label="Grid view"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-cyan-accent text-asphalt' : 'text-text-muted hover:text-text-secondary'}`}
              aria-label="List view"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
          </div>
          {/* Type filter */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
            {(['all', 'hazard', 'community'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  typeFilter === t ? 'bg-cyan-accent text-asphalt' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {t === 'all' ? 'All' : t === 'hazard' ? 'Video' : 'Photo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && allItems.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-text-muted">No activity yet</p>
        </div>
      ) : (
        <>
          {/* Trending row */}
          {trending.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
                </svg>
                <h2 className="text-sm font-bold text-text-primary">Trending</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {trending.map((item) => (
                  <TrendingCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Grouped feed */}
          {view === 'grid' ? (
            <div className="space-y-5">
              {grouped.map(([location, items]) => (
                <div key={location}>
                  <div className="mb-2.5 flex items-center gap-2">
                    <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <h3 className="text-xs font-semibold text-text-primary">{location}</h3>
                    <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[9px] font-medium text-text-muted">{items.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {items.map((item) =>
                      item.type === 'hazard' ? (
                        <CompactHazardCard key={item.id} pothole={item.pothole} timestamp={item.timestamp} />
                      ) : (
                        <CompactCommunityCard key={item.id} photo={item.photo} timestamp={item.timestamp} />
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {allItems.map((item) =>
                item.type === 'hazard' ? (
                  <CompactHazardCard key={item.id} pothole={item.pothole} timestamp={item.timestamp} />
                ) : (
                  <CompactCommunityCard key={item.id} photo={item.photo} timestamp={item.timestamp} />
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
