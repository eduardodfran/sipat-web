'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePotholeData } from '@/hooks/usePotholeData'
import { useRideRoutes } from '@/hooks/useRideRoutes'
import type { ViewMode } from '@/features/map/components/MapCanvas'
import { TimelineDrawer } from '@/features/map/components/TimelineDrawer'

const MapCanvas = dynamic(() => import('@/features/map/components/MapCanvas'), { ssr: false })

export default function MapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { potholes, allPotholes, filter, setFilter } = usePotholeData()
  const { routes } = useRideRoutes()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [vizMode, setVizMode] = useState<'markers' | 'heatmap'>('markers')

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

      {/* Viz mode toggle */}
      <div className="absolute right-4 top-4 z-30">
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
      </div>

      {/* Map */}
      <MapCanvas
        allPotholes={allPotholes}
        routes={routes}
        viewMode={viewMode}
        filter={filter}
        vizMode={vizMode}
        onViewModeChange={setViewMode}
      />

      {/* Timeline filter drawer */}
      <TimelineDrawer
        potholes={potholes}
        allCount={allPotholes.length}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}
