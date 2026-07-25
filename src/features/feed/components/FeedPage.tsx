'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useServerData, type ProxyParams } from '@/hooks/useServerData'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { shortAddress } from '@/lib/address'
import type { Pothole, Severity } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

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

function formatTime(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function HazardCard({ pothole, timestamp }: { pothole: Pothole; timestamp: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-hazard/10">
          <svg className="h-4 w-4 text-red-hazard" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge severity={pothole.worst_severity ?? 'Unknown'} size="sm" />
            <span className="text-[11px] text-text-muted">{formatTime(timestamp)}</span>
          </div>
          {pothole.image_url && (
            <Image
              src={pothole.image_url}
              alt=""
              width={400}
              height={144}
              className="mt-2 h-36 w-full rounded-lg object-cover bg-white/[0.03]"
            />
          )}
          <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">
            <span className="text-text-primary font-semibold">{pothole.total_detection_hits} detection{pothole.total_detection_hits !== 1 ? 's' : ''}</span> at{' '}
            {shortAddress(pothole)}
          </p>
          <p className="mt-1 text-[11px] text-text-muted">
            {pothole.detectors_count} detector{pothole.detectors_count !== 1 ? 's' : ''} · {formatTime(pothole.citizen_first_reported_at)} first report
          </p>
        </div>
      </div>
    </div>
  )
}

function CommunityCard({ photo, timestamp }: { photo: CommunityPhoto; timestamp: string }) {
  const severity = (photo.worst_severity as Severity) ?? undefined
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-dim">
          <svg className="h-4 w-4 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-cyan-accent uppercase tracking-wider">Community Photo</span>
            {severity && <Badge severity={severity} size="sm" />}
            <span className="text-[11px] text-text-muted">{formatTime(timestamp)}</span>
          </div>
          <Image
            src={photo.image_url}
            alt="Community submitted"
            width={400}
            height={144}
            className="mt-2 h-36 w-full rounded-lg object-cover bg-white/[0.03]"
          />
          {photo.detection_status === 'processed' && photo.class_name && (
            <p className="mt-2 text-[13px] text-text-secondary">
              <span className="text-text-primary font-semibold">{photo.class_name}</span>
              {photo.confidence != null && ` · ${(photo.confidence * 100).toFixed(0)}% confidence`}
            </p>
          )}
          {photo.detection_status === 'no_detection' && (
            <p className="mt-2 text-[13px] text-text-muted">No distress detected</p>
          )}
          {photo.detection_status === 'pending' && (
            <p className="mt-2 text-[13px] text-text-muted">Awaiting analysis...</p>
          )}
          <p className="mt-1 text-[11px] text-text-muted">
            {photo.reporter_username ?? 'Anonymous'} · {photo.city ?? photo.latitude.toFixed(4) + ', ' + photo.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'hazard' | 'community'>('all')

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
  }, [hazards, photos, typeFilter])

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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-text-primary">Feed</h1>
          <p className="mt-1 text-[11px] text-text-muted">Recent hazard detections and community reports</p>
        </div>
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

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-text-muted">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-3">
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
