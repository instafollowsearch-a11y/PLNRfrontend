import * as maplibregl from 'maplibre-gl';
import type { ExpressionSpecification } from 'maplibre-gl';
import { setWorkerUrl } from 'maplibre-gl';

import { MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LocationValue } from '../../lib/fieldValues';
import { reverseGeocode, searchLocations, type GeocodeResult } from '../../lib/geocoding';

import 'maplibre-gl/dist/maplibre-gl.css';
import './fields.css';
import './LocationField.css';

if (import.meta.env.PROD) {
  setWorkerUrl(`${import.meta.env.BASE_URL}assets/maplibre-gl-worker.mjs`);
}

const ENGLISH_PLACE_NAME: ExpressionSpecification = [
  'coalesce',
  ['get', 'name_en'],
  ['get', 'name:en'],
  ['get', 'name:latin'],
  ['get', 'name'],
];

type LocationFieldProps = {
  value: LocationValue | null;
  placeholder?: string;
  onChange: (value: LocationValue) => void;
};

export function LocationField({ value, placeholder, onChange }: LocationFieldProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [query, setQuery] = useState(value?.label ?? '');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const applyCoordinatesRef = useRef<(lat: number, lon: number) => void>(() => undefined);
  const valueRef = useRef(value);
  valueRef.current = value;

  const applyCoordinates = useCallback(
    async (lat: number, lon: number) => {
      setMapError(null);
      setIsResolvingPin(true);

      try {
        const result = await reverseGeocode(lat, lon);
        const selected = result ?? {
          label: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          lat,
          lon,
        };

        setQuery(selected.label);
        onChange(selected);
        setResults([]);

        if (!result) {
          setMapError('Place name could not be looked up. The pin is still selected.');
        }
      } finally {
        setIsResolvingPin(false);
      }
    },
    [onChange],
  );

  applyCoordinatesRef.current = applyCoordinates;

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2 || (value && trimmed === value.label)) {
      setResults([]);

      return;
    }

    const timeout = window.setTimeout(() => {
      setIsSearching(true);
      void searchLocations(trimmed)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [query, value]);

  useEffect(() => {
    if (!showMap || !mapRef.current) {
      return;
    }

    setMapReady(false);
    const initial = valueRef.current;
    const initialLat = initial?.lat ?? 30.2672;
    const initialLon = initial?.lon ?? -97.7431;

    const map = new maplibregl.Map({
      container: mapRef.current,
      center: [initialLon, initialLat],
      zoom: initial ? 11 : 4,
      fadeDuration: 0,
      style: 'https://tiles.openfreemap.org/styles/liberty',
    });

    map.once('style.load', () => {
      map.resize();
      setMapReady(true);
      window.requestAnimationFrame(() => {
        for (const layer of map.getStyle().layers ?? []) {
          if (layer.type !== 'symbol' || !layer.layout?.['text-field']) {
            continue;
          }

          if (!JSON.stringify(layer.layout['text-field']).includes('name')) {
            continue;
          }

          try {
            map.setLayoutProperty(layer.id, 'text-field', ENGLISH_PLACE_NAME);
          } catch {
            // Keep the style's own label if this layer rejects the replacement.
          }
        }
      });
    });

    const marker = new maplibregl.Marker({ draggable: true })
      .setLngLat([initialLon, initialLat])
      .addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLngLat();
      applyCoordinatesRef.current(position.lat, position.lng);
    });

    map.on('click', (event) => {
      marker.setLngLat(event.lngLat);
      applyCoordinatesRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    };
  }, [showMap]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !value) {
      return;
    }

    markerRef.current.setLngLat([value.lon, value.lat]);
    mapInstanceRef.current.jumpTo({ center: [value.lon, value.lat], zoom: 11 });
  }, [value]);

  function selectResult(result: GeocodeResult) {
    inputRef.current?.blur();
    setQuery(result.label);
    onChange(result);
    setResults([]);

    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLngLat([result.lon, result.lat]);
      mapInstanceRef.current.jumpTo({ center: [result.lon, result.lat], zoom: 11 });
    }
  }

  return (
    <div className="location-field">
      <div className="location-field__search">
        <Search size={18} className="location-field__search-icon" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          className="field-control location-field__input"
          placeholder={placeholder ?? 'Search for a place…'}
          value={query}
          aria-label="City search"
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => window.setTimeout(() => setResults([]), 150)}
        />
        <button
          type="button"
          className="location-field__map-toggle"
          onClick={() => setShowMap((open) => !open)}
        >
          <MapPin size={16} />
          {showMap ? 'Hide map' : 'Pick on map'}
        </button>
      </div>

      {isSearching ? <p className="field-hint">Searching places…</p> : null}

      {results.length > 0 ? (
        <ul className="location-field__results">
          {results.map((result) => (
            <li key={`${result.lat}-${result.lon}-${result.label}`}>
              <button type="button" onMouseDown={() => selectResult(result)}>
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showMap ? (
        <div className="location-field__map-wrap">
          <div className="location-field__map-frame">
            <div ref={mapRef} className="location-field__map" aria-label="Map picker" />
            {!mapReady || isResolvingPin ? (
              <div className="location-field__map-status" role="status">
                {isResolvingPin ? 'Finding this place…' : 'Loading map…'}
              </div>
            ) : null}
          </div>
          <p className="field-hint">Click the map or drag the pin to choose a location.</p>
        </div>
      ) : null}

      {mapError ? <p className="error-text">{mapError}</p> : null}
      {value ? <p className="location-field__selected">Selected: {value.label}</p> : null}
    </div>
  );
}
