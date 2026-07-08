const TERMS_SECTIONS = [
  {
    title: '1. Membership',
    body: 'Your membership grants access to Roar Fitness facilities and services according to the plan you purchased. Membership is personal and non-transferable. You must present valid member identification when requested by staff.',
  },
  {
    title: '2. Facility use',
    body: 'Members must follow studio rules, respect equipment, and maintain a safe training environment. Inappropriate conduct, misuse of equipment, or failure to follow staff instructions may result in suspension or termination of membership without refund.',
  },
  {
    title: '3. Classes and bookings',
    body: 'Class bookings are subject to availability. Please cancel bookings you cannot attend so other members can reserve a spot. Repeated no-shows may limit future booking privileges.',
  },
  {
    title: '4. Instructor plans',
    body: 'Meal and workout plan requests submitted through the member portal are reviewed by instructors. Delivery timelines may vary. Plans are guidance only and do not replace professional medical or nutritional advice.',
  },
  {
    title: '5. Health and safety',
    body: 'You are responsible for ensuring you are medically fit to train. Inform staff of any injuries or conditions that may affect your participation. Train within your limits and use equipment correctly.',
  },
  {
    title: '6. Payments and renewals',
    body: 'Membership fees are due according to your selected billing cycle. Non-payment may result in suspended access. Renewal terms follow the plan details shown at purchase unless otherwise agreed in writing.',
  },
  {
    title: '7. Privacy',
    body: 'We collect and process personal information needed to operate your membership, bookings, and plan requests. Your data is handled in line with applicable privacy laws and is not sold to third parties.',
  },
  {
    title: '8. Changes to terms',
    body: 'Roar Fitness may update these terms from time to time. Continued use of the member portal and facilities after updates constitutes acceptance of the revised terms.',
  },
] as const

export function MemberTermsContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="border-b border-portal-line pb-6">
        <p className="text-xs font-medium text-portal-muted">Legal</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-portal-ink sm:text-3xl">
          Terms of use
        </h1>
        <p className="mt-2 text-sm text-portal-muted">
          Membership policies and conditions for Roar Fitness members.
        </p>
      </header>

      <div className="space-y-6">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-sm font-semibold text-portal-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-portal-muted">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <p className="border-t border-portal-line pt-6 text-xs text-portal-muted">
        Last updated: July 2026. Questions? Contact the front desk or email
        support@roarfitness.lk.
      </p>
    </div>
  )
}
