'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface SignUpFields {
  fullName: string
  username: string
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fields: SignUpFields) => Promise<{ error: string | null }>
  resendVerification: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ user: session?.user ?? null, loading: false, error: null })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, loading: false, error: null })
    })

    return () => subscription.unsubscribe()
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return { error: error.message }
    }
    return { error: null }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fields: SignUpFields) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }))
      return { error: error.message }
    }

    if (data.user?.identities?.length === 0) {
      const msg = 'An account with this email already exists. Please sign in.'
      setState((prev) => ({ ...prev, error: msg }))
      return { error: msg }
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fields.fullName,
        username: fields.username,
      })
      if (profileError) console.warn('[AuthContext] profile insert deferred (after confirmation):', profileError.message)
    }

    return { error: null }
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) return { error: error.message }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setState({ user: null, loading: false, error: null })
  }, [])

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, resendVerification, signOut, clearError }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
