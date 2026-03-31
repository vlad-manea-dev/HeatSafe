import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { fetchPeople } from '../../lib/api'
import { getRiskColor } from '../../lib/riskHelpers'
import NavBar from '../../components/NavBar'

function getRiskMessage(person) {
  if (person.score >= 70) {
    const meds = person.breakdown?.medications || []
    if (meds.length > 0) return `Medication alert: ${meds.map((m) => m.drug_class).join(', ')} increase heat risk.`
    return 'High risk alert active. Check in regularly.'
  }
  if (person.score >= 40) {
    if (person.breakdown?.top_floor) return 'Top floor apartment. Ensure fans are running this afternoon.'
    return 'Moderate risk. Stay hydrated and avoid peak heat.'
  }
  return 'Current conditions are safe. No action needed.'
}

export default function DashboardList() {
  const [people, setPeople] = useState([])
  const [currentTemp, setCurrentTemp] = useState('--')
  const [sortOrder, setSortOrder] = useState('Risk Level')
  const [error, setError] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchPeople()
      .then((data) => {
        setCurrentTemp(Math.round(data.currentTemp))
        const sorted = [...data.people]
        if (sortOrder === 'Name') sorted.sort((a, b) => a.name.localeCompare(b.name))
        setPeople(sorted)
      })
      .catch(() => setError(true))
  }, [sortOrder])

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Remove this person from monitoring?')) return
    setDeleting(id)
    try {
      await fetch(`/api/people/${id}`, { method: 'DELETE' })
      setPeople((prev) => prev.filter((p) => p.id !== id))
    } catch (_) {}
    setDeleting(null)
  }

  return (
    <>
      <Head>
        <title>Caregiver Dashboard - HeatSafe</title>
      </Head>
      <div className="min-h-screen bg-[#FDFBF7] text-text flex flex-col font-body">
        {/* Header */}
        <NavBar activePage="dashboard" mode="user" />

        <div className="relative flex h-auto w-full flex-col bg-white shadow-sm border-t border-border">
          <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
            <div className="flex flex-col w-full max-w-[1200px] flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-4 md:px-10 mt-6">
                <div className="flex min-w-72 flex-col gap-2">
                  <h1 className="text-text font-display text-4xl font-semibold leading-tight">
                    Monitoring {people.length} {people.length === 1 ? 'person' : 'people'}.
                  </h1>
                  <p className="text-muted text-lg font-normal leading-normal">
                    Current Dublin baseline: <span className="font-medium text-text">{currentTemp}°C</span>
                  </p>
                </div>
                <div className="flex">
                  <div className="flex h-12 flex-1 items-center justify-center rounded-lg bg-[#FDFBF7] border border-border p-1 shadow-inner">
                    {['Risk Level', 'Name'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSortOrder(opt)}
                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-4 text-base transition-all ${sortOrder === opt ? 'bg-white shadow-soft text-primary font-medium' : 'text-muted'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <main className="w-full max-w-[1200px] mx-auto px-4 md:px-10 lg:px-40 py-8 flex-grow">
          {error ? (
            <div className="col-span-full text-center py-12 text-primary">Failed to load data. Is the backend running?</div>
          ) : people.length === 0 ? (
            <div className="text-center py-12 text-muted">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {people.map((p) => {
                const c = getRiskColor(p.score)
                const msg = getRiskMessage(p)
                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/${p.id}`}
                    className={`group block bg-white rounded-lg p-6 shadow-soft border border-transparent ${c.border} hover:-translate-y-1 transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 ${c.ring} focus:ring-offset-2`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-2xl font-display text-text font-semibold mb-1">{p.name}</h3>
                        <p className="text-muted text-base flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          {p.address}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className={`flex flex-col items-center justify-center size-14 rounded-full ${c.bg} text-white shadow-md`}>
                          <span className="text-xl font-bold leading-none">{p.score}</span>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, p.id)}
                          disabled={deleting === p.id}
                          className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors px-2 py-1 rounded-md border border-red-200 hover:border-red-400"
                          title="Remove from monitoring"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          {deleting === p.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border">
                      <p className="text-sm text-text flex items-start gap-2">
                        <span
                          className={`material-symbols-outlined ${c.textColor} text-[20px] mt-0.5`}
                          style={c.iconFill ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          {c.icon}
                        </span>
                        <span className="flex-1">{msg}</span>
                      </p>
                    </div>
                    <div className={`absolute inset-x-0 bottom-0 h-1 ${c.bg}`}></div>
                  </Link>
                )
              })}

              {/* Register card */}
              <Link
                href="/onboarding"
                className="group flex flex-col items-center justify-center h-full min-h-[220px] bg-transparent rounded-lg p-6 border-2 border-dashed border-border hover:border-primary hover:bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <div className="size-12 rounded-full bg-[#FDFBF7] flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <span className="text-lg font-medium text-text group-hover:text-primary transition-colors">Register another person</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
