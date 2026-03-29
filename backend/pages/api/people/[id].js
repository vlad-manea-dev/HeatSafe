import { supabase } from '../../../lib/supabase'
const { calculateScore } = require('../../../lib/calculateScore')
const { mockAlerts } = require('../../../data/mockData')

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
    const weatherRes = await fetch(`${base}/api/weather`)
    const { currentTemp, peakTemp } = await weatherRes.json()

    const { score, breakdown } = calculateScore(person, meds || [], currentTemp)

    const alertData = mockAlerts[id] || { alerts: [], carer_alert: null }

    return res.status(200).json({
      person,
      medications: meds || [],
      score,
      breakdown,
      riskLevel: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
      currentTemp,
      peakTemp,
      alerts: alertData.alerts,
      carer_alert: alertData.carer_alert,
    })
  } catch (err) {
    console.error('Person detail error:', err)
    return res.status(500).json({ error: 'Failed to fetch person detail' })
  }
}
