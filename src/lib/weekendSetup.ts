export function needsWeekendSetup(
  user: { is_pro?: boolean; interests?: string[] | null } | null | undefined,
): boolean {
  return user?.is_pro === true && (user.interests?.length ?? 0) === 0;
}
