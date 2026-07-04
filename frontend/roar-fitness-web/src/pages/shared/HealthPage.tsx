/**
 * Health panel with animated BMI calculator for member and instructor portals.
 */
import { BmiCalculator } from '../../components/BmiCalculator';
import { Reveal } from '../../components/motion';

interface HealthPageProps {
  audience: 'member' | 'instructor';
}

const copy = {
  member: {
    subtitle: 'Track your BMI and use it as a baseline for conversations with your instructor.',
    tips: [
      'Enter your current height and weight',
      'Watch the gauge update in real time',
      'Discuss your results during your next session',
    ],
  },
  instructor: {
    subtitle: 'Screen BMI during consultations and guide members toward healthy weight ranges.',
    tips: [
      'Use with members during check-ins',
      'Review the healthy weight range together',
      'Follow up with personalized plans in Member Plans',
    ],
  },
} as const;

export function HealthPage({ audience }: HealthPageProps) {
  const content = copy[audience];

  return (
    <>
      <div className="page-title">
        <h1>Health</h1>
        <p>{content.subtitle}</p>
      </div>

      <div className="health-section health-section--portal">
        <Reveal className="card health-section__intro">
          <h3>BMI Calculator</h3>
          <p>
            Body Mass Index is a quick screening tool for weight relative to height. It is not a
            diagnosis — use it to start an informed conversation about fitness goals.
          </p>
          <ul className="health-section__list">
            {content.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="health-reference">
            <h4>Reference ranges</h4>
            <dl className="health-reference__grid">
              <div><dt>Underweight</dt><dd>&lt; 18.5</dd></div>
              <div><dt>Normal</dt><dd>18.5 – 24.9</dd></div>
              <div><dt>Overweight</dt><dd>25 – 29.9</dd></div>
              <div><dt>Obese</dt><dd>≥ 30</dd></div>
            </dl>
          </div>
        </Reveal>

        <Reveal className="card health-section__calculator" delay={0.08}>
          <BmiCalculator
            idPrefix={`${audience}-health-bmi`}
            showScale
            showHealthyRange
          />
        </Reveal>
      </div>
    </>
  );
}
