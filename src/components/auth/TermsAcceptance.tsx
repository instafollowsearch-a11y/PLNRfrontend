import { useId } from 'react';

import { TERMS_URL } from '../../lib/api';
import './TermsAcceptance.css';

type TermsAcceptanceProps = {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
};

function privacyUrl() {
  try {
    return new URL('/privacy', TERMS_URL).href;
  } catch {
    return 'https://myplnr.app/privacy';
  }
}

export function TermsAcceptance({ accepted, onChange }: TermsAcceptanceProps) {
  const id = useId();

  return (
    <div className="terms-accept">
      <input
        id={id}
        type="checkbox"
        checked={accepted}
        onChange={(event) => onChange(event.target.checked)}
      />
      <p>
        <a href={TERMS_URL} target="_blank" rel="noreferrer">
          Terms and Conditions
        </a>
        <a href={privacyUrl()} target="_blank" rel="noreferrer">
          Privacy Policy
        </a>
        <label htmlFor={id}>I have read and accept the terms and conditions of the PLNR app</label>
      </p>
    </div>
  );
}
