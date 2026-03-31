import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'
import NavBar from './NavBar'

export default function EnterpriseMapClient() {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const allDataRef = useRef(null)
  const layersRef = useRef({})
  const heatSurfaceRef = useRef(null)
  const lightTilesRef = useRef(null)
  const satTilesRef = useRef(null)

  const [city, setCity] = useState('sevilla')
  const [currentHour] = useState(15) // peak at 3PM
  const [virtualNodes, setVirtualNodes] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [surfaceVisible, setSurfaceVisible] = useState(true)
  const [satVisible, setSatVisible] = useState(false)
  const [roi, setRoi] = useState({ temp: '0.0', people: 0, savings: 0 })
  const [lastUpdated, setLastUpdated] = useState('Loading...')

  const hardcodedSites = [
    { lat: 37.3979, lng: -5.9768, name: "Arroyo / Tharsis Intersection", reason: "Major concrete heat sink with zero canopy cover. High traffic volume exacerbates local surface temperatures." },
    { lat: 37.3792, lng: -5.9475, name: "Cerro del Águila (Central)", reason: "Extreme urban density with no public green spaces within 400m. Buildings retain heat throughout the night." },
    { lat: 37.3828, lng: -6.0028, name: "Pagés del Corro (Triana)", reason: "Deep urban canyon in Triana. Historical masonry traps heat, and lack of greenery prevents natural evaporative cooling." }
  ]

  // Stable helper refs so effects can call them
  const virtualNodesRef = useRef([])
  const isSimulatingRef = useRef(false)

  function getTempAt(lat, lng, hour, excludeVirtual = false) {
    const data = allDataRef.current
    if (!data || !data.zones) return 0
    const baseTemp = (data.hourly?.[hour] || { temp: 32 }).temp
    let num = 0; let den = 0
    const nodes = excludeVirtual ? data.zones : [...data.zones, ...virtualNodesRef.current]
    nodes.forEach((z) => {
      const dist = Math.sqrt((lat - z.centroid.lat) ** 2 + (lng - z.centroid.lng) ** 2)
      if (dist === 0) { num = baseTemp + z.offset; den = 1; return }
      const w = 1 / dist ** 1.5
      num += (baseTemp + z.offset) * w; den += w
    })
    return den === 0 ? baseTemp : num / den
  }

  function tempToColor(temp) {
    if (temp >= 40) return 'rgba(153, 27, 27, 0.75)'
    if (temp >= 37) return 'rgba(220, 38, 38, 0.65)'
    if (temp >= 34) return 'rgba(234, 88, 12, 0.6)'
    if (temp >= 30) return 'rgba(251, 191, 36, 0.55)'
    return 'rgba(21, 128, 61, 0.45)'
  }

  function redrawHeatSurface() {
    if (heatSurfaceRef.current?._draw) heatSurfaceRef.current._draw()
  }

  function recalcROI() {
    const data = allDataRef.current
    if (!data || virtualNodesRef.current.length === 0) {
      setRoi({ temp: '0.0', people: 0, savings: 0 })
      return
    }
    const reductions = []; let secured = 0
    data.users.forEach((u) => {
      const before = getTempAt(u.lat, u.lng, currentHour, true)
      const after = getTempAt(u.lat, u.lng, currentHour, false)
      const diff = before - after
      if (diff > 0.1) reductions.push(diff)
      if (before >= 35 && after < 35) secured += 10
    })
    const avg = reductions.length > 0 ? (reductions.reduce((a, b) => a + b, 0) / reductions.length).toFixed(1) : '0.0'
    setRoi({ temp: avg, people: secured, savings: secured * 1500 })
  }

  async function findOptimalSites() {
    setIsCalculating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsCalculating(false)

    const L = require('leaflet')
    const { optimalLayer } = layersRef.current
    if (!optimalLayer) return
    optimalLayer.clearLayers()
    
    hardcodedSites.forEach((site, i) => {
      const goldIcon = L.divIcon({
        className: '',
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-12 h-12 bg-safe-sage opacity-20 rounded-full animate-ping"></div>
                 <div class="w-8 h-8 rounded-full bg-white border-2 border-safe-sage flex items-center justify-center shadow-floating z-10">
                   <span class="text-safe-sage font-bold text-xs">${i + 1}</span>
                 </div>
               </div>`,
        iconSize: [32, 32], iconAnchor: [16, 16],
      })
      const marker = L.marker([site.lat, site.lng], { icon: goldIcon }).addTo(optimalLayer)
      marker.bindTooltip(`
        <div style="width:210px;padding:10px;background:#fff;border-radius:8px;border:1px solid #e5e0da;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
          <div style="color:#4A7C59;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Priority Site #${i + 1}</div>
          <div style="font-weight:600;font-size:14px;line-height:1.3;margin-bottom:6px;color:#1b1c19;white-space:normal;word-break:break-word">${site.name}</div>
          <div style="font-size:11px;color:#8A8683;line-height:1.5;white-space:normal;word-break:break-word">${site.reason}</div>
        </div>
      `, { permanent: true, direction: 'top', className: 'hex-tooltip', maxWidth: 230 })
    })
    
    if (mapInstance.current) {
      mapInstance.current.panTo([hardcodedSites[0].lat, hardcodedSites[0].lng])
    }
  }

  // Init map once
  useEffect(() => {
    const L = require('leaflet')
    if (mapInstance.current) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView([37.385, -5.990], 13)
    mapInstance.current = map

    const light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19,
    }).addTo(map)
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri', maxZoom: 19,
    })
    lightTilesRef.current = light
    satTilesRef.current = sat

    const heatSurfaceLayer = L.layerGroup().addTo(map)
    const virtualLayer = L.layerGroup().addTo(map)
    const optimalLayer = L.layerGroup().addTo(map)
    layersRef.current = { heatSurfaceLayer, virtualLayer, optimalLayer }

    const HeatSurface = L.Layer.extend({
      onAdd(m) {
        this._container = L.DomUtil.create('canvas', 'leaflet-zoom-animated')
        this._container.style.opacity = '1'
        this._container.style.pointerEvents = 'none'
        this._container.style.zIndex = '400'
        m.getPanes().overlayPane.appendChild(this._container)
        m.on('viewreset moveend', this._reset, this)
        this._reset()
      },
      onRemove(m) {
        m.getPanes().overlayPane.removeChild(this._container)
        m.off('viewreset moveend', this._reset, this)
      },
      _reset() {
        if (!mapInstance.current) return
        const size = mapInstance.current.getSize()
        this._container.width = size.x
        this._container.height = size.y
        L.DomUtil.setPosition(this._container, mapInstance.current.containerPointToLayerPoint([0, 0]))
        this._draw()
      },
      _draw() {
        if (!allDataRef.current || !mapInstance.current) return
        const ctx = this._container.getContext('2d')
        const size = mapInstance.current.getSize()
        ctx.clearRect(0, 0, size.x, size.y)
        const step = 45
        for (let x = 0; x < size.x; x += step) {
          for (let y = 0; y < size.y; y += step) {
            const ll = mapInstance.current.containerPointToLatLng([x + step / 2, y + step / 2])
            const temp = getTempAt(ll.lat, ll.lng, currentHour)
            ctx.fillStyle = tempToColor(temp)
            ctx.fillRect(x, y, step, step)
          }
        }
      },
    })

    const surface = new HeatSurface()
    surface.addTo(heatSurfaceLayer)
    heatSurfaceRef.current = surface

    map.on('click', (e) => {
      if (!isSimulatingRef.current) return
      const newPark = {
        zoneId: `virtual-${Date.now()}`,
        centroid: { lat: e.latlng.lat, lng: e.latlng.lng },
        offset: -3.5,
      }
      virtualNodesRef.current = [...virtualNodesRef.current, newPark]
      setVirtualNodes([...virtualNodesRef.current])

      const icon = L.divIcon({ className: 'virtual-park-marker', iconSize: [20, 20] })
      L.marker([e.latlng.lat, e.latlng.lng], { icon }).addTo(layersRef.current.virtualLayer)

      redrawHeatSurface()
      recalcROI()

      isSimulatingRef.current = false
      setIsSimulating(false)
      mapRef.current?.classList.remove('simulation-mode')
    })

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    const load = async () => {
      try {
        virtualNodesRef.current = []
        setVirtualNodes([])
        layersRef.current.virtualLayer?.clearLayers()

        const res = await fetch(`/api/zones?city=${city}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        allDataRef.current = data

        if (data.centroid) mapInstance.current.setView([data.centroid.lat, data.centroid.lng], 13)
        redrawHeatSurface()
        recalcROI()
        setLastUpdated('ENTERPRISE API')
      } catch (err) {
        console.error('Failed to load zones:', err)
        setLastUpdated('API Connection Error')
      }
    }
    load()
  }, [city])

  useEffect(() => {
    if (isSimulating) {
      isSimulatingRef.current = true
      mapRef.current?.classList.add('simulation-mode')
    } else {
      isSimulatingRef.current = false
      mapRef.current?.classList.remove('simulation-mode')
    }
  }, [isSimulating])

  const clearSimulations = () => {
    virtualNodesRef.current = []
    setVirtualNodes([])
    layersRef.current.virtualLayer?.clearLayers()
    redrawHeatSurface()
    recalcROI()
  }

  const toggleSat = () => {
    const next = !satVisible
    setSatVisible(next)
    if (next) {
      mapInstance.current.removeLayer(lightTilesRef.current)
      satTilesRef.current.addTo(mapInstance.current)
    } else {
      mapInstance.current.removeLayer(satTilesRef.current)
      lightTilesRef.current.addTo(mapInstance.current)
    }
    if (surfaceVisible) {
      mapInstance.current.removeLayer(layersRef.current.heatSurfaceLayer)
      layersRef.current.heatSurfaceLayer.addTo(mapInstance.current)
      setTimeout(redrawHeatSurface, 10)
    }
  }

  const toggleSurface = () => {
    const next = !surfaceVisible
    setSurfaceVisible(next)
    if (next) {
      layersRef.current.heatSurfaceLayer.addTo(mapInstance.current)
      setTimeout(redrawHeatSurface, 50)
    } else {
      mapInstance.current.removeLayer(layersRef.current.heatSurfaceLayer)
    }
  }

  const ToggleBtn = ({ active, onClick, color }) => (
    <button
      onClick={onClick}
      className="layer-toggle w-10 h-6 rounded-full relative transition-colors duration-200"
      style={{ backgroundColor: active ? (color || '#2563EB') : '#8A8683' }}
    >
      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-200 ${active ? 'left-[22px]' : 'left-[4px]'}`}></div>
    </button>
  )

  return (
    <div className="bg-[#FDFBF7] text-text h-screen w-full overflow-hidden flex flex-col font-body">
      <NavBar activePage="enterprise" mode="enterprise" />

      <main className="flex-1 relative flex overflow-hidden">
        <aside className="absolute left-6 top-6 bottom-6 w-[360px] bg-white rounded-lg shadow-floating z-40 flex flex-col overflow-hidden border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-display text-2xl font-semibold">Urban Planning</h1>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="text-xs font-semibold bg-[#FDFBF7] border border-border rounded px-2 py-1 focus:ring-enterprise-blue"
              >
                <option value="sevilla">Sevilla</option>
                <option value="madrid">Madrid</option>
                <option value="barcelona">Barcelona</option>
                <option value="valencia">Valencia</option>
              </select>
            </div>
            <p className="text-muted text-sm mb-6">Simulate interventions and analyze thermal resilience indices.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
              <h3 className="font-semibold text-enterprise-blue text-sm flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[18px]">park</span> What-If Simulator
              </h3>
              <p className="text-xs text-text opacity-80 mb-3">Draw a virtual green space to simulate cooling radius and ROI.</p>
              <button
                onClick={() => setIsSimulating(true)}
                className="w-full bg-enterprise-blue text-white rounded py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">add_location</span>
                Add Virtual Park (-3.5°C Offset)
              </button>
              <button
                onClick={findOptimalSites}
                disabled={isCalculating}
                className="w-full mt-2 bg-safe-sage text-white rounded py-2 text-sm font-medium hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-75"
              >
                <span className={`material-symbols-outlined text-[16px] ${isCalculating ? 'animate-spin' : ''}`}>
                  {isCalculating ? 'autorenew' : 'psychology'}
                </span>
                {isCalculating ? 'Analysing Urban Fabric...' : 'Find Optimal Sites'}
              </button>
              {virtualNodes.length > 0 && (
                <button
                  onClick={clearSimulations}
                  className="w-full mt-2 border border-enterprise-blue text-enterprise-blue rounded py-2 text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Clear Simulations
                </button>
              )}
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <h3 className="font-medium text-sm text-muted uppercase tracking-wider mb-4">Projected ROI Metrics</h3>
            <div className="space-y-4 mb-8">
              {[
                { label: 'Avg. Temp Reduction', val: `-${roi.temp}°C` },
                { label: 'High-Risk Residents Secured', val: roi.people },
                { label: 'Est. Annual Healthcare Savings', val: `€${Number(roi.savings).toLocaleString()}` },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center border-b border-border pb-2">
                  <span className="text-sm text-text">{label}</span>
                  <span className="font-bold text-safe-sage">{val}</span>
                </div>
              ))}
            </div>

            <h3 className="font-medium text-sm text-muted uppercase tracking-wider mb-4">Enterprise Layers</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Thermal Surface (IDW)</span>
              <ToggleBtn active={surfaceVisible} onClick={toggleSurface} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Satellite Base (NDVI Proxy)</span>
              <ToggleBtn active={satVisible} onClick={toggleSat} />
            </div>
          </div>

          <div className="p-4 border-t border-border bg-[#FDFBF7] text-center">
            <p className="text-xs text-muted">{lastUpdated}</p>
          </div>
        </aside>

        <div className="flex-1 relative z-0 w-full h-full">
          <div ref={mapRef} id="map" style={{ width: '100%', height: '100%', background: '#e8e0d8' }}></div>
          {isSimulating && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white border border-enterprise-blue text-enterprise-blue px-6 py-3 rounded-full shadow-floating font-medium text-sm z-[1000]">
              Click anywhere on the map to place a Virtual Park
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
