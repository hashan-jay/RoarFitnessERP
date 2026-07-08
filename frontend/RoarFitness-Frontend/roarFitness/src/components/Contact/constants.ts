export interface ContactDetail {
  id: string
  label: string
  value: string
  href?: string
}

export interface ContactHour {
  id: string
  days: string
  hours: string
}

export const CONTACT_COPY = {
  eyebrow: 'Visit Us',
  headlineLead: 'Find your way to',
  headlineAccent: 'Roar Fitness',
  description:
    'Stop by for a tour, ask about memberships, or book your first session — our team is ready when you are.',
  formTitle: 'Send a message',
  formDescription: 'Share your goals or questions. We typically respond within one business day.',
  submitLabel: 'Send Message',
  directionsLabel: 'Get Directions',
  mapTitle: 'Studio location',
  studioCode: 'CMB · 07',
} as const

export const CONTACT_ADDRESS = {
  line1: '42 Independence Avenue',
  line2: 'Colombo 07, Sri Lanka',
} as const

export const CONTACT_DETAILS: ContactDetail[] = [
  {
    id: 'phone',
    label: 'Phone',
    value: '+94 11 234 5678',
    href: 'tel:+94112345678',
  },
  {
    id: 'email',
    label: 'Email',
    value: 'hello@roarfitness.lk',
    href: 'mailto:hello@roarfitness.lk',
  },
]

export const CONTACT_HOURS: ContactHour[] = [
  { id: 'weekdays', days: 'Mon – Fri', hours: '5:30 AM – 10:00 PM' },
  { id: 'weekend', days: 'Sat – Sun', hours: '6:00 AM – 8:00 PM' },
]

/** Google Maps embed — zoomed studio view, Colombo */
export const CONTACT_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798509574308!2d79.861243!3d6.9147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae253c12989c0c3%3A0x879ba492f8c3e7f!2sIndependence%20Ave%2C%20Colombo!5e0!3m2!1sen!2slk!4v1719400000000!5m2!1sen!2slk'

export const CONTACT_MAP_DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=42+Independence+Avenue+Colombo+07+Sri+Lanka'

export const CONTACT_FORM_FIELDS = {
  name: { label: 'Full name', placeholder: 'Your name' },
  email: { label: 'Email', placeholder: 'you@email.com' },
  phone: { label: 'Phone', placeholder: '+94 77 000 0000' },
  message: { label: 'Message', placeholder: 'Tell us how we can help…' },
} as const
