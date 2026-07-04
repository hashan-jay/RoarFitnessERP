/**
 * Hero banner for public sub-pages (about, packages, trainers, contact).
 * Role: Public layout.
 */
import { Reveal } from './motion';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <Reveal className="page-hero__inner">
          {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="page-hero__desc">{description}</p>}
        </Reveal>
      </div>
    </section>
  );
}
