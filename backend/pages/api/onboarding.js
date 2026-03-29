import { getServiceSupabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { role, account, personal, medications, emergency, score, breakdown } = req.body

  if (!personal?.name || !personal?.dob) {
    return res.status(400).json({ error: 'name and dob are required' })
  }

  try {
    const db = getServiceSupabase()

    // 1. Create user account row (best-effort — table may not exist yet)
    let userId = null
    try {
      const { data: user } = await db
        .from('users')
        .insert({ email: account?.email || null, name: account?.name || '', phone: account?.phone || null, role })
        .select()
        .single()
      userId = user?.id || null
    } catch (_) { /* users table not yet migrated — skip */ }

    // 2. Create person
    const conditions = (personal.conditions || []).filter((c) => c !== 'none')
    const { data: person, error: pErr } = await db
      .from('people')
      .insert({
        name: personal.name,
        dob: personal.dob,
        address: personal.address || '',
        phone: role === 'self' ? (account?.phone || '') : '',
        floor: parseInt(personal.floor) || 0,
        south_facing: personal.south_facing || false,
        lives_alone: personal.lives_alone || false,
        low_green_cover: false,
        conditions,
        zone_id: 'nervion',
      })
      .select()
      .single()
    if (pErr) throw pErr

    // 3. Carer relationship (best-effort)
    if (role === 'carer' && userId && person) {
      try {
        await db.from('carer_relationships').insert({ carer_id: userId, person_id: person.id })
      } catch (_) { /* table not yet migrated — skip */ }
    }

    // 4. Medications
    if (medications && medications.length > 0) {
      const medRows = medications.map((m) => ({
        person_id: person.id,
        drug_class: m.drug_class,
        multiplier: m.multiplier,
      }))
      await db.from('medications').insert(medRows)
    }

    // 5. Save initial score
    await db.from('scores').insert({
      person_id: person.id,
      date: new Date().toISOString().split('T')[0],
      base_temp: 25,
      final_score: score || 0,
      breakdown_json: breakdown || {},
    })

    return res.status(201).json({ success: true, personId: person.id, userId })
  } catch (err) {
    console.error('Onboarding error:', err)
    return res.status(500).json({ error: 'Onboarding failed', details: err.message })
  }
}
