import { useEffect, useMemo, useState } from 'react'

type BmiCategory = {
  label: string
  color: string
  max: number
  min: number
}

const categories: BmiCategory[] = [
  { label: 'Underweight', color: '#3b82f6', min: 0, max: 18.5 },
  { label: 'Normal', color: '#059669', min: 18.5, max: 25 },
  { label: 'Overweight', color: '#d97706', min: 25, max: 30 },
  { label: 'Obese', color: '#dc2626', min: 30, max: 50 },
]

interface BmiCalculatorProps {
  idPrefix?: string
  showScale?: boolean
  showHealthyRange?: boolean
}

function getCategory(bmi: number): BmiCategory {
  return categories.find((category) => bmi < category.max) ?? categories[categories.length - 1]
}

function parseInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

const inputClass =
  'w-full rounded-lg border border-portal-line bg-portal-canvas px-3 py-2.5 text-sm text-portal-ink outline-none transition focus:border-portal-ink'

export function BmiCalculator({
  idPrefix = 'bmi',
  showScale = false,
  showHealthyRange = false,
}: BmiCalculatorProps) {
  const [heightInput, setHeightInput] = useState('')
  const [weightInput, setWeightInput] = useState('')
  const [displayBmi, setDisplayBmi] = useState(0)
  const [animated, setAnimated] = useState(false)

  const heightCm = parseInput(heightInput)
  const weightKg = parseInput(weightInput)

  const bmi = useMemo(() => {
    if (heightCm === null || weightKg === null) return 0
    const heightM = heightCm / 100
    return weightKg / (heightM * heightM)
  }, [heightCm, weightKg])

  const category = getCategory(bmi > 0 ? bmi : 18)
  const gaugePercent = bmi > 0 ? Math.min((bmi / 40) * 100, 100) : 0
  const scaleMarkerPercent = bmi > 0 ? Math.min(Math.max((bmi / 40) * 100, 2), 98) : 0
  const hasValidInput = heightCm !== null && weightKg !== null

  const healthyRange = useMemo(() => {
    if (heightCm === null) return null
    const heightM = heightCm / 100
    return {
      minKg: 18.5 * heightM * heightM,
      maxKg: 24.9 * heightM * heightM,
    }
  }, [heightCm])

  useEffect(() => {
    setAnimated(false)
    const timer = window.setTimeout(() => {
      setDisplayBmi(bmi)
      setAnimated(true)
    }, 80)
    return () => window.clearTimeout(timer)
  }, [bmi])

  const heightId = `${idPrefix}-height`
  const weightId = `${idPrefix}-weight`

  return (
    <div className="portal-bmi-calculator">
      <div className="portal-bmi-calculator__gauge">
        <svg viewBox="0 0 120 120" className="portal-bmi-calculator__ring" aria-hidden="true">
          <circle cx="60" cy="60" r="52" className="portal-bmi-calculator__ring-bg" />
          <circle
            cx="60"
            cy="60"
            r="52"
            className="portal-bmi-calculator__ring-fill"
            style={{
              stroke: hasValidInput ? category.color : '#d1d5db',
              strokeDashoffset: `${328 - (328 * gaugePercent) / 100}`,
              transition: animated ? 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' : 'none',
            }}
          />
        </svg>
        <div className="portal-bmi-calculator__value">
          <span
            className="portal-bmi-calculator__number"
            style={{
              color: hasValidInput ? category.color : '#9ca3af',
              transition: 'color 0.4s ease, transform 0.4s ease',
              transform: animated && hasValidInput ? 'scale(1)' : 'scale(0.96)',
            }}
          >
            {hasValidInput && displayBmi > 0 ? displayBmi.toFixed(1) : '—'}
          </span>
          <span className="portal-bmi-calculator__label">BMI</span>
        </div>
      </div>

      <div
        className="portal-bmi-calculator__category"
        style={{
          backgroundColor: hasValidInput ? `${category.color}18` : '#f3f4f6',
          color: hasValidInput ? category.color : '#6b7280',
          transition: 'background-color 0.4s ease, color 0.4s ease',
        }}
      >
        {hasValidInput ? category.label : 'Enter height and weight'}
      </div>

      {showScale && (
        <div className="portal-bmi-calculator__scale-wrap">
          <div className="portal-bmi-calculator__scale">
            {categories.map((item) => (
              <div
                key={item.label}
                className={`portal-bmi-calculator__scale-segment${
                  hasValidInput && category.label === item.label
                    ? ' portal-bmi-calculator__scale-segment--active'
                    : ''
                }`}
                style={{
                  backgroundColor: item.color,
                  transition: animated ? 'opacity 0.45s ease, transform 0.45s ease' : 'none',
                }}
                title={`${item.label}: ${item.min}–${item.max === 50 ? '40+' : item.max}`}
              />
            ))}
            {hasValidInput && (
              <span
                className="portal-bmi-calculator__scale-marker"
                style={{
                  left: `${scaleMarkerPercent}%`,
                  borderTopColor: category.color,
                  transition: animated ? 'left 0.6s ease, border-top-color 0.4s ease' : 'none',
                }}
                aria-hidden="true"
              />
            )}
          </div>
          <div className="portal-bmi-calculator__scale-labels">
            {categories.map((item) => (
              <span
                key={item.label}
                style={{
                  color: hasValidInput && category.label === item.label ? item.color : undefined,
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="portal-bmi-calculator__inputs">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-left">
            <span className="mb-1.5 block text-xs font-medium text-portal-muted">Height (cm)</span>
            <input
              id={heightId}
              type="number"
              min={1}
              step={0.1}
              placeholder="e.g. 170"
              value={heightInput}
              onChange={(event) => setHeightInput(event.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-left">
            <span className="mb-1.5 block text-xs font-medium text-portal-muted">Weight (kg)</span>
            <input
              id={weightId}
              type="number"
              min={1}
              step={0.1}
              placeholder="e.g. 70"
              value={weightInput}
              onChange={(event) => setWeightInput(event.target.value)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {hasValidInput && (
        <p className="portal-bmi-calculator__formula">
          BMI = {weightKg} ÷ ({heightCm! / 100})² = <strong>{bmi.toFixed(1)}</strong>
        </p>
      )}

      {showHealthyRange && healthyRange && hasValidInput && (
        <p className="portal-bmi-calculator__range">
          Healthy weight range for your height:{' '}
          <strong>
            {healthyRange.minKg.toFixed(1)} – {healthyRange.maxKg.toFixed(1)} kg
          </strong>
        </p>
      )}

      <p className="portal-bmi-calculator__note">
        Results update instantly as you type. BMI is a screening tool — consult a Roar Fitness
        trainer for a full assessment.
      </p>
    </div>
  )
}
