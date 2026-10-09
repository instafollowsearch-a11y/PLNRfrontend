import { useEffect, useRef } from 'react';

import { googleWebClientId } from '../../lib/googleClientId';
import './GoogleSignInButton.css';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const clientId = googleWebClientId();
  const hostRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  onCredentialRef.current = onCredential;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!clientId || !hostRef.current) {
      return;
    }

    let cancelled = false;

    function renderButton() {
      const host = hostRef.current;
      const googleId = window.google?.accounts?.id;

      if (cancelled || !host || !googleId || !clientId) {
        return;
      }

      googleId.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onCredentialRef.current(response.credential);

            return;
          }

          onErrorRef.current('Google did not return a sign-in token.');
        },
      });
      host.replaceChildren();
      googleId.renderButton(host, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 320,
      });
    }

    if (window.google?.accounts?.id) {
      renderButton();

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

    script.addEventListener('load', renderButton);

    return () => {
      cancelled = true;
      script?.removeEventListener('load', renderButton);
    };
  }, [clientId]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="google-sign-in" data-testid="google-sign-in">
      <div ref={hostRef} />
      <p className="google-sign-in__or">or</p>
    </div>
  );
}
