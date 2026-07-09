export interface Testimonial {
  id: string
  quote: string
  result: string
  name: string
  role: string
}

export interface TestimonialStat {
  id: string
  value: string
  label: string
}

export const TESTIMONIALS_COPY = {
  eyebrow: 'Member Stories',
  headlineLead: 'Proof in every',
  headlineAccent: 'Rep & Result',
  description:
    'From first session to personal bests — hear how members train, recover, and transform at Roar.',
} as const

export const TESTIMONIAL_STATS: TestimonialStat[] = [
  { id: 'rating', value: '9.1', label: 'Member rating' },
  { id: 'members', value: '250+', label: 'Active members' },
  { id: 'retention', value: '98%', label: 'Renewal rate' },
]

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'amara',
    quote:
      'I walked in intimidated and left with a plan. Twelve weeks later I am stronger, leaner, and actually look forward to leg day.',
    result: '−14 kg · +40% strength',
    name: 'Amara Perera',
    role: 'Member · Strength Program',
  },
  {
    id: 'devin',
    quote:
      'The coaches do not just count reps — they teach form, push when it matters, and keep the floor feeling professional.',
    result: '6-month consistency streak',
    name: 'Devin Silva',
    role: 'Member · Personal Training',
  },
  {
    id: 'nisha',
    quote:
      'Group sessions have the energy of a team without the chaos. I found my rhythm here and never felt lost in a crowded gym.',
    result: '3 classes per week',
    name: 'Nisha Fernando',
    role: 'Member · Group Training',
  },
]
