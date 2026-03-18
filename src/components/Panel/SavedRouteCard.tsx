import type { SavedRoute } from '../../types';

type Props = {
  route: SavedRoute;
  onClick: () => void;
  onDelete: () => void;
};

export function SavedRouteCard({ route, onClick, onDelete }: Props) {
  return (
    <button className="route-card saved-route-card" onClick={onClick}>
      <div className="route-card-header">
        <span className="route-direction">{route.name}</span>
        <span className="route-distance">{route.distanceMiles.toFixed(1)} mi</span>
      </div>
      <div className="route-card-detail">
        ~{route.durationMinutes} min · {new Date(route.savedAt).toLocaleDateString()}
      </div>
      <button
        className="saved-route-delete"
        title="Delete saved route"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        ×
      </button>
    </button>
  );
}
