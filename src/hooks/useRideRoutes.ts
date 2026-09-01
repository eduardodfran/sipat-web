'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { parseGpsText, type GpsPoint } from '@/lib/gpsParser'

const GPS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_GPS_BUCKET ?? 'raw-road-data'

export interface RideRoute {
  rideId: string
  points: GpsPoint[]
  status: string
  createdAt: string | null
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
      .select('id, gps_bucket_path, status, created_at')
      .not('gps_bucket_path', 'is', null)
      .order('created_at', { ascending: true })
      .limit(50)

    if (error) {
      console.error('[useRideRoutes] rides_metadata fetch failed:', error)
      setLoading(false)
      return
    }
    if (!rides || rides.length === 0) {
      setRoutes([])
      setLoading(false)
      return
    }

    const results: RideRoute[] = []

    for (const ride of rides) {
      const { data: file, error: dlError } = await supabase.storage
        .from(GPS_BUCKET)
        .download(ride.gps_bucket_path)

      if (dlError || !file) {
        console.warn(`[useRideRoutes] download failed for ${ride.id} path=${ride.gps_bucket_path} bucket=${GPS_BUCKET}:`, dlError?.message ?? 'no file')
        continue
      }

      try {
        const text = await file.text()
        const points = parseGpsText(text)
        if (points.length < 2) {
          console.warn(`[useRideRoutes] ride ${ride.id} has insufficient GPS points (${points.length}) - skipping polyline`)
          continue
        }
        if (points.length < 10) {
          console.warn(`[useRideRoutes] ride ${ride.id} has only ${points.length} GPS points (expected >10)`)
        }
        results.push({
          rideId: ride.id,
          points,
          status: ride.status ?? 'completed',
          createdAt: ride.created_at ?? null,
        })
      } catch (parseErr) {
        console.error(`[useRideRoutes] parse failed for ${ride.id}:`, parseErr)
      }
    }

    if (results.length === 0 && rides.length > 0) {
      console.warn(`[useRideRoutes] 0/${rides.length} rides produced valid routes - check GPS_BUCKET=${GPS_BUCKET} and file format`)
    }

    setRoutes(results)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  return { routes, loading, refetch: fetchRoutes }
}
