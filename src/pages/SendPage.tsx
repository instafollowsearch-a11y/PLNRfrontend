import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { Input } from '../components/ui/Input';
import { PageIntro } from '../components/ui/PageIntro';
import { useAuth } from '../contexts/AuthContext';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';
import './SendPage.css';

export function SendPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
        <div className="send-success">
          <div className="send-success__icon" aria-hidden>
            <CheckCircle2 size={56} strokeWidth={1.75} />
          </div>
          <h1 className="send-success__title">We emailed your itinerary</h1>
          <p className="send-success__lead">
            Check your inbox at <strong>{email}</strong>. Your phone ({phone}) is saved so we can follow
            up if needed.
          </p>
          {isAuthenticated ? (
            <p className="send-success__note">This plan is saved to your account.</p>
          ) : (
            <p className="send-success__note">
              Create a free account to track your night outs.
            </p>
          )}
          <div className="send-success__actions">
            <Button
              label="View itinerary with venue links"
              variant="secondary"
              onClick={() => navigate(withSession(`/plan/${planType}/itinerary`, sessionUuid))}
            />
            {!isAuthenticated ? (
              <>
                <Button label="Create a free account" onClick={() => navigate('/register')} />
                <Button label="Log in" variant="ghost" onClick={() => navigate('/login')} />
              </>
            ) : null}
            <Button label="Plan another outing" variant="ghost" onClick={() => navigate('/')} />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Send itinerary" showBack backTo={`/plan/${planType}/itinerary?session=${sessionUuid}`}>
      <FunnelStepper current="send" planType={planType} sessionUuid={sessionUuid} />
      <div className="page-stack send-form">
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

        <p className="send-form__legal">
          By sending, you agree to our{' '}
          <Link to="/privacy">privacy policy</Link>.
        </p>
      </div>
    </AppShell>
  );
}
