import React, { useMemo, useRef, useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => null,
})

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Dense heat points on known hot regions
function makeHeatmapPoints() {
  const regions = [
    { latRange: [18, 34], lngRange: [-12, 38], count: 25, wt: [0.65, 1.0] },
    { latRange: [15, 38], lngRange: [35, 60], count: 20, wt: [0.7, 1.0] },
    { latRange: [8, 30], lngRange: [68, 90], count: 14, wt: [0.5, 0.9] },
    { latRange: [-8, 15], lngRange: [25, 50], count: 12, wt: [0.45, 0.85] },
    { latRange: [4, 18], lngRange: [-15, 15], count: 10, wt: [0.4, 0.8] },
    { latRange: [34, 46], lngRange: [-8, 35], count: 8, wt: [0.3, 0.65] },
    { latRange: [-15, 5], lngRange: [15, 35], count: 8, wt: [0.35, 0.7] },
    { latRange: [-35, -15], lngRange: [18, 35], count: 6, wt: [0.25, 0.55] },
  ]
  const pts = []
  for (const r of regions)
    for (let i = 0; i < r.count; i++)
      pts.push({
        lat: r.latRange[0] + Math.random() * (r.latRange[1] - r.latRange[0]),
        lng: r.lngRange[0] + Math.random() * (r.lngRange[1] - r.lngRange[0]),
        value: +(r.wt[0] + Math.random() * (r.wt[1] - r.wt[0])).toFixed(3),
      })
  return pts
}

// Country labels
const LABELS = [
  { lat: 31.5, lng: -5.5, text: "Morocco", size: 0.55 },
  { lat: 42, lng: 12.5, text: "Italy", size: 0.5 },
  { lat: 39.5, lng: 35, text: "Turkey", size: 0.55 },
  { lat: 32, lng: 53, text: "Iran", size: 0.6 },
  { lat: 28, lng: 2, text: "Algeria", size: 0.55 },
  { lat: 26.5, lng: 30, text: "Egypt", size: 0.6 },
  { lat: 24, lng: 45, text: "Saudi Arabia", size: 0.65 },
  { lat: 15.5, lng: 48, text: "Yemen", size: 0.4 },
  { lat: 18, lng: 8, text: "Niger", size: 0.5 },
  { lat: 15, lng: 18, text: "Chad", size: 0.5 },
  { lat: 15, lng: 30, text: "Sudan", size: 0.55 },
  { lat: 9, lng: 8, text: "Nigeria", size: 0.55 },
  { lat: 9, lng: 38.5, text: "Ethiopia", size: 0.55 },
  { lat: 1, lng: 38, text: "Kenya", size: 0.45 },
  { lat: -6, lng: 35, text: "Tanzania", size: 0.5 },
  { lat: -12, lng: 27, text: "Zambia", size: 0.45 },
  { lat: -19, lng: 30, text: "Zimbabwe", size: 0.4 },
  { lat: -22, lng: 24, text: "Botswana", size: 0.4 },
  { lat: -30, lng: 25, text: "South Africa", size: 0.5 },
  { lat: -18, lng: 16, text: "Namibia", size: 0.45 },
  { lat: -12, lng: 17.5, text: "Angola", size: 0.5 },
  { lat: -20, lng: 47, text: "Madagascar", size: 0.45 },
  { lat: 19, lng: -5, text: "Mali", size: 0.5 },
  { lat: 4.5, lng: 30, text: "South\nSudan", size: 0.4 },
  { lat: 0, lng: 25, text: "DR Congo", size: 0.45 },
  { lat: 50, lng: -8, text: "North\nAtlantic\nOcean", size: 0.45 },
  { lat: -2, lng: 58, text: "Arabian\nSea", size: 0.45 },
]

const heatmapColorFn = useCallback((dataset) => {
  return (t) => {
    // Low intensity: soft yellow
    if (t < 0.3) {
      const f = t / 0.3
      return `rgba(255, 230, 150, ${0.2 + f * 0.4})`
    }
    // Mid intensity: vibrant orange
    if (t < 0.7) {
      const f = (t - 0.3) / 0.4
      return `rgba(255, ${200 - 100 * f}, 50, ${0.6 + f * 0.25})`
    }
    // High intensity: deep red/crimson
    const f = (t - 0.7) / 0.3
    return `rgba(${255 - 80 * f}, ${100 - 90 * f}, ${50 - 40 * f}, ${0.85 + f * 0.15})`
  }
}, [])

export default function ThermalGlobe() {
  const globeRef = useRef(null)
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [countries, setCountries] = useState([])

  const heatmapData = useMemo(() => makeHeatmapPoints(), [])

  // Load country polygons (TopoJSON → GeoJSON)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(COUNTRIES_URL)
        const topo = await res.json()
        const topojson = await import("topojson-client")
        const geo = topojson.feature(topo, topo.objects.countries)
        if (!cancelled) setCountries(geo.features)
      } catch {
        // Countries won't render, globe still works
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return
    const measure = () => {
      const { offsetWidth, offsetHeight } = containerRef.current
      if (offsetWidth > 0 && offsetHeight > 0)
        setDims({ width: offsetWidth, height: offsetHeight })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Configure globe after it mounts
  const onGlobeReady = useCallback(() => {
    const globe = globeRef.current
    if (!globe) return

    const controls = globe.controls()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.25
      controls.enableZoom = true
      controls.enablePan = true
      controls.enableRotate = true
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {dims.width > 0 && (
        <Globe
          ref={globeRef}
          onGlobeReady={onGlobeReady}
          width={dims.width}
          height={dims.height}
          // Warm beige base (tiny data-URL pixel)
          globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.png"
          bumpImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="rgba(253, 251, 247, 0.38)"
          atmosphereAltitude={0.16}
          animateIn={true}
          // Country polygons as outlines
          polygonsData={countries}
          polygonCapColor={() => "rgba(0,0,0,0)"}
          polygonSideColor={() => "rgba(0,0,0,0)"}
          polygonStrokeColor={() => "rgba(246, 237, 218, 0.7)"}
          polygonStrokeWidth={0.45}
          polygonAltitude={0.001}
          // Heatmap
          heatmapsData={[heatmapData]}
          heatmapPointLat="lat"
          heatmapPointLng="lng"
          heatmapPointWeight="value"
          heatmapBandwidth={5.5}
          heatmapColorFn={heatmapColorFn}
          heatmapColorSaturation={2.5}
          heatmapBaseAltitude={0.006}
          heatmapTopAltitude={0.06}
          heatmapsTransitionDuration={2000}
          // Labels
          labelsData={LABELS}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelSize="size"
          labelDotRadius={0}
          labelColor={() => "rgba(60, 50, 35, 0.5)"}
          labelResolution={3}
          labelAltitude={0.012}
          enablePointerInteraction={false}
        />
      )}
    </div>
  )
}
