/**
 * Run this on demo morning to generate personalised alerts using real today's forecast.
 *
 * Usage:
 *   node scripts/runGenerateAlerts.js
 *
 * Then copy the printed JSON into data/mockData.js
 *
 * Requires ANTHROPIC_API_KEY in .env.local
 */

require('dotenv').config({ path: '.env.local' })
const { generateAlerts } = require('../lib/generateAlerts')

const maria = {
  id: 'aaaaaaaa-0000-0000-0000-000000000001',
  name: 'María García',
  age: 76,
  conditions: ['heart_condition'],
  lives_alone: true,
  floor: 4,
  south_facing: true,
  low_green_cover: true,
}

const mariaMeds = [
  { drug_class: 'diuretics', multiplier: 1.3 },
  { drug_class: 'beta_blockers', multiplier: 1.2 },
]

const pablo = {
  id: 'aaaaaaaa-0000-0000-0000-000000000002',
  name: 'Pablo Martínez',
  age: 33,
  conditions: [],
  lives_alone: false,
  floor: 1,
  south_facing: false,
  low_green_cover: false,
}

async function main() {
  console.log('Fetching today\'s Seville forecast...')
  const weatherRes = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=37.39&longitude=-5.99&hourly=temperature_2m&timezone=Europe%2FMadrid&forecast_days=1'
  )
  const data = await weatherRes.json()
  const hourly = data.hourly.time.map((t, i) => ({
    time: t.slice(11, 16),
    temp: data.hourly.temperature_2m[i],
  }))

  console.log(`Peak today: ${Math.max(...hourly.map((h) => h.temp))}°C\n`)

  console.log('Generating alerts for María...')
  const mariaAlerts = await generateAlerts(maria, mariaMeds, hourly)
  console.log('María alerts:', JSON.stringify(mariaAlerts, null, 2))

  console.log('\nGenerating alerts for Pablo...')
  const pabloAlerts = await generateAlerts(pablo, [], hourly)
  console.log('Pablo alerts:', JSON.stringify(pabloAlerts, null, 2))

  console.log('\n\n--- COPY THIS INTO data/mockData.js (replace the mockAlerts object) ---\n')
  console.log(
    JSON.stringify(
      {
        [maria.id]: mariaAlerts,
        [pablo.id]: pabloAlerts,
      },
      null,
      2
    )
  )
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
