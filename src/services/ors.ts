import type { LatLng, RouteResult, RouteStep, TerrainPreference, GeocodingResult } from '../types';
import { metersToMiles } from './geo';

type OrsCoord = [number, number]; // [lng, lat]

function toOrs(p: LatLng): OrsCoord {
  return [p.lng, p.lat];
}

function fromOrs(c: OrsCoord): LatLng {
  return { lat: c[1], lng: c[0] };
}

function buildOptions(terrain: TerrainPreference): Record<string, unknown> | undefined {
  if (terrain === 'parks') {
    return { preference: 'recommended' };
  }
  if (terrain === 'waterfront') {
    return { preference: 'recommended' };
  }
  return undefined;
}

export async function geocodeSearch(query: string): Promise<GeocodingResult[]> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY;
  const params = new URLSearchParams({
    text: query,
    'boundary.country': 'US',
    'focus.point.lat': '40.7128',
    'focus.point.lon': '-74.006',
    size: '5',
    api_key: apiKey,
  });

  const res = await fetch(`https://api.openrouteservice.org/geocode/search?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Geocode error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.features ?? []).map((f: { properties: { label: string }; geometry: { coordinates: [number, number] } }) => ({
    label: f.properties.label,
    lng: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1],
  }));
}

export async function fetchRoute(
  waypoints: LatLng[],
  terrain: TerrainPreference = 'none'
): Promise<{ coordinates: LatLng[]; distanceMeters: number; durationSeconds: number; steps: RouteStep[] }> {
  const body: Record<string, unknown> = {
    coordinates: waypoints.map(toOrs),
  };

  const opts = buildOptions(terrain);
  if (opts?.preference) {
    body.preference = opts.preference;
  }

  const apiKey = import.meta.env.VITE_ORS_API_KEY;
  const res = await fetch(
    `https://api.openrouteservice.org/v2/directions/foot-walking/geojson?api_key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ORS API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const feature = data.features[0];
  const coords: OrsCoord[] = feature.geometry.coordinates;
  const { distance, duration } = feature.properties.summary;

  const steps: RouteStep[] = (feature.properties.segments ?? []).flatMap(
    (seg: { steps: { instruction: string; name: string; distance: number; duration: number; type: number }[] }) =>
      seg.steps.map((s) => ({
        instruction: s.instruction,
        name: s.name || '',
        distanceMiles: metersToMiles(s.distance),
        durationMinutes: Math.round(s.duration / 60),
        type: s.type,
      }))
  );

  return {
    coordinates: coords.map(fromOrs),
    distanceMeters: distance,
    durationSeconds: duration,
    steps,
  };
}

export async function generateRoute(
  waypoints: LatLng[],
  id: string,
  directionLabel: string,
  terrain: TerrainPreference = 'none'
): Promise<RouteResult> {
  const result = await fetchRoute(waypoints, terrain);
  return {
    id,
    coordinates: result.coordinates,
    waypoints: [...waypoints],
    distanceMiles: metersToMiles(result.distanceMeters),
    durationMinutes: Math.round(result.durationSeconds / 60),
    directionLabel,
    steps: result.steps,
  };
}
