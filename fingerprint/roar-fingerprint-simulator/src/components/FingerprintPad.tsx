interface FingerprintPadProps {
  scanning?: boolean;
  success?: boolean;
  denied?: boolean;
  onScan?: () => void;
  disabled?: boolean;
  label?: string;
}

export function FingerprintPad({
  scanning = false,
  success = false,
  denied = false,
  onScan,
  disabled = false,
  label = 'Place finger to scan',
}: FingerprintPadProps) {
  const stateClass = scanning
    ? 'fp-pad--scanning'
    : success
      ? 'fp-pad--success'
      : denied
        ? 'fp-pad--denied'
        : '';

  return (
    <button
      type="button"
      className={`fp-pad ${stateClass}`}
      onClick={onScan}
      disabled={disabled || scanning}
      aria-label={label}
    >
      <svg className="fp-pad__icon" viewBox="0 0 120 120" aria-hidden="true">
        <path
          className="fp-pad__ridge fp-pad__ridge--1"
          d="M60 18 C42 18 28 32 28 50 C28 68 36 78 36 92"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="fp-pad__ridge fp-pad__ridge--2"
          d="M60 24 C48 24 38 36 38 50 C38 64 44 72 44 88"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="fp-pad__ridge fp-pad__ridge--3"
          d="M60 30 C52 30 46 40 46 50 C46 60 50 68 50 82"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="fp-pad__ridge fp-pad__ridge--4"
          d="M82 22 C94 34 96 48 94 64 C92 78 88 88 86 96"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          className="fp-pad__ridge fp-pad__ridge--5"
          d="M76 28 C84 36 86 48 84 60 C82 72 78 80 76 88"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="60" cy="58" rx="14" ry="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
      <span className="fp-pad__label">{scanning ? 'Scanning…' : label}</span>
      {scanning && <span className="fp-pad__pulse" />}
    </button>
  );
}
