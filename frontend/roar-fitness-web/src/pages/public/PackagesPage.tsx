/**
 * Public membership packages listing with links to the join flow.
 * Role: Public (unauthenticated visitors).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicService } from '../../services';
import { PackageCard } from '../../components/PackageCard';
import { PageHero } from '../../components/PageHero';
import { LoadingSpinner } from '../../components/common';
import { Reveal, Stagger, StaggerItem } from '../../components/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { MembershipPackage } from '../../types';

const fallbackPackages: MembershipPackage[] = [
  { packageId: 1, packageName: 'Starter Monthly', description: 'Full gym access, locker, basic orientation', durationDays: 30, priceLKR: 8500, typeName: 'Monthly' },
  { packageId: 2, packageName: 'Power Quarterly', description: 'Full access + 2 PT sessions/month', durationDays: 90, priceLKR: 22000, typeName: 'Quarterly' },
  { packageId: 3, packageName: 'Roar Annual Elite', description: 'Unlimited access + nutrition consult + merch discount', durationDays: 365, priceLKR: 75000, typeName: 'Annual' },
];

export function PackagesPage() {
  const [packages, setPackages] = useState<MembershipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    publicService
      .getPackages()
      .then(setPackages)
      .catch(() => setPackages(fallbackPackages))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Plans"
        title="Membership"
        description="Straightforward pricing. Full access. Fingerprint entry included."
      />
      <section className="section">
        <div className="container">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Stagger className="grid grid--3">
                {packages.map((pkg) => (
                  <StaggerItem key={pkg.packageId}>
                    <PackageCard pkg={pkg} featured={pkg.isFeatured} />
                  </StaggerItem>
                ))}
              </Stagger>
              <Reveal style={{ textAlign: 'center', marginTop: 'var(--spacing-2xl)' }}>
                <motion.div
                  whileHover={reducedMotion ? undefined : { scale: 1.04 }}
                  whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                  style={{ display: 'inline-block' }}
                >
                  <Link to="/join" className="btn btn--primary btn--lg">
                    Join with Selected Package
                  </Link>
                </motion.div>
              </Reveal>
            </>
          )}
        </div>
      </section>
    </>
  );
}
