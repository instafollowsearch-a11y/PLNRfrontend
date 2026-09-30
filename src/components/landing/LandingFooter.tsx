import { Heart, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { billingApi, SUPPORT_EMAIL } from '../../lib/api';
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

function StoreButton({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <button type="button" className="landing-footer__store" disabled aria-disabled="true">
        {label}
      </button>
    );
  }

  return (
    <a className="landing-footer__store" href={url} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export function LandingFooter() {
  const year = new Date().getFullYear();
  const [appStoreUrl, setAppStoreUrl] = useState<string | null>(null);
  const [playStoreUrl, setPlayStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    billingApi
      .getBillingConfig()
      .then((response) => {
        if (!isCurrent) {
          return;
        }

        setAppStoreUrl(response.data.app_store_url);
        setPlayStoreUrl(response.data.play_store_url);
      })
      .catch(() => {
        // A missing config leaves both buttons disabled.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

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
            <h3>Get the app</h3>
            <div className="landing-footer__stores" aria-label="Download the app">
              <StoreButton label="App Store" url={appStoreUrl} />
              <StoreButton label="Google Play" url={playStoreUrl} />
            </div>
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
