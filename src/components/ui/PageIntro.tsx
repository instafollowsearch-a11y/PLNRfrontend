import type { ReactNode } from 'react';

import './PageIntro.css';

type PageIntroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function PageIntro({ title, subtitle, eyebrow, children }: PageIntroProps) {
  return (
    <header className="page-intro-block">
      {eyebrow ? <p className="page-intro-block__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {subtitle ? <p className="page-intro-block__subtitle">{subtitle}</p> : null}
      {children}
    </header>
  );
}
