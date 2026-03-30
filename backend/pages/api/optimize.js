// Greenery Placement Optimizer
// Scores candidate grid points purely on urban environmental factors — no resident data.
//
// Three factors:
//   1. heatIntensity   — IDW-blended offset at this point (hotter = more need for cooling)
//   2. greenDeficit    — distance to nearest existing cool sink (farther = higher priority)
//   3. corridorValue   — does this point lie on the thermal gap between two cool sinks?
//
// Weights are tunable via ?w1=&w2=&w3= query params for experimentation.

const { heatZonesByCity, cityCentroids } = require('../../data/heatZones')

const DEFAULT_WEIGHTS = { heatIntensity: 0.30, greenDeficit: 0.40, corridorValue: 0.30 }
const GRID_STEP = 0.003   // ~300m per cell at Spanish latitudes
const BOUNDS_BUFFER = 0.015
const MIN_DIST_FROM_EXISTING_PARK = 0.006  // ~600m — don't suggest spots next to existing parks

function deg2dist(a, b) {
  // Euclidean distance in degrees (good enough at city scale, no trig needed)
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2))
}

// IDW-blended offset at (lat, lng) from all zone centroids, power=2
function blendedOffset(lat, lng, zones) {
  let num = 0, den = 0
  for (const z of zones) {
    const d = deg2dist({ lat, lng }, z.centroid)
    if (d < 0.0001) return z.offset
    const w = 1 / (d * d)
    num += z.offset * w
    den += w
  }
  return den === 0 ? 0 : num / den
}

// How well does placing a park at (lat, lng) bridge the gap between two cool sinks?
// Returns [0, 1]: 1 = perfect midpoint on the line between the two nearest sinks.
function corridorScore(lat, lng, coolSinks) {
  if (coolSinks.length < 2) return 0

  const P = { lat, lng }
  let best = 0

  for (let i = 0; i < coolSinks.length; i++) {
    for (let j = i + 1; j < coolSinks.length; j++) {
      const A = coolSinks[i].centroid
      const B = coolSinks[j].centroid
      const directGap = deg2dist(A, B)
      if (directGap < 0.005) continue   // sinks already adjacent, skip pair

      const dAP = deg2dist(A, P)
      const dBP = deg2dist(B, P)

      // Skip if candidate is too close to either existing sink
      if (dAP < MIN_DIST_FROM_EXISTING_PARK || dBP < MIN_DIST_FROM_EXISTING_PARK) continue

      // Detour ratio: 1.0 = candidate is on the straight line A→B
      const detour = (dAP + dBP) / directGap
      const onLineness = 1 / Math.max(detour, 1)

      // Midpoint bonus: reward being roughly equidistant from A and B
      const midpointness = 1 - Math.abs(dAP - dBP) / directGap

      // Gap importance: longer gaps are higher priority
      const gapImportance = Math.min(directGap / 0.10, 1)  // normalise against 0.10° ≈ 10km

      const score = onLineness * midpointness * gapImportance
      if (score > best) best = score
    }
  }
  return Math.min(best, 1)
}

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const city = (req.query.city || 'sevilla').toLowerCase()
  const zones = heatZonesByCity[city]
  const centroid = cityCentroids[city]
  if (!zones || !centroid) return res.status(404).json({ error: `City "${city}" not found` })

  // Parse optional weight overrides
  const W = {
    heatIntensity: parseFloat(req.query.w1) || DEFAULT_WEIGHTS.heatIntensity,
    greenDeficit:  parseFloat(req.query.w2) || DEFAULT_WEIGHTS.greenDeficit,
    corridorValue: parseFloat(req.query.w3) || DEFAULT_WEIGHTS.corridorValue,
  }

  const coolSinks = zones.filter((z) => z.riskLevel === 'cool')
  const hotZones  = zones.filter((z) => z.riskLevel !== 'cool')

  if (coolSinks.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 cool sinks for corridor analysis' })
  }

  // Bounding box from all zone centroids + buffer
  const lats = zones.map((z) => z.centroid.lat)
  const lngs = zones.map((z) => z.centroid.lng)
  const bounds = {
    minLat: Math.min(...lats) - BOUNDS_BUFFER,
    maxLat: Math.max(...lats) + BOUNDS_BUFFER,
    minLng: Math.min(...lngs) - BOUNDS_BUFFER,
    maxLng: Math.max(...lngs) + BOUNDS_BUFFER,
  }

  // Pre-compute normalisation ceiling for green deficit
  // = max possible distance any candidate could be from the nearest cool sink
  const maxCoolDist = Math.max(
    ...coolSinks.flatMap((s) =>
      coolSinks.filter((t) => t !== s).map((t) => deg2dist(s.centroid, t.centroid))
    )
  ) || 0.05

  // Max raw heat offset across hot zones (for normalisation)
  const maxOffset = Math.max(...hotZones.map((z) => z.offset), 1)

  // Grid scan
  const candidates = []
  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += GRID_STEP) {
    for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += GRID_STEP) {
      const P = { lat, lng }

      // Exclude points too close to existing cool sinks — no point planting next to a park
      if (coolSinks.some((s) => deg2dist(P, s.centroid) < MIN_DIST_FROM_EXISTING_PARK)) continue

      const rawHeat = blendedOffset(lat, lng, zones)
      // Only score areas that are actually hot (offset > 0)
      if (rawHeat <= 0) continue

      const heatScore   = Math.min(rawHeat / maxOffset, 1)
      const nearestCool = Math.min(...coolSinks.map((s) => deg2dist(P, s.centroid)))
      const deficitScore = Math.min(nearestCool / maxCoolDist, 1)
      const corrScore    = corridorScore(lat, lng, coolSinks)

      const total =
        W.heatIntensity * heatScore +
        W.greenDeficit  * deficitScore +
        W.corridorValue * corrScore

      candidates.push({
        lat: Math.round(lat * 100000) / 100000,
        lng: Math.round(lng * 100000) / 100000,
        total: Math.round(total * 1000) / 1000,
        breakdown: {
          heatIntensity:  Math.round(heatScore   * 100),
          greenDeficit:   Math.round(deficitScore * 100),
          corridorValue:  Math.round(corrScore    * 100),
        },
      })
    }
  }

  if (candidates.length === 0) {
    return res.status(500).json({ error: 'No viable candidates found' })
  }

  candidates.sort((a, b) => b.total - a.total)
  const top5 = candidates.slice(0, 5)
  const winner = top5[0]

  // Find the two cool sinks most relevant to the winner (for corridor lines on the map)
  const corridorSinks = coolSinks
    .map((s) => ({ ...s, d: deg2dist({ lat: winner.lat, lng: winner.lng }, s.centroid) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 2)
    .map(({ d, ...s }) => s)

  return res.status(200).json({
    city,
    recommendation: winner,
    topCandidates: top5,
    corridorSinks,
    meta: {
      weights: W,
      gridStep: GRID_STEP,
      candidatesEvaluated: candidates.length,
    },
  })
}
