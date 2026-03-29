const { heatZones } = require('../../data/heatZones')
const { demoUsers } = require('../../data/demoUsers')

// In-memory cache — persists for the lifetime of the server process.
// OSM boundaries don't change, so one fetch per zone per deploy is enough.
const osmCache = new Map()

async function fetchOsmBoundary(nominatimQuery, fallbackCoords) {
  if (osmCache.has(nominatimQuery)) return osmCache.get(nominatimQuery)

  try {
    const url =
      'https://nominatim.openstreetmap.org/search' +
      `?q=${encodeURIComponent(nominatimQuery)}` +
      '&format=geojson&polygon_geojson=1&limit=1'

    const res = await fetch(url, {
      headers: { 'User-Agent': 'HeatSafe/1.0 (heat-risk-demo)' },
    })

    if (!res.ok) throw new Error(`Nominatim ${res.status}`)

    const geojson = await res.json()
    if (!geojson.features?.length) throw new Error('No features returned')

    const geom = geojson.features[0].geometry
    let ring

    if (geom.type === 'Polygon') {
      ring = geom.coordinates[0]
    } else if (geom.type === 'MultiPolygon') {
      // Pick the largest outer ring by point count
      ring = geom.coordinates.reduce(
        (best, poly) => (poly[0].length > best.length ? poly[0] : best),
        []
      )
    } else {
      throw new Error(`Unsupported geometry: ${geom.type}`)
    }

    // Convert GeoJSON [lng, lat] → Leaflet [lat, lng], thin to ≤80 points
    const step = Math.max(1, Math.floor(ring.length / 80))
    const coords = ring
      .filter((_, i) => i % step === 0)
      .map(([lng, lat]) => [lat, lng])

    console.log(`OSM boundary fetched for "${nominatimQuery}": ${coords.length} points`)
    osmCache.set(nominatimQuery, coords)
    return coords
  } catch (err) {
    console.warn(`OSM boundary failed for "${nominatimQuery}": ${err.message} — using fallback`)
    // Cache the fallback too so we don't hammer Nominatim on every request
    osmCache.set(nominatimQuery, fallbackCoords)
    return fallbackCoords
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'

    // Fetch weather + all OSM boundaries in parallel
    const [weatherRes, ...coordResults] = await Promise.all([
      fetch(`${base}/api/weather`),
      ...heatZones.map((z) => fetchOsmBoundary(z.nominatimQuery, z.coords)),
    ])

    const weather = await weatherRes.json()

    const zones = heatZones.map((z, i) => {
      const liveTemp =
        weather.zones?.[z.zoneId] ??
        { currentTemp: weather.currentTemp + z.offset, peakTemp: weather.peakTemp + z.offset }

      return {
        zoneId: z.zoneId,
        name: z.name,
        coords: coordResults[i],
        centroid: z.centroid,
        offset: z.offset,
        reason: z.reason,
        color: z.color,
        riskLevel: z.riskLevel,
        currentTemp: liveTemp.currentTemp,
        peakTemp: liveTemp.peakTemp,
      }
    })

    const severeCount = zones.filter((z) => z.riskLevel === 'severe').length

    return res.status(200).json({
      zones,
      users: demoUsers,
      baseline: {
        currentTemp: weather.currentTemp,
        peakTemp: weather.peakTemp,
      },
      hourly: weather.hourly,
      severeCount,
    })
  } catch (err) {
    console.error('Zones fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch zone data' })
  }
}
