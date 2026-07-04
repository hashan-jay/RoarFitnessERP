/**
 * Public site header with ROAR | FITNESS branding and mockup-style navigation.
 */
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { easeSmooth } from '../lib/motion';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/packages', label: 'Plans' },
  { to: '/sessions', label: 'Sessions' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact Us' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      className={`header ${scrolled ? 'header--scrolled' : ''}`}
      initial={reducedMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: easeSmooth }}
    >
      <div className="header__inner">
        <Link to="/" className="header__logo brand-mark">
          ROAR<span className="header__logo-divider">|</span>FITNESS
        </Link>

        <nav className={`header__nav ${menuOpen ? 'header__nav--open' : ''}`}>
          {navLinks.map((link, index) => (
            <motion.div
              key={link.to}
              initial={reducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.05, duration: 0.4, ease: easeSmooth }}
            >
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
                <span className="header__nav-arrow">&gt;&gt;</span>
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="header__actions">
          <Link to="/login" className="btn btn--outline btn--sm">
            Login
          </Link>
          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="header__menu-icon" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}
