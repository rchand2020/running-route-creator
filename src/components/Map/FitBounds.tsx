import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RouteResult } from '../../types';

type Props = {
  routes: RouteResult[];
};

export function FitBounds({ routes }: Props) {
  const map = useMap();

  useEffect(() => {
    if (routes.length === 0) return;

    const allCoords = routes.flatMap((r) => r.coordinates);
    if (allCoords.length === 0) return;

    const bounds = L.latLngBounds(allCoords.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [routes, map]);

  return null;
}
