import { supabase } from '../../lib/supabase'
const { calculateScore } = require('../../lib/calculateScore')
const { heatZones } = require('../../data/heatZones')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { data: people, error: pErr } = await supabase.from('people').select('*')
    if (pErr) throw pErr

    // Fetch all zone temps in one call
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000'
    const weatherRes = await fetch(`${base}/api/weather`)
    const weather = await weatherRes.json()

    const results = await Promise.all(
      people.map(async (person) => {
        const { data: meds } = await supabase
          .from('medications')
          .select('*')
          .eq('person_id', person.id)

        // Use zone-specific temp if person has a zone_id, else baseline
        const zoneId = person.zone_id
        const zoneTemp =
          zoneId && weather.zones && weather.zones[zoneId]
            ? weather.zones[zoneId].currentTemp
            : weather.currentTemp

        const zone = heatZones.find((z) => z.zoneId === zoneId)
        const zoneName = zone ? zone.name : 'Seville'

        const { score, breakdown } = calculateScore(person, meds || [], zoneTemp)

        return {
          id: person.id,
          name: person.name,
          address: person.address,
          score,
          breakdown,
          riskLevel: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
          zoneTemp,
          zoneName,
        }
      })
    )

    results.sort((a, b) => b.score - a.score)

    return res.status(200).json({
      people: results,
      currentTemp: weather.currentTemp,
      zones: weather.zones,
    })
  } catch (err) {
    console.error('People fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch people' })
  }
}
