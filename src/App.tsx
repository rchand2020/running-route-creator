import { useState, useEffect } from 'react';
import type { TerrainPreference, SavedRoute } from './types';
import { useMapInteraction } from './hooks/useMapInteraction';
import { useRouteGeneration } from './hooks/useRouteGeneration';
import { useRouteEditor } from './hooks/useRouteEditor';
import { useSavedRoutes } from './hooks/useSavedRoutes';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import { MapView } from './components/Map/MapView';
import { ControlPanel } from './components/Panel/ControlPanel';
import { AuthModal } from './components/Auth/AuthModal';
import { getCurrentPosition } from './services/geolocation';
import './App.css';

let geoPromise: Promise<import('./types').LatLng> | null = null;

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

  const [userLocation, setUserLocation] = useState<import('./types').LatLng | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  const { user, signIn, signUp, signOut } = useAuth();
  const { savedRoutes, loading: savedRoutesLoading, savingRouteId, fetchSavedRoutes, saveRoute, deleteRoute } = useSavedRoutes();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Request geolocation on mount — cache the promise so StrictMode double-mount
  // doesn't fire two separate geolocation requests
  useEffect(() => {
    if (!geoPromise) {
      geoPromise = getCurrentPosition();
    }
    geoPromise
      .then((pos) => {
        setUserLocation(pos);
        setLocationGranted(true);
      })
      .catch(() => {
        setLocationGranted(false);
      });
  }, []);

  // Auto-generate routes in suggest mode when start point + distance are ready
  useEffect(() => {
    if (mode === 'suggest-routes' && start && !loading) {
      suggest(start, targetDistance, terrain);
    }
  }, [mode, start, targetDistance, terrain]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLocateMe = async () => {
    try {
      const pos = await getCurrentPosition();
      setStartFromSearch(pos);
    } catch (err) {
      alert(err);
    }
  };

  const handleReset = () => {
    reset();
    clearRoutes();
  };

  const handleSwitchMode = (newMode: typeof mode) => {
    switchMode(newMode);
    clearRoutes();
  };

  const handleSaveRoute = async (route: import('./types').RouteResult) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await saveRoute(route);
    } catch (err) {
      console.error('Failed to save route:', err);
    }
  };

  const handleLoadSavedRoute = (saved: SavedRoute) => {
    // Add to routes list if not already there and select it
    const exists = routes.find((r) => r.id === saved.id);
    if (!exists) {
      setRoutes((prev) => [...prev, saved]);
    }
    setSelectedRouteId(saved.id);
  };

  const handleDeleteSavedRoute = async (savedId: string) => {
    try {
      await deleteRoute(savedId);
    } catch (err) {
      console.error('Failed to delete route:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <AppLayout
        map={
          <MapView
            start={start}
            furthest={furthest}
            routes={routes}
            selectedRouteId={selectedRouteId}
            userLocation={userLocation}
            locationGranted={locationGranted}
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
            onLocateMe={handleLocateMe}
            user={user}
            savedRoutes={savedRoutes}
            savedRoutesLoading={savedRoutesLoading}
            savingRouteId={savingRouteId}
            onSaveRoute={handleSaveRoute}
            onLoadSavedRoute={handleLoadSavedRoute}
            onDeleteSavedRoute={handleDeleteSavedRoute}
            onFetchSavedRoutes={fetchSavedRoutes}
            onSignInClick={() => setShowAuthModal(true)}
            onSignOut={handleSignOut}
          />
        }
      />
      {showAuthModal && (
        <AuthModal
          onSignIn={signIn}
          onSignUp={signUp}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}

export default App;
