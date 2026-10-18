import { useEffect, useState } from 'react';

import { searchLocations } from './geocoding';
import { timezoneFromCoordinates } from './livePlan';

export function useTripTimeZone(
  stored: string | null | undefined,
  city: string | null | undefined,
): string | null {
  const saved = stored?.trim() || null;
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    if (saved) {
      return;
    }

    const name = city?.trim() ?? '';

    if (name.length < 2) {
      setZone(null);

      return;
    }

    let cancelled = false;

    void searchLocations(name)
      .then((results) => {
        if (cancelled) {
          return;
        }

        const first = results[0];
        setZone(first ? timezoneFromCoordinates(first.lat, first.lon) : null);
      })
      .catch(() => {
        if (!cancelled) {
          setZone(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [saved, city]);

  return saved ?? zone;
}
