import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import createGlobe from 'cobe'

const MapShowcase = dynamic(
  () => import('../components/MapShowcase'),
  { ssr: false }
)
const ThermalGlobe = dynamic(
  () => import('../components/ThermalGlobe'),
  { ssr: false }
)
import ShutterSection from '../components/ShutterSection'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconFlame({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.58-8-7.5 0-3.07 2.17-5.65 3.5-7.28C9.15 6.28 10.54 4.34 11 2c.68 1.63 2.06 3.36 3.5 5.22C15.84 8.85 20 12.43 20 15.5 20 19.42 16.97 23 12 23zm0-2c3.31 0 6-2.24 6-5.5 0-2.04-2.38-4.7-4.14-6.7-.6-.68-1.16-1.32-1.58-1.93-.35.79-.87 1.58-1.47 2.38C9.2 11.37 6 14.03 6 15.5 6 18.76 8.69 21 12 21z"/>
    </svg>
  )
}

function IconGrid({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

// ─── Globe Component (cobe) ───────────────────────────────────────────────────

function HeatGlobe() {
  const canvasRef = useRef(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const phiRef = useRef(0)
  const globeRef = useRef(null)

  const onPointerDown = useCallback((e) => {
    pointerInteracting.current = e.clientX - pointerInteractionMovement.current
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing'
  }, [])

  const onPointerUp = useCallback(() => {
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }, [])

  const onPointerOut = useCallback(() => {
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = 'grab'
  }, [])

  const onMouseMove = useCallback((e) => {
    if (pointerInteracting.current !== null) {
      const delta = e.clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    // Set explicit pixel dimensions on the canvas before creating the globe
    const size = 800
    canvasRef.current.width = size * 2
    canvasRef.current.height = size * 2

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: 0,
      theta: 0.25,
      dark: 0.25,
      diffuse: 1.4,
      scale: 0.98,
      mapSamples: 42000,
      mapBrightness: 1.2,
      baseColor: [0.05, 0.1, 0.16],
      markerColor: [1, 0.15, 0.15],
      glowColor: [0.04, 0.06, 0.08],
      offset: [0, 0],
      markers: [
        { location: [35.68, -5.9], size: 0.04 },      // Morocco
        { location: [30.04, 31.24], size: 0.05 },      // Cairo
        { location: [28.61, 77.21], size: 0.06 },      // Delhi
        { location: [25.20, 55.27], size: 0.04 },      // Dubai
        { location: [23.42, 53.85], size: 0.03 },      // UAE
        { location: [15.32, 44.21], size: 0.03 },      // Yemen
        { location: [12.97, 77.59], size: 0.04 },      // Bangalore
        { location: [36.74, 3.09], size: 0.03 },       // Algeria
        { location: [13.76, 100.50], size: 0.03 },     // Bangkok
        { location: [-1.29, 36.82], size: 0.03 },      // Nairobi
        { location: [6.52, 3.38], size: 0.03 },        // Lagos
        { location: [41.90, 12.50], size: 0.03 },      // Rome
        { location: [53.35, -6.26], size: 0.02 },      // Dublin
        { location: [40.42, -3.70], size: 0.04 },      // Madrid
        { location: [37.39, -5.98], size: 0.04 },      // Seville
        { location: [33.87, 151.21], size: 0.03 },     // Sydney
        { location: [24.47, 54.37], size: 0.03 },      // Abu Dhabi
        { location: [19.08, 72.88], size: 0.05 },      // Mumbai
      ],
      onRender: (state) => {
        if (pointerInteracting.current === null) {
          phiRef.current += 0.003
        } else {
          phiRef.current += pointerInteractionMovement.current / 200
        }
        state.phi = phiRef.current
      },
    })
    globeRef.current = globe

    return () => {
      globe.destroy()
    }
  }, [])

  return (
    <div className="reveal relative w-[600px] h-[600px] md:w-[750px] md:h-[750px] lg:w-[900px] lg:h-[900px] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerOut={onPointerOut}
        onMouseMove={onMouseMove}
        style={{
          width: 800,
          height: 800,
          maxWidth: '100%',
          cursor: 'grab',
          aspectRatio: '1',
        }}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home({ currentTemp }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    const supabase = createClient(url, key)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    // Staggered entrance animation
    ;(async () => {
      const { gsap } = await import('gsap')
      const ctx = gsap.context(() => {
        gsap.from('.reveal', {
          y: 60,
          opacity: 0,
          duration: 1.4,
          stagger: 0.1,
          ease: 'power4.out',
          delay: 0.2
        })
      }, heroRef)
      return () => ctx.revert()
    })()
  }, [])

  return (
    <>
      <Head>
        <title>HeatSafe — Heat kills. HeatSafe protects.</title>
        <meta name="description" content="An early-warning public health system designed to protect elderly residents during extreme heat events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="paper-texture bg-[#fbf9f4]" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ───────────────────────────────────────────────────────── */}
        <nav
          style={{
            position:             'fixed',
            top:                  '1.75rem',
            left:                 '50%',
            transform:            'translateX(-50%)',
            zIndex:               100,
            display:              'flex',
            alignItems:           'center',
            justifyContent:       'space-between',
            width:                'min(92vw, 1100px)',
            background:           'rgba(251,249,244,0.75)',
            backdropFilter:       'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRadius:         '100px',
            border:               '1px solid rgba(27,28,25,0.06)',
            boxShadow:            '0 8px 30px -8px rgba(0,0,0,0.06)',
            padding:              '0.45rem 0.5rem 0.45rem 1.5rem',
            whiteSpace:           'nowrap',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#af101a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconFlame className="w-3 h-3 text-white" />
            </span>
            <span className="font-fraunces font-semibold text-[1.1rem] text-[#1b1c19] tracking-tight">
              HeatSafe
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/dashboard" className="font-outfit font-medium text-[0.95rem] text-[#1b1c19]/70 hover:text-[#1b1c19] transition-colors px-4 py-1">Solutions</Link>
            <Link href="/city" className="font-outfit font-medium text-[0.95rem] text-[#1b1c19]/70 hover:text-[#1b1c19] transition-colors px-4 py-1">Data</Link>
            <Link href="#how-it-works" className="font-outfit font-medium text-[0.95rem] text-[#1b1c19]/70 hover:text-[#1b1c19] transition-colors px-4 py-1">About</Link>
          </div>

          <div className="flex items-center">
            <Link
              href="/onboarding"
              className="font-outfit font-semibold text-[0.95rem] text-white"
              style={{
                background: '#af101a',
                padding: '0.65rem 1.8rem',
                borderRadius: '100px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(175, 16, 26, 0.2)'
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* ── Hero (Split Layout) ───────────────────────────────────────────── */}
        <section
          ref={heroRef}
          style={{
            height:         '100vh',
            display:        'flex',
            alignItems:     'center',
            padding:        '0 5vw',
            position:       'relative',
            overflow:       'hidden'
          }}
        >
          {/* Left Content */}
          <div style={{ flex: 1, zIndex: 10, maxWidth: '750px', textAlign: 'left' }}>
            {/* Headline */}
            <h1 className="reveal" style={{ margin: '0 0 1.5rem', lineHeight: 1.05 }}>
              <span
                className="font-fraunces"
                style={{ color: '#1b1c19', fontSize: 'clamp(4rem, 7.5vw, 7rem)', fontWeight: 400, letterSpacing: '-0.02em' }}
              >
                Heat kills.
              </span>
              <br />
              <span
                className="font-fraunces"
                style={{
                  color: '#af101a',
                  fontSize: 'clamp(4rem, 7.5vw, 7rem)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                }}
              >
                HeatSafe protects.
              </span>
            </h1>

            {/* Tagline */}
            <p
              className="reveal font-outfit"
              style={{ color: 'rgba(27,28,25,0.6)', fontSize: '1.25rem', fontWeight: 400, lineHeight: 1.65, maxWidth: '540px', margin: '0 0 2.5rem' }}
            >
              An early-warning public health system designed to protect elderly residents during extreme heat events.
            </p>

            {/* CTAs */}
            <div className="reveal flex items-center gap-4">
              <Link
                href="/onboarding"
                className="btn-primary font-outfit font-semibold text-[0.85rem]"
                style={{ background: '#af101a', color: '#fff', padding: '0.95rem 2rem', borderRadius: '100px', textDecoration: 'none' }}
              >
                Register someone at risk
              </Link>
              <Link
                href="/city"
                className="btn-secondary font-outfit font-semibold text-[0.85rem]"
                style={{ background: 'transparent', color: '#1b1c19', padding: '0.95rem 2rem', borderRadius: '100px', textDecoration: 'none', border: '1px solid rgba(27,28,25,0.25)' }}
              >
                Explore city dashboard
              </Link>
            </div>
          </div>

          {/* Right Content (Globe) */}
          <div style={{
            position: 'absolute',
            right: '-5vw',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 'min(85vw, 1200px)',
            height: '110vh',
            pointerEvents: 'none',
          }}>
            <ThermalGlobe />
          </div>
        </section>

        {/* ── MapShowcase (350vh) ───────────────────────────────────────────
            Phone visible → scroll → map bursts out of phone → heats up red
        ──────────────────────────────────────────────────────────────────── */}
        <MapShowcase>
          {/* Transition text inside showcase */}
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <div className="reveal">
                <span className="font-inter text-[10px] font-bold tracking-[0.4em] uppercase text-[#af101a] mb-4 block">Deployment</span>
                <h2 className="font-newsreader text-[3.5rem] text-[#1b1c19] font-bold">In every pocket.</h2>
             </div>
          </div>
        </MapShowcase>

        {/* ── SMS Preview ──────────────────────────────────────────────────── */}
        <section style={{ background: '#fbf9f4', padding: '10rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="flex flex-col items-center max-w-2xl text-center mb-16">
            <span className="font-inter text-[10px] font-bold tracking-[0.3em] uppercase text-[#af101a] mb-6">Patient Communication</span>
            <h2 className="font-newsreader text-[2.5rem] md:text-[3.5rem] leading-[1.1] text-[#1b1c19] mb-6">Personalised heat protocols.</h2>
            <p className="font-inter text-[#1b1c19]/40 text-lg">Delivering actionable advice to the right person at the right time.</p>
          </div>

          <div style={{ position: 'relative' }}>
            <div 
              style={{ 
                maxWidth: 420, 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(20px)',
                borderRadius: '24px', 
                padding: '1.75rem',
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#af101a] flex items-center justify-center">
                  <IconFlame className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-inter font-bold text-[0.75rem] text-[#1b1c19]">HeatSafe Alert</p>
                  <p className="font-inter text-[0.65rem] text-[#1b1c19]/40">Today at 7:02 AM</p>
                </div>
              </div>
              <p className="font-inter text-[0.95rem] text-[#1b1c19]/80" style={{ lineHeight: 1.6, margin: 0 }}>
                ⚠️ Good morning Mary. Today&apos;s peak in Dublin is 34°C.
                Your furosemide increases dehydration risk — drink water every
                30 min and stay indoors 12–4pm.
              </p>
            </div>
            {/* Decorative element */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 60, height: 60, background: '#af101a', opacity: 0.03, borderRadius: '50%', zIndex: -1 }} />
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" style={{ background: '#fff', padding: '10rem 2rem' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-end mb-20">
              <h2
                className="font-newsreader"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#1b1c19', fontWeight: 700, lineHeight: 1, margin: 0 }}
              >
                The science of<br />protection.
              </h2>
              <p className="font-inter text-lg text-[#1b1c19]/40 max-w-md pb-2">
                HeatSafe bridges the gap between meteorological data and individual patient safety through three core pillars.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {[
                {
                  num: '01',
                  label: 'Heat intelligence',
                  body: 'Hyperlocal heat exposure tracking that accounts for urban heat islands and building density.',
                  border: 'rgba(27,28,25,0.06)',
                },
                {
                  num: '02',
                  label: 'Risk scoring',
                  body: 'Algorithmic assessment of age, medication, housing quality, and social isolation.',
                  border: '#af101a',
                },
                {
                  num: '03',
                  label: 'AI distribution',
                  body: 'Automated SMS protocols for users and escalation paths for carers and healthcare providers.',
                  border: 'rgba(27,28,25,0.06)',
                },
              ].map(({ num, label, body, border }) => (
                <div
                  key={num}
                  style={{
                    border: `1px solid ${border === '#af101a' ? '#af101a' : 'rgba(27,28,25,0.1)'}`,
                    borderRadius: 16,
                    padding: '2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    background: border === '#af101a' ? 'rgba(175, 16, 26, 0.01)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                  className="group hover:shadow-xl hover:shadow-black/5"
                >
                  <span
                    className="font-mono font-bold"
                    style={{ fontSize: '0.9rem', color: '#af101a', letterSpacing: '0.1em' }}
                  >
                    / {num}
                  </span>
                  <div>
                    <h3
                      className="font-inter font-bold"
                      style={{ fontSize: '0.8rem', color: '#1b1c19', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      {label}
                    </h3>
                    <p
                      className="font-newsreader"
                      style={{ fontSize: '2rem', color: '#1b1c19', margin: 0, lineHeight: 1.2, fontWeight: 500 }}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Shutter split ─────────────────────────────────────────────────── */}
        <ShutterSection />

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="px-10 pt-24 pb-14" style={{ background: '#fbf9f4' }}>
          <div className="max-w-7xl mx-auto flex items-start justify-between">
            <div>
              <p className="font-newsreader font-bold text-[#af101a] text-xl mb-2">HeatSafe</p>
              <p className="font-inter text-sm text-[#1b1c19]/40">© 2024 HeatSafe Public Health.</p>
            </div>
            <div className="flex items-center gap-8">
              {['Dashboard', 'City', 'Enterprise', 'Register'].map(label => (
                <Link key={label} href="#" className="font-inter text-sm text-[#1b1c19]/40 hover:text-[#1b1c19]/70 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </div>

      {/* ── Sticky dashboard button (logged-in) ──────────────────────────── */}
      {isLoggedIn && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{ background: 'rgba(251,249,244,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 32px rgba(27,28,25,0.10)' }}
          >
            <IconGrid className="w-4 h-4 text-[#1b1c19]/40" />
            <span className="font-inter text-sm text-[#1b1c19]/50">Welcome back</span>
            <span className="font-inter font-medium text-sm text-white px-4 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)' }}>
              Go to Dashboard
            </span>
          </Link>
        </div>
      )}
    </>
  )
}

export async function getServerSideProps() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast' +
        '?latitude=37.38&longitude=-5.97' +
        '&hourly=temperature_2m' +
        '&timezone=Europe%2FMadrid' +
        '&forecast_days=1'
    )
    if (!res.ok) throw new Error('Open-Meteo error')
    const data = await res.json()
    const hour = new Date().getHours()
    const temp = Math.round(data.hourly.temperature_2m[hour])
    return { props: { currentTemp: temp } }
  } catch {
    return { props: { currentTemp: 25 } }
  }
}
