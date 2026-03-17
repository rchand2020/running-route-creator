import { useState, useCallback } from 'react';
import type { LatLng, ClickState, AppMode } from '../types';

export function useMapInteraction() {
  const [start, setStart] = useState<LatLng | null>(null);
  const [furthest, setFurthest] = useState<LatLng | null>(null);
  const [clickState, setClickState] = useState<ClickState>('set-start');
  const [mode, setMode] = useState<AppMode>('pick-points');

  const handleMapClick = useCallback(
    (latlng: LatLng) => {
      if (mode === 'suggest-routes') {
        setStart(latlng);
        setFurthest(null);
        setClickState('viewing');
        return;
      }

      if (clickState === 'set-start') {
        setStart(latlng);
        setFurthest(null);
        setClickState('set-furthest');
      } else if (clickState === 'set-furthest') {
        setFurthest(latlng);
        setClickState('viewing');
      }
    },
    [clickState, mode]
  );

  const setStartFromSearch = useCallback(
    (latlng: LatLng) => {
      setStart(latlng);
      setFurthest(null);
      if (mode === 'suggest-routes') {
        setClickState('viewing');
      } else {
        setClickState('set-furthest');
      }
    },
    [mode]
  );

  const reset = useCallback(() => {
    setStart(null);
    setFurthest(null);
    setClickState('set-start');
  }, []);

  const switchMode = useCallback(
    (newMode: AppMode) => {
      setMode(newMode);
      reset();
    },
    [reset]
  );

  return { start, furthest, clickState, mode, handleMapClick, setStartFromSearch, reset, switchMode };
}
