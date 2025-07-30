'use client';

import React, { useState, useEffect } from 'react';
import { 
  ZapIcon, 
  ClockIcon, 
  BrainIcon, 
  GlobeIcon,
  TrendingUpIcon,
  AlertIcon,
  CheckCircleIcon
} from '@/components/icons';

interface PerformanceStatsProps {
  searchTime?: number;
  resultsCount?: number;
  cacheHit?: boolean;
  servicesStatus?: {
    email: boolean;
    webScraping: boolean;
    ai: boolean;
  };
}

export default function PerformanceStats({
  searchTime,
  resultsCount,
  cacheHit,
  servicesStatus
}: PerformanceStatsProps) {
  const [stats, setStats] = useState({
    cacheHitRate: 0.85,
    avgSearchTime: 2.3,
    totalSearches: 1247,
    successRate: 0.98
  });

  useEffect(() => {
    // Simula aggiornamento statistiche in tempo reale
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cacheHitRate: prev.cacheHitRate + (Math.random() - 0.5) * 0.01,
        avgSearchTime: prev.avgSearchTime + (Math.random() - 0.5) * 0.1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    return value <= threshold ? 'text-green-600' : 'text-yellow-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ZapIcon className="h-5 w-5 text-blue-600" />
        Performance & Statistiche
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tempo di ricerca */}
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <ClockIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Tempo Ricerca</p>
          <p className={`font-bold text-lg ${getPerformanceColor(searchTime || 0, 3)}`}>
            {searchTime ? formatTime(searchTime) : 'N/A'}
          </p>
        </div>

        {/* Risultati */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <GlobeIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Risultati</p>
          <p className="font-bold text-lg text-green-600">
            {resultsCount || 0}
          </p>
        </div>

        {/* Cache Hit */}
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <BrainIcon className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Cache Hit</p>
          <p className="font-bold text-lg text-purple-600">
            {cacheHit ? 'Sì' : 'No'}
          </p>
        </div>

        {/* Success Rate */}
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <TrendingUpIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Success Rate</p>
          <p className="font-bold text-lg text-yellow-600">
            {(stats.successRate * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Statistiche globali */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Statistiche Globali</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-gray-500">Cache Hit Rate:</span>
            <span className="ml-1 font-medium">{(stats.cacheHitRate * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Tempo Medio:</span>
            <span className="ml-1 font-medium">{formatTime(stats.avgSearchTime)}</span>
          </div>
          <div>
            <span className="text-gray-500">Ricerche Totali:</span>
            <span className="ml-1 font-medium">{stats.totalSearches.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Stato servizi */}
      {servicesStatus && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Stato Servizi</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${servicesStatus.email ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">Email</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${servicesStatus.webScraping ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">Web Scraping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${servicesStatus.ai ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600">AI Analysis</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicatori di performance */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <CheckCircleIcon className="h-3 w-3 text-green-500" />
          <span>Sistema ottimizzato</span>
        </div>
        <div className="flex items-center gap-1">
          <ZapIcon className="h-3 w-3 text-blue-500" />
          <span>Scraping parallelo</span>
        </div>
        <div className="flex items-center gap-1">
          <BrainIcon className="h-3 w-3 text-purple-500" />
          <span>Cache intelligente</span>
        </div>
      </div>
    </div>
  );
} 