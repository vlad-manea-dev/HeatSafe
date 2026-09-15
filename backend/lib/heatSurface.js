/**
 * heatSurface — shared canvas renderer for the interpolated heat field.
 *
 * Both the city and enterprise maps paint a temperature surface over the
 * basemap. The naive version filled hard-edged NxN rectangles across the whole
 * canvas, which produced two artefacts:
 *
 *   1. visible blocky squares, because each cell was flat-filled
 *   2. a solid colour blanket over the entire viewport, because the
 *      inverse-distance interpolation returns a value everywhere on earth —
 *      including countryside far outside any mapped neighbourhood
 *
 * The fix: sample the field into a low-resolution offscreen bitmap, then let
 * the browser bilinearly upscale it (smooth gradient, and cheaper than filling
 * thousands of rects), and multiply alpha by a distance falloff so the surface
 * fades out away from the mapped zones.
 */

/**
 * Builds a falloff function: 1 near a zone centroid, easing to 0 past `fadeDeg`.
 *
 * Longitude degrees are narrower than latitude degrees away from the equator,
 * so lng deltas are scaled by cos(lat) to keep the radius roughly circular.
 *
 * @param {Array<{centroid:{lat:number,lng:number}}>} zones
 * @param {{fullDeg?:number, fadeDeg?:number}} [opts]
 * @returns {(lat:number, lng:number) => number} multiplier in [0,1]
 */
export function makeZoneFalloff(zones, opts = {}) {
  const fullDeg = opts.fullDeg ?? 0.011 // ~1.2km: full strength inside this
  const fadeDeg = opts.fadeDeg ?? 0.030 // ~3.3km: fully transparent past this
  const pts = (zones || [])
    .filter((z) => z && z.centroid)
    .map((z) => ({ lat: z.centroid.lat, lng: z.centroid.lng }))

  if (pts.length === 0) return () => 0

  return (lat, lng) => {
    const k = Math.cos((lat * Math.PI) / 180)
    let min = Infinity
    for (let i = 0; i < pts.length; i++) {
      const dLat = lat - pts[i].lat
      const dLng = (lng - pts[i].lng) * k
      const d = Math.sqrt(dLat * dLat + dLng * dLng)
      if (d < min) min = d
    }
    if (min <= fullDeg) return 1
    if (min >= fadeDeg) return 0
    // smoothstep for a soft edge rather than a hard ring
    const t = 1 - (min - fullDeg) / (fadeDeg - fullDeg)
    return t * t * (3 - 2 * t)
  }
}

/**
 * Paints the heat field onto a 2D canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx   target context (cleared first)
 * @param {object} o
 * @param {number} o.width                 canvas width in px
 * @param {number} o.height                canvas height in px
 * @param {number} [o.cell=14]             sample spacing in px; lower = sharper + slower
 * @param {(x:number,y:number)=>{lat:number,lng:number}} o.toLatLng
 * @param {(lat:number,lng:number)=>number} o.tempAt
 * @param {(temp:number)=>[number,number,number,number]} o.colorFor  rgba, alpha 0-255
 * @param {(lat:number,lng:number)=>number} [o.falloff]  alpha multiplier in [0,1]
 */
export function drawHeatField(ctx, o) {
  const { width, height, toLatLng, tempAt, colorFor } = o
  const cell = o.cell ?? 14
  const falloff = o.falloff

  ctx.clearRect(0, 0, width, height)
  if (width <= 0 || height <= 0) return

  const cols = Math.ceil(width / cell) + 1
  const rows = Math.ceil(height / cell) + 1

  const off = document.createElement('canvas')
  off.width = cols
  off.height = rows
  const offCtx = off.getContext('2d')
  const img = offCtx.createImageData(cols, rows)
  const px = img.data

  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      // sample at the cell centre in container coordinates
      const ll = toLatLng(cx * cell + cell / 2, cy * cell + cell / 2)
      const [r, g, b, a] = colorFor(tempAt(ll.lat, ll.lng))
      const m = falloff ? falloff(ll.lat, ll.lng) : 1
      const i = (cy * cols + cx) * 4
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
      px[i + 3] = Math.round(a * m)
    }
  }

  offCtx.putImageData(img, 0, 0)

  // Upscale with interpolation. The half-cell offset keeps sample centres
  // aligned with where they were actually measured.
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    off,
    0, 0, cols, rows,
    -cell / 2, -cell / 2, cols * cell, rows * cell
  )
}
