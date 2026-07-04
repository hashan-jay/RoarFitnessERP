/** Static marketing content for the public Trainers and Sessions pages. */

export interface PublicTrainer {
  id: string;
  fullName: string;
  specialization: string;
}

export interface PublicVipSession {
  id: string;
  title: string;
  description: string;
}

export const PUBLIC_TRAINERS: PublicTrainer[] = [
  { id: '1', fullName: 'Amali Perera', specialization: 'Zumba & Dance Fitness' },
  { id: '2', fullName: 'Niroshan Silva', specialization: 'CrossFit' },
  { id: '3', fullName: 'Kavindi Jayawardena', specialization: 'Pilates' },
  { id: '4', fullName: 'Dilshan Fernando', specialization: 'Heavy Weight Training' },
  { id: '5', fullName: 'Anuki Ratnayake', specialization: 'Barre' },
  { id: '6', fullName: 'Rashmi Wickramasinghe', specialization: 'Strength & Conditioning' },
];

export const PUBLIC_VIP_SESSIONS: PublicVipSession[] = [
  {
    id: 'zumba',
    title: 'Zumba',
    description: 'High-energy dance fitness sessions that blend cardio, rhythm, and full-body movement.',
  },
  {
    id: 'barre',
    title: 'Barre',
    description: 'Low-impact strength and flexibility work inspired by ballet, pilates, and yoga.',
  },
  {
    id: 'pilates',
    title: 'Pilates',
    description: 'Core-focused sessions that improve posture, control, and muscular endurance.',
  },
  {
    id: 'crossfit',
    title: 'CrossFit',
    description: 'Functional training combining lifting, conditioning, and scalable WOD-style workouts.',
  },
  {
    id: 'heavy-weight',
    title: 'Heavy Weight',
    description: 'Structured strength blocks for progressive overload, technique, and power development.',
  },
];
