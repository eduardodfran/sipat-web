'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useVerify } from '@/hooks/useVerify'

interface VerifyButtonsProps {
  potholeId?: number | null
  photoId?: number | null
  user?: { email?: string } | null
}

export default function VerifyButtons({ potholeId, photoId, user }: VerifyButtonsProps) {
  const { user: authUser } = useAuth()
  const activeUser = user ?? authUser

  const contentType = potholeId != null ? 'pothole' : 'photo'
  const contentId = String(potholeId ?? photoId)

  const { stillCount, fixedCount, posting, verify } = useVerify({ contentType, contentId })

  if (!activeUser) {
    return (
      <p className="text-[11px] text-text-muted">Sign in to verify this hazard</p>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => verify('still')}
        disabled={posting !== null}
        className="flex items-center gap-1 rounded-lg border border-green-safe/20 bg-green-safe/10 px-2.5 py-1 text-[11px] font-semibold text-green-safe transition-colors hover:bg-green-safe/20 disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Still here
        {stillCount > 0 && <span className="text-green-safe/70">{stillCount}</span>}
      </button>
      <button
        onClick={() => verify('fixed')}
        disabled={posting !== null}
        className="flex items-center gap-1 rounded-lg border border-red-hazard/20 bg-red-hazard/10 px-2.5 py-1 text-[11px] font-semibold text-red-hazard transition-colors hover:bg-red-hazard/20 disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Fixed
        {fixedCount > 0 && <span className="text-red-hazard/70">{fixedCount}</span>}
      </button>
    </div>
  )
}
