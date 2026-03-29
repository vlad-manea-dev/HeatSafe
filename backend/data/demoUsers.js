// Demo user map pins — IDs match Supabase seed UUIDs so detail-page links work

const demoUsers = [
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    name: 'María García',
    lat: 37.3868,
    lng: -6.0020,
    score: 91,
    riskLevel: 'high',
    address: 'Calle Betis 12, 2º, Triana, Sevilla',
    summary: 'Age 76, south-facing, lives alone, heart condition, diuretics',
    detailUrl: '/dashboard/detail/index.html?id=aaaaaaaa-0000-0000-0000-000000000001',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    name: 'Pablo Martínez',
    lat: 37.3886,
    lng: -5.9712,
    score: 35,
    riskLevel: 'medium',
    address: 'Calle Sierpes 45, 3º, Casco Histórico, Sevilla',
    summary: 'Age 33, top floor, south-facing, low green cover — urban risk factors only',
    detailUrl: '/dashboard/detail/index.html?id=aaaaaaaa-0000-0000-0000-000000000002',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000003',
    name: 'Carlos Ruiz',
    lat: 40.4168,
    lng: -3.7038,
    score: 84,
    riskLevel: 'high',
    address: 'Gran Vía 32, Madrid',
    summary: 'Age 82, heart condition, lives alone in high-traffic heat island.',
    detailUrl: '/dashboard/detail/index.html?id=aaaaaaaa-0000-0000-0000-000000000003',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000004',
    name: 'Elena Belmonte',
    lat: 41.3920,
    lng: 2.1649,
    score: 72,
    riskLevel: 'high',
    address: 'Carrer d\'Aragó 250, Eixample, Barcelona',
    summary: 'Age 78, asthma, top floor, high-density grid exposure.',
    detailUrl: '/dashboard/detail/index.html?id=aaaaaaaa-0000-0000-0000-000000000004',
  },
]

module.exports = { demoUsers }
