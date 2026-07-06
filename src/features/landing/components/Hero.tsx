'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { RoadBackground } from '@/components/ui/RoadBackground'
import { supabase } from '@/lib/supabase'
import { HeroIllustration } from './HeroIllustration'

export function Hero() {
  const { user } = useAuth()
  const [hazardCount, setHazardCount] = useState(0)

  useEffect(() => {
    const fetchHazardCount = async () => {
      const { count } = await supabase
        .from('v_unified_potholes')
        .select('pothole_id', { count: 'exact', head: true })
      if (count !== null) setHazardCount(count)
    }
    fetchHazardCount()
  }, [])

  return (
    <section className="relative border-b border-border">
      <RoadBackground />

      <div className="z-10 relative mx-auto max-w-5xl px-6 pb-20 pt-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-accent">
              Road Hazard Intelligence
            </p>

            <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
              See the road
              <br />
              ahead.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary">
              AI-powered pothole detection meets community reporting.
              Real-time hazard mapping for Philippine roads.
            </p>

            <p className="mb-4 mt-2 text-xs font-medium text-text-secondary">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-accent animate-pulse mr-1.5" />
              {hazardCount.toLocaleString()} hazards detected across Metro Manila
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/map"
                className="rounded-lg bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
              >
                Open Map
              </Link>
              <Link
                href={user ? '/dashboard' : '/login'}
                className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-hover"
              >
                {user ? 'Dashboard' : 'Sign Up'}
              </Link>
            </div>


          </div>

          <div className="hidden lg:block">
            <HeroIllustration className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
