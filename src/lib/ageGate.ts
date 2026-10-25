/** Minimum age to create a PLNR account (privacy / terms). */
export const MINIMUM_ACCOUNT_AGE = 13;

export function maximumAllowedBirthDateIso(now = new Date()): string {
  const max = new Date(now.getFullYear() - MINIMUM_ACCOUNT_AGE, now.getMonth(), now.getDate());

  return toIsoDate(max);
}

export function minimumAllowedBirthDateIso(now = new Date()): string {
  const min = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

  return toIsoDate(min);
}

export function isOldEnoughToRegister(isoDate: string, now = new Date()): boolean {
  const trimmed = isoDate.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }

  return trimmed <= maximumAllowedBirthDateIso(now);
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}
