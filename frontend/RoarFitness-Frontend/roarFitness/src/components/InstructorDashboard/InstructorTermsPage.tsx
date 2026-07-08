const SECTIONS = [
  {
    title: '1. Instructor accounts',
    body: 'Instructor accounts are created and managed by Roar Fitness administrators. Instructors do not self-register. Access is granted through role-based authentication on the shared login portal.',
  },
  {
    title: '2. Session management',
    body: 'Instructors are responsible for reviewing session enrollments, communicating schedule changes, and maintaining a safe training environment during sessions.',
  },
  {
    title: '3. Member plan requests',
    body: 'Meal and workout plan requests should be reviewed promptly. Plans are guidance only and do not replace professional medical advice.',
  },
  {
    title: '4. Conduct',
    body: 'Instructors must follow studio policies, treat members respectfully, and protect member personal information accessed through the portal.',
  },
] as const

export function InstructorTermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Legal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Terms
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Instructor portal policies and responsibilities.
        </p>
      </header>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-portal-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-portal-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
