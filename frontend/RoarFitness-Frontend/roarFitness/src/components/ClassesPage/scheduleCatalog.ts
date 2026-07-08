import { FITNESS_CLASSES } from '../Classes/constants'
import { TRAINERS } from '../Trainers/constants'

export type ClassType =
  | 'Cardio'
  | 'Strength'
  | 'Yoga'
  | 'Pilates'
  | 'CrossFit'
  | 'Zumba'
  | 'Barre'
  | string

const CLASS_TYPE_BY_ID: Record<string, ClassType> = {
  cardio: 'Cardio',
  strength: 'Strength',
  yoga: 'Yoga',
  pilates: 'Pilates',
  crossfit: 'CrossFit',
  zumba: 'Zumba',
  barre: 'Barre',
}

export interface ScheduleSlotInput {
  id: string
  classId: string
  trainerId: string
  time: string
  duration: string
  studio: string
}

export interface ResolvedScheduleSlot {
  id: string
  classId: string
  trainerId: string
  className: string
  classType: ClassType
  description: string
  classImage: string
  instructorName: string
  instructorRole: string
  instructorImage: string
  time: string
  duration: string
  studio: string
  isVipSession?: boolean
  feePerPersonLKR?: number
  spotsRemaining?: number
  maxParticipants?: number
}

export const CLASS_CATALOG = Object.fromEntries(
  FITNESS_CLASSES.map((fitnessClass) => [fitnessClass.id, fitnessClass]),
) as Record<string, (typeof FITNESS_CLASSES)[number]>

export const TRAINER_CATALOG = Object.fromEntries(
  TRAINERS.map((trainer) => [trainer.id, trainer]),
) as Record<string, (typeof TRAINERS)[number]>

export const SCHEDULE_FILTER_CLASS_TYPES = FITNESS_CLASSES.map((fitnessClass) => ({
  id: fitnessClass.id,
  label: CLASS_TYPE_BY_ID[fitnessClass.id] ?? fitnessClass.title,
}))

export const SCHEDULE_FILTER_TRAINERS = TRAINERS.map((trainer) => ({
  id: trainer.id,
  name: trainer.name,
}))

export function getClassType(classId: string): ClassType {
  return CLASS_TYPE_BY_ID[classId] ?? 'Strength'
}

export function resolveScheduleSlot(slot: ScheduleSlotInput): ResolvedScheduleSlot {
  const fitnessClass = CLASS_CATALOG[slot.classId]
  const trainer = TRAINER_CATALOG[slot.trainerId]

  if (!fitnessClass || !trainer) {
    throw new Error(`Invalid schedule slot: ${slot.id}`)
  }

  return {
    id: slot.id,
    classId: slot.classId,
    trainerId: slot.trainerId,
    className: fitnessClass.title,
    classType: getClassType(slot.classId),
    description: fitnessClass.description,
    classImage: fitnessClass.image,
    instructorName: trainer.name,
    instructorRole: trainer.role,
    instructorImage: trainer.image,
    time: slot.time,
    duration: slot.duration,
    studio: slot.studio,
  }
}

export function resolveDaySchedule(slots: ScheduleSlotInput[]): ResolvedScheduleSlot[] {
  return slots.map(resolveScheduleSlot)
}

/**
 * Static fallback schedule when the general-classes API is unavailable.
 * Primary data source is GET /api/public/general-classes; this keeps the
 * public Classes page usable offline or during API outages (see scheduleUtils).
 */
export const WEEKLY_SCHEDULE_INPUT: Record<number, ScheduleSlotInput[]> = {
  0: [],
  1: [
    {
      id: 'mon-1',
      classId: 'strength',
      trainerId: 'dylan-perera',
      time: '06:00 - 07:00',
      duration: '60 min',
      studio: 'Strength Floor',
    },
    {
      id: 'mon-2',
      classId: 'yoga',
      trainerId: 'isha-fernando',
      time: '07:30 - 08:30',
      duration: '60 min',
      studio: 'Zen Room',
    },
    {
      id: 'mon-3',
      classId: 'cardio',
      trainerId: 'amanda-desilva',
      time: '17:00 - 17:45',
      duration: '45 min',
      studio: 'Cardio Hall',
    },
    {
      id: 'mon-4',
      classId: 'crossfit',
      trainerId: 'ryan-joseph',
      time: '18:30 - 19:30',
      duration: '60 min',
      studio: 'Box Arena',
    },
  ],
  2: [
    {
      id: 'tue-1',
      classId: 'crossfit',
      trainerId: 'ryan-joseph',
      time: '06:15 - 07:15',
      duration: '60 min',
      studio: 'Box Arena',
    },
    {
      id: 'tue-2',
      classId: 'cardio',
      trainerId: 'amanda-desilva',
      time: '08:00 - 08:45',
      duration: '45 min',
      studio: 'Cardio Hall',
    },
    {
      id: 'tue-3',
      classId: 'pilates',
      trainerId: 'isha-fernando',
      time: '17:30 - 18:15',
      duration: '45 min',
      studio: 'Studio B',
    },
    {
      id: 'tue-4',
      classId: 'strength',
      trainerId: 'dylan-perera',
      time: '18:45 - 19:45',
      duration: '60 min',
      studio: 'Studio A',
    },
  ],
  3: [
    {
      id: 'wed-1',
      classId: 'strength',
      trainerId: 'dylan-perera',
      time: '06:00 - 07:00',
      duration: '60 min',
      studio: 'Strength Floor',
    },
    {
      id: 'wed-2',
      classId: 'yoga',
      trainerId: 'isha-fernando',
      time: '07:15 - 08:00',
      duration: '45 min',
      studio: 'Zen Room',
    },
    {
      id: 'wed-3',
      classId: 'cardio',
      trainerId: 'ryan-joseph',
      time: '17:15 - 18:00',
      duration: '45 min',
      studio: 'Performance Zone',
    },
    {
      id: 'wed-4',
      classId: 'pilates',
      trainerId: 'isha-fernando',
      time: '19:00 - 19:50',
      duration: '50 min',
      studio: 'Studio B',
    },
  ],
  4: [
    {
      id: 'thu-1',
      classId: 'crossfit',
      trainerId: 'ryan-joseph',
      time: '06:15 - 07:00',
      duration: '45 min',
      studio: 'Box Arena',
    },
    {
      id: 'thu-2',
      classId: 'cardio',
      trainerId: 'amanda-desilva',
      time: '08:00 - 08:50',
      duration: '50 min',
      studio: 'Cardio Hall',
    },
    {
      id: 'thu-3',
      classId: 'yoga',
      trainerId: 'isha-fernando',
      time: '17:00 - 17:45',
      duration: '45 min',
      studio: 'Zen Room',
    },
    {
      id: 'thu-4',
      classId: 'strength',
      trainerId: 'dylan-perera',
      time: '18:30 - 19:30',
      duration: '60 min',
      studio: 'Studio A',
    },
  ],
  5: [
    {
      id: 'fri-1',
      classId: 'strength',
      trainerId: 'dylan-perera',
      time: '06:00 - 06:50',
      duration: '50 min',
      studio: 'Strength Floor',
    },
    {
      id: 'fri-2',
      classId: 'pilates',
      trainerId: 'isha-fernando',
      time: '07:30 - 08:20',
      duration: '50 min',
      studio: 'Studio B',
    },
    {
      id: 'fri-3',
      classId: 'cardio',
      trainerId: 'amanda-desilva',
      time: '17:15 - 18:00',
      duration: '45 min',
      studio: 'Cardio Hall',
    },
    {
      id: 'fri-4',
      classId: 'crossfit',
      trainerId: 'ryan-joseph',
      time: '18:00 - 19:00',
      duration: '60 min',
      studio: 'Box Arena',
    },
  ],
  6: [
    {
      id: 'sat-1',
      classId: 'crossfit',
      trainerId: 'ryan-joseph',
      time: '07:00 - 08:00',
      duration: '60 min',
      studio: 'Box Arena',
    },
    {
      id: 'sat-2',
      classId: 'cardio',
      trainerId: 'amanda-desilva',
      time: '08:15 - 09:00',
      duration: '45 min',
      studio: 'Cardio Hall',
    },
    {
      id: 'sat-3',
      classId: 'yoga',
      trainerId: 'isha-fernando',
      time: '09:30 - 10:15',
      duration: '45 min',
      studio: 'Zen Room',
    },
    {
      id: 'sat-4',
      classId: 'strength',
      trainerId: 'dylan-perera',
      time: '10:30 - 11:30',
      duration: '60 min',
      studio: 'Studio A',
    },
  ],
}

export const WEEKDAY_CLASS_IMAGES: Record<number, string> = {
  0: CLASS_CATALOG.yoga.image,
  1: CLASS_CATALOG.strength.image,
  2: CLASS_CATALOG.crossfit.image,
  3: CLASS_CATALOG.pilates.image,
  4: CLASS_CATALOG.cardio.image,
  5: CLASS_CATALOG.strength.image,
  6: CLASS_CATALOG.crossfit.image,
}
