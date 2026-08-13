export type DetectionStatus = 'pending' | 'processed' | 'no_detection' | 'manually_tagged'

export interface CommunityPhoto {
  id: number
  user_id: string
  image_url: string
  latitude: number
  longitude: number
  street: string | null
  barangay: string | null
  city: string | null
  province: string | null
  region: string | null
  country: string | null
  formatted_address: string | null
  address_geocoded_at: string | null
  detection_status: DetectionStatus
  worst_severity: string | null
  confidence: number | null
  class_name: string | null
  created_at: string
  updated_at: string
  reporter_username: string | null
  reporter_avatar: string | null
}