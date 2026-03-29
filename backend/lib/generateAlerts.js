const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * generateAlerts(person, medications, hourlyForecast)
 *
 * Run ONCE before the demo — output is hardcoded into /data/mockData.js.
 * Do NOT call this live during the demo.
 *
 * @param {object} person           - person profile
 * @param {array}  medications      - medication objects with drug_class
 * @param {array}  hourlyForecast   - [{ time: "HH:MM", temp: number }]
 * @returns {{ alerts: [{time, message}], carer_alert: string }}
 */
async function generateAlerts(person, medications, hourlyForecast) {
  const medNames = medications.map((m) => m.drug_class).join(', ') || 'none'
  const forecastSummary = hourlyForecast
    .filter((_, i) => i % 2 === 0) // every 2 hours to keep prompt short
    .map((h) => `${h.time}: ${h.temp}°C`)
    .join(', ')

  const prompt = `You are a heat safety AI assistant. Generate personalised heat risk alerts for this person.

Person profile:
- Name: ${person.name}
- Age: ${person.age}
- Conditions: ${(person.conditions || []).join(', ') || 'none'}
- Medications: ${medNames}
- Lives alone: ${person.lives_alone}
- Floor: ${person.floor}${person.floor >= 3 ? ' (top floor)' : ''}
- South facing: ${person.south_facing}

Today's hourly forecast for Seville:
${forecastSummary}

Generate a JSON response with this exact structure:
{
  "alerts": [
    { "time": "HH:MM", "message": "plain English SMS-ready message under 160 chars" }
  ],
  "carer_alert": "one SMS message to send to the carer/family member, under 160 chars, or null if low risk"
}

Rules:
- Reference actual temperatures from the forecast
- alerts array should have 3-5 entries spaced through the day
- Messages should be specific, actionable, and compassionate
- carer_alert should mention the person by name and the peak temperature
- Output ONLY the JSON, no explanation`

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].text.trim()
  return JSON.parse(text)
}

module.exports = { generateAlerts }
