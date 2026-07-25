'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    setUsername(user.user_metadata?.username ?? '')
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase.auth.updateUser({ data: { username } })
    if (!error) {
      await supabase.from('profiles').upsert({ id: user.id, username })
      setSaveMsg('Saved!')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!user || deleteEmail !== user.email) {
      setDeleteError('Email does not match')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ email: deleteEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete account')
        setDeleting(false)
        return
      }
      await signOut()
      router.push('/')
    } catch {
      setDeleteError('Something went wrong')
      setDeleting(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  const initial = (user.user_metadata?.username ?? user.email ?? '?')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-asphalt">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-asphalt/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <h1 className="text-sm font-semibold text-text-primary">Profile</h1>
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Avatar + Info */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-dim text-2xl font-bold text-cyan-accent">
            {initial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">{username || 'No username'}</h2>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        {/* Edit Card */}
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Account</h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/50 focus:ring-1 focus:ring-cyan-accent/30"
                placeholder="your_username"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">Email</label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                className="w-full rounded-xl border border-border bg-surface-raised/50 px-4 py-2.5 text-sm text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-cyan-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-hover disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saveMsg && <span className="text-sm text-green-safe">{saveMsg}</span>}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-hazard/30 bg-surface/80 backdrop-blur-xl p-6">
          <h3 className="text-sm font-semibold text-red-hazard mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>

          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="rounded-xl border border-red-hazard/50 px-5 py-2 text-sm font-semibold text-red-hazard transition-colors hover:bg-red-hazard/10"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Type your email <span className="font-semibold text-text-primary">{user.email}</span> to confirm:
              </p>
              <input
                type="email"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
                className="w-full rounded-xl border border-red-hazard/30 bg-surface-raised px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-red-hazard/50 focus:ring-1 focus:ring-red-hazard/30"
                placeholder="your@email.com"
              />
              {deleteError && <p className="text-sm text-red-hazard">{deleteError}</p>}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting || deleteEmail !== user.email}
                  className="rounded-xl bg-red-hazard px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-hazard/80 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  onClick={() => { setShowDelete(false); setDeleteEmail(''); setDeleteError('') }}
                  className="rounded-xl border border-border px-5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
