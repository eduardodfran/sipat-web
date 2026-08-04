'use client'

import { useState, useMemo } from 'react'
import { useServerData, type ProxyParams } from './useServerData'
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

const QUERY_PARAMS: ProxyParams = {
  table: 'v_unified_potholes',
  columns:
    'pothole_id, consolidated_latitude, consolidated_longitude, worst_severity, total_detection_hits, citizen_first_reported_at, latest_activity_at, image_url, reporter_username, reporter_avatar, detectors_count, street, barangay, city, province, region, country, formatted_address, address_geocoded_at',
  order: { column: 'total_detection_hits', ascending: false },
  limit: 500,
  filters: [{ column: 'caption', operator: 'not.like', value: '[HIDDEN]%' }],
}

function mapRow(row: Record<string, unknown>): Pothole {
  return {
    pothole_id: row.pothole_id as number,
    consolidated_latitude: row.consolidated_latitude as number,
    consolidated_longitude: row.consolidated_longitude as number,
    worst_severity: (row.worst_severity as Severity) ?? 'Unknown',
    total_detection_hits: (row.total_detection_hits as number) ?? 0,
    citizen_first_reported_at: (row.citizen_first_reported_at as string) ?? '',
    latest_activity_at: (row.latest_activity_at as string) ?? '',
    image_url: (row.image_url as string | null) ?? null,
    reporter_username: (row.reporter_username as string | null) ?? null,
    reporter_avatar: (row.reporter_avatar as string | null) ?? null,
    detectors_count: (row.detectors_count as number) ?? 0,
    street: (row.street as string | null) ?? null,
    barangay: (row.barangay as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    province: (row.province as string | null) ?? null,
    region: (row.region as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    formatted_address: (row.formatted_address as string | null) ?? null,
    address_geocoded_at: (row.address_geocoded_at as string | null) ?? null,
  }
}

export function usePotholeData() {
  const [filter, setFilter] = useState<Severity | 'All'>('All')
  const [streetFilter, setStreetFilter] = useState<string | null>(null)
  const { data, loading, error, refetch } = useServerData<Record<string, unknown>[]>(QUERY_PARAMS)

  const allPotholes = useMemo(() => (data ?? []).map(mapRow), [data])
  const stats = useMemo(() => computeStats(allPotholes), [allPotholes])

  const uniqueStreets = useMemo(() => {
    const streetSet = new Map<string, number>()
    for (const p of allPotholes) {
      if (p.street) {
        streetSet.set(p.street, (streetSet.get(p.street) ?? 0) + 1)
      }
    }
    return Array.from(streetSet.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([street, count]) => ({ street, count }))
  }, [allPotholes])

  const filtered = useMemo(
    () =>
      allPotholes.filter(
        (p) =>
          (filter === 'All' || p.worst_severity === filter) &&
          (!streetFilter || p.street === streetFilter),
      ),
    [filter, streetFilter, allPotholes],
  )

  return {
    potholes: filtered,
    allPotholes,
    stats,
    loading,
    error,
    filter,
    setFilter,
    streetFilter,
    setStreetFilter,
    uniqueStreets,
    refetch,
  }
}
