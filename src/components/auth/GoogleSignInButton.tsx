import { useEffect, useRef, useState } from 'react';

import { loadGoogleWebClientId } from '../../lib/googleClientId';
import './GoogleSignInButton.css';

/** Same scopes other platforms use so birthday is granted in the ONE Google consent. */
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/user.birthday.read',
].join(' ');

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleAccountsOauth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
    error_callback?: (error: { type?: string }) => void;
  }) => GoogleTokenClient;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: GoogleAccountsOauth2;
      };
    };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type GoogleSignInButtonProps = {
  /** OAuth access token from a single consent (includes birthday when granted). */
  onCredential: (idToken: string | null, accessToken?: string | null) => void;
  onError: (message: string) => void;
  /** Dimmed / blocked until prerequisites (e.g. terms) are met. Still clickable to surface guidance. */
  inactive?: boolean;
  onInactivePress?: () => void;
};

export function GoogleSignInButton({
  onCredential,
  onError,
  inactive = false,
  onInactivePress,
}: GoogleSignInButtonProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const inactiveRef = useRef(inactive);
  const onInactivePressRef = useRef(onInactivePress);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;
  inactiveRef.current = inactive;
  onInactivePressRef.current = onInactivePress;

  useEffect(() => {
    let cancelled = false;

    void loadGoogleWebClientId().then((id) => {
      if (!cancelled) {
        setClientId(id);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    let cancelled = false;

    function initTokenClient() {
      const oauth2 = window.google?.accounts?.oauth2;

      if (cancelled || !oauth2 || !clientId) {
        return;
      }

      tokenClientRef.current = oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        callback: (response) => {
          setBusy(false);

          if (response.error || !response.access_token) {
            onErrorRef.current(
              response.error_description ||
                response.error ||
                'Google sign-in could not be completed.',
            );

            return;
          }

          // Identity + birthday both come from this access token (People API + userinfo).
          onCredentialRef.current(null, response.access_token);
        },
        error_callback: (error) => {
          setBusy(false);

          if (error.type === 'popup_closed') {
            return;
          }

          onErrorRef.current('Google sign-in could not be completed.');
        },
      });
      setReady(true);
    }

    if (window.google?.accounts?.oauth2) {
      initTokenClient();

      return () => {
        cancelled = true;
      };
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);

    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onerror = () => onErrorRef.current('Google sign-in could not be loaded.');
      document.head.appendChild(script);
    }

    script.addEventListener('load', initTokenClient);

    return () => {
      cancelled = true;
      script?.removeEventListener('load', initTokenClient);
    };
  }, [clientId]);

  if (!clientId || !ready) {
    return null;
  }

  function handleClick() {
    if (inactiveRef.current) {
      onInactivePressRef.current?.();

      return;
    }

    const client = tokenClientRef.current;

    if (!client || busy) {
      return;
    }

    setBusy(true);
    // One Google popup: account + consent for profile/email/birthday together.
    client.requestAccessToken();
  }

  return (
    <div className="google-sign-in" data-testid="google-sign-in">
      <button
        type="button"
        className={`google-sign-in__button${inactive ? ' google-sign-in__button--inactive' : ''}`}
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        aria-disabled={inactive || busy}
      >
        <GoogleMark />
        <span>Continue with Google</span>
      </button>
      <p className="google-sign-in__or">or</p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="google-sign-in__mark" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
