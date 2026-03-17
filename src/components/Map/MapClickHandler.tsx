import { useMapEvents } from 'react-leaflet';
import type { LatLng } from '../../types';

type Props = {
  onClick: (latlng: LatLng) => void;
};

export function MapClickHandler({ onClick }: Props) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}
