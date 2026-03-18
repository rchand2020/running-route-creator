import { supabase } from './supabase';
import type { RouteResult, SavedRoute } from '../types';

type DbRow = {
  id: string;
  name: string;
  direction_label: string;
  distance_miles: number;
  duration_minutes: number;
  coordinates: Array<{ lat: number; lng: number }>;
  waypoints: Array<{ lat: number; lng: number }>;
  steps: Array<{
    instruction: string;
    name: string;
    distanceMiles: number;
    durationMinutes: number;
    type: number;
  }>;
  created_at: string;
};

function rowToSavedRoute(row: DbRow): SavedRoute {
  return {
    id: row.id,
    savedId: row.id,
    savedAt: row.created_at,
    name: row.name,
    directionLabel: row.direction_label,
    distanceMiles: row.distance_miles,
    durationMinutes: row.duration_minutes,
    coordinates: row.coordinates,
    waypoints: row.waypoints,
    steps: row.steps,
  };
}

export async function saveRoute(route: RouteResult, name?: string): Promise<SavedRoute> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('saved_routes')
    .insert({
      user_id: user.id,
      name: name || route.directionLabel,
      direction_label: route.directionLabel,
      distance_miles: route.distanceMiles,
      duration_minutes: route.durationMinutes,
      coordinates: route.coordinates,
      waypoints: route.waypoints,
      steps: route.steps,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToSavedRoute(data as DbRow);
}

export async function listSavedRoutes(): Promise<SavedRoute[]> {
  const { data, error } = await supabase
    .from('saved_routes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as DbRow[]).map(rowToSavedRoute);
}

export async function deleteSavedRoute(savedId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_routes')
    .delete()
    .eq('id', savedId);

  if (error) throw error;
}
