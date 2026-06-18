'use client'

import { useState } from 'react'
import { usePotholeData } from '@/hooks/usePotholeData'
import { useRideRoutes } from '@/hooks/useRideRoutes'
import { AnalyticsBanner } from '@/features/map/components/AnalyticsBanner'
import MapCanvas from '@/features/map/components/MapCanvas'
import type { ViewMode } from '@/features/map/components/MapCanvas'
import { TimelineDrawer } from '@/features/map/components/TimelineDrawer'
import HazardSidebar from '@/features/map/components/HazardSidebar'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Pothole } from '@/lib/types'

export default function Dashboard() {
  const { potholes, allPotholes, stats, loading, error, filter, setFilter } =
    usePotholeData()
  const { routes } = useRideRoutes()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null)

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load hazard data
          </p>
          <p className="mt-1 text-xs text-red-400/60">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[72px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-4rem)]">
      <MapCanvas
        potholes={potholes}
        routes={routes}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPotholeSelect={setSelectedPothole}
      />

      <HazardSidebar
        pothole={selectedPothole}
        onClose={() => setSelectedPothole(null)}
      />

      {/* Floating analytics overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 pt-4">
        <div className="pointer-events-auto flex justify-center px-4">
          <AnalyticsBanner
            stats={{
              ...stats,
              routeCount: routes.length,
              gpsPointCount: routes.reduce((sum, r) => sum + r.points.length, 0),
            }}
          />
        </div>
      </div>

      <TimelineDrawer
        potholes={potholes}
        allCount={allPotholes.length}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  )
}
