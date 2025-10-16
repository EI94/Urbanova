'use client';

// 🎨 MESSAGE ITEM - Anatomia messaggio OS 2.0
// Badge skill, pill progetto, stato, KPI, artifacts, azioni

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  FileText, 
  TrendingUp, 
  Building2,
  Calculator,
  Zap,
  Mail,
  FileSpreadsheet,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { OsMessage, MessageStatus } from '@/hooks/os2/useOsSidecar';
import { cn } from '@/lib/utils';
import { getSkillStatusLine } from '@/os2/conversation/systemPrompt';
import osTranslations from '../../../../i18n/it/os2.json';
import { ThinkingDots } from './ThinkingDots';
import '@/app/styles/os2.css';

interface MessageItemProps {
  message: OsMessage;
  onActionClick?: (actionId: string) => void;
  onSkillClick?: (skillId: string) => void;
  onProjectClick?: (projectId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

/**
 * Icona skill
 */
const SkillIcon: React.FC<{ skillId?: string; className?: string }> = ({ skillId, className }) => {
  const icons: Record<string, React.ReactNode> = {
    'business_plan.run': <Calculator className={className} />,
    'sensitivity.run': <TrendingUp className={className} />,
    'term_sheet.create': <FileText className={className} />,
    'rdo.create': <Mail className={className} />,
    'sal.record': <Building2 className={className} />,
    'sales.proposal': <FileSpreadsheet className={className} />,
  };
  
  return <>{icons[skillId || ''] || <Zap className={className} />}</>;
};

/**
 * Badge stato
 */
const StatusBadge: React.FC<{ status?: MessageStatus }> = ({ status }) => {
  if (!status) return null;
  
  const config: Record<MessageStatus, { icon: React.ReactNode; label: string; className: string }> = {
    draft: {
      icon: <FileText className="w-3 h-3" />,
      label: 'Bozza',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
    },
    awaiting_confirm: {
      icon: <Clock className="w-3 h-3" />,
      label: 'In Attesa',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    running: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: 'In Esecuzione',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    done: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Completato',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    error: {
      icon: <AlertCircle className="w-3 h-3" />,
      label: 'Errore',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    skipped: {
      icon: <ChevronDown className="w-3 h-3" />,
      label: 'Saltato',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
    },
  };
  
  const { icon, label, className } = config[status];
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      className
    )}>
      {icon}
      {label}
    </div>
  );
};

/**
 * Pill progetto
 */
const ProjectPill: React.FC<{ 
  projectName?: string; 
  projectId?: string; 
  onClick?: () => void 
}> = ({ projectName, projectId, onClick }) => {
  if (!projectName) return null;
  
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/50 text-blue-700 text-xs font-medium transition-all hover:shadow-sm group"
      aria-label={`Vai al progetto ${projectName}`}
    >
      <Building2 className="w-3.5 h-3.5" />
      {projectName}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

/**
 * KPI Card
 */
const KpiCard: React.FC<{ kpi: { label: string; value: string; delta?: string } }> = ({ kpi }) => {
  return (
    <div className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50">
      <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-gray-900">{kpi.value}</span>
        {kpi.delta && (
          <span className={cn(
            'text-xs font-medium',
            kpi.delta.startsWith('+') ? 'text-green-600' : 'text-red-600'
          )}>
            {kpi.delta}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Artifact Link
 */
const ArtifactLink: React.FC<{ artifact: { type: 'pdf' | 'excel' | 'link'; url: string; label: string } }> = ({ artifact }) => {
  const icons = {
    pdf: <FileText className="w-4 h-4 text-red-500" />,
    excel: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
    link: <ExternalLink className="w-4 h-4 text-blue-500" />,
  };
  
  return (
    <a
      href={artifact.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all hover:shadow-sm group"
    >
      {icons[artifact.type]}
      {artifact.label}
      <Download className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};

/**
 * Action Button
 */
const ActionButton: React.FC<{ 
  action: { id: string; label: string; variant: 'primary' | 'secondary' | 'danger' }; 
  onClick: () => void 
}> = ({ action, onClick }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:shadow-sm',
        variants[action.variant]
      )}
    >
      {action.label}
    </button>
  );
};

/**
 * Message Item Component
 */
export function MessageItem({
  message,
  onActionClick,
  onSkillClick,
  onProjectClick,
  isExpanded = false,
  onToggleExpand,
}: MessageItemProps) {
  const isUser = message.role === 'user';
  const hasDetails = message.kpis || message.artifacts || message.actions;
  
  return (
    <div className={cn(
      'group relative',
      isUser ? 'ml-auto max-w-[85%]' : 'mr-auto max-w-full'
    )}>
      {/* Timestamp */}
      <div className="flex items-center gap-2 mb-1.5 px-1">
        <time className="text-xs text-gray-400 font-medium">
          {message.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </time>
        
        {/* Skill Badge (solo assistant) */}
        {!isUser && message.skillId && (
          <button
            onClick={() => onSkillClick?.(message.skillId!)}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 text-xs font-medium transition-colors"
            aria-label={`Skill: ${message.skillId}`}
          >
            <SkillIcon skillId={message.skillId} className="w-3 h-3" />
            {message.skillId.split('.')[0]}
          </button>
        )}
        
        {/* Status Badge */}
        {message.status && <StatusBadge status={message.status} />}
      </div>
      
      {/* Message Bubble */}
      <div className={cn(
        'rounded-2xl px-4 py-3 shadow-sm transition-all',
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
      )}>
        {/* Project Pill (top) */}
        {!isUser && message.projectName && (
          <div className="mb-2">
            <ProjectPill
              projectName={message.projectName}
              projectId={message.projectId}
              onClick={() => onProjectClick?.(message.projectId!)}
            />
          </div>
        )}
        
        {/* Content */}
        <div className={cn(
          'text-sm leading-relaxed whitespace-pre-wrap',
          isUser ? 'text-white' : 'text-gray-900'
        )}>
          {/* Thinking Indicator quando running senza content finale */}
          {!isUser && message.status === 'running' && !message.content && (
            <div className="space-y-3">
              <ThinkingDots
                skillId={message.skillId}
                label={message.skillId 
                  ? getSkillStatusLine(message.skillId)
                  : osTranslations.status.working
                }
              />
              
              {/* Skeleton Text */}
              <div className="space-y-2 pt-3">
                <div className="skeleton skeleton-text w-full"></div>
                <div className="skeleton skeleton-text w-5/6"></div>
                <div className="skeleton skeleton-text w-4/6"></div>
              </div>
            </div>
          )}
          
          {/* Content (quando disponibile) */}
          {message.content && message.content}
          
          {/* Status Line quando running CON content ma senza artifacts */}
          {!isUser && message.status === 'running' && message.content && (!message.artifacts || message.artifacts.length === 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium pulse-subtle">
                  {message.skillId 
                    ? getSkillStatusLine(message.skillId)
                    : osTranslations.status.working
                  }
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Details Section (expandable) */}
        {hasDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {/* Toggle button */}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 mb-2 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    Nascondi dettagli
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    Mostra dettagli
                  </>
                )}
              </button>
            )}
            
            {/* Expanded content */}
            {(isExpanded || !onToggleExpand) && (
              <div className="space-y-3">
                {/* KPIs (o skeleton se running) */}
                {message.status === 'running' && (!message.kpis || message.kpis.length === 0) && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="skeleton skeleton-card"></div>
                    <div className="skeleton skeleton-card"></div>
                  </div>
                )}
                
                {message.kpis && message.kpis.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 fade-in">
                    {message.kpis.map((kpi, idx) => (
                      <KpiCard key={idx} kpi={kpi} />
                    ))}
                  </div>
                )}
                
                {/* Artifacts (o skeleton se running) */}
                {message.status === 'running' && (!message.artifacts || message.artifacts.length === 0) && (
                  <div className="flex flex-wrap gap-2">
                    <div className="skeleton h-10 w-40 rounded-lg"></div>
                    <div className="skeleton h-10 w-32 rounded-lg"></div>
                  </div>
                )}
                
                {message.artifacts && message.artifacts.length > 0 && (
                  <div className="flex flex-wrap gap-2 fade-in">
                    {message.artifacts.map((artifact, idx) => (
                      <ArtifactLink key={idx} artifact={artifact} />
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        onClick={() => onActionClick?.(action.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

