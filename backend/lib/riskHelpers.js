export function getRiskColor(score) {
  if (score >= 85) return { bg: 'bg-primary', border: 'hover:border-primary', ring: 'focus:ring-primary', icon: 'warning', iconFill: true, textColor: 'text-primary' }
  if (score >= 70) return { bg: 'bg-primary', border: 'hover:border-primary', ring: 'focus:ring-primary', icon: 'warning', iconFill: true, textColor: 'text-primary' }
  if (score >= 40) return { bg: 'bg-risk-amber', border: 'hover:border-risk-amber', ring: 'focus:ring-risk-amber', icon: 'thermostat', iconFill: false, textColor: 'text-risk-amber' }
  return { bg: 'bg-safe-sage', border: 'hover:border-safe-sage', ring: 'focus:ring-safe-sage', icon: 'check_circle', iconFill: false, textColor: 'text-safe-sage' }
}

export function getRiskLabel(score) {
  if (score >= 85) return 'Critical'
  if (score >= 70) return 'High'
  if (score >= 40) return 'Moderate'
  return 'Low'
}

export function getRiskBadgeClasses(riskLevel) {
  switch (riskLevel) {
    case 'high':
    case 'critical':
      return 'bg-red-100 text-primary'
    case 'medium':
    case 'moderate':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-green-100 text-green-700'
  }
}
