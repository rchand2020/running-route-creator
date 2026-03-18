import { useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../../types';

type Props = {
  start: LatLng | null;
  userLocation: LatLng | null;
  locationGranted: boolean;
};

export function RecenterButton({ start, userLocation, locationGranted }: Props) {
  const map = useMap();

  const btnRef = useCallback((node: HTMLButtonElement | null) => {
    if (node) {
      L.DomEvent.disableClickPropagation(node);
    }
  }, []);

  // Only show if there's a start pin or location permission was granted
  if (!start && !locationGranted) return null;

  const handleClick = () => {
    if (start) {
      map.setView([start.lat, start.lng], 15);
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  };

  return (
    <button
      ref={btnRef}
      className="recenter-btn"
      onClick={handleClick}
      title="Re-center map"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    </button>
  );
}
