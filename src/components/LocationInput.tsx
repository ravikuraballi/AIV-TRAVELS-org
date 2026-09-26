import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Plane, 
  Train, 
  Building2, 
  Compass, 
  Crosshair, 
  Loader2, 
  X, 
  Check 
} from 'lucide-react';
import { 
  searchOnlineLocations, 
  searchLocalLocations, 
  reverseGeocode, 
  LocationSuggestion 
} from '../services/geocoding';

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  pinColor?: 'emerald' | 'amber' | 'blue' | 'red';
  showCurrentLocationBtn?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search address, landmark or city...',
  required = false,
  pinColor = 'emerald',
  showCurrentLocationBtn = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions when user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);
    setIsOpen(true);
    setLocateError(null);

    // Immediate local results
    const local = searchLocalLocations(text);
    setSuggestions(local);

    // Debounced online lookup
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (text.trim().length >= 3) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchOnlineLocations(text);
          setSuggestions(results);
        } catch {
          // ignore
        } finally {
          setIsLoading(false);
        }
      }, 350);
    } else {
      setIsLoading(false);
    }
  };

  const handleSelect = (item: LocationSuggestion) => {
    onChange(item.displayName);
    setIsOpen(false);
  };

  // Browser GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateError('GPS location not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const address = await reverseGeocode(latitude, longitude);
          onChange(address);
          setIsOpen(false);
        } catch {
          onChange(`GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocateError('Location permission denied. Please allow GPS access or search above.');
        } else {
          setLocateError('Could not retrieve GPS position. Please enter manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const getCategoryIcon = (category: LocationSuggestion['category']) => {
    switch (category) {
      case 'airport':
        return <Plane className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'railway':
        return <Train className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'city':
        return <Building2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'tourist':
        return <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
  };

  const pinColorClass = 
    pinColor === 'emerald' ? 'text-emerald-600' :
    pinColor === 'red' ? 'text-red-500' :
    pinColor === 'amber' ? 'text-amber-500' : 'text-blue-600';

  return (
    <div ref={containerRef} className="relative space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-slate-700">{label}</label>
        {showCurrentLocationBtn && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="text-[11px] font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Use device GPS to locate address"
          >
            {isLocating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                <span>Locating GPS...</span>
              </>
            ) : (
              <>
                <Crosshair className="w-3 h-3 text-amber-600" />
                <span>Use Current Location</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative">
        <div className={`absolute left-3 top-3 ${pinColorClass} pointer-events-none`}>
          <MapPin className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          required={required}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            if (suggestions.length === 0) {
              setSuggestions(searchLocalLocations(value));
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-white"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {locateError && (
        <p className="text-[11px] text-red-600 mt-1">{locateError}</p>
      )}

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 z-[600] overflow-hidden max-h-64 overflow-y-auto">
          {/* Quick Action: Use Current Location */}
          {showCurrentLocationBtn && (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/70 border-b border-slate-100 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Crosshair className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
                <span>📍 Use My Current Location (GPS)</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-normal">Auto-detect address</span>
            </button>
          )}

          {isLoading && (
            <div className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span>Searching locations across Karnataka & India...</span>
            </div>
          )}

          {suggestions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {suggestions.map((item) => {
                const isSelected = value.toLowerCase() === item.displayName.toLowerCase();
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full px-3.5 py-2.5 text-left text-xs flex items-start gap-2.5 transition-colors hover:bg-slate-50 ${
                      isSelected ? 'bg-amber-50/60 font-semibold' : ''
                    }`}
                  >
                    <div className="mt-0.5">{getCategoryIcon(item.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 truncate font-medium">
                        {item.displayName.split(',')[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {item.displayName.split(',').slice(1).join(',').trim() || 'Verified Transit Point'}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : !isLoading ? (
            <div className="p-4 text-center text-xs text-slate-500">
              <p className="font-medium text-slate-700">No matching place found in local directory</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Press Enter or tap outside to use: &quot;<span className="text-slate-600">{value}</span>&quot;
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
