import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { table, columns = '*', count, head = false, order, limit, filters } = body

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    let query = supabase.from(table).select(columns, { count: count || undefined, head })

    if (filters && Array.isArray(filters)) {
      for (const f of filters) {
        if (f.operator && f.column) {
          query = query.filter(f.column, f.operator, f.value)
        }
      }
    }

    if (order && order.column) {
      query = query.order(order.column, { ascending: order.ascending !== false })
    }

    if (limit && limit > 0) {
      query = query.limit(limit)
    }

    const { data, error, count: resultCount } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { data, count: resultCount },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      },
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
