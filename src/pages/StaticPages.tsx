import { AppShell } from '../components/layout/AppShell';
import { PageIntro } from '../components/ui/PageIntro';
import { PRIVACY_POLICY_URL } from '../lib/api';

export function PrivacyPage() {
  return (
    <AppShell title="Privacy" showBack backTo="/">
      <PageIntro
        title="Privacy"
        subtitle="PLNR respects your privacy. Full policy is hosted on our website."
      />
      <p>
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
          View privacy policy
        </a>
      </p>
    </AppShell>
  );
}

export function TermsPage() {
  return (
    <AppShell title="Terms" showBack backTo="/">
      <PageIntro title="Terms" subtitle="Terms of service will be published at launch." />
    </AppShell>
  );
}

export function NotFoundPage() {
  return (
    <AppShell showBack backTo="/">
      <PageIntro title="Page not found" subtitle="This page does not exist." />
    </AppShell>
  );
}
