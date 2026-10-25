import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlanChannelShareRow } from './PlanShareTray';
import './SharePlanModal.css';

type SharePlanModalProps = {
  sessionUuid: string;
  planType?: string;
  title?: string;
  onClose: () => void;
  onSent?: (email: string) => void;
  returnPath?: string;
};

export function SharePlanModal({
  sessionUuid,
  planType,
  title = 'a plan',
  onClose,
}: SharePlanModalProps) {
  return (
    <div className="share-plan-modal" role="presentation">
      <button type="button" className="share-plan-modal__scrim" aria-label="Dismiss" onClick={onClose} />
      <div
        className="share-plan-modal__panel-wrap"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-plan-title"
      >
        <Card className="share-plan-modal__panel">
          <h2 id="share-plan-title" className="share-plan-modal__title">
            Send invitation
          </h2>
          <p className="share-plan-modal__lead">
            Invite someone with Email, Messages, WhatsApp, or Share. They get a link to view the itinerary.
          </p>
          <PlanChannelShareRow
            sessionUuid={sessionUuid}
            planType={planType}
            title={title}
            mode="invite"
          />
          <div className="share-plan-modal__actions">
            <Button label="Close" variant="ghost" onClick={onClose} />
          </div>
        </Card>
      </div>
    </div>
  );
}
