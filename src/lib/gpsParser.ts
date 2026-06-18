export interface GpsPoint {
  lat: number
  lng: number
}

function detectDelimiter(firstLine: string): string {
  const comma = (firstLine.match(/,/g) ?? []).length
  const semicolon = (firstLine.match(/;/g) ?? []).length
  const tab = (firstLine.match(/\t/g) ?? []).length
  if (semicolon > comma && semicolon > tab) return ';'
  if (tab > comma && tab > semicolon) return '\t'
  return ','
}

function findColumnIndex(headers: string[], aliases: string[]): number {
  for (const alias of aliases) {
    const idx = headers.findIndex(
      (h) => h.trim().toLowerCase() === alias.toLowerCase(),
    )
    if (idx !== -1) return idx
  }
  return -1
}

export function parseGpsCsv(raw: string): GpsPoint[] {
  const lines = raw.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const delimiter = detectDelimiter(lines[0])
  const headers = lines[0].split(delimiter).map((h) => h.trim())

  const latIdx = findColumnIndex(headers, [
    'latitude',
    'lat',
    'y',
    'gps_latitude',
  ])
  const lngIdx = findColumnIndex(headers, [
    'longitude',
    'lng',
    'lon',
    'x',
    'gps_longitude',
  ])

  const hasHeader =
    latIdx !== -1 ||
    lngIdx !== -1 ||
    headers.some((h) => isNaN(Number(h)))

  const startLine = hasHeader ? 1 : 0
  const useLatIdx = hasHeader ? latIdx : 0
  const useLngIdx = hasHeader ? lngIdx : 1

  const points: GpsPoint[] = []

  for (let i = startLine; i < lines.length; i++) {
    const cols = lines[i].split(delimiter)
    const lat = parseFloat(cols[useLatIdx]?.trim())
    const lng = parseFloat(cols[useLngIdx]?.trim())
    if (!isNaN(lat) && !isNaN(lng)) {
      points.push({ lat, lng })
    }
  }

  return points
}
