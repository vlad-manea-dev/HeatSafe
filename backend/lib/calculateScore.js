/**
 * calculateScore(person, medications, tempCelsius)
 *
 * Pure function — no imports, no side effects.
 * Works in Node.js, Next.js API routes, and browser <script> tags.
 *
 * @param {object} person       - row from `people` table
 * @param {array}  medications  - rows from `medications` table for this person
 * @param {number} tempCelsius  - current temperature at person's location
 * @returns {{ score: number, breakdown: object }}
 */
function calculateScore(person, medications, tempCelsius) {
  const breakdown = {}
  let base = 0

  // Age — derive from dob string if age not directly provided
  const age =
    typeof person.age === 'number'
      ? person.age
      : new Date().getFullYear() - new Date(person.dob).getFullYear()

  if (age > 70) {
    breakdown.age = 30
    base += 30
  }

  // Top floor = floor 3 or above
  if (person.floor >= 3) {
    breakdown.top_floor = 20
    base += 20
  }

  // Heart or respiratory condition
  const conditions = person.conditions || []
  const hasCardioRespiratory = conditions.some((c) =>
    ['heart_condition', 'respiratory', 'copd', 'asthma'].includes(c)
  )
  if (hasCardioRespiratory) {
    breakdown.cardio_respiratory = 25
    base += 25
  }

  // Extreme temperature
  if (tempCelsius > 35) {
    breakdown.extreme_temp = 15
    base += 15
  }

  // Low green cover (urban heat island, set during registration)
  if (person.low_green_cover) {
    breakdown.low_green_cover = 10
    base += 10
  }

  if (person.lives_alone) {
    breakdown.lives_alone = 10
    base += 10
  }

  if (person.south_facing) {
    breakdown.south_facing = 5
    base += 5
  }

  // Compound medication multipliers
  let multiplier = 1.0
  const medBreakdown = []
  for (const med of medications) {
    multiplier *= med.multiplier
    medBreakdown.push({ drug_class: med.drug_class, multiplier: med.multiplier })
  }
  breakdown.medications = medBreakdown
  breakdown.multiplier = parseFloat(multiplier.toFixed(3))
  breakdown.base_before_multiplier = base

  let score = Math.round(base * multiplier)
  score = Math.min(score, 100) // cap at 100
  score = Math.max(score, base > 0 ? 5 : 0) // minimum 5 if any risk factors present

  return { score, breakdown }
}

// Support both CommonJS (Node scripts) and ES module (Next.js API routes)
if (typeof module !== 'undefined') {
  module.exports = { calculateScore }
}
