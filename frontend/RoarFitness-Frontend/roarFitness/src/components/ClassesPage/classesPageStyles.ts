import type { ClassType } from './scheduleCatalog'

export const CLASS_TYPE_STYLES: Record<
  ClassType,
  { stripe: string; pill: string; pillText: string }
> = {
  Cardio: {
    stripe: 'bg-[#c45c4a]',
    pill: 'bg-[#c45c4a]/10 border-[#c45c4a]/20',
    pillText: 'text-[#9a4335]',
  },
  Strength: {
    stripe: 'bg-[#b8860b]',
    pill: 'bg-[#b8860b]/10 border-[#b8860b]/25',
    pillText: 'text-[#8a6508]',
  },
  Yoga: {
    stripe: 'bg-[#5a7a6b]',
    pill: 'bg-[#5a7a6b]/10 border-[#5a7a6b]/20',
    pillText: 'text-[#3f574c]',
  },
  Pilates: {
    stripe: 'bg-[#7a6b8a]',
    pill: 'bg-[#7a6b8a]/10 border-[#7a6b8a]/20',
    pillText: 'text-[#5c4f68]',
  },
  CrossFit: {
    stripe: 'bg-[#c4693a]',
    pill: 'bg-[#c4693a]/10 border-[#c4693a]/20',
    pillText: 'text-[#9a522d]',
  },
  Zumba: {
    stripe: 'bg-[#d14f7a]',
    pill: 'bg-[#d14f7a]/10 border-[#d14f7a]/20',
    pillText: 'text-[#a83a5e]',
  },
  Barre: {
    stripe: 'bg-[#8a7a9b]',
    pill: 'bg-[#8a7a9b]/10 border-[#8a7a9b]/20',
    pillText: 'text-[#6a5d78]',
  },
}

const DEFAULT_TYPE_STYLE = CLASS_TYPE_STYLES.Cardio

export const VIP_SESSION_STYLES = {
  stripe: 'bg-[#c9a227]',
  pill: 'bg-[#c9a227]/15 border-[#c9a227]/35',
  pillText: 'text-[#8a6508]',
  card: 'border-[#c9a227]/35 bg-[linear-gradient(135deg,rgba(201,162,39,0.12)_0%,rgba(255,255,255,1)_55%)] shadow-[0_12px_32px_rgba(201,162,39,0.12)]',
  dot: 'bg-[#c9a227] shadow-[0_0_0_3px_rgba(201,162,39,0.18)]',
} as const

export function getClassTypeStyles(classType: string) {
  if (classType === 'VIP Session') return VIP_SESSION_STYLES
  return (
    CLASS_TYPE_STYLES[classType as keyof typeof CLASS_TYPE_STYLES] ?? DEFAULT_TYPE_STYLE
  )
}
