import { CircleMarker } from 'react-leaflet';
import type { LatLng } from '../../types';

type Props = {
  position: LatLng;
};

export function UserLocationDot({ position }: Props) {
  return (
    <>
      {/* Outer pulsing ring */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={16}
        pathOptions={{
          color: 'transparent',
          fillColor: '#3b82f6',
          fillOpacity: 0.15,
          className: 'user-location-pulse',
        }}
      />
      {/* Inner solid dot */}
      <CircleMarker
        center={[position.lat, position.lng]}
        radius={7}
        pathOptions={{
          color: '#fff',
          weight: 2.5,
          fillColor: '#3b82f6',
          fillOpacity: 1,
        }}
      />
    </>
  );
}
