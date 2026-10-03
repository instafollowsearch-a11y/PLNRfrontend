import { CheckCircle2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { SendSignupModal } from '../components/plans/SendSignupModal';
import { SharePlanModal } from '../components/plans/SharePlanModal';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { Input } from '../components/ui/Input';
import { PageIntro } from '../components/ui/PageIntro';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../lib/apiTypes';
import { ProPaywall } from '../components/pro/ProPaywall';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, savePlanSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';
import './SendPage.css';

type EmailMode = 'account' | 'other';

export function SendPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const config = planType ? getPlanFlowConfig(planType) : null;

  const [emailMode, setEmailMode] = useState<EmailMode>('account');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [city, setCity] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (sessionUuid) {
      savePlanSessionUuid(sessionUuid);
      void planSessionApi
        .getPlanSession(sessionUuid)
        .then((response) => setCity(response.data.plan_session.city))
        .catch(() => setCity(null));
    }
  }, [sessionUuid]);

  useEffect(() => {
    if (isAuthenticated && user?.email && emailMode === 'account') {
      setEmail(user.email);
    }
  }, [isAuthenticated, user?.email, emailMode]);

  function resolveRecipientEmail(): string {
    if (isAuthenticated && emailMode === 'account') {
      return (user?.email ?? '').trim();
    }

    return email.trim();
  }

  async function sendToEmail(recipientEmail: string) {
    if (!sessionUuid) {
      return;
    }

    if (!recipientEmail) {
      setError('Email is required.');

      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await planSessionApi.sendItineraryEmail(sessionUuid, recipientEmail);
      setEmail(recipientEmail);
      setSent(true);
      setSignupOpen(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSend() {
    if (!isAuthenticated) {
      if (!email.trim()) {
        setError('Email is required.');

        return;
      }

      setError(null);
      setSignupOpen(true);

      return;
    }

    await sendToEmail(resolveRecipientEmail());
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

  if (authLoading) {
    return (
      <AppShell title="Send" showBack backTo={withSession(`/plan/${planType}/itinerary`, sessionUuid)}>
        <LoadingState message="Loading…" />
      </AppShell>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={withSession(`/plan/${planType}/itinerary`, sessionUuid)} replace />;
  }

  if (sent) {
    return (
      <AppShell title="Sent">
        <div className="send-success">
          <div className="send-success__icon" aria-hidden>
            <CheckCircle2 size={56} strokeWidth={1.75} />
          </div>
          <h1 className="send-success__title">View it on PLNR</h1>
          <p className="send-success__lead">
            A link was sent to <strong>{email}</strong>.
          </p>
          {isAuthenticated ? (
            <p className="send-success__note">This plan is saved to your account.</p>
          ) : (
            <p className="send-success__note">Create a free account to track your night outs.</p>
          )}
          <div className="send-success__actions">
            <Button
              label="View itinerary with venue links"
              variant="secondary"
              onClick={() => navigate(withSession(`/plan/${planType}/itinerary`, sessionUuid))}
            />
            {isAuthenticated && sessionUuid ? (
              <Button
                label="Share plan"
                variant="secondary"
                icon={<Share2 size={16} />}
                onClick={() => setShareOpen(true)}
              />
            ) : null}
            {!isAuthenticated ? (
              <>
                <Button label="Create a free account" onClick={() => navigate('/register')} />
                <Button label="Log in" variant="ghost" onClick={() => navigate('/login')} />
              </>
            ) : null}
            <Button label="Plan another outing" variant="ghost" onClick={() => navigate('/')} />
          </div>
          {isAuthenticated && !user?.is_pro ? (
            <ProPaywall city={city} returnPath={withSession(`/plan/${planType}/send`, sessionUuid)} />
          ) : null}
          {shareOpen && sessionUuid ? (
            <SharePlanModal
              sessionUuid={sessionUuid}
              returnPath={withSession(`/plan/${planType}/send`, sessionUuid)}
              onClose={() => setShareOpen(false)}
            />
          ) : null}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="View on PLNR" showBack backTo={`/plan/${planType}/itinerary?session=${sessionUuid}`}>
      <FunnelStepper current="send" planType={planType} sessionUuid={sessionUuid} />
      <div className="page-stack send-form">
        <PageIntro
          title="View on PLNR"
          subtitle={
            isAuthenticated
              ? 'We will email a link to this plan. It stays on PLNR.'
              : 'Add your email — we will create your free account and send a link to this plan.'
          }
        />

        {!authLoading && isAuthenticated ? (
          <div className="send-form__choices" role="radiogroup" aria-label="Email destination">
            <label className={`send-form__choice${emailMode === 'account' ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="email-mode"
                checked={emailMode === 'account'}
                onChange={() => setEmailMode('account')}
              />
              <span>
                <strong>My account email</strong>
                <em>{user?.email}</em>
              </span>
            </label>
            <label className={`send-form__choice${emailMode === 'other' ? ' is-selected' : ''}`}>
              <input
                type="radio"
                name="email-mode"
                checked={emailMode === 'other'}
                onChange={() => {
                  setEmailMode('other');
                  setEmail('');
                }}
              />
              <span>
                <strong>A different email</strong>
                <em>Send somewhere else</em>
              </span>
            </label>
          </div>
        ) : null}

        {(!isAuthenticated || emailMode === 'other') && (
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}

        {!authLoading && !isAuthenticated ? (
          <div className="send-form__account-prompt">
            <p>
              Free account required to send. Your itinerary stays on this page — nothing is lost.
            </p>
          </div>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}

        <Button
          label={isAuthenticated ? 'View on PLNR' : 'Sign up & view on PLNR'}
          onClick={() => void handleSend()}
          loading={isSubmitting}
        />

        {!isAuthenticated ? (
          <p className="send-form__login-hint">
            Already have an account?{' '}
            <Link to="/login" state={{ from: withSession(`/plan/${planType}/send`, sessionUuid) }}>
              Log in
            </Link>
          </p>
        ) : null}

        <p className="send-form__legal">
          By sending, you agree to our <Link to="/privacy">privacy policy</Link>.
        </p>
      </div>

      {signupOpen ? (
        <SendSignupModal
          initialEmail={email}
          onClose={() => setSignupOpen(false)}
          onSignedUp={async (signedUpEmail) => {
            setSignupOpen(false);
            await sendToEmail(signedUpEmail);
          }}
        />
      ) : null}
    </AppShell>
  );
}
