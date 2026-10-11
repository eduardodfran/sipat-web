import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Same-origin proxy to the FastAPI text-edit endpoints. Browser -> FastAPI
// direct calls would need CORS origins configured per deployment, so the
// server forwards instead (Node has no CORS restriction). The user's Supabase
// JWT is passed through; FastAPI re-validates it and enforces ownership.
const FASTAPI_URLS = [
  ...new Set(
    [process.env.FASTAPI_URL, 'http://4.193.125.81', 'http://127.0.0.1:8000'].filter(
      (u): u is string => !!u,
    ),
  ),
]

export async function POST(request: NextRequest) {
  try {
    const { kind, id, title, description } = await request.json()

    if ((kind !== 'pothole' && kind !== 'photo') || !Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'kind must be "pothole" or "photo" and id an integer' },
        { status: 400 },
      )
    }

    // Verify the user's session via the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    const supabaseUser = createClient(supabaseUrl, anonKey)
    const {
      data: { user },
      error: authError,
    } = await supabaseUser.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const path = kind === 'photo' ? `/community-photos/${id}` : `/verified-potholes/${id}`
    const body = JSON.stringify({ title: title ?? null, description: description ?? null })

    let lastError = 'unknown'
    for (const base of FASTAPI_URLS) {
      try {
        const upstream = await fetch(`${base}${path}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body,
          signal: AbortSignal.timeout(15000),
        })
        const data = await upstream.json().catch(() => ({}))
        return NextResponse.json(data, { status: upstream.status })
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e)
      }
    }
    return NextResponse.json(
      { error: `Processing service unreachable (${lastError})` },
      { status: 502 },
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
