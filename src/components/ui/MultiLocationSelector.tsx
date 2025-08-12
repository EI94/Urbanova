'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchIcon, MapIcon, XIcon, PlusIcon, TagIcon } from '@/components/icons';



interface MultiLocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

import { italianLocationsService, Location } from '@/lib/italianLocationsService';

// Database completo delle località italiane
const ITALIAN_LOCATIONS: Location[] = italianLocationsService.getAllLocations();

export default function MultiLocationSelector({
  value,
  onChange,
  placeholder = "Cerca localizzazioni...",
  className = ""
}: MultiLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Ricerca suggerimenti
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    // Debounce per evitare troppe ricerche
    const timeoutId = setTimeout(() => {
      const results = italianLocationsService.searchLocations(searchQuery);
      setSuggestions(results);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
  };

  const handleSuggestionClick = (location: Location) => {
    if (!selectedLocations.find(loc => loc.id === location.id)) {
      const newSelectedLocations = [...selectedLocations, location];
      setSelectedLocations(newSelectedLocations);
      updateValue(newSelectedLocations);
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

  const updateValue = (locations: Location[]) => {
    if (locations.length === 0) {
      onChange('');
    } else if (locations.length === 1) {
      onChange(locations[0].name);
    } else {
      onChange(locations.map(loc => loc.name).join(', '));
    }
  };

  const getLocationIcon = (location: Location) => {
    switch (location.type) {
      case 'regione':
        return <MapIcon className="w-4 h-4 text-purple-500" />;
      case 'provincia':
        return <MapIcon className="w-4 h-4 text-blue-500" />;
      case 'comune':
        return <MapIcon className="w-4 h-4 text-green-500" />;
      case 'quartiere':
        return <MapIcon className="w-4 h-4 text-orange-500" />;
      case 'zona':
        return <MapIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MapIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLocationBadge = (location: Location) => {
    switch (location.type) {
      case 'regione':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Regione</span>;
      case 'provincia':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Provincia</span>;
      case 'comune':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Comune</span>;
      case 'quartiere':
        return <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">Quartiere</span>;
      case 'zona':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Zona</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Località</span>;
    }
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
          placeholder={selectedLocations.length > 0 ? "Aggiungi altre località..." : placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Località selezionate */}
      {selectedLocations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm"
            >
              {getLocationIcon(location)}
              <span className="text-blue-900">{location.name}</span>
              {getLocationBadge(location)}
              <button
                onClick={() => removeLocation(location.id)}
                className="text-blue-400 hover:text-blue-600"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown suggerimenti */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                Ricerca in corso...
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSuggestionClick(location)}
                  disabled={selectedLocations.find(loc => loc.id === location.id)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                    selectedLocations.find(loc => loc.id === location.id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getLocationIcon(location)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {location.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {location.parent ? location.parent : location.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getLocationBadge(location)}
                      {selectedLocations.find(loc => loc.id === location.id) && (
                        <span className="text-xs text-green-600">✓ Selezionata</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length >= 2 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Nessuna localizzazione trovata per "{searchQuery}"
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Inizia a digitare per cercare localizzazioni...
            </div>
          )}
        </div>
      )}

      {/* Informazioni aggiuntive */}
      {selectedLocations.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TagIcon className="w-4 h-4" />
            <span>Ricerca in {selectedLocations.length} località</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            La ricerca verrà eseguita in tutte le località selezionate
          </div>
        </div>
      )}
    </div>
  );
}
