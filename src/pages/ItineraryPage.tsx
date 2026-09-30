import type { PlanTypeSlug } from '../constants/planFlowConfig';
import { Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ItineraryView } from '../components/ItineraryView';
import { SharePlanModal } from '../components/plans/SharePlanModal';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { FunnelStepper } from '../components/ui/FunnelStepper';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { planSessionApi } from '../lib/api';
import { previewItinerary } from '../lib/itineraryPreview';
import { resolveSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, usePlanTypeParam } from './HomePage';

export function ItineraryPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const [searchParams] = useSearchParams();
  const sessionUuid = resolveSessionUuid(searchParams);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;
  const { user, loading: authLoading } = useAuth();

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
  const isViewer = session?.access_role === 'viewer';
  const showPreview = !authLoading && !user && !isViewer;
  const visibleContent = content && showPreview ? previewItinerary(content) : content;
  const returnPath = withSession(`/plan/${planType}/itinerary`, sessionUuid);
  const canShare =
    Boolean(user) &&
    !isViewer &&
    (session?.access_role === 'owner' || session?.access_role == null);

  return (
    <AppShell title="Itinerary" showBack backTo={withSession(`/plan/${planType}/confirm`, sessionUuid)}>
      <FunnelStepper current="itinerary" planType={planType} sessionUuid={sessionUuid} />
      {loading || authLoading ? <LoadingState message="Loading itinerary…" /> : null}

      {!loading && !authLoading && visibleContent ? (
        <>
          <ItineraryView
            content={visibleContent}
            planType={planType as PlanTypeSlug}
            roadTripSummary={roadTripSummary}
          />
          {showPreview ? (
            <Card className="page-stack">
              <h2 className="itinerary-view__title">Create a free account to see the full plan.</h2>
              <div className="page-stack">
                <Button
                  label="Create an account"
                  onClick={() => navigate('/register', { state: { from: returnPath } })}
                />
                <Button
                  label="Log in"
                  variant="secondary"
                  onClick={() => navigate('/login', { state: { from: returnPath } })}
                />
              </div>
            </Card>
          ) : (
            <div className="page-stack">
              {!isViewer ? (
                <Button
                  label="Send to my email"
                  onClick={() => navigate(withSession(`/plan/${planType}/send`, sessionUuid))}
                />
              ) : null}
              {canShare ? (
                <Button
                  label="Share plan"
                  variant="secondary"
                  icon={<Share2 size={16} />}
                  onClick={() => setShareOpen(true)}
                />
              ) : null}
            </div>
          )}
          {shareOpen && sessionUuid ? (
            <SharePlanModal
              sessionUuid={sessionUuid}
              returnPath={withSession(`/plan/${planType}/itinerary`, sessionUuid)}
              onClose={() => setShareOpen(false)}
            />
          ) : null}
          {!isViewer && sessionUuid ? (
            <Button
              label="Something else instead"
              variant="secondary"
              onClick={() => navigate(withSession(`/plan/${planType}/refine`, sessionUuid))}
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
