import { Heart, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { SUPPORT_EMAIL } from '../../lib/api';
import './LandingFooter.css';

const FOOTER_LINKS = {
  product: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Choose a plan', href: '/#plans' },
  ],
  legal: [
    { label: 'Privacy', to: '/privacy' },
    { label: 'Terms', to: '/terms' },
  ],
} as const;

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <span className="landing-footer__logo">PLNR</span>
          <p className="landing-footer__tagline">
            <Heart size={14} aria-hidden />
            Plan better outings, together.
          </p>
          <p className="landing-footer__blurb">
            Free AI-powered planning for date nights, group outings, vacations, and road trips.
          </p>
        </div>

        <div className="landing-footer__columns">
          <div className="landing-footer__column">
            <h3>Product</h3>
            <nav aria-label="Product links">
              {FOOTER_LINKS.product.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="landing-footer__column">
            <h3>Legal</h3>
            <nav aria-label="Legal links">
              {FOOTER_LINKS.legal.map((link) => (
                <Link key={link.label} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="landing-footer__column">
            <h3>Contact</h3>
            <a className="landing-footer__contact" href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail size={16} aria-hidden />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <div className="landing-footer__bottom">
        <p className="landing-footer__copy">© {year} PLNR. All rights reserved.</p>
        <p className="landing-footer__note">Free to plan · No account required</p>
      </div>
    </footer>
  );
}
