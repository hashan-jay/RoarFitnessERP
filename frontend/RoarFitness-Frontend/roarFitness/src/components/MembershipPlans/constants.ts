export interface MembershipPlan {
  id: string
  name: string
  price: number
  period: '/ Month' | '/ Quarter' | '/ Year'
  description: string
  features: string[]
  cta: string
  isPopular?: boolean
}

export const MEMBERSHIP_COPY = {
  eyebrow: 'MEMBERSHIP PLANS',
  headlineLead: 'Choose the Plan',
  headlineAccent: 'That Fits Your Goals',
  description:
    'Flexible memberships designed for every fitness level — from first-time gym-goers to dedicated athletes.',
  popularBadge: 'Most Popular',
} as const

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'starter-monthly',
    name: 'Starter Monthly',
    price: 4500,
    period: '/ Month',
    description:
      'Flexible month-to-month access — ideal for getting started without a long commitment.',
    features: [
      'Full gym floor access',
      'Locker room & showers',
      'Standard equipment use',
      'Member welcome orientation',
    ],
    cta: 'Join Now',
  },
  {
    id: 'power-quarterly',
    name: 'Power Quarterly',
    price: 12000,
    period: '/ Quarter',
    description:
      'Three months of structured training with added class access and coaching support.',
    features: [
      'All Starter benefits',
      'Unlimited group classes',
      'Personalized workout plan',
      'Recovery zone access',
      'Monthly coach check-in',
    ],
    cta: 'Join Now',
    isPopular: true,
  },
  {
    id: 'roar-annual-elite',
    name: 'Roar Annual Elite',
    price: 120000,
    period: '/ Year',
    description:
      'Our flagship annual membership — maximum value, exclusivity, and premium coaching.',
    features: [
      'All Power Quarterly benefits',
      '4 personal training sessions',
      'Nutrition guidance sessions',
      'Spa & recovery lounge access',
      'Exclusive member events',
      'Guest passes (2 per month)',
    ],
    cta: 'Join Now',
  },
]

export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK')}`
}

/** Prefer `getPackageById` from packageStorage for admin-managed packages. */
export function getPlanById(planId: string): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((plan) => plan.id === planId)
}
