import {
  showcaseSlide1,
  showcaseSlide2,
  showcaseSlide3,
  showcaseSlide4,
  showcaseSlide5,
} from '../../assets/images/showcase'

export interface ShowcaseSlide {
  id: string
  title: string
  category: string
  image: string
  alt: string
}

export const SHOWCASE_COPY = {
  eyebrow: 'DESIGNED FOR PERFORMANCE',
  headlineLead: 'More Than a Gym',
  headlineAccent: 'Built for Progress',
  subtitle:
    'Explore the spaces, equipment, and experiences that define the Roar standard — built for focus, intensity, and real progress.',
} as const

export const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'personal-training',
    title: 'Personal Training',
    category: '1 ON 1 TRAINING SESSIONS',
    image: showcaseSlide1,
    alt: 'Athlete performing a dumbbell workout with a coach',
  },
  {
    id: 'gym-equipment',
    title: 'GYM Equipments',
    category: 'PREMIUM FITNESS GEAR',
    image: showcaseSlide2,
    alt: 'Premium hexagonal dumbbells on a gym floor',
  },
  {
    id: 'group-training',
    title: 'Group Training',
    category: 'TEAM FITNESS CLASSES',
    image: showcaseSlide3,
    alt: 'Member training with dumbbells in a group session',
  },
  {
    id: 'exercise-machines',
    title: 'Ladies Section',
    category: 'DEDICATED WOMEN\'S AREA',
    image: showcaseSlide4,
    alt: 'Row of modern cardio machines in a bright gym',
  },
  {
    id: 'strength-training',
    title: 'Recovery Zone',
    category: 'RECOVER • REBUILD • PERFORM',
    image: showcaseSlide5,
    alt: 'Athlete focused on strength and conditioning',
  },
]

export const SHOWCASE_SWIPE_THRESHOLD = 48
