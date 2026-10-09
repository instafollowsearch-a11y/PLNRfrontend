import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InterestPickerField } from '../components/fields/InterestPickerField';
import { LocationField } from '../components/fields/LocationField';
import { AppShell } from '../components/layout/AppShell';
import { PageIntro } from '../components/ui/PageIntro';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import { firstApiError } from '../lib/apiErrorMessage';
import type { LocationValue } from '../lib/fieldValues';
import { interestList, WEEKEND_INTEREST_PRESETS } from '../lib/interestPresets';

import './ProSetupPage.css';

const SAVE_DELAY_MS = 800;

export function ProSetupPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [location, setLocation] = useState<LocationValue | null>(
    user?.city ? { label: user.city, lat: 0, lon: 0 } : null,
  );
  const [interests, setInterests] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const requestId = useRef(0);

  const city = location?.label.trim() ?? '';
  const interestItems = interestList(interests, WEEKEND_INTEREST_PRESETS);
  const ready = city !== '' && interestItems.length > 0;

  useEffect(() => {
    if (!ready) {
      return;
    }

    const id = requestId.current + 1;
    requestId.current = id;
    const timer = window.setTimeout(() => {
      void (async () => {
        setError(null);
        setIsSaving(true);

        try {
          const response = await authApi.updateProfile({
            city,
            interests: interestItems,
          });

          if (id !== requestId.current) {
            return;
          }

          await refreshUser();

          if (response.data.weekend_delivery === 'failed') {
            setError('Your preferences are saved. We could not build this weekend yet — try again from Weekend picks.');

            return;
          }

          navigate('/weekend');
        } catch (caught) {
          if (id === requestId.current) {
            setError(firstApiError(caught, 'Could not save your weekend preferences.'));
          }
        } finally {
          if (id === requestId.current) {
            setIsSaving(false);
          }
        }
      })();
    }, SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [city, interestItems.join('|'), navigate, ready, refreshUser]);

  return (
    <AppShell title="Weekend setup" showBack backTo="/plans">
      <section className="pro-setup">
        <PageIntro
          eyebrow="Pro"
          title="What should your weekend be about?"
          subtitle="Pick a city and the things you actually want to do. As soon as those are in, we send this weekend, then a fresh one every Friday."
        />
        <form className="pro-setup__form" onSubmit={(event) => event.preventDefault()} aria-label="Weekend preferences">
          <div className="weekend-page__field">
            <span className="weekend-page__field-label">City</span>
            <LocationField value={location} placeholder="Search city or pick on map…" onChange={setLocation} />
          </div>
          <div className="weekend-page__field">
            <span className="weekend-page__field-label">Interests</span>
            <InterestPickerField
              value={interests}
              onChange={setInterests}
              presets={WEEKEND_INTEREST_PRESETS}
              placeholder="Add your own…"
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <p className="pro-setup__status" role="status">
            {isSaving
              ? 'Sending your weekend…'
              : ready
                ? 'Got it. Your weekend is on its way.'
                : 'Add a city and at least one interest. Your weekend goes out on its own.'}
          </p>
        </form>
      </section>
    </AppShell>
  );
}
