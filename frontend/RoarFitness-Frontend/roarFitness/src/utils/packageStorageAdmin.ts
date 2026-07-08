import type { MembershipPlan } from '../components/MembershipPlans/constants'
import { mapPackageToPlan } from '../adapters/packageAdapter'
import { packageService } from '../services/packageService'
import { invalidatePackageCache } from './packageStorage'

export async function createPackage(plan: MembershipPlan): Promise<MembershipPlan> {
  const created = await packageService.create({
    packageTypeId: 1,
    packageName: plan.name,
    description: plan.description,
    amenities: plan.features.join('\n'),
    durationDays: plan.period === '/ Year' ? 365 : plan.period === '/ Quarter' ? 90 : 30,
    priceLKR: plan.price,
    isFeatured: Boolean(plan.isPopular),
  })
  invalidatePackageCache()
  return mapPackageToPlan(created)
}

export async function updatePackage(
  planId: string,
  updates: Partial<MembershipPlan>,
): Promise<MembershipPlan> {
  const packageId = Number(planId)
  const existing = await packageService.getAdminAll()
  const current = existing.find((pkg) => pkg.packageId === packageId)
  if (!current) throw new Error('Package not found.')

  const updated = await packageService.update(packageId, {
    packageTypeId: current.packageTypeId ?? 1,
    packageName: updates.name ?? current.packageName,
    description: updates.description ?? current.description,
    amenities: updates.features?.join('\n') ?? current.amenities,
    durationDays: current.durationDays,
    priceLKR: updates.price ?? current.priceLKR,
    isFeatured: updates.isPopular ?? current.isFeatured ?? false,
    isActive: current.isActive !== false,
  })
  invalidatePackageCache()
  return mapPackageToPlan(updated)
}

export async function deletePackage(planId: string): Promise<void> {
  await packageService.remove(Number(planId))
  invalidatePackageCache()
}
