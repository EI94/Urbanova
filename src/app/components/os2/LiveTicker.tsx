'use client';

// 🎬 LIVE TICKER - Real-time activity feed durante execution
// Mini-step con icona skill, label, stato (... / % / ok / ✕)

import React from 'react';
import {
  CheckCircle2,
  X,
  Loader2,
  Calculator,
  TrendingUp,
  FileText,
  Mail,
  Building2,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Stato step nel ticker
 */
export type TickerStepStatus = 'running' | 'progress' | 'success' | 'failed';

/**
 * Step nel ticker
 */
export interface TickerStep {
  id: string;
  skillId: string;
  label: string;
  status: TickerStepStatus;
  progress?: number; // 0-100
}

/**
 * Piano execution status
 */
export type TickerPlanStatus = 'idle' | 'running' | 'completed' | 'failed';

interface LiveTickerProps {
  planId?: string;
  planStatus: TickerPlanStatus;
  steps: TickerStep[];
  totalDuration?: number; // ms
  onClose?: () => void;
}

/**
 * Icona skill
 */
const getSkillIcon = (skillId: string) => {
  const icons: Record<string, React.ReactNode> = {
    'business_plan.run': <Calculator className="w-3.5 h-3.5" />,
    'sensitivity.run': <TrendingUp className="w-3.5 h-3.5" />,
    'term_sheet.create': <FileText className="w-3.5 h-3.5" />,
    'rdo.create': <Mail className="w-3.5 h-3.5" />,
    'sal.record': <Building2 className="w-3.5 h-3.5" />,
    'sales.proposal': <FileSpreadsheet className="w-3.5 h-3.5" />,
  };
  
  return icons[skillId] || <Zap className="w-3.5 h-3.5" />;
};

/**
 * Animated dots component
 */
const AnimatedDots: React.FC = () => (
  <span className="inline-flex gap-0.5 ml-0.5">
    <span className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '0ms' }} />
    <span className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '200ms' }} />
    <span className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ animationDelay: '400ms' }} />
  </span>
);

/**
 * Icona stato step
 */
const StepStatusIcon: React.FC<{ status: TickerStepStatus; progress?: number }> = ({ status, progress }) => {
  if (status === 'running') {
    return (
      <span className="flex items-center gap-1 text-blue-600">
        <AnimatedDots />
      </span>
    );
  }
  
  if (status === 'progress' && progress !== undefined) {
    return (
      <span className="text-blue-600 text-xs font-semibold tabular-nums">
        {progress}%
      </span>
    );
  }
  
  if (status === 'success') {
    return <CheckCircle2 className="w-3 h-3 text-green-600" />;
  }
  
  if (status === 'failed') {
    return <X className="w-3 h-3 text-red-600" />;
  }
  
  return null;
};

/**
 * Live Ticker Component
 */
export function LiveTicker({
  planId,
  planStatus,
  steps,
  totalDuration,
  onClose,
}: LiveTickerProps) {
  // Non mostrare se idle (nessun piano attivo)
  if (planStatus === 'idle' || !planId) {
    return null;
  }
  
  // Collapsed view quando completato
  if (planStatus === 'completed' || planStatus === 'failed') {
    return (
      <div className={cn(
        'px-4 py-2.5 border-b transition-all',
        planStatus === 'completed' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {planStatus === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
            <span className={cn(
              'text-sm font-medium',
              planStatus === 'completed' ? 'text-green-900' : 'text-red-900'
            )}>
              {planStatus === 'completed' 
                ? `Piano completato${totalDuration ? ` in ${(totalDuration / 1000).toFixed(1)}s` : ''}`
                : 'Piano fallito'
              }
            </span>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-black/5 text-gray-500"
              aria-label="Chiudi ticker"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Expanded view quando running
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs font-semibold text-blue-900">
              Esecuzione in corso
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 tabular-nums">
              {steps.filter(s => s.status === 'success').length}/{steps.length}
            </span>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-0.5 rounded hover:bg-blue-100 text-blue-600"
                aria-label="Chiudi ticker"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Steps Ticker */}
      <div className="px-4 py-3 space-y-2 max-h-40 overflow-y-auto">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all',
              step.status === 'running' && 'bg-blue-50 border border-blue-200',
              step.status === 'progress' && 'bg-blue-50/50 border border-blue-100',
              step.status === 'success' && 'bg-green-50/50 border border-green-100',
              step.status === 'failed' && 'bg-red-50 border border-red-200'
            )}
          >
            {/* Skill Icon */}
            <span className={cn(
              'flex-shrink-0',
              step.status === 'running' && 'text-blue-600',
              step.status === 'success' && 'text-green-600',
              step.status === 'failed' && 'text-red-600',
              step.status === 'progress' && 'text-blue-500'
            )}>
              {getSkillIcon(step.skillId)}
            </span>
            
            {/* Label */}
            <span className={cn(
              'flex-1 text-xs font-medium min-w-0 truncate',
              step.status === 'running' && 'text-blue-900',
              step.status === 'success' && 'text-green-900',
              step.status === 'failed' && 'text-red-900',
              step.status === 'progress' && 'text-blue-800'
            )}>
              {step.label}
            </span>
            
            {/* Status Indicator */}
            <span className="flex-shrink-0">
              <StepStatusIcon status={step.status} progress={step.progress} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CSS Animation per dots
 */
export const TickerStyles = `
@keyframes dots {
  0%, 20% {
    content: '…';
  }
  40% {
    content: '……';
  }
  60%, 100% {
    content: '…………';
  }
}

.dots {
  display: inline-block;
  animation: dots 1.5s infinite;
  font-family: monospace;
}

.dots::after {
  content: '…';
  animation: dots 1.5s infinite;
}
`;

