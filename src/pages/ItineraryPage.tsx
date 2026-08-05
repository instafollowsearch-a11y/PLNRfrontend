import type { PlanTypeSlug } from '../constants/planFlowConfig';
import { Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ItineraryView } from '../components/ItineraryView';
import { SharePlanModal } from '../components/plans/SharePlanModal';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { planSessionApi } from '../lib/api';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';

export function ItineraryPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [session, setSession] = useState<Awaited<ReturnType<typeof planSessionApi.getPlanSession>>['data']['plan_session'] | null>(null);

  useEffect(() => {
    if (!sessionUuid) {
      setLoading(false);

      return;
    }

    void planSessionApi
      .getPlanSession(sessionUuid)
      .then((response) => setSession(response.data.plan_session))
      .finally(() => setLoading(false));
  }, [sessionUuid]);

  const selectedSuggestion = useMemo(() => {
    return session?.suggestions?.find((item) => item.selected_at) ?? session?.suggestions?.[0];
  }, [session]);

  const roadTripSummary = useMemo(() => {
    if (planType !== 'road_trip' || !selectedSuggestion) {
      return undefined;
    }

    return {
      gas: selectedSuggestion.payload.estimated_gas_cost,
      food: selectedSuggestion.payload.estimated_food_cost,
      driveTime: selectedSuggestion.payload.total_drive_time,
    };
  }, [planType, selectedSuggestion]);

  if (!planType || !config) {
    return (
      <AppShell showBack backTo="/">
        <EmptyState title="Plan type not found" />
      </AppShell>
    );
  }

  if (!sessionUuid) {
    return (
      <AppShell title="Itinerary" showBack backTo={`/plan/${planType}`}>
        <EmptyState title="Session expired" />
      </AppShell>
    );
  }

  const content = session?.itinerary?.content;
  const canShare =
    Boolean(user) &&
    session?.access_role !== 'viewer' &&
    (session?.access_role === 'owner' || session?.access_role == null);

  return (
    <AppShell title="Itinerary" showBack backTo={withSession(`/plan/${planType}/confirm`, sessionUuid)}>
      <FunnelStepper current="itinerary" planType={planType} sessionUuid={sessionUuid} />
      {loading ? <LoadingState message="Loading itinerary…" /> : null}

      {!loading && content ? (
        <>
          <ItineraryView
            content={content}
            planType={planType as PlanTypeSlug}
            roadTripSummary={roadTripSummary}
          />
          <div className="page-stack">
            <Button
              label="Send to my email"
              onClick={() => navigate(withSession(`/plan/${planType}/send`, sessionUuid))}
            />
            {canShare ? (
              <Button
                label="Share plan"
                variant="secondary"
                icon={<Share2 size={16} />}
                onClick={() => setShareOpen(true)}
              />
            ) : null}
          </div>
          {shareOpen && sessionUuid ? (
            <SharePlanModal
              sessionUuid={sessionUuid}
              returnPath={withSession(`/plan/${planType}/itinerary`, sessionUuid)}
              onClose={() => setShareOpen(false)}
            />
          ) : null}
        </>
      ) : null}

      {!loading && !content ? (
        <EmptyState title="No itinerary yet" description="Generate an itinerary to review it here." />
      ) : null}
    </AppShell>
  );
}
