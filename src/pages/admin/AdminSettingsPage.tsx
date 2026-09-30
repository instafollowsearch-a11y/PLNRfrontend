import { CreditCard, Crown, Gauge, Info, KeyRound, Mail, MapPin, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { AdminNav } from '../../components/admin/AdminNav';
import { AppShell } from '../../components/layout/AppShell';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageIntro } from '../../components/ui/PageIntro';
import { accountApi, type AdminSettings, type AdminSettingsUpdate } from '../../lib/api';
import './admin.css';

function sourceBadge(source: unknown): 'accent' | 'muted' | 'default' {
  if (source === 'admin') {
    return 'accent';
  }

  if (source === 'env') {
    return 'default';
  }

  return 'muted';
}

function sourceLabel(source: unknown): string {
  if (source === 'admin') {
    return 'Admin override';
  }

  if (source === 'env') {
    return 'From .env';
  }

  return 'Not set';
}

type DirtyKey =
  | 'free_plans_per_month'
  | 'anthropic_api_key'
  | 'google_places_api_key'
  | 'anthropic_model'
  | 'anthropic_url'
  | 'mail_from_address'
  | 'mail_from_name'
  | 'booking_ops_email'
  | 'rate_limit_ai_per_hour'
  | 'pro_monthly_price_cents'
  | 'pro_currency'
  | 'app_store_url'
  | 'play_store_url'
  | 'web_app_url'
  | 'stripe_secret'
  | 'stripe_publishable_key'
  | 'stripe_webhook_secret';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [freePlansPerDay, setFreePlansPerDay] = useState('5');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [googlePlacesApiKey, setGooglePlacesApiKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('');
  const [anthropicUrl, setAnthropicUrl] = useState('');
  const [mailFromAddress, setMailFromAddress] = useState('');
  const [mailFromName, setMailFromName] = useState('');
  const [bookingOpsEmail, setBookingOpsEmail] = useState('');
  const [rateLimitAi, setRateLimitAi] = useState('');
  const [proMonthlyPriceCents, setProMonthlyPriceCents] = useState('');
  const [proCurrency, setProCurrency] = useState('');
  const [appStoreUrl, setAppStoreUrl] = useState('');
  const [playStoreUrl, setPlayStoreUrl] = useState('');
  const [webAppUrl, setWebAppUrl] = useState('');
  const [stripeSecret, setStripeSecret] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('');
  const [dirty, setDirty] = useState<Partial<Record<DirtyKey, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function markDirty(key: DirtyKey) {
    setDirty((current) => ({ ...current, [key]: true }));
    setSaved(false);
  }

  function applySettings(next: AdminSettings) {
    setSettings(next);
    setFreePlansPerDay(String(typeof next.free_plans_per_month === 'number' ? next.free_plans_per_month : 5));
    setAnthropicApiKey('');
    setGooglePlacesApiKey('');
    setAnthropicModel(typeof next.anthropic_model === 'string' ? next.anthropic_model : '');
    setAnthropicUrl(typeof next.anthropic_url === 'string' ? next.anthropic_url : '');
    setMailFromAddress(typeof next.mail_from_address === 'string' ? next.mail_from_address : '');
    setMailFromName(typeof next.mail_from_name === 'string' ? next.mail_from_name : '');
    setBookingOpsEmail(typeof next.booking_ops_email === 'string' ? next.booking_ops_email : '');
    setRateLimitAi(
      String(typeof next.rate_limit_ai_per_hour === 'number' ? next.rate_limit_ai_per_hour : ''),
    );
    setProMonthlyPriceCents(
      String(typeof next.pro_monthly_price_cents === 'number' ? next.pro_monthly_price_cents : ''),
    );
    setProCurrency(typeof next.pro_currency === 'string' ? next.pro_currency : '');
    setAppStoreUrl(typeof next.app_store_url === 'string' ? next.app_store_url : '');
    setPlayStoreUrl(typeof next.play_store_url === 'string' ? next.play_store_url : '');
    setWebAppUrl(typeof next.web_app_url === 'string' ? next.web_app_url : '');
    setStripeSecret('');
    setStripePublishableKey(
      typeof next.stripe_publishable_key === 'string' ? next.stripe_publishable_key : '',
    );
    setStripeWebhookSecret('');
    setDirty({});
  }

  useEffect(() => {
    void accountApi
      .getAdminSettings()
      .then((response) => applySettings(response.data.settings))
      .catch(() => setError('Unable to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const payload: AdminSettingsUpdate = {
        free_plans_per_month: Number(freePlansPerDay),
      };

      if (dirty.anthropic_api_key && anthropicApiKey.trim()) {
        payload.anthropic_api_key = anthropicApiKey.trim();
      }

      if (dirty.google_places_api_key && googlePlacesApiKey.trim()) {
        payload.google_places_api_key = googlePlacesApiKey.trim();
      }

      if (dirty.anthropic_model && anthropicModel.trim()) {
        payload.anthropic_model = anthropicModel.trim();
      }

      if (dirty.anthropic_url && anthropicUrl.trim()) {
        payload.anthropic_url = anthropicUrl.trim();
      }

      if (dirty.mail_from_address && mailFromAddress.trim()) {
        payload.mail_from_address = mailFromAddress.trim();
      }

      if (dirty.mail_from_name && mailFromName.trim()) {
        payload.mail_from_name = mailFromName.trim();
      }

      if (dirty.booking_ops_email && bookingOpsEmail.trim()) {
        payload.booking_ops_email = bookingOpsEmail.trim();
      }

      if (dirty.rate_limit_ai_per_hour && rateLimitAi.trim()) {
        payload.rate_limit_ai_per_hour = Number(rateLimitAi);
      }

      if (dirty.pro_monthly_price_cents && proMonthlyPriceCents.trim()) {
        payload.pro_monthly_price_cents = Number(proMonthlyPriceCents);
      }

      if (dirty.pro_currency && proCurrency.trim()) {
        payload.pro_currency = proCurrency.trim();
      }

      if (dirty.app_store_url && appStoreUrl.trim()) {
        payload.app_store_url = appStoreUrl.trim();
      }

      if (dirty.play_store_url && playStoreUrl.trim()) {
        payload.play_store_url = playStoreUrl.trim();
      }

      if (dirty.web_app_url && webAppUrl.trim()) {
        payload.web_app_url = webAppUrl.trim();
      }

      if (dirty.stripe_secret && stripeSecret.trim()) {
        payload.stripe_secret = stripeSecret.trim();
      }

      if (dirty.stripe_publishable_key && stripePublishableKey.trim()) {
        payload.stripe_publishable_key = stripePublishableKey.trim();
      }

      if (dirty.stripe_webhook_secret && stripeWebhookSecret.trim()) {
        payload.stripe_webhook_secret = stripeWebhookSecret.trim();
      }

      const response = await accountApi.updateAdminSettings(payload);
      applySettings(response.data.settings);
      setSaved(true);
    } catch {
      setError('Unable to save settings.');
    } finally {
      setSaving(false);
    }
  }

  async function clearOverride(flag: AdminSettingsUpdate) {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await accountApi.updateAdminSettings(flag);
      applySettings(response.data.settings);
      setSaved(true);
    } catch {
      setError('Unable to clear override.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="Settings" showBack backTo="/admin" contentWidth="wide">
      <div className="page-stack admin-page">
        <PageIntro
          eyebrow="Admin"
          title="App settings"
          subtitle="Admin overrides win when set. Clear an override to fall back to .env."
        />
        <AdminNav />

        {loading ? <LoadingState /> : null}

        {!loading && settings ? (
          <form className="page-stack admin-settings" onSubmit={(event) => void handleSave(event)}>
            <section className="admin-settings__section">
              <div className="admin-limit-hero">
                <div className="admin-limit-hero__icon" aria-hidden>
                  <Gauge size={22} />
                </div>
                <div>
                  <p className="admin-limit-hero__label">Current free plans per month</p>
                  <p className="admin-limit-hero__value">{freePlansPerDay}</p>
                </div>
              </div>

              <Input
                label="Free plans per month"
                type="number"
                min={0}
                max={1000}
                value={freePlansPerDay}
                onChange={(event) => {
                  setFreePlansPerDay(event.target.value);
                  markDirty('free_plans_per_month');
                }}
                required
              />
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <Sparkles size={16} aria-hidden /> AI (Anthropic)
                </h2>
                <Badge variant={sourceBadge(settings.anthropic_api_key_source)}>
                  Key: {sourceLabel(settings.anthropic_api_key_source)}
                </Badge>
              </header>

              <p className="admin-settings__hint">
                {settings.anthropic_api_key_set
                  ? `Key in use${settings.anthropic_api_key_hint ? ` (${settings.anthropic_api_key_hint})` : ''}.`
                  : 'No API key configured in admin or .env.'}{' '}
                Enter a new key only when you want to override. Leave blank to keep the current key.
              </p>

              <Input
                label="Anthropic API key"
                type="password"
                autoComplete="off"
                placeholder={settings.anthropic_api_key_set ? '•••••••• (leave blank to keep)' : 'sk-ant-…'}
                value={anthropicApiKey}
                onChange={(event) => {
                  setAnthropicApiKey(event.target.value);
                  markDirty('anthropic_api_key');
                }}
              />
              {settings.anthropic_api_key_source === 'admin' ? (
                <Button
                  label="Use .env key instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_anthropic_api_key: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.anthropic_model_source)}>
                  Model: {sourceLabel(settings.anthropic_model_source)}
                </Badge>
              </div>
              <Input
                label="Anthropic model"
                placeholder={String(settings.anthropic_model_env ?? 'claude-sonnet-4-6')}
                value={anthropicModel}
                onChange={(event) => {
                  setAnthropicModel(event.target.value);
                  markDirty('anthropic_model');
                }}
              />
              {settings.anthropic_model_source === 'admin' ? (
                <Button
                  label="Reset model to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_anthropic_model: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.anthropic_url_source)}>
                  URL: {sourceLabel(settings.anthropic_url_source)}
                </Badge>
              </div>
              <Input
                label="Anthropic API URL"
                placeholder={String(settings.anthropic_url_env ?? '')}
                value={anthropicUrl}
                onChange={(event) => {
                  setAnthropicUrl(event.target.value);
                  markDirty('anthropic_url');
                }}
              />
              {settings.anthropic_url_source === 'admin' ? (
                <Button
                  label="Reset URL to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_anthropic_url: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.rate_limit_ai_per_hour_source)}>
                  AI rate limit: {sourceLabel(settings.rate_limit_ai_per_hour_source)}
                </Badge>
              </div>
              <Input
                label="AI requests per hour"
                type="number"
                min={1}
                max={1000}
                placeholder={String(settings.rate_limit_ai_per_hour_env ?? 20)}
                value={rateLimitAi}
                onChange={(event) => {
                  setRateLimitAi(event.target.value);
                  markDirty('rate_limit_ai_per_hour');
                }}
              />
              {settings.rate_limit_ai_per_hour_source === 'admin' ? (
                <Button
                  label="Reset AI rate limit to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_rate_limit_ai_per_hour: true })}
                />
              ) : null}
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <MapPin size={16} aria-hidden /> Listing photos
                </h2>
                <Badge variant={sourceBadge(settings.google_places_api_key_source)}>
                  Key: {sourceLabel(settings.google_places_api_key_source)}
                </Badge>
              </header>

              <p className="admin-settings__hint">
                {settings.google_places_api_key_set
                  ? `Key in use${settings.google_places_api_key_hint ? ` (${settings.google_places_api_key_hint})` : ''}.`
                  : 'No Google Places key configured in admin or .env. Stops stay as text until one is saved.'}{' '}
                Enter a new key only when you want to override. Leave blank to keep the current key.
              </p>

              <Input
                label="Google Places API key"
                type="password"
                autoComplete="off"
                placeholder={
                  settings.google_places_api_key_set ? '•••••••• (leave blank to keep)' : 'AIza…'
                }
                value={googlePlacesApiKey}
                onChange={(event) => {
                  setGooglePlacesApiKey(event.target.value);
                  markDirty('google_places_api_key');
                }}
              />
              {settings.google_places_api_key_source === 'admin' ? (
                <Button
                  label="Use .env key instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_google_places_api_key: true })}
                />
              ) : null}
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <Mail size={16} aria-hidden /> Email
                </h2>
              </header>

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.mail_from_address_source)}>
                  From address: {sourceLabel(settings.mail_from_address_source)}
                </Badge>
              </div>
              <Input
                label="Mail from address"
                type="email"
                placeholder={String(settings.mail_from_address_env ?? 'hello@example.com')}
                value={mailFromAddress}
                onChange={(event) => {
                  setMailFromAddress(event.target.value);
                  markDirty('mail_from_address');
                }}
              />
              {settings.mail_from_address_source === 'admin' ? (
                <Button
                  label="Reset from address to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_mail_from_address: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.mail_from_name_source)}>
                  From name: {sourceLabel(settings.mail_from_name_source)}
                </Badge>
              </div>
              <Input
                label="Mail from name"
                placeholder={String(settings.mail_from_name_env ?? 'PLNR')}
                value={mailFromName}
                onChange={(event) => {
                  setMailFromName(event.target.value);
                  markDirty('mail_from_name');
                }}
              />
              {settings.mail_from_name_source === 'admin' ? (
                <Button
                  label="Reset from name to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_mail_from_name: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.booking_ops_email_source)}>
                  Ops email: {sourceLabel(settings.booking_ops_email_source)}
                </Badge>
              </div>
              <Input
                label="Booking ops email"
                type="email"
                placeholder={String(settings.booking_ops_email_env ?? '')}
                value={bookingOpsEmail}
                onChange={(event) => {
                  setBookingOpsEmail(event.target.value);
                  markDirty('booking_ops_email');
                }}
              />
              {settings.booking_ops_email_source === 'admin' ? (
                <Button
                  label="Reset ops email to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_booking_ops_email: true })}
                />
              ) : null}
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <CreditCard size={16} aria-hidden /> Stripe billing
                </h2>
              </header>
              <p className="admin-settings__hint">
                Set your Stripe keys for Checkout and the customer portal. Leave blank to keep the
                current value or fall back to .env.
              </p>

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.stripe_secret_source)}>
                  Secret key: {sourceLabel(settings.stripe_secret_source)}
                </Badge>
                {settings.stripe_secret_hint ? (
                  <Badge variant="muted">{settings.stripe_secret_hint}</Badge>
                ) : null}
              </div>
              <Input
                label="Stripe secret key"
                type="password"
                autoComplete="off"
                placeholder={settings.stripe_secret_set ? '•••• leave blank to keep' : 'sk_live_… or sk_test_…'}
                value={stripeSecret}
                onChange={(event) => {
                  setStripeSecret(event.target.value);
                  markDirty('stripe_secret');
                }}
              />
              {settings.stripe_secret_source === 'admin' ? (
                <Button
                  label="Reset secret to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_stripe_secret: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.stripe_publishable_key_source)}>
                  Publishable: {sourceLabel(settings.stripe_publishable_key_source)}
                </Badge>
              </div>
              <Input
                label="Stripe publishable key"
                placeholder={String(settings.stripe_publishable_key_env ?? 'pk_live_… or pk_test_…')}
                value={stripePublishableKey}
                onChange={(event) => {
                  setStripePublishableKey(event.target.value);
                  markDirty('stripe_publishable_key');
                }}
              />
              {settings.stripe_publishable_key_source === 'admin' ? (
                <Button
                  label="Reset publishable key to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_stripe_publishable_key: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.stripe_webhook_secret_source)}>
                  Webhook secret: {sourceLabel(settings.stripe_webhook_secret_source)}
                </Badge>
                {settings.stripe_webhook_secret_hint ? (
                  <Badge variant="muted">{settings.stripe_webhook_secret_hint}</Badge>
                ) : null}
              </div>
              <Input
                label="Stripe webhook secret"
                type="password"
                autoComplete="off"
                placeholder={
                  settings.stripe_webhook_secret_set ? '•••• leave blank to keep' : 'whsec_…'
                }
                value={stripeWebhookSecret}
                onChange={(event) => {
                  setStripeWebhookSecret(event.target.value);
                  markDirty('stripe_webhook_secret');
                }}
              />
              {settings.stripe_webhook_secret_source === 'admin' ? (
                <Button
                  label="Reset webhook secret to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_stripe_webhook_secret: true })}
                />
              ) : null}
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <Crown size={16} aria-hidden /> Pro &amp; apps
                </h2>
              </header>

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.pro_monthly_price_cents_source)}>
                  Pro price: {sourceLabel(settings.pro_monthly_price_cents_source)}
                </Badge>
              </div>
              <Input
                label="Pro monthly price (cents)"
                type="number"
                min={100}
                max={100000}
                placeholder={String(settings.pro_monthly_price_cents_env ?? 999)}
                value={proMonthlyPriceCents}
                onChange={(event) => {
                  setProMonthlyPriceCents(event.target.value);
                  markDirty('pro_monthly_price_cents');
                }}
              />

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.pro_currency_source)}>
                  Currency: {sourceLabel(settings.pro_currency_source)}
                </Badge>
              </div>
              <Input
                label="Pro currency"
                placeholder={String(settings.pro_currency_env ?? 'usd')}
                value={proCurrency}
                onChange={(event) => {
                  setProCurrency(event.target.value);
                  markDirty('pro_currency');
                }}
              />
              {settings.pro_currency_source === 'admin' ? (
                <Button
                  label="Reset currency to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_pro_currency: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.app_store_url_source)}>
                  App Store URL: {sourceLabel(settings.app_store_url_source)}
                </Badge>
              </div>
              <Input
                label="App Store URL"
                placeholder={String(settings.app_store_url_env ?? 'https://apps.apple.com/…')}
                value={appStoreUrl}
                onChange={(event) => {
                  setAppStoreUrl(event.target.value);
                  markDirty('app_store_url');
                }}
              />
              {settings.app_store_url_source === 'admin' ? (
                <Button
                  label="Reset App Store URL to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_app_store_url: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.play_store_url_source)}>
                  Play Store URL: {sourceLabel(settings.play_store_url_source)}
                </Badge>
              </div>
              <Input
                label="Play Store URL"
                placeholder={String(settings.play_store_url_env ?? 'https://play.google.com/…')}
                value={playStoreUrl}
                onChange={(event) => {
                  setPlayStoreUrl(event.target.value);
                  markDirty('play_store_url');
                }}
              />
              {settings.play_store_url_source === 'admin' ? (
                <Button
                  label="Reset Play Store URL to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_play_store_url: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.web_app_url_source)}>
                  Web app URL: {sourceLabel(settings.web_app_url_source)}
                </Badge>
              </div>
              <Input
                label="Web app URL"
                placeholder={String(settings.web_app_url_env ?? 'https://plnr.app')}
                value={webAppUrl}
                onChange={(event) => {
                  setWebAppUrl(event.target.value);
                  markDirty('web_app_url');
                }}
              />
              {settings.web_app_url_source === 'admin' ? (
                <Button
                  label="Reset web app URL to .env"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_web_app_url: true })}
                />
              ) : null}
            </section>

            <ul className="admin-limit-notes">
              <li>
                <KeyRound size={14} aria-hidden />
                API keys are encrypted in the database and never returned in full.
              </li>
              <li>
                <Info size={14} aria-hidden />
                Priority: admin setting → `.env` → built-in default.
              </li>
            </ul>

            {error ? <p className="error-text">{error}</p> : null}
            {saved ? <p className="admin-settings-form__saved">Settings saved.</p> : null}
            <Button label="Save settings" type="submit" loading={saving} />
          </form>
        ) : null}
      </div>
    </AppShell>
  );
}
