'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Status = 'loading' | 'success' | 'error'

export default function AuthConfirmPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'signup') {
      setStatus('error')
      setErrorMsg('Invalid confirmation link.')
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' }).then(({ error }) => {
      if (error) {
        setStatus('error')
        setErrorMsg(error.message.includes('expired') ? 'This link has expired. Please sign up again.' : error.message)
      } else {
        setStatus('success')
      }
    })
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-asphalt px-4">
      <div className="w-full max-w-sm text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-accent border-t-transparent" />
            <p className="text-sm text-text-secondary">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-safe/15">
              <svg className="h-8 w-8 text-green-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-text-primary">Email Confirmed!</h1>
            <p className="mb-6 text-sm text-text-secondary">Your account is verified. You can now sign in.</p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-hazard/15">
              <svg className="h-8 w-8 text-red-hazard" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-text-primary">Confirmation Failed</h1>
            <p className="mb-6 text-sm text-text-secondary">{errorMsg}</p>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-cyan-accent px-5 py-2.5 text-sm font-semibold text-asphalt transition-colors hover:bg-cyan-hover"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
