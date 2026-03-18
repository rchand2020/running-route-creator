import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AppMode, ClickState, LatLng, RouteResult, SavedRoute, TerrainPreference } from '../../types';
import { DistanceSlider } from './DistanceSlider';
import { TerrainPicker } from './TerrainPicker';
import { RouteCard } from './RouteCard';
import { SavedRouteCard } from './SavedRouteCard';
import { AddressSearch } from './AddressSearch';
import { DirectionsList } from './DirectionsList';
import { AuthButton } from '../Auth/AuthButton';

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
  onLocateMe: () => void;
  // Auth & saved routes
  user: User | null;
  savedRoutes: SavedRoute[];
  savedRoutesLoading: boolean;
  savingRouteId: string | null;
  onSaveRoute: (route: RouteResult) => void;
  onLoadSavedRoute: (route: SavedRoute) => void;
  onDeleteSavedRoute: (savedId: string) => void;
  onFetchSavedRoutes: () => void;
  onSignInClick: () => void;
  onSignOut: () => void;
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
  onLocateMe,
  user,
  savedRoutes,
  savedRoutesLoading,
  savingRouteId,
  onSaveRoute,
  onLoadSavedRoute,
  onDeleteSavedRoute,
  onFetchSavedRoutes,
  onSignInClick,
  onSignOut,
}: Props) {
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);
  const [routeView, setRouteView] = useState<'generated' | 'saved'>('generated');

  // Fetch saved routes when switching to saved tab or signing in
  const savedRouteIds = new Set(savedRoutes.map((r) => r.savedId));
  useEffect(() => {
    if (routeView === 'saved' && user) {
      onFetchSavedRoutes();
    }
  }, [routeView, user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="control-panel">
      <div className="panel-header">
        <div className="panel-header-row">
          <div>
            <h1>Route Creator</h1>
            <div className="panel-subtitle">Plan your run</div>
          </div>
          <AuthButton user={user} onSignInClick={onSignInClick} onSignOut={onSignOut} />
        </div>
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

      <AddressSearch onSelect={onStartFromSearch} onLocateMe={onLocateMe} />

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

      {(routes.length > 0 || (user && savedRoutes.length > 0)) && (
        <div className="routes-view-toggle">
          <button
            className={routeView === 'generated' ? 'active' : ''}
            onClick={() => setRouteView('generated')}
          >
            Generated{routes.length > 0 ? ` (${routes.length})` : ''}
          </button>
          <button
            className={routeView === 'saved' ? 'active' : ''}
            onClick={() => setRouteView('saved')}
          >
            Saved{savedRoutes.length > 0 ? ` (${savedRoutes.length})` : ''}
          </button>
        </div>
      )}

      {routeView === 'generated' && routes.length > 0 && (
        <div className="route-list">
          {routes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              index={index}
              isSelected={route.id === selectedRouteId}
              onClick={() => onSelectRoute(route.id)}
              onSave={user ? () => onSaveRoute(route) : undefined}
              isSaving={savingRouteId === route.id}
              isSaved={savedRouteIds.has(route.id)}
            />
          ))}
        </div>
      )}

      {routeView === 'saved' && (
        <div className="route-list">
          {!user && (
            <div className="instructions">
              <p><button className="link-btn" onClick={onSignInClick}>Sign in</button> to save and view routes</p>
            </div>
          )}
          {user && savedRoutesLoading && (
            <div className="loading">
              <span className="loading-dots"><span></span><span></span><span></span></span>
              Loading saved routes
            </div>
          )}
          {user && !savedRoutesLoading && savedRoutes.length === 0 && (
            <div className="instructions"><p>No saved routes yet</p></div>
          )}
          {savedRoutes.map((route) => (
            <SavedRouteCard
              key={route.savedId}
              route={route}
              onClick={() => onLoadSavedRoute(route)}
              onDelete={() => onDeleteSavedRoute(route.savedId)}
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
          <DirectionsList key={selectedRoute.steps.length + '-' + selectedRoute.distanceMiles} steps={selectedRoute.steps} />
        </>
      )}

      <button className="btn-reset" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
