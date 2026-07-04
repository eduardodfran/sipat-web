'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative border-b border-border">
      {/* Subtle gradient accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-cyan-accent/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pb-24 pt-32 lg:px-8">
        <div className="max-w-2xl">
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
      </div>
    </section>
  )
}
