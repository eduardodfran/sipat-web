'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/Badge'
import { fullAddress } from '@/lib/address'
import type { Pothole } from '@/lib/types'

function ImageSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse flex-col items-center justify-center bg-[#1a1a22]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
      <span className="mt-3 text-sm text-gray-500">Loading evidence&hellip;</span>
    </div>
  )
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#1a1a22]">
      <svg
        className="h-14 w-14 text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
        />
      </svg>
      <span className="mt-2 text-sm text-gray-600">No image available</span>
    </div>
  )
}

function DetailImage({ imageUrl }: { imageUrl: string | null }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    imageUrl ? 'loading' : 'error',
  )

  useEffect(() => {
    setStatus(imageUrl ? 'loading' : 'error')
  }, [imageUrl])

  if (!imageUrl || status === 'error') {
    return <ImagePlaceholder />
  }

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-[#14141c] sm:h-80">
      {status === 'loading' && (
        <div className="absolute inset-0 z-10">
          <ImageSkeleton />
        </div>
      )}
      <Image
        src={imageUrl}
        alt="Hazard detection image"
        fill
        sizes="(max-width: 640px) 100vw, 600px"
        className={`object-cover transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}

export default function PotholeDetailSheet({
  pothole,
  onClose,
}: {
  pothole: Pothole | null
  onClose: () => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (pothole) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [pothole])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!pothole) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pothole, onClose])

  if (!pothole) return null

  const addr = fullAddress(pothole)
  const stats = [
    { label: 'Confirmed By', value: pothole.detectors_count },
    ...(addr.length > 0
      ? [{ label: 'Location', value: addr.join(', ') }]
      : [
          { label: 'Latitude', value: pothole.consolidated_latitude?.toFixed(5) ?? '—' },
          { label: 'Longitude', value: pothole.consolidated_longitude?.toFixed(5) ?? '—' },
        ]),
    {
      label: 'Last activity',
      value: pothole.latest_activity_at
        ? new Date(pothole.latest_activity_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : '—',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          visible ? 'opacity-60' : 'opacity-0'
        }`}
      />

      {/* Sheet */}
      <div
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl border border-white/[0.06] bg-[#14141c] shadow-2xl shadow-black/40 transition-all duration-300 sm:mx-4 sm:max-w-lg sm:rounded-2xl ${
          visible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 sm:translate-y-4 sm:scale-95'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <Badge severity={pothole.worst_severity} size="md" />
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4">
          <DetailImage imageUrl={pothole.image_url} />

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/[0.06] bg-[#1a1a22] px-4 py-3"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  {s.label}
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
