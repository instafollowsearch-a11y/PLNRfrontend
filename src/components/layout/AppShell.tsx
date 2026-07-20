import { ArrowLeft, Menu } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '../../lib/api';
import './AppShell.css';

type AppShellProps = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  variant?: 'app' | 'landing';
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function AppShell({
  children,
  title,
  showBack = false,
  backTo,
  variant = 'app',
}: AppShellProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLanding = variant === 'landing';

  function handleBack() {
    if (backTo) {
      navigate(backTo);

      return;
    }

    navigate(-1);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className={`app-shell ${isLanding ? 'app-shell--landing' : ''}`}>
      <header className={`app-shell__header ${isLanding ? 'app-shell__header--landing' : ''}`}>
        <div className="app-shell__header-left">
          {showBack ? (
            <button type="button" className="app-shell__icon-btn" onClick={handleBack} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <Link to="/" className="app-shell__logo">
              PLNR
            </Link>
          )}
        </div>

        {isLanding ? (
          <nav className="app-shell__landing-nav" aria-label="Landing navigation">
            <button type="button" onClick={() => scrollToId('how-it-works')}>
              How it works
            </button>
            <button type="button" onClick={() => scrollToId('plans')}>
              Plans
            </button>
          </nav>
        ) : title ? (
          <h1 className="app-shell__title">{title}</h1>
        ) : (
          <div />
        )}

        <div className="app-shell__header-right">
          {isLanding ? (
            <button
              type="button"
              className="app-shell__cta"
              onClick={() => scrollToId('plans')}
            >
              Start planning
            </button>
          ) : null}
          <button
            type="button"
            className="app-shell__icon-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="app-shell__scrim"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <aside className="app-shell__drawer">
            <nav className="app-shell__drawer-nav">
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>
              {isLanding ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToId('how-it-works');
                      closeMenu();
                    }}
                  >
                    How it works
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToId('plans');
                      closeMenu();
                    }}
                  >
                    Plans
                  </button>
                </>
              ) : null}
              <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
                Privacy
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`}>Support</a>
            </nav>
          </aside>
        </>
      ) : null}

      <div className="ad-slot" aria-hidden />

      <main className={`app-shell__main ${isLanding ? 'app-shell__main--landing' : ''}`}>{children}</main>
    </div>
  );
}
