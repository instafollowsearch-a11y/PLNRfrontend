import { Calendar, Mail, Sparkles } from 'lucide-react';

import './TrustStrip.css';

const ITEMS = [
  { icon: Sparkles, label: 'Curated plans' },
  { icon: Calendar, label: 'Plans worth sharing' },
  { icon: Mail, label: 'Delivered by email' },
];

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Product benefits">
      <div className="trust-strip__inner">
        {ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="trust-strip__item">
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
