/**
 * Public marketing homepage aligned with the Roar Fitness brand mockup.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BmiCalculator } from '../../components/BmiCalculator';
import { GalleryCarousel } from '../../components/GalleryCarousel';
import { CoachIcon, DumbbellIcon, FacilityIcon } from '../../components/FeatureIcons';
import { SectionHeader } from '../../components/SectionHeader';
import { Reveal } from '../../components/motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { easeSmooth, fadeUpVariants } from '../../lib/motion';

const heroImages = {
  main: '/images/athletes/hero-athlete.png',
  collageA: '/images/athletes/collage-training.png',
  collageB: '/images/athletes/collage-equipment.png',
};

const gallerySlides = [
  {
    title: 'GYM Equipments',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80&auto=format&fit=crop',
    alt: 'Modern gym equipment and squat racks',
  },
  {
    title: 'Group Training',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=80&auto=format&fit=crop',
    alt: 'Group fitness training session',
  },
  {
    title: 'Ladies Section',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2aad581d?w=700&q=80&auto=format&fit=crop',
    alt: 'Woman training with dumbbells',
  },
  {
    title: 'Recovery Zone',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80&auto=format&fit=crop',
    alt: 'Recovery and stretching area',
  },
  {
    title: 'Cardio Deck',
    image: 'https://images.unsplash.com/photo-1571902940322-33837b5b7980?w=700&q=80&auto=format&fit=crop',
    alt: 'Cardio machines in the gym',
  },
];

const features = [
  {
    icon: DumbbellIcon,
    title: 'Modern Equipment',
    text: 'Olympic racks, premium machines, and free weights maintained to competition standards.',
  },
  {
    icon: CoachIcon,
    title: 'Professional Training',
    text: 'Certified coaches guide every member with structured plans and real accountability.',
  },
  {
    icon: FacilityIcon,
    title: 'Premium Facilities',
    text: 'Recovery zones, locker rooms, and dedicated spaces built for serious training.',
  },
];

export function HomePage() {
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section className="roar-hero">
        <div className="roar-hero__watermark" aria-hidden>
          ROAR FITNESS
        </div>
        <div className="container">
          <div className="roar-hero__grid">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } },
              }}
            >
              <motion.p className="roar-hero__tagline" variants={fadeUpVariants} transition={{ duration: 0.55, ease: easeSmooth }}>
                TRAIN SMART. GET RESULTS.
              </motion.p>
              <motion.h1 variants={fadeUpVariants} transition={{ duration: 0.55, ease: easeSmooth }}>
                Train with Purpose, Live with Power
              </motion.h1>
              <motion.div className="roar-hero__cta" variants={fadeUpVariants} transition={{ duration: 0.55, ease: easeSmooth }}>
                <Link to="/join" className="btn btn--arrow">
                  Become a Member
                </Link>
              </motion.div>
              <motion.div className="roar-hero__collage" variants={fadeUpVariants} transition={{ duration: 0.55, ease: easeSmooth }}>
                <div className="roar-hero__collage-item roar-hero__collage-item--tall">
                  <img src={heroImages.collageA} alt="Member training at Roar Fitness" />
                </div>
                <div className="roar-hero__collage-item">
                  <img src={heroImages.collageB} alt="Gym equipment at Roar Fitness" />
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="roar-hero__visual"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeSmooth }}
            >
              <div className="roar-hero__figure">
                <img src={heroImages.main} alt="Athlete training at Roar Fitness Colombo" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="roar-statement-section">
        <div className="container">
          <Reveal>
            <p className="roar-statement">
              At Roar Fitness, we inspire <strong>progress</strong>. From expert coaching to{' '}
              <strong>world class equipment</strong>, every detail is designed to help you{' '}
              <strong>train with purpose</strong> and live with power.
            </p>
          </Reveal>
          <div className="roar-features">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.08} className="roar-feature">
                <feature.icon />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="roar-gallery-section" id="facilities">
        <div className="container">
          <SectionHeader
            eyebrow="DESIGNED FOR PERFORMANCE"
            title="More Than a Gym — A Space Built for Progress"
            description="Dedicated zones for strength, group sessions, ladies training, and recovery."
            align="left"
          />
          <Reveal delay={0.1}>
            <GalleryCarousel slides={gallerySlides} />
          </Reveal>
        </div>
      </section>

      <section className="roar-health-section" id="health">
        <div className="container">
          <SectionHeader
            eyebrow="HEALTH"
            title="Know Your Baseline"
            description="Calculate your BMI instantly, then talk to a coach about what comes next."
            align="left"
          />
          <div className="health-section health-section--portal">
            <Reveal className="card health-section__intro">
              <h3>BMI Calculator</h3>
              <p>
                A quick screening tool for weight relative to height. Not a diagnosis — a starting
                point for an informed conversation about your fitness journey.
              </p>
            </Reveal>
            <Reveal className="card health-section__calculator" delay={0.08}>
              <BmiCalculator idPrefix="public-bmi" showScale showHealthyRange />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="roar-cta">
              <h2>Ready to Commit?</h2>
              <p>
                Memberships from LKR 8,500/month. Fingerprint access. No contracts — just results.
              </p>
              <motion.div
                whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                whileTap={reducedMotion ? undefined : { scale: 0.99 }}
                style={{ display: 'inline-block' }}
              >
                <Link to="/join" className="btn btn--arrow btn--lg">
                  Join Now
                </Link>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
