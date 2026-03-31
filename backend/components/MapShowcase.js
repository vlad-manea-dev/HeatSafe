import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

const HEAT_LAYERS = [
  'radial-gradient(ellipse 95% 85% at 50% 50%, rgba(100,0,0,0.42) 0%, rgba(60,0,0,0.14) 75%, transparent 100%)',
  'radial-gradient(ellipse 28% 22% at 50% 46%, rgba(210,22,0,0.62) 0%, rgba(145,0,0,0.32) 65%, transparent 100%)',
  'radial-gradient(ellipse 20% 17% at 45% 33%, rgba(195,30,0,0.55) 0%, rgba(130,0,0,0.27) 65%, transparent 100%)',
  'radial-gradient(ellipse 18% 14% at 64% 51%, rgba(200,25,0,0.52) 0%, rgba(138,0,0,0.25) 65%, transparent 100%)',
  'radial-gradient(ellipse 16% 13% at 42% 63%, rgba(185,18,0,0.46) 0%, rgba(122,0,0,0.22) 65%, transparent 100%)',
  'radial-gradient(circle 9% at 51% 44%, rgba(255,145,0,0.80) 0%, rgba(235,48,0,0.52) 42%, transparent 100%)',
  'radial-gradient(circle 7% at 46% 36%, rgba(255,125,0,0.74) 0%, rgba(225,38,0,0.46) 42%, transparent 100%)',
  'radial-gradient(circle 6% at 63% 50%, rgba(255,108,0,0.68) 0%, rgba(215,32,0,0.40) 42%, transparent 100%)',
  'radial-gradient(circle 5% at 44% 62%, rgba(255,95,0,0.62) 0%, rgba(205,28,0,0.36) 42%, transparent 100%)',
]

// Phone geometry
const PW = 280, PH = 560, PR = 44   // phone shell
const SW = 264, SH = 536, SR = 36   // screen (8px side, 12px top/bottom inset)

export default function MapShowcase({ children }) {
  const outerRef   = useRef(null)  // 350vh scroll container
  const mapWrapRef = useRef(null)  // clipped wrapper: starts at screen shape → full vp
  const mapRef     = useRef(null)  // Leaflet mount
  const shellRef   = useRef(null)  // SVG phone frame, fades out
  const overlayRef = useRef(null)  // thermal layers, clips in
  const mapInst    = useRef(null)

  const childrenRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return
    if (mapInst.current) return

    const L = require('leaflet')
    const map = L.map(mapRef.current, {
      center: [37.3891, -5.9845], zoom: 12,
      zoomControl: false, attributionControl: false,
      dragging: false, touchZoom: false, scrollWheelZoom: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false,
    })
    mapInst.current = map

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 20 }
    ).addTo(map)

    mapRef.current.style.filter = 'grayscale(0.25) sepia(0.06)'
    setTimeout(() => map.invalidateSize(), 150)

    ;(async () => {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      // Clip map to iPhone screen shape initially
      const vw   = window.innerWidth
      const vh   = window.innerHeight
      
      const iTop   = Math.round((vh - SH) / 2)
      const centerX = vw * 0.8 // Move to the right
      const iLeft  = Math.round(centerX - SW / 2)
      const iRight = Math.round(vw - (centerX + SW / 2))
      const iBottom = vh - (iTop + SH)

      gsap.set(mapWrapRef.current, {
        clipPath: `inset(${iTop}px ${iRight}px ${iBottom}px ${iLeft}px round ${SR}px)`,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   2,
        },
      })

      // 0 → 0.45: clip expands, phone shell fades out, children fade out, background darkens
      tl.to(mapWrapRef.current, {
        clipPath: 'inset(0px 0px 0px 0px round 0px)',
        ease:     'power2.inOut',
        duration: 0.45,
      }, 0)

      tl.to(shellRef.current, {
        opacity:  0,
        x:        -100, // Slight movement to the left as it fades
        ease:     'power2.out',
        duration: 0.3,
      }, 0)

      tl.to(childrenRef.current, {
        opacity: 0,
        y: -50,
        ease: 'power2.inOut',
        duration: 0.35
      }, 0)

      tl.to(outerRef.current.querySelector('.sticky-container'), {
        backgroundColor: '#0e0e0e',
        duration: 0.45
      }, 0)

      // 0.45 → 1.0: thermal overlay clips in
      tl.fromTo(overlayRef.current,
        { clipPath: 'circle(0% at 50% 45%)' },
        { clipPath: 'circle(95% at 50% 45%)', ease: 'none', duration: 0.55 },
        0.45
      )
    })()

    return () => {
      mapInst.current?.remove()
      mapInst.current = null
    }
  }, [])

  return (
    <div ref={outerRef} style={{ height: '350vh', position: 'relative' }}>
      <div
        className="sticky-container"
        style={{
          position:   'sticky',
          top:        0,
          height:     '100vh',
          background: '#fbf9f4',
          overflow:   'hidden',
        }}
      >
        {/* Map layer — always full viewport, clipped initially */}
        <div ref={mapWrapRef} style={{ position: 'absolute', inset: 0 }}>
          <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />

          {/* Thermal overlay */}
          <div
            ref={overlayRef}
            style={{
              position:      'absolute',
              inset:         0,
              clipPath:      'circle(0% at 50% 45%)',
              pointerEvents: 'none',
            }}
          >
            {HEAT_LAYERS.map((bg, i) => (
              <div
                key={i}
                style={{
                  position:     'absolute',
                  inset:        0,
                  background:   bg,
                  mixBlendMode: i === 0 ? 'normal' : 'screen',
                }}
              />
            ))}
          </div>
        </div>

        {/* Children (e.g. Hero content) */}
        <div ref={childrenRef} style={{ position: 'relative', zIndex: 20 }}>
          {children}
        </div>

        {/* Phone frame SVG — body is opaque, screen is transparent (cut out by mask) */}
        <svg
          ref={shellRef}
          width={PW + 8}
          height={PH + 8}
          viewBox={`-4 -4 ${PW + 8} ${PH + 8}`}
          style={{
            position:      'absolute',
            top:           '50%',
            left:          '80%',
            transform:     'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex:        10,
            filter:        'drop-shadow(0 40px 90px rgba(0,0,0,0.75)) drop-shadow(0 0 0 rgba(0,0,0,0))',
            overflow:      'visible',
          }}
        >
          <defs>
            {/* Mask: white = visible phone body, black = transparent screen hole */}
            <mask id="hs-phone-mask">
              <rect x="0" y="0" width={PW} height={PH} rx={PR} fill="white" />
              <rect x="8" y="12" width={SW} height={SH} rx={SR} fill="black" />
            </mask>
          </defs>

          {/* Phone body with transparent screen */}
          <rect
            x="0" y="0" width={PW} height={PH} rx={PR}
            fill="#1c1c1e"
            mask="url(#hs-phone-mask)"
          />

          {/* Subtle edge highlight ring */}
          <rect
            x="0.75" y="0.75"
            width={PW - 1.5} height={PH - 1.5}
            rx={PR - 0.75}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1.5"
            mask="url(#hs-phone-mask)"
          />

          {/* Dynamic island */}
          <rect x="90" y="16" width="100" height="26" rx="13" fill="#0d0d0d" />

          {/* Left side button */}
          <rect x="-3" y={Math.round(PH * 0.30)} width="3" height="60" rx="1.5" fill="#2a2a2a" />

          {/* Right buttons */}
          <rect x={PW}                         y={Math.round(PH * 0.24)}      width="3" height="40" rx="1.5" fill="#2a2a2a" />
          <rect x={PW} y={Math.round(PH * 0.24) + 52} width="3" height="40" rx="1.5" fill="#2a2a2a" />
        </svg>

      </div>
    </div>
  )
}
