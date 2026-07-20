import { useNavigate, useParams } from 'react-router-dom';

import { QuestionFlow } from '../components/QuestionFlow';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/ui/EmptyState';
import { planSessionApi } from '../lib/api';
import { savePlanSessionUuid, withSession } from '../lib/session';
import { getPlanFlowConfig, parsePlanAnswers, usePlanTypeParam } from './HomePage';

export function QuestionsPage() {
  const { planType: planTypeParam } = useParams();
  const planType = usePlanTypeParam(planTypeParam);
  const navigate = useNavigate();
  const config = planType ? getPlanFlowConfig(planType) : null;

  if (!planType || !config) {
    return (
      <AppShell showBack backTo="/">
        <EmptyState title="Plan type not found" description="Choose a plan from the home page." />
      </AppShell>
    );
  }

  async function handleComplete(rawAnswers: Record<string, string>) {
    if (!planType) {
      return;
    }

    const answers = parsePlanAnswers(planType, rawAnswers);

    const createResponse = await planSessionApi.createPlanSession(planType, answers);
    const sessionUuid = createResponse.data.plan_session.uuid;

    savePlanSessionUuid(sessionUuid);
    await planSessionApi.generateSuggestions(sessionUuid);

    navigate(withSession(`/plan/${planType}/suggestions`, sessionUuid));
  }

  return (
    <AppShell title={config.title} showBack backTo="/">
      <QuestionFlow questions={config.questions} onComplete={handleComplete} />
    </AppShell>
  );
}
