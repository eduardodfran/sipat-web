'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { parseGpsCsv, type GpsPoint } from '@/lib/gpsParser'

const GPS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_GPS_BUCKET ?? 'ride-data'

export interface RideRoute {
  rideId: string
  points: GpsPoint[]
  status: string
}

const ROUTE_COLORS: Record<string, string> = {
  completed: '#22c55e',
  processing: '#eab308',
  queued: '#6b7280',
  failed: '#ef4444',
}

export function getRouteColor(status: string): string {
  return ROUTE_COLORS[status] ?? '#3b82f6'
}

export function useRideRoutes() {
  const [routes, setRoutes] = useState<RideRoute[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoutes = useCallback(async () => {
    setLoading(true)

    const { data: rides, error } = await supabase
      .from('rides_metadata')
      .select('id, gps_bucket_path, status')
      .not('gps_bucket_path', 'is', null)
      .limit(50)

    if (error || !rides) {
      setLoading(false)
      return
    }

    const results: RideRoute[] = []

    for (const ride of rides) {
      const { data: file, error: dlError } = await supabase.storage
        .from(GPS_BUCKET)
        .download(ride.gps_bucket_path)

      if (dlError || !file) continue

      const text = await file.text()
      const points = parseGpsCsv(text)
      if (points.length > 0) {
        results.push({
          rideId: ride.id,
          points,
          status: ride.status ?? 'completed',
        })
      }
    }

    setRoutes(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  return { routes, loading, refetch: fetchRoutes }
}
