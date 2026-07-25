'use client'

import { useEffect, useRef, useState } from 'react'
import { useLandingData } from '@/features/landing/hooks/useLandingData'
import { FadeIn } from '@/components/ui/FadeIn'

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1200
          const start = performance.now()
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref} className="stat-value">{display.toLocaleString()}</span>
}

export function Stats() {
  const data = useLandingData()

  const cells = [
    { value: data.potholeCount ?? 0, label: 'Hazards Detected' },
    { value: data.ridesCount ?? 0, label: 'Rides Processed' },
  ]

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
        <FadeIn>
          <div className="bg-surface-raised overflow-hidden rounded-xl border border-border">
            <div className="flex w-full">
              {cells.map((cell, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1 py-6 border-border border-r last:border-r-0">
                  <div className="flex items-start gap-1">
                    <span className="text-text-primary font-mono text-3xl font-bold">
                      <AnimatedNumber value={cell.value} />
                    </span>
                  </div>
                  <span className="text-text-muted text-[10px] font-semibold uppercase tracking-widest">
                    {cell.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border px-6 py-3">
              <span className="text-text-muted text-xs">
                Severe: {data.severeCount} • Moderate: {data.moderateCount} • Minor: {data.minorCount}
              </span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
