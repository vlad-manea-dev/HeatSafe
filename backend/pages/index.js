import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'

const MapShowcase = dynamic(
  () => import('../components/MapShowcase'),
  { ssr: false }
)
import ShutterSection from '../components/ShutterSection'

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconThermometer({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
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

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    const supabase = createClient(url, key)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  return (
    <>
      <Head>
        <title>HeatSafe — Heat kills. HeatSafe protects.</title>
        <meta name="description" content="An early-warning public health system designed to protect elderly residents during extreme heat events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Navbar ───────────────────────────────────────────────────────── */}
        <nav
          style={{
            position:             'fixed',
            top:                  '1.25rem',
            left:                 '50%',
            transform:            'translateX(-50%)',
            zIndex:               50,
            display:              'flex',
            alignItems:           'center',
            gap:                  '0.25rem',
            background:           'rgba(251,249,244,0.92)',
            backdropFilter:       'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius:         '9999px',
            border:               '1px solid rgba(255,255,255,0.55)',
            boxShadow:            '0 4px 28px rgba(0,0,0,0.12)',
            padding:              '0.4rem 0.4rem 0.4rem 1.4rem',
            whiteSpace:           'nowrap',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none', marginRight: '1.5rem' }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#af101a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconThermometer className="w-4 h-4 text-white" />
            </span>
            <span className="font-newsreader font-bold text-[1.1rem] text-[#1b1c19] tracking-tight">
              HeatSafe
            </span>
          </Link>

          <Link href="#" className="font-inter text-sm text-[#1b1c19]/65 hover:text-[#1b1c19] transition-colors px-3 py-1.5">About</Link>
          <Link href="#" className="font-inter text-sm text-[#1b1c19]/65 hover:text-[#1b1c19] transition-colors px-3 py-1.5">Contact</Link>

          <Link
            href="/dashboard"
            className="font-inter font-semibold text-sm text-white"
            style={{ background: '#af101a', padding: '0.55rem 1.25rem', borderRadius: '9999px', marginLeft: '0.5rem', textDecoration: 'none' }}
          >
            Get started
          </Link>
        </nav>

        {/* ── Hero (100vh, cream) ───────────────────────────────────────────
            Clean centered layout. No phone — the MapShowcase section below
            owns that story.
        ──────────────────────────────────────────────────────────────────── */}
        <section
          style={{
            height:         '100vh',
            background:     '#fbf9f4',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            textAlign:      'center',
            padding:        '5rem 2rem 4rem',
            position:       'relative',
          }}
        >
          {/* Live temp badge */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <Pulse />
            <span className="font-inter text-xs tracking-[0.18em] uppercase" style={{ color: 'rgba(27,28,25,0.48)' }}>
              Live Seville Temp: {currentTemp}°C
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ margin: '0 0 1.5rem', lineHeight: 1.0 }}>
            <span
              className="font-newsreader font-bold"
              style={{ display: 'block', color: '#1b1c19', fontSize: 'clamp(4rem, 8vw, 8.5rem)', letterSpacing: '-0.01em' }}
            >
              Heat kills.
            </span>
            <span
              className="font-newsreader"
              style={{ display: 'block', color: '#af101a', fontSize: 'clamp(3.4rem, 6.8vw, 7.2rem)', fontStyle: 'italic', fontWeight: 400 }}
            >
              HeatSafe protects.
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="font-inter"
            style={{ color: 'rgba(27,28,25,0.55)', fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '520px', margin: '0 0 2.5rem' }}
          >
            An early-warning public health system designed to protect elderly
            residents during extreme heat events.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="font-inter font-semibold text-sm"
              style={{ background: '#af101a', color: '#fff', padding: '0.9rem 2.2rem', borderRadius: '9999px', textDecoration: 'none', boxShadow: '0 2px 18px rgba(175,16,26,0.30)' }}
            >
              Register someone at risk
            </Link>
            <Link
              href="/city"
              className="font-inter font-medium text-sm"
              style={{ background: 'transparent', color: 'rgba(27,28,25,0.65)', padding: '0.9rem 2.2rem', borderRadius: '9999px', textDecoration: 'none', border: '1px solid rgba(27,28,25,0.16)' }}
            >
              City dashboard
            </Link>
          </div>

          {/* Scroll nudge */}
          <div
            style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: 0.35 }}
          >
            <span className="font-inter text-[10px] tracking-[0.22em] uppercase" style={{ color: '#1b1c19' }}>scroll</span>
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="animate-bounce">
              <path d="M8 1v14M2 9l6 6 6-6" stroke="#1b1c19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        {/* ── MapShowcase (350vh) ───────────────────────────────────────────
            Phone visible → scroll → map bursts out of phone → heats up red
        ──────────────────────────────────────────────────────────────────── */}
        <MapShowcase />

        {/* ── SMS Preview ──────────────────────────────────────────────────── */}
        <section style={{ background: '#fbf9f4', padding: '6rem 5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="font-inter text-xs tracking-[0.2em] uppercase text-[#1b1c19]/50 mb-5">
            Sample alert — sent 7:00am
          </p>
          <div style={{ maxWidth: 480, background: '#e9e9eb', borderRadius: '18px 18px 18px 4px', padding: '1rem 1.25rem' }}>
            <p className="font-inter text-sm" style={{ color: '#1b1c19', lineHeight: 1.55, margin: 0 }}>
              ⚠️ Good morning Mary. Today&apos;s peak in Dublin is 34°C.
              Your furosemide increases dehydration risk — drink water every
              30 min and stay indoors 12–4pm. — HeatSafe
            </p>
          </div>
          <p className="font-inter text-xs text-[#1b1c19]/40 mt-2">Today 7:00 AM</p>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '5rem' }}>
          <h2
            className="font-newsreader"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1b1c19', fontWeight: 700, textAlign: 'center', margin: '0 0 3.5rem' }}
          >
            How it works.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
            {[
              {
                num: '01',
                label: 'Neighbourhood heat intelligence',
                body: 'Hyperlocal heat exposure, not city averages',
                border: '#1b1c19',
              },
              {
                num: '02',
                label: 'Personalised risk scoring',
                body: 'Age, meds, housing, isolation, timing',
                border: '#af101a',
              },
              {
                num: '03',
                label: 'AI-generated action cards',
                body: 'SMS for the user, escalation for the carer',
                border: '#1b1c19',
              },
            ].map(({ num, label, body, border }) => (
              <div
                key={num}
                style={{
                  border: `2px solid ${border}`,
                  borderRadius: 2,
                  padding: '1.75rem 1.75rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <span
                  className="font-newsreader font-bold"
                  style={{ fontSize: '2rem', color: '#af101a', lineHeight: 1, letterSpacing: '-0.01em' }}
                >
                  {num}
                </span>
                <p
                  className="font-inter font-bold"
                  style={{ fontSize: '0.8rem', color: '#1b1c19', margin: 0, lineHeight: 1.3 }}
                >
                  {label}
                </p>
                <p
                  className="font-newsreader"
                  style={{ fontSize: 'clamp(1.6rem, 2.4vw, 2.1rem)', color: '#1b1c19', margin: '0.25rem 0 0', lineHeight: 1.2, fontWeight: 400 }}
                >
                  {body}
                </p>
              </div>
            ))}
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
