'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Pothole, DashboardStats, Severity } from '@/lib/types'

function computeStats(potholes: Pothole[], routeCount = 0, gpsPointCount = 0): DashboardStats {
  const stats: DashboardStats = {
    totalPotholes: potholes.length,
    severeCount: 0,
    moderateCount: 0,
    minorCount: 0,
    totalHits: 0,
    routeCount,
    gpsPointCount,
  }

  for (const p of potholes) {
    stats.totalHits += p.total_detection_hits
    switch (p.worst_severity) {
      case 'Severe':
        stats.severeCount++
        break
      case 'Moderate':
        stats.moderateCount++
        break
      case 'Minor':
        stats.minorCount++
        break
    }
  }

  return stats
}

export function usePotholeData() {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalPotholes: 0,
    severeCount: 0,
    moderateCount: 0,
    minorCount: 0,
    totalHits: 0,
    routeCount: 0,
    gpsPointCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Severity | 'All'>('All')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from('v_unified_potholes')
      .select(
        'pothole_id, consolidated_latitude, consolidated_longitude, worst_severity, total_detection_hits, citizen_first_reported_at, latest_activity_at, image_url',
      )
      .order('total_detection_hits', { ascending: false })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    const mapped: Pothole[] = (data ?? []).map((row) => ({
      pothole_id: row.pothole_id,
      consolidated_latitude: row.consolidated_latitude,
      consolidated_longitude: row.consolidated_longitude,
      worst_severity: (row.worst_severity as Severity) ?? 'Unknown',
      total_detection_hits: row.total_detection_hits ?? 0,
      citizen_first_reported_at: row.citizen_first_reported_at ?? '',
      latest_activity_at: row.latest_activity_at ?? '',
      image_url: row.image_url ?? null,
    }))

    setPotholes(mapped)
    setStats(computeStats(mapped))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filtered =
    filter === 'All' ? potholes : potholes.filter((p) => p.worst_severity === filter)

  return {
    potholes: filtered,
    allPotholes: potholes,
    stats,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchData,
  }
}
