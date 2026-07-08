import type {
  CreateGeneralClassPayload,
  GeneralClassRecord,
  UpdateGeneralClassPayload,
} from '../types/generalClass'
import { api } from './apiClient'

function mapGeneralClass(raw: Record<string, unknown>): GeneralClassRecord {
  return {
    generalClassId: Number(raw.generalClassId ?? raw.GeneralClassId ?? 0),
    title: String(raw.title ?? raw.Title ?? ''),
    category: String(raw.category ?? raw.Category ?? ''),
    description: String(raw.description ?? raw.Description ?? ''),
    instructorId: Number(raw.instructorId ?? raw.InstructorId ?? 0),
    instructorName: String(raw.instructorName ?? raw.InstructorName ?? ''),
    instructorRole: String(raw.instructorRole ?? raw.InstructorRole ?? ''),
    instructorPhotoUrl:
      typeof raw.instructorPhotoUrl === 'string'
        ? raw.instructorPhotoUrl
        : typeof raw.InstructorPhotoUrl === 'string'
          ? raw.InstructorPhotoUrl
          : null,
    weekday: Number(raw.weekday ?? raw.Weekday ?? 0),
    timeRange: String(raw.timeRange ?? raw.TimeRange ?? ''),
    duration: String(raw.duration ?? raw.Duration ?? ''),
    studio: String(raw.studio ?? raw.Studio ?? ''),
    isActive: Boolean(raw.isActive ?? raw.IsActive ?? true),
    updatedAt:
      typeof raw.updatedAt === 'string'
        ? raw.updatedAt
        : typeof raw.UpdatedAt === 'string'
          ? raw.UpdatedAt
          : undefined,
  }
}

export const generalClassService = {
  getPublic: async () => {
    const data = await api.get<Record<string, unknown>[]>('/public/general-classes')
    return data.map(mapGeneralClass)
  },

  getInstructorMine: async () => {
    const data = await api.get<Record<string, unknown>[]>('/general-classes/instructor', true)
    return data.map(mapGeneralClass)
  },

  getAdminList: async () => {
    const data = await api.get<Record<string, unknown>[]>('/admin/general-classes', true)
    return data.map(mapGeneralClass)
  },

  create: (payload: CreateGeneralClassPayload) =>
    api.post<GeneralClassRecord>('/admin/general-classes', payload, true),

  update: (generalClassId: number, payload: UpdateGeneralClassPayload) =>
    api.put<GeneralClassRecord>(`/admin/general-classes/${generalClassId}`, payload, true),

  remove: (generalClassId: number) =>
    api.delete<{ message: string }>(`/admin/general-classes/${generalClassId}`, true),
}
