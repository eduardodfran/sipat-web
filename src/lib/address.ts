import type { Pothole } from '@/lib/types'

/** Structural type so shortAddress works for potholes and community photos alike. */
export interface Addressable {
  formatted_address?: string | null
  street?: string | null
  barangay?: string | null
  city?: string | null
  province?: string | null
  region?: string | null
  country?: string | null
  consolidated_latitude?: number | null
  consolidated_longitude?: number | null
  latitude?: number | null
  longitude?: number | null
}

/** Short address for compact displays (dashboard rows, map labels). */
export function shortAddress(p: Addressable): string {
  if (p.formatted_address) {
    // Take first part before the first comma (usually street + barangay)
    const parts = p.formatted_address.split(',')
    if (parts.length >= 2) return `${parts[0].trim()}, ${parts[1].trim()}`
    return parts[0].trim()
  }
  if (p.city && p.province) return `${p.city}, ${p.province}`
  if (p.city) return p.city
  if (p.barangay) return p.barangay
  const lat = p.consolidated_latitude ?? p.latitude
  const lng = p.consolidated_longitude ?? p.longitude
  if (lat != null && lng != null) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  return 'Location pending'
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
