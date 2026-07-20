import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { PageIntro } from '../components/ui/PageIntro';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';

export function SendPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!sessionUuid) {
      return;
    }

    if (!email.trim()) {
      setError('Email is required.');

      return;
    }

    if (!phone.trim()) {
      setError('Phone number is required.');

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await planSessionApi.sendItineraryEmail(sessionUuid, email.trim(), phone.trim());
      setSent(true);
    } catch {
      setError('Unable to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!planType || !config) {
    return (
      <AppShell showBack backTo="/">
        <EmptyState title="Plan type not found" />
      </AppShell>
    );
  }

  if (!sessionUuid) {
    return (
      <AppShell title="Send" showBack backTo={`/plan/${planType}/itinerary`}>
        <EmptyState title="Session expired" />
      </AppShell>
    );
  }

  if (sent) {
    return (
      <AppShell title="Sent">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <CheckCircle2 size={64} color="var(--color-success)" />
        </div>
        <PageIntro title="We emailed your itinerary" subtitle={`Check your inbox at ${email}.`} />
        <Card>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            Your phone ({phone}) is saved so we can follow up if needed.
          </p>
        </Card>
        <Button label="Plan another outing" onClick={() => navigate('/')} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Send itinerary" showBack backTo={`/plan/${planType}/itinerary?session=${sessionUuid}`}>
      <Card className="question-flow-card">
        <div className="page-stack">
          <PageIntro
            title="Where should we send it?"
            subtitle="Your itinerary is free. Enter your email and phone below."
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 123 4567"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />

          {error ? <p className="error-text">{error}</p> : null}

          <Button label="Send itinerary" onClick={() => void handleSend()} loading={isSubmitting} />

          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>
            By sending, you agree to our{' '}
            <Link to="/privacy" style={{ color: 'var(--color-accent)' }}>
              privacy policy
            </Link>
            .
          </p>
        </div>
      </Card>
    </AppShell>
  );
}
