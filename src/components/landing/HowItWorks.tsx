import { CheckCircle2, Mail, MessageSquare, Sparkles } from 'lucide-react';

import './HowItWorks.css';

const STEPS = [
  {
    icon: MessageSquare,
    title: 'Answer a few questions',
    description: 'Tell us about your city, dates, interests, and budget.',
  },
  {
    icon: Sparkles,
    title: 'Get AI suggestions',
    description: 'We generate tailored outing ideas you can refine anytime.',
  },
  {
    icon: CheckCircle2,
    title: 'Approve your itinerary',
    description: 'Pick a plan and we build a detailed timeline for you.',
  },
  {
    icon: Mail,
    title: 'View on PLNR',
    description: 'Open the finished plan on PLNR. A link can go to your inbox.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__inner">
        <div className="how-it-works__intro">
          <p className="landing-section-eyebrow">How it works</p>
          <h2 className="landing-section-title">From idea to itinerary in four steps</h2>
          <p className="landing-section-subtitle">
            PLNR guides you through planning, then keeps the finished plan on PLNR.
          </p>
        </div>

        <ol className="how-it-works__steps">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <li key={step.title} className="how-it-works__step">
                <span className="how-it-works__number">{index + 1}</span>
                <span className="how-it-works__icon">
                  <Icon size={22} />
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
