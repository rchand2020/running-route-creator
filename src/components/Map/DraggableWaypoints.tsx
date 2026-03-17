import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { LatLng, RouteResult } from '../../types';

type Props = {
  route: RouteResult;
  onWaypointDrag: (routeId: string, waypointIndex: number, newPos: LatLng) => void;
  onWaypointAdd: (routeId: string, insertAfterIndex: number, pos: LatLng) => void;
};

const waypointIcon = L.divIcon({
  className: 'custom-marker',
  html: `<svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="white" stroke="#3b82f6" stroke-width="2"/></svg>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const midpointIcon = L.divIcon({
  className: 'custom-marker',
  html: `<svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/><line x1="3" y1="6" x2="9" y2="6" stroke="#9ca3af" stroke-width="1.5"/><line x1="6" y1="3" x2="6" y2="9" stroke="#9ca3af" stroke-width="1.5"/></svg>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function midpoint(a: LatLng, b: LatLng): LatLng {
  return { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
}

export function DraggableWaypoints({ route, onWaypointDrag, onWaypointAdd }: Props) {
  const waypoints = route.waypoints;
  // Skip the last waypoint if it's the same as the first (loop closure)
  const isLoop = waypoints.length > 2 &&
    Math.abs(waypoints[0].lat - waypoints[waypoints.length - 1].lat) < 0.0001 &&
    Math.abs(waypoints[0].lng - waypoints[waypoints.length - 1].lng) < 0.0001;
  const editableWaypoints = isLoop ? waypoints.slice(0, -1) : waypoints;

  const midpoints = useMemo(() => {
    const mids: { pos: LatLng; afterIndex: number }[] = [];
    for (let i = 0; i < editableWaypoints.length - 1; i++) {
      mids.push({ pos: midpoint(editableWaypoints[i], editableWaypoints[i + 1]), afterIndex: i });
    }
    if (isLoop) {
      mids.push({
        pos: midpoint(editableWaypoints[editableWaypoints.length - 1], editableWaypoints[0]),
        afterIndex: editableWaypoints.length - 1,
      });
    }
    return mids;
  }, [editableWaypoints, isLoop]);

  return (
    <>
      {/* Editable waypoints (skip first = start, handled by MarkerLayer) */}
      {editableWaypoints.map((wp, i) => {
        if (i === 0) return null; // start marker handled elsewhere
        return (
          <Marker
            key={`wp-${i}`}
            position={[wp.lat, wp.lng]}
            icon={waypointIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const latlng = e.target.getLatLng();
                const newPos: LatLng = { lat: latlng.lat, lng: latlng.lng };
                if (isLoop && i === editableWaypoints.length) {
                  // dragging the loop-closure point also updates first
                  onWaypointDrag(route.id, 0, newPos);
                } else {
                  onWaypointDrag(route.id, i, newPos);
                }
              },
            }}
          />
        );
      })}

      {/* Midpoint markers for adding new waypoints */}
      {midpoints.map((mid, i) => (
        <Marker
          key={`mid-${i}`}
          position={[mid.pos.lat, mid.pos.lng]}
          icon={midpointIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const latlng = e.target.getLatLng();
              onWaypointAdd(route.id, mid.afterIndex, { lat: latlng.lat, lng: latlng.lng });
            },
          }}
        />
      ))}
    </>
  );
}
