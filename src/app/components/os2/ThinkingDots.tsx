'use client';

// 💭 THINKING DOTS - Animazione 3 puntini con icona skill
// aria-live='polite' per screen readers

import React from 'react';
import { Calculator, TrendingUp, FileText, Mail, Building2, FileSpreadsheet, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkingDotsProps {
  skillId?: string;
  label?: string;
  className?: string;
}

/**
 * Icona skill
 */
const getSkillIcon = (skillId?: string) => {
  const icons: Record<string, React.ReactNode> = {
    'business_plan.run': <Calculator className="w-4 h-4" />,
    'sensitivity.run': <TrendingUp className="w-4 h-4" />,
    'term_sheet.create': <FileText className="w-4 h-4" />,
    'rdo.create': <Mail className="w-4 h-4" />,
    'sal.record': <Building2 className="w-4 h-4" />,
    'sales.proposal': <FileSpreadsheet className="w-4 h-4" />,
  };
  
  return icons[skillId || ''] || <Zap className="w-4 h-4" />;
};

/**
 * ThinkingDots Component
 */
export function ThinkingDots({ skillId, label, className }: ThinkingDotsProps) {
  return (
    <div 
      className={cn('flex items-center gap-3', className)}
      aria-live="polite"
      aria-busy="true"
    >
      {/* Skill Icon */}
      <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 text-blue-600">
        {getSkillIcon(skillId)}
      </div>
      
      {/* Label + Dots */}
      <div className="flex items-center gap-2">
        {label && (
          <span className="text-sm text-gray-600 font-medium">
            {label}
          </span>
        )}
        
        {/* Animated Dots */}
        <div className="flex items-center gap-1">
          <span className="dot dot-1 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span className="dot dot-2 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          <span className="dot dot-3 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version (solo dots, no icon)
 */
export function ThinkingDotsCompact({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span className="dot dot-1 w-1 h-1 rounded-full bg-current"></span>
      <span className="dot dot-2 w-1 h-1 rounded-full bg-current"></span>
      <span className="dot dot-3 w-1 h-1 rounded-full bg-current"></span>
    </div>
  );
}

