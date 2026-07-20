const SESSION_KEY = 'plnr_plan_session';

export function savePlanSessionUuid(uuid: string): void {
  sessionStorage.setItem(SESSION_KEY, uuid);
}

export function getPlanSessionUuid(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearPlanSessionUuid(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function resolveSessionUuid(searchParams: URLSearchParams): string | null {
  const fromQuery = searchParams.get('session');

  if (fromQuery) {
    savePlanSessionUuid(fromQuery);

    return fromQuery;
  }

  return getPlanSessionUuid();
}

export function withSession(path: string, sessionUuid: string): string {
  const separator = path.includes('?') ? '&' : '?';

  return `${path}${separator}session=${encodeURIComponent(sessionUuid)}`;
}
