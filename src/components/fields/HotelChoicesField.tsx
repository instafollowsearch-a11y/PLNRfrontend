import { useEffect, useState } from 'react';

import { API_URL } from '../../lib/api';

export const SUGGEST_HOTEL = '__suggest__';

type HotelChoice = {
  name: string;
  url: string;
};

type HotelChoicesFieldProps = {
  destination: string;
  value: string;
  onChange: (value: string) => void;
};

export function destinationFromAnswers(answers: Record<string, string>): string {
  const raw = answers.destination || answers.end_location || '';

  try {
    const parsed = JSON.parse(raw) as { label?: string };

    if (typeof parsed.label === 'string' && parsed.label.trim() !== '') {
      return parsed.label.trim();
    }
  } catch {
    // Destination is already plain text.
  }

  return raw.trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestHotels(place: string, isCancelled: () => boolean): Promise<HotelChoice[]> {
  const deadline = Date.now() + 90000;

  while (!isCancelled() && Date.now() < deadline) {
    try {
      const response = await fetch(`${API_URL}/hotel-suggestions`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ destination: place }),
      });

      if (response.status === 202) {
        await sleep(2000);
        continue;
      }

      if (!response.ok) {
        throw new Error('unavailable');
      }

      const body = (await response.json()) as { data?: HotelChoice[] | { status?: string } };

      if (!Array.isArray(body.data) && body.data?.status === 'generating') {
        await sleep(2000);
        continue;
      }

      return Array.isArray(body.data) ? body.data : [];
    } catch (error) {
      if (error instanceof Error && error.message === 'unavailable') {
        throw error;
      }

      await sleep(2000);
    }
  }

  throw new Error('unavailable');
}

export function HotelChoicesField({ destination, value, onChange }: HotelChoicesFieldProps) {
  const [hotels, setHotels] = useState<HotelChoice[]>([]);
  const [isLoading, setIsLoading] = useState(destination.trim().length >= 2);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const place = destination.trim();

    if (place.length < 2) {
      setHotels([]);
      setIsLoading(false);

      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

    void requestHotels(place, () => isCancelled)
      .then((choices) => {
        if (!isCancelled) {
          setHotels(choices);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setHotels([]);
          setHasError(true);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [destination]);

  return (
    <div className="hotel-choices">
      {isLoading ? <p className="field-hint">Looking up hotels…</p> : null}
      {!isLoading && (hasError || hotels.length === 0) ? (
        <p className="field-hint">
          We could not list hotels just now. You can still continue, and the plan will include hotel links.
        </p>
      ) : null}
      {hotels.map((hotel) => (
        <div
          key={hotel.url}
          className={`hotel-choices__card${value === hotel.name ? ' is-selected' : ''}`}
        >
          <button
            type="button"
            className="hotel-choices__pick"
            aria-pressed={value === hotel.name}
            onClick={() => onChange(hotel.name)}
          >
            {hotel.name}
          </button>
          <a className="hotel-choices__link" href={hotel.url} target="_blank" rel="noreferrer">
            View hotel
          </a>
        </div>
      ))}
      <button
        type="button"
        className={`select-field__option${value === SUGGEST_HOTEL ? ' select-field__option--active' : ''}`}
        aria-pressed={value === SUGGEST_HOTEL}
        onClick={() => onChange(SUGGEST_HOTEL)}
      >
        Suggest one in my plan
      </button>
    </div>
  );
}
