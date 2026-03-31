import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
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

function IconFlame({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,2C12,2 12,7 12,7C12,7 13.5,6 15,7C16.5,8 17,11 17,13C17,17 14,20 12,20C10,20 7,17 7,13C7,11 7.5,8 9,7C10.5,6 12,7 12,7C12,7 12,2 12,2Z" />
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


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter()
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
            top:                  '2.5rem',
            left:                 '50%',
            transform:            'translateX(-50%)',
            zIndex:               100,
            display:              'flex',
            alignItems:           'center',
            justifyContent:       'space-between',
            width:                'min(94vw, 1200px)',
            background:           'rgba(255,255,255,0.4)',
            backdropFilter:       'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius:         '100px',
            border:               '1px solid rgba(255,255,255,0.4)',
            boxShadow:            '0 4px 30px rgba(0,0,0,0.03)',
            padding:              '0.45rem 0.5rem 0.45rem 2rem',
            whiteSpace:           'nowrap',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <IconFlame className="w-6 h-6 text-[#af101a]" />
            <span className="font-fraunces font-semibold text-[1.25rem] text-[#1b1c19] tracking-tight">
              HeatSafe
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="font-outfit font-medium text-[1rem] text-[#1b1c19] hover:opacity-60 transition-opacity px-4 py-1">Dashboard</Link>
            <Link href="/city" className="font-outfit font-medium text-[1rem] text-[#1b1c19] hover:opacity-60 transition-opacity px-4 py-1">Heat Map</Link>
            <Link href="#how-it-works" className="font-outfit font-medium text-[1rem] text-[#1b1c19] hover:opacity-60 transition-opacity px-4 py-1">How It Works</Link>
          </div>

          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="font-outfit font-bold text-[1rem] text-white"
              style={{
                background: '#af101a',
                padding: '0.75rem 2rem',
                borderRadius: '100px',
                textDecoration: 'none',
              }}
            >
              Login
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
            padding:        '0 8vw',
            position:       'relative',
            overflow:       'hidden'
          }}
        >
          {/* Left Content */}
          <div style={{ flex: 1, zIndex: 10, maxWidth: '900px', textAlign: 'left' }}>
            {/* Headline */}
            <h1 className="reveal" style={{ margin: '0 0 1.25rem', lineHeight: 0.95 }}>
              <span
                className="font-fraunces"
                style={{ color: '#1b1c19', fontSize: 'clamp(4.5rem, 8.5vw, 8rem)', fontWeight: 400, letterSpacing: '-0.03em' }}
              >
                Heat kills.
              </span>
              <br />
              <span
                className="font-fraunces"
                style={{
                  color: '#8a1524',
                  fontSize: 'clamp(4.5rem, 8.5vw, 8rem)',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap'
                }}
              >
                HeatSafe protects.
              </span>
            </h1>

            {/* Tagline */}
            <p
              className="reveal font-inter"
              style={{ color: '#1b1c19', fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.5, maxWidth: '480px', margin: '0 0 3rem' }}
            >
              An early-warning public health system designed to protect elderly residents during extreme heat events.
            </p>

            {/* CTAs */}
            <div className="reveal flex items-center gap-4">
              <button
                onClick={() => router.push('/onboarding')}
                className="font-inter font-medium text-[0.9rem]"
                style={{ background: '#8a1524', color: '#fff', padding: '1rem 2.25rem', borderRadius: '100px', border: 'none', cursor: 'pointer' }}
              >
                Register someone at risk
              </button>
              <button
                onClick={() => router.push('/city')}
                className="font-inter font-medium text-[0.9rem]"
                style={{ background: 'transparent', color: '#1b1c19', padding: '1rem 2.25rem', borderRadius: '100px', border: '1px solid #1b1c19', cursor: 'pointer' }}
              >
                Explore city dashboard
              </button>
            </div>
          </div>

          {/* Right Content (Static Globe Image) */}
          <div style={{
            position: 'absolute',
            right: '-5vw',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '60vw',
            height: '110vh',
            pointerEvents: 'none',
            overflow: 'hidden',
            maskImage: 'radial-gradient(ellipse 85% 80% at 70% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 70% 50%, black 40%, transparent 100%)',
          }}>
            <img
              src="/heatsafe_landing_page_redesign.png"
              alt="Thermal globe showing global heat patterns"
              style={{
                position: 'absolute',
                right: 0,
                top: '55%',
                transform: 'translateY(-50%)',
                height: '115%',
                width: 'auto',
                maxWidth: 'none',
              }}
            />
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
            <span className="font-inter text-[10px] font-bold tracking-[0.3em] uppercase text-[#8a1524] mb-6">Patient Communication</span>
            <h2 className="font-newsreader text-[2.5rem] md:text-[3.5rem] leading-[1.1] text-[#1b1c19] mb-6">Personalised heat protocols.</h2>
            <p className="font-inter text-[#1b1c19]/60 text-lg">Delivering actionable advice to the right person at the right time.</p>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Phone Frame */}
            <div
              style={{
                width: 320,
                height: 650,
                background: '#fff',
                borderRadius: '40px',
                border: '12px solid #1b1c19',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Phone Notch/Island */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 25, background: '#1b1c19', borderBottomLeftRadius: 16, borderBottomRightRadius: 16, zIndex: 10 }} />
              
              {/* Phone screen background */}
              <div style={{ flex: 1, background: '#f8f6f0', position: 'relative', padding: '1rem', paddingTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 
                 {/* SMS Notification */}
                 <div 
                   style={{ 
                     background: 'rgba(255, 255, 255, 0.95)', 
                     backdropFilter: 'blur(20px)',
                     borderRadius: '24px', 
                     padding: '1.25rem',
                     boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08)',
                     border: '1px solid rgba(0,0,0,0.04)'
                   }}
                 >
                   <div className="flex items-center gap-3 mb-3">
                     <div className="w-8 h-8 rounded-full bg-[#8a1524] flex items-center justify-center">
                       <IconFlame className="w-4 h-4 text-white" />
                     </div>
                     <div>
                       <p className="font-inter font-bold text-[0.8rem] text-[#1b1c19]">HeatSafe Alert</p>
                       <p className="font-inter text-[0.7rem] text-[#1b1c19]/50">Today at 7:02 AM</p>
                     </div>
                   </div>
                   <p className="font-inter text-[0.9rem] text-[#1b1c19]/80" style={{ lineHeight: 1.5, margin: 0 }}>
                     ⚠️ Good morning Mary. Today&apos;s peak in Seville is 41°C.
                     Your furosemide increases dehydration risk — drink water every
                     30 min and stay indoors 12–4pm.
                   </p>
                 </div>
              </div>
            </div>
            
            {/* Decorative background glow behind phone */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120%', height: '80%', background: 'radial-gradient(circle, rgba(138,21,36,0.05) 0%, rgba(251,249,244,0) 70%)', zIndex: -1, pointerEvents: 'none' }} />
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────────────────────── */}
        <section id="how-it-works" style={{ background: '#fbf9f4', padding: '10rem 2rem' }}>
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
              <p className="font-inter text-sm text-[#1b1c19]/40">© 2026 HeatSafe Public Health.</p>
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

