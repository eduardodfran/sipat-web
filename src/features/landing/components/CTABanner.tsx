'use client'

import Link from 'next/link'
import { FadeIn } from '@/components/ui/FadeIn'

export function CTABanner() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface via-surface to-cyan-dim/40 border border-border p-8 sm:p-10">
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-cyan-accent/10 to-transparent" />
            <div className="absolute bottom-0 left-0 h-16 w-16 bg-gradient-to-tr from-cyan-accent/5 to-transparent" />

            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                  Ready to see your roads?
                </h2>
                <div className="mt-3 h-px w-12 bg-gradient-to-r from-cyan-accent to-transparent" />
                <p className="mt-3 text-sm text-text-secondary">
                  Explore the live hazard map or sign up to start reporting.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-center">
                <div className="flex items-center gap-3">
                  <Link
                    href="/map"
                    className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-hover"
                  >
                    Open Map
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-lg bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
                  >
                    Sign Up
                  </Link>
                </div>
                <p className="text-xs text-text-muted">Free to use</p>
                <a
                  href="https://expo.dev/accounts/eduardofran/projects/SipatApp/builds/865c880b-07aa-4423-8439-e40f63898e06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-text-secondary transition-colors hover:text-cyan-accent"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <span>Download on Android</span>
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
