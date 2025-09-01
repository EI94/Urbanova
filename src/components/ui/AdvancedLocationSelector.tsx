'use client';

import { useState, useEffect, useRef } from 'react';

import {
  SearchIcon,
  MapIcon,
  XIcon,
  PlusIcon,
  TagIcon,
  GlobeIcon,
  MapPinIcon,
} from '@/components/icons';
import { advancedLocationsService, AdvancedLocation } from '@/lib/advancedLocationsService';

interface AdvancedLocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
  showMultiple?: boolean;
}

export default function AdvancedLocationSelector({
  value,
  onChange,
  placeholder = 'Cerca localizzazioni (es. Frascati, Roma, Milano...)',
  className = '',
  showMultiple = false,
}: AdvancedLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AdvancedLocation[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<AdvancedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStats, setSearchStats] = useState<{
    total: number;
    italian: number;
    european: number;
  }>({ total: 0, italian: 0, european: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Gestione click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inizializza le località selezionate dal valore esistente
  useEffect(() => {
    if (value && showMultiple) {
      // Se c'è un valore esistente, cerca di mapparlo alle località
      const locationNames = value
        .split(',')
        .map(name => name.trim())
        .filter(Boolean);

      if (locationNames.length > 0) {
        const initializeLocations = async () => {
          const foundLocations: AdvancedLocation[] = [];

          for (const name of locationNames) {
            try {
              const results = await advancedLocationsService.searchLocations(name, 5);
              if (results.length > 0) {
                const exactMatch = results.find(
                  loc => loc.name.toLowerCase() === name.toLowerCase()
                );
                if (exactMatch && !foundLocations.find(loc => loc.id === exactMatch.id)) {
                  foundLocations.push(exactMatch);
                }
              }
            } catch (error) {
              console.warn('Errore mappatura località esistente:', error);
            }
          }

          // Sostituisci completamente le località selezionate invece di aggiungerle
          setSelectedLocations(foundLocations);
        };

        initializeLocations();
      } else {
        // Se non ci sono località, resetta lo stato
        setSelectedLocations([]);
      }
    } else if (!value && showMultiple) {
      // Se non c'è valore, resetta lo stato
      setSelectedLocations([]);
    }
  }, [value, showMultiple]);

  // Ricerca suggerimenti intelligente
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Debounce per evitare troppe ricerche
    const timeoutId = setTimeout(async () => {
      try {
        const results = await advancedLocationsService.searchLocations(searchQuery, 30);
        setSuggestions(results);

        // Statistiche di ricerca
        const italian = results.filter(loc => loc.country === 'IT').length;
        const european = results.filter(loc => loc.country === 'EU').length;
        setSearchStats({
          total: results.length,
          italian,
          european,
        });
      } catch (error) {
        console.error('Errore ricerca località:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (location: AdvancedLocation) => {
    if (showMultiple) {
      // Controlla se la località è già selezionata (per ID e per nome)
      const isAlreadySelected = selectedLocations.find(
        loc => loc.id === location.id || loc.name.toLowerCase() === location.name.toLowerCase()
      );

      if (!isAlreadySelected) {
        const newSelectedLocations = [...selectedLocations, location];
        setSelectedLocations(newSelectedLocations);
        updateValue(newSelectedLocations);
      } else {
        console.log('Località già selezionata:', location.name);
      }
    } else {
      // Selezione singola
      onChange(location.name);
      setSearchQuery('');
      setIsOpen(false);
    }

    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeLocation = (locationId: string) => {
    const newSelectedLocations = selectedLocations.filter(loc => loc.id !== locationId);
    setSelectedLocations(newSelectedLocations);
    updateValue(newSelectedLocations);
  };

  const updateValue = (locations: AdvancedLocation[]) => {
    if (locations.length === 0) {
      onChange('');
    } else if (locations.length === 1) {
      onChange(locations[0].name);
    } else {
      // Per selezione multipla, rimuovi duplicati e mantieni solo località uniche
      const uniqueLocations = locations.filter(
        (location, index, self) =>
          index ===
          self.findIndex(
            loc => loc.id === location.id || loc.name.toLowerCase() === location.name.toLowerCase()
          )
      );

      // Aggiorna lo stato con località uniche
      if (uniqueLocations.length !== locations.length) {
        setSelectedLocations(uniqueLocations);
      }

      const locationNames = uniqueLocations.map(loc => loc.name);
      const newValue = locationNames.join(', ');

      // Evita aggiornamenti inutili se il valore è identico
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const getLocationIcon = (location: AdvancedLocation) => {
    switch (location.type) {
      case 'regione':
        return <GlobeIcon className="h-4 w-4 text-blue-600" />;
      case 'provincia':
        return <MapIcon className="h-4 w-4 text-green-600" />;
      case 'comune':
        return <MapPinIcon className="h-4 w-4 text-red-600" />;
      case 'quartiere':
        return <TagIcon className="h-4 w-4 text-purple-600" />;
      default:
        return <MapPinIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLocationBadge = (location: AdvancedLocation) => {
    if (location.country === 'IT') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          🇮🇹 {location.type}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          🇪🇺 {location.type}
        </span>
      );
    }
  };

  const getLocationDetails = (location: AdvancedLocation) => {
    const details = [];
    if (location.region) details.push(location.region);
    if (location.province) details.push(location.province);
    return details.join(', ');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input principale */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Località selezionate (solo per selezione multipla) */}
      {showMultiple && selectedLocations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLocations.map(location => (
            <span
              key={location.id}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {getLocationIcon(location)}
              {location.name}
              <button
                onClick={() => removeLocation(location.id)}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:bg-blue-200"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown suggerimenti */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        >
          {/* Statistiche ricerca */}
          {searchStats.total > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span>📊 {searchStats.total} risultati trovati</span>
                <div className="flex gap-2">
                  <span className="text-green-600">🇮🇹 {searchStats.italian}</span>
                  <span className="text-blue-600">🇪🇺 {searchStats.european}</span>
                </div>
              </div>
            </div>
          )}

          {/* Messaggio caricamento */}
          {isLoading && (
            <div className="px-4 py-2 text-sm text-gray-500">🔍 Ricerca in corso...</div>
          )}

          {/* Nessun risultato */}
          {!isLoading && suggestions.length === 0 && searchQuery.length >= 2 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              ❌ Nessuna località trovata per "{searchQuery}"
            </div>
          )}

          {/* Suggerimenti */}
          {suggestions.map(location => (
            <button
              key={location.id}
              onClick={() => handleSuggestionClick(location)}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getLocationIcon(location)}
                  <div>
                    <div className="font-medium text-gray-900">{location.name}</div>
                    {getLocationDetails(location) && (
                      <div className="text-xs text-gray-500">{getLocationDetails(location)}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">{getLocationBadge(location)}</div>
              </div>
            </button>
          ))}

          {/* Footer con informazioni */}
          {suggestions.length > 0 && (
            <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-200">
              💡 Ricerca intelligente con {searchStats.total} località disponibili
            </div>
          )}
        </div>
      )}
    </div>
  );
}
