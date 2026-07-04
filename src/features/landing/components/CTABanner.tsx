'use client'

import Link from 'next/link'

export function CTABanner() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              Ready to see your roads?
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Explore the live hazard map or sign up to start reporting.
            </p>
          </div>
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
        </div>
      </div>
    </section>
  )
}
