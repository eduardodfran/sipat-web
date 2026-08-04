'use client'

import { useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useServerData } from './useServerData'

export type RideStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface Ride {
  id: string
  user_id: string | null
  video_bucket_path: string
  gps_bucket_path: string
  status: RideStatus
  error_log: string | null
  created_at: string
  processed_at: string | null
  detection_count?: number
}

export const STATUS_LABELS: Record<RideStatus, string> = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
}

export const STATUS_STYLES: Record<RideStatus, string> = {
  queued: 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30',
  processing: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  completed: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
  failed: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
}

function buildQueryParams(userId?: string | null) {
  const base = {
    table: 'rides_metadata',
    columns: '*',
    order: { column: 'created_at', ascending: false } as const,
    limit: 100,
  }
  if (userId) {
    return { ...base, filters: [{ column: 'user_id', operator: 'eq', value: userId }] }
  }
  return base
}

export function useRides(userId?: string | null) {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const queryParams = useMemo(() => buildQueryParams(userId), [userId])
  const { data, loading, refetch } = useServerData<Record<string, unknown>[]>(queryParams)

  const serverRides = useMemo(() => (data ?? []) as unknown as Ride[], [data])
  const [rides, setRides] = useState<Ride[]>([])

  if (rides.length === 0 && serverRides.length > 0) {
    setRides(serverRides)
    // Fetch detection counts for completed rides
    const completedRides = serverRides.filter((r) => r.status === 'completed')
    if (completedRides.length > 0) {
      Promise.all(
        completedRides.map(async (r) => {
          const { count } = await supabase
            .from('raw_detections')
            .select('id', { count: 'exact', head: true })
            .eq('ride_id', r.id)
          return { id: r.id, count: count ?? 0 }
        })
      ).then((results) => {
        setRides((prev) =>
          prev.map((r) => {
            const found = results.find((res) => res.id === r.id)
            return found ? { ...r, detection_count: found.count } : r
          })
        )
      })
    }
  }

  const deleteRide = useCallback(async (id: string) => {
    setActionLoading(id)

    const ride = rides.find((r) => r.id === id)
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_GPS_BUCKET ?? 'ride-data'
    const pathsToDelete: string[] = []
    if (ride?.gps_bucket_path) pathsToDelete.push(ride.gps_bucket_path)
    if (ride?.video_bucket_path) pathsToDelete.push(ride.video_bucket_path)

    if (pathsToDelete.length > 0) {
      await supabase.storage.from(bucket).remove(pathsToDelete)
    }

    const { error } = await supabase.from('rides_metadata').delete().eq('id', id)
    if (!error) {
      setRides((prev) => prev.filter((r) => r.id !== id))
    }
    setActionLoading(null)
  }, [rides])

  const reprocessRide = useCallback(async (id: string) => {
    setActionLoading(id)
    const { error } = await supabase
      .from('rides_metadata')
      .update({ status: 'queued', processed_at: null, error_log: null })
      .eq('id', id)
    if (!error) {
      setRides((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: 'queued' as RideStatus, processed_at: null, error_log: null }
            : r,
        ),
      )
    }
    setActionLoading(null)
  }, [])

  return { rides, loading, actionLoading, refetch, deleteRide, reprocessRide }
}
