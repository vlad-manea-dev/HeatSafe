import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

// Heatmap layers — all sit inside a single clipPath wrapper so they reveal together.
// Positions are viewport-percentages calibrated to Seville at zoom 13:
//   Centro Histórico ≈ 50% 46%   Macarena ≈ 45% 33%
//   Nervión/Este    ≈ 64% 51%   Triana/Sur ≈ 42% 63%
const HEAT_LAYERS = [
  // Base: city-wide warmth (dark maroon blanket)
  'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(100,0,0,0.42) 0%, rgba(60,0,0,0.14) 75%, transparent 100%)',
  // District A — Centro Histórico (dense stone, no shade)
  'radial-gradient(ellipse 28% 22% at 50% 46%, rgba(210,22,0,0.62) 0%, rgba(145,0,0,0.32) 65%, transparent 100%)',
  // District B — Macarena / Norte
  'radial-gradient(ellipse 20% 17% at 45% 33%, rgba(195,30,0,0.55) 0%, rgba(130,0,0,0.27) 65%, transparent 100%)',
  // District C — Nervión / Este (commercial)
  'radial-gradient(ellipse 18% 14% at 64% 51%, rgba(200,25,0,0.52) 0%, rgba(138,0,0,0.25) 65%, transparent 100%)',
  // District D — Triana / Sur
  'radial-gradient(ellipse 16% 13% at 42% 63%, rgba(185,18,0,0.46) 0%, rgba(122,0,0,0.22) 65%, transparent 100%)',
  // Hotspot 1 — peak heat (market, asphalt square)
  'radial-gradient(circle 9% at 51% 44%, rgba(255,145,0,0.80) 0%, rgba(235,48,0,0.52) 42%, transparent 100%)',
  // Hotspot 2 — secondary hot node
  'radial-gradient(circle 7% at 46% 36%, rgba(255,125,0,0.74) 0%, rgba(225,38,0,0.46) 42%, transparent 100%)',
  // Hotspot 3 — eastern node
  'radial-gradient(circle 6% at 63% 50%, rgba(255,108,0,0.68) 0%, rgba(215,32,0,0.40) 42%, transparent 100%)',
  // Hotspot 4 — southern node
  'radial-gradient(circle 5% at 44% 62%, rgba(255,95,0,0.62) 0%, rgba(205,28,0,0.36) 42%, transparent 100%)',
]

export default function ThermalBackground() {
  const mapContainerRef = useRef(null)
  const overlayRef      = useRef(null)
  const mapInstance     = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return
    if (mapInstance.current) return

    const L = require('leaflet')

    const map = L.map(mapContainerRef.current, {
      center: [37.3891, -5.9845],
      zoom: 13,
      zoomControl:        false,
      attributionControl: false,
      dragging:           false,
      touchZoom:          false,
      scrollWheelZoom:    false,
      doubleClickZoom:    false,
      boxZoom:            false,
      keyboard:           false,
      tap:                false,
    })

    mapInstance.current = map

    // CartoDB Positron — the clean minimal light-gray tile style
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20 }
    ).addTo(map)

    setTimeout(() => map.invalidateSize(), 120)

    // Thermal reveal — driven by the same 1400px window as the hero pin in index.js
    ;(async () => {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      gsap.fromTo(
        overlayRef.current,
        { clipPath: 'circle(0% at 50% 45%)' },
        {
          clipPath: 'circle(95% at 50% 45%)',
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: '+=1400',
            scrub: 1.8,
          },
        }
      )
    })()

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Real Leaflet map — desaturated to feel cool before the thermal reveal */}
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', inset: 0, filter: 'grayscale(0.25) sepia(0.06)' }}
      />

      {/* Multi-zone thermal overlay — all layers clip in together as one radial reveal */}
      <div
        ref={overlayRef}
        style={{ position: 'absolute', inset: 0, clipPath: 'circle(0% at 50% 45%)' }}
      >
        {HEAT_LAYERS.map((bg, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              background: bg,
              mixBlendMode: i === 0 ? 'normal' : 'screen',
            }}
          />
        ))}
      </div>
    </div>
  )
}
