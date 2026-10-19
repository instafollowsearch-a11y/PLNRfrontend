/** Emails are never case-sensitive — always store and compare lowercase. */
export function normalizeEmail(email: string | null | undefined): string {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}
