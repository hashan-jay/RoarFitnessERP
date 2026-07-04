/**
 * Shared terms and conditions content rendered on member and instructor terms pages.
 */
const sections = [
  {
    title: '1. Membership & Access',
    body: 'Membership grants access to Roar Fitness facilities during operating hours. Fingerprint enrollment is required for gym entry. Membership is personal and non-transferable.',
  },
  {
    title: '2. Payments & Renewals',
    body: 'Fees must be paid in full before access is granted. Failed or overdue payments may result in suspended access until the account is settled.',
  },
  {
    title: '3. Health & Safety',
    body: 'Members and instructors must disclose relevant medical conditions. Roar Fitness is not liable for injuries resulting from improper equipment use or failure to follow staff guidance.',
  },
  {
    title: '4. Conduct',
    body: 'Respectful behaviour toward staff and other members is required. Harassment, vandalism, or misuse of equipment may lead to immediate membership termination.',
  },
  {
    title: '5. Emergency Contact',
    body: 'You agree to keep your emergency contact details up to date in profile settings so gym staff can reach your contact person if needed during an incident.',
  },
  {
    title: '6. Privacy',
    body: 'Personal data is used for membership administration, attendance, and safety. We do not sell your information to third parties.',
  },
  {
    title: '7. Changes',
    body: 'Roar Fitness may update these terms. Continued use of the portal after updates constitutes acceptance of the revised terms.',
  },
];

export function TermsContent() {
  return (
    <div className="terms-content">
      <p className="terms-content__intro">
        Last updated: June 2026. Please read these Terms and Conditions carefully before using the Roar Fitness portal.
      </p>
      {sections.map((section) => (
        <section key={section.title} className="terms-content__section">
          <h3>{section.title}</h3>
          <p>{section.body}</p>
        </section>
      ))}
    </div>
  );
}
