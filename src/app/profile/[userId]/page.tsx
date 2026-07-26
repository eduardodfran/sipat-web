'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase'
import type { CommunityPhoto } from '@/lib/communityPhotoTypes'
import type { Pothole } from '@/lib/types'
import { shortAddress } from '@/lib/address'
import { Badge } from '@/components/ui/Badge'

function Avatar({ name }: { name: string | null }) {
  const initial = (name ?? '?')[0].toUpperCase()
  const colors = [
    'bg-cyan-accent/20 text-cyan-accent',
    'bg-amber-warn/20 text-amber-warn',
    'bg-green-safe/20 text-green-safe',
    'bg-purple-500/20 text-purple-400',
    'bg-red-hazard/20 text-red-hazard',
  ]
  const color = colors[(name ?? '').charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-20 w-20 items-center justify-center rounded-2xl text-3xl font-bold ${color}`}>
      {initial}
    </div>
  )
}

function PhotoCard({ photo }: { photo: CommunityPhoto }) {
  const location = photo.city ?? photo.formatted_address ?? `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`

  return (
    <Link href={`/feed/photo/${photo.id}`} className="overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-cyan-accent/30 hover:shadow-lg hover:shadow-cyan-accent/5">
      <div className="relative h-44 w-full">
        <Image
          src={photo.image_url}
          alt="Community submitted"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          {photo.worst_severity && (
            <span className="text-[11px] font-medium text-text-muted">{photo.worst_severity}</span>
          )}
          {photo.detection_status === 'processed' && photo.class_name && (
            <span className="text-[11px] text-cyan-accent">
              {photo.class_name}
              {photo.confidence != null && ` · ${(photo.confidence * 100).toFixed(0)}%`}
            </span>
          )}
        </div>
        <p className="text-[11px] text-text-muted">{location}</p>
        <p className="text-[10px] text-text-muted/60">
          {new Date(photo.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>
    </Link>
  )
}

function PotholeCard({ p }: { p: Pothole }) {
  const address = shortAddress(p)
  return (
    <Link href={`/feed/pothole/${p.pothole_id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-all hover:border-cyan-accent/30 hover:bg-surface-hover">
      {p.image_url && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={p.image_url} alt="Pothole" fill className="object-cover" sizes="64px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge severity={p.worst_severity} size="sm" />
          <span className="text-[9px] text-text-muted">{p.total_detection_hits} detection{p.total_detection_hits !== 1 ? 's' : ''}</span>
        </div>
        <p className="truncate text-[11px] text-text-secondary">{address ?? 'Unknown location'}</p>
        <p className="text-[10px] text-text-muted/60">
          {new Date(p.latest_activity_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  )
}

export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>()
  const { theme, toggle } = useTheme()
  const [profile, setProfile] = useState<{ id: string; username: string | null; avatar_url: string | null } | null>(null)
  const [photos, setPhotos] = useState<CommunityPhoto[]>([])
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [tab, setTab] = useState<'all' | 'photos' | 'hazards'>('all')

  useEffect(() => {
    if (!params?.userId) return

    async function load() {
      const param = params.userId
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)

      let prof: { id: string; username: string | null; avatar_url: string | null } | null = null

      if (isUuid) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', param)
          .single()
        prof = data
      } else {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('username', param)
          .single()
        prof = data
      }

      if (!prof) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(prof)

      const [photosRes, potholesRes] = await Promise.all([
        supabase
          .from('community_photos')
          .select('*')
          .eq('user_id', prof.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('v_unified_potholes')
          .select('pothole_id, consolidated_latitude, consolidated_longitude, worst_severity, total_detection_hits, detectors_count, citizen_first_reported_at, latest_activity_at, image_url, reporter_username, street, barangay, city, province, region, country, formatted_address')
          .eq('reporter_username', prof.username ?? '')
          .order('latest_activity_at', { ascending: false })
          .limit(50),
      ])

      setPhotos((photosRes.data ?? []) as CommunityPhoto[])
      setPotholes((potholesRes.data ?? []) as Pothole[])
      setLoading(false)
    }

    load()
  }, [params?.userId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-asphalt gap-4">
        <p className="text-sm text-text-muted">User not found</p>
        <Link href="/feed" className="text-sm text-cyan-accent hover:underline">Back to feed</Link>
      </div>
    )
  }

  const totalCount = photos.length + potholes.length
  const filteredPhotos = tab === 'hazards' ? [] : photos
  const filteredPotholes = tab === 'photos' ? [] : potholes

  return (
    <div className="min-h-screen bg-asphalt">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <Link href="/feed" className="flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <h1 className="text-sm font-semibold text-text-primary">Profile</h1>
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

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Profile info */}
        <div className="flex flex-col items-center text-center mb-8">
          <Avatar name={profile.username} />
          <h2 className="mt-4 text-xl font-bold text-text-primary">{profile.username ?? 'Anonymous'}</h2>
          <p className="mt-1 text-sm text-text-muted">
            {totalCount} contribution{totalCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Tabs */}
        {totalCount > 0 && (
          <div className="flex justify-center gap-1 mb-6">
            {([['all', 'All'], ['photos', 'Photos'], ['hazards', 'Hazards']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
                  tab === key
                    ? 'bg-cyan-accent text-asphalt'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {label}
                {key === 'photos' && photos.length > 0 && <span className="ml-1 opacity-60">{photos.length}</span>}
                {key === 'hazards' && potholes.length > 0 && <span className="ml-1 opacity-60">{potholes.length}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16">
            <svg className="mb-3 h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <p className="text-sm font-medium text-text-muted">No contributions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPotholes.length > 0 && (
              <div className="space-y-2">
                {filteredPotholes.map((p) => (
                  <PotholeCard key={p.pothole_id} p={p} />
                ))}
              </div>
            )}
            {filteredPhotos.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPhotos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
