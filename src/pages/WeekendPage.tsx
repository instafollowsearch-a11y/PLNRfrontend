import { CalendarDays, ExternalLink, Mail, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { InterestPickerField } from '../components/fields/InterestPickerField';
import { LocationField } from '../components/fields/LocationField';
import { AppShell } from '../components/layout/AppShell';
import { ProPaywall } from '../components/pro/ProPaywall';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageIntro } from '../components/ui/PageIntro';
import { useAuth } from '../contexts/AuthContext';
import { weekendApi } from '../lib/api';
import type { ApiError, WeekendRecommendation } from '../lib/apiTypes';
import type { LocationValue } from '../lib/fieldValues';
import {
  buildInterestString,
  NIGHT_OUT_INTEREST_PRESETS,
  parseInterestValue,
} from '../lib/interestPresets';
import './WeekendPage.css';

type WeekendStep = 'form' | 'generating' | 'results' | 'emailed';

function formatEventDate(value: string | null): string {
  if (!value) {
    return 'Date TBA';
  }

  return new Date(value).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function locationFromCityLabel(city: string | null | undefined): LocationValue | null {
  const label = city?.trim();

  if (!label) {
    return null;
  }

  // Seed label from profile; user can refine via search or map (same as other plan flows).
  return { label, lat: 30.2672, lon: -97.7431 };
}

export function WeekendPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [step, setStep] = useState<WeekendStep>('form');
  const [location, setLocation] = useState<LocationValue | null>(() =>
    locationFromCityLabel(user?.city),
  );
  const [interestsRaw, setInterestsRaw] = useState('');
  const [recommendation, setRecommendation] = useState<WeekendRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [refreshingPro, setRefreshingPro] = useState(false);

  const billingNotice = searchParams.get('billing');

  useEffect(() => {
    if (user?.city && !location) {
      setLocation(locationFromCityLabel(user.city));
    }
  }, [user?.city, location]);

  useEffect(() => {
    if (billingNotice !== 'success') {
      return;
    }

    setRefreshingPro(true);
    void refreshUser().finally(() => {
      setSearchParams({}, { replace: true });
      setRefreshingPro(false);
    });
  }, [billingNotice, refreshUser, setSearchParams]);

  useEffect(() => {
    if (user?.interests?.length && !interestsRaw) {
      setInterestsRaw(JSON.stringify({ selected: user.interests, custom: '' }));
    }
  }, [user?.interests, interestsRaw]);

  const parsedInterests = useMemo(
    () => parseInterestValue(interestsRaw, NIGHT_OUT_INTEREST_PRESETS),
    [interestsRaw],
  );

  const interestList = useMemo(() => {
    const summary = buildInterestString(parsedInterests);

    if (!summary) {
      return [];
    }

    return summary.split(',').map((item) => item.trim()).filter(Boolean);
  }, [parsedInterests]);

  async function handleGenerate(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const city = location?.label?.trim() ?? '';

    if (!city) {
      setError('Search for a city or pick it on the map.');

      return;
    }

    if (interestList.length === 0) {
      setError('Select at least one interest.');

      return;
    }

    setStep('generating');

    try {
      const response = await weekendApi.createWeekendRecommendation(interestList, city);
      setRecommendation(response.data.recommendation);
      setStep('results');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to generate weekend picks.');
      setStep('form');
    }
  }

  async function handleEmailPicks() {
    if (!recommendation) {
      return;
    }

    setEmailLoading(true);
    setError(null);

    try {
      const response = await weekendApi.sendWeekendEmail(recommendation.uuid);
      setRecommendation(response.data.recommendation);
      setStep('emailed');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to email picks.');
    } finally {
      setEmailLoading(false);
    }
  }

  if (authLoading || refreshingPro) {
    return (
      <AppShell title="Weekend picks" showBack backTo="/">
        <div className="page-stack weekend-page">
          <LoadingState
            message={
              billingNotice === 'success' || refreshingPro
                ? 'Welcome to Pro! Loading your account…'
                : 'Loading…'
            }
          />
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title="Weekend picks" showBack backTo="/">
        <div className="page-stack weekend-page">
          <ProPaywall
            title="Weekend picks are a Pro feature"
            subtitle="Get AI-curated local events for the week ahead, tailored to your interests."
            returnPath="/weekend"
            isAuthenticated={false}
            onRequireLogin={() => navigate('/login', { state: { from: '/weekend' } })}
          />
        </div>
      </AppShell>
    );
  }

  if (!user.is_pro) {
    return (
      <AppShell title="Weekend picks" showBack backTo="/">
        <div className="page-stack weekend-page">
          <ProPaywall
            title="Weekend picks are a Pro feature"
            subtitle="Get AI-curated local events for the week ahead, tailored to your interests."
            returnPath="/weekend"
            isAuthenticated
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Weekend picks" showBack backTo="/">
      <div className="page-stack weekend-page">
        <PageIntro
          eyebrow="Pro"
          title="Your weekend picks"
          subtitle="Tell us your city and interests—we will match upcoming local events for the next seven days."
        />

        {step === 'form' || step === 'generating' ? (
          <form className="page-stack" onSubmit={(event) => void handleGenerate(event)}>
            <div className="weekend-page__field">
              <span className="weekend-page__field-label">City</span>
              <LocationField
                value={location}
                placeholder="Search city or pick on map…"
                onChange={setLocation}
              />
            </div>
            <div className="weekend-page__field">
              <span className="weekend-page__field-label">Interests</span>
              <InterestPickerField
                value={interestsRaw}
                presets={NIGHT_OUT_INTEREST_PRESETS}
                placeholder="Food trucks, live jazz…"
                onChange={setInterestsRaw}
              />
            </div>
            {error ? <p className="error-text">{error}</p> : null}
            {step === 'generating' ? (
              <LoadingState message="Finding smart picks that match your vibe…" />
            ) : (
              <Button label="Generate picks" type="submit" />
            )}
          </form>
        ) : null}

        {step === 'results' && recommendation ? (
          <>
            <div className="weekend-page__meta">
              <Badge variant="accent">
                <MapPin size={12} aria-hidden />
                {recommendation.city}
              </Badge>
              <Badge variant="muted">
                <CalendarDays size={12} aria-hidden />
                Next 7 days
              </Badge>
            </div>

            <div className="weekend-page__list">
              {recommendation.items.map((item) => (
                <Card key={item.event_id} className="weekend-page__event">
                  <div className="weekend-page__event-head">
                    <h3>{item.title}</h3>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="weekend-page__event-link"
                        aria-label={`Open ${item.title}`}
                      >
                        <ExternalLink size={16} />
                      </a>
                    ) : null}
                  </div>
                  <p className="weekend-page__event-venue">{item.venue || 'Venue TBA'}</p>
                  <p className="weekend-page__event-time">{formatEventDate(item.starts_at)}</p>
                  <p className="weekend-page__event-reason">{item.reason}</p>
                </Card>
              ))}
            </div>

            {error ? <p className="error-text">{error}</p> : null}
            <Button
              label="Email my picks"
              icon={<Mail size={16} />}
              onClick={() => void handleEmailPicks()}
              loading={emailLoading}
            />
            <Button label="Generate new picks" variant="secondary" onClick={() => setStep('form')} />
          </>
        ) : null}

        {step === 'emailed' ? (
          <EmptyState
            title="Picks sent!"
            description={`We emailed your weekend picks to ${user.email}.`}
            action={
              <div className="weekend-page__actions">
                <Button label="Back to home" onClick={() => navigate('/')} />
                <Button label="Generate again" variant="secondary" onClick={() => setStep('form')} />
              </div>
            }
          />
        ) : null}
      </div>
    </AppShell>
  );
}
