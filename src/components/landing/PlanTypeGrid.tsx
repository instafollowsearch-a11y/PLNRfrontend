import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PLAN_TYPES } from '../../constants/planTypes';
import { planTypeAccents, planTypeIcons } from '../../constants/theme';
import { accountApi, type PlanCardImages } from '../../lib/api';
import { PlanTypeLandingCard } from './PlanTypeLandingCard';
import { HomeProSection } from './HomeProSection';
import './PlanTypeGrid.css';

export function PlanTypeGrid() {
  const navigate = useNavigate();
  const [images, setImages] = useState<PlanCardImages | null>(null);

  useEffect(() => {
    let isCurrent = true;

    accountApi
      .getPlanCardImages()
      .then((response) => {
        if (isCurrent) {
          setImages(response.data.images);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setImages(null);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section id="plans" className="plan-type-grid">
      <div className="plan-type-grid__inner">
        <div className="plan-type-grid__intro">
          <p className="landing-section-eyebrow">Choose your plan</p>
          <h2 className="landing-section-title">What are you planning?</h2>
          <p className="landing-section-subtitle">
            Pick a plan type to get started in minutes. Every plan is free.
          </p>
        </div>

        <div className="plan-type-grid__cards">
          {PLAN_TYPES.map((planType) => (
            <PlanTypeLandingCard
              key={planType.slug}
              slug={planType.slug}
              label={planType.label}
              description={planType.description}
              accent={planTypeAccents[planType.slug]}
              icon={planTypeIcons[planType.slug]}
              href={`/plan/${planType.slug}`}
              imageUrl={images?.[planType.slug]}
              onClick={() => navigate(`/plan/${planType.slug}`)}
            />
          ))}
        </div>

        <div className="plan-type-grid__pro">
          <HomeProSection />
        </div>
      </div>
    </section>
  );
}
