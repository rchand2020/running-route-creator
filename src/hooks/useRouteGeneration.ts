import { useState, useCallback } from 'react';
import type { LatLng, RouteResult, TerrainPreference } from '../types';
import { generateLoopRoute, suggestRoutes } from '../services/routeAlgorithm';

export function useRouteGeneration() {
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLoop = useCallback(async (start: LatLng, furthest: LatLng, terrain: TerrainPreference = 'none') => {
    setLoading(true);
    setError(null);
    try {
      const route = await generateLoopRoute(start, furthest, terrain);
      setRoutes([route]);
      setSelectedRouteId(route.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate route');
    } finally {
      setLoading(false);
    }
  }, []);

  const suggest = useCallback(async (start: LatLng, targetMiles: number, terrain: TerrainPreference = 'none') => {
    setLoading(true);
    setError(null);
    try {
      const results = await suggestRoutes(start, targetMiles, terrain);
      setRoutes(results);
      setSelectedRouteId(results.length > 0 ? results[0].id : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to suggest routes');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoutes = useCallback(() => {
    setRoutes([]);
    setSelectedRouteId(null);
    setError(null);
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || null;

  return {
    routes,
    setRoutes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    loading,
    error,
    generateLoop,
    suggest,
    clearRoutes,
  };
}
