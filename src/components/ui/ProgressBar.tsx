'use client';

import React from 'react';

import { BrainIcon, SearchIcon, FilterIcon, CheckCircleIcon } from '@/components/icons';

interface ProgressBarProps {
  phase: 'idle' | 'searching' | 'analyzing' | 'filtering' | 'complete' | 'error';
  progress: number;
  message: string;
  currentSource?: string;
  sourcesCompleted?: string[];
  sourcesTotal?: string[];
}

export default function ProgressBar({
  phase,
  progress,
  message,
  currentSource = '',
  sourcesCompleted = [],
  sourcesTotal = [],
}: ProgressBarProps) {
  if (phase === 'idle') return null;

  const getPhaseIcon = () => {
    switch (phase) {
      case 'searching':
        return <SearchIcon className="h-5 w-5 text-blue-600" />;
      case 'analyzing':
        return <BrainIcon className="h-5 w-5 text-purple-600" />;
      case 'filtering':
        return <FilterIcon className="h-5 w-5 text-green-600" />;
      case 'complete':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <div className="h-5 w-5 text-red-600">⚠️</div>;
      default:
        return <SearchIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'error':
        return 'bg-red-500';
      case 'complete':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getPhaseBgColor = () => {
    switch (phase) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'complete':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${getPhaseBgColor()}`}>
      <div className="flex items-center gap-3 mb-3">
        {getPhaseIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{message}</span>
            <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getPhaseColor()}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Sources Status */}
      {sourcesTotal.length > 0 && (
        <div className="flex items-center gap-4">
          {sourcesTotal.map(source => (
            <div key={source} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  sourcesCompleted.includes(source)
                    ? 'bg-green-500'
                    : source === currentSource
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-gray-300'
                }`}
              ></div>
              <span className="text-xs text-gray-600">{source}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current Source Indicator */}
      {currentSource && !sourcesCompleted.includes(currentSource) && (
        <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
          Analizzando: {currentSource}
        </div>
      )}
    </div>
  );
}
