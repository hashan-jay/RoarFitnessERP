import {
  classCardio,
  classCrossfit,
  classPilates,
  classStrength,
  classYoga,
} from '../../assets/images/classes'

export interface FitnessClass {
  id: string
  number: string
  title: string
  description: string
  image: string
  alt: string
}

export const CLASSES_COPY = {
  eyebrow: 'OUR FITNESS CLASSES',
  cta: 'Join a Class',
} as const

export const FITNESS_CLASSES: FitnessClass[] = [
  {
    id: 'cardio',
    number: '01',
    title: 'Cardio Classes',
    description:
      'High-energy sessions designed to boost endurance, burn calories, and improve cardiovascular health through dynamic, instructor-led workouts.',
    image: classCardio,
    alt: 'Members participating in a high-intensity cardio class',
  },
  {
    id: 'strength',
    number: '02',
    title: 'Strength Training',
    description:
      'Build lean muscle and functional power with structured programs using free weights, machines, and progressive overload techniques.',
    image: classStrength,
    alt: 'Athlete performing strength training with dumbbells',
  },
  {
    id: 'yoga',
    number: '03',
    title: 'Yoga',
    description:
      'Restore balance and flexibility through mindful movement, controlled breathing, and flows that support recovery and mental clarity.',
    image: classYoga,
    alt: 'Instructor leading a calm yoga session in a studio',
  },
  {
    id: 'pilates',
    number: '04',
    title: 'Pilates',
    description:
      'Strengthen your core, improve posture, and enhance body control with precise, low-impact movements guided by expert coaches.',
    image: classPilates,
    alt: 'Member practicing pilates on a reformer',
  },
  {
    id: 'crossfit',
    number: '05',
    title: 'CrossFit',
    description:
      'Push your limits with varied, high-intensity functional training that combines strength, conditioning, and team-driven motivation.',
    image: classCrossfit,
    alt: 'Athletes training together in a CrossFit workout',
  },
  {
    id: 'zumba',
    number: '06',
    title: 'Zumba',
    description:
      'Dance-fitness sessions blending Latin rhythms and cardio intervals — high energy, easy to follow, and built for all fitness levels.',
    image: classCardio,
    alt: 'Members enjoying a high-energy Zumba dance fitness class',
  },
]
