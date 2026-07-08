import { api } from './apiClient'
import type {
  CreatePackageRequest,
  MembershipPackage,
  PackageType,
  UpdatePackageRequest,
} from '../types/api'

function normalizePackage(raw: Record<string, unknown>): MembershipPackage {
  return {
    packageId: Number(raw.packageId ?? raw.PackageId ?? 0),
    packageName: String(raw.packageName ?? raw.PackageName ?? ''),
    description: raw.description ? String(raw.description) : raw.Description ? String(raw.Description) : undefined,
    durationDays: Number(raw.durationDays ?? raw.DurationDays ?? 0),
    priceLKR: Number(raw.priceLKR ?? raw.PriceLKR ?? 0),
    typeName: raw.typeName ? String(raw.typeName) : raw.TypeName ? String(raw.TypeName) : undefined,
    amenities: raw.amenities ? String(raw.amenities) : raw.Amenities ? String(raw.Amenities) : undefined,
    isActive: Boolean(raw.isActive ?? raw.IsActive ?? true),
    isFeatured: Boolean(raw.isFeatured ?? raw.IsFeatured ?? false),
    packageTypeId: Number(raw.packageTypeId ?? raw.PackageTypeId ?? 0),
  }
}

export const packageService = {
  getPublic: async (): Promise<MembershipPackage[]> => {
    const raw = await api.get<Record<string, unknown>[]>('/public/packages')
    return raw.map(normalizePackage)
  },

  getAdminAll: async (): Promise<MembershipPackage[]> => {
    const raw = await api.get<Record<string, unknown>[]>('/membership/packages/admin', true)
    return raw.map(normalizePackage)
  },

  getTypes: () => api.get<PackageType[]>('/membership/packages/types', true),

  create: async (data: CreatePackageRequest) => {
    const raw = await api.post<Record<string, unknown>>('/membership/packages', data, true)
    return normalizePackage(raw)
  },

  update: async (packageId: number, data: UpdatePackageRequest) => {
    const raw = await api.put<Record<string, unknown>>(`/membership/packages/${packageId}`, data, true)
    return normalizePackage(raw)
  },

  remove: (packageId: number) =>
    api.delete<{ message: string }>(`/membership/packages/${packageId}`, true),
}
