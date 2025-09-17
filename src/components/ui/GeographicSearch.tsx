/**
 * Componente UI per Ricerca Geografica
 * Integra perfettamente con il design esistente di Urbanova
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Building, Map, Filter, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { istatApiService } from '@/lib/geographic/istatApiService';

export interface GeographicSearchResult {
  id: number;
  nome: string;
  tipo: 'comune' | 'zona';
  provincia: string;
  regione: string;
  latitudine?: number;
  longitudine?: number;
  popolazione?: number;
  superficie?: number;
  distance?: number;
  score?: number;
  metadata?: any;
}

export interface GeographicSearchProps {
  onResultSelect?: (result: GeographicSearchResult) => void;
  onResultsChange?: (results: GeographicSearchResult[]) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  showMap?: boolean;
  maxResults?: number;
  includeCoordinates?: boolean;
  includeMetadata?: boolean;
}

export function GeographicSearch({
  onResultSelect,
  onResultsChange,
  placeholder = "Cerca comuni, zone, quartieri...",
  className,
  showFilters = true,
  showMap = false,
  maxResults = 20,
  includeCoordinates = true,
  includeMetadata = false
}: GeographicSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeographicSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'comune' | 'zona',
    region: '',
    province: ''
  });

  // Debounce per ricerca
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      onResultsChange?.([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  // Esegue ricerca
  const performSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // CHIRURGICO: Usa direttamente istatApiService invece di chiamate API
      console.log('🔍 [GeographicSearch] Ricerca tramite istatApiService:', query);
      
      const results = await istatApiService.searchComuni({
        query: query,
        limit: maxResults,
        includeCoordinates: includeCoordinates,
        includeMetadata: includeMetadata,
        regione: filters.region,
        provincia: filters.province
      });

      // Converte risultati nel formato atteso
      const formattedResults: GeographicSearchResult[] = results.comuni.map((comune, index) => ({
        id: parseInt(comune.codiceIstat),
        nome: comune.nome,
        tipo: 'comune' as const,
        provincia: comune.provincia,
        regione: comune.regione,
        latitudine: includeCoordinates ? comune.latitudine : undefined,
        longitudine: includeCoordinates ? comune.longitudine : undefined,
        popolazione: comune.popolazione,
        superficie: comune.superficie,
        score: 250 - index, // Score decrescente
        metadata: includeMetadata ? {
          codiceIstat: comune.codiceIstat,
          altitudine: comune.altitudine,
          zonaClimatica: comune.zonaClimatica,
          cap: comune.cap,
          prefisso: comune.prefisso
        } : undefined
      }));

      setResults(formattedResults);
      setShowResults(true);
      onResultsChange?.(formattedResults);
    } catch (err) {
      console.error('❌ [GeographicSearch] Errore ricerca:', err);
      setError('Errore durante la ricerca');
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, maxResults, includeCoordinates, includeMetadata, onResultsChange]);

  // Gestisce selezione risultato
  const handleResultSelect = (result: GeographicSearchResult) => {
    onResultSelect?.(result);
    setShowResults(false);
    setQuery(result.nome);
  };

  // Gestisce cambio filtri
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Pulisce ricerca
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setError(null);
    onResultsChange?.([]);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Input di ricerca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="input-box w-full pl-10 pr-10 py-3 text-base"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Filtri */}
      {showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">Tutti</option>
            <option value="comune">Comuni</option>
            <option value="zona">Zone</option>
          </select>
          
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="">Tutte le regioni</option>
            <option value="Lombardia">Lombardia</option>
            <option value="Lazio">Lazio</option>
            <option value="Campania">Campania</option>
            <option value="Sicilia">Sicilia</option>
            <option value="Veneto">Veneto</option>
            <option value="Emilia-Romagna">Emilia-Romagna</option>
            <option value="Piemonte">Piemonte</option>
            <option value="Puglia">Puglia</option>
            <option value="Toscana">Toscana</option>
            <option value="Calabria">Calabria</option>
            <option value="Sardegna">Sardegna</option>
            <option value="Liguria">Liguria</option>
            <option value="Marche">Marche</option>
            <option value="Abruzzo">Abruzzo</option>
            <option value="Umbria">Umbria</option>
            <option value="Friuli-Venezia Giulia">Friuli-Venezia Giulia</option>
            <option value="Trentino-Alto Adige">Trentino-Alto Adige</option>
            <option value="Basilicata">Basilicata</option>
            <option value="Molise">Molise</option>
            <option value="Valle d'Aosta">Valle d'Aosta</option>
          </select>
        </div>
      )}

      {/* Risultati */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {error && (
            <div className="p-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          
          {!error && (results || []).length === 0 && !isLoading && (
            <div className="p-3 text-gray-500 dark:text-gray-400 text-sm">
              Nessun risultato trovato
            </div>
          )}
          
          {(results || []).map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {result.tipo === 'comune' ? (
                    <Building className="h-4 w-4 text-blue-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.nome}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {result.tipo}
                    </span>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{result.provincia}</span>
                    <span>{result.regione}</span>
                    {result.popolazione && (
                      <span>{result.popolazione.toLocaleString()} abitanti</span>
                    )}
                    {result.distance && (
                      <span>{result.distance} km</span>
                    )}
                  </div>
                  
                  {result.score && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full" 
                          style={{ width: `${Math.min(result.score * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay per chiudere risultati */}
      {showResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

// Componente per visualizzazione risultati compatta
export function GeographicSearchResults({ 
  results, 
  onSelect,
  className 
}: {
  results: GeographicSearchResult[];
  onSelect?: (result: GeographicSearchResult) => void;
  className?: string;
}) {
  if ((results || []).length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {(results || []).map((result) => (
        <div
          key={result.id}
          onClick={() => onSelect?.(result)}
          className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {result.tipo === 'comune' ? (
                <Building className="h-4 w-4 text-blue-500" />
              ) : (
                <MapPin className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.nome}
                </h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {result.tipo}
                </span>
              </div>
              
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {result.provincia}, {result.regione}
                {result.popolazione && ` • ${result.popolazione.toLocaleString()} abitanti`}
                {result.distance && ` • ${result.distance} km`}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
