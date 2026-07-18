'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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

let cached: { data: LandingData; expiry: number } | null = null
const TTL = 30_000

function computeSeverity(markers: PotholeMarker[]) {
  let severe = 0, moderate = 0, minor = 0
  for (const m of markers) {
    if (m.worst_severity === 'Severe') severe++
    else if (m.worst_severity === 'Moderate') moderate++
    else if (m.worst_severity === 'Minor') minor++
  }
  return { severeCount: severe, moderateCount: moderate, minorCount: minor }
}

export function useLandingData() {
  const [data, setData] = useState<LandingData>({
    potholeCount: null,
    ridesCount: null,
    severeCount: 0,
    moderateCount: 0,
    minorCount: 0,
    markers: [],
  })

  useEffect(() => {
    let cancelled = false

    const fetch = async () => {
      if (cached && Date.now() < cached.expiry) {
        if (!cancelled) setData(cached.data)
        return
      }

      const [potholesRes, ridesRes, markersRes] = await Promise.all([
        supabase.from('v_unified_potholes').select('*', { count: 'exact', head: true }),
        supabase.from('rides_metadata').select('*', { count: 'exact', head: true }),
        supabase.from('v_unified_potholes').select('consolidated_latitude, consolidated_longitude, worst_severity').limit(500),
      ])

      if (cancelled) return

      const markers = (markersRes.data ?? []) as PotholeMarker[]
      const { severeCount, moderateCount, minorCount } = computeSeverity(markers)
      const result: LandingData = {
        potholeCount: potholesRes.count ?? null,
        ridesCount: ridesRes.count ?? null,
        severeCount,
        moderateCount,
        minorCount,
        markers,
      }

      cached = { data: result, expiry: Date.now() + TTL }
      setData(result)
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return data
}
