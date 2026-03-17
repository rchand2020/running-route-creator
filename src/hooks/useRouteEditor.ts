import { useCallback, useState } from 'react';
import type { LatLng, RouteResult, TerrainPreference } from '../types';
import { fetchRoute } from '../services/ors';
import { metersToMiles } from '../services/geo';

export function useRouteEditor(
  routes: RouteResult[],
  setRoutes: (updater: (prev: RouteResult[]) => RouteResult[]) => void,
  terrain: TerrainPreference
) {
  const [editing, setEditing] = useState(false);

  const updateRouteWaypoint = useCallback(
    async (routeId: string, waypointIndex: number, newPos: LatLng) => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) return;

      const newWaypoints = [...route.waypoints];
      newWaypoints[waypointIndex] = newPos;

      setEditing(true);
      try {
        const result = await fetchRoute(newWaypoints, terrain);
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === routeId
              ? {
                  ...r,
                  coordinates: result.coordinates,
                  waypoints: newWaypoints,
                  distanceMiles: metersToMiles(result.distanceMeters),
                  durationMinutes: Math.round(result.durationSeconds / 60),
                  steps: result.steps,
                }
              : r
          )
        );
      } finally {
        setEditing(false);
      }
    },
    [routes, setRoutes, terrain]
  );

  const addRouteWaypoint = useCallback(
    async (routeId: string, insertAfterIndex: number, pos: LatLng) => {
      const route = routes.find((r) => r.id === routeId);
      if (!route) return;

      const newWaypoints = [...route.waypoints];
      newWaypoints.splice(insertAfterIndex + 1, 0, pos);

      setEditing(true);
      try {
        const result = await fetchRoute(newWaypoints, terrain);
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === routeId
              ? {
                  ...r,
                  coordinates: result.coordinates,
                  waypoints: newWaypoints,
                  distanceMiles: metersToMiles(result.distanceMeters),
                  durationMinutes: Math.round(result.durationSeconds / 60),
                  steps: result.steps,
                }
              : r
          )
        );
      } finally {
        setEditing(false);
      }
    },
    [routes, setRoutes, terrain]
  );

  return { editing, updateRouteWaypoint, addRouteWaypoint };
}
