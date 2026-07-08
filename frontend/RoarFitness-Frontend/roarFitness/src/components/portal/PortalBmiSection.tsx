import { BmiCalculator } from './BmiCalculator'

interface PortalBmiSectionProps {
  audience: 'member' | 'instructor'
}

const copy = {
  member: {
    subtitle:
      'Track your BMI and use it as a baseline for conversations with your instructor.',
    tips: [
      'Enter your current height and weight',
      'Watch the gauge update in real time',
      'Discuss your results during your next session',
    ],
  },
  instructor: {
    subtitle: 'Screen BMI during consultations and guide members toward healthy weight ranges.',
    tips: [
      'Use with members during check-ins',
      'Review the healthy weight range together',
      'Follow up with personalized plans in Workout / Meal Plans',
    ],
  },
} as const

export function PortalBmiSection({ audience }: PortalBmiSectionProps) {
  const content = copy[audience]

  return (
    <section className="portal-bmi-section grid gap-4 lg:grid-cols-2">
      <article className="portal-widget-3d rounded-xl border border-portal-line bg-portal-card p-5 sm:p-6">
        <p className="text-xs font-medium text-portal-muted">Health</p>
        <h2 className="mt-1 text-base font-semibold text-portal-ink">BMI Calculator</h2>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">{content.subtitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-portal-muted">
          Body Mass Index is a quick screening tool for weight relative to height. It is not a
          diagnosis — use it to start an informed conversation about fitness goals.
        </p>
        <ul className="portal-bmi-section__list mt-4 space-y-2">
          {content.tips.map((tip) => (
            <li key={tip} className="text-sm text-portal-muted">
              {tip}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-portal-line pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-portal-muted">
            Reference ranges
          </h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-portal-muted">Underweight</dt>
              <dd className="mt-0.5 font-medium text-portal-ink">&lt; 18.5</dd>
            </div>
            <div>
              <dt className="text-xs text-portal-muted">Normal</dt>
              <dd className="mt-0.5 font-medium text-portal-ink">18.5 – 24.9</dd>
            </div>
            <div>
              <dt className="text-xs text-portal-muted">Overweight</dt>
              <dd className="mt-0.5 font-medium text-portal-ink">25 – 29.9</dd>
            </div>
            <div>
              <dt className="text-xs text-portal-muted">Obese</dt>
              <dd className="mt-0.5 font-medium text-portal-ink">≥ 30</dd>
            </div>
          </dl>
        </div>
      </article>

      <article className="portal-widget-3d flex items-center justify-center rounded-xl border border-portal-line bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 p-5 sm:p-6">
        <BmiCalculator
          idPrefix={`${audience}-dashboard-bmi`}
          showScale
          showHealthyRange
        />
      </article>
    </section>
  )
}
