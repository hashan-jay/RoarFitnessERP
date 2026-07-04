/**
 * Membership package card for public packages and join flows. Supports optional
 * selection mode for the multi-step registration wizard.
 */
import type { MembershipPackage } from '../types';

interface PackageCardProps {
  pkg: MembershipPackage;
  featured?: boolean;
  onSelect?: (pkg: MembershipPackage) => void;
  selected?: boolean;
  showSelect?: boolean;
}

function amenityLines(pkg: MembershipPackage): string[] {
  if (pkg.amenities?.trim()) {
    return pkg.amenities
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return ['Full gym access', 'Locker facilities', 'Fingerprint entry'];
}

export function PackageCard({
  pkg,
  featured,
  onSelect,
  selected,
  showSelect,
}: PackageCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(price);

  const isHighlighted = featured || pkg.isFeatured || selected;
  const features = amenityLines(pkg);

  return (
    <div className={`card package-card card--interactive ${isHighlighted ? 'package-card--featured' : ''}`}>
      {(featured || pkg.isFeatured) && <span className="badge badge--brand">Popular</span>}
      <h3>{pkg.packageName}</h3>
      {pkg.typeName && <p className="package-card__duration">{pkg.typeName}</p>}
      <div className="package-card__price">
        {formatPrice(pkg.priceLKR)}
        <span> / {pkg.durationDays} days</span>
      </div>
      {pkg.description && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: 'var(--spacing-md)' }}>
          {pkg.description}
        </p>
      )}
      <ul className="package-card__features">
        {features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {showSelect && onSelect && (
        <button
          type="button"
          className={`btn ${selected ? 'btn--primary' : 'btn--outline'} btn--block`}
          onClick={() => onSelect(pkg)}
        >
          {selected ? 'Selected ✓' : 'Select Package'}
        </button>
      )}
    </div>
  );
}
