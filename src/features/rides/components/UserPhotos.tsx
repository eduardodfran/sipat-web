'use client'

import Image from 'next/image'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUserPhotos } from '@/hooks/useUserPhotos'
import type { CommunityPhoto, DetectionStatus } from '@/lib/communityPhotoTypes'

const STATUS_CONFIG: Record<DetectionStatus, { label: string; color: string }> = {
  processed: { label: 'Processed', color: 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30' },
  pending: { label: 'Pending', color: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30' },
  no_detection: { label: 'No Detection', color: 'bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30' },
}

function PhotoCard({ photo }: { photo: CommunityPhoto }) {
  const status = STATUS_CONFIG[photo.detection_status] ?? STATUS_CONFIG.pending
  const location = photo.city ?? photo.formatted_address ?? `${photo.latitude.toFixed(4)}, ${photo.longitude.toFixed(4)}`

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="relative h-48 w-full">
        <Image
          src={photo.image_url}
          alt="Community submitted"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.color}`}>
            {status.label}
          </span>
          {photo.worst_severity && (
            <span className="text-[11px] font-medium text-text-muted">{photo.worst_severity}</span>
          )}
        </div>
        {photo.detection_status === 'processed' && photo.class_name && (
          <p className="text-[13px] text-text-secondary">
            <span className="font-semibold text-text-primary">{photo.class_name}</span>
            {photo.confidence != null && ` · ${(photo.confidence * 100).toFixed(0)}%`}
          </p>
        )}
        {photo.detection_status === 'no_detection' && (
          <p className="text-[13px] text-text-muted">No distress detected</p>
        )}
        {photo.detection_status === 'pending' && (
          <p className="text-[13px] text-text-muted">Awaiting analysis...</p>
        )}
        <p className="mt-1 text-[11px] text-text-muted">{location}</p>
        <p className="text-[11px] text-text-muted">
          {new Date(photo.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

export default function UserPhotos({ userId }: { userId: string }) {
  const { photos, loading } = useUserPhotos(userId)

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[280px] rounded-xl" />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16">
        <svg className="mb-3 h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
        <p className="text-sm font-medium text-text-muted">No community photos yet</p>
        <p className="mt-1 text-xs text-text-muted">Submit photos from the mobile app</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  )
}
