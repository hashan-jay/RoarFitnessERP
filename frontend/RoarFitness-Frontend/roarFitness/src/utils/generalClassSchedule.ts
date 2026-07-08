import { classCardio } from '../assets/images/classes'
import { FITNESS_CLASSES } from '../components/Classes/constants'
import { trainerChristian } from '../assets/images/trainers'
import type { ResolvedScheduleSlot } from '../components/ClassesPage/scheduleCatalog'
import type { GeneralClassRecord } from '../types/generalClass'
import { GENERAL_CLASS_CATEGORIES } from '../types/generalClass'

const CATEGORY_IMAGE: Record<string, string> = {
  cardio: FITNESS_CLASSES.find((c) => c.id === 'cardio')?.image ?? classCardio,
  strength: FITNESS_CLASSES.find((c) => c.id === 'strength')?.image ?? classCardio,
  yoga: FITNESS_CLASSES.find((c) => c.id === 'yoga')?.image ?? classCardio,
  pilates: FITNESS_CLASSES.find((c) => c.id === 'pilates')?.image ?? classCardio,
  crossfit: FITNESS_CLASSES.find((c) => c.id === 'crossfit')?.image ?? classCardio,
  zumba: classCardio,
  barre: FITNESS_CLASSES.find((c) => c.id === 'pilates')?.image ?? classCardio,
}

function resolveInstructorPhotoUrl(photoUrl?: string | null): string {
  if (!photoUrl) return trainerChristian
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) return photoUrl
  return photoUrl
}

export function categoryToFilterId(category: string): string {
  return category.trim().toLowerCase().replace(/\s+/g, '-')
}

export function mapGeneralClassToScheduleSlot(record: GeneralClassRecord): ResolvedScheduleSlot {
  const filterId = categoryToFilterId(record.category)
  const normalizedCategory =
    record.category === 'CrossFit' ? 'CrossFit' : record.category.trim()

  return {
    id: String(record.generalClassId),
    classId: filterId,
    trainerId: String(record.instructorId),
    className: record.title,
    classType: normalizedCategory as ResolvedScheduleSlot['classType'],
    description: record.description,
    classImage: CATEGORY_IMAGE[filterId] ?? classCardio,
    instructorName: record.instructorName,
    instructorRole: record.instructorRole,
    instructorImage: resolveInstructorPhotoUrl(record.instructorPhotoUrl),
    time: record.timeRange,
    duration: record.duration,
    studio: record.studio,
  }
}

export function groupGeneralClassesByWeekday(
  records: GeneralClassRecord[],
): Record<number, ResolvedScheduleSlot[]> {
  const grouped: Record<number, ResolvedScheduleSlot[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }

  for (const record of records) {
    if (record.weekday < 0 || record.weekday > 6) continue
    grouped[record.weekday].push(mapGeneralClassToScheduleSlot(record))
  }

  return grouped
}

export function buildScheduleFilters(records: GeneralClassRecord[]) {
  const classTypeMap = new Map<string, string>()
  const trainerMap = new Map<string, string>()

  for (const category of GENERAL_CLASS_CATEGORIES) {
    classTypeMap.set(categoryToFilterId(category), category)
  }

  for (const record of records) {
    const filterId = categoryToFilterId(record.category)
    classTypeMap.set(filterId, record.category)
    trainerMap.set(String(record.instructorId), record.instructorName)
  }

  return {
    classTypes: Array.from(classTypeMap.entries()).map(([id, label]) => ({ id, label })),
    trainers: Array.from(trainerMap.entries()).map(([id, name]) => ({ id, name })),
  }
}

export function buildClassTypeFilters(records: GeneralClassRecord[]) {
  const classTypeMap = new Map<string, string>()

  for (const record of records) {
    const filterId = categoryToFilterId(record.category)
    const normalizedCategory =
      record.category === 'CrossFit' ? 'CrossFit' : record.category.trim()
    classTypeMap.set(filterId, normalizedCategory)
  }

  return Array.from(classTypeMap.entries()).map(([id, label]) => ({ id, label }))
}
