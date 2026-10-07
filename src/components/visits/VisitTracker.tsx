import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { accountApi } from '../../lib/api';

const DEDUPE_MS = 30_000;
const STORAGE_KEY = 'plnr-last-visit';

function isAdminPath(path: string): boolean {
  return path === '/admin' || path.startsWith('/admin/');
}

export function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (isAdminPath(path)) {
      return;
    }

    const now = Date.now();

    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);

      if (raw) {
        const last = JSON.parse(raw) as { path?: string; at?: number };

        if (last.path === path && typeof last.at === 'number' && now - last.at < DEDUPE_MS) {
          return;
        }
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ path, at: now }));
    } catch {
      // Private browsing can block sessionStorage. The request still goes out.
    }

    let timezone: string | undefined;

    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
    } catch {
      timezone = undefined;
    }

    const screenSize =
      typeof window.screen?.width === 'number' && typeof window.screen?.height === 'number'
        ? `${window.screen.width}x${window.screen.height}`
        : undefined;

    void accountApi
      .recordVisit({
        path,
        referrer: document.referrer || undefined,
        language: navigator.language || undefined,
        timezone,
        screen: screenSize,
      })
      .catch(() => undefined);
  }, [location.pathname]);

  return null;
}
