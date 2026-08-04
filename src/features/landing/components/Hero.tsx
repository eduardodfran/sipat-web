'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { RoadBackground } from '@/components/ui/RoadBackground'
import { HeroIllustration } from './HeroIllustration'
import { FadeIn } from '@/components/ui/FadeIn'

export function Hero() {
  const { user } = useAuth()

  return (
    <section className="relative border-b border-border texture-noise overflow-hidden">
      <RoadBackground />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyan-dim/30 pointer-events-none" />

      <div className="z-10 relative mx-auto max-w-5xl px-6 pb-20 pt-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-cyan-accent">
                Road Hazard Intelligence
              </p>

              <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
                See the road
                <br />
                ahead.
              </h1>

              {/* Decorative line */}
              <div className="mt-5 h-px w-16 bg-gradient-to-r from-cyan-accent to-transparent" />

              <p className="mt-6 max-w-lg text-base leading-relaxed text-text-secondary">
              AI-powered pothole detection meets community reporting.
              Record your ride, let AI find the hazards, and see them on a live map.
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
              <a
                href="https://expo.dev/accounts/eduardofran/projects/SipatApp/builds/865c880b-07aa-4423-8439-e40f63898e06"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-cyan-accent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                Download on Android
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="hidden lg:block">
              <HeroIllustration className="w-full h-auto" />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
