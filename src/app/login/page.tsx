'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, error, signIn, signUp, clearError } =
    useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signedUp, setSignedUp] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.push('/')
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    const result =
      mode === 'login' ? await signIn(email, password) : await signUp(email, password)
    setSubmitting(false)
    if (!result.error && mode === 'login') {
      router.push('/')
    }
    if (!result.error && mode === 'signup') {
      setSignedUp(true)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a1a] px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/15">
            <svg
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Sipat</h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg border border-white/5 bg-[#13133a] p-1">
          <button
            onClick={() => { setMode('login'); clearError() }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); clearError() }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#13133a] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-[#13133a] px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-blue-600/50 focus:ring-1 focus:ring-blue-600/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        {signedUp && (
          <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-center">
            <p className="text-sm text-green-400">
              Account created! Check your email for a confirmation link.
            </p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-600">
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
