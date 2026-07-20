export type GeocodeResult = {
  label: string;
  lat: number;
  lon: number;
};

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'PLNR-Web/1.0 (local development)';

function buildLabel(item: Record<string, unknown>): string {
  const address = item.address as Record<string, string> | undefined;

  if (address) {
    const city = address.city ?? address.town ?? address.village ?? address.hamlet;
    const state = address.state;
    const country = address.country;

    if (city && state) {
      return `${city}, ${state}`;
    }

    if (city && country) {
      return `${city}, ${country}`;
    }
  }

  return typeof item.display_name === 'string' ? item.display_name.split(',').slice(0, 3).join(',') : '';
}

export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();

  if (trimmed.length < 2) {
    return [];
  }

  const url = new URL(`${NOMINATIM_BASE}/search`);
  url.searchParams.set('q', trimmed);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '1');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as Array<Record<string, unknown>>;

  return payload
    .map((item) => ({
      label: buildLabel(item),
      lat: Number(item.lat),
      lon: Number(item.lon),
    }))
    .filter((item) => item.label && Number.isFinite(item.lat) && Number.isFinite(item.lon));
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  const url = new URL(`${NOMINATIM_BASE}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    return null;
  }

  const item = (await response.json()) as Record<string, unknown>;
  const label = buildLabel(item);

  if (!label) {
    return null;
  }

  return { label, lat, lon };
}
