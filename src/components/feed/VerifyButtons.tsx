'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface VerifyButtonsProps {
  potholeId?: number | null
  photoId?: number | null
}

export default function VerifyButtons({ potholeId, photoId }: VerifyButtonsProps) {
  const [stillHereCount, setStillHereCount] = useState(0)
  const [fixedCount, setFixedCount] = useState(0)
  const [posting, setPosting] = useState<string | null>(null)

  const isPothole = potholeId != null
  const rpcGet = isPothole ? 'get_detection_comments' : 'get_community_photo_comments'
  const rpcPost = isPothole ? 'create_detection_comment' : 'create_community_photo_comment'
  const idParam = isPothole ? { p_pothole_id: potholeId } : { p_photo_id: photoId }

  const fetchCounts = useCallback(async () => {
    const { data } = await supabase.rpc(rpcGet, idParam)
    if (!data) return
    const rows = data as { body: string }[]
    setStillHereCount(rows.filter((r) => r.body === '✅ Still here').length)
    setFixedCount(rows.filter((r) => r.body === '✅ Fixed').length)
  }, [rpcGet, JSON.stringify(idParam)])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  const postVerify = async (body: string) => {
    setPosting(body)
    await supabase.rpc(rpcPost, { ...idParam, p_body: body })
    await fetchCounts()
    setPosting(null)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => postVerify('✅ Still here')}
        disabled={posting !== null}
        className="flex items-center gap-1 rounded-lg border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[11px] font-semibold text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Still here
        {stillHereCount > 0 && <span className="text-green-400/70">{stillHereCount}</span>}
      </button>
      <button
        onClick={() => postVerify('✅ Fixed')}
        disabled={posting !== null}
        className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Fixed
        {fixedCount > 0 && <span className="text-red-400/70">{fixedCount}</span>}
      </button>
    </div>
  )
}
