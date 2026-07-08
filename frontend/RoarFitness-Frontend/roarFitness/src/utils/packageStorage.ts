import {
  MEMBERSHIP_PLANS,
  type MembershipPlan,
} from '../components/MembershipPlans/constants'
import { mapPackageToPlan } from '../adapters/packageAdapter'
import { publicService } from '../services'

let cachedPackages: MembershipPlan[] | null = null
let loadPromise: Promise<MembershipPlan[]> | null = null

export function getPackages(): MembershipPlan[] {
  return cachedPackages ?? MEMBERSHIP_PLANS
}

export function getPackageById(planId: string): MembershipPlan | undefined {
  return getPackages().find((plan) => plan.id === planId)
}

export function getPackageByPackageId(packageId: number): MembershipPlan | undefined {
  return getPackages().find((plan) => plan.id === String(packageId))
}

export async function loadPackagesFromApi(): Promise<MembershipPlan[]> {
  if (cachedPackages) return cachedPackages
  if (loadPromise) return loadPromise

  loadPromise = publicService
    .getPackages()
    .then((packages) => {
      const active = packages.filter((pkg) => pkg.isActive !== false).map(mapPackageToPlan)
      cachedPackages = active.length > 0 ? active : MEMBERSHIP_PLANS
      return cachedPackages
    })
    .catch(() => {
      cachedPackages = MEMBERSHIP_PLANS
      return cachedPackages
    })
    .finally(() => {
      loadPromise = null
    })

  return loadPromise
}

export function invalidatePackageCache(): void {
  cachedPackages = null
}

export function slugifyPackageId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
