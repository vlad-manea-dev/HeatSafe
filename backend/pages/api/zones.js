const { heatZonesByCity, cityCentroids } = require('../../data/heatZones')
const { demoUsers } = require('../../data/demoUsers')

// Re-using the fetchPoint logic directly instead of fetching via URL
async function fetchPoint(lat, lng) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&hourly=temperature_2m` +
    `&timezone=Europe%2FMadrid` +
    `&forecast_days=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status}`)

  const data = await res.json()
  const temps = data.hourly.temperature_2m
  const times = data.hourly.time
  const currentHour = new Date().getHours()

  return {
    currentTemp: temps[currentHour],
    peakTemp: Math.max(...temps),
    hourly: times.map((t, i) => ({ time: t.slice(11, 16), temp: temps[i] })),
  }
}

// In-memory cache — persists for the lifetime of the server process.
const osmCache = new Map()

async function fetchOsmBoundary(nominatimQuery) {
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
      ring = geom.coordinates.reduce(
        (best, poly) => (poly[0].length > best.length ? poly[0] : best),
        []
      )
    } else {
      throw new Error(`Unsupported geometry: ${geom.type}`)
    }

    const step = Math.max(1, Math.floor(ring.length / 80))
    const coords = ring
      .filter((_, i) => i % step === 0)
      .map(([lng, lat]) => [lat, lng])

    osmCache.set(nominatimQuery, coords)
    return coords
  } catch (err) {
    console.warn(`OSM boundary failed for "${nominatimQuery}": ${err.message}`)
    return []
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const city = req.query.city?.toLowerCase() || 'sevilla'
  const cityZones = heatZonesByCity[city]
  const centroid = cityCentroids[city]

  if (!cityZones || !centroid) {
    return res.status(404).json({ error: `City "${city}" not found` })
  }

  try {
    // Fetch baseline + zone temperatures + OSM boundaries in parallel
    const [baseline, ...rest] = await Promise.all([
      fetchPoint(centroid.lat, centroid.lng),
      ...cityZones.map((z) => fetchPoint(z.centroid.lat, z.centroid.lng)),
      ...cityZones.map((z) => fetchOsmBoundary(z.nominatimQuery)),
    ])

    const zoneCount = cityZones.length
    const zoneTemps = rest.slice(0, zoneCount)
    const zoneCoords = rest.slice(zoneCount)

    const zones = cityZones.map((z, i) => {
      const liveTemp = zoneTemps[i] || { currentTemp: baseline.currentTemp + z.offset, peakTemp: baseline.peakTemp + z.offset }

      return {
        zoneId: z.zoneId,
        name: z.name,
        coords: zoneCoords[i],
        centroid: z.centroid,
        offset: z.offset,
        reason: z.reason,
        color: z.color,
        riskLevel: z.riskLevel,
        currentTemp: liveTemp.currentTemp,
        peakTemp: liveTemp.peakTemp,
      }
    })

    // Filter users by city (using simple coordinate bounding for the demo)
    const latTol = 0.5;
    const lngTol = 0.5;
    const filteredUsers = demoUsers.filter(u => 
      Math.abs(u.lat - centroid.lat) < latTol && 
      Math.abs(u.lng - centroid.lng) < lngTol
    )

    const severeCount = zones.filter((z) => z.riskLevel === 'severe').length

    return res.status(200).json({
      city,
      centroid,
      zones,
      users: filteredUsers,
      baseline: {
        currentTemp: baseline.currentTemp,
        peakTemp: baseline.peakTemp,
      },
      hourly: baseline.hourly,
      severeCount,
    })
  } catch (err) {
    console.error('Zones fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch zone data: ' + err.message })
  }
}
