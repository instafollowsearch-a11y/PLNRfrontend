import { CreditCard, Crown, Gauge, Info, KeyRound, Mail, MapPin, MessageSquare, Sparkles } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import { AdminNav } from '../../components/admin/AdminNav';
import { PlanCardImagesSection } from '../../components/admin/PlanCardImagesSection';
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

function settingsErrorMessage(caught: unknown, fallback: string): string {
  if (typeof caught === 'object' && caught !== null && 'errors' in caught) {
    const errors = (caught as { errors?: Record<string, string[]> }).errors;
    const first = errors ? Object.values(errors).flat()[0] : undefined;

    if (first) {
      return first;
    }
  }

  if (typeof caught === 'object' && caught !== null && 'message' in caught) {
    const message = (caught as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim() !== '') {
      return message;
    }
  }

  return fallback;
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
  | 'google_client_id'
  | 'google_ios_client_id'
  | 'google_android_client_id'
  | 'twilio_account_sid'
  | 'twilio_auth_token'
  | 'twilio_from_number'
  | 'twilio_messaging_service_sid'
  | 'plan_invite_sms_enabled'
  | 'findlocal_api_key'
  | 'anthropic_model'
  | 'anthropic_url'
  | 'mail_from_address'
  | 'mail_from_name'
  | 'booking_ops_email'
  | 'support_email'
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
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleIosClientId, setGoogleIosClientId] = useState('');
  const [googleAndroidClientId, setGoogleAndroidClientId] = useState('');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');
  const [twilioMessagingServiceSid, setTwilioMessagingServiceSid] = useState('');
  const [planInviteSmsEnabled, setPlanInviteSmsEnabled] = useState(false);
  const [findLocalApiKey, setFindLocalApiKey] = useState('');
  const [anthropicModel, setAnthropicModel] = useState('');
  const [anthropicUrl, setAnthropicUrl] = useState('');
  const [mailFromAddress, setMailFromAddress] = useState('');
  const [mailFromName, setMailFromName] = useState('');
  const [bookingOpsEmail, setBookingOpsEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
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
    setGoogleClientId(typeof next.google_client_id === 'string' ? next.google_client_id : '');
    setGoogleIosClientId(typeof next.google_ios_client_id === 'string' ? next.google_ios_client_id : '');
    setGoogleAndroidClientId(
      typeof next.google_android_client_id === 'string' ? next.google_android_client_id : '',
    );
    setTwilioAccountSid(typeof next.twilio_account_sid === 'string' ? next.twilio_account_sid : '');
    setTwilioAuthToken('');
    setTwilioFromNumber(typeof next.twilio_from_number === 'string' ? next.twilio_from_number : '');
    setTwilioMessagingServiceSid(
      typeof next.twilio_messaging_service_sid === 'string' ? next.twilio_messaging_service_sid : '',
    );
    setPlanInviteSmsEnabled(next.plan_invite_sms_enabled === true);
    setFindLocalApiKey('');
    setAnthropicModel(typeof next.anthropic_model === 'string' ? next.anthropic_model : '');
    setAnthropicUrl(typeof next.anthropic_url === 'string' ? next.anthropic_url : '');
    setMailFromAddress(typeof next.mail_from_address === 'string' ? next.mail_from_address : '');
    setMailFromName(typeof next.mail_from_name === 'string' ? next.mail_from_name : '');
    setBookingOpsEmail(typeof next.booking_ops_email === 'string' ? next.booking_ops_email : '');
    setSupportEmail(typeof next.support_email === 'string' ? next.support_email : '');
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

      if (dirty.google_client_id && googleClientId.trim()) {
        payload.google_client_id = googleClientId.trim();
      }

      if (dirty.google_ios_client_id && googleIosClientId.trim()) {
        payload.google_ios_client_id = googleIosClientId.trim();
      }

      if (dirty.google_android_client_id && googleAndroidClientId.trim()) {
        payload.google_android_client_id = googleAndroidClientId.trim();
      }

      if (dirty.twilio_account_sid && twilioAccountSid.trim()) {
        payload.twilio_account_sid = twilioAccountSid.trim();
      }

      if (dirty.twilio_auth_token && twilioAuthToken.trim()) {
        payload.twilio_auth_token = twilioAuthToken.trim();
      }

      if (dirty.twilio_from_number && twilioFromNumber.trim()) {
        payload.twilio_from_number = twilioFromNumber.trim();
      }

      if (dirty.twilio_messaging_service_sid && twilioMessagingServiceSid.trim()) {
        payload.twilio_messaging_service_sid = twilioMessagingServiceSid.trim();
      }

      if (dirty.plan_invite_sms_enabled) {
        payload.plan_invite_sms_enabled = planInviteSmsEnabled;
      }

      if (dirty.findlocal_api_key && findLocalApiKey.trim()) {
        payload.findlocal_api_key = findLocalApiKey.trim();
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

      if (dirty.support_email && supportEmail.trim()) {
        payload.support_email = supportEmail.trim();
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
    } catch (caught) {
      setError(settingsErrorMessage(caught, 'Unable to save settings.'));
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
                  <MapPin size={16} aria-hidden /> Google
                </h2>
                <Badge variant={sourceBadge(settings.google_places_api_key_source)}>
                  Key: {sourceLabel(settings.google_places_api_key_source)}
                </Badge>
              </header>

              <p className="admin-settings__hint">
                {settings.google_places_api_key_set
                  ? `Key in use${settings.google_places_api_key_hint ? ` (${settings.google_places_api_key_hint})` : ''}.`
                  : 'No Google key configured in admin or .env.'}{' '}
                Places, photos, and drive time use this key. Sign-in uses the Web client ID in the next section. Enter a new key only when you want to override. Leave blank to keep the current key.
              </p>

              <Input
                label="Google API key"
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
                  <KeyRound size={16} aria-hidden /> Google sign-in
                </h2>
                <Badge variant={sourceBadge(settings.google_client_id_source)}>
                  Client ID: {sourceLabel(settings.google_client_id_source)}
                </Badge>
              </header>

              <p className="admin-settings__hint">
                These end in .apps.googleusercontent.com. They are not the Places API key. The website and the Android app use the Web client ID. The iOS app uses the iOS client ID. Save the Android client ID for the package and SHA-1 you registered. After you save the iOS client ID, put the same value in the phone app as EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and build the app again so iOS can return from Google.
              </p>

              <Input
                label="Google sign-in client ID"
                autoComplete="off"
                placeholder="123456789-abc.apps.googleusercontent.com"
                value={googleClientId}
                onChange={(event) => {
                  setGoogleClientId(event.target.value);
                  markDirty('google_client_id');
                }}
              />
              {settings.google_client_id_source === 'admin' ? (
                <Button
                  label="Use .env client ID instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_google_client_id: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.google_ios_client_id_source)}>
                  iOS: {sourceLabel(settings.google_ios_client_id_source)}
                </Badge>
              </div>
              <Input
                label="iOS client ID"
                autoComplete="off"
                placeholder="123456789-ios.apps.googleusercontent.com"
                value={googleIosClientId}
                onChange={(event) => {
                  setGoogleIosClientId(event.target.value);
                  markDirty('google_ios_client_id');
                }}
              />
              {settings.google_ios_client_id_source === 'admin' ? (
                <Button
                  label="Use .env iOS client ID instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_google_ios_client_id: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.google_android_client_id_source)}>
                  Android: {sourceLabel(settings.google_android_client_id_source)}
                </Badge>
              </div>
              <Input
                label="Android client ID"
                autoComplete="off"
                placeholder="123456789-android.apps.googleusercontent.com"
                value={googleAndroidClientId}
                onChange={(event) => {
                  setGoogleAndroidClientId(event.target.value);
                  markDirty('google_android_client_id');
                }}
              />
              {settings.google_android_client_id_source === 'admin' ? (
                <Button
                  label="Use .env Android client ID instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_google_android_client_id: true })}
                />
              ) : null}
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <MessageSquare size={16} aria-hidden /> Text messages
                </h2>
              </header>

              <p className="admin-settings__hint">
                Plan invites still go by email when these are empty. A text is sent only when Account SID, Auth token, and either a From number or a Messaging Service SID are saved. The auth token stays on the server.
              </p>

              <label className="admin-settings__toggle">
                <input
                  type="checkbox"
                  checked={planInviteSmsEnabled}
                  onChange={(event) => {
                    setPlanInviteSmsEnabled(event.target.checked);
                    markDirty('plan_invite_sms_enabled');
                  }}
                />
                <span>Enable SMS on plan invitations</span>
              </label>
              <p className="admin-settings__hint">
                Off by default. When off, the mobile number field is hidden and no invite texts are sent. Twilio credentials below stay saved for when you turn this on.
              </p>

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.twilio_account_sid_source)}>
                  Account SID: {sourceLabel(settings.twilio_account_sid_source)}
                </Badge>
              </div>
              <Input
                label="Twilio Account SID"
                autoComplete="off"
                placeholder="AC…"
                value={twilioAccountSid}
                onChange={(event) => {
                  setTwilioAccountSid(event.target.value);
                  markDirty('twilio_account_sid');
                }}
              />
              {settings.twilio_account_sid_source === 'admin' ? (
                <Button
                  label="Use .env Account SID instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_twilio_account_sid: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.twilio_auth_token_source)}>
                  Auth token: {sourceLabel(settings.twilio_auth_token_source)}
                </Badge>
              </div>
              <p className="admin-settings__hint">
                {settings.twilio_auth_token_set
                  ? `Token in use${settings.twilio_auth_token_hint ? ` (${settings.twilio_auth_token_hint})` : ''}.`
                  : 'No Twilio auth token in admin or .env.'}{' '}
                Leave blank to keep the current token.
              </p>
              <Input
                label="Twilio auth token"
                type="password"
                autoComplete="off"
                placeholder={settings.twilio_auth_token_set ? '•••••••• (leave blank to keep)' : 'Auth token'}
                value={twilioAuthToken}
                onChange={(event) => {
                  setTwilioAuthToken(event.target.value);
                  markDirty('twilio_auth_token');
                }}
              />
              {settings.twilio_auth_token_source === 'admin' ? (
                <Button
                  label="Use .env auth token instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_twilio_auth_token: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.twilio_from_number_source)}>
                  From number: {sourceLabel(settings.twilio_from_number_source)}
                </Badge>
              </div>
              <Input
                label="Twilio from number"
                autoComplete="off"
                placeholder="+15551234567"
                value={twilioFromNumber}
                onChange={(event) => {
                  setTwilioFromNumber(event.target.value);
                  markDirty('twilio_from_number');
                }}
              />
              {settings.twilio_from_number_source === 'admin' ? (
                <Button
                  label="Use .env from number instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_twilio_from_number: true })}
                />
              ) : null}

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.twilio_messaging_service_sid_source)}>
                  Messaging service: {sourceLabel(settings.twilio_messaging_service_sid_source)}
                </Badge>
              </div>
              <Input
                label="Twilio messaging service SID"
                autoComplete="off"
                placeholder="MG… (optional if a from number is set)"
                value={twilioMessagingServiceSid}
                onChange={(event) => {
                  setTwilioMessagingServiceSid(event.target.value);
                  markDirty('twilio_messaging_service_sid');
                }}
              />
              {settings.twilio_messaging_service_sid_source === 'admin' ? (
                <Button
                  label="Use .env messaging service instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_twilio_messaging_service_sid: true })}
                />
              ) : null}
            </section>

            <section className="admin-settings__section">
              <header className="admin-settings__header">
                <h2>
                  <MapPin size={16} aria-hidden /> Find Local
                </h2>
                <Badge variant={sourceBadge(settings.findlocal_api_key_source)}>
                  Key: {sourceLabel(settings.findlocal_api_key_source)}
                </Badge>
              </header>

              <p className="admin-settings__hint">
                {settings.findlocal_api_key_set
                  ? `Key in use${settings.findlocal_api_key_hint ? ` (${settings.findlocal_api_key_hint})` : ''}.`
                  : 'No Find Local key configured in admin or .env.'}{' '}
                Used for local events in covered cities. Enter a new key only when you want to override. Leave blank to keep the current key.
              </p>

              <Input
                label="Find Local API key"
                type="password"
                autoComplete="off"
                placeholder={
                  settings.findlocal_api_key_set ? '•••••••• (leave blank to keep)' : 'Paste the key'
                }
                value={findLocalApiKey}
                onChange={(event) => {
                  setFindLocalApiKey(event.target.value);
                  markDirty('findlocal_api_key');
                }}
              />
              {settings.findlocal_api_key_source === 'admin' ? (
                <Button
                  label="Use .env key instead"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_findlocal_api_key: true })}
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

              <div className="admin-settings__row-meta">
                <Badge variant={sourceBadge(settings.support_email_source)}>
                  Support email: {sourceLabel(settings.support_email_source)}
                </Badge>
              </div>
              <Input
                label="Support email"
                type="email"
                placeholder={String(settings.support_email_env ?? 'myplnrapp@gmail.com')}
                value={supportEmail}
                onChange={(event) => {
                  setSupportEmail(event.target.value);
                  markDirty('support_email');
                }}
              />
              {settings.support_email_source === 'admin' ? (
                <Button
                  label="Reset support email to default"
                  type="button"
                  variant="ghost"
                  onClick={() => void clearOverride({ clear_support_email: true })}
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

        {!loading ? <PlanCardImagesSection /> : null}
      </div>
    </AppShell>
  );
}
