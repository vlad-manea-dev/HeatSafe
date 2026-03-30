import { useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function HeartSVG() {
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
    >
      {/* Outer heart — low opacity fill, soft stroke */}
      <path
        d="M80 58
           C80 58 52 28 32 40
           C12 52 12 80 32 98
           C48 112 80 132 80 132
           C80 132 112 112 128 98
           C148 80 148 52 128 40
           C108 28 80 58 80 58 Z"
        fill="rgba(196,82,82,0.06)"
        stroke="rgba(196,82,82,0.6)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Inner heart — slightly more opaque */}
      <path
        d="M80 70
           C80 70 61 52 48 60
           C34 68 34 86 48 96
           C58 104 80 116 80 116
           C80 116 102 104 112 96
           C126 86 126 68 112 60
           C99 52 80 70 80 70 Z"
        fill="rgba(196,82,82,0.04)"
        stroke="rgba(196,82,82,0.35)"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BuildingSVG() {
  // Three buildings of staggered heights; windows as a grid of small rects
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
    >
      {/* Ground line */}
      <line
        x1="12" y1="140" x2="148" y2="140"
        stroke="rgba(196,82,82,0.35)"
        strokeWidth="1.2"
      />

      {/* Left building */}
      <rect
        x="18" y="70" width="36" height="70"
        fill="rgba(196,82,82,0.04)"
        stroke="rgba(196,82,82,0.5)"
        strokeWidth="1.2"
      />
      {/* Left windows — 2 cols × 4 rows */}
      {[78, 94, 110, 126].map(y =>
        [24, 38].map(x => (
          <rect key={`lw-${x}-${y}`} x={x} y={y} width="8" height="9"
            fill="rgba(196,82,82,0.18)" />
        ))
      )}

      {/* Center building (tallest) */}
      <rect
        x="62" y="28" width="38" height="112"
        fill="rgba(196,82,82,0.05)"
        stroke="rgba(196,82,82,0.5)"
        strokeWidth="1.2"
      />
      {/* Center windows — 2 cols × 6 rows */}
      {[36, 52, 68, 84, 100, 116].map(y =>
        [68, 84].map(x => (
          <rect key={`cw-${x}-${y}`} x={x} y={y} width="9" height="10"
            fill="rgba(196,82,82,0.18)" />
        ))
      )}

      {/* Right building */}
      <rect
        x="106" y="52" width="36" height="88"
        fill="rgba(196,82,82,0.04)"
        stroke="rgba(196,82,82,0.5)"
        strokeWidth="1.2"
      />
      {/* Right windows — 2 cols × 4 rows */}
      {[60, 76, 92, 108].map(y =>
        [112, 126].map(x => (
          <rect key={`rw-${x}-${y}`} x={x} y={y} width="8" height="9"
            fill="rgba(196,82,82,0.18)" />
        ))
      )}
    </svg>
  )
}

// ─── ShutterSection ───────────────────────────────────────────────────────────

export default function ShutterSection() {
  const sectionRef  = useRef(null)
  const pulseRef    = useRef(null)
  const leftRef     = useRef(null)
  const rightRef    = useRef(null)
  const leftDimRef  = useRef(null)
  const rightDimRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    let ctx

    ;(async () => {
      const { gsap }          = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        // Shared ScrollTrigger config — both animations lock to the same scroll window
        const ST = {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1.2,
        }

        // ── Pulse dot: travels top-to-bottom of spine ──────────────────────
        gsap.fromTo(pulseRef.current,
          { top: '5%' },
          { top: '95%', ease: 'none', scrollTrigger: ST }
        )

        // ── Shutter timeline ───────────────────────────────────────────────
        // Set DOM state explicitly BEFORE creating the timeline.
        // Using fromTo() on the same element across two phases causes GSAP to
        // apply the later phase's "from" value on init, making the left panel
        // always start at 65%. gsap.set() + to() avoids this entirely.
        gsap.set([leftRef.current, rightRef.current], { flexBasis: '50%' })
        gsap.set([leftDimRef.current, rightDimRef.current], { opacity: 0 })

        const tl = gsap.timeline({ scrollTrigger: ST })

        // Phase 1 (0 → 0.5): left expands, right shrinks + dims
        tl.to(leftRef.current,     { flexBasis: '65%', ease: 'power2.inOut', duration: 0.5 }, 0)
        tl.to(rightRef.current,    { flexBasis: '35%', ease: 'power2.inOut', duration: 0.5 }, 0)
        tl.to(rightDimRef.current, { opacity: 0.5,     ease: 'power2.inOut', duration: 0.5 }, 0)

        // Phase 2 (0.5 → 1.0): right expands, left shrinks + dims
        tl.to(leftRef.current,     { flexBasis: '35%', ease: 'power2.inOut', duration: 0.5 }, 0.5)
        tl.to(rightRef.current,    { flexBasis: '65%', ease: 'power2.inOut', duration: 0.5 }, 0.5)
        tl.to(leftDimRef.current,  { opacity: 0.5,     ease: 'power2.inOut', duration: 0.5 }, 0.5)
        tl.to(rightDimRef.current, { opacity: 0,       ease: 'power2.inOut', duration: 0.5 }, 0.5)
      }, sectionRef)
    })()

    return () => ctx?.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{
        display: 'flex',
        height: '85vh',
        minHeight: '520px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Left panel ───────────────────────────────────────────────────── */}
      <div
        ref={leftRef}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: '50%',
          position: 'relative',
          overflow: 'hidden',
          background: '#120606',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '3rem 4rem',
        }}
      >
        {/* Dim overlay — fades in during phase 2 */}
        <div
          ref={leftDimRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
        <HeartSVG />

        <div style={{ textAlign: 'center', maxWidth: '340px' }}>
          <h2
            className="font-newsreader"
            style={{
              color: '#f5ede8',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            Register someone<br />at risk
          </h2>

          <p
            className="font-inter"
            style={{
              color: 'rgba(245,237,232,0.52)',
              fontSize: '1rem',
              lineHeight: 1.65,
              marginBottom: '1.75rem',
            }}
          >
            Protect an elderly loved one with personalised
            heat alerts and daily medication-aware check-ins.
          </p>

          <Link
            href="/onboarding"
            className="font-inter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B0000 0%, #c0392b 100%)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            Get started
            <span style={{ fontSize: '1rem' }}>→</span>
          </Link>
        </div>
      </div>

      {/* ── Spine ────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '2px',
          flexShrink: 0,
          background: 'linear-gradient(to bottom, #f97316, #8B0000)',
          zIndex: 10,
          // overflow visible so the 14px dot isn't clipped by the 2px width
          overflow: 'visible',
        }}
      >
        {/* Pulse dot */}
        <div
          ref={pulseRef}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '5%',
            width: 14,
            height: 14,
          }}
        >
          {/* Ping ring */}
          <span
            className="animate-ping"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              background: 'rgba(139,0,0,0.45)',
              display: 'block',
            }}
          />
          {/* Solid core */}
          <span
            style={{
              position: 'absolute',
              inset: '2px',
              borderRadius: '9999px',
              background: '#8B0000',
              boxShadow: '0 0 6px rgba(139,0,0,0.8)',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────── */}
      <div
        ref={rightRef}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: '50%',
          position: 'relative',
          overflow: 'hidden',
          background: '#06060c',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '3rem 4rem',
        }}
      >
        {/* Dim overlay — fades in during phase 1 */}
        <div
          ref={rightDimRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
        <BuildingSVG />

        <div style={{ textAlign: 'center', maxWidth: '340px' }}>
          <h2
            className="font-newsreader"
            style={{
              color: '#e8edf5',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}
          >
            For Enterprise
          </h2>

          <p
            className="font-inter"
            style={{
              color: 'rgba(232,237,245,0.48)',
              fontSize: '1rem',
              lineHeight: 1.65,
              marginBottom: '1.75rem',
            }}
          >
            Access neighbourhood-level thermal maps and
            vulnerability clusters to design more resilient
            urban environments.
          </p>

          <Link
            href="/enterprise"
            className="font-inter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(139,0,0,0.55)',
              background: 'transparent',
              color: 'rgba(232,237,245,0.75)',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            View dashboard
            <span style={{ fontSize: '1rem' }}>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
