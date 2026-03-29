// Shared API helper — included by all pages via <script src="/assets/api.js">
// API_BASE is empty = same origin as Next.js (localhost:3000)

async function fetchWeather() {
  const res = await fetch('/api/weather')
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

async function fetchPeople() {
  const res = await fetch('/api/people')
  if (!res.ok) throw new Error('People fetch failed')
  return res.json()
}

async function fetchPerson(id) {
  const res = await fetch('/api/people/' + id)
  if (!res.ok) throw new Error('Person fetch failed')
  return res.json()
}

async function registerPerson(body) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}
