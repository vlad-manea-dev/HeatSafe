import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconArrowUp({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function IconThermometer({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  )
}

function IconBell({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

function IconHeart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconBuilding({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="9" height="14" />
      <rect x="13" y="3" width="9" height="18" />
      <path d="M5 12h3M5 16h3M16 8h3M16 12h3M16 16h3" />
    </svg>
  )
}

function IconMap({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  )
}

// ─── Pulse dot ───────────────────────────────────────────────────────────────

function Pulse() {
  return (
    <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
      <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#af101a] opacity-50" />
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#af101a]" />
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home({ currentTemp }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Content refs for measurement
  const sectionRef   = useRef(null)  // timeline section
  const heading1Ref  = useRef(null)  // "Register someone at risk" h2
  const para2Ref     = useRef(null)  // "I plan cities" paragraph

  // Line geometry (all in px, relative to section top)
  const lineRef = useRef(null)
  const [lineTop,    setLineTop]    = useState(0)
  const [lineHeight, setLineHeight] = useState(0)
  const [dot1Y,      setDot1Y]      = useState(0)  // from line top
  const [dot2Y,      setDot2Y]      = useState(0)  // from line top

  // Fill state
  const [fillPx,    setFillPx]    = useState(0)
  const [dot1Active, setDot1Active] = useState(false)
  const [dot2Active, setDot2Active] = useState(false)

  // Auth
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    const supabase = createClient(url, key)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  // Measure line geometry from DOM after layout/images settle
  useEffect(() => {
    const measure = () => {
      if (!sectionRef.current || !heading1Ref.current || !para2Ref.current) return

      const sy  = window.scrollY
      const secTop   = sectionRef.current.getBoundingClientRect().top  + sy
      const h1Top    = heading1Ref.current.getBoundingClientRect().top  + sy
      const h1Bottom = heading1Ref.current.getBoundingClientRect().bottom + sy
      const p2Rect   = para2Ref.current.getBoundingClientRect()
      const p2Mid    = p2Rect.top + sy + p2Rect.height / 2

      // line starts at heading1 top
      const lt = h1Top - secTop
      // dot1 just below the heading (8px gap)
      const d1 = (h1Bottom - secTop) - lt + 8
      // dot2 at midpoint of city-planner paragraph
      const d2 = (p2Mid - secTop) - lt
      // line ends 20px below dot2
      const lh = d2 + 20

      setLineTop(lt)
      setLineHeight(lh)
      setDot1Y(d1)
      setDot2Y(d2)
    }

    measure()
    // Re-measure once images have likely loaded
    const t = setTimeout(measure, 800)
    window.addEventListener('resize', measure)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Scroll-driven fill — re-registers whenever geometry is (re)measured
  useEffect(() => {
    if (!lineHeight) return

    const handleScroll = () => {
      if (!lineRef.current || !sectionRef.current) return

      const sectionRect = sectionRef.current.getBoundingClientRect()
      const lh = lineRef.current.offsetHeight
      const vh = window.innerHeight

      // How many px of the section have scrolled past the bottom of the viewport.
      // 0 = section just entering, grows as user scrolls down.
      const entered = Math.max(0, vh - sectionRect.top)

      // Complete the fill after scrolling 85% of the viewport height into the section.
      // At that point the section top is ~15% vh from the top of the screen — still
      // clearly visible — so the line feels fully drawn while content is in view.
      const t = Math.min(1, entered / (vh * 1.4))

      // Dot waypoints as fractions of total progress
      const T1 = 0.30  // dot 1 activates at 30%
      const T2 = 0.70  // dot 2 activates at 70%

      let fill
      if (t <= T1) {
        fill = (t / T1) * dot1Y
      } else if (t <= T2) {
        fill = dot1Y + ((t - T1) / (T2 - T1)) * (dot2Y - dot1Y)
      } else {
        fill = dot2Y + ((t - T2) / (1 - T2)) * (lh - dot2Y)
      }

      const px = Math.max(0, fill)
      setFillPx(px)
      setDot1Active(px >= dot1Y)
      setDot2Active(px >= dot2Y)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [dot1Y, dot2Y, lineHeight])

  return (
    <>
      <Head>
        <title>HeatSafe — Heat kills. HeatSafe protects.</title>
        <meta name="description" content="An early-warning public health system designed to protect elderly residents during extreme heat events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(251,249,244,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #af101a',
        }}
      >
        <div className="max-w-7xl mx-auto px-10 py-5 flex items-center justify-between">
          <Link href="/" className="font-newsreader font-bold text-[1.4rem] text-[#af101a] tracking-tight">
            HeatSafe
          </Link>
          <div className="flex items-center gap-10">
            <Link href="#" className="font-inter text-base text-[#1b1c19]/70 hover:text-[#1b1c19] transition-colors">
              About
            </Link>
            <Link href="#" className="font-inter text-base text-[#1b1c19]/70 hover:text-[#1b1c19] transition-colors">
              Contact
            </Link>
            <Link
              href="/dashboard"
              className="font-inter font-medium text-sm text-white px-5 py-2.5 rounded-[12px]"
              style={{ background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)' }}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#fbf9f4] pt-40 pb-20 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 gap-24 items-center">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <Pulse />
              <span className="font-inter text-xs tracking-[0.18em] uppercase text-[#1b1c19]/60">
                Live Seville Temp: {currentTemp}°C
              </span>
            </div>
            <h1
              className="font-newsreader font-bold text-[#af101a] leading-[1.05] mb-8"
              style={{ fontSize: 'clamp(3.5rem, 6.5vw, 7rem)' }}
            >
              Heat kills.<br />
              HeatSafe<br />
              protects.
            </h1>
            <p className="font-inter text-lg text-[#1b1c19] leading-relaxed max-w-[400px]" style={{ opacity: 0.65 }}>
              An early-warning public health system designed to protect elderly residents during extreme heat events.
            </p>
          </div>

          <div className="relative overflow-hidden" style={{ borderRadius: '1.25rem', height: '380px' }}>
            <Image
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800"
              alt="City skyline"
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center"
              style={{ background: 'rgba(0,0,0,0.52)' }}
            >
              <IconMap className="w-12 h-12 text-[#af101a]" />
              <h3 className="font-newsreader font-bold text-white text-2xl leading-tight">
                Interactive Thermal Map
              </h3>
              <p className="font-inter text-white/70 text-base px-8">
                Real-time heat vulnerability indices across Seville districts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#fbf9f4] pb-28 px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-7">
          <div className="bg-white rounded-2xl p-10 flex flex-col" style={{ boxShadow: '0 0 40px rgba(27,28,25,0.04)' }}>
            <IconArrowUp className="w-6 h-6 text-[#af101a] mb-auto" />
            <div className="mt-10">
              <p className="font-newsreader font-bold text-[3.5rem] text-[#1b1c19] leading-none mb-3">34%</p>
              <p className="font-inter text-base text-[#1b1c19]/60 leading-relaxed">
                Higher risk for elderly populations during peak heat hours.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 flex flex-col" style={{ boxShadow: '0 0 40px rgba(27,28,25,0.04)' }}>
            <IconThermometer className="w-6 h-6 text-[#af101a]" />
            <div className="mt-6">
              <p className="font-newsreader font-bold text-[3.5rem] text-[#1b1c19] leading-none mb-3">{currentTemp}°C</p>
              <p className="font-inter text-base text-[#1b1c19]/60 leading-relaxed">
                Critical baseline for activating health intervention protocols.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 flex flex-col" style={{ boxShadow: '0 0 40px rgba(27,28,25,0.04)' }}>
            <IconBell className="w-6 h-6 text-[#af101a] mb-auto" />
            <div className="mt-10">
              <p className="font-newsreader font-bold text-[3.5rem] text-[#1b1c19] leading-none mb-3">1,204</p>
              <p className="font-inter text-base text-[#1b1c19]/60 leading-relaxed">
                Active alerts processed across Seville&apos;s elderly networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scroll Timeline ─────────────────────────────────────────────────── */}
      {/*
        The line is absolutely positioned inside the section.
        Its top = top of the "Register someone at risk" heading.
        Its bottom = 20px below the midpoint of the "I plan cities" paragraph.
        Dot 1 = just below the heading.
        Dot 2 = at the paragraph midpoint.
        All positions are measured from real DOM rects after layout.
      */}
      <section ref={sectionRef} className="relative bg-[#fbf9f4] px-10">

        {/* The 2px vertical line — precisely sized by measured geometry */}
        {lineHeight > 0 && (
          <div
            ref={lineRef}
            className="absolute pointer-events-none"
            style={{
              left: 'calc(50% - 1px)',
              width: '2px',
              top: lineTop,
              height: lineHeight,
            }}
          >
            {/* Grey base */}
            <div className="absolute inset-0 bg-[#e8e3d9]" />

            {/* Red fill */}
            <div
              className="absolute top-0 left-0 right-0 bg-[#af101a]"
              style={{ height: fillPx, transition: 'height 40ms linear' }}
            />

            {/* Dot 1 */}
            <div
              className="absolute rounded-full z-10"
              style={{
                width: 12,
                height: 12,
                top: dot1Y - 6,
                left: '50%',
                transform: 'translateX(-50%)',
                background: dot1Active ? '#af101a' : '#d4cfc6',
                transition: 'background-color 250ms ease, box-shadow 250ms ease',
                boxShadow: dot1Active ? '0 0 0 3px rgba(175,16,26,0.15)' : 'none',
              }}
            />

            {/* Dot 2 */}
            <div
              className="absolute rounded-full z-10"
              style={{
                width: 12,
                height: 12,
                top: dot2Y - 6,
                left: '50%',
                transform: 'translateX(-50%)',
                background: dot2Active ? '#af101a' : '#d4cfc6',
                transition: 'background-color 250ms ease, box-shadow 250ms ease',
                boxShadow: dot2Active ? '0 0 0 3px rgba(175,16,26,0.15)' : 'none',
              }}
            />
          </div>
        )}

        <div className="max-w-7xl mx-auto">

          {/* Subsection 1 — Register someone at risk */}
          <div className="grid grid-cols-2 gap-20 items-center py-24">
            <div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-8"
                style={{ background: 'rgba(175,16,26,0.10)' }}
              >
                <IconHeart className="w-6 h-6 text-[#af101a]" />
              </div>

              {/* ← measured: line starts at the top of this heading */}
              <h2
                ref={heading1Ref}
                className="font-newsreader font-bold text-[2.75rem] text-[#1b1c19] leading-tight mb-6"
              >
                Register someone at risk
              </h2>

              <p className="font-inter text-lg text-[#1b1c19]/70 leading-relaxed mb-9 max-w-[440px]">
                Help us protect your loved ones. By registering an elderly resident, you ensure they receive timely alerts, wellness checks, and priority assistance during heat waves.
              </p>
              <Link
                href="/onboarding"
                className="font-inter font-semibold text-base text-white inline-flex items-center px-7 py-3.5 rounded-[12px]"
                style={{ background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)' }}
              >
                Start registration
              </Link>
            </div>

            <div className="relative overflow-hidden" style={{ borderRadius: '1.25rem', height: '340px' }}>
              <Image
                src="https://images.unsplash.com/photo-1516307365426-bea591f05011?w=600"
                alt="Elderly hands"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Subsection 2 — I plan cities */}
          <div className="grid grid-cols-2 gap-20 items-center py-24">
            <div className="relative overflow-hidden" style={{ borderRadius: '1.25rem', height: '340px' }}>
              <Image
                src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600"
                alt="City skyline"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-8"
                style={{ background: 'rgba(27,28,25,0.06)' }}
              >
                <IconBuilding className="w-6 h-6" style={{ color: 'rgba(27,28,25,0.55)' }} />
              </div>
              <h2 className="font-newsreader font-bold text-[2.75rem] text-[#1b1c19] leading-tight mb-6">
                I plan cities
              </h2>

              {/* ← measured: dot 2 sits at the vertical midpoint of this paragraph */}
              <p
                ref={para2Ref}
                className="font-inter text-lg text-[#1b1c19]/70 leading-relaxed mb-9 max-w-[440px]"
              >
                Access real-time thermal mapping and health impact data to design more resilient urban environments. Monitor vulnerability clusters and optimize emergency response resources.
              </p>

              <Link
                href="/city"
                className="font-inter font-semibold text-base text-white inline-flex items-center px-7 py-3.5 rounded-[12px]"
                style={{ background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)' }}
              >
                View dashboard
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#fbf9f4] px-10 pt-28 pb-14">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <p className="font-newsreader font-bold text-[#af101a] text-xl mb-2">HeatSafe</p>
            <p className="font-inter text-sm text-[#1b1c19]/40">
              © 2024 HeatSafe Public Health. The Editorial Guardian.
            </p>
          </div>
          <div className="flex items-center gap-8">
            {['Privacy Policy', 'Terms of Service', 'Accessibility', 'Contact Support'].map((label) => (
              <Link key={label} href="#" className="font-inter text-sm text-[#1b1c19]/40 hover:text-[#1b1c19]/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Sticky Dashboard Button (logged-in only) ─────────────────────── */}
      {isLoggedIn && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-5 py-3 rounded-full"
            style={{
              background: 'rgba(251,249,244,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 32px rgba(27,28,25,0.10)',
            }}
          >
            <IconGrid className="w-4 h-4 text-[#1b1c19]/40" />
            <span className="font-inter text-sm text-[#1b1c19]/50">Welcome back</span>
            <span
              className="font-inter font-medium text-sm text-white px-4 py-1.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)' }}
            >
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
