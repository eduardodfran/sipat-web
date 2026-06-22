'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePotholeData } from '@/hooks/usePotholeData'
import { useRideRoutes } from '@/hooks/useRideRoutes'
import MapCanvas from '@/features/map/components/MapCanvas'
import type { ViewMode } from '@/features/map/components/MapCanvas'
import { TimelineDrawer } from '@/features/map/components/TimelineDrawer'
import HazardSidebar from '@/features/map/components/HazardSidebar'
import type { Pothole } from '@/lib/types'

export default function MapPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { potholes, allPotholes, filter, setFilter } = usePotholeData()
  const { routes } = useRideRoutes()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null)

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
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-asphalt/90 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-surface"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Map */}
      <MapCanvas
        allPotholes={allPotholes}
        routes={routes}
        viewMode={viewMode}
        filter={filter}
        onViewModeChange={setViewMode}
        onPotholeSelect={setSelectedPothole}
      />

      {/* Timeline filter drawer */}
      <TimelineDrawer
        potholes={potholes}
        allCount={allPotholes.length}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Hazard sidebar */}
      <HazardSidebar
        pothole={selectedPothole}
        onClose={() => setSelectedPothole(null)}
        top={0}
      />
    </div>
  )
}
