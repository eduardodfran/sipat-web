'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useServerData, type ProxyParams } from '@/hooks/useServerData'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { VoteButtons } from '@/components/feed/VoteButtons'
import { ReportButton } from '@/components/feed/ReportButton'
import CommentSection from '@/components/feed/CommentSection'
import VerifyButtons from '@/components/feed/VerifyButtons'
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
  limit: 30,
  filters: [{ column: 'caption', operator: 'not.like', value: '[HIDDEN]%' }],
}

const PHOTO_PARAMS: ProxyParams = {
  table: 'community_photos',
  columns: '*',
  order: { column: 'created_at', ascending: false },
  limit: 30,
}

/* ─── helpers ─── */

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function Avatar({ name }: { name: string | null }) {
  const initial = (name ?? '?')[0].toUpperCase()
  const colors = [
    'bg-cyan-dim text-cyan-accent',
    'bg-amber-500/15 text-amber-400',
    'bg-green-500/15 text-green-400',
    'bg-purple-500/15 text-purple-400',
    'bg-red-500/15 text-red-400',
  ]
  const color = colors[(name ?? '').charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${color}`}>
      {initial}
    </div>
  )
}

/* ─── cards ─── */

function HazardCard({ pothole, timestamp }: { pothole: Pothole; timestamp: string }) {
  const address = shortAddress(pothole)
  return (
    <Link
      href={`/feed/pothole/${pothole.pothole_id}`}
      className="block rounded-xl border border-border bg-surface overflow-hidden transition-colors hover:border-cyan-accent/30"
    >
      {/* Image */}
      {pothole.image_url ? (
        <div className="relative h-52 w-full">
          <Image
            src={pothole.image_url}
            alt="Pothole detection"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      ) : (
        <div className="flex h-32 w-full items-center justify-center bg-red-hazard/5">
          <div className="flex flex-col items-center gap-2">
            <svg className="h-8 w-8 text-red-hazard/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-xs font-medium text-red-hazard/40">Pothole</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Reporter row */}
        <div className="flex items-center gap-2">
          <Avatar name={pothole.reporter_username} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-text-primary truncate">
              {pothole.reporter_username ?? 'Auto-detected'}
            </p>
          </div>
          <span className="text-[10px] text-text-muted shrink-0">{formatTime(timestamp)}</span>
        </div>

        {/* Address */}
        {address && (
          <div className="mt-2.5 flex items-start gap-1.5">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <p className="text-[12px] text-text-secondary leading-relaxed">{address}</p>
          </div>
        )}

        {/* Meta badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge severity={pothole.worst_severity} size="sm" />
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/20">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            {pothole.total_detection_hits} hit{pothole.total_detection_hits !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400 ring-1 ring-purple-500/20">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {pothole.detectors_count} detector{pothole.detectors_count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Verify */}
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <VerifyButtons potholeId={pothole.pothole_id} />
        </div>

        {/* Vote + Report + Comment */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <VoteButtons contentType="pothole" contentId={String(pothole.pothole_id)} />
            <ReportButton contentType="pothole" contentId={String(pothole.pothole_id)} />
          </div>
          <CommentSection potholeId={pothole.pothole_id} commentCount={0} />
        </div>
      </div>
    </Link>
  )
}

function CommunityCard({ photo, timestamp }: { photo: CommunityPhoto; timestamp: string }) {
  const severity = (photo.worst_severity as Severity) ?? undefined
  const location = photo.city ?? photo.formatted_address ?? `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`

  return (
    <Link
      href={`/feed/photo/${photo.id}`}
      className="block rounded-xl border border-border bg-surface overflow-hidden transition-colors hover:border-cyan-accent/30"
    >
      {/* Image */}
      <div className="relative h-52 w-full">
        <Image
          src={photo.image_url}
          alt="Community submitted"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>

      <div className="p-4">
        {/* Reporter row */}
        <div className="flex items-center gap-2">
          <Avatar name={photo.reporter_username} />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-text-primary truncate">
              {photo.reporter_username ?? 'Anonymous'}
            </p>
          </div>
          <span className="text-[10px] text-text-muted shrink-0">{formatTime(timestamp)}</span>
        </div>

        {/* Detection status */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            photo.detection_status === 'processed'
              ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30'
              : photo.detection_status === 'pending'
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
                : 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30'
          }`}>
            {photo.detection_status === 'processed' ? 'Detected' : photo.detection_status === 'pending' ? 'Analyzing...' : 'No Detection'}
          </span>
          {severity && <Badge severity={severity} size="sm" />}
        </div>

        {/* Detection details */}
        {photo.detection_status === 'processed' && photo.class_name && (
          <p className="mt-2 text-[12px] text-text-secondary">
            <span className="font-semibold text-text-primary">{photo.class_name}</span>
            {photo.confidence != null && ` · ${(photo.confidence * 100).toFixed(0)}% confidence`}
          </p>
        )}

        {/* Location */}
        <div className="mt-2 flex items-start gap-1.5">
          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-[12px] text-text-secondary">{location}</p>
        </div>

        {/* Verify */}
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <VerifyButtons photoId={photo.id} />
        </div>

        {/* Vote + Report + Comment */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <VoteButtons contentType="photo" contentId={String(photo.id)} />
            <ReportButton contentType="photo" contentId={String(photo.id)} />
          </div>
          <CommentSection photoId={photo.id} commentCount={0} />
        </div>
      </div>
    </Link>
  )
}

/* ─── main page ─── */

export default function FeedPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'hazard' | 'community'>('all')
  const [locationFilter, setLocationFilter] = useState({ country: '', city: '', street: '' })
  const [showFilter, setShowFilter] = useState(false)

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

  const items = useMemo<FeedItem[]>(() => {
    const result: FeedItem[] = []

    if ((typeFilter === 'all' || typeFilter === 'hazard') && hazards) {
      for (const row of hazards) {
        const p = mapPothole(row)
        // location filter
        if (locationFilter.country && !(p.country ?? '').toLowerCase().includes(locationFilter.country.toLowerCase())) continue
        if (locationFilter.city && !(p.city ?? '').toLowerCase().includes(locationFilter.city.toLowerCase())) continue
        if (locationFilter.street && !(p.street ?? '').toLowerCase().includes(locationFilter.street.toLowerCase())) continue
        result.push({
          id: `hazard-${p.pothole_id}`,
          type: 'hazard',
          timestamp: p.latest_activity_at || p.citizen_first_reported_at,
          pothole: p,
        })
      }
    }

    if ((typeFilter === 'all' || typeFilter === 'community') && photos) {
      for (const row of photos) {
        const p = mapPhoto(row)
        // location filter
        if (locationFilter.country && !(p.country ?? '').toLowerCase().includes(locationFilter.country.toLowerCase())) continue
        if (locationFilter.city && !(p.city ?? '').toLowerCase().includes(locationFilter.city.toLowerCase())) continue
        if (locationFilter.street && !(p.street ?? '').toLowerCase().includes(locationFilter.street.toLowerCase())) continue
        result.push({
          id: `photo-${p.id}`,
          type: 'community',
          timestamp: p.created_at,
          photo: p,
        })
      }
    }

    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return result.slice(0, 50)
  }, [hazards, photos, typeFilter, locationFilter])

  const loading = hazardsLoading && photosLoading
  const error = hazardsError || photosError

  const hasFilter = locationFilter.country || locationFilter.city || locationFilter.street

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
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-text-primary">Feed</h1>
          <p className="mt-0.5 text-[11px] text-text-muted">Recent hazard detections and community reports</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`rounded-lg p-2 transition-colors ${
              showFilter || hasFilter
                ? 'bg-cyan-accent/15 text-cyan-accent'
                : 'text-text-muted hover:bg-surface-hover hover:text-text-secondary'
            }`}
            aria-label="Toggle location filter"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </button>
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5">
            {(['all', 'hazard', 'community'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  typeFilter === t
                    ? 'bg-cyan-accent text-asphalt'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {t === 'all' ? 'All' : t === 'hazard' ? 'Video' : 'Photo'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Location filter */}
      {showFilter && (
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-3">
          <div className="flex-1 min-w-[100px]">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-muted">Country</label>
            <input
              type="text"
              value={locationFilter.country}
              onChange={(e) => setLocationFilter((p) => ({ ...p, country: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-cyan-accent/50"
              placeholder="Philippines"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-muted">City</label>
            <input
              type="text"
              value={locationFilter.city}
              onChange={(e) => setLocationFilter((p) => ({ ...p, city: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-cyan-accent/50"
              placeholder="City name"
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-text-muted">Street</label>
            <input
              type="text"
              value={locationFilter.street}
              onChange={(e) => setLocationFilter((p) => ({ ...p, street: e.target.value }))}
              className="w-full rounded-lg border border-border bg-surface-raised px-2.5 py-1.5 text-[11px] text-text-primary placeholder-text-muted outline-none focus:border-cyan-accent/50"
              placeholder="Street name"
            />
          </div>
          {hasFilter && (
            <button
              onClick={() => setLocationFilter({ country: '', city: '', street: '' })}
              className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-text-muted transition-colors hover:text-text-secondary"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Feed */}
      {loading && items.length === 0 ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-text-muted">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) =>
            item.type === 'hazard' ? (
              <HazardCard key={item.id} pothole={item.pothole} timestamp={item.timestamp} />
            ) : (
              <CommunityCard key={item.id} photo={item.photo} timestamp={item.timestamp} />
            ),
          )}
        </div>
      )}
    </div>
  )
}
