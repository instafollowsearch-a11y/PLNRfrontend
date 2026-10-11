export function androidPlanIntentUrl(planType: string, sessionUuid: string, pageUrl: string): string {
  const path = `plan/${planType}/itinerary?session=${encodeURIComponent(sessionUuid)}`;
  const fallback = new URL(pageUrl);
  fallback.searchParams.set('web', '1');

  return `intent://${path}#Intent;scheme=plnr;package=com.plnr.app;S.browser_fallback_url=${encodeURIComponent(fallback.toString())};end`;
}

export function shouldOpenPlanInApp(userAgent: string, stayOnWeb: boolean): boolean {
  return !stayOnWeb && /Android/i.test(userAgent);
}
