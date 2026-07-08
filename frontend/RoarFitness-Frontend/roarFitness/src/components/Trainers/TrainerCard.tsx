import { TRAINERS_COPY, type Trainer } from './constants'

interface TrainerCardProps {
  trainer: Trainer
  index: number
  className?: string
}

/** Minimal profile card — sharp 1px frame, clean typography */
export function TrainerCard({ trainer, index, className = '' }: TrainerCardProps) {
  const indexLabel = String(index + 1).padStart(2, '0')

  return (
    <article
      className={`group flex h-full w-full flex-col overflow-hidden rounded-[1px] border border-white/10 bg-white/[0.02] transition-colors duration-300 hover:border-white/20 ${className}`.trim()}
    >
      <figure className="relative aspect-[5/6] shrink-0 overflow-hidden bg-neutral-900">
        <img
          key={trainer.image}
          src={trainer.image}
          alt={trainer.alt}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          width={500}
          height={600}
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index < 4 ? 'high' : 'auto'}
        />
      </figure>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-medium leading-snug tracking-[-0.01em] text-white sm:text-base">
              {trainer.name}
            </h3>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-features-muted">
              {trainer.role}
            </p>
          </div>
          <span className="shrink-0 font-display text-lg leading-none tracking-[0.06em] text-white/20">
            {indexLabel}
          </span>
        </div>

        <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-features-body">
          <span className="font-medium text-white/80">{trainer.yearsExperience}</span>{' '}
          {TRAINERS_COPY.experienceLabel}
        </p>

        <div className="mt-4 space-y-2.5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Qualifications
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {trainer.certifications.map((certification) => (
                <li key={certification}>
                  <span className="inline-flex rounded-[1px] border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-white/75">
                    {certification}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Specialties
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {trainer.specialties.map((specialty) => (
                <li key={specialty}>
                  <span className="inline-flex rounded-[1px] border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-white/65">
                    {specialty}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}
