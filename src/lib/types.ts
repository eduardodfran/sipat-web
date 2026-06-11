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
}

export interface DashboardStats {
  totalPotholes: number
  severeCount: number
  moderateCount: number
  minorCount: number
  totalHits: number
}
