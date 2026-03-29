import { getServiceSupabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    name,
    dob,
    address,
    phone,
    floor,
    south_facing,
    lives_alone,
    low_green_cover,
    conditions,
    medications,
    zone_id,
  } = req.body

  if (!name || !dob) {
    return res.status(400).json({ error: 'name and dob are required' })
  }

  try {
    const db = getServiceSupabase()

    const { data: person, error: pErr } = await db
      .from('people')
      .insert({
        name,
        dob,
        address: address || '',
        phone: phone || '',
        floor: floor || 1,
        south_facing: south_facing || false,
        lives_alone: lives_alone || false,
        low_green_cover: low_green_cover || false,
        conditions: conditions || [],
        zone_id: zone_id || 'nervion',
      })
      .select()
      .single()
    if (pErr) throw pErr

    if (medications && medications.length > 0) {
      const medRows = medications.map((m) => ({
        person_id: person.id,
        drug_class: m.drug_class,
        multiplier: m.multiplier,
      }))
      const { error: mErr } = await db.from('medications').insert(medRows)
      if (mErr) throw mErr
    }

    return res.status(201).json({ success: true, id: person.id })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
}
