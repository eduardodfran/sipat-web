'use client'

import Link from 'next/link'
import { FadeIn } from '@/components/ui/FadeIn'

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Live Hazard Map',
    description:
      'Real-time pothole locations with severity ratings. Interactive map with clusters, heatmaps, and filtering.',
    capabilities: ['Severity ratings', 'Cluster view', 'Time filtering', 'Heatmap overlay'],
    href: '/map',
    accentColor: 'bg-cyan-accent',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'AI-Powered Detection',
    description:
      'AI analyzes your ride video to detect potholes and road damage. Each detection is automatically located on the map and rated by severity.',
    capabilities: ['Records in 5-min chunks', 'Scans every frame for hazards', 'Auto-uploads and processes'],
    href: '/login',
    accentColor: 'bg-green-safe',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Community Reports',
    description:
      'Citizens submit photos, verify hazards, and track status changes. Crowdsourced road safety for the Philippines.',
    capabilities: ['Photo submissions', 'Verify hazards', 'Track status changes'],
    href: '/login',
    accentColor: 'bg-amber-warn',
  },
]

export function Features() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-accent">
            What Sipat does
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-text-primary sm:text-4xl">
            Detect. Map. Prevent.
          </h2>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 100} className="h-full">
              <div className="feature-card bg-asphalt p-6 relative h-full flex flex-col">
                {/* Colored top accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${feature.accentColor}`} />
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-cyan-accent">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-text-primary">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary flex-1">
                  {feature.description}
                </p>
                <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
                  {feature.capabilities.map((cap) => (
                    <li key={cap} className="text-xs text-text-muted">
                      {cap}
                    </li>
                  ))}
                </ul>
                <Link
                  href={feature.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-cyan-accent hover:text-cyan-hover"
                >
                  Learn more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
