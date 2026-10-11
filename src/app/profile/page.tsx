'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * /profile resolves to the signed-in user's own public profile (with their
 * feed). /settings holds the old account-settings screen.
 */
export default function OwnProfileRedirect() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else router.replace(`/profile/${user.id}`)
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-asphalt">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
    </div>
  )
}
