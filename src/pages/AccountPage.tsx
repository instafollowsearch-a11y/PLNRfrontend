import { useEffect, useState, type FormEvent } from 'react';

import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageIntro } from '../components/ui/PageIntro';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/api';
import { firstApiError } from '../lib/apiErrorMessage';
import type { ApiError } from '../lib/apiTypes';
import './AccountPage.css';

function fieldMessage(error: ApiError | null, field: string): string | null {
  return error?.errors?.[field]?.[0] ?? null;
}

export function AccountPage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [emailPassword, setEmailPassword] = useState('');
  const [detailsError, setDetailsError] = useState<ApiError | null>(null);
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<ApiError | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name);
    setEmail(user.email);
    setCity(user.city ?? '');
    setHasLoadedProfile(true);
  }, [user]);

  if (!user) {
    return null;
  }

  const account = user;
  const emailChanged =
    hasLoadedProfile && email.trim().toLowerCase() !== account.email.trim().toLowerCase();

  async function handleDetailsSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSavingDetails(true);
    setDetailsError(null);
    setDetailsMessage(null);

    try {
      const response = await authApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
        city: city.trim() || account.city ? city.trim() : undefined,
        current_password: emailChanged ? emailPassword : undefined,
      });
      await refreshUser();
      setName(response.data.user.name);
      setEmail(response.data.user.email);
      setCity(response.data.user.city ?? '');
      setEmailPassword('');
      setDetailsMessage(response.message || 'Profile updated.');
    } catch (err) {
      const apiError = err as ApiError;
      setDetailsError({
        message: firstApiError(err, 'Unable to update profile.'),
        errors: apiError.errors,
      });
    } finally {
      setIsSavingDetails(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSavingPassword(true);
    setPasswordError(null);
    setPasswordMessage(null);

    try {
      const response = await authApi.changePassword(currentPassword, nextPassword, confirmPassword);
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      setPasswordMessage(response.message || 'Password updated.');
    } catch (err) {
      const apiError = err as ApiError;
      setPasswordError({
        message: firstApiError(err, 'Unable to update password.'),
        errors: apiError.errors,
      });
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <AppShell title="Profile">
      <PageIntro
        eyebrow="Account"
        title={user.name}
        subtitle="Review your details, then save changes. Changing your email asks for your current password."
      />
      <div className="account-page">
        <Card>
          <form
            className="page-stack"
            aria-label="Profile details"
            onSubmit={(event) => void handleDetailsSubmit(event)}
          >
            <h2 className="account-page__heading">Profile details</h2>
            <Input
              label="Name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={fieldMessage(detailsError, 'name')}
              required
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={fieldMessage(detailsError, 'email')}
              required
            />
            <Input
              label="City"
              autoComplete="address-level2"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              error={fieldMessage(detailsError, 'city')}
            />
            {emailChanged ? (
              <PasswordField
                label="Current password"
                autoComplete="current-password"
                value={emailPassword}
                onChange={setEmailPassword}
                error={fieldMessage(detailsError, 'current_password')}
                required
              />
            ) : null}
            {detailsMessage ? <p role="status">{detailsMessage}</p> : null}
            {detailsError && !detailsError.errors ? <p className="error-text">{detailsError.message}</p> : null}
            <Button label="Save details" type="submit" loading={isSavingDetails} />
          </form>
        </Card>

        <Card>
          <form
            className="page-stack"
            aria-label="Change password"
            onSubmit={(event) => void handlePasswordSubmit(event)}
          >
            <h2 className="account-page__heading">Change password</h2>
            <p className="account-page__note">
              Use at least 8 characters. Other signed-in devices will be signed out.
            </p>
            <PasswordField
              label="Current password"
              name="current-password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
              error={fieldMessage(passwordError, 'current_password')}
              required
            />
            <PasswordField
              label="New password"
              name="new-password"
              autoComplete="new-password"
              value={nextPassword}
              onChange={setNextPassword}
              error={fieldMessage(passwordError, 'password')}
              minLength={8}
              required
            />
            <PasswordField
              label="Confirm new password"
              name="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={fieldMessage(passwordError, 'password_confirmation')}
              minLength={8}
              required
            />
            {passwordMessage ? <p role="status">{passwordMessage}</p> : null}
            {passwordError && !passwordError.errors ? <p className="error-text">{passwordError.message}</p> : null}
            <Button label="Update password" type="submit" loading={isSavingPassword} variant="secondary" />
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
