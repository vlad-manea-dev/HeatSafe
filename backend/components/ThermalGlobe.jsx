import React, { useRef, useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// next/dynamic does not forward refs: a `ref` handed to the loadable wrapper
// never reaches the Globe instance, so globeRef.current.controls() throws
// "globe.controls is not a function". Pass the ref through a normal prop.
const Globe = dynamic(
  () =>
    import("react-globe.gl").then((mod) => {
      const G = mod.default
      const GlobeWithRef = ({ globeRef, ...rest }) => <G ref={globeRef} {...rest} />
      GlobeWithRef.displayName = "GlobeWithRef"
      return GlobeWithRef
    }),
  { ssr: false, loading: () => null }
)

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Self-hosted rather than pulled from a CDN: the three-globe example images
// this used to reference were removed upstream and started 404ing, which left
// the globe with no surface at all.
const EARTH_TEXTURE = "/earth-day.jpg"
const EARTH_BUMP = "/earth-topology.png"

// Some machines (GPU blacklisted, WebGL disabled, headless) cannot create a
// WebGL context. Detect it up front so the hero degrades to the static image
// instead of rendering nothing at all.
function hasWebGL() {
  try {
    const c = document.createElement("canvas")
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    )
  } catch {
    return false
  }
}

export default function ThermalGlobe() {
  const globeRef = useRef(null)
  const containerRef = useRef(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })
  const [countries, setCountries] = useState([])
  const [webgl, setWebgl] = useState(null) // null = not yet checked

  useEffect(() => {
    setWebgl(hasWebGL())
  }, [])

  // Country borders (TopoJSON → GeoJSON). Drawn as outlines over the texture so
  // every country is delineated, not just the continents.
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
        // Borders won't render, globe still works
      }
    })()
    return () => {
      cancelled = true
    }
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

  const onGlobeReady = useCallback(() => {
    const globe = globeRef.current
    if (!globe) return

    const controls =
      typeof globe.controls === "function" ? globe.controls() : null
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.25
      controls.enableZoom = true
      controls.enablePan = true
      controls.enableRotate = true
    }
  }, [])

  if (webgl === false) {
    return (
      <img
        src="/globe.png"
        alt="Globe showing the world's countries and continents"
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          height: "110%",
          width: "auto",
          maxWidth: "none",
        }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      {webgl && dims.width > 0 && (
        <Globe
          globeRef={globeRef}
          onGlobeReady={onGlobeReady}
          width={dims.width}
          height={dims.height}
          globeImageUrl={EARTH_TEXTURE}
          bumpImageUrl={EARTH_BUMP}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          // THREE.Color ignores the alpha channel here, so this has to be an
          // opaque colour; atmosphereAltitude controls how far the glow spreads.
          atmosphereColor="#cfe0ef"
          atmosphereAltitude={0.15}
          animateIn={true}
          // Country borders as thin outlines over the texture
          polygonsData={countries}
          polygonCapColor={() => "rgba(0,0,0,0)"}
          polygonSideColor={() => "rgba(0,0,0,0)"}
          polygonStrokeColor={() => "rgba(255, 255, 255, 0.45)"}
          polygonStrokeWidth={0.5}
          polygonAltitude={0.004}
          enablePointerInteraction={false}
        />
      )}
    </div>
  )
}
