import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLng } from '../../types';

type Props = {
  start: LatLng | null;
};

export function CenterOnStart({ start }: Props) {
  const map = useMap();

  useEffect(() => {
    if (start) {
      map.setView([start.lat, start.lng], 15, { animate: true });
    }
  }, [start, map]);

  return null;
}
