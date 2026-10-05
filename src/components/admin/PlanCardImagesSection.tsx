import { ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PLAN_TYPES } from '../../constants/planTypes';
import { accountApi, type PlanCardImages } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const emptyImages: PlanCardImages = {
  date_night: null,
  night_out: null,
  vacation: null,
  road_trip: null,
};

function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }

  return 'Unable to update that plan photo.';
}

export function PlanCardImagesSection() {
  const [images, setImages] = useState<PlanCardImages>(emptyImages);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [fileInputKeys, setFileInputKeys] = useState<Record<string, number>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    accountApi
      .getPlanCardImages()
      .then((response) => {
        if (isCurrent) {
          setImages(response.data.images);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setError('Unable to load plan photos.');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  function applyImages(next: PlanCardImages, slug: string, note: string) {
    setImages(next);
    setUrls((current) => ({ ...current, [slug]: '' }));
    setFiles((current) => ({ ...current, [slug]: null }));
    setFileInputKeys((current) => ({ ...current, [slug]: (current[slug] ?? 0) + 1 }));
    setSaved(note);
    setError(null);
  }

  async function handleSaveUrl(slug: string, label: string) {
    const url = urls[slug]?.trim() ?? '';

    if (!url) {
      setError(`Paste an image URL for ${label}.`);
      setSaved(null);
      return;
    }

    setBusyKey(`${slug}:url`);
    setError(null);

    try {
      const response = await accountApi.savePlanCardImageUrl(slug, url);
      applyImages(response.data.images, slug, `${label} photo updated.`);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpload(slug: string, label: string) {
    const file = files[slug];

    if (!file) {
      setError(`Choose a photo for ${label} first.`);
      setSaved(null);
      return;
    }

    setBusyKey(`${slug}:file`);
    setError(null);

    try {
      const response = await accountApi.uploadPlanCardImage(slug, file);
      applyImages(response.data.images, slug, `${label} photo uploaded.`);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReset(slug: string, label: string) {
    setBusyKey(`${slug}:reset`);
    setError(null);

    try {
      const response = await accountApi.resetPlanCardImage(slug);
      applyImages(response.data.images, slug, `${label} is using the built-in photo.`);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <section className="admin-settings admin-settings__section admin-plan-photos" aria-labelledby="plan-card-photos">
      <header className="admin-settings__header">
        <h2 id="plan-card-photos">
          <ImageIcon size={16} aria-hidden /> Choose your plan photos
        </h2>
      </header>
      <p className="admin-settings__hint">
        These photos appear on the Choose your plan cards. Paste an image URL or choose a file from
        this device. Leave a card alone to keep its built-in photo.
      </p>

      <div className="admin-plan-photos__list">
        {PLAN_TYPES.map((planType) => {
          const current = images[planType.slug];
          const chosen = files[planType.slug];

          return (
            <article key={planType.slug} className="admin-plan-photo">
              <div className="admin-plan-photo__preview">
                {current ? (
                  <img src={current} alt="" />
                ) : (
                  <span>Built-in photo</span>
                )}
              </div>
              <div className="admin-plan-photo__fields">
                <h3>{planType.label}</h3>
                <Input
                  id={`plan-photo-url-${planType.slug}`}
                  label="Image URL"
                  placeholder="https://"
                  value={urls[planType.slug] ?? ''}
                  onChange={(event) => {
                    setUrls((currentUrls) => ({ ...currentUrls, [planType.slug]: event.target.value }));
                    setSaved(null);
                  }}
                />
                <label className="admin-plan-photo__file">
                  <span>Or choose a file</span>
                  <input
                    key={`${planType.slug}-${fileInputKeys[planType.slug] ?? 0}`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setFiles((currentFiles) => ({ ...currentFiles, [planType.slug]: file }));
                      setSaved(null);
                    }}
                  />
                </label>
                <p className="admin-plan-photo__status">
                  {current ? 'Using a custom photo.' : 'Using the built-in photo.'}
                </p>
                <div className="admin-plan-photo__actions">
                  <Button
                    label="Save URL"
                    type="button"
                    variant="secondary"
                    loading={busyKey === `${planType.slug}:url`}
                    disabled={busyKey !== null && busyKey !== `${planType.slug}:url`}
                    onClick={() => void handleSaveUrl(planType.slug, planType.label)}
                  />
                  <Button
                    label={chosen ? 'Upload file' : 'Choose a file first'}
                    type="button"
                    loading={busyKey === `${planType.slug}:file`}
                    disabled={!chosen || (busyKey !== null && busyKey !== `${planType.slug}:file`)}
                    onClick={() => void handleUpload(planType.slug, planType.label)}
                  />
                  <Button
                    label="Reset to built-in photo"
                    type="button"
                    variant="secondary"
                    loading={busyKey === `${planType.slug}:reset`}
                    disabled={!current || (busyKey !== null && busyKey !== `${planType.slug}:reset`)}
                    onClick={() => void handleReset(planType.slug, planType.label)}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {saved ? <p className="admin-settings-form__saved">{saved}</p> : null}
    </section>
  );
}
