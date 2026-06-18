'use client'

import { useState } from 'react'
import { usePotholeData } from '@/hooks/usePotholeData'
import { useRideRoutes } from '@/hooks/useRideRoutes'
import { AnalyticsBanner } from '@/features/map/components/AnalyticsBanner'
import MapCanvas from '@/features/map/components/MapCanvas'
import type { ViewMode } from '@/features/map/components/MapCanvas'
import { TimelineDrawer } from '@/features/map/components/TimelineDrawer'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Dashboard() {
  const { potholes, allPotholes, stats, loading, error, filter, setFilter } =
    usePotholeData()
  const { routes } = useRideRoutes()
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-sm font-medium text-red-400">
          Failed to load hazard data
        </p>
        <p className="mt-1 text-xs text-red-400/60">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <AnalyticsBanner stats={stats} />

      <div className="h-[500px] lg:h-[600px]">
        <MapCanvas
          potholes={potholes}
          routes={routes}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
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
