'use client';

// 🎨 OS HEADER MODE TOGGLE - Johnny Ive Design
// Ask | Ask-to-Act | Act - 3 modalità OS con chiara indicazione behavior

import React from 'react';
import { Eye, CheckCircle2, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OsMode } from '@/hooks/os2/useOsSidecar';

interface OsHeaderModeToggleProps {
  mode: OsMode;
  onChange: (mode: OsMode) => void;
  className?: string;
}

/**
 * Mode configuration con icone e descrizioni
 */
const MODE_CONFIG: Record<OsMode, {
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: string;
  color: string;
}> = {
  ask: {
    icon: <Eye className="w-4 h-4" />,
    label: 'Ask',
    description: 'Solo analisi, nessuna azione',
    color: 'blue',
  },
  ask_to_act: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: 'Ask-to-Act',
    description: 'Anteprima + conferma azioni',
    badge: 'Default',
    color: 'green',
  },
  act: {
    icon: <Zap className="w-4 h-4" />,
    label: 'Act',
    description: 'Esecuzione diretta (safe only)',
    color: 'amber',
  },
};

/**
 * OS Header Mode Toggle Component
 */
export function OsHeaderModeToggle({ mode, onChange, className }: OsHeaderModeToggleProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  const currentConfig = MODE_CONFIG[mode];
  
  return (
    <div className={cn('relative', className)}>
      {/* Toggle Buttons */}
      <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-xl shadow-inner">
        {(['ask', 'ask_to_act', 'act'] as OsMode[]).map((m) => {
          const config = MODE_CONFIG[m];
          const isActive = mode === m;
          
          return (
            <button
              key={m}
              onClick={() => onChange(m)}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                isActive && [
                  'bg-white shadow-md',
                  config.color === 'blue' && 'text-blue-700',
                  config.color === 'green' && 'text-green-700',
                  config.color === 'amber' && 'text-amber-700',
                ],
                !isActive && 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
              aria-label={`Modalità ${config.label}`}
              aria-pressed={isActive}
            >
              {/* Icon */}
              <span className={cn(
                'transition-colors',
                isActive && config.color === 'blue' && 'text-blue-600',
                isActive && config.color === 'green' && 'text-green-600',
                isActive && config.color === 'amber' && 'text-amber-600',
              )}>
                {config.icon}
              </span>
              
              {/* Label */}
              <span>{config.label}</span>
              
              {/* Default Badge */}
              {config.badge && isActive && (
                <span className={cn(
                  'ml-1 px-1.5 py-0.5 rounded text-xs font-semibold',
                  config.color === 'green' && 'bg-green-100 text-green-700'
                )}>
                  {config.badge}
                </span>
              )}
              
              {/* Active Indicator */}
              {isActive && (
                <span className={cn(
                  'absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full',
                  config.color === 'blue' && 'bg-blue-600',
                  config.color === 'green' && 'bg-green-600',
                  config.color === 'amber' && 'bg-amber-600',
                )} />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Mode Description (sempre visibile sotto) */}
      <div className="mt-3 px-1">
        <div className="flex items-start gap-2">
          <span className={cn(
            'flex-shrink-0 mt-0.5',
            currentConfig.color === 'blue' && 'text-blue-600',
            currentConfig.color === 'green' && 'text-green-600',
            currentConfig.color === 'amber' && 'text-amber-600',
          )}>
            {currentConfig.icon}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentConfig.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentConfig.description}
            </p>
          </div>
        </div>
        
        {/* Mode Specific Warnings/Info */}
        {mode === 'act' && (
          <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Attenzione:</strong> Azioni pericolose richiederanno sempre conferma
            </p>
          </div>
        )}
        
        {mode === 'ask' && (
          <div className="mt-2 flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
            <Eye className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Modalità sicura: nessuna modifica ai dati
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version per header (senza descrizione)
 */
export function OsHeaderModeToggleCompact({ mode, onChange, className }: OsHeaderModeToggleProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg', className)}>
      {(['ask', 'ask_to_act', 'act'] as OsMode[]).map((m) => {
        const config = MODE_CONFIG[m];
        const isActive = mode === m;
        
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              isActive && 'bg-white text-gray-900 shadow-sm',
              !isActive && 'text-gray-600 hover:text-gray-900'
            )}
            title={config.description}
            aria-label={`Modalità ${config.label}`}
            aria-pressed={isActive}
          >
            <span className={cn(
              'transition-colors',
              isActive && config.color === 'blue' && 'text-blue-600',
              isActive && config.color === 'green' && 'text-green-600',
              isActive && config.color === 'amber' && 'text-amber-600',
            )}>
              {config.icon}
            </span>
            <span className="hidden sm:inline">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Mode Badge (per mostrare mode corrente in modo discreto)
 */
export function OsModeBadge({ mode }: { mode: OsMode }) {
  const config = MODE_CONFIG[mode];
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      mode === 'ask' && 'bg-blue-50 text-blue-700 border-blue-200',
      mode === 'ask_to_act' && 'bg-green-50 text-green-700 border-green-200',
      mode === 'act' && 'bg-amber-50 text-amber-700 border-amber-200',
    )}>
      <span className="w-3.5 h-3.5">
        {config.icon}
      </span>
      {config.label}
    </div>
  );
}

