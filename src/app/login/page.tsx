'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { RoadBackground } from '@/components/ui/RoadBackground'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, error, signIn, signUp, resendVerification, clearError } = useAuth()
  const { theme, toggle } = useTheme()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState<string | null>(null)
  const lastSubmitRef = useRef(0)

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard')
  }, [user, authLoading, router])

  const handleResend = async () => {
    if (!email.trim()) return
    setResending(true)
    setResendMsg(null)
    const { error: resendErr } = await resendVerification(email.trim())
    setResending(false)
    if (resendErr) {
      if (resendErr.toLowerCase().includes('rate limit')) {
        setResendMsg('Still rate limited — wait a minute and check your inbox/spam for the earlier email.')
      } else {
        setResendMsg(resendErr)
      }
    } else {
      setResendMsg(`Verification email resent to ${email.trim()}. Check inbox and spam.`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = Date.now()
    if (now - lastSubmitRef.current < 2000) return
    lastSubmitRef.current = now
    clearError()
    setResendMsg(null)
    setSubmitting(true)
    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, { fullName: '', username })
    setSubmitting(false)
    if (!result.error && mode === 'login') {
      router.push('/dashboard')
    }
    if (!result.error && mode === 'signup') {
      setSignedUp(true)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-asphalt">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-asphalt px-6 overflow-hidden">
      <RoadBackground />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-5 right-5 z-10 rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>

      <div className="z-10 relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img
              src={theme === 'dark' ? '/sipat-dark.png' : '/sipat-light.png'}
              alt="Sipat"
              className="mx-auto mb-4 h-12 w-auto"
            />
            <h1 className="text-2xl font-bold text-text-primary">Sipat</h1>
            <p className="mt-1 text-sm text-text-muted">
              {mode === 'login' ? 'Sign in to your account' : 'Create an account'}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex rounded-lg border border-border bg-surface-raised p-1">
            <button
              onClick={() => { setMode('login'); clearError(); setUsername('') }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-cyan-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); clearError() }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                mode === 'signup'
                  ? 'bg-cyan-accent text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/50 focus:ring-1 focus:ring-cyan-accent/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 pr-10 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/50 focus:ring-1 focus:ring-cyan-accent/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                  <label htmlFor="username" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-text-muted">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-cyan-accent/50 focus:ring-1 focus:ring-cyan-accent/30"
                    placeholder="juandelacruz"
                  />
                </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-hazard/20 bg-red-hazard/5 px-3 py-2">
                <p className="text-sm text-red-hazard">
                  {error.toLowerCase().includes('rate limit')
                    ? 'Too many attempts. Email rate limit exceeded (2-4/hour per email, 30/hour per project). Check your inbox/spam for the previous verification link, or wait a minute and use Resend below.'
                    : error}
                </p>
                {error.toLowerCase().includes('rate limit') && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email.trim()}
                    className="mt-2 text-sm font-medium text-cyan-accent hover:text-cyan-hover disabled:opacity-50"
                  >
                    {resending ? 'Resending...' : 'Resend verification email'}
                  </button>
                )}
              </div>
            )}
            {resendMsg && (
              <div className="rounded-lg border border-cyan-accent/20 bg-cyan-accent/5 px-3 py-2">
                <p className="text-sm text-cyan-accent">{resendMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-cyan-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-hover disabled:opacity-50"
            >
              {submitting
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </button>
            {signedUp && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email.trim()}
                className="w-full rounded-xl border border-cyan-accent/20 bg-cyan-accent/5 py-2.5 text-sm font-medium text-cyan-accent hover:bg-cyan-accent/10 disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend verification email'}
              </button>
            )}
          </form>

          {signedUp && (
            <div className="mt-4 rounded-xl border border-green-safe/20 bg-green-safe/5 px-4 py-3 text-center">
              <p className="text-sm text-green-safe">
                Account created! Check your email for a confirmation link.
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          <Link href="/" className="text-cyan-accent hover:text-cyan-hover transition-colors">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
