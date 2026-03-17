import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLng, RouteResult } from '../../types';
import { MapClickHandler } from './MapClickHandler';
import { MarkerLayer } from './MarkerLayer';
import { RouteLayer } from './RouteLayer';
import { FitBounds } from './FitBounds';
import { CenterOnStart } from './CenterOnStart';
import { DraggableWaypoints } from './DraggableWaypoints';
import 'leaflet/dist/leaflet.css';

function useDarkMode() {
  const [dark, setDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return dark;
}

const NYC_CENTER: [number, number] = [40.785, -73.968]; // Central Park

type Props = {
  start: LatLng | null;
  furthest: LatLng | null;
  routes: RouteResult[];
  selectedRouteId: string | null;
  onMapClick: (latlng: LatLng) => void;
  onSelectRoute: (id: string) => void;
  onWaypointDrag?: (routeId: string, waypointIndex: number, newPos: LatLng) => void;
  onWaypointAdd?: (routeId: string, insertAfterIndex: number, pos: LatLng) => void;
};

export function MapView({
  start,
  furthest,
  routes,
  selectedRouteId,
  onMapClick,
  onSelectRoute,
  onWaypointDrag,
  onWaypointAdd,
}: Props) {
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const dark = useDarkMode();

  const tileUrl = dark
    ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = dark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <MapContainer center={NYC_CENTER} zoom={13} className="map-container">
      <TileLayer
        key={dark ? 'dark' : 'light'}
        attribution={tileAttribution}
        url={tileUrl}
      />
      <MapClickHandler onClick={onMapClick} />
      <MarkerLayer start={start} furthest={furthest} />
      <RouteLayer routes={routes} selectedRouteId={selectedRouteId} onSelectRoute={onSelectRoute} />
      {selectedRoute && onWaypointDrag && onWaypointAdd && (
        <DraggableWaypoints
          route={selectedRoute}
          onWaypointDrag={onWaypointDrag}
          onWaypointAdd={onWaypointAdd}
        />
      )}
      <CenterOnStart start={start} />
      <FitBounds routes={routes} />
    </MapContainer>
  );
}
