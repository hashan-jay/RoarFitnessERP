/**
 * Instructor profile card for the public trainers directory.
 */
import type { PublicTrainer } from '../data/publicContent';

export function TrainerCard({ instructor }: { instructor: PublicTrainer }) {
  const initials = instructor.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="card trainer-card card--interactive">
      <div className="trainer-card__avatar">{initials}</div>
      <h3>{instructor.fullName}</h3>
      <p className="trainer-card__specs">{instructor.specialization}</p>
    </div>
  );
}
