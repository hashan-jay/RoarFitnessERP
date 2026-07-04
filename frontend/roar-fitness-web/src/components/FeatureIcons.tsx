interface IconProps {
  className?: string;
}

export function DumbbellIcon({ className = 'feature-icon' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M8 20v8M12 18v12M36 18v12M40 20v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 24h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CoachIcon({ className = 'feature-icon' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="14" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M14 38c0-6 4.5-10 10-10s10 4 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 22l6-4M32 28l8 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FacilityIcon({ className = 'feature-icon' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M16 10v8M32 10v8M24 8v28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18h24v4H12zM14 22v16M34 22v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 38h28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
