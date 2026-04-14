import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

const PRIMARY = '#e23235'
const PRIMARY_LIGHT = 'rgba(226,50,53,0.08)'
const GRAY = '#2C2A29'
const MUTED = '#8A8683'
const BORDER = '#EAE6E1'
const BG = '#FDFBF7'
const TOTAL_STEPS = 6

const MED_OPTIONS = [
  { value: 'diuretics', label: 'Diuretics (water tablets)', multiplier: 1.3 },
  { value: 'beta_blockers', label: 'Beta blockers', multiplier: 1.2 },
  { value: 'ace_inhibitors', label: 'ACE inhibitors', multiplier: 1.15 },
  { value: 'antipsychotics', label: 'Antipsychotics', multiplier: 1.25 },
  { value: 'anticholinergics', label: 'Anticholinergics', multiplier: 1.2 },
]

const CONDITION_OPTIONS = [
  { value: 'heart_condition', label: 'Heart condition' },
  { value: 'respiratory', label: 'Respiratory condition' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'kidney_disease', label: 'Kidney disease' },
  { value: 'mobility', label: 'Mobility issues' },
  { value: 'none', label: 'None of the above' },
]

const RELATIONSHIPS = ['Son', 'Daughter', 'Partner', 'Friend', 'GP Surgery', 'Other']

function computeScore(personal, conditions, medications) {
  let base = 0
  const breakdown = []
  const conds = conditions.filter((c) => c !== 'none')

  if (personal.dob) {
    const age = new Date().getFullYear() - new Date(personal.dob).getFullYear()
    if (age > 70) { base += 30; breakdown.push({ label: 'Age over 70', value: '+30pts' }) }
    else if (age >= 60) { base += 15; breakdown.push({ label: 'Age 60–70', value: '+15pts' }) }
  }

  const floor = parseInt(personal.floor) || 0
  if (floor >= 3) { base += 20; breakdown.push({ label: 'Top floor flat', value: '+20pts' }) }
  else if (floor >= 1) { base += 10; breakdown.push({ label: 'Upper floor (1–2)', value: '+10pts' }) }

  if (conds.includes('heart_condition') || conds.includes('respiratory')) {
    base += 25; breakdown.push({ label: 'Heart/respiratory condition', value: '+25pts' })
  }
  if (conds.includes('diabetes')) { base += 10; breakdown.push({ label: 'Diabetes', value: '+10pts' }) }
  if (conds.includes('kidney_disease')) { base += 10; breakdown.push({ label: 'Kidney disease', value: '+10pts' }) }
  if (conds.includes('mobility')) { base += 5; breakdown.push({ label: 'Mobility issues', value: '+5pts' }) }
  if (personal.lives_alone) { base += 10; breakdown.push({ label: 'Lives alone', value: '+10pts' }) }
  if (personal.south_facing) { base += 5; breakdown.push({ label: 'South-facing home', value: '+5pts' }) }

  let topMultiplier = 1.0
  let topMedLabel = ''
  medications.forEach((m) => {
    if (m.multiplier > topMultiplier) { topMultiplier = m.multiplier; topMedLabel = m.label }
  })
  if (topMultiplier > 1.0) {
    breakdown.push({ label: topMedLabel, value: `${topMultiplier}× multiplier` })
  }

  return { score: Math.min(Math.round(base * topMultiplier), 100), breakdown }
}

function getScoreColor(s) {
  if (s >= 81) return PRIMARY
  if (s >= 61) return '#E76F51'
  if (s >= 31) return '#F4A261'
  return '#4A7C59'
}
function getScoreLabel(s) {
  if (s >= 81) return 'High Risk'
  if (s >= 61) return 'Elevated Risk'
  if (s >= 31) return 'Moderate Risk'
  return 'Low Risk'
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Input({ label, hint, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
      {hint && <p style={{ fontSize: '15px', color: MUTED, margin: '-6px 0 0' }}>{hint}</p>}
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '18px 22px',
          border: `1.5px solid ${focused ? PRIMARY : BORDER}`,
          borderRadius: '12px', fontSize: '18px',
          fontFamily: 'Outfit, sans-serif', outline: 'none',
          backgroundColor: '#fff', color: GRAY, boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        {...props}
      />
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0' }}>
      <span style={{ fontSize: '18px', color: GRAY }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: '50px', height: '28px', borderRadius: '9999px', flexShrink: 0,
          backgroundColor: checked ? PRIMARY : '#D1D5DB',
          border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '4px',
          left: checked ? '26px' : '4px',
          width: '20px', height: '20px', borderRadius: '50%',
          backgroundColor: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

// Custom dropdown — replaces native <select>
function Dropdown({ label, placeholder, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} ref={ref}>
      {label && <label style={{ fontSize: '13px', fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: '100%', padding: '18px 22px',
            border: `1.5px solid ${open ? PRIMARY : BORDER}`,
            borderRadius: '12px', fontSize: '18px',
            fontFamily: 'Outfit, sans-serif',
            backgroundColor: '#fff', color: selected ? GRAY : MUTED,
            cursor: 'pointer', outline: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxSizing: 'border-box', transition: 'border-color 0.15s',
            textAlign: 'left',
          }}
        >
          <span>{selected ? selected.label : placeholder}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="M4 6l4 4 4-4" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            backgroundColor: '#fff', border: `1.5px solid ${BORDER}`,
            borderRadius: '10px', boxShadow: '0 8px 30px rgba(44,42,41,0.10)',
            zIndex: 50, overflow: 'hidden',
          }}>
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  style={{
                    width: '100%', padding: '15px 22px',
                    backgroundColor: isSelected ? PRIMARY_LIGHT : 'transparent',
                    color: isSelected ? PRIMARY : GRAY,
                    fontWeight: isSelected ? '600' : '400',
                    fontSize: '17px', fontFamily: 'Outfit, sans-serif',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'background 0.1s',
                  }}
                  onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = BG }}
                  onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {opt.label}
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 5" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '52px' }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
              backgroundColor: done || active ? PRIMARY : '#E5E7EB',
              color: done || active ? '#fff' : MUTED,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', transition: 'all 0.25s',
              boxShadow: active ? `0 0 0 4px ${PRIMARY_LIGHT}` : 'none',
            }}>
              {done ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : n}
            </div>
            {i < TOTAL_STEPS - 1 && (
              <div style={{ width: '44px', height: '2px', backgroundColor: done ? PRIMARY : '#E5E7EB', transition: 'background 0.3s' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue', nextDisabled = false, extra = null }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '52px' }}>
      {onBack ? (
        <button onClick={onBack} style={{ padding: '17px 36px', background: 'transparent', color: MUTED, border: `1.5px solid ${BORDER}`, borderRadius: '9999px', fontSize: '17px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
          ← Back
        </button>
      ) : <div />}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {extra}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          style={{
            padding: '17px 48px',
            backgroundColor: nextDisabled ? '#D1D5DB' : PRIMARY,
            color: '#fff', border: 'none', borderRadius: '9999px',
            fontSize: '17px', fontWeight: '600',
            cursor: nextDisabled ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s',
          }}
        >
          {nextLabel} →
        </button>
      </div>
    </div>
  )
}

function Heading({ title, sub }) {
  return (
    <div style={{ marginBottom: '44px' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '52px', fontWeight: '600', lineHeight: '1.1', color: GRAY, margin: '0 0 14px' }}>{title}</h1>
      {sub && <p style={{ color: MUTED, fontSize: '18px', margin: 0, lineHeight: '1.6' }}>{sub}</p>}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('carer')
  const [caredForName, setCaredForName] = useState('')
  const [account, setAccount] = useState({ name: '', email: '', phone: '', password: '' })
  const [personal, setPersonal] = useState({ name: '', dob: '', address: '', floor: '', south_facing: false, lives_alone: false })
  const [conditions, setConditions] = useState([])
  const [medications, setMedications] = useState([])
  const [selectedMed, setSelectedMed] = useState('')
  const [emergency, setEmergency] = useState({ enabled: false, name: '', phone: '', relationship: '' })
  const [phase, setPhase] = useState('steps')
  const [result, setResult] = useState(null)
  const [displayScore, setDisplayScore] = useState(0)
  const animRef = useRef(null)

  useEffect(() => {
    if (step === 3 && role === 'self' && account.name && !personal.name) {
      setPersonal((p) => ({ ...p, name: account.name }))
    }
  }, [step])

  useEffect(() => {
    if (phase !== 'reveal' || !result) return
    let cancelled = false
    const target = result.score
    const start = Date.now()
    function tick() {
      if (cancelled) return
      const progress = Math.min((Date.now() - start) / 1000, 1)
      setDisplayScore(Math.round((1 - Math.pow(1 - progress, 3)) * target))
      if (progress < 1) animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { cancelled = true; cancelAnimationFrame(animRef.current) }
  }, [phase, result])

  function goNext() { setStep((s) => s + 1) }
  function goBack() { setStep((s) => s - 1) }

  function toggleCondition(val) {
    if (val === 'none') { setConditions(['none']); return }
    setConditions((prev) => {
      const filtered = prev.filter((c) => c !== 'none')
      return filtered.includes(val) ? filtered.filter((c) => c !== val) : [...filtered, val]
    })
  }

  function addMedication() {
    const opt = MED_OPTIONS.find((m) => m.value === selectedMed)
    if (!opt || medications.find((m) => m.drug_class === opt.value)) return
    setMedications((prev) => [...prev, { drug_class: opt.value, label: opt.label, multiplier: opt.multiplier }])
    setSelectedMed('')
  }

  async function handleSubmit() {
    setPhase('loading')
    const personName = role === 'carer' ? caredForName : account.name
    const conditionsToSave = conditions.filter((c) => c !== 'none')
    const { score, breakdown } = computeScore(personal, conditions, medications)
    const meds = medications.map((m) => ({ drug_class: m.drug_class, multiplier: m.multiplier }))

    let personId = null
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, account, personal: { ...personal, conditions: conditionsToSave }, medications: meds, emergency: emergency.enabled ? emergency : null, score, breakdown }),
      })
      const data = await res.json()
      personId = data.personId || null
      if (personId) {
        if (role === 'self') {
          localStorage.setItem('heatsafe_my_id', personId)
          localStorage.setItem('heatsafe_my_name', personName)
        } else {
          const existing = JSON.parse(localStorage.getItem('heatsafe_cared_for') || '[]')
          if (!existing.find((p) => p.id === personId)) {
            existing.push({ id: personId, name: personName })
            localStorage.setItem('heatsafe_cared_for', JSON.stringify(existing))
          }
        }
      }
    } catch (err) { console.error('Submit error:', err) }

    setTimeout(() => {
      const { score: s, breakdown: b } = computeScore(personal, conditions, medications)
      setResult({ score: s, breakdown: b, personName, personId })
      setPhase('reveal')
    }, 1500)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <>
        <PageHead title="HeatSafe — Setting up your profile" />
        <div style={{ minHeight: '100vh', backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: `4px solid ${BORDER}`, borderTopColor: PRIMARY, margin: '0 auto 28px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontSize: '22px', fontWeight: '600', color: GRAY }}>
              Calculating {role === 'carer' ? `${caredForName}'s` : 'your'} risk score…
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        </div>
      </>
    )
  }

  // ── Reveal ────────────────────────────────────────────────────────────────
  if (phase === 'reveal' && result) {
    const color = getScoreColor(result.score)
    const label = getScoreLabel(result.score)
    const dashHref = role === 'self' && result.personId
      ? `/dashboard/${result.personId}`
      : '/dashboard'
    return (
      <>
        <PageHead title="HeatSafe — Risk Score" />
        <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <a href="/" style={{ marginBottom: '36px' }}>
            <img src="/assets/logo.png" alt="HeatSafe" style={{ height: '34px', mixBlendMode: 'multiply' }} />
          </a>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '48px', maxWidth: '540px', width: '100%', boxShadow: '0 8px 48px rgba(44,42,41,0.09)' }}>
            <p style={{ textAlign: 'center', color: MUTED, fontSize: '15px', marginBottom: '4px' }}>
              {result.personName ? `${result.personName}'s` : 'Your'} initial risk score
            </p>
            <div style={{ textAlign: 'center', margin: '28px 0 24px' }}>
              <div style={{ width: '148px', height: '148px', borderRadius: '50%', backgroundColor: `${color}15`, border: `4px solid ${color}`, display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '56px', fontWeight: '800', color, lineHeight: 1 }}>{displayScore}</span>
                <span style={{ fontSize: '14px', color, fontWeight: '600', opacity: 0.8 }}>/100</span>
              </div>
              <p style={{ marginTop: '16px', fontSize: '20px', fontWeight: '700', color }}>{label}</p>
            </div>
            {result.breakdown.length > 0 && (
              <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Risk factors</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.breakdown.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', backgroundColor: BG, borderRadius: '9px' }}>
                      <span style={{ fontSize: '15px', color: GRAY }}>{item.label}</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <a href={dashHref} style={{ display: 'block', marginTop: '32px', padding: '16px', backgroundColor: PRIMARY, color: '#fff', borderRadius: '9999px', textAlign: 'center', textDecoration: 'none', fontSize: '16px', fontWeight: '600' }}>
              Go to dashboard
            </a>
          </div>
        </div>
      </>
    )
  }

  // ── Steps ─────────────────────────────────────────────────────────────────
  return (
    <>
      <PageHead title="HeatSafe — Get started" />
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: 'Outfit, sans-serif', color: GRAY }}>
        <header style={{ borderBottom: `1px solid ${BORDER}`, padding: '16px 32px', backgroundColor: '#fff' }}>
          <a href="/">
            <img src="/assets/logo.png" alt="HeatSafe" style={{ height: '32px', mixBlendMode: 'multiply' }} />
          </a>
        </header>

        <main style={{ maxWidth: '860px', margin: '0 auto', padding: '64px 48px 120px' }}>
          <StepIndicator current={step} />

          {/* ── Step 1: Role ── */}
          {step === 1 && (
            <div>
              <Heading title="Who are you protecting?" sub="We'll personalise everything to the right person." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '36px' }}>
                {[
                  { value: 'self', icon: 'person', title: 'Myself', sub: 'Set up your own personal heat risk profile' },
                  { value: 'carer', icon: 'favorite', title: 'Someone I care for', sub: 'Set up a profile for a family member or someone vulnerable' },
                ].map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setRole(opt.value)} style={{
                    padding: '36px 30px', borderRadius: '20px', textAlign: 'left', cursor: 'pointer',
                    border: `2px solid ${role === opt.value ? PRIMARY : BORDER}`,
                    backgroundColor: role === opt.value ? PRIMARY_LIGHT : '#fff',
                    outline: 'none', transition: 'all 0.15s',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '44px', color: role === opt.value ? PRIMARY : MUTED, display: 'block', marginBottom: '20px', fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                    <p style={{ fontWeight: '700', fontSize: '20px', color: GRAY, margin: '0 0 8px' }}>{opt.title}</p>
                    <p style={{ fontSize: '16px', color: MUTED, lineHeight: '1.5', margin: 0 }}>{opt.sub}</p>
                  </button>
                ))}
              </div>
              {role === 'carer' && (
                <div style={{ marginBottom: '28px' }}>
                  <Input label="What is their first name?" placeholder="e.g. Mary" value={caredForName} onChange={(e) => setCaredForName(e.target.value)} />
                </div>
              )}
              <NavButtons onNext={() => { if (role && (role === 'self' || caredForName.trim())) goNext() }} nextDisabled={!role || (role === 'carer' && !caredForName.trim())} />
            </div>
          )}

          {/* ── Step 2: Account ── */}
          {step === 2 && (
            <div>
              <Heading
                title="Create your account"
                sub={role === 'carer' ? `First, let's set up your account. Then we'll build ${caredForName}'s profile.` : 'Your details — used to send you alerts when it matters.'}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '8px' }}>
                <Input label="Your full name" placeholder="e.g. John Sullivan" value={account.name} onChange={(e) => setAccount((a) => ({ ...a, name: e.target.value }))} />
                <Input label="Email address" type="email" placeholder="you@example.com" value={account.email} onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))} />
                <Input label="Phone number" hint="We'll send alerts to this number" type="tel" placeholder="+34 600 000 000" value={account.phone} onChange={(e) => setAccount((a) => ({ ...a, phone: e.target.value }))} />
                <Input label="Password" type="password" placeholder="Create a password" value={account.password} onChange={(e) => setAccount((a) => ({ ...a, password: e.target.value }))} />
              </div>
              <NavButtons onBack={goBack} onNext={goNext} nextDisabled={!account.name || !account.phone} />
            </div>
          )}

          {/* ── Step 3: Personal info ── */}
          {step === 3 && (
            <div>
              <Heading
                title={role === 'self' ? 'Tell us about you' : `Tell us about ${caredForName}`}
                sub="This shapes the risk score — be as accurate as you can."
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '8px' }}>
                <Input label={role === 'self' ? 'Your full name' : `${caredForName}'s full name`} placeholder="Full name" value={personal.name} onChange={(e) => setPersonal((p) => ({ ...p, name: e.target.value }))} />
                <Input label="Date of birth" type="date" value={personal.dob} onChange={(e) => setPersonal((p) => ({ ...p, dob: e.target.value }))} />
                <Input label="Home address" hint="We use this to check local heat levels" placeholder="e.g. Calle Betis 12, Triana, Sevilla" value={personal.address} onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))} />
                <Input label="Floor level" hint="0 = ground floor" type="number" min="0" placeholder="0" value={personal.floor} onChange={(e) => setPersonal((p) => ({ ...p, floor: e.target.value }))} />
                <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '4px 22px', border: `1.5px solid ${BORDER}` }}>
                  <Toggle label="South-facing home?" checked={personal.south_facing} onChange={(v) => setPersonal((p) => ({ ...p, south_facing: v }))} />
                  <div style={{ height: '1px', backgroundColor: BORDER }} />
                  <Toggle label="Lives alone?" checked={personal.lives_alone} onChange={(v) => setPersonal((p) => ({ ...p, lives_alone: v }))} />
                </div>
              </div>
              <NavButtons onBack={goBack} onNext={goNext} nextDisabled={!personal.name || !personal.dob} />
            </div>
          )}

          {/* ── Step 4: Conditions ── */}
          {step === 4 && (
            <div>
              <Heading
                title={role === 'self' ? 'Your health conditions' : `${caredForName}'s health conditions`}
                sub="This helps us personalise the risk score. Select all that apply."
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '8px' }}>
                {CONDITION_OPTIONS.map((cond) => {
                  const selected = conditions.includes(cond.value)
                  return (
                    <button key={cond.value} type="button" onClick={() => toggleCondition(cond.value)} style={{
                      padding: '16px 28px', borderRadius: '9999px', fontSize: '17px',
                      border: `2px solid ${selected ? PRIMARY : BORDER}`,
                      backgroundColor: selected ? PRIMARY_LIGHT : '#fff',
                      color: selected ? PRIMARY : GRAY,
                      fontWeight: selected ? '600' : '400',
                      cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                    }}>
                      {cond.label}
                    </button>
                  )
                })}
              </div>
              <NavButtons onBack={goBack} onNext={goNext} nextDisabled={conditions.length === 0} />
            </div>
          )}

          {/* ── Step 5: Medications ── */}
          {step === 5 && (
            <div>
              <Heading
                title={role === 'self' ? 'Your medications' : `${caredForName}'s medications`}
                sub="Some medications increase heat sensitivity. Add any that apply."
              />
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Dropdown
                    placeholder="Select a medication..."
                    options={MED_OPTIONS}
                    value={selectedMed}
                    onChange={setSelectedMed}
                  />
                </div>
                <button
                  onClick={addMedication}
                  disabled={!selectedMed}
                  style={{ padding: '14px 24px', backgroundColor: selectedMed ? PRIMARY : '#D1D5DB', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: selectedMed ? 'pointer' : 'not-allowed', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}
                >
                  Add
                </button>
              </div>

              {medications.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                  {medications.map((m) => (
                    <div key={m.drug_class} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', backgroundColor: PRIMARY_LIGHT, border: `1.5px solid ${PRIMARY}`, borderRadius: '9999px' }}>
                      <span style={{ fontSize: '14px', color: PRIMARY, fontWeight: '500' }}>{m.label}</span>
                      <button onClick={() => setMedications((prev) => prev.filter((med) => med.drug_class !== m.drug_class))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: PRIMARY, display: 'flex', padding: 0, marginLeft: '2px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <NavButtons
                onBack={goBack}
                onNext={goNext}
                extra={<button onClick={goNext} style={{ fontSize: '14px', color: MUTED, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Skip this step</button>}
              />
            </div>
          )}

          {/* ── Step 6: Emergency contact ── */}
          {step === 6 && (
            <div>
              <Heading title="Who should we alert?" sub={`If ${role === 'carer' ? `${caredForName}'s` : 'your'} risk score becomes critical, we'll send them an SMS immediately.`} />
              <p style={{ color: MUTED, fontSize: '15px', fontStyle: 'italic', marginTop: '-20px', marginBottom: '28px' }}>Someone who loves them and can check in.</p>

              <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '4px 22px', border: `1.5px solid ${BORDER}`, marginBottom: '28px' }}>
                <Toggle label="Add an emergency contact" checked={emergency.enabled} onChange={(v) => setEmergency((e) => ({ ...e, enabled: v }))} />
              </div>

              {emergency.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '8px' }}>
                  <Input label="Contact name" placeholder="e.g. John Sullivan" value={emergency.name} onChange={(e) => setEmergency((em) => ({ ...em, name: e.target.value }))} />
                  <Input label="Contact phone number" type="tel" placeholder="+34 600 000 000" value={emergency.phone} onChange={(e) => setEmergency((em) => ({ ...em, phone: e.target.value }))} />
                  <Dropdown
                    label="Relationship"
                    placeholder="Select relationship..."
                    options={RELATIONSHIPS.map((r) => ({ value: r, label: r }))}
                    value={emergency.relationship}
                    onChange={(v) => setEmergency((em) => ({ ...em, relationship: v }))}
                  />
                </div>
              )}

              <NavButtons onBack={goBack} onNext={handleSubmit} nextLabel="Submit" />
            </div>
          )}
        </main>
      </div>
    </>
  )
}

function PageHead({ title }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </Head>
  )
}
