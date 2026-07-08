import { mapPublicInstructorToTrainer } from '../adapters/instructorAdapter'
import { PUBLIC_TRAINER_LIMIT } from '../constants/publicContent'
import type { ContactMessage, PublicInstructor } from '../types/api'
import { packageService } from './packageService'
import { api } from './apiClient'

function mapPublicInstructor(raw: Record<string, unknown>): PublicInstructor {
  return {
    instructorId: Number(raw.instructorId ?? raw.InstructorId ?? 0),
    fullName: String(raw.fullName ?? raw.FullName ?? ''),
    role: String(raw.role ?? raw.Role ?? 'Fitness Coach'),
    yearsExperience: Number(raw.yearsExperience ?? raw.YearsExperience ?? 0),
    qualification1:
      typeof raw.qualification1 === 'string'
        ? raw.qualification1
        : typeof raw.Qualification1 === 'string'
          ? raw.Qualification1
          : undefined,
    qualification2:
      typeof raw.qualification2 === 'string'
        ? raw.qualification2
        : typeof raw.Qualification2 === 'string'
          ? raw.Qualification2
          : undefined,
    speciality1:
      typeof raw.speciality1 === 'string'
        ? raw.speciality1
        : typeof raw.Speciality1 === 'string'
          ? raw.Speciality1
          : undefined,
    speciality2:
      typeof raw.speciality2 === 'string'
        ? raw.speciality2
        : typeof raw.Speciality2 === 'string'
          ? raw.Speciality2
          : undefined,
    speciality3:
      typeof raw.speciality3 === 'string'
        ? raw.speciality3
        : typeof raw.Speciality3 === 'string'
          ? raw.Speciality3
          : undefined,
    photoUrl:
      typeof raw.photoUrl === 'string'
        ? raw.photoUrl
        : typeof raw.PhotoUrl === 'string'
          ? raw.PhotoUrl
          : undefined,
  }
}

export const publicService = {
  getPackages: () => packageService.getPublic(),
  getInstructors: async () => {
    const data = await api.get<Record<string, unknown>[]>('/public/trainers')
    return data.map(mapPublicInstructor).map(mapPublicInstructorToTrainer).slice(0, PUBLIC_TRAINER_LIMIT)
  },
  sendContactMessage: (data: ContactMessage) =>
    api.post<void>('/public/contact', {
      fullName: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      subject: 'Website inquiry',
      message: data.message.trim(),
    }),
}
