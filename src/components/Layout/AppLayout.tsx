import type { ReactNode } from 'react';

type Props = {
  map: ReactNode;
  panel: ReactNode;
};

export function AppLayout({ map, panel }: Props) {
  return (
    <div className="app-layout">
      <div className="map-pane">{map}</div>
      <div className="panel-pane">{panel}</div>
    </div>
  );
}
