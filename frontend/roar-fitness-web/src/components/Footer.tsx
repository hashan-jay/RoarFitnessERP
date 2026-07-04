/**
 * Public site footer with ROAR | FITNESS branding.
 */
import { Link } from 'react-router-dom';
import { Reveal, Stagger, StaggerItem } from './motion';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Stagger className="footer__grid">
          <StaggerItem>
            <div className="footer__brand">
              <h3>
                ROAR<span className="footer__brand-divider">|</span>FITNESS
              </h3>
              <p>
                Strength and conditioning in Colombo. Train with purpose. Live with power.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <h4>Explore</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/packages">Plans</Link></li>
                <li><Link to="/trainers">Trainers</Link></li>
                <li><Link to="/sessions">Sessions</Link></li>
              </ul>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <h4>Member</h4>
              <ul>
                <li><Link to="/join">Become a Member</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/packages">Pricing</Link></li>
              </ul>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div>
              <h4>Contact</h4>
              <ul>
                <li>123 Galle Road, Colombo 03</li>
                <li>+94 77 123 4567</li>
                <li>info@roarfitness.lk</li>
              </ul>
            </div>
          </StaggerItem>
        </Stagger>
        <Reveal>
          <div className="footer__bottom">
            &copy; {new Date().getFullYear()} Roar Fitness. All rights reserved.
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
