import L from 'leaflet';
import { MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { LocationValue } from '../../lib/fieldValues';
import { reverseGeocode, searchLocations, type GeocodeResult } from '../../lib/geocoding';

import 'leaflet/dist/leaflet.css';
import './fields.css';
import './LocationField.css';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type LocationFieldProps = {
  value: LocationValue | null;
  placeholder?: string;
  onChange: (value: LocationValue) => void;
};

export function LocationField({ value, placeholder, onChange }: LocationFieldProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [query, setQuery] = useState(value?.label ?? '');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const applyCoordinates = useCallback(
    async (lat: number, lon: number) => {
      setMapError(null);

      const result = await reverseGeocode(lat, lon);

      if (!result) {
        setMapError('Could not resolve that location. Try another spot.');

        return;
      }

      setQuery(result.label);
      onChange(result);
      setResults([]);
    },
    [onChange],
  );

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

    const initialLat = value?.lat ?? 30.2672;
    const initialLon = value?.lon ?? -97.7431;

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLon],
      zoom: value ? 11 : 4,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLon], { draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      void applyCoordinates(position.lat, position.lng);
    });

    map.on('click', (event) => {
      marker.setLatLng(event.latlng);
      void applyCoordinates(event.latlng.lat, event.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [showMap, applyCoordinates, value]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !value) {
      return;
    }

    markerRef.current.setLatLng([value.lat, value.lon]);
    mapInstanceRef.current.setView([value.lat, value.lon], 11);
  }, [value]);

  function selectResult(result: GeocodeResult) {
    setQuery(result.label);
    onChange(result);
    setResults([]);

    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([result.lat, result.lon]);
      mapInstanceRef.current.setView([result.lat, result.lon], 11);
    }
  }

  return (
    <div className="location-field">
      <div className="location-field__search">
        <Search size={18} className="location-field__search-icon" aria-hidden />
        <input
          type="text"
          className="field-control location-field__input"
          placeholder={placeholder ?? 'Search for a place…'}
          value={query}
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
          <div ref={mapRef} className="location-field__map" aria-label="Map picker" />
          <p className="field-hint">Click the map or drag the pin to choose a location.</p>
        </div>
      ) : null}

      {mapError ? <p className="error-text">{mapError}</p> : null}
      {value ? <p className="location-field__selected">Selected: {value.label}</p> : null}
    </div>
  );
}
