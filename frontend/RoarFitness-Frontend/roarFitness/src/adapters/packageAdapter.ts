import type { MembershipPlan } from '../components/MembershipPlans/constants'
import type { MembershipPackage } from '../types/api'

function periodLabel(durationDays: number): MembershipPlan['period'] {
  if (durationDays >= 365) return '/ Year'
  if (durationDays >= 90) return '/ Quarter'
  return '/ Month'
}

function parseFeatures(pkg: MembershipPackage): string[] {
  if (pkg.amenities) {
    const lines = pkg.amenities
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length > 0) return lines
  }

  return [
    `${pkg.durationDays}-day gym access`,
    'Full gym floor access',
    'Locker room and showers',
  ]
}

export function mapPackageToPlan(pkg: MembershipPackage): MembershipPlan {
  return {
    id: String(pkg.packageId),
    name: pkg.packageName,
    price: pkg.priceLKR,
    period: periodLabel(pkg.durationDays),
    description: pkg.description ?? 'Flexible membership designed for your fitness goals.',
    features: parseFeatures(pkg),
    cta: 'Join Now',
    isPopular: pkg.isFeatured,
  }
}

export function parsePlanPackageId(planId: string): number {
  const parsed = Number(planId)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid package selection.')
  }
  return parsed
}
