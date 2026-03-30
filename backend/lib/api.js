export async function fetchWeather(city = 'sevilla') {
  const res = await fetch(`/api/weather?city=${city}`)
  if (!res.ok) throw new Error('Weather fetch failed')
  return res.json()
}

export async function fetchZones(city = 'sevilla') {
  const res = await fetch(`/api/zones?city=${city}`)
  if (!res.ok) throw new Error('Zones fetch failed')
  return res.json()
}

export async function fetchPeople() {
  const res = await fetch('/api/people')
  if (!res.ok) throw new Error('People fetch failed')
  return res.json()
}

export async function fetchPerson(id) {
  const res = await fetch('/api/people/' + id)
  if (!res.ok) throw new Error('Person fetch failed')
  return res.json()
}

export async function registerPerson(body) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}
