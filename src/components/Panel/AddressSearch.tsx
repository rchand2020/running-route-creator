import { useState, useRef, useEffect, useCallback } from 'react';
import type { LatLng, GeocodingResult } from '../../types';
import { geocodeSearch } from '../../services/ors';

type Props = {
  onSelect: (latlng: LatLng) => void;
  onLocateMe: () => void;
};

export function AddressSearch({ onSelect, onLocateMe }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (text: string) => {
    if (text.trim().length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }
    try {
      const r = await geocodeSearch(text);
      setResults(r);
      setOpen(r.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLabel) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search, selectedLabel]);

  const handleSelect = (result: GeocodingResult) => {
    setSelectedLabel(result.label);
    setQuery(result.label);
    setOpen(false);
    setResults([]);
    onSelect({ lat: result.lat, lng: result.lng });
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedLabel(null);
  };

  return (
    <div className="address-search">
      <div className="address-search-row">
        <input
          type="text"
          className="address-input"
          placeholder="Search address or place..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0 && !selectedLabel) setOpen(true); }}
        />
        <button className="locate-btn" onClick={onLocateMe} title="Use my location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="2" y1="12" x2="6" y2="12" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </button>
      </div>
      {open && (
        <ul className="address-dropdown">
          {results.map((r, i) => (
            <li key={i} className="address-option" onClick={() => handleSelect(r)}>
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
