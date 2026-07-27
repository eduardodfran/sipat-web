'use client'

import { FadeIn } from '@/components/ui/FadeIn'
import { useLandingData } from '@/features/landing/hooks/useLandingData'

export function SocialProof() {
  const data = useLandingData()

  const metrics = [
    {
      value: (data.potholeCount ?? 0).toLocaleString(),
      label: 'Hazards reported',
      sublabel: 'Across Metro Manila',
    },
    {
      value: (data.ridesCount ?? 0).toLocaleString(),
      label: 'Rides processed',
      sublabel: 'By AI detection',
    },
    {
      value: '4',
      label: 'Cities covered',
      sublabel: 'Taguig, Makati, Pasig, BGC',
    },
  ]

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <FadeIn>
          <div className="relative rounded-xl bg-surface border border-border p-8 overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-cyan-accent/8 to-transparent" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
                Trusted by riders
              </p>
              <h2 className="mt-3 text-2xl font-bold text-text-primary">
                Built by riders, for riders
              </h2>
              <p className="mt-2 max-w-lg text-sm text-text-secondary leading-relaxed">
                Sipat was created by motorcycle riders who know Metro Manila roads.
                We built this to help our community avoid the potholes we deal with every day.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-6">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="text-2xl font-bold text-text-primary">{metric.value}</p>
                    <p className="mt-1 text-sm font-medium text-text-primary">{metric.label}</p>
                    <p className="text-xs text-text-muted">{metric.sublabel}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs text-text-muted italic">
                  &ldquo;We ride through these roads every day. Sipat helps us see what&apos;s ahead
                  and warn other riders.&rdquo;
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  — Sipat Team, Taguig City
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
