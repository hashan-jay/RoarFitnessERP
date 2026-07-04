/**
 * Interactive BMI calculator with animated gauge, category scale, and optional
 * healthy weight range. Used on the public site and member/instructor Health panels.
 */
import { useEffect, useMemo, useState } from 'react';

type BmiCategory = {
  label: string;
  color: string;
  max: number;
  min: number;
};

const categories: BmiCategory[] = [
  { label: 'Underweight', color: '#3b82f6', min: 0, max: 18.5 },
  { label: 'Normal', color: '#22c55e', min: 18.5, max: 25 },
  { label: 'Overweight', color: '#f59e0b', min: 25, max: 30 },
  { label: 'Obese', color: '#ef4444', min: 30, max: 50 },
];

interface BmiCalculatorProps {
  idPrefix?: string;
  showScale?: boolean;
  showHealthyRange?: boolean;
}

function getCategory(bmi: number): BmiCategory {
  return categories.find((c) => bmi < c.max) ?? categories[categories.length - 1];
}

function parseInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function BmiCalculator({
  idPrefix = 'bmi',
  showScale = false,
  showHealthyRange = false,
}: BmiCalculatorProps) {
  const [heightInput, setHeightInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [displayBmi, setDisplayBmi] = useState(0);
  const [animated, setAnimated] = useState(false);

  const heightCm = parseInput(heightInput);
  const weightKg = parseInput(weightInput);

  const bmi = useMemo(() => {
    if (heightCm === null || weightKg === null) return 0;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }, [heightCm, weightKg]);

  const category = getCategory(bmi > 0 ? bmi : 18);
  const gaugePercent = bmi > 0 ? Math.min((bmi / 40) * 100, 100) : 0;
  const scaleMarkerPercent = bmi > 0 ? Math.min(Math.max((bmi / 40) * 100, 2), 98) : 0;
  const hasValidInput = heightCm !== null && weightKg !== null;

  const healthyRange = useMemo(() => {
    if (heightCm === null) return null;
    const heightM = heightCm / 100;
    const minKg = 18.5 * heightM * heightM;
    const maxKg = 24.9 * heightM * heightM;
    return { minKg, maxKg };
  }, [heightCm]);

  // Defer gauge animation slightly so stroke transition runs after value updates.
  useEffect(() => {
    setAnimated(false);
    const timer = window.setTimeout(() => {
      setDisplayBmi(bmi);
      setAnimated(true);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [bmi]);

  const heightId = `${idPrefix}-height`;
  const weightId = `${idPrefix}-weight`;

  return (
    <div className="bmi-calculator">
      <div className="bmi-calculator__gauge">
        <svg viewBox="0 0 120 120" className="bmi-calculator__ring">
          <circle cx="60" cy="60" r="52" className="bmi-calculator__ring-bg" />
          <circle
            cx="60"
            cy="60"
            r="52"
            className="bmi-calculator__ring-fill"
            style={{
              stroke: hasValidInput ? category.color : 'var(--color-gray-300)',
              strokeDashoffset: `${328 - (328 * gaugePercent) / 100}`,
              transition: animated ? 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' : 'none',
            }}
          />
        </svg>
        <div className="bmi-calculator__value">
          <span
            className="bmi-calculator__number"
            style={{
              color: hasValidInput ? category.color : 'var(--color-gray-400)',
              transition: 'color 0.4s ease, transform 0.4s ease',
              transform: animated && hasValidInput ? 'scale(1)' : 'scale(0.96)',
            }}
          >
            {hasValidInput && displayBmi > 0 ? displayBmi.toFixed(1) : '—'}
          </span>
          <span className="bmi-calculator__label">BMI</span>
        </div>
      </div>

      <div
        className="bmi-calculator__category"
        style={{
          backgroundColor: hasValidInput ? `${category.color}20` : 'var(--color-gray-100)',
          color: hasValidInput ? category.color : 'var(--color-text-muted)',
          transition: 'background-color 0.4s ease, color 0.4s ease',
        }}
      >
        {hasValidInput ? category.label : 'Enter height and weight'}
      </div>

      {showScale && (
        <div className="bmi-calculator__scale-wrap">
          <div className="bmi-calculator__scale">
            {categories.map((item) => (
              <div
                key={item.label}
                className={`bmi-calculator__scale-segment${hasValidInput && category.label === item.label ? ' bmi-calculator__scale-segment--active' : ''}`}
                style={{
                  backgroundColor: item.color,
                  transition: animated ? 'opacity 0.45s ease, transform 0.45s ease' : 'none',
                }}
                title={`${item.label}: ${item.min}–${item.max === 50 ? '40+' : item.max}`}
              />
            ))}
            {hasValidInput && (
              <span
                className="bmi-calculator__scale-marker"
                style={{
                  left: `${scaleMarkerPercent}%`,
                  borderColor: category.color,
                  transition: animated ? 'left 0.6s ease, border-color 0.4s ease' : 'none',
                }}
                aria-hidden
              />
            )}
          </div>
          <div className="bmi-calculator__scale-labels">
            {categories.map((item) => (
              <span
                key={item.label}
                style={{ color: hasValidInput && category.label === item.label ? item.color : undefined }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bmi-calculator__inputs">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={heightId}>Height (cm)</label>
            <input
              id={heightId}
              type="number"
              min={1}
              step={0.1}
              placeholder="e.g. 170"
              value={heightInput}
              onChange={(e) => setHeightInput(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={weightId}>Weight (kg)</label>
            <input
              id={weightId}
              type="number"
              min={1}
              step={0.1}
              placeholder="e.g. 70"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
          </div>
        </div>
      </div>

      {hasValidInput && (
        <p className="bmi-calculator__formula">
          BMI = {weightKg} ÷ ({heightCm! / 100})² = <strong>{bmi.toFixed(1)}</strong>
        </p>
      )}

      {showHealthyRange && healthyRange && hasValidInput && (
        <p className="bmi-calculator__range">
          Healthy weight range for your height:{' '}
          <strong>
            {healthyRange.minKg.toFixed(1)} – {healthyRange.maxKg.toFixed(1)} kg
          </strong>
        </p>
      )}

      <p className="bmi-calculator__note">
        Results update instantly as you type. BMI is a screening tool — consult a Roar Fitness trainer for a full assessment.
      </p>
    </div>
  );
}
