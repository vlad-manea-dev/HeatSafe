// Spanish Heat Zones by City - Expanded for High Resolution
const heatZonesByCity = {
  sevilla: [
    { zoneId: 'casco-antiguo', name: 'Casco Antiguo', nominatimQuery: 'Casco Antiguo, Sevilla, Spain', centroid: { lat: 37.3920, lng: -5.9875 }, offset: +4.8, reason: 'Medieval stone density.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'santa-cruz', name: 'Barrio Santa Cruz', nominatimQuery: 'Santa Cruz, Sevilla, Spain', centroid: { lat: 37.3850, lng: -5.9905 }, offset: +5.2, reason: 'Hottest district.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'triana', name: 'Triana', nominatimQuery: 'Triana, Sevilla, Spain', centroid: { lat: 37.3875, lng: -6.0040 }, offset: +3.5, reason: 'Riverside sun exposure.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'los-remedios', name: 'Los Remedios', nominatimQuery: 'Los Remedios, Sevilla, Spain', centroid: { lat: 37.3735, lng: -6.0000 }, offset: +2.8, reason: 'High-albedo avenues.', color: '#E76F51', riskLevel: 'elevated' },
    { zoneId: 'nervion', name: 'Nervión', nominatimQuery: 'Nervión, Sevilla, Spain', centroid: { lat: 37.3915, lng: -5.9680 }, offset: +2.2, reason: 'Modern residential density.', color: '#E76F51', riskLevel: 'elevated' },
    { zoneId: 'macarena', name: 'La Macarena', nominatimQuery: 'La Macarena, Sevilla, Spain', centroid: { lat: 37.4030, lng: -5.9870 }, offset: +3.0, reason: 'Dense social housing blocks.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'parque-maria-luisa', name: 'Parque de María Luisa', nominatimQuery: 'Parque de María Luisa, Sevilla, Spain', centroid: { lat: 37.3748, lng: -5.9877 }, offset: -2.2, reason: 'Green lung cooling.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'alamillo', name: 'Parque del Alamillo', nominatimQuery: 'Parque del Alamillo, Sevilla, Spain', centroid: { lat: 37.4140, lng: -6.0000 }, offset: -1.8, reason: 'Riverside park.', color: '#4A7C59', riskLevel: 'cool' }
  ],
  madrid: [
    { zoneId: 'sol', name: 'Puerta del Sol', nominatimQuery: 'Sol, Madrid, Spain', centroid: { lat: 40.4168, lng: -3.7038 }, offset: +5.5, reason: 'Zero shade, extreme asphalt.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'gran-via', name: 'Gran Vía', nominatimQuery: 'Gran Vía, Madrid, Spain', centroid: { lat: 40.4200, lng: -3.7030 }, offset: +5.0, reason: 'Traffic & thermal canyon.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'salamanca', name: 'Barrio de Salamanca', nominatimQuery: 'Salamanca, Madrid, Spain', centroid: { lat: 40.4290, lng: -3.6820 }, offset: +3.5, reason: 'Dense concrete avenues.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'chamberi', name: 'Chamberí', nominatimQuery: 'Chamberí, Madrid, Spain', centroid: { lat: 40.4350, lng: -3.7020 }, offset: +3.2, reason: 'High-density residential.', color: '#E76F51', riskLevel: 'elevated' },
    { zoneId: 'retiro-park', name: 'El Retiro', nominatimQuery: 'Parque del Retiro, Madrid, Spain', centroid: { lat: 40.4153, lng: -3.6839 }, offset: -2.8, reason: 'Massive evapotranspiration.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'casa-de-campo', name: 'Casa de Campo', nominatimQuery: 'Casa de Campo, Madrid, Spain', centroid: { lat: 40.4180, lng: -3.7430 }, offset: -3.5, reason: 'Wild forest cooling.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'usera', name: 'Usera', nominatimQuery: 'Usera, Madrid, Spain', centroid: { lat: 40.3831, lng: -3.7066 }, offset: +4.2, reason: 'Industrial/Residential mix.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'vallecas', name: 'Puente de Vallecas', nominatimQuery: 'Puente de Vallecas, Madrid, Spain', centroid: { lat: 40.3950, lng: -3.6650 }, offset: +4.0, reason: 'Low green cover index.', color: '#D9383A', riskLevel: 'severe' }
  ],
  barcelona: [
    { zoneId: 'raval', name: 'El Raval', nominatimQuery: 'El Raval, Barcelona, Spain', centroid: { lat: 41.3792, lng: 2.1684 }, offset: +4.6, reason: 'Narrow streets, zero air.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'gotic', name: 'Barri Gòtic', nominatimQuery: 'Gotic, Barcelona, Spain', centroid: { lat: 41.3830, lng: 2.1760 }, offset: +4.4, reason: 'Stone thermal mass.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'eixample', name: 'Eixample', nominatimQuery: 'Eixample, Barcelona, Spain', centroid: { lat: 41.3920, lng: 2.1649 }, offset: +4.0, reason: 'Grid heat trapping.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'gracia', name: 'Gràcia', nominatimQuery: 'Gràcia, Barcelona, Spain', centroid: { lat: 41.4020, lng: 2.1550 }, offset: +3.2, reason: 'Small streets, low trees.', color: '#E76F51', riskLevel: 'elevated' },
    { zoneId: 'poblenou', name: 'Poblenou', nominatimQuery: 'Poblenou, Barcelona, Spain', centroid: { lat: 41.4000, lng: 2.2000 }, offset: +1.2, reason: 'Near sea cooling effect.', color: '#F4A261', riskLevel: 'elevated' },
    { zoneId: 'barceloneta', name: 'Barceloneta', nominatimQuery: 'Barceloneta, Barcelona, Spain', centroid: { lat: 41.3780, lng: 2.1890 }, offset: +0.5, reason: 'Strong marine breeze.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'montjuic', name: 'Montjuïc', nominatimQuery: 'Montjuïc, Barcelona, Spain', centroid: { lat: 41.3653, lng: 2.1528 }, offset: -1.8, reason: 'Park/Mountain effect.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'ciutadella', name: 'Parc de la Ciutadella', nominatimQuery: 'Parc de la Ciutadella, Barcelona, Spain', centroid: { lat: 41.3880, lng: 2.1870 }, offset: -1.2, reason: 'Urban park cooling.', color: '#4A7C59', riskLevel: 'cool' }
  ],
  valencia: [
    { zoneId: 'ciutat-vella', name: 'Ciutat Vella', nominatimQuery: 'Ciutat Vella, Valencia, Spain', centroid: { lat: 39.4739, lng: -0.3763 }, offset: +4.6, reason: 'Old town density.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'eixample-v', name: 'Eixample', nominatimQuery: 'L\'Eixample, Valencia, Spain', centroid: { lat: 39.4650, lng: -0.3700 }, offset: +3.8, reason: 'Dense urban blocks.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'russafa', name: 'Russafa', nominatimQuery: 'Russafa, Valencia, Spain', centroid: { lat: 39.4610, lng: -0.3730 }, offset: +3.5, reason: 'High social density.', color: '#D9383A', riskLevel: 'severe' },
    { zoneId: 'benicalap', name: 'Benicalap', nominatimQuery: 'Benicalap, Valencia, Spain', centroid: { lat: 39.4930, lng: -0.3920 }, offset: +3.2, reason: 'Modern outskirts.', color: '#E76F51', riskLevel: 'elevated' },
    { zoneId: 'cabanyal', name: 'El Cabanyal', nominatimQuery: 'Cabanyal, Valencia, Spain', centroid: { lat: 39.4690, lng: -0.3280 }, offset: +0.2, reason: 'Marine cooling relief.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'turia', name: 'Turia Gardens', nominatimQuery: 'Jardines del Turia, Valencia, Spain', centroid: { lat: 39.4795, lng: -0.3705 }, offset: -2.5, reason: 'Green river corridor.', color: '#4A7C59', riskLevel: 'cool' },
    { zoneId: 'viveros', name: 'Jardines del Real', nominatimQuery: 'Jardines del Real, Valencia, Spain', centroid: { lat: 39.4820, lng: -0.3650 }, offset: -1.5, reason: 'Dense botanical shade.', color: '#4A7C59', riskLevel: 'cool' }
  ]
}

const cityCentroids = {
  sevilla: { lat: 37.385, lng: -5.990 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  barcelona: { lat: 41.3851, lng: 2.1734 },
  valencia: { lat: 39.4699, lng: -0.3763 }
}

module.exports = { heatZonesByCity, cityCentroids }
