export type LatLng = {
  lat: number;
  lng: number;
};

export type AppMode = 'pick-points' | 'suggest-routes';

export type ClickState = 'set-start' | 'set-furthest' | 'viewing';

export type TerrainPreference = 'parks' | 'waterfront' | 'none';

export type GeocodingResult = {
  label: string;
  lat: number;
  lng: number;
};

export type RouteStep = {
  instruction: string;
  name: string;
  distanceMiles: number;
  durationMinutes: number;
  type: number;
};

export type RouteResult = {
  id: string;
  coordinates: LatLng[];
  waypoints: LatLng[];
  distanceMiles: number;
  durationMinutes: number;
  directionLabel: string;
  steps: RouteStep[];
};

export type SavedRoute = RouteResult & {
  savedId: string;
  savedAt: string;
  name: string;
};
