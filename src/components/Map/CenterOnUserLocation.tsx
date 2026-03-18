import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLng } from '../../types';

type Props = {
  userLocation: LatLng | null;
  start: LatLng | null;
};

export function CenterOnUserLocation({ userLocation, start }: Props) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && !start) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    }
    // Only run when userLocation changes from null to a value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation]);

  return null;
}
