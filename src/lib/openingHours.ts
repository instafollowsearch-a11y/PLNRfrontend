export function openingHoursLabel(hours: string | null | undefined): string | null {
  const trimmed = hours?.trim() ?? '';

  if (trimmed === '') {
    return null;
  }

  const split = trimmed.match(/^([^:]+):\s*(.+)$/);

  if (!split) {
    return `Hours: ${trimmed}`;
  }

  const day = split[1].trim();
  const value = split[2].trim();

  if (/^closed$/i.test(value)) {
    return `Closed on ${day}`;
  }

  if (/^open 24 hours$/i.test(value)) {
    return `Open 24 hours on ${day}`;
  }

  return `Open ${day} from ${value}`;
}
