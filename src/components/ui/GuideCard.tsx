'use client'

import { useState, useEffect } from 'react'

interface GuideCardProps {
  storageKey: string
  title: string
  steps: { icon: string; label: string; description: string }[]
}

export function GuideCard({ storageKey, title, steps }: GuideCardProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(storageKey)
    if (!seen) setVisible(true)
  }, [storageKey])

  const dismiss = () => {
    localStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-5 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors text-xs"
        aria-label="Dismiss guide"
      >
        ✕
      </button>
      <h3 className="text-sm font-bold text-text-primary mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-dim text-xs font-bold text-cyan-accent">
              {step.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">{step.label}</p>
              <p className="text-xs text-text-muted leading-relaxed mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
