/**
 * About page describing Roar Fitness story, philosophy, and location.
 * Role: Public (unauthenticated visitors).
 */
import { PageHero } from '../../components/PageHero';
import { SectionHeader } from '../../components/SectionHeader';
import { Stagger, StaggerItem } from '../../components/motion';

const blocks = [
  { title: 'Our story', text: 'Founded in Colombo to give serious lifters a space without compromise — equipment, coaching, and a culture of showing up.' },
  { title: 'Philosophy', text: 'Fitness is discipline first. We built our systems — biometric access, integrated POS, membership portal — to remove friction so you can focus on the work.' },
  { title: 'Location', text: '123 Galle Road, Colombo 03. Open 6 AM – 11 PM daily. Fingerprint entry for all members.' },
  { title: 'Technology', text: 'Biometric access, integrated in-gym POS, and a member portal that keeps everything in one place.' },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Roar Fitness"
        description="A gym for people who train with intent."
      />
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="Background"
            title="Who we are"
            description="Strength, conditioning, and accountability under one roof."
            align="left"
          />
          <Stagger className="grid grid--2">
            {blocks.map((block, i) => (
              <StaggerItem key={block.title}>
                <div className="card card--interactive feature-card">
                  <div className="feature-card__index">{String(i + 1).padStart(2, '0')}</div>
                  <h3>{block.title}</h3>
                  <p>{block.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
