import type { SupabaseClient } from '@supabase/supabase-js'

export function buildVoteReportHtml(contentType: 'photo' | 'pothole', contentId: string | number): string {
  const id = String(contentId)
  return `<div id="vote-report-${id}" style="padding:8px;background:#141420;border-radius:8px;margin-bottom:8px;">
    <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;margin-bottom:6px;">Community</div>
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;align-items:center;gap:4px;">
        <button id="vote-up-${id}" data-content-type="${contentType}" data-content-id="${id}" style="width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;" title="Upvote">▲</button>
        <span id="vote-score-${id}" style="min-width:24px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;">0</span>
        <button id="vote-down-${id}" data-content-type="${contentType}" data-content-id="${id}" style="width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;line-height:1;" title="Downvote">▼</button>
      </div>
      <button id="report-btn-${id}" data-content-type="${contentType}" data-content-id="${id}" data-reported="false" style="padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:#6b7280;cursor:pointer;font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px;">🚩 Report</button>
    </div>
  </div>`
}

export function initPopupInteractions(
  contentType: 'photo' | 'pothole',
  contentId: string | number,
  supabase: SupabaseClient,
): void {
  const id = String(contentId)
  const voteUp = document.getElementById(`vote-up-${id}`)
  const voteDown = document.getElementById(`vote-down-${id}`)
  const voteScore = document.getElementById(`vote-score-${id}`)
  const reportBtn = document.getElementById(`report-btn-${id}`)

  if (!voteUp && !voteDown && !reportBtn) return

  const updateScore = (upvotes: number, downvotes: number) => {
    if (voteScore) {
      const net = upvotes - downvotes
      voteScore.textContent = String(net)
      voteScore.style.color = net > 0 ? '#22c55e' : net < 0 ? '#ef4444' : '#6b7280'
    }
  }

  const doVote = async (value: 1 | -1) => {
    const { data } = await supabase.rpc('vote_content', {
      p_content_type: contentType,
      p_content_id: id,
      p_vote_value: value,
    })
    if (data) {
      const row = Array.isArray(data) ? data[0] : data
      updateScore(row?.upvotes ?? 0, row?.downvotes ?? 0)
    }
  }

  if (voteUp) voteUp.onclick = () => doVote(1)
  if (voteDown) voteDown.onclick = () => doVote(-1)

  if (reportBtn) {
    reportBtn.onclick = async () => {
      const isReported = reportBtn.getAttribute('data-reported') === 'true'
      if (isReported) {
        const { data } = await supabase.rpc('unreport_content', {
          p_content_type: contentType,
          p_content_id: id,
        })
        if (data) {
          reportBtn.setAttribute('data-reported', 'false')
          reportBtn.textContent = '🚩 Report'
          reportBtn.style.color = '#6b7280'
        }
      } else {
        const { data } = await supabase.rpc('report_content', {
          p_content_type: contentType,
          p_content_id: id,
          p_reason: 'other',
        })
        if (data) {
          const row = Array.isArray(data) ? data[0] : data
          reportBtn.setAttribute('data-reported', 'true')
          reportBtn.textContent = row?.is_hidden ? '🚩 Hidden' : '🚩 Reported'
          reportBtn.style.color = '#ef4444'
        }
      }
    }
  }

  supabase.rpc('has_user_reported', { p_content_type: contentType, p_content_id: id }).then(({ data }) => {
    if (data === true && reportBtn) {
      reportBtn.setAttribute('data-reported', 'true')
      reportBtn.textContent = '🚩 Reported'
      reportBtn.style.color = '#ef4444'
    }
  })

  supabase.rpc('get_content_votes', { p_content_type: contentType, p_content_id: id }).then(({ data }) => {
    if (data) {
      const row = Array.isArray(data) ? data[0] : data
      updateScore(row?.upvotes ?? 0, row?.downvotes ?? 0)
    }
  })
}
