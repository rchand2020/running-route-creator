import type { RouteResult } from '../../types';

type Props = {
  route: RouteResult;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
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

export function RouteCard({ route, index, isSelected, onClick, onSave, isSaving, isSaved }: Props) {
  const compass = COMPASS[route.directionLabel] ?? '📍';

  return (
    <button className={`route-card accent-${index % 6} ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="route-card-header">
        <span className="route-direction">
          <span className="compass">{compass}</span>
          {route.directionLabel}
        </span>
        <div className="route-card-actions">
          <span className="route-distance">{route.distanceMiles.toFixed(1)} mi</span>
          {onSave && (
            <button
              className={`save-btn ${isSaved ? 'saved' : ''} ${isSaving ? 'saving' : ''}`}
              title={isSaved ? 'Saved' : 'Save route'}
              onClick={(e) => { e.stopPropagation(); if (!isSaved && !isSaving) onSave(); }}
              disabled={isSaved || isSaving}
            >
              {isSaving ? '...' : isSaved ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>
      <div className="route-card-detail">~{route.durationMinutes} min</div>
    </button>
  );
}
