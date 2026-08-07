'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { usePotholeData } from '@/hooks/usePotholeData'
import { useRideRoutes } from '@/hooks/useRideRoutes'
import { useServerData, type ProxyParams } from '@/hooks/useServerData'
import type { ViewMode } from '@/features/map/components/MapCanvas'
import type { CommunityPhoto, DetectionStatus } from '@/lib/communityPhotoTypes'
import { TimelineDrawer } from '@/features/map/components/TimelineDrawer'

const MapCanvas = dynamic(() => import('@/features/map/components/MapCanvas'), { ssr: false })

const PHOTO_PARAMS: ProxyParams = {
  table: 'community_photos',
  columns: '*',
  order: { column: 'created_at', ascending: false },
  limit: 200,
}

function mapPhoto(row: Record<string, unknown>): CommunityPhoto {
  return {
    id: row.id as number,
    user_id: row.user_id as string,
    image_url: row.image_url as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    street: (row.street as string | null) ?? null,
    barangay: (row.barangay as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    province: (row.province as string | null) ?? null,
    region: (row.region as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    formatted_address: (row.formatted_address as string | null) ?? null,
    address_geocoded_at: (row.address_geocoded_at as string | null) ?? null,
    detection_status: (row.detection_status as DetectionStatus) ?? 'pending',
    worst_severity: (row.worst_severity as string | null) ?? null,
    confidence: (row.confidence as number | null) ?? null,
    class_name: (row.class_name as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    reporter_username: (row.reporter_username as string | null) ?? null,
    reporter_avatar: (row.reporter_avatar as string | null) ?? null,
  }
}

export default function MapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { theme, toggle } = useTheme()
  const { potholes, allPotholes, filter, setFilter, streetFilter, setStreetFilter, uniqueStreets } = usePotholeData()
  const { routes } = useRideRoutes()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [vizMode, setVizMode] = useState<'markers' | 'heatmap'>('markers')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'hazard' | 'community'>('all')
  const { data: communityPhotos } = useServerData<Record<string, unknown>[]>(PHOTO_PARAMS)

  useEffect(() => {
    if (sourceFilter === 'community') setVizMode('markers')
  }, [sourceFilter])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full bg-asphalt">
      {/* Back button */}
      <div className="absolute left-4 top-4 z-30">
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface/90 px-4 py-2.5 text-sm font-semibold text-text-primary backdrop-blur-md transition-colors hover:bg-surface-hover"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {user ? 'Dashboard' : 'Home'}
        </Link>
      </div>

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-30 flex gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded-lg border border-border bg-surface/90 p-1.5 text-text-muted backdrop-blur-md transition-colors hover:bg-surface-hover hover:text-text-primary"
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
        {/* Street filter */}
        {uniqueStreets.length > 0 && (
          <div className="relative">
            <select
              value={streetFilter ?? ''}
              onChange={(e) => setStreetFilter(e.target.value || null)}
              className="appearance-none rounded-lg border border-border bg-surface/90 px-3 py-1.5 pr-7 text-xs font-semibold text-text-muted backdrop-blur-md transition-colors hover:bg-surface-hover hover:text-text-primary cursor-pointer"
            >
              <option value="">All Streets</option>
              {uniqueStreets.map((s) => (
                <option key={s.street} value={s.street}>
                  {s.street} ({s.count})
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        )}
        {/* Source filter */}
        <div className="inline-flex overflow-hidden rounded-lg border border-border bg-surface/90 shadow-lg shadow-black/30 backdrop-blur-md">
          {(['all', 'hazard', 'community'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                sourceFilter === s
                  ? 'bg-cyan-accent text-asphalt shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {s === 'all' ? 'All' : s === 'hazard' ? 'Video' : 'Photo'}
            </button>
          ))}
        </div>
        {/* Viz mode toggle */}
        <div className="inline-flex overflow-hidden rounded-lg border border-border bg-surface/90 shadow-lg shadow-black/30 backdrop-blur-md">
            <button
              onClick={() => setVizMode('markers')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                vizMode === 'markers'
                  ? 'bg-cyan-accent text-asphalt shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Markers
            </button>
            <button
              onClick={() => setVizMode('heatmap')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                vizMode === 'heatmap'
                  ? 'bg-cyan-accent text-asphalt shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Heatmap
            </button>
          </div>
      </div>

      {/* Map */}
      <MapCanvas
        allPotholes={allPotholes}
        routes={routes}
        viewMode={viewMode}
        filter={filter}
        streetFilter={streetFilter}
        vizMode={vizMode}
        onViewModeChange={setViewMode}
        communityPhotos={sourceFilter === 'hazard' ? [] : (communityPhotos ?? []).map(mapPhoto)}
        showPotholeMarkers={sourceFilter !== 'community'}
        theme={theme}
      />

      {/* Timeline filter drawer */}
      {sourceFilter !== 'community' && (
        <TimelineDrawer
          potholes={potholes}
          allCount={allPotholes.length}
          filter={filter}
          onFilterChange={setFilter}
        />
      )}

      {/* Sign-in prompt for non-auth users */}
      {!user && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-xl border border-cyan-accent/30 bg-surface/95 px-5 py-3 text-sm font-semibold text-text-primary shadow-lg backdrop-blur-md transition-colors hover:bg-surface-hover"
          >
            <svg className="h-4 w-4 text-cyan-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Sign in to vote and report
          </Link>
        </div>
      )}
    </div>
  )
}
