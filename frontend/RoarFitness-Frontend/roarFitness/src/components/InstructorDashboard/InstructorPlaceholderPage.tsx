interface InstructorPlaceholderPageProps {
  title: string
  description: string
}

export function InstructorPlaceholderPage({
  title,
  description,
}: InstructorPlaceholderPageProps) {
  return (
    <div className="max-w-2xl">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Instructor portal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-portal-muted">{description}</p>
      </header>
      <div className="portal-widget-3d mt-8 rounded-xl border border-dashed border-portal-line bg-portal-card px-5 py-12 text-center">
        <p className="text-sm font-medium text-portal-ink">Ready for backend</p>
        <p className="mt-1 text-sm text-portal-muted">
          This section will connect to role-based API data.
        </p>
      </div>
    </div>
  )
}
