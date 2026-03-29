const { heatZones } = require('../../data/heatZones')

async function fetchPoint(lat, lng) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&hourly=temperature_2m` +
    `&timezone=Europe%2FMadrid` +
    `&forecast_days=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status} for ${lat},${lng}`)

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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch baseline (city centre) + all zone centroids in parallel
    const [baseline, ...zoneResults] = await Promise.all([
      fetchPoint(37.39, -5.99),
      ...heatZones.map((z) => fetchPoint(z.centroid.lat, z.centroid.lng)),
    ])

    // Build zones map keyed by zoneId
    const zones = {}
    heatZones.forEach((z, i) => {
      zones[z.zoneId] = {
        currentTemp: zoneResults[i].currentTemp,
        peakTemp: zoneResults[i].peakTemp,
      }
    })

    return res.status(200).json({
      currentTemp: baseline.currentTemp,  // kept for backwards compat
      peakTemp: baseline.peakTemp,
      hourly: baseline.hourly,
      baseline: { currentTemp: baseline.currentTemp, peakTemp: baseline.peakTemp },
      zones,
    })
  } catch (err) {
    console.error('Weather fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch weather data' })
  }
}
