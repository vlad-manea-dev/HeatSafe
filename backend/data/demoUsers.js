// Demo user map pins — IDs match Supabase seed UUIDs so detail-page links work

const demoUsers = [
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    name: 'María García',
    lat: 37.3868,
    lng: -6.0020,
    score: 100,
    riskLevel: 'high',
    address: 'Calle Betis 12, 4º, Triana, Sevilla',
    summary: 'Age 76, top floor, lives alone, heart condition, diuretics + beta-blockers',
    detailUrl: '/dashboard/detail/index.html?id=aaaaaaaa-0000-0000-0000-000000000001',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    name: 'Pablo Martínez',
    lat: 37.3886,
    lng: -5.9712,
    score: 12,
    riskLevel: 'low',
    address: 'Avenida de la Buharia 8, 1º, Nervión, Sevilla',
    summary: 'Age 33, ground floor, not alone, no conditions, no medications',
    detailUrl: '/dashboard/detail/index.html?id=aaaaaaaa-0000-0000-0000-000000000002',
  },
]

module.exports = { demoUsers }
