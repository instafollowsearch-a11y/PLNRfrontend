import { ArrowLeft, Menu } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import plnrLogo from '../../assets/plnr-logo-black-lettering.png';
import { useAuth } from '../../contexts/AuthContext';
import { PRIVACY_POLICY_URL, SUPPORT_EMAIL } from '../../lib/api';
import { AccountMenu } from './AccountMenu';
import './AppShell.css';

type AppShellProps = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  backTo?: string;
  variant?: 'app' | 'landing';
  /** Wider main column for dense admin tables/search. */
  contentWidth?: 'default' | 'wide';
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
  contentWidth = 'default',
}: AppShellProps) {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
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

  function openMenu() {
    setMenuOpen(true);
  }

  async function handleLogout() {
    closeMenu();
    await logout();
    navigate('/');
  }

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const accountLinks = isAuthenticated ? (
    <>
      <Link to="/plans" className="app-shell__nav-link" onClick={closeMenu}>
        My plans
      </Link>
      <Link to="/weekend" className="app-shell__nav-link" onClick={closeMenu}>
        Weekend picks
      </Link>
      {isAdmin ? (
        <Link to="/admin" className="app-shell__nav-link" onClick={closeMenu}>
          Admin
        </Link>
      ) : null}
      <button type="button" className="app-shell__nav-link" onClick={() => void handleLogout()}>
        Log out
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="app-shell__nav-link" onClick={closeMenu}>
        Log in
      </Link>
      <Link to="/register" className="app-shell__nav-link app-shell__nav-link--emphasis" onClick={closeMenu}>
        Create account
      </Link>
    </>
  );

  return (
    <div className={`app-shell ${isLanding ? 'app-shell--landing' : ''}`}>
      <header className={`app-shell__header ${isLanding ? 'app-shell__header--landing' : ''}`}>
        <div className="app-shell__header-left">
          {showBack ? (
            <button type="button" className="app-shell__icon-btn" onClick={handleBack} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
          ) : null}
          <Link to="/" className="app-shell__logo" onClick={closeMenu} aria-label="PLNR">
            <img src={plnrLogo} alt="" />
          </Link>
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
          <nav className="app-shell__desktop-nav" aria-label="Account navigation">
            {!isLanding ? (
              <Link to="/" className="app-shell__nav-link">
                Home
              </Link>
            ) : null}
            {accountLinks}
            {isLanding ? (
              <button
                type="button"
                className="app-shell__cta"
                onClick={() => scrollToId('plans')}
              >
                Start planning
              </button>
            ) : null}
          </nav>

          {isAuthenticated && user?.name ? (
            <AccountMenu name={user.name} onLogout={() => void handleLogout()} />
          ) : null}

          <button
            ref={menuButtonRef}
            type="button"
            className="app-shell__icon-btn app-shell__menu-btn"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="app-shell-drawer"
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
          <aside id="app-shell-drawer" className="app-shell__drawer" role="dialog" aria-label="Menu">
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
              {isAuthenticated ? (
                <>
                  <Link to="/plans" onClick={closeMenu}>
                    My plans
                  </Link>
                  {isAdmin ? (
                    <Link to="/admin" onClick={closeMenu}>
                      Admin
                    </Link>
                  ) : null}
                  <Link to="/account" onClick={closeMenu}>
                    Profile
                  </Link>
                  <p className="app-shell__drawer-user">{user?.email}</p>
                  <button type="button" onClick={() => void handleLogout()}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    Log in
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    Create account
                  </Link>
                </>
              )}
              <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
                Privacy
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`}>Support</a>
            </nav>
          </aside>
        </>
      ) : null}

      <div className="ad-slot" aria-hidden />

      <main
        className={`app-shell__main${isLanding ? ' app-shell__main--landing' : ''}${
          !isLanding && contentWidth === 'wide' ? ' app-shell__main--wide' : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
}
