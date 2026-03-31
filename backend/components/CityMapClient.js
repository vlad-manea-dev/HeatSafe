import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import NavBar from './NavBar'

export default function CityMapClient() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const allDataRef = useRef(null)
  const zonePolygonsRef = useRef([])
  const userMarkersRef = useRef([])
  const layersRef = useRef({})
  const heatSurfaceRef = useRef(null)
  const optimizerLayerRef = useRef(null)

  const [city, setCity] = useState('sevilla')
  const [currentHour, setCurrentHour] = useState(new Date().getHours())
  const [severeCount, setSevereCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState('Loading...')
  const [surfaceVisible, setSurfaceVisible] = useState(false)
  const [zonesVisible, setZonesVisible] = useState(true)
  const [usersVisible, setUsersVisible] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [optResults, setOptResults] = useState(null)
  const [optLoading, setOptLoading] = useState(false)

  // -- helpers (stable, defined outside effects) --
  function scoreColor(score) {
    if (score >= 70) return '#D9383A'
    if (score >= 40) return '#E76F51'
    return '#4A7C59'
  }
  function riskLabel(score) {
    if (score >= 70) return 'High'
    if (score >= 40) return 'Medium'
    return 'Low'
  }
  function getTempAt(lat, lng, hour) {
    const data = allDataRef.current
    if (!data || !data.zones) return 0
    const baseTemp = (data.hourly[hour] || { temp: 25 }).temp
    let num = 0; let den = 0
    data.zones.forEach((z) => {
      const dist = Math.sqrt((lat - z.centroid.lat) ** 2 + (lng - z.centroid.lng) ** 2)
      if (dist === 0) { num = baseTemp + z.offset; den = 1; return }
      const w = 1 / dist ** 2
      num += (baseTemp + z.offset) * w; den += w
    })
    return den === 0 ? baseTemp : num / den
  }
  function tempToColor(temp) {
    if (temp >= 42) return '#D9383A'
    if (temp >= 38) return '#E05545'
    if (temp >= 34) return '#E76F51'
    if (temp >= 30) return '#F4A261'
    if (temp >= 26) return '#F2C57C'
    return '#EDD9A3'
  }
  function offsetIcon(offset) { return offset > 0 ? '🔥' : '❄️' }

  // Init map once
  useEffect(() => {
    const L = require('leaflet')
    if (mapInstance.current) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView([37.385, -5.990], 13)
    mapInstance.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd', maxZoom: 19,
    }).addTo(map)

    const zoneLayer = L.layerGroup().addTo(map)
    const userLayer = L.layerGroup().addTo(map)
    const heatSurfaceLayer = L.layerGroup().addTo(map)
    layersRef.current = { zoneLayer, userLayer, heatSurfaceLayer }
    optimizerLayerRef.current = L.layerGroup().addTo(map)

    // Custom canvas heat surface
    const HeatSurface = L.Layer.extend({
      onAdd(m) {
        this._container = L.DomUtil.create('canvas', 'leaflet-zoom-animated')
        this._container.style.opacity = '0.55'
        this._container.style.pointerEvents = 'none'
        this._container.style.zIndex = '1'
        m.getPanes().overlayPane.appendChild(this._container)
        m.on('viewreset moveend', this._reset, this)
        this._reset()
      },
      onRemove(m) {
        m.getPanes().overlayPane.removeChild(this._container)
        m.off('viewreset moveend', this._reset, this)
      },
      _reset() {
        const size = mapInstance.current.getSize()
        this._container.width = size.x
        this._container.height = size.y
        L.DomUtil.setPosition(this._container, mapInstance.current.containerPointToLayerPoint([0, 0]))
        this._draw()
      },
      _draw() {
        const data = allDataRef.current
        if (!data || !data.zones) return
        const ctx = this._container.getContext('2d')
        const size = mapInstance.current.getSize()
        ctx.clearRect(0, 0, size.x, size.y)
        const step = 25
        const hour = typeof window !== 'undefined' ? parseInt(document.getElementById('city-hour-ref')?.value || new Date().getHours()) : 12
        for (let x = 0; x < size.x; x += step) {
          for (let y = 0; y < size.y; y += step) {
            const ll = mapInstance.current.containerPointToLatLng([x + step / 2, y + step / 2])
            const temp = getTempAt(ll.lat, ll.lng, hour)
            ctx.fillStyle = tempToColor(temp)
            ctx.fillRect(x, y, step, step)
          }
        }
      },
    })

    const surface = new HeatSurface()
    heatSurfaceRef.current = surface

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  // Load zones when city changes
  useEffect(() => {
    if (!mapInstance.current) return
    const L = require('leaflet')
    const map = mapInstance.current
    const { zoneLayer, userLayer } = layersRef.current

    const load = async () => {
      try {
        zoneLayer.clearLayers()
        userLayer.clearLayers()
        zonePolygonsRef.current = []
        userMarkersRef.current = []

        const res = await fetch(`/api/zones?city=${city}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        allDataRef.current = data

        if (data.centroid) map.setView([data.centroid.lat, data.centroid.lng], 13)
        setSevereCount(data.severeCount || 0)

        data.zones.forEach((zone) => {
          if (!zone.coords || zone.coords.length === 0) return
          const poly = L.polygon(zone.coords, {
            color: zone.color, fillColor: zone.color, fillOpacity: 0.25, weight: 1.5, dashArray: '4, 4',
          }).addTo(zoneLayer)
          poly.bindTooltip('', { className: 'heat-tooltip', sticky: true, offset: [10, 0] })
          zonePolygonsRef.current.push({ zone, poly })
        })

        data.users.forEach((user) => {
          const color = scoreColor(user.score)
          const icon = L.divIcon({
            className: '',
            html: `<div class="user-marker" style="background-color:${color}; transition: background-color 0.3s ease;"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10],
          })
          const marker = L.marker([user.lat, user.lng], { icon }).addTo(userLayer)
          marker.bindPopup('', { maxWidth: 260 })
          userMarkersRef.current.push({ user, marker })
        })

        updateVisuals(currentHour)

        const now = new Date()
        const timeStr = now.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
        setLastUpdated(`LIVE · Today, ${timeStr}`)
      } catch (err) {
        console.error('Failed to load zones:', err)
        setLastUpdated('Live data sync failed. Try refreshing.')
      }
    }
    load()
  }, [city])

  function updateVisuals(hour) {
    const data = allDataRef.current
    if (!data) return
    const h = hour ?? currentHour
    const hourStr = String(h).padStart(2, '0') + ':00'

    zonePolygonsRef.current.forEach(({ zone, poly }) => {
      const localTemp = getTempAt(zone.centroid.lat, zone.centroid.lng, h)
      const color = tempToColor(localTemp)
      poly.setStyle({ color, fillColor: color })
      const tempSign = zone.offset >= 0 ? '+' : ''
      poly.setTooltipContent(`
        <div class="zone-name">${zone.name}</div>
        <div class="zone-temp" style="color:${color}">${offsetIcon(zone.offset)} ${tempSign}${zone.offset}°C offset · ${localTemp.toFixed(1)}°C at ${hourStr}</div>
        <div class="zone-reason">${zone.reason}</div>
      `)
    })

    userMarkersRef.current.forEach(({ user, marker }) => {
      const localTemp = getTempAt(user.lat, user.lng, h)
      let bonus = 0
      if (localTemp > 40) bonus = 30
      else if (localTemp > 35) bonus = 15
      const displayScore = Math.min(100, user.score + bonus)
      const color = scoreColor(displayScore)
      const el = marker.getElement()
      if (el) el.querySelector('.user-marker').style.backgroundColor = color
      marker.setPopupContent(`
        <div class="pin-popup" style="min-width:200px;padding:4px 2px">
          <div class="pin-name">${user.name}</div>
          <div class="pin-address">${user.address}</div>
          <div style="margin-bottom:4px">
            <span style="background:${color};color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:9999px">${riskLabel(displayScore)} · Score: ${displayScore}</span>
          </div>
          <div class="pin-summary" style="font-size:11px;color:#8A8683">${localTemp.toFixed(1)}°C local exposure</div>
          <div class="pin-summary">${user.summary}</div>
          <a class="pin-link" href="/dashboard/${user.id}">View full profile →</a>
        </div>
      `)
    })

    if (heatSurfaceRef.current?._draw) heatSurfaceRef.current._draw()
  }

  const handleHourChange = (h) => {
    setCurrentHour(h)
    updateVisuals(h)
  }

  const toggleLayer = (which) => {
    const L = require('leaflet')
    const map = mapInstance.current
    const layers = layersRef.current
    if (which === 'surface') {
      const next = !surfaceVisible
      setSurfaceVisible(next)
      if (next) layers.heatSurfaceLayer.addTo(map); else map.removeLayer(layers.heatSurfaceLayer)
    } else if (which === 'zones') {
      const next = !zonesVisible
      setZonesVisible(next)
      if (next) layers.zoneLayer.addTo(map); else map.removeLayer(layers.zoneLayer)
    } else if (which === 'users') {
      const next = !usersVisible
      setUsersVisible(next)
      if (next) layers.userLayer.addTo(map); else map.removeLayer(layers.userLayer)
    }
  }

  const handleSearch = (q) => {
    setSearchQuery(q)
    const query = q.trim().toLowerCase()
    zonePolygonsRef.current.forEach(({ zone, poly }) => {
      if (!query) {
        poly.setStyle({ weight: 1.5, fillOpacity: 0.25 })
      } else if (zone.name.toLowerCase().includes(query)) {
        poly.setStyle({ weight: 3, fillOpacity: 0.5 })
        mapInstance.current?.fitBounds(poly.getBounds(), { padding: [40, 40] })
      } else {
        poly.setStyle({ weight: 1, fillOpacity: 0.1 })
      }
    })
  }

  const runOptimizer = async () => {
    setOptLoading(true)
    try {
      const L = require('leaflet')
      const res = await fetch(`/api/optimize?city=${city}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setOptResults(data)

      const optLayer = optimizerLayerRef.current
      optLayer.clearLayers()
      const rec = data.recommendation
      const { heatIntensity, greenDeficit, corridorValue } = rec.breakdown
      const sinkNames = data.corridorSinks.map((s) => s.name).join(' ↔ ')

      data.corridorSinks.forEach((sink) => {
        L.polyline([[rec.lat, rec.lng], [sink.centroid.lat, sink.centroid.lng]], {
          color: '#4A7C59', weight: 2, dashArray: '6 5', opacity: 0.7,
        }).addTo(optLayer)
      })
      data.topCandidates.slice(1).forEach((c) => {
        L.circleMarker([c.lat, c.lng], {
          radius: 5, color: '#4A7C59', fillColor: '#4A7C59', fillOpacity: 0.15, weight: 1, opacity: 0.4,
        }).addTo(optLayer)
      })
      const winnerIcon = L.divIcon({
        className: '', html: '<div class="opt-marker-outer"></div>',
        iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -14],
      })
      L.marker([rec.lat, rec.lng], { icon: winnerIcon })
        .bindPopup(`
          <div style="font-family:'Outfit',sans-serif;min-width:190px;padding:2px">
            <div style="font-family:'Fraunces',serif;font-weight:600;font-size:14px;margin-bottom:6px">Optimal Greenery Site</div>
            <div style="font-size:12px;color:#8A8683;margin-bottom:8px">${rec.lat.toFixed(4)}°N, ${Math.abs(rec.lng).toFixed(4)}°W</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
              <span style="background:#D9383A;color:#fff;font-size:10px;padding:1px 6px;border-radius:999px">Heat ${heatIntensity}</span>
              <span style="background:#E76F51;color:#fff;font-size:10px;padding:1px 6px;border-radius:999px">Deficit ${greenDeficit}</span>
              <span style="background:#4A7C59;color:#fff;font-size:10px;padding:1px 6px;border-radius:999px">Corridor ${corridorValue}</span>
            </div>
            <div style="font-size:11px;color:#2C2A29">Bridges: ${sinkNames}</div>
          </div>
        `, { maxWidth: 240 })
        .addTo(optLayer).openPopup()

      mapInstance.current?.panTo([rec.lat, rec.lng])
    } catch (err) {
      console.error('Optimizer error:', err)
    } finally {
      setOptLoading(false)
    }
  }

  const clearOptimizer = () => {
    optimizerLayerRef.current?.clearLayers()
    setOptResults(null)
  }

  const ToggleBtn = ({ active, onClick, label }) => (
    <button
      onClick={onClick}
      className="layer-toggle w-10 h-6 rounded-full relative"
      style={{ backgroundColor: active ? '#D9383A' : '#8A8683' }}
    >
      <div
        className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm"
        style={{ right: active ? '4px' : 'auto', left: active ? 'auto' : '4px' }}
      ></div>
    </button>
  )

  return (
    <div className="bg-[#FDFBF7] text-text h-screen w-full overflow-hidden flex flex-col font-body">
      {/* Header */}
      <NavBar activePage="city" mode="user" />

      {/* Map + Sidebar */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Sidebar */}
        <aside className="absolute left-6 top-6 bottom-6 w-[320px] bg-white rounded-lg shadow-floating z-40 flex flex-col overflow-hidden border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-display text-2xl font-semibold">City Distribution</h1>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-xs font-semibold bg-[#FDFBF7] border border-border rounded px-2 py-1 focus:ring-primary"
              >
                <option value="sevilla">Sevilla</option>
                <option value="madrid">Madrid</option>
                <option value="barcelona">Barcelona</option>
                <option value="valencia">Valencia</option>
              </select>
            </div>
            <p className="text-muted text-sm mb-4">Urban heat island offset and vulnerable patient clusters.</p>
            <div className="flex w-full h-10 mb-6 rounded-lg border border-border bg-[#FDFBF7] overflow-hidden items-stretch">
              <div className="text-muted flex items-center justify-center pl-3">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-text text-sm px-3 placeholder-muted"
                placeholder="Search neighbourhoods..."
              />
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-100 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <div>
                <h4 className="font-medium text-primary text-sm">{severeCount} High-Risk Zone{severeCount !== 1 ? 's' : ''}</h4>
                <p className="text-xs text-text mt-1 opacity-80">Extreme heat offsets detected in central districts.</p>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {/* Time slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-muted uppercase tracking-wider">Time of Day</h3>
                <span className="text-xs font-semibold bg-[#FDFBF7] px-2 py-1 rounded border border-border">
                  {String(currentHour).padStart(2, '0')}:00
                </span>
              </div>
              <input
                type="range" min="0" max="23" value={currentHour}
                onChange={(e) => handleHourChange(parseInt(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted mt-2 px-1">
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
              </div>
            </div>

            {/* Layer toggles */}
            <h3 className="font-medium text-sm text-muted uppercase tracking-wider mb-4">Map Layers</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Thermal Surface</span>
              <ToggleBtn active={surfaceVisible} onClick={() => toggleLayer('surface')} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Heat Island Offset</span>
              <ToggleBtn active={zonesVisible} onClick={() => toggleLayer('zones')} />
            </div>
            <div className="mb-8 pl-2 border-l-2 border-border">
              <div className="text-xs text-muted mb-2 flex justify-between">
                <span>Cooler (-2°C)</span><span>Hotter (+4°C)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#4A7C59] via-[#E76F51] to-[#D9383A] mb-3"></div>
              <div className="space-y-2">
                {[
                  { color: 'bg-primary/30 border-primary', label: '> +3°C (Severe Risk)' },
                  { color: 'bg-risk-amber/30 border-risk-amber', label: '+1°C to +3°C (Elevated)' },
                  { color: 'bg-safe-sage/30 border-safe-sage', label: '< +1°C (Baseline/Cooler)' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-sm border ${color}`}></div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Vulnerable Clusters</span>
              <ToggleBtn active={usersVisible} onClick={() => toggleLayer('users')} />
            </div>
            <div className="pl-2 flex items-center gap-2 text-sm text-muted">
              <div className="w-3 h-3 rounded-full bg-text border-2 border-white shadow-sm"></div>
              <span>Registered users by risk score</span>
            </div>

            {/* Greenery Optimizer */}
            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-medium text-sm text-muted uppercase tracking-wider mb-1">Greenery Optimizer</h3>
              <p className="text-xs text-muted mb-4 leading-relaxed">Find the optimal coordinate to plant new greenery based on heat intensity, green deficit, and corridor bridging potential.</p>
              <button
                onClick={runOptimizer}
                disabled={optLoading}
                className="w-full flex items-center justify-center gap-2 bg-safe-sage text-white text-sm font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[18px] ${optLoading ? 'animate-spin' : ''}`}>{optLoading ? 'autorenew' : 'eco'}</span>
                {optLoading ? 'Analysing…' : 'Analyse Optimal Placement'}
              </button>

              {optResults && (
                <div className="mt-4 space-y-4">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-safe-sage uppercase tracking-wider">Recommended Location</span>
                      <span className="text-xs font-bold bg-safe-sage text-white px-2 py-0.5 rounded-full">Score {Math.round(optResults.recommendation.total * 100)}</span>
                    </div>
                    <p className="font-mono text-xs text-text mt-1">{optResults.recommendation.lat.toFixed(4)}°N, {Math.abs(optResults.recommendation.lng).toFixed(4)}°W</p>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Creates corridor: {optResults.corridorSinks.map((s) => s.name).join(' ↔ ')}</p>
                  </div>
                  {[
                    { label: 'Heat Intensity', val: optResults.recommendation.breakdown.heatIntensity, color: 'bg-primary', desc: 'IDW-blended temperature offset at this coordinate' },
                    { label: 'Green Deficit', val: optResults.recommendation.breakdown.greenDeficit, color: 'bg-risk-amber', desc: 'Distance from nearest existing park or cool zone' },
                    { label: 'Corridor Value', val: optResults.recommendation.breakdown.corridorValue, color: 'bg-safe-sage', desc: 'Bridges thermal gap between existing cool sinks' },
                  ].map(({ label, val, color, desc }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted">{val}/100</span>
                      </div>
                      <div className="opt-bar-track"><div className={`opt-bar-fill ${color}`} style={{ width: `${val}%` }}></div></div>
                      <p className="text-[10px] text-muted mt-1">{desc}</p>
                    </div>
                  ))}
                  <button onClick={clearOptimizer} className="w-full text-xs text-muted hover:text-primary transition-colors py-1">Clear result</button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-border bg-[#FDFBF7] text-center">
            <p className="text-xs text-muted">{lastUpdated}</p>
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 relative z-0 w-full h-full">
          <div ref={mapRef} id="map" style={{ width: '100%', height: '100%', background: '#e8e0d8' }}></div>
        </div>
      </main>
    </div>
  )
}
