import { Dumbbell, Heart, Target, Users, type LucideIcon } from 'lucide-react'

import {
  showcaseSlide2,
  showcaseSlide3,
} from '../../assets/images/showcase/index'
import { heroWorkout } from '../../assets/images/index'

export const ABOUT_COPY = {
  eyebrow: 'OUR STORY',
  headline: 'Built for Those Who Refuse to Settle',
  description:
    'Roar Fitness is a premium training studio in Colombo — where expert coaching, modern equipment, and a driven community come together to help you train with purpose and live with power.',
  missionEyebrow: 'Why we exist',
  missionLead: 'We believe fitness should feel',
  missionHighlight: 'intentional',
  missionMiddle: ', not intimidating. Every detail — from floor layout to class programming — is designed to help you',
  missionHighlight2: 'show up consistently',
  missionTrail: ' and leave stronger than you arrived.',
  journeyEyebrow: 'The journey',
  journeyTitle: 'From a single studio floor to a community that moves as one.',
  journeyBody:
    'What started as a focused strength studio has grown into a full-service fitness destination — group classes, personal coaching, recovery zones, and member experiences that keep people coming back.',
  ctaTitle: 'Ready to train with us?',
  ctaBody:
    'Join hundreds of members who train at Roar every week. Pick a plan, book a class, or visit the studio for a tour.',
  ctaPrimary: 'Become a Member',
  ctaSecondary: 'View Classes',
} as const

export const ABOUT_STATS = [
  { id: 'founded', value: '2018', label: 'Established' },
  { id: 'members', value: '250+', label: 'Active members' },
  { id: 'coaches', value: '8+', label: 'Expert coaches' },
  { id: 'classes', value: '40+', label: 'Weekly classes' },
] as const

export interface AboutValue {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export const ABOUT_VALUES: AboutValue[] = [
  {
    id: 'coaching',
    icon: Target,
    title: 'Purposeful coaching',
    description:
      'Certified trainers who meet you at your level, refine your form, and build plans that respect your goals and schedule.',
  },
  {
    id: 'community',
    icon: Users,
    title: 'Community energy',
    description:
      'A floor culture that feels focused, not chaotic — where members push each other and every session has momentum.',
  },
  {
    id: 'equipment',
    icon: Dumbbell,
    title: 'Premium equipment',
    description:
      'Strength racks, cardio zones, and functional training areas maintained to a standard you can feel on every rep.',
  },
  {
    id: 'wellness',
    icon: Heart,
    title: 'Whole-body wellness',
    description:
      'Recovery, mobility, and class variety so training stays sustainable — not just intense for a few weeks.',
  },
]

export const ABOUT_MILESTONES = [
  {
    id: '2018',
    year: '2018',
    title: 'Studio opens',
    body: 'Roar Fitness launches in Colombo 07 with a strength-first floor and a small team of dedicated coaches.',
  },
  {
    id: '2021',
    year: '2021',
    title: 'Classes & recovery',
    body: 'Group training, yoga, and recovery programming expand the member experience beyond the weight room.',
  },
  {
    id: '2024',
    year: '2024',
    title: '250+ members',
    body: 'The community crosses 250 active members with instructor-led sessions and digital member tools.',
  },
] as const

export const ABOUT_IMAGES = {
  hero: showcaseSlide3,
  journey: showcaseSlide2,
  accent: heroWorkout,
} as const
