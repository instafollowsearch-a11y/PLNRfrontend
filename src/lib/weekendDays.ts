export const WEEKEND_DAYS = ['Friday', 'Saturday', 'Sunday'] as const;

export type WeekendDay = (typeof WEEKEND_DAYS)[number];

export interface WeekendDayItem {
  day?: string | null;
}

export function usesWeekendDays(items: WeekendDayItem[]): boolean {
  return items.some(
    (item) => item.day === 'Friday' || item.day === 'Saturday' || item.day === 'Sunday',
  );
}

export function itemsForDay<T extends WeekendDayItem>(items: T[], day: WeekendDay): T[] {
  return items.filter((item) => item.day === day);
}
