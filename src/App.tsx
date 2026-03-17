import { useState, useEffect } from 'react';
import type { TerrainPreference } from './types';
import { useMapInteraction } from './hooks/useMapInteraction';
import { useRouteGeneration } from './hooks/useRouteGeneration';
import { useRouteEditor } from './hooks/useRouteEditor';
import { AppLayout } from './components/Layout/AppLayout';
import { MapView } from './components/Map/MapView';
import { ControlPanel } from './components/Panel/ControlPanel';
import './App.css';

function App() {
  const { start, furthest, clickState, mode, handleMapClick, setStartFromSearch, reset, switchMode } = useMapInteraction();
  const {
    routes,
    setRoutes,
    selectedRouteId,
    setSelectedRouteId,
    loading,
    error,
    generateLoop,
    suggest,
    clearRoutes,
  } = useRouteGeneration();

  const [targetDistance, setTargetDistance] = useState(5);
  const [terrain, setTerrain] = useState<TerrainPreference>('none');
  const { updateRouteWaypoint, addRouteWaypoint } = useRouteEditor(routes, setRoutes, terrain);

  // Auto-generate routes in suggest mode when start point + distance are ready
  useEffect(() => {
    if (mode === 'suggest-routes' && start && !loading) {
      suggest(start, targetDistance, terrain);
    }
  }, [mode, start, targetDistance, terrain]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    reset();
    clearRoutes();
  };

  const handleSwitchMode = (newMode: typeof mode) => {
    switchMode(newMode);
    clearRoutes();
  };

  return (
    <AppLayout
      map={
        <MapView
          start={start}
          furthest={furthest}
          routes={routes}
          selectedRouteId={selectedRouteId}
          onMapClick={handleMapClick}
          onSelectRoute={setSelectedRouteId}
          onWaypointDrag={updateRouteWaypoint}
          onWaypointAdd={addRouteWaypoint}
        />
      }
      panel={
        <ControlPanel
          mode={mode}
          clickState={clickState}
          routes={routes}
          selectedRouteId={selectedRouteId}
          loading={loading}
          error={error}
          targetDistance={targetDistance}
          terrain={terrain}
          hasStart={start !== null}
          onSwitchMode={handleSwitchMode}
          onReset={handleReset}
          onSelectRoute={setSelectedRouteId}
          onTargetDistanceChange={setTargetDistance}
          onTerrainChange={setTerrain}
          onGenerateLoop={() => {
            if (start && furthest) generateLoop(start, furthest, terrain);
          }}
          onSuggestRoutes={() => {
            if (start) suggest(start, targetDistance, terrain);
          }}
          onStartFromSearch={setStartFromSearch}
        />
      }
    />
  );
}

export default App;
