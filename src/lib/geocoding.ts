import { API_URL } from './api';

export type GeocodeResult = {
  label: string;
  lat: number;
  lon: number;
};

function isGeocodeResult(value: unknown): value is GeocodeResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.label === 'string' &&
    item.label.length > 0 &&
    typeof item.lat === 'number' &&
    Number.isFinite(item.lat) &&
    typeof item.lon === 'number' &&
    Number.isFinite(item.lon)
  );
}

export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  try {
    const url = new URL(`${API_URL}/geocode/search`);
    url.searchParams.set('q', trimmed);

    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { data?: unknown };

    if (!Array.isArray(payload.data)) {
      return [];
    }

    return payload.data.filter(isGeocodeResult);
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  try {
    const url = new URL(`${API_URL}/geocode/reverse`);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));

    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: unknown };

    return isGeocodeResult(payload.data) ? payload.data : null;
  } catch {
    return null;
  }
}
