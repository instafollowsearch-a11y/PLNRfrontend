import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import plnrLogo from '../../assets/plnr-logo-white-lettering.png';
import './AuthLayout.css';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <aside className="auth-layout__brand" aria-label="PLNR">
        <div className="auth-layout__brand-inner">
          <Link to="/" className="auth-layout__logo" aria-label="PLNR">
            <img src={plnrLogo} alt="" />
          </Link>
          <p className="auth-layout__tagline">Plan nights worth remembering.</p>
          <p className="auth-layout__blurb">
            Free AI planning for date nights, group outings, vacations, and road trips—then email your
            itinerary in minutes.
          </p>
        </div>
      </aside>

      <main className="auth-layout__panel">
        <div className="auth-layout__form-wrap">
          <Link to="/" className="auth-layout__back">
            ← Back to home
          </Link>
          <header className="auth-layout__intro">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>
          {children}
          {footer ? <div className="auth-layout__footer">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
