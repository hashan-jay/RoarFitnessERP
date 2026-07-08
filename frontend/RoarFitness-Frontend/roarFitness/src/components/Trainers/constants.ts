import type { LucideIcon } from 'lucide-react'
import { Award, BadgeCheck, ShieldCheck, UserRound } from 'lucide-react'

import {
  trainerAmanda,
  trainerChristian,
  trainerMary,
  trainerSandra,
} from '../../assets/images/trainers'

export interface Trainer {
  id: string
  name: string
  role: string
  yearsExperience: number
  certifications: string[]
  specialties: string[]
  image: string
  alt: string
}

export interface TrainerHighlight {
  id: string
  label: string
  icon: LucideIcon
}

export const TRAINERS_COPY = {
  eyebrow: 'COACHES WHO DRIVE RESULTS',
  headingLead: 'Expert Coaches.',
  headingAccent: 'Elite Guidance.',
  subtitle:
    'Certified professionals dedicated to precision training, accountability, and measurable progress — no shortcuts, only results.',
  cta: 'Book Session',
  experienceLabel: 'yrs experience',
} as const

export const TRAINER_HIGHLIGHTS: TrainerHighlight[] = [
  { id: 'experienced', label: 'Experienced Trainers', icon: Award },
  { id: 'certified', label: 'Certified & Qualified', icon: BadgeCheck },
  { id: 'registered', label: 'Registered Professionals', icon: ShieldCheck },
  { id: 'personalized', label: 'Personalized Coaching', icon: UserRound },
]

export const TRAINERS: Trainer[] = [
  {
    id: 'dylan-perera',
    name: 'Dylan Perera',
    role: 'Strength Coach',
    yearsExperience: 8,
    certifications: ['NSCA-CPT', 'CrossFit L1'],
    specialties: ['Strength Training', 'Muscle Building', 'Powerlifting'],
    image: trainerChristian,
    alt: 'Christian Grant, strength coach',
  },
  {
    id: 'isha-fernando',
    name: 'Isha Fernando',
    role: 'Personal Trainer',
    yearsExperience: 6,
    certifications: ['ACE', 'NASM'],
    specialties: ['Weight Loss', 'HIIT', 'Functional Fitness'],
    image: trainerSandra,
    alt: 'Sandra Lee, personal trainer',
  },
  {
    id: 'ryan-joseph',
    name: 'Ryan Joseph',
    role: 'Group Class Trainer',
    yearsExperience: 5,
    certifications: ['ISSA', 'CrossFit L1'],
    specialties: ['HIIT', 'Functional Fitness', 'Conditioning'],
    image: trainerMary,
    alt: 'Mary Peterson, group class trainer',
  },
  {
    id: 'amanda-desilva',
    name: 'Amanda de Silva',
    role: 'Nutrition Specialist',
    yearsExperience: 7,
    certifications: ['PN Level 1', 'ISSA Nutrition'],
    specialties: ['Nutrition', 'Weight Loss', 'Meal Planning'],
    image: trainerAmanda,
    alt: 'Amanda Gray, nutrition specialist',
  },
]
