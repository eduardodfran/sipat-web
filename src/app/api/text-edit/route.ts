import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Owner-only title/description edits, executed Supabase-direct with the
// service-role key (server-side only). No FastAPI dependency: no FastAPI
// instance is reachable from the web deployment, and the text path is
// Supabase-only. Ownership rule mirrors the FastAPI endpoints
// (v1: first detector only) so both clients enforce identical semantics.
const TITLE_MAX = 80
const DESCRIPTION_MAX = 280

// undefined = not provided (skip); null = explicitly cleared.
function normalize(value: unknown): string | null | undefined {
  if (value === undefined || value === null) return undefined
  const text = String(value).trim()
  return text === '' ? null : text
}

function isMissingColumnError(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  return error.code === 'PGRST204' || /Could not find the '.+' column/.test(error.message ?? '')
}

function migrationPending() {
  return NextResponse.json(
    { error: "Database migration pending — apply add_title_description_to_posts.sql in Supabase first." },
    { status: 503 },
  )
}

type ServiceClient = ReturnType<typeof createClient> | any

async function applyEdit(
  svc: ServiceClient,
  postType: 'pothole' | 'photo',
  postId: number,
  userId: string,
  old: Record<string, unknown>,
  updates: Record<string, string | null>,
) {
  const table = postType === 'photo' ? 'community_photos' : 'verified_potholes'
  const changed = Object.entries(updates).some(([k, v]) => v !== (old[k] ?? null))
  if (changed) {
    try {
      await svc.from('title_history').insert({
        post_type: postType,
        post_id: postId,
        user_id: userId,
        old_title: (old.title as string | null) ?? null,
        old_description: (old.description as string | null) ?? null,
        new_title: ('title' in updates ? updates.title : (old.title as string | null)) ?? null,
        new_description:
          ('description' in updates ? updates.description : (old.description as string | null)) ??
          null,
        reason: 'edit',
      })
    } catch (e) {
      console.warn('[text-edit] title_history insert failed (non-critical):', e)
    }
  }
  const { error: updateError } = await svc.from(table).update(updates).eq('id', postId)
  if (updateError) {
    if (isMissingColumnError(updateError)) return migrationPending()
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ status: 'ok', ...updates })
}

export async function POST(request: NextRequest) {
  try {
    const { kind, id, title, description } = await request.json()

    if ((kind !== 'pothole' && kind !== 'photo') || !Number.isInteger(id)) {
      return NextResponse.json(
        { error: 'kind must be "pothole" or "photo" and id an integer' },
        { status: 400 },
      )
    }

    const titleNorm = normalize(title)
    const descriptionNorm = normalize(description)
    if (titleNorm && titleNorm.length > TITLE_MAX) {
      return NextResponse.json(
        { error: `Title must be ${TITLE_MAX} characters or fewer.` },
        { status: 422 },
      )
    }
    if (descriptionNorm && descriptionNorm.length > DESCRIPTION_MAX) {
      return NextResponse.json(
        { error: `Description must be ${DESCRIPTION_MAX} characters or fewer.` },
        { status: 422 },
      )
    }
    const updates: Record<string, string | null> = {}
    if (titleNorm !== undefined) updates.title = titleNorm
    if (descriptionNorm !== undefined) updates.description = descriptionNorm
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields provided.' }, { status: 422 })
    }

    // Verify the user's session via the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
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

    const svc = createClient(supabaseUrl, serviceRoleKey)

    if (kind === 'photo') {
      const { data: photo, error: fetchError } = await svc
        .from('community_photos')
        .select('id,user_id,caption,title,description')
        .eq('id', id)
        .maybeSingle()
      if (fetchError) {
        if (isMissingColumnError(fetchError)) return migrationPending()
        return NextResponse.json({ error: 'Could not load post.' }, { status: 500 })
      }
      if (!photo) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 })
      const row = photo as unknown as Record<string, unknown>
      if (row.user_id !== user.id) {
        return NextResponse.json(
          { error: 'You can only edit titles and descriptions for your own posts.' },
          { status: 403 },
        )
      }
      return applyEdit(svc, 'photo', id, user.id, row, updates)
    }

    const { data: pothole, error: fetchError } = await svc
      .from('verified_potholes')
      .select('id,ride_id,caption,title,description')
      .eq('id', id)
      .maybeSingle()
    if (fetchError) {
      if (isMissingColumnError(fetchError)) return migrationPending()
      return NextResponse.json({ error: 'Could not load post.' }, { status: 500 })
    }
    if (!pothole) return NextResponse.json({ error: 'Pothole not found.' }, { status: 404 })
    const row = pothole as unknown as Record<string, unknown>
    if (row.ride_id) {
      const { data: ride, error: rideError } = await svc
        .from('rides_metadata')
        .select('user_id')
        .eq('id', row.ride_id as string)
        .maybeSingle()
      if (rideError) {
        return NextResponse.json({ error: 'Could not verify ownership.' }, { status: 500 })
      }
      if (ride && (ride as unknown as Record<string, unknown>).user_id !== user.id) {
        return NextResponse.json(
          { error: 'You can only edit titles and descriptions for your own detections.' },
          { status: 403 },
        )
      }
    }
    return applyEdit(svc, 'pothole', id, user.id, row, updates)
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
