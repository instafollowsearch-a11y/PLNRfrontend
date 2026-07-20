import type { ReactNode } from 'react';

import './PageIntro.css';

type PageIntroProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function PageIntro({ title, subtitle, children }: PageIntroProps) {
  return (
    <header className="page-intro-block">
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </header>
  );
}
