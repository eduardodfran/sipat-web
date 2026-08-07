'use client'

import { useState } from 'react'
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
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import type { Pothole, Severity } from '@/lib/types'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'

/* ─── shared helpers ─── */

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

function Avatar({ name, size = 'md' }: { name: string | null; size?: 'sm' | 'md' }) {
  const initial = (name ?? '?')[0].toUpperCase()
  const colors = [
    'bg-cyan-accent/20 text-cyan-accent',
    'bg-amber-warn/20 text-amber-warn',
    'bg-green-safe/20 text-green-safe',
    'bg-purple-500/20 text-purple-400',
    'bg-red-hazard/20 text-red-hazard',
  ]
  const color = colors[(name ?? '').charCodeAt(0) % colors.length]
  const dim = size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-10 w-10 text-[14px]'
  return (
    <div className={`flex ${dim} shrink-0 items-center justify-center rounded-full font-bold ${color}`}>
      {initial}
    </div>
  )
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 block text-[11px] font-semibold uppercase tracking-widest text-cyan-accent">
      {children}
    </span>
  )
}

/* ─── image zoom ─── */

function ImageZoom({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        className="group relative h-56 w-full cursor-zoom-in overflow-hidden rounded-2xl ring-1 ring-border transition-all hover:ring-cyan-accent/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]"
        onClick={() => setOpen(true)}
      >
        <Image src={src} alt={alt} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
          </svg>
          View full size
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <Image src={src} alt={alt} width={1200} height={800} className="max-h-[85vh] w-auto rounded-2xl object-contain" />
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

/* ─── mini map ─── */

function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const x = Math.floor(((lng + 180) / 360) * (1 << 15))
  const y = Math.floor((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * (1 << 15))
  const tileUrl = `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/15/${x}/${y}.png`

  return (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-40 w-full overflow-hidden rounded-2xl ring-1 ring-border transition-all hover:ring-cyan-accent/40"
    >
      <img src={tileUrl} alt="Map" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <span className="text-[11px] text-white/70 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-accent/90 px-3 py-1 text-[10px] font-bold text-asphalt transition-colors group-hover:bg-cyan-hover">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Open in Maps
        </span>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-5 w-5 rounded-full bg-red-hazard ring-4 ring-red-hazard/30" />
      </div>
    </a>
  )
}

/* ─── stat card ─── */

function StatCard({
  label,
  value,
  color,
  borderColor,
  icon,
}: {
  label: string
  value: string | number
  color: string
  borderColor: string
  icon: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} bg-surface p-4 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-10`}>
          {icon}
        </div>
        <div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">{label}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── nearby hazards ─── */

function NearbyHazards({ currentId }: { currentId: number }) {
  const nearbyParams: ProxyParams = {
    table: 'v_unified_potholes',
    columns: 'pothole_id, worst_severity, total_detection_hits, detectors_count, city, barangay, street',
    order: { column: 'latest_activity_at', ascending: false },
    limit: 10,
  }
  const { data } = useServerData<Record<string, unknown>[]>(nearbyParams)

  const nearby = (data ?? [])
    .map((r) => r as unknown as Pothole)
    .filter((p) => p.pothole_id !== currentId)
    .slice(0, 3)

  if (nearby.length === 0) return null

  const severityBorder: Record<string, string> = {
    Severe: 'border-l-red-hazard',
    Moderate: 'border-l-amber-warn',
    Minor: 'border-l-green-safe',
    Unknown: 'border-l-text-muted',
  }

  return (
    <div>
      <SectionTag>Nearby Hazards</SectionTag>
      <div className="space-y-2">
        {nearby.map((p) => (
          <Link
            key={p.pothole_id}
            href={`/feed/pothole/${p.pothole_id}`}
            className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 border-l-[3px] transition-all hover:border-cyan-accent/30 hover:bg-surface-hover ${severityBorder[p.worst_severity] ?? 'border-l-text-muted'}`}
          >
            <Badge severity={p.worst_severity} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-text-primary">
                {shortAddress(p) ?? 'Unknown location'}
              </p>
              <p className="text-[10px] text-text-muted">
                {p.total_detection_hits} detection{p.total_detection_hits !== 1 ? 's' : ''} · {p.detectors_count} detector{p.detectors_count !== 1 ? 's' : ''}
              </p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─── header ─── */

function PageHeader({ title, theme, toggle }: { title: string; theme: string; toggle: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/feed" className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </Link>
        <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
        <button onClick={toggle} className="rounded-xl p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary" aria-label="Toggle theme">
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
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-accent/40 to-transparent" />
    </header>
  )
}

/* ─── pothole view ─── */

function PotholeView({ id }: { id: string }) {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const params: ProxyParams = {
    table: 'v_unified_potholes',
    columns: '*',
    filters: [{ column: 'pothole_id', operator: 'eq', value: Number(id) }],
    limit: 1,
  }
  const { data, loading, error } = useServerData<Record<string, unknown>[]>(params)
  const pothole = data?.[0] ? (data[0] as unknown as Pothole) : null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  if (error || !pothole) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt gap-4">
        <p className="text-sm text-text-muted">{error ?? 'Not found'}</p>
        <Link href="/feed" className="text-sm text-cyan-accent hover:underline">Back to feed</Link>
      </div>
    )
  }

  const address = shortAddress(pothole)

  return (
    <div className="min-h-screen bg-asphalt">
      <PageHeader title="Detection" theme={theme} toggle={toggle} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column — visual */}
          <div className="space-y-6">
            {pothole.image_url && <ImageZoom src={pothole.image_url} alt="Pothole detection" />}

            <MiniMap lat={pothole.consolidated_latitude} lng={pothole.consolidated_longitude} />

            <NearbyHazards currentId={pothole.pothole_id} />
          </div>

          {/* Right column — details */}
          <div className="space-y-5">
            {/* Reporter */}
            <div className="flex items-center gap-3">
              <Link href={`/profile/${pothole.reporter_username ?? ''}`} className="flex items-center gap-3 flex-1 min-w-0 rounded-xl p-2 -m-2 transition-colors hover:bg-surface-hover">
                <Avatar name={pothole.reporter_username} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary truncate hover:underline">{pothole.reporter_username ?? 'Auto-detected'}</p>
                  <p className="text-[11px] text-text-muted">{formatTime(pothole.citizen_first_reported_at || pothole.latest_activity_at)}</p>
                </div>
              </Link>
              <Badge severity={pothole.worst_severity} size="md" />
            </div>

            {/* Address */}
            {address && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-sm text-text-secondary leading-relaxed">{address}</p>
              </div>
            )}

            {/* Stats */}
            <div>
              <SectionTag>Detection Info</SectionTag>
              <div className="grid grid-cols-2 gap-2">
                <StatCard
                  label="Severity"
                  value={pothole.worst_severity}
                  color="text-red-hazard"
                  borderColor="border-red-hazard/20 hover:border-red-hazard/40"
                  icon={
                    <svg className="h-5 w-5 text-red-hazard" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                    </svg>
                  }
                />
                <StatCard
                  label="Detections"
                  value={pothole.total_detection_hits}
                  color="text-amber-warn"
                  borderColor="border-amber-warn/20 hover:border-amber-warn/40"
                  icon={
                    <svg className="h-5 w-5 text-amber-warn" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  }
                />
                <StatCard
                  label="Detectors"
                  value={pothole.detectors_count}
                  color="text-cyan-accent"
                  borderColor="border-cyan-accent/20 hover:border-cyan-accent/40"
                  icon={
                    <svg className="h-5 w-5 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  }
                />
                <StatCard
                  label="First Seen"
                  value={formatTime(pothole.citizen_first_reported_at || pothole.latest_activity_at)}
                  color="text-green-safe"
                  borderColor="border-green-safe/20 hover:border-green-safe/40"
                  icon={
                    <svg className="h-5 w-5 text-green-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Verification */}
            <div className="rounded-2xl border border-border bg-surface p-5 border-l-[3px] border-l-cyan-accent/40">
              <SectionTag>Verification</SectionTag>
              <VerifyButtons potholeId={pothole.pothole_id} user={user} />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-3">
              <VoteButtons contentType="pothole" contentId={String(pothole.pothole_id)} user={user} />
              <div className="h-5 w-px bg-border" />
              <ReportButton contentType="pothole" contentId={String(pothole.pothole_id)} user={user} />
            </div>

            {/* Comments */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <SectionTag>Comments</SectionTag>
              <CommentSection potholeId={pothole.pothole_id} commentCount={0} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── photo view ─── */

function PhotoView({ id }: { id: string }) {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const params: ProxyParams = {
    table: 'community_photos',
    columns: '*',
    filters: [{ column: 'id', operator: 'eq', value: Number(id) }],
    limit: 1,
  }
  const { data, loading, error } = useServerData<Record<string, unknown>[]>(params)
  const photo = data?.[0] ? (data[0] as unknown as CommunityPhoto) : null

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  if (error || !photo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt gap-4">
        <p className="text-sm text-text-muted">{error ?? 'Not found'}</p>
        <Link href="/feed" className="text-sm text-cyan-accent hover:underline">Back to feed</Link>
      </div>
    )
  }

  const severity = (photo.worst_severity as Severity) ?? undefined
  const location = photo.city ?? photo.formatted_address ?? `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`

  return (
    <div className="min-h-screen bg-asphalt">
      <PageHeader title="Photo Report" theme={theme} toggle={toggle} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column — visual */}
          <div className="space-y-6">
            <ImageZoom src={photo.image_url} alt="Community submitted" />
            <MiniMap lat={photo.latitude} lng={photo.longitude} />
          </div>

          {/* Right column — details */}
          <div className="space-y-5">
            {/* Reporter */}
            <Link href={`/profile/${photo.user_id}`} className="flex items-center gap-3 rounded-xl p-2 -m-2 transition-colors hover:bg-surface-hover">
              <Avatar name={photo.reporter_username} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate hover:underline">{photo.reporter_username ?? 'Anonymous'}</p>
                <p className="text-[11px] text-text-muted">{formatTime(photo.created_at)}</p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>

            {/* Detection + severity */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide ${
                photo.detection_status === 'processed' ? 'bg-green-safe/15 text-green-safe ring-1 ring-green-safe/30'
                  : photo.detection_status === 'pending' ? 'bg-amber-warn/15 text-amber-warn ring-1 ring-amber-warn/30'
                    : 'bg-surface-raised text-text-muted ring-1 ring-border'
              }`}>
                {photo.detection_status === 'processed' ? 'Detected' : photo.detection_status === 'pending' ? 'Analyzing...' : 'No Detection'}
              </span>
              {severity && <Badge severity={severity} size="md" />}
            </div>

            {photo.detection_status === 'processed' && photo.class_name && (
              <div className="rounded-2xl border border-border bg-surface px-4 py-3">
                <p className="text-sm text-text-secondary">
                  <span className="font-bold text-text-primary">{photo.class_name}</span>
                  {photo.confidence != null && <span className="ml-1 text-cyan-accent">{(photo.confidence * 100).toFixed(0)}% confidence</span>}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-sm text-text-secondary">{location}</p>
            </div>

            {/* Verification */}
            <div className="rounded-2xl border border-border bg-surface p-5 border-l-[3px] border-l-cyan-accent/40">
              <SectionTag>Verification</SectionTag>
              <VerifyButtons photoId={photo.id} user={user} />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-3">
              <VoteButtons contentType="photo" contentId={String(photo.id)} user={user} />
              <div className="h-5 w-px bg-border" />
              <ReportButton contentType="photo" contentId={String(photo.id)} user={user} />
            </div>

            {/* Comments */}
            <div className="rounded-2xl border border-border bg-surface p-5">
              <SectionTag>Comments</SectionTag>
              <CommentSection photoId={photo.id} commentCount={0} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── router ─── */

export default function FeedDetailPage() {
  const params = useParams<{ type: string; id: string }>()

  if (params?.type === 'pothole' && params?.id) {
    return <PotholeView id={params.id} />
  }

  if (params?.type === 'photo' && params?.id) {
    return <PhotoView id={params.id} />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt gap-4">
      <p className="text-sm text-text-muted">Not found</p>
      <Link href="/feed" className="text-sm text-cyan-accent hover:underline">Back to feed</Link>
    </div>
  )
}
