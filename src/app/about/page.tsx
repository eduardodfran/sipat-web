'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { FadeIn } from '@/components/ui/FadeIn'
import { Footer } from '@/features/landing/components/Footer'

const TEAM = [
  { name: 'Eduardo Fran', role: 'Leader & Main Programmer', initials: 'EF' },
  { name: 'Allan McCarl Cabase', role: 'Team Member', initials: 'AC' },
  { name: 'James Aldrine Taylaran', role: 'Team Member', initials: 'JT' },
  { name: 'Jasmerl Ligan', role: 'Team Member', initials: 'JL' },
]

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Mobile Recording + AI Detection',
    description:
      'Record your ride with the app. Our AI analyzes every frame for potholes, cracks, and road distress.',
    capabilities: ['Records in 5-min chunks', 'Scans every frame for hazards', 'Auto-uploads and processes'],
    accentColor: 'bg-cyan-accent',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
    title: 'Live Hazard Map',
    description:
      'View all detected hazards on an interactive map with severity coloring, heatmap visualization, and location-based filtering.',
    capabilities: ['Severity ratings', 'Cluster view', 'Heatmap overlay', 'Time filtering'],
    accentColor: 'bg-green-safe',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      </svg>
    ),
    title: 'Community Photo Reports',
    description:
      'Anyone can submit road photos. Our AI automatically detects and classifies hazards from community submissions.',
    capabilities: ['Photo submissions', 'AI auto-classification', 'Verify hazards'],
    accentColor: 'bg-amber-warn',
  },
]

const PIPELINE_STEPS = [
  {
    number: '01',
    title: 'Record',
    description: 'The app records 3 × 5-minute segments with GPS telemetry',
    barColor: 'bg-cyan-accent',
  },
  {
    number: '02',
    title: 'Upload',
    description: 'Each segment uploads automatically to Azure cloud storage',
    barColor: 'bg-green-safe',
  },
  {
    number: '03',
    title: 'Process',
    description: 'AI detects hazards, measures real-world area, severity is classified',
    barColor: 'bg-amber-warn',
  },
  {
    number: '04',
    title: 'Map',
    description: 'Hazards appear on the map with severity, location, and detection details',
    barColor: 'bg-cyan-accent',
  },
]

const TECH_STACK = [
  {
    category: 'Frontend',
    items: [
      { name: 'React Native + Expo', description: 'Mobile app with Camera API, GPS, AsyncStorage' },
      { name: 'Next.js 16', description: 'Web dashboard with Tailwind CSS, Leaflet maps' },
    ],
  },
  {
    category: 'Backend',
    items: [
      { name: 'FastAPI (Python)', description: 'REST API with Gunicorn + Uvicorn' },
      { name: 'YOLO (Ultralytics)', description: 'Object detection with CPU PyTorch, IPM area measurement' },
      { name: 'Supabase', description: 'PostgreSQL, Row-Level Security, Auth, Real-time' },
    ],
  },
  {
    category: 'Infrastructure',
    items: [
      { name: 'Azure VMSS', description: 'VM Scale Set, Blob Storage, Load Balancer, Nginx' },
      { name: 'Terraform + Docker', description: 'Infrastructure as Code, GitHub Actions CI/CD' },
      { name: 'OpenStreetMap', description: 'Nominatim geocoding, Let\'s Encrypt TLS' },
    ],
  },
]

const RESOURCES = [
  {
    title: 'GitHub Repository',
    description: 'github.com/topics/sipat',
    href: 'https://github.com/topics/sipat',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    title: 'Live Web Dashboard',
    description: 'sipat-web.vercel.app',
    href: 'https://sipat-web.vercel.app/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Android APK',
    description: 'Download the app',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
]

export default function AboutPage() {
  const [showSpecs, setShowSpecs] = useState(false)

  return (
    <div className="min-h-screen bg-asphalt">
      <Navbar />

      {/* Hero / Motivation */}
      <section className="relative border-b border-border texture-noise overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-accent/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">About SIPAT</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-text-primary sm:text-6xl">
              Born from the road.
            </h2>
            <p className="mt-2 text-xl text-text-secondary">System for Infrastructure Pothole Assessment Technology</p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="mt-8 max-w-2xl rounded-xl border border-border bg-surface/80 p-6">
              <p className="text-base leading-relaxed text-text-secondary">
                We are 4 motorcycle riders studying Computer Science at Taguig City University. Two of us are delivery and moto taxi riders. Every day we face potholes, cracks, and road distress — and we wondered: how are these actually monitored? So we built SIPAT, a community-based road hazard detection system.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TEAM.map((member) => (
                <div key={member.initials} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-dim text-sm font-bold text-cyan-accent">
                    {member.initials}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-text-primary">{member.name}</h3>
                  <p className="text-sm text-text-muted">{member.role}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-text-muted">Taguig City University — Computer Science, 4th Year</p>
          </FadeIn>
        </div>
      </section>

      {/* System Overview */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">What is SIPAT</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-text-primary sm:text-6xl">
              Detect. Map. Prevent.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
              SIPAT is an AI-powered road hazard intelligence platform for the Philippines. It combines dashcam-based detection, community reporting, and interactive mapping to monitor road conditions in real time.
            </p>
          </FadeIn>

          <div className="mt-12 grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 100} className="h-full">
                <div className="feature-card bg-asphalt p-6 relative h-full flex flex-col">
                  <div className={`absolute top-0 left-0 right-0 h-0.5 ${feature.accentColor}`} />
                  <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-cyan-accent">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{feature.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-text-secondary flex-1">
                    {feature.description}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-1">
                    {feature.capabilities.map((cap) => (
                      <li key={cap} className="text-sm text-text-muted">
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Data Pipeline */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">Data Pipeline</p>
            <h2 className="mt-3 text-4xl font-black text-text-primary">
              From road to results
            </h2>
          </FadeIn>

          <div className="mt-14 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-10 left-0 right-0 h-px bg-border" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 relative">
              {PIPELINE_STEPS.map((step, index) => (
                <FadeIn key={step.number} delay={index * 120}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full ${step.barColor} text-xl font-black text-white`}>
                      {step.number}
                    </div>
                    <h3 className="mt-4 text-base font-bold text-text-primary">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Severity Classification */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">Standards</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-text-primary sm:text-6xl">
              Severity Classification
            </h2>
            <p className="mt-2 max-w-2xl text-base text-text-secondary">
              Based on DPWH D.O. No. 120 s. 2019 (adopting FHWA LTPP Distress ID Manual)
            </p>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FadeIn delay={0}>
              <div className="rounded-xl border border-green-safe/30 bg-surface p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-safe" />
                  <h3 className="text-base font-bold text-green-safe">Minor</h3>
                </div>
                <p className="mt-3 text-xl font-bold text-text-primary">IPM area &lt; 0.03m&sup2;</p>
                <p className="mt-1 text-xs text-text-muted">Surface distress, cosmetic damage</p>
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="rounded-xl border border-amber-warn/30 bg-surface p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-warn" />
                  <h3 className="text-base font-bold text-amber-warn">Moderate</h3>
                </div>
                <p className="mt-3 text-xl font-bold text-text-primary">IPM area 0.03–0.17m&sup2;</p>
                <p className="mt-1 text-xs text-text-muted">Noticeable hazard, vehicle impact</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="rounded-xl border border-red-hazard/30 bg-surface p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-hazard" />
                  <h3 className="text-base font-bold text-red-hazard">Severe</h3>
                </div>
                <p className="mt-3 text-xl font-bold text-text-primary">IPM area &gt; 0.17m&sup2;</p>
                <p className="mt-1 text-xs text-text-muted">Critical hazard, safety risk</p>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={300}>
            <p className="mt-6 text-center text-sm text-text-muted">
              Confidence-based capping ensures low-confidence detections are conservatively classified.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">Tech Stack</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-text-primary sm:text-6xl">
              Built with
            </h2>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {TECH_STACK.map((group, i) => (
              <FadeIn key={group.category} delay={i * 100}>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-accent">{group.category}</h3>
                  <div className="mt-3 space-y-3">
                    {group.items.map((tech) => (
                      <div key={tech.name} className="rounded-lg border border-border bg-surface p-3">
                        <p className="text-sm font-semibold text-text-primary">{tech.name}</p>
                        <p className="mt-0.5 text-xs text-text-muted">{tech.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">Architecture</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-text-primary sm:text-6xl">
              System Architecture
            </h2>
          </FadeIn>

          {/* Data flow diagram */}
          <FadeIn delay={100}>
            <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center justify-center gap-2 min-w-[600px] py-4">
                <div className="rounded-lg border border-cyan-accent/30 bg-cyan-dim px-4 py-2.5 text-xs font-semibold text-cyan-accent">
                  Mobile App
                </div>
                <svg className="h-4 w-8 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-xs font-semibold text-text-primary">
                  Azure Load Balancer
                </div>
                <svg className="h-4 w-8 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="rounded-lg border border-green-safe/30 bg-green-safe/10 px-4 py-2.5 text-xs font-semibold text-green-safe">
                  FastAPI (VMSS)
                </div>
                <svg className="h-4 w-8 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="rounded-lg border border-amber-warn/30 bg-amber-warn/10 px-4 py-2.5 text-xs font-semibold text-amber-warn">
                  YOLO Processor
                </div>
                <svg className="h-4 w-8 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-semibold text-purple-400">
                  Supabase
                </div>
              </div>
              <div className="flex justify-center mt-2">
                <div className="rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-xs font-semibold text-text-primary">
                  Web Dashboard
                </div>
              </div>
              <div className="flex justify-center mt-1">
                <svg className="h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </div>
            </div>
          </FadeIn>

          {/* Infrastructure specs */}
          <FadeIn delay={200}>
            <div className="mt-8 rounded-xl border border-border bg-surface/80">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-cyan-accent" />
                  <h3 className="text-sm font-semibold text-text-primary">Infrastructure Specs</h3>
                </div>
                <svg
                  className={`h-4 w-4 text-text-muted transition-transform ${showSpecs ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showSpecs && (
                <div className="grid grid-cols-1 gap-3 border-t border-border p-4 sm:grid-cols-2">
                  {[
                    { label: 'Region', value: 'Malaysia West' },
                    { label: 'VMSS', value: 'Standard_B2als_v2, 2 instances' },
                    { label: 'Concurrent capacity', value: '4 rides' },
                    { label: 'Processing timeout', value: '10 minutes per ride' },
                    { label: 'SAS token expiry', value: '60 minutes' },
                  ].map((spec) => (
                    <div key={spec.label} className="flex items-baseline justify-between rounded-lg bg-surface-raised px-3 py-2">
                      <span className="text-xs text-text-muted">{spec.label}</span>
                      <span className="text-xs font-medium text-text-primary">{spec.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Resources */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-accent">Resources</p>
            <h2 className="mt-3 text-5xl font-black tracking-tight text-text-primary sm:text-6xl">
              Explore SIPAT
            </h2>
          </FadeIn>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESOURCES.map((resource, i) => (
              <FadeIn key={resource.title} delay={i * 100}>
                <Link
                  href={resource.href}
                  className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-raised text-text-secondary transition-colors group-hover:text-cyan-accent">
                    {resource.icon}
                  </div>
                  <h3 className="mt-3 text-base font-bold text-text-primary">{resource.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{resource.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-accent">
                    Visit <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="mt-12 max-w-2xl rounded-xl border border-border bg-surface/80 p-6 text-center">
              <p className="text-base leading-relaxed text-text-secondary">
                SIPAT was built as a thesis project at Taguig City University. It demonstrates how AI and community engagement can improve road safety monitoring in the Philippines.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
