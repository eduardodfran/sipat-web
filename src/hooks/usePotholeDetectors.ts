'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Detector } from '@/lib/types'

export function usePotholeDetectors(lat: number | null, lng: number | null) {
  const [detectors, setDetectors] = useState<Detector[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lat === null || lng === null) {
      setDetectors([])
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .rpc('get_pothole_detectors', { p_lat: lat, p_lng: lng })
      .then(({ data, error }) => {
        if (cancelled) return
        setLoading(false)
        if (error) {
          console.error('Failed to fetch detectors:', error)
          return
        }
        setDetectors((data ?? []) as Detector[])
      })

    return () => { cancelled = true }
  }, [lat, lng])

  return { detectors, loading }
}
