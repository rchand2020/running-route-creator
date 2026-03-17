type Props = {
  value: number;
  onChange: (miles: number) => void;
};

export function DistanceSlider({ value, onChange }: Props) {
  const min = 1;
  const max = 15;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="distance-slider">
      <label>
        Target distance: <strong>{value} mi</strong>
      </label>
      <div className="slider-wrapper">
        <div className="slider-badge" style={{ left: `${pct}%` }}>
          {value} mi
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
      <div className="slider-labels">
        <span>1 mi</span>
        <span>15 mi</span>
      </div>
    </div>
  );
}
