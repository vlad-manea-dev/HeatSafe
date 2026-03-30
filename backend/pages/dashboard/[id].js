import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { fetchPerson } from '../../lib/api'

export default function PersonDetail() {
  const router = useRouter()
  const { id } = router.query

  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!router.isReady || !id) return
    fetchPerson(id)
      .then(setData)
      .catch(() => setError(true))
  }, [router.isReady, id])

  const riskBadge = () => {
    if (!data) return null
    if (data.riskLevel === 'high') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-primary font-semibold text-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          High Risk Alert Active
        </span>
      )
    }
    if (data.riskLevel === 'medium') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          Moderate Risk
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500"></span>
        Low Risk
      </span>
    )
  }

  const breakdownFactors = () => {
    if (!data?.breakdown) return []
    const bd = data.breakdown
    const factors = []
    if (bd.age)              factors.push({ label: 'Age (70+)',         value: bd.age,              color: 'bg-blue-300' })
    if (bd.top_floor)        factors.push({ label: 'Top floor',         value: bd.top_floor,        color: 'bg-orange-300' })
    if (bd.cardio_respiratory) factors.push({ label: 'Heart/respiratory', value: bd.cardio_respiratory, color: 'bg-red-300' })
    if (bd.extreme_temp)     factors.push({ label: 'Extreme temp',      value: bd.extreme_temp,     color: 'bg-yellow-400' })
    if (bd.low_green_cover)  factors.push({ label: 'Low green cover',   value: bd.low_green_cover,  color: 'bg-amber-300' })
    if (bd.lives_alone)      factors.push({ label: 'Lives alone',       value: bd.lives_alone,      color: 'bg-purple-300' })
    if (bd.south_facing)     factors.push({ label: 'South-facing',      value: bd.south_facing,     color: 'bg-pink-300' })
    return factors
  }

  return (
    <>
      <Head>
        <title>HeatSafe - Person Detail</title>
      </Head>
      <div className="bg-[#f8f6f6] font-body text-gray-900 antialiased min-h-screen">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <header className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" aria-label="Go back" className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-gray-600">arrow_back</span>
              </Link>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {error ? 'Error loading data' : data ? data.person.name : 'Loading...'}
                  </h1>
                  {data && (
                    <p className="text-gray-600 font-medium flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {data.person.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>{riskBadge()}</div>
          </header>

          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left column */}
              <div className="lg:col-span-7 space-y-8">
                {/* Metrics */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">analytics</span>
                    Current Risk Metrics
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Local Temp</p>
                        <span className="material-symbols-outlined text-gray-400">thermostat</span>
                      </div>
                      <p className="text-4xl font-bold text-gray-900">{Math.round(data.currentTemp)}°C</p>
                      <p className="text-sm text-gray-500 mt-2">Current temperature</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Peak Temp Today</p>
                        <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                      </div>
                      <p className="text-4xl font-bold text-orange-600">{Math.round(data.peakTemp)}°C</p>
                      <p className="text-sm text-gray-500 mt-2">Forecast high for today</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Medication Multiplier</p>
                        <span className="material-symbols-outlined text-primary">medication</span>
                      </div>
                      <p className="text-4xl font-bold text-primary">{data.breakdown.multiplier}x</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {data.breakdown.medications?.length > 0
                          ? data.breakdown.medications.map((m) => m.drug_class).join(', ') + ' affect hydration'
                          : 'No heat-risk medications'}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/20 bg-primary/5 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-primary uppercase tracking-wider">Overall Score</p>
                        <span className="material-symbols-outlined text-primary">warning</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black text-primary">{data.score}</p>
                        <span className="text-xl font-medium text-gray-600">/100</span>
                      </div>
                      <p className="text-sm font-medium text-primary mt-2">
                        {data.score >= 70 ? 'Action Required' : data.score >= 40 ? 'Monitor Closely' : 'Safe'}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Breakdown bars */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-6 text-gray-800">Risk Score Breakdown</h3>
                  <div className="space-y-3">
                    {breakdownFactors().map((f) => (
                      <div key={f.label} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-36 shrink-0">{f.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div className={`${f.color} h-full rounded-full`} style={{ width: `${f.value}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-8 text-right">+{f.value}</span>
                      </div>
                    ))}
                    {data.breakdown.multiplier > 1 && (
                      <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                        Medication multiplier: <strong className="text-primary">{data.breakdown.multiplier}x</strong> applied to base score of {data.breakdown.base_before_multiplier}
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Right column — timeline */}
              <div className="lg:col-span-5">
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-500">history</span>
                      Action Timeline
                    </h2>
                    <span className="text-sm text-gray-500 font-medium">Today</span>
                  </div>
                  <div className="space-y-4">
                    {data.alerts && data.alerts.length > 0 ? (
                      <>
                        {data.alerts.map((alert, i) => (
                          <div
                            key={i}
                            className={`relative pl-4 border-l-4 ${i === 0 ? 'border-primary' : 'border-gray-300'} bg-[#f8f6f6] p-4 rounded-r-lg ${i === 0 ? '' : 'opacity-75'}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-xs font-bold ${i === 0 ? 'text-primary' : 'text-gray-500'} uppercase tracking-wider`}>{alert.time}</span>
                              <span
                                className={`material-symbols-outlined ${i === 0 ? 'text-primary' : 'text-gray-400'} text-sm`}
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >sms</span>
                            </div>
                            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 italic">&ldquo;{alert.message}&rdquo;</p>
                          </div>
                        ))}
                        {data.carer_alert && (
                          <div className="relative pl-4 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Carer Alert</span>
                              <span className="material-symbols-outlined text-red-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>emergency</span>
                            </div>
                            <p className="text-sm text-red-800 bg-white p-3 rounded border border-red-200 italic">&ldquo;{data.carer_alert}&rdquo;</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No alerts generated yet for today.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
