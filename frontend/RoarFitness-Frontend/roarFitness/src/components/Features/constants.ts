import { Dumbbell, ShowerHead, UserCheck, type LucideIcon } from 'lucide-react'

export interface FeatureItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export const FEATURES_COPY = {
  eyebrow: 'MORE THAN A FITNESS',
  statement: {
    lead: 'Train with purpose in a space designed to',
    highlight1: 'inspire progress',
    middle: '. From expert coaching to',
    highlight2: 'world class equipment',
    trail:
      ', everything here is built to help you move better, grow stronger, and',
    highlight3: 'reach your full potential',
  },
} as const

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 'equipment',
    icon: Dumbbell,
    title: 'Modern Equipment',
    description:
      'Train with state-of-the-art machines and free weights designed to support every workout, from strength building to functional fitness.',
  },
  {
    id: 'training',
    icon: UserCheck,
    title: 'Professional Training',
    description:
      'Work with certified coaches who create personalized training plans, guide your technique, and keep you progressing toward your goals.',
  },
  {
    id: 'facilities',
    icon: ShowerHead,
    title: 'Premium Facilities',
    description:
      'Enjoy clean, spacious locker rooms, refreshing showers, and thoughtfully designed amenities that make every workout comfortable and convenient.',
  },
]
