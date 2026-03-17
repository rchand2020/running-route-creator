import { Polyline } from 'react-leaflet';
import type { RouteResult } from '../../types';

type Props = {
  routes: RouteResult[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
};

const ROUTE_PALETTE = [
  '#94a3b8', // slate
  '#a78bfa', // violet
  '#f59e0b', // amber
  '#34d399', // emerald
  '#f87171', // red
  '#fb923c', // orange
];

export function RouteLayer({ routes, selectedRouteId, onSelectRoute }: Props) {
  return (
    <>
      {routes.map((route, index) => {
        const isSelected = route.id === selectedRouteId;
        const positions = route.coordinates.map((c) => [c.lat, c.lng] as [number, number]);

        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: isSelected ? '#3b82f6' : ROUTE_PALETTE[index % ROUTE_PALETTE.length],
              weight: isSelected ? 5 : 3,
              opacity: isSelected ? 0.9 : 0.5,
            }}
            eventHandlers={{
              click: () => onSelectRoute(route.id),
            }}
          />
        );
      })}
    </>
  );
}
