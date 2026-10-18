import { Link, Mail, MessageCircle, Share, UserPlus } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import './PlanShareTray.css';

const WEB_ORIGIN = 'https://myplnr.app';

type PlanShareTrayProps = {
  sessionUuid: string;
  planType?: string;
  title: string;
  canInvite: boolean;
  onEmail: () => void;
  onInvite: () => void;
};

type ShareAction = {
  key: string;
  label: string;
  color: string;
  icon: ReactNode;
  onClick: () => void;
};

export function planPageUrl(planType: string | undefined, sessionUuid: string): string {
  const slug = planType?.trim() || 'plan';

  return `${WEB_ORIGIN}/plan/${slug}/itinerary?session=${sessionUuid}`;
}

function shareText(title: string, url: string): string {
  const name = title.trim() || 'A plan';

  return `${name} on PLNR\n${url}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2Zm5.76 13.92c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.12.11-1.81-.11-.42-.14-.95-.31-1.64-.6-2.88-1.24-4.76-4.14-4.9-4.33-.14-.2-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.37.24-.28.64-.4.86-.4h.62c.2 0 .46-.02.7.54.24.6.84 2.08.91 2.23.08.16.12.34.02.54-.1.2-.14.32-.28.5-.14.16-.3.36-.42.48-.14.14-.28.28-.12.54.16.26.7 1.16 1.5 1.88 1.04.92 1.9 1.22 2.18 1.36.28.14.44.12.6-.08.16-.2.7-.82.88-1.1.18-.28.38-.22.62-.14.26.08 1.62.76 1.9.9.28.14.46.2.52.32.08.12.08.68-.16 1.36Z"
      />
    </svg>
  );
}

export function PlanShareTray({
  sessionUuid,
  planType,
  title,
  canInvite,
  onEmail,
  onInvite,
}: PlanShareTrayProps) {
  const [copied, setCopied] = useState(false);
  const url = planPageUrl(planType, sessionUuid);
  const message = shareText(title, url);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = window.setTimeout(() => setCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function sharePlan() {
    if (navigator.share) {
      try {
        await navigator.share({ title: title.trim() || 'A plan on PLNR', text: message, url });

        return;
      } catch {
        return;
      }
    }

    await copyLink();
  }

  const actions: ShareAction[] = [
    ...(canInvite
      ? [
          {
            key: 'invite',
            label: 'Invite',
            color: 'var(--color-accent)',
            icon: <UserPlus />,
            onClick: onInvite,
          },
        ]
      : []),
    {
      key: 'email',
      label: 'Email',
      color: '#1A73E8',
      icon: <Mail />,
      onClick: onEmail,
    },
    {
      key: 'message',
      label: 'Message',
      color: '#34C759',
      icon: <MessageCircle />,
      onClick: () => {
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
      },
    },
    {
      key: 'copy',
      label: copied ? 'Copied' : 'Copy link',
      color: '#5F6368',
      icon: <Link />,
      onClick: () => void copyLink(),
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      color: '#25D366',
      icon: <WhatsAppIcon />,
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
      },
    },
    {
      key: 'share',
      label: 'Share',
      color: '#007AFF',
      icon: <Share />,
      onClick: () => void sharePlan(),
    },
  ];

  return (
    <div className="plan-share-tray">
      {actions.map((action) => (
        <button key={action.key} type="button" className="plan-share-tray__action" onClick={action.onClick}>
          <span className="plan-share-tray__circle" style={{ background: action.color }}>
            {action.icon}
          </span>
          <span className="plan-share-tray__label">{action.label}</span>
        </button>
      ))}
    </div>
  );
}
