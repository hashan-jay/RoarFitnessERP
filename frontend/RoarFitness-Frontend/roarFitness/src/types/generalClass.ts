export interface GeneralClassRecord {
  generalClassId: number
  title: string
  category: string
  description: string
  instructorId: number
  instructorName: string
  instructorRole: string
  instructorPhotoUrl?: string | null
  weekday: number
  timeRange: string
  duration: string
  studio: string
  isActive?: boolean
  updatedAt?: string
}

export interface CreateGeneralClassPayload {
  title: string
  category: string
  description: string
  instructorId: number
  weekday: number
  timeRange: string
  duration: string
  studio: string
}

export interface UpdateGeneralClassPayload {
  title: string
  category: string
  description: string
  instructorId: number
  weekday: number
  timeRange: string
  duration: string
  studio: string
  isActive: boolean
}

export const GENERAL_CLASS_CATEGORIES = [
  'Cardio',
  'Zumba',
  'Yoga',
  'Pilates',
  'Barre',
  'CrossFit',
  'Strength',
] as const

export type GeneralClassCategory = (typeof GENERAL_CLASS_CATEGORIES)[number]
