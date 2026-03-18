import type { LatLng } from '../types';

export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported by your browser');
      return;
    }

    // Try without high accuracy first (faster, uses WiFi/IP),
    // fall back to high accuracy if that fails
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        // Retry with high accuracy on failure
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject('Location permission denied. Please allow location access in your browser settings.');
                break;
              case error.POSITION_UNAVAILABLE:
                reject('Location information is unavailable.');
                break;
              case error.TIMEOUT:
                reject('Location request timed out.');
                break;
              default:
                reject('An unknown error occurred while getting your location.');
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 600000 },
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  });
}
