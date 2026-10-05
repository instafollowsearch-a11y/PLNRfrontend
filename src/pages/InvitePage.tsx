import { MapPin, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ItineraryView } from '../components/ItineraryView';
import { AppShell } from '../components/layout/AppShell';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageIntro } from '../components/ui/PageIntro';
import { useAuth } from '../contexts/AuthContext';
import { planShareApi } from '../lib/api';
import { GUEST_CLEAR_STOP_COUNT } from '../lib/itineraryPreview';
import type { ApiError, PlanSharePreview } from '../lib/apiTypes';
import { withSession } from '../lib/session';
import './InvitePage.css';

export function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
  const [switchingAccount, setSwitchingAccount] = useState(false);

  const [preview, setPreview] = useState<PlanSharePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Invalid invite link.');

      return;
    }

    void planShareApi
      .getPlanSharePreview(token)
      .then((response) => setPreview(response.data))
      .catch(() => setError('This invite is invalid or has expired.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) {
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const response = await planShareApi.acceptPlanShare(token);
      const session = response.data.plan_session;
      const slug = session?.plan_type?.slug ?? 'night_out';

      if (session?.uuid) {
        navigate(withSession(`/plan/${slug}/itinerary`, session.uuid), { replace: true });

        return;
      }

      navigate('/plans', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to accept invite.');
    } finally {
      setAccepting(false);
    }
  }

  const invitePath = token ? `/invite/${token}` : '/plans';
  const emailMatches =
    preview && user?.email
      ? user.email.toLowerCase() === preview.invitee_email.toLowerCase()
      : false;
  const canSeeFullPlan = Boolean(isAuthenticated && emailMatches);

  return (
    <AppShell title="Plan invite" showBack backTo="/">
      <div className="page-stack invite-page">
        {loading ? <LoadingState message="Loading invite…" /> : null}

        {!loading && error && !preview ? (
          <EmptyState title="Invite unavailable" description={error} action={<Button label="Go home" onClick={() => navigate('/')} />} />
        ) : null}

        {!loading && preview ? (
          <>
            <PageIntro
              eyebrow="Invite"
              title="You are invited to a plan"
              subtitle={
                preview.inviter_name
                  ? `${preview.inviter_name} shared an itinerary with you.`
                  : 'Someone shared an itinerary with you.'
              }
            />

            <Card className="invite-page__preview">
              <div className="invite-page__chips">
                <Badge variant="plan" color="#d4622a">
                  {preview.plan.plan_type.label}
                </Badge>
                {preview.status !== 'pending' ? (
                  <Badge variant="muted">{preview.status}</Badge>
                ) : null}
              </div>
              <h2 className="invite-page__city">
                <MapPin size={16} aria-hidden />
                {preview.plan.city || 'Shared plan'}
              </h2>
              <p className="invite-page__email">
                <Users size={14} aria-hidden />
                Invited as {preview.invitee_email}
              </p>
              {preview.itinerary ? (
                <ItineraryView
                  content={preview.itinerary}
                  planType={preview.plan.plan_type.slug}
                  fadeAfterStopCount={canSeeFullPlan ? undefined : GUEST_CLEAR_STOP_COUNT}
                  eventCredits={preview.event_credits}
                />
              ) : null}
            </Card>

            {preview.status !== 'pending' ? (
              <EmptyState
                title={preview.status === 'accepted' ? 'Invite accepted' : 'Invite already used'}
                description={
                  preview.status === 'accepted'
                    ? 'You can open this plan from My plans anytime.'
                    : 'This invite is no longer pending.'
                }
                action={
                  <div className="invite-page__auth">
                    {preview.plan.uuid ? (
                      <Button
                        label="View plan"
                        onClick={() =>
                          navigate(
                            withSession(
                              `/plan/${preview.plan.plan_type.slug || 'night_out'}/itinerary`,
                              preview.plan.uuid,
                            ),
                          )
                        }
                      />
                    ) : null}
                    <Button label="My plans" variant="secondary" onClick={() => navigate('/plans')} />
                  </div>
                }
              />
            ) : null}

            {preview.status === 'pending' && !authLoading && !isAuthenticated ? (
              <div className="invite-page__auth">
                <p className="invite-page__auth-lead">
                  {preview.account_exists
                    ? 'Log in with the invited email to accept.'
                    : 'Create an account to see the rest of this plan.'}
                </p>
                {preview.account_exists ? (
                  <Button
                    label="Log in to accept"
                    onClick={() =>
                      navigate('/login', { state: { from: invitePath } })
                    }
                  />
                ) : (
                  <Button
                    label="Create an account"
                    onClick={() =>
                      navigate('/register', {
                        state: {
                          email: preview.invitee_email,
                          invite_token: token,
                          emailPrefillReadonly: true,
                          from: invitePath,
                        },
                      })
                    }
                  />
                )}
                <Link to="/login" className="invite-page__alt-link">
                  Already have an account? Log in
                </Link>
              </div>
            ) : null}

            {preview.status === 'pending' && isAuthenticated && !emailMatches ? (
              <EmptyState
                title="Wrong account"
                description={`Sign in as ${preview.invitee_email} to accept this invite.`}
                action={
                  <Button
                    label="Switch account"
                    loading={switchingAccount}
                    onClick={() => {
                      void (async () => {
                        setSwitchingAccount(true);
                        try {
                          await logout();
                        } finally {
                          setSwitchingAccount(false);
                        }
                      })();
                    }}
                  />
                }
              />
            ) : null}

            {preview.status === 'pending' && isAuthenticated && emailMatches ? (
              <>
                {error ? <p className="error-text">{error}</p> : null}
                <Button label="Accept invite" onClick={() => void handleAccept()} loading={accepting} />
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
