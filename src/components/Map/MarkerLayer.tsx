import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng } from '../../types';

const startIcon = L.divIcon({
  className: 'custom-marker',
  html: `<svg width="24" height="36" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#22c55e"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
});

const furthestIcon = L.divIcon({
  className: 'custom-marker',
  html: `<svg width="24" height="36" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#ef4444"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`,
  iconSize: [24, 36],
  iconAnchor: [12, 36],
  popupAnchor: [0, -36],
});

type Props = {
  start: LatLng | null;
  furthest: LatLng | null;
};

export function MarkerLayer({ start, furthest }: Props) {
  return (
    <>
      {start && (
        <Marker position={[start.lat, start.lng]} icon={startIcon}>
          <Popup>Start</Popup>
        </Marker>
      )}
      {furthest && (
        <Marker position={[furthest.lat, furthest.lng]} icon={furthestIcon}>
          <Popup>Furthest point</Popup>
        </Marker>
      )}
    </>
  );
}
