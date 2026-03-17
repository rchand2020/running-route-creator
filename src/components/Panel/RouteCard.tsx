import type { RouteResult } from '../../types';

type Props = {
  route: RouteResult;
  index: number;
  isSelected: boolean;
  onClick: () => void;
};

const COMPASS: Record<string, string> = {
  North: '🧭',
  South: '🧭',
  East: '🧭',
  West: '🧭',
  Northeast: '🧭',
  Northwest: '🧭',
  Southeast: '🧭',
  Southwest: '🧭',
};

export function RouteCard({ route, index, isSelected, onClick }: Props) {
  const compass = COMPASS[route.directionLabel] ?? '📍';

  return (
    <button className={`route-card accent-${index % 6} ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="route-card-header">
        <span className="route-direction">
          <span className="compass">{compass}</span>
          {route.directionLabel}
        </span>
        <span className="route-distance">{route.distanceMiles.toFixed(1)} mi</span>
      </div>
      <div className="route-card-detail">~{route.durationMinutes} min</div>
    </button>
  );
}
