'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
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
  const { potholes, allPotholes, filter, setFilter } = usePotholeData()
  const { routes } = useRideRoutes()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [vizMode, setVizMode] = useState<'markers' | 'heatmap'>('markers')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'hazard' | 'community'>('all')
  const { data: communityPhotos } = useServerData<Record<string, unknown>[]>(PHOTO_PARAMS)

  useEffect(() => {
    if (sourceFilter === 'community') setVizMode('markers')
  }, [sourceFilter])

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="relative h-screen w-full bg-asphalt">
      {/* Back button */}
      <div className="absolute left-4 top-4 z-30">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-asphalt/90 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-surface"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Top-right controls */}
      <div className="absolute right-4 top-4 z-30 flex gap-2">
        {/* Source filter */}
        <div className="inline-flex overflow-hidden rounded-lg border border-white/[0.06] bg-asphalt/90 shadow-lg shadow-black/30 backdrop-blur-md">
          {(['all', 'hazard', 'community'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSourceFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                sourceFilter === s
                  ? 'bg-cyan-accent text-asphalt shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All' : s === 'hazard' ? 'Video' : 'Photo'}
            </button>
          ))}
        </div>
        {/* Viz mode toggle — only for hazard data */}
        {sourceFilter !== 'community' && (
          <div className="inline-flex overflow-hidden rounded-lg border border-white/[0.06] bg-asphalt/90 shadow-lg shadow-black/30 backdrop-blur-md">
            <button
              onClick={() => setVizMode('markers')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                vizMode === 'markers'
                  ? 'bg-cyan-accent text-asphalt shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Markers
            </button>
            <button
              onClick={() => setVizMode('heatmap')}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                vizMode === 'heatmap'
                  ? 'bg-cyan-accent text-asphalt shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Heatmap
            </button>
          </div>
        )}
      </div>

      {/* Map */}
      <MapCanvas
        allPotholes={allPotholes}
        routes={routes}
        viewMode={viewMode}
        filter={filter}
        vizMode={vizMode}
        onViewModeChange={setViewMode}
        communityPhotos={sourceFilter === 'hazard' ? [] : (communityPhotos ?? []).map(mapPhoto)}
        showPotholeMarkers={sourceFilter !== 'community'}
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
    </div>
  )
}
