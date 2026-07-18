'use client'

import { useMemo } from 'react'
import { useServerData } from '@/hooks/useServerData'

type Severity = 'Severe' | 'Moderate' | 'Minor' | 'Unknown'

interface PotholeMarker {
  consolidated_latitude: number | null
  consolidated_longitude: number | null
  worst_severity: Severity
}

interface LandingData {
  potholeCount: number | null
  ridesCount: number | null
  severeCount: number
  moderateCount: number
  minorCount: number
  markers: PotholeMarker[]
}

function computeSeverity(markers: PotholeMarker[]) {
  let severe = 0, moderate = 0, minor = 0
  for (const m of markers) {
    if (m.worst_severity === 'Severe') severe++
    else if (m.worst_severity === 'Moderate') moderate++
    else if (m.worst_severity === 'Minor') minor++
  }
  return { severeCount: severe, moderateCount: moderate, minorCount: minor }
}

export function useLandingData(): LandingData {
  const { count: potholeCount } = useServerData({
    table: 'v_unified_potholes',
    columns: '*',
    count: 'exact',
    head: true,
  })

  const { count: ridesCount } = useServerData({
    table: 'rides_metadata',
    columns: '*',
    count: 'exact',
    head: true,
  })

  const { data: markersData } = useServerData<Record<string, unknown>[]>({
    table: 'v_unified_potholes',
    columns: 'consolidated_latitude, consolidated_longitude, worst_severity',
    limit: 500,
  })

  const markers = useMemo(() => (markersData ?? []) as unknown as PotholeMarker[], [markersData])
  const severityCounts = useMemo(() => computeSeverity(markers), [markers])

  return {
    potholeCount,
    ridesCount,
    ...severityCounts,
    markers,
  }
}
