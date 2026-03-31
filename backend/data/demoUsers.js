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
    summary: 'Age 76, south-facing top floor, lives alone, heart condition, diuretics',
    detailUrl: '/dashboard/aaaaaaaa-0000-0000-0000-000000000001',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    name: 'Pablo Martínez',
    lat: 37.3886,
    lng: -5.9712,
    score: 35,
    riskLevel: 'low',
    address: 'Calle Sierpes 45, bajo, Casco Histórico, Sevilla',
    summary: 'Age 68, ground floor shaded, no medications, lives with spouse',
    detailUrl: '/dashboard/aaaaaaaa-0000-0000-0000-000000000002',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000003',
    name: 'Carmen Ruiz',
    lat: 37.3920,
    lng: -5.9875,
    score: 88,
    riskLevel: 'high',
    address: 'Plaza del Salvador 8, 4º, Casco Antiguo, Sevilla',
    summary: 'Age 82, antipsychotics + ACE inhibitor, top floor, lives alone',
    detailUrl: '/dashboard/aaaaaaaa-0000-0000-0000-000000000003',
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000004',
    name: 'Antonio López',
    lat: 37.4025,
    lng: -5.9860,
    score: 72,
    riskLevel: 'high',
    address: 'Calle Feria 31, 3º, La Macarena, Sevilla',
    summary: 'Age 79, beta-blocker, diabetes, south-facing, limited mobility',
    detailUrl: '/dashboard/aaaaaaaa-0000-0000-0000-000000000004',
  },
]

module.exports = { demoUsers }
