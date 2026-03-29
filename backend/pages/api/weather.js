export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=37.39&longitude=-5.99' +
      '&hourly=temperature_2m' +
      '&timezone=Europe%2FMadrid' +
      '&forecast_days=1'

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`)

    const data = await response.json()
    const temps = data.hourly.temperature_2m // 24 floats
    const times = data.hourly.time           // 24 ISO strings

    const currentHour = new Date().getHours()
    const currentTemp = temps[currentHour]
    const peakTemp = Math.max(...temps)

    const hourly = times.map((t, i) => ({
      time: t.slice(11, 16), // "HH:MM"
      temp: temps[i],
    }))

    return res.status(200).json({ currentTemp, peakTemp, hourly })
  } catch (err) {
    console.error('Weather fetch error:', err)
    return res.status(500).json({ error: 'Failed to fetch weather data' })
  }
}
