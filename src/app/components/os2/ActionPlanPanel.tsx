'use client';

// 🎨 ACTION PLAN PANEL - Split-view chat + action plan
// Visualizzazione piano di esecuzione in real-time

import React from 'react';
import { X, CheckCircle2, Clock, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveTicker, TickerStep, TickerPlanStatus } from './LiveTicker';

interface ActionStep {
  id: string;
  skillId: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'done' | 'error';
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

interface ActionPlan {
  id: string;
  goal: string;
  steps: ActionStep[];
  currentStepIndex: number;
  status: 'draft' | 'running' | 'done' | 'error';
}

interface ActionPlanPanelProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: ActionPlan;
}

const StepIcon: React.FC<{ status: ActionStep['status'] }> = ({ status }) => {
  const icons = {
    pending: <Clock className="w-4 h-4 text-gray-400" />,
    running: <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />,
    done: <CheckCircle2 className="w-4 h-4 text-green-600" />,
    error: <AlertCircle className="w-4 h-4 text-red-600" />,
  };
  
  return icons[status];
};

export function ActionPlanPanel({ isOpen, onClose, plan }: ActionPlanPanelProps) {
  if (!isOpen || !plan) return null;
  
  const progress = plan.steps.filter(s => s.status === 'done').length;
  const total = plan.steps.length;
  const percentage = (progress / total) * 100;
  
  // Convert plan steps to ticker format
  const tickerSteps: TickerStep[] = plan.steps.map(step => ({
    id: step.id,
    skillId: step.skillId,
    label: step.name,
    status: step.status === 'running' ? 'running' 
      : step.status === 'done' ? 'success'
      : step.status === 'error' ? 'failed'
      : 'running',
    progress: step.status === 'running' ? 50 : undefined, // Mock progress
  }));
  
  const tickerPlanStatus: TickerPlanStatus = 
    plan.status === 'running' ? 'running'
    : plan.status === 'done' ? 'completed'
    : plan.status === 'error' ? 'failed'
    : 'idle';
  
  // Calculate total duration (mock)
  const totalDuration = plan.steps.reduce((sum, step) => {
    if (step.startTime && step.endTime) {
      return sum + (step.endTime.getTime() - step.startTime.getTime());
    }
    return sum;
  }, 0);
  
  return (
    <div className="fixed right-0 top-0 h-full w-full lg:w-[480px] bg-white border-l border-gray-200 shadow-2xl z-30 transform transition-transform duration-300 lg:translate-x-0">
      {/* Live Ticker (sticky top) */}
      <LiveTicker
        planId={plan.id}
        planStatus={tickerPlanStatus}
        steps={tickerSteps}
        totalDuration={totalDuration}
      />
      
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{plan.goal}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {progress} / {total} step completati
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Chiudi action plan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-500 rounded-full',
                plan.status === 'error' ? 'bg-red-500' : 'bg-blue-600'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Steps List */}
      <div className="overflow-y-auto h-[calc(100%-140px)] p-4 space-y-3">
        {plan.steps.map((step, index) => {
          const isActive = index === plan.currentStepIndex;
          const duration = step.startTime && step.endTime
            ? Math.round((step.endTime.getTime() - step.startTime.getTime()) / 1000)
            : undefined;
          
          return (
            <div
              key={step.id}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all',
                isActive && 'ring-2 ring-blue-100',
                step.status === 'done' && 'border-green-200 bg-green-50',
                step.status === 'running' && 'border-blue-200 bg-blue-50',
                step.status === 'error' && 'border-red-200 bg-red-50',
                step.status === 'pending' && 'border-gray-200 bg-white'
              )}
            >
              {/* Step Number + Status */}
              <div className="flex items-start gap-3 mb-2">
                <div className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold',
                  step.status === 'done' && 'bg-green-100 text-green-700',
                  step.status === 'running' && 'bg-blue-100 text-blue-700',
                  step.status === 'error' && 'bg-red-100 text-red-700',
                  step.status === 'pending' && 'bg-gray-100 text-gray-600'
                )}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{step.name}</h3>
                    <StepIcon status={step.status} />
                  </div>
                  
                  {step.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
                  )}
                  
                  {/* Duration */}
                  {duration !== undefined && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Completato in {duration}s
                    </p>
                  )}
                  
                  {/* Error */}
                  {step.error && (
                    <div className="mt-2 p-2 rounded-lg bg-red-100 border border-red-200">
                      <p className="text-xs text-red-700">{step.error}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress indicator */}
              {step.status === 'running' && (
                <div className="mt-3 h-1 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-2/3" />
                </div>
              )}
              
              {/* Next Step Arrow */}
              {index < plan.steps.length - 1 && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10">
                  <ChevronRight className="w-4 h-4 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer Status */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          plan.status === 'running' && 'bg-blue-50 text-blue-700',
          plan.status === 'done' && 'bg-green-50 text-green-700',
          plan.status === 'error' && 'bg-red-50 text-red-700',
          plan.status === 'draft' && 'bg-gray-50 text-gray-700'
        )}>
          {plan.status === 'running' && <Loader2 className="w-4 h-4 animate-spin" />}
          {plan.status === 'done' && <CheckCircle2 className="w-4 h-4" />}
          {plan.status === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">
            {plan.status === 'running' && 'Esecuzione in corso...'}
            {plan.status === 'done' && 'Piano completato con successo'}
            {plan.status === 'error' && 'Esecuzione fallita'}
            {plan.status === 'draft' && 'Piano in preparazione'}
          </span>
        </div>
      </div>
    </div>
  );
}

