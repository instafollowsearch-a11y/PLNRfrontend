import { Link, useNavigate } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { PageIntro } from '../components/ui/PageIntro';
import { PRIVACY_POLICY_URL } from '../lib/api';

export function PrivacyPage() {
  return (
    <AppShell title="Privacy" showBack backTo="/">
      <article className="prose-page">
        <PageIntro
          title="Privacy"
          subtitle="How PLNR handles your information when you plan and send itineraries."
        />
        <p>
          PLNR collects the details you provide to build a plan—city, preferences, and email when you
          send an itinerary. We use that information to generate suggestions, email your plan, and (if
          you create an account) show your saved sessions.
        </p>
        <ul>
          <li>Guest plans may be limited by IP to keep free usage fair.</li>
          <li>Signed-in plans are tied to your account so you can reopen them later.</li>
          <li>We do not sell your personal information.</li>
        </ul>
        <p>
          For the full policy, see{' '}
          <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
            plnrapp.com/privacy
          </a>
          .
        </p>
        <p>
          Questions? Reach us via the contact options on our site, or return{' '}
          <Link to="/">home</Link> to keep planning.
        </p>
      </article>
    </AppShell>
  );
}

export function TermsPage() {
  return (
    <AppShell title="Terms" showBack backTo="/">
      <article className="prose-page">
        <PageIntro
          title="Terms of service"
          subtitle="Simple rules for using PLNR’s free planning tools."
        />
        <p>
          By using PLNR, you agree to use the product for personal outing and travel planning. Suggestions
          and itineraries are AI-assisted starting points—not guarantees about venues, pricing, or
          availability.
        </p>
        <ul>
          <li>You are responsible for verifying hours, reservations, and travel details.</li>
          <li>Free usage may be rate-limited so the service stays available for everyone.</li>
          <li>Do not abuse the API, scrape content, or attempt to disrupt the service.</li>
        </ul>
        <p>
          Account features (saved plans, admin tools) require accurate registration details and a secure
          password you keep private.
        </p>
        <p>
          See also our <Link to="/privacy">privacy policy</Link>, or go{' '}
          <Link to="/">back home</Link>.
        </p>
      </article>
    </AppShell>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <AppShell showBack backTo="/">
      <article className="prose-page">
        <PageIntro title="Page not found" subtitle="That link does not match a page on PLNR." />
        <p>
          The page may have moved, or the URL might be mistyped. You can start a new plan from the home
          page, or log in to open plans you already saved.
        </p>
        <Button label="Back to home" onClick={() => navigate('/')} />
        <p>
          <Link to="/login">Log in</Link>
          {' · '}
          <Link to="/privacy">Privacy</Link>
          {' · '}
          <Link to="/terms">Terms</Link>
        </p>
      </article>
    </AppShell>
  );
}
