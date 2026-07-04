/**
 * Reusable section heading with optional eyebrow and description for public pages.
 * Role: Public layout.
 */
import { Reveal } from './motion';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  return (
    <Reveal className={`section__header section__header--${align} ${className}`.trim()}>
      {eyebrow && <span className="section__eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </Reveal>
  );
}
