import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

const HEAT_LAYERS = [
  // Base warm wash
  'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(180,60,0,0.35) 0%, rgba(120,30,0,0.12) 75%, transparent 100%)',
  // Large orange mid-zone
  'radial-gradient(ellipse 55% 45% at 52% 48%, rgba(255,120,0,0.45) 0%, rgba(220,70,0,0.20) 60%, transparent 100%)',
  // Red hotspot — centre
  'radial-gradient(circle 14% at 51% 44%, rgba(220,30,0,0.75) 0%, rgba(200,60,0,0.40) 50%, transparent 100%)',
  // Red hotspot — upper left
  'radial-gradient(circle 10% at 44% 34%, rgba(210,25,0,0.65) 0%, rgba(185,50,0,0.30) 55%, transparent 100%)',
  // Orange zone — right
  'radial-gradient(ellipse 22% 18% at 65% 52%, rgba(255,100,0,0.55) 0%, rgba(230,70,0,0.25) 60%, transparent 100%)',
  // Yellow hotspot — lower centre
  'radial-gradient(circle 8% at 48% 62%, rgba(255,210,0,0.72) 0%, rgba(255,150,0,0.40) 50%, transparent 100%)',
  // Yellow-orange zone — upper right
  'radial-gradient(circle 7% at 60% 38%, rgba(255,190,0,0.60) 0%, rgba(255,130,0,0.30) 55%, transparent 100%)',
  // Bright yellow core accent
  'radial-gradient(circle 5% at 50% 43%, rgba(255,240,80,0.55) 0%, rgba(255,180,0,0.25) 50%, transparent 100%)',
  // Soft orange fringe — bottom left
  'radial-gradient(ellipse 18% 14% at 40% 64%, rgba(255,140,0,0.42) 0%, rgba(220,80,0,0.18) 60%, transparent 100%)',
]


// Phone geometry
const PW = 280, PH = 560, PR = 44   // phone shell
const SW = 264, SH = 536, SR = 36   // screen (8px side, 12px top/bottom inset)

export default function MapShowcase({ children }) {
  const outerRef   = useRef(null)  // 350vh scroll container
  const mapWrapRef = useRef(null)  // clipped wrapper: starts at screen shape → full vp
  const mapRef     = useRef(null)  // Leaflet mount
  const shellRef   = useRef(null)  // SVG phone frame, fades out
  // thermal layers, clips in
  const overlayRef = useRef(null)
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

      // 0.45 → 1.0: multicolour heat blobs clip in
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

          {/* Multicolour heat blob overlay */}
          <div
            ref={overlayRef}
            style={{ position: 'absolute', inset: 0, clipPath: 'circle(0% at 50% 45%)', pointerEvents: 'none' }}
          >
            {HEAT_LAYERS.map((bg, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, background: bg, mixBlendMode: i === 0 ? 'normal' : 'screen' }} />
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
