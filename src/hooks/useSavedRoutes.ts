import { useState, useCallback } from 'react';
import type { RouteResult, SavedRoute } from '../types';
import * as savedRoutesService from '../services/savedRoutes';

export function useSavedRoutes() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingRouteId, setSavingRouteId] = useState<string | null>(null);

  const fetchSavedRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const routes = await savedRoutesService.listSavedRoutes();
      setSavedRoutes(routes);
    } catch (err) {
      console.error('Failed to fetch saved routes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRoute = useCallback(async (route: RouteResult, name?: string) => {
    setSavingRouteId(route.id);
    try {
      const saved = await savedRoutesService.saveRoute(route, name);
      setSavedRoutes((prev) => [saved, ...prev]);
      return saved;
    } finally {
      setSavingRouteId(null);
    }
  }, []);

  const deleteRoute = useCallback(async (savedId: string) => {
    await savedRoutesService.deleteSavedRoute(savedId);
    setSavedRoutes((prev) => prev.filter((r) => r.savedId !== savedId));
  }, []);

  return { savedRoutes, loading, savingRouteId, fetchSavedRoutes, saveRoute, deleteRoute };
}
