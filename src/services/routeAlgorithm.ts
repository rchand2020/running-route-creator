import type { LatLng, RouteResult, TerrainPreference } from '../types';
import { bearing, destinationPoint, haversineDistance, midpoint } from './geo';
import { generateRoute } from './ors';

const DIRECTION_LABELS = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];

function bearingToLabel(deg: number): string {
  const idx = Math.round(deg / 45) % 8;
  return DIRECTION_LABELS[idx];
}

export async function generateLoopRoute(
  start: LatLng,
  furthest: LatLng,
  terrain: TerrainPreference = 'none'
): Promise<RouteResult> {
  const dist = haversineDistance(start, furthest);
  const b = bearing(start, furthest);
  const mid = midpoint(start, furthest);

  // Offset perpendicular waypoints at ~30% of the S→F distance
  const offsetDist = dist * 0.3;
  const w1 = destinationPoint(mid, (b + 90) % 360, offsetDist);
  const w2 = destinationPoint(mid, (b - 90 + 360) % 360, offsetDist);

  const waypoints = [start, w1, furthest, w2, start];
  return generateRoute(waypoints, 'loop-main', bearingToLabel(b), terrain);
}

export async function suggestRoutes(
  start: LatLng,
  targetDistanceMiles: number,
  terrain: TerrainPreference = 'none'
): Promise<RouteResult[]> {
  // radius ≈ targetDistance / π
  const radius = targetDistanceMiles / Math.PI;

  // Generate candidate furthest points in 8 compass directions
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const candidates = angles.map((angle) => ({
    point: destinationPoint(start, angle, radius),
    angle,
    label: bearingToLabel(angle),
  }));

  // Generate routes in parallel (4 at a time to stay under rate limits)
  const results: RouteResult[] = [];
  const errors: string[] = [];

  // Process in batches of 4
  for (let i = 0; i < candidates.length; i += 4) {
    const batch = candidates.slice(i, i + 4);
    const batchResults = await Promise.allSettled(
      batch.map((c) => {
        const dist = haversineDistance(start, c.point);
        const b = bearing(start, c.point);
        const mid = midpoint(start, c.point);
        const offsetDist = dist * 0.3;
        const w1 = destinationPoint(mid, (b + 90) % 360, offsetDist);
        const w2 = destinationPoint(mid, (b - 90 + 360) % 360, offsetDist);
        const waypoints = [start, w1, c.point, w2, start];
        return generateRoute(waypoints, `suggestion-${c.angle}`, c.label, terrain);
      })
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        errors.push(r.reason?.message || 'Unknown error');
      }
    }
  }

  // Filter to routes within ±15% of target distance
  const minDist = targetDistanceMiles * 0.85;
  const maxDist = targetDistanceMiles * 1.15;
  const filtered = results.filter((r) => r.distanceMiles >= minDist && r.distanceMiles <= maxDist);

  // If filtering eliminates everything, return the closest matches
  if (filtered.length === 0 && results.length > 0) {
    results.sort(
      (a, b) =>
        Math.abs(a.distanceMiles - targetDistanceMiles) -
        Math.abs(b.distanceMiles - targetDistanceMiles)
    );
    return results.slice(0, 4);
  }

  // Sort by closeness to target distance
  filtered.sort(
    (a, b) =>
      Math.abs(a.distanceMiles - targetDistanceMiles) -
      Math.abs(b.distanceMiles - targetDistanceMiles)
  );

  return filtered.slice(0, 4);
}
