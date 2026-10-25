import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { BirthDateField } from '../components/auth/BirthDateField';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { TermsAcceptance } from '../components/auth/TermsAcceptance';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../contexts/AuthContext';
import { isOldEnoughToRegister, MINIMUM_ACCOUNT_AGE } from '../lib/ageGate';
import type { ApiError } from '../lib/apiTypes';
import { isInvitePath, resolveRegisterPrefill } from '../lib/inviteHelpers';
import { postAuthHome, resolvePostAuthPath } from '../lib/postAuthPath';
import { checkoutErrorMessage } from '../lib/billingHelpers';
import { startWebProCheckout } from '../lib/startProCheckout';

export function RegisterPage() {
  const { register, loginWithGoogle, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = resolveRegisterPrefill(location.state);
  const isInviteSignup = Boolean(prefill.invite_token) || isInvitePath(prefill.from);

  const [name, setName] = useState('');
  const [email, setEmail] = useState(prefill.email ?? '');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const checkoutStarted = useRef(false);

  function validateBirthday(): boolean {
    if (!birthday.trim()) {
      setError('Enter your birthday.');
      return false;
    }

    if (!isOldEnoughToRegister(birthday)) {
      setError(`You must be at least ${MINIMUM_ACCOUNT_AGE} years old to use PLNR.`);
      return false;
    }

    return true;
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated || !prefill.proCheckout || checkoutStarted.current) {
      return;
    }

    checkoutStarted.current = true;
    void startWebProCheckout().catch((err: unknown) => {
      checkoutStarted.current = false;
      setError(checkoutErrorMessage(err));
    });
  }, [authLoading, isAuthenticated, prefill.proCheckout]);

  if (!authLoading && isAuthenticated && !prefill.proCheckout) {
    // Invite signup already accepted the share server-side — never bounce back to the spent invite URL.
    // `from` is often `/invite/:token`; resolvePostAuthPath would send users there after auth flips.
    const dest = isInviteSignup
      ? postAuthHome(user?.role)
      : resolvePostAuthPath(user?.role, prefill.from ?? null);

    return <Navigate to={dest} replace />;
  }

  async function handleGoogleCredential(idToken: string | null, accessToken?: string | null) {
    if (!acceptedTerms) {
      setError('Accept the terms and conditions to create an account.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Birthday comes from Google People API via access_token; form DOB is only a fallback.
      await loginWithGoogle(
        idToken,
        prefill.invite_token,
        birthday.trim() || undefined,
        accessToken,
      );

      if (prefill.proCheckout) {
        try {
          await startWebProCheckout();
        } catch (err) {
          setError(checkoutErrorMessage(err));
        }
        return;
      }

      navigate('/plans', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      const dobError = apiError.errors?.date_of_birth?.[0];
      setError(
        dobError
          ? `${dobError} Enter it below and try Google again, or create an account with email.`
          : apiError.message || 'Unable to continue with Google.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!acceptedTerms) {
      setError('Accept the terms and conditions to create an account.');

      return;
    }

    if (!validateBirthday()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(
        name.trim(),
        email.trim(),
        password,
        passwordConfirmation,
        birthday.trim(),
        prefill.invite_token,
      );

      if (prefill.proCheckout) {
        try {
          await startWebProCheckout();
        } catch (err) {
          setError(checkoutErrorMessage(err));
        }
        return;
      }

      navigate('/plans', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  const loginState = {
    ...(prefill.from ? { from: prefill.from } : {}),
    ...(prefill.proCheckout ? { proCheckout: true } : {}),
  };

  return (
    <AuthLayout
      title={prefill.invite_token ? 'Accept your invite' : 'Create your account'}
      subtitle={
        prefill.invite_token
          ? 'Create an account with the invited email to view the shared plan.'
          : 'Save itineraries and track your night outs in one place.'
      }
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" state={loginState}>
            Log in
          </Link>
        </>
      }
    >
      <form className="page-stack" onSubmit={(event) => void handleSubmit(event)}>
        <Input
          label="Name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          readOnly={prefill.emailPrefillReadonly === true}
          required
        />
        <BirthDateField value={birthday} onChange={setBirthday} />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          required
        />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          required
        />
        <TermsAcceptance
          accepted={acceptedTerms}
          onChange={(next) => {
            setAcceptedTerms(next);
            if (next) {
              setError((current) =>
                current === 'Accept the terms and conditions to create an account.' ? null : current,
              );
            }
          }}
        />
        <GoogleSignInButton
          inactive={!acceptedTerms}
          onInactivePress={() =>
            setError('Accept the terms and conditions to create an account.')
          }
          onCredential={(idToken, accessToken) => void handleGoogleCredential(idToken, accessToken)}
          onError={setError}
        />
        {error ? <p className="error-text">{error}</p> : null}
        <Button label={prefill.invite_token ? 'Create account & accept' : 'Create account'} type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
