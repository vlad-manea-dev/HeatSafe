import { supabase } from '../../../lib/supabase'
const { calculateScore } = require('../../../lib/calculateScore')
const { mockAlerts } = require('../../../data/mockData')
const { heatZonesByCity } = require('../../../data/heatZones')
const heatZones = heatZonesByCity['sevilla']

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: person, error } = await supabase
      .from('people')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error

    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('person_id', id)

    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
    let weather = { currentTemp: 25, peakTemp: 32, zones: {} }
    try {
      const weatherRes = await fetch(`${base}/api/weather`)
      if (weatherRes.ok) weather = await weatherRes.json()
    } catch (_) { /* use fallback temp */ }

    // Use zone-specific temp
    const zoneId = person.zone_id
    const zoneTemp =
      zoneId && weather.zones && weather.zones[zoneId]
        ? weather.zones[zoneId].currentTemp
        : weather.currentTemp
    const zonePeak =
      zoneId && weather.zones && weather.zones[zoneId]
        ? weather.zones[zoneId].peakTemp
        : weather.peakTemp

    const zone = heatZones.find((z) => z.zoneId === zoneId)
    const zoneName = zone ? zone.name : 'Seville'

    const { score, breakdown } = calculateScore(person, meds || [], zoneTemp)

    const alertData = mockAlerts[id] || { alerts: [], carer_alert: null }

    return res.status(200).json({
      person,
      medications: meds || [],
      score,
      breakdown,
      riskLevel: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
      currentTemp: weather.currentTemp,
      peakTemp: weather.peakTemp,
      zoneTemp,
      zonePeak,
      zoneName,
      alerts: alertData.alerts,
      carer_alert: alertData.carer_alert,
    })
  } catch (err) {
    console.error('Person detail error:', err)
    return res.status(500).json({ error: 'Failed to fetch person detail' })
  }
}
