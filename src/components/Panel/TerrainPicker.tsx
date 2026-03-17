import type { TerrainPreference } from '../../types';

type Props = {
  value: TerrainPreference;
  onChange: (pref: TerrainPreference) => void;
};

const options: { value: TerrainPreference; label: string; icon: string }[] = [
  { value: 'none', label: 'Any', icon: '⚪' },
  { value: 'parks', label: 'Parks', icon: '🌳' },
  { value: 'waterfront', label: 'Water', icon: '🌊' },
];

export function TerrainPicker({ value, onChange }: Props) {
  return (
    <div className="terrain-picker">
      <label>Terrain preference</label>
      <div className="terrain-buttons">
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`terrain-btn ${value === opt.value ? 'active' : ''}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="terrain-icon">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
