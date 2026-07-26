'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useServerData, type ProxyParams } from '@/hooks/useServerData'
import { Badge } from '@/components/ui/Badge'
import { VoteButtons } from '@/components/feed/VoteButtons'
import { ReportButton } from '@/components/feed/ReportButton'
import CommentSection from '@/components/feed/CommentSection'
import VerifyButtons from '@/components/feed/VerifyButtons'
import { shortAddress } from '@/lib/address'
import { useTheme } from '@/contexts/ThemeContext'
import type { Pothole, Severity } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

function formatTime(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${color}`}>
      {initial}
    </div>
  )
}

function PotholeDetail({ pothole }: { pothole: Pothole }) {
  const address = shortAddress(pothole)
  return (
    <div className="space-y-5">
      {/* Image */}
      {pothole.image_url ? (
        <div className="relative h-64 w-full sm:h-80">
          <Image
            src={pothole.image_url}
            alt="Pothole detection"
            fill
            className="rounded-xl object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-xl bg-red-hazard/5">
          <div className="flex flex-col items-center gap-2">
            <svg className="h-10 w-10 text-red-hazard/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium text-red-hazard/40">Pothole</span>
          </div>
        </div>
      )}

      {/* Reporter */}
      <div className="flex items-center gap-3">
        <Avatar name={pothole.reporter_username} />
        <div>
          <p className="text-sm font-semibold text-text-primary">{pothole.reporter_username ?? 'Auto-detected'}</p>
          <p className="text-[11px] text-text-muted">{formatTime(pothole.citizen_first_reported_at || pothole.latest_activity_at)}</p>
        </div>
      </div>

      {/* Address */}
      {address && (
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-sm text-text-secondary leading-relaxed">{address}</p>
        </div>
      )}

      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge severity={pothole.worst_severity} size="md" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          {pothole.total_detection_hits} detection{pothole.total_detection_hits !== 1 ? 's' : ''}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 ring-1 ring-purple-500/20">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {pothole.detectors_count} detector{pothole.detectors_count !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Verify */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Verification</p>
        <VerifyButtons potholeId={pothole.pothole_id} />
      </div>

      {/* Vote + Report */}
      <div className="flex items-center gap-4">
        <VoteButtons contentType="pothole" contentId={String(pothole.pothole_id)} />
        <ReportButton contentType="pothole" contentId={String(pothole.pothole_id)} />
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <CommentSection potholeId={pothole.pothole_id} commentCount={0} />
      </div>
    </div>
  )
}

function PhotoDetail({ photo }: { photo: CommunityPhoto }) {
  const severity = (photo.worst_severity as Severity) ?? undefined
  const location = photo.city ?? photo.formatted_address ?? `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`

  return (
    <div className="space-y-5">
      {/* Image */}
      <div className="relative h-64 w-full sm:h-80">
        <Image
          src={photo.image_url}
          alt="Community submitted"
          fill
          className="rounded-xl object-cover"
          sizes="(max-width: 768px) 100vw, 672px"
          priority
        />
      </div>

      {/* Reporter */}
      <div className="flex items-center gap-3">
        <Avatar name={photo.reporter_username} />
        <div>
          <p className="text-sm font-semibold text-text-primary">{photo.reporter_username ?? 'Anonymous'}</p>
          <p className="text-[11px] text-text-muted">{formatTime(photo.created_at)}</p>
        </div>
      </div>

      {/* Detection status */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          photo.detection_status === 'processed'
            ? 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30'
            : photo.detection_status === 'pending'
              ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30'
              : 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30'
        }`}>
          {photo.detection_status === 'processed' ? 'Detected' : photo.detection_status === 'pending' ? 'Analyzing...' : 'No Detection'}
        </span>
        {severity && <Badge severity={severity} size="md" />}
      </div>

      {/* Detection details */}
      {photo.detection_status === 'processed' && photo.class_name && (
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-text-primary">{photo.class_name}</span>
          {photo.confidence != null && ` · ${(photo.confidence * 100).toFixed(0)}% confidence`}
        </p>
      )}

      {/* Location */}
      <div className="flex items-start gap-2">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-sm text-text-secondary">{location}</p>
      </div>

      {/* Verify */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Verification</p>
        <VerifyButtons photoId={photo.id} />
      </div>

      {/* Vote + Report */}
      <div className="flex items-center gap-4">
        <VoteButtons contentType="photo" contentId={String(photo.id)} />
        <ReportButton contentType="photo" contentId={String(photo.id)} />
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <CommentSection photoId={photo.id} commentCount={0} />
      </div>
    </div>
  )
}

export default function FeedDetailPage() {
  const params = useParams<{ type: string; id: string }>()
  const { theme, toggle } = useTheme()

  const isPothole = params?.type === 'pothole'
  const isPhoto = params?.type === 'photo'

  const potholeParams: ProxyParams | null = isPothole && params?.id ? {
    table: 'v_unified_potholes',
    columns: '*',
    filters: [{ column: 'pothole_id', operator: 'eq', value: Number(params.id) }],
    limit: 1,
  } : null

  const photoParams: ProxyParams | null = isPhoto && params?.id ? {
    table: 'community_photos',
    columns: '*',
    filters: [{ column: 'id', operator: 'eq', value: Number(params.id) }],
    limit: 1,
  } : null

  const { data: potholeData, loading: potholeLoading, error: potholeError } = useServerData<Record<string, unknown>[]>(
    potholeParams ?? { table: 'v_unified_potholes', limit: 0 },
  )
  const { data: photoData, loading: photoLoading, error: photoError } = useServerData<Record<string, unknown>[]>(
    photoParams ?? { table: 'community_photos', limit: 0 },
  )

  const loading = isPothole ? potholeLoading : isPhoto ? photoLoading : false
  const error = isPothole ? potholeError : isPhoto ? photoError : 'Invalid type'
  const pothole = potholeData?.[0] ? (potholeData[0] as unknown as Pothole) : null
  const photo = photoData?.[0] ? (photoData[0] as unknown as CommunityPhoto) : null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  if (error || (!pothole && !photo)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt gap-4">
        <p className="text-sm text-text-muted">{error ?? 'Not found'}</p>
        <Link href="/feed" className="text-sm text-cyan-accent hover:underline">Back to feed</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-asphalt">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
          <Link href="/feed" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <h1 className="text-sm font-semibold text-text-primary">
            {pothole ? 'Detection' : 'Photo Report'}
          </h1>
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 py-6">
        {pothole && <PotholeDetail pothole={pothole} />}
        {photo && <PhotoDetail photo={photo} />}
      </main>
    </div>
  )
}
