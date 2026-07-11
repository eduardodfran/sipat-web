import type { Pothole } from '@/lib/types'

/** Short address for compact displays (dashboard rows, map labels). */
export function shortAddress(p: Pothole): string {
  if (p.formatted_address) {
    // Take first part before the first comma (usually street + barangay)
    const parts = p.formatted_address.split(',')
    if (parts.length >= 2) return `${parts[0].trim()}, ${parts[1].trim()}`
    return parts[0].trim()
  }
  if (p.city && p.province) return `${p.city}, ${p.province}`
  if (p.city) return p.city
  if (p.barangay) return p.barangay
  return `${p.consolidated_latitude?.toFixed(3)}, ${p.consolidated_longitude?.toFixed(3)}`
}

/** Full address for detail views (sidebar, modal). */
export function fullAddress(p: Pothole): string[] {
  const lines: string[] = []
  if (p.street) lines.push(p.street)
  if (p.barangay) lines.push(p.barangay)
  if (p.city) lines.push(p.city)
  if (p.province) lines.push(p.province)
  if (p.region && p.region !== p.province) lines.push(p.region)
  if (p.country) lines.push(p.country)
  return lines
}
