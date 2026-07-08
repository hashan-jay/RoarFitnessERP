import { trainerChristian } from '../assets/images/trainers'
import type { Trainer } from '../components/Trainers/constants'
import type { PublicInstructor } from '../types/api'

function resolveInstructorPhotoUrl(photoUrl?: string | null): string {
  if (!photoUrl) return trainerChristian
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl
  return `${photoUrl}${photoUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(photoUrl.split('/').pop() ?? photoUrl)}`
}

function collectStrings(...values: Array<string | null | undefined>): string[] {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))
}

export function mapPublicInstructorToTrainer(instructor: PublicInstructor): Trainer {
  return {
    id: String(instructor.instructorId),
    name: instructor.fullName,
    role: instructor.role,
    yearsExperience: instructor.yearsExperience,
    certifications: collectStrings(instructor.qualification1, instructor.qualification2),
    specialties: collectStrings(instructor.speciality1, instructor.speciality2, instructor.speciality3),
    image: resolveInstructorPhotoUrl(instructor.photoUrl),
    alt: `${instructor.fullName}, ${instructor.role}`,
  }
}
