import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/auth/AuthLayout';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { TermsAcceptance } from '../components/auth/TermsAcceptance';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordField } from '../components/ui/PasswordField';
import { useAuth } from '../contexts/AuthContext';
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
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const checkoutStarted = useRef(false);

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

  async function handleGoogleCredential(idToken: string) {
    if (!acceptedTerms) {
      setError('Accept the terms and conditions to create an account.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle(idToken, prefill.invite_token);

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
      setError(apiError.message || 'Unable to continue with Google.');
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

    setLoading(true);
    setError(null);

    try {
      await register(
        name.trim(),
        email.trim(),
        password,
        passwordConfirmation,
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
      <TermsAcceptance accepted={acceptedTerms} onChange={setAcceptedTerms} />
      <GoogleSignInButton onCredential={(idToken) => void handleGoogleCredential(idToken)} onError={setError} />
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
        {error ? <p className="error-text">{error}</p> : null}
        <Button label={prefill.invite_token ? 'Create account & accept' : 'Create account'} type="submit" loading={loading} />
      </form>
    </AuthLayout>
  );
}
