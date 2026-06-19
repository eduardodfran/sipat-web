export type Severity = 'Minor' | 'Moderate' | 'Severe' | 'Unknown'

export interface Pothole {
  pothole_id: number
  consolidated_latitude: number
  consolidated_longitude: number
  worst_severity: Severity
  total_detection_hits: number
  citizen_first_reported_at: string
  latest_activity_at: string
  image_url: string | null
  reporter_username: string | null
  reporter_avatar: string | null
  detectors_count: number
}

export interface Detector {
  user_id: string
  username: string | null
  full_name: string | null
  detected_at: string
}

export interface DashboardStats {
  totalPotholes: number
  severeCount: number
  moderateCount: number
  minorCount: number
  totalHits: number
  routeCount: number
  gpsPointCount: number
}
