'use client';

import { useState, useEffect, useRef } from 'react';
import { advancedLocationService, LocationZone, LocationSearchResult } from '@/lib/advancedLocationService';
import { SearchIcon, MapIcon, ChevronDownIcon, XIcon } from '@/components/icons';

interface AdvancedLocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AdvancedLocationSelector({
  value,
  onChange,
  placeholder = "Cerca localizzazione...",
  className = ""
}: AdvancedLocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [selectedZone, setSelectedZone] = useState<LocationZone | null>(null);
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
      const results = advancedLocationService.searchLocations(searchQuery);
      setSuggestions(results.slice(0, 10));
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Aggiorna searchQuery quando cambia value
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    setIsOpen(true);
    
    if (newValue === '') {
      onChange('');
      setSelectedZone(null);
    }
  };

  const handleSuggestionClick = (result: LocationSearchResult) => {
    setSelectedZone(result.zone);
    setSearchQuery(result.zone.name);
    onChange(result.zone.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSelectedZone(null);
    onChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getZoneIcon = (zone: LocationZone) => {
    switch (zone.type) {
      case 'quartiere':
        return <MapIcon className="w-4 h-4 text-blue-500" />;
      case 'comune':
        return <MapIcon className="w-4 h-4 text-green-500" />;
      case 'zona':
        return <MapIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <MapIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getZoneBadge = (zone: LocationZone) => {
    switch (zone.type) {
      case 'quartiere':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Quartiere</span>;
      case 'comune':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Comune</span>;
      case 'zona':
        return <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Zona</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Località</span>;
    }
  };

  return (
    <div className={`relative ${className}`}>
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
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-8 pr-3 flex items-center"
        >
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

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
              {suggestions.map((result, index) => (
                <button
                  key={`${result.zone.id}-${index}`}
                  onClick={() => handleSuggestionClick(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getZoneIcon(result.zone)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {result.zone.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.zone.type === 'comune' && result.zone.parent ? 
                            `${result.zone.parent.charAt(0).toUpperCase() + result.zone.parent.slice(1)}` : 
                            'Località'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getZoneBadge(result.zone)}
                      <div className="text-xs text-gray-400">
                        {result.relevance}%
                      </div>
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

      {/* Informazioni zona selezionata */}
      {selectedZone && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getZoneIcon(selectedZone)}
              <div>
                <div className="text-sm font-medium text-blue-900">
                  {selectedZone.name}
                </div>
                <div className="text-xs text-blue-700">
                  {selectedZone.type === 'comune' && selectedZone.parent ? 
                    `Provincia di ${selectedZone.parent.charAt(0).toUpperCase() + selectedZone.parent.slice(1)}` : 
                    'Zona selezionata'
                  }
                </div>
              </div>
            </div>
            {getZoneBadge(selectedZone)}
          </div>
          
          {selectedZone.searchTerms.length > 1 && (
            <div className="mt-2">
              <div className="text-xs text-blue-600 font-medium">Termini di ricerca:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedZone.searchTerms.slice(0, 3).map((term, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
