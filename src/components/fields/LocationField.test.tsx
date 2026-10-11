import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LocationField } from './LocationField';

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

vi.mock('maplibre-gl', () => {
  class Map {
    once(event: string, callback: () => void) {
      if (event === 'style.load') {
        callback();
      }
    }

    on() {}

    resize() {}

    remove() {}

    jumpTo() {}

    getStyle() {
      return { layers: [] };
    }

    setLayoutProperty() {}
  }

  class Marker {
    setLngLat() {
      return this;
    }

    addTo() {
      return this;
    }

    on() {
      return this;
    }

    getLngLat() {
      return { lat: 0, lng: 0 };
    }
  }

  return {
    Map,
    Marker,
    setWorkerUrl: () => undefined,
  };
});

describe('LocationField map', () => {
  it('opens the map full screen and closes it from the corner icon', () => {
    render(<LocationField value={null} onChange={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: 'Pick on map' }));
    fireEvent.click(screen.getByRole('button', { name: 'Full screen map' }));

    expect(screen.getByRole('dialog', { name: 'Choose a location' })).toBeTruthy();
    expect(document.body.querySelector('.location-field__map-frame--full')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close full screen map' }));

    expect(screen.queryByRole('dialog', { name: 'Choose a location' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Full screen map' })).toBeTruthy();
  });
});
