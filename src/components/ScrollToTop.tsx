import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset window scroll on route changes so pages opened from a scrolled
 * landing footer (terms, privacy, plans, etc.) start at the top.
 * Hash links on the same page still scroll to the target section.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.replace(/^#/, ''));
      if (!id) {
        return;
      }

      const frame = window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: 'start' });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
