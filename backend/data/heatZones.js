// Seville heat zones — GeoJSON-style polygon array
// Each zone has rough bounding coords, a temperature offset vs baseline, and a risk level

const heatZones = [
  {
    name: 'Casco Histórico',
    coords: [
      [37.3950, -5.9950],
      [37.3950, -5.9800],
      [37.3840, -5.9800],
      [37.3840, -5.9950],
    ],
    offset: +4.5,
    reason: 'Dense medieval stone streets, minimal ventilation, high thermal mass, tourist foot traffic',
    color: '#D9383A',
    riskLevel: 'severe',
  },
  {
    name: 'Triana',
    coords: [
      [37.3920, -6.0100],
      [37.3920, -5.9950],
      [37.3800, -5.9950],
      [37.3800, -6.0100],
    ],
    offset: +3.2,
    reason: 'South-facing riverside terraces, traditional high-floor apartments with poor ventilation',
    color: '#D9383A',
    riskLevel: 'severe',
  },
  {
    name: 'Nervión',
    coords: [
      [37.3960, -5.9720],
      [37.3960, -5.9580],
      [37.3840, -5.9580],
      [37.3840, -5.9720],
    ],
    offset: +1.8,
    reason: 'Modern residential blocks with some green space, moderate urban density',
    color: '#E76F51',
    riskLevel: 'elevated',
  },
  {
    name: 'Parque de María Luisa',
    coords: [
      [37.3790, -5.9950],
      [37.3790, -5.9810],
      [37.3700, -5.9810],
      [37.3700, -5.9950],
    ],
    offset: -1.5,
    reason: '34-hectare urban park providing strong cooling effect through shade and evapotranspiration',
    color: '#4A7C59',
    riskLevel: 'cool',
  },
]

module.exports = { heatZones }
