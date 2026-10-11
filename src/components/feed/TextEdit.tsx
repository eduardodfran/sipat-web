'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const TITLE_MAX = 80
const DESCRIPTION_MAX = 280

interface TextEditProps {
  kind: 'pothole' | 'photo'
  id: number
  title: string | null
  description: string | null
  caption: string | null
  isOwner: boolean
  onSaved: (title: string | null, description: string | null) => void
}

function PencilIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
      />
    </svg>
  )
}

export function TextEdit({ kind, id, title, description, caption, isOwner, onSaved }: TextEditProps) {
  const [editing, setEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = () => {
    setTitleDraft(title ?? '')
    setDescriptionDraft(description ?? '')
    setError(null)
    setEditing(true)
  }

  const save = async () => {
    const t = titleDraft.trim()
    const d = descriptionDraft.trim()
    if (t.length > TITLE_MAX) {
      setError(`Title must be ${TITLE_MAX} characters or fewer.`)
      return
    }
    if (d.length > DESCRIPTION_MAX) {
      setError(`Description must be ${DESCRIPTION_MAX} characters or fewer.`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      if (!token) {
        setError('Please sign in again.')
        return
      }
      const res = await fetch('/api/text-edit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kind, id, title: t, description: d }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.detail ?? data?.error ?? 'Could not save. Please try again.')
        return
      }
      onSaved(data.title ?? null, data.description ?? null)
      setEditing(false)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          Title
        </label>
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          placeholder="Give it a short title…"
          maxLength={TITLE_MAX}
          autoFocus
          className="mb-3 w-full rounded-xl border border-border bg-asphalt px-3 py-2 text-sm font-semibold text-text-primary outline-none placeholder:font-normal placeholder:text-text-muted focus:border-cyan-accent/60"
        />
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-text-muted">
          Description
        </label>
        <textarea
          value={descriptionDraft}
          onChange={(e) => setDescriptionDraft(e.target.value)}
          placeholder="Describe this road issue…"
          maxLength={DESCRIPTION_MAX}
          rows={3}
          className="w-full resize-y rounded-xl border border-border bg-asphalt px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-cyan-accent/60"
        />
        {error && <p className="mt-2 text-xs text-red-hazard">{error}</p>}
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={() => setEditing(false)}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-cyan-accent px-4 py-2 text-xs font-bold text-asphalt transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {title && <p className="text-base font-bold text-text-primary">{title}</p>}
      {description ? (
        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{description}</p>
      ) : (
        !title &&
        caption && <p className="mt-0.5 text-sm italic leading-relaxed text-text-secondary">{caption}</p>
      )}
      <div className="mt-1 flex items-center gap-2">
        {!title && !description && (
          <span className="text-xs italic text-text-muted">
            {isOwner ? 'Add a title & description.' : 'No description yet.'}
          </span>
        )}
        {isOwner && (
          <button
            onClick={open}
            aria-label={title || description ? 'Edit title and description' : 'Add title and description'}
            className="rounded-lg bg-surface-raised p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <PencilIcon />
          </button>
        )}
      </div>
    </div>
  )
}
