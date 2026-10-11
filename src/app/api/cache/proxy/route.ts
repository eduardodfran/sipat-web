import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Band-aid hardening (defense-eve scope): strict table allowlist, limit cap,
// and ownership enforcement for rides_metadata. Full column/operator allowlist
// is deferred post-defense.
const ALLOWED_TABLES = ['v_unified_potholes', 'community_photos', 'rides_metadata'] as const

const MAX_LIMIT = 500

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { table, columns = '*', count, head = false, order, limit, filters } = body

    if (typeof table !== 'string' || !(ALLOWED_TABLES as readonly string[]).includes(table)) {
      return NextResponse.json({ error: 'Table not allowed.' }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // rides_metadata row reads are private: require auth and force the
    // caller's user_id filter to the token owner. Count-only (head) queries
    // stay public for the logged-out landing page.
    let effectiveFilters = Array.isArray(filters) ? filters : []
    if (table === 'rides_metadata' && !head) {
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const supabaseUser = createClient(supabaseUrl, anonKey)
      const {
        data: { user },
        error: authError,
      } = await supabaseUser.auth.getUser(authHeader.split(' ')[1])
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      effectiveFilters = effectiveFilters.filter(
        (f) => !(f && typeof f === 'object' && (f as { column?: unknown }).column === 'user_id'),
      )
      effectiveFilters = [...effectiveFilters, { column: 'user_id', operator: 'eq', value: user.id }]
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let query = supabase.from(table).select(columns, { count: count || undefined, head })

    if (effectiveFilters && Array.isArray(effectiveFilters)) {
      for (const f of effectiveFilters) {
        if (f.operator && f.column) {
          query = query.filter(f.column, f.operator, f.value)
        }
      }
    }

    if (order && order.column) {
      query = query.order(order.column, { ascending: order.ascending !== false })
    }

    if (limit && limit > 0) {
      query = query.limit(Math.min(limit, MAX_LIMIT))
    }

    const { data, error, count: resultCount } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { data, count: resultCount },
      {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=300',
        },
      },
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
