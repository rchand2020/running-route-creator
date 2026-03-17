import type { AppMode, ClickState, LatLng, RouteResult, TerrainPreference } from '../../types';
import { DistanceSlider } from './DistanceSlider';
import { TerrainPicker } from './TerrainPicker';
import { RouteCard } from './RouteCard';
import { AddressSearch } from './AddressSearch';
import { DirectionsList } from './DirectionsList';

type Props = {
  mode: AppMode;
  clickState: ClickState;
  routes: RouteResult[];
  selectedRouteId: string | null;
  loading: boolean;
  error: string | null;
  targetDistance: number;
  terrain: TerrainPreference;
  hasStart: boolean;
  onSwitchMode: (mode: AppMode) => void;
  onReset: () => void;
  onSelectRoute: (id: string) => void;
  onTargetDistanceChange: (miles: number) => void;
  onTerrainChange: (pref: TerrainPreference) => void;
  onGenerateLoop: () => void;
  onSuggestRoutes: () => void;
  onStartFromSearch: (latlng: LatLng) => void;
};

export function ControlPanel({
  mode,
  clickState,
  routes,
  selectedRouteId,
  loading,
  error,
  targetDistance,
  terrain,
  hasStart,
  onSwitchMode,
  onReset,
  onSelectRoute,
  onTargetDistanceChange,
  onTerrainChange,
  onGenerateLoop,
  onSuggestRoutes,
  onStartFromSearch,
}: Props) {
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h1>Route Creator</h1>
        <div className="panel-subtitle">Plan your run</div>
      </div>

      <div className="mode-toggle">
        <button
          className={mode === 'pick-points' ? 'active' : ''}
          onClick={() => onSwitchMode('pick-points')}
        >
          Pick Points
        </button>
        <button
          className={mode === 'suggest-routes' ? 'active' : ''}
          onClick={() => onSwitchMode('suggest-routes')}
        >
          Suggest Routes
        </button>
      </div>

      <AddressSearch onSelect={onStartFromSearch} />

      <div className="section-divider" />

      {mode === 'pick-points' && (
        <div className="mode-content">
          <div className="instructions">
            {clickState === 'set-start' && <p>Click the map or search above to set your <strong>start point</strong></p>}
            {clickState === 'set-furthest' && <p>Click the map to set your <strong>furthest point</strong></p>}
            {clickState === 'viewing' && routes.length === 0 && !loading && (
              <button className="btn-primary" onClick={onGenerateLoop}>Generate Route</button>
            )}
          </div>

          <TerrainPicker value={terrain} onChange={onTerrainChange} />
        </div>
      )}

      {mode === 'suggest-routes' && (
        <div className="mode-content">
          <div className="instructions">
            {!hasStart && <p>Click the map or search above to set your <strong>start point</strong></p>}
            {hasStart && routes.length === 0 && !loading && (
              <button className="btn-primary" onClick={onSuggestRoutes}>Find Routes</button>
            )}
          </div>

          <DistanceSlider value={targetDistance} onChange={onTargetDistanceChange} />
          <TerrainPicker value={terrain} onChange={onTerrainChange} />
        </div>
      )}

      {loading && (
        <div className="loading">
          <span className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          Generating routes
        </div>
      )}

      {error && <div className="error"><span className="error-icon">⚠</span>{error}</div>}

      {routes.length > 0 && (
        <div className="route-list">
          {routes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              index={index}
              isSelected={route.id === selectedRouteId}
              onClick={() => onSelectRoute(route.id)}
            />
          ))}
        </div>
      )}

      {selectedRoute && (
        <>
          <div className="route-summary">
            <span className="summary-distance">📏 {selectedRoute.distanceMiles.toFixed(1)} miles</span>
            <span className="summary-time">⏱ ~{selectedRoute.durationMinutes} min</span>
          </div>
          <DirectionsList steps={selectedRoute.steps} />
        </>
      )}

      <button className="btn-reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
