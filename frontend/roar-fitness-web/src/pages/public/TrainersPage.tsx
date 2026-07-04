/**
 * Static instructor directory for the public website.
 */
import { TrainerCard } from '../../components/TrainerCard';
import { PageHero } from '../../components/PageHero';
import { Stagger, StaggerItem } from '../../components/motion';
import { PUBLIC_TRAINERS } from '../../data/publicContent';

export function TrainersPage() {
  return (
    <>
      <PageHero
        eyebrow="COACHING"
        title="The team"
        description="Meet the Roar Fitness instructors who lead VIP sessions and member training plans."
      />
      <section className="section">
        <div className="container">
          <Stagger className="grid grid--3">
            {PUBLIC_TRAINERS.map((instructor) => (
              <StaggerItem key={instructor.id}>
                <TrainerCard instructor={instructor} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </>
  );
}
