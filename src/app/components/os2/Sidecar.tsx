'use client';

// 🎨 SIDECAR OS 2.0 - Container principale
// Johnny Ive inspired: minimal, elegant, functional

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Filter,
  LayoutList,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOsSidecar, OsMode } from '@/hooks/os2/useOsSidecar';
import { MessageItem } from './MessageItem';
import { Composer } from './Composer';
import { FiltersDrawer } from './FiltersDrawer';
import { ActionPlanPanel } from './ActionPlanPanel';
import { VoiceAI, useVoiceAI } from './VoiceAI';
import '@/app/styles/os2-sidecar.css';

interface SidecarProps {
  // Props esterni (opzionali)
  initialMode?: OsMode;
  projects?: Array<{ id: string; name: string }>;
  skills?: Array<{ id: string; name: string; icon: React.ReactNode }>;
  
  // Callbacks
  onMessageSend?: (message: string) => void;
  onQuickAction?: (actionId: string) => void;
  onActionClick?: (messageId: string, actionId: string) => void;
  onSkillClick?: (skillId: string) => void;
  onProjectClick?: (projectId: string) => void;
}

export function Sidecar({
  initialMode = 'ask_to_act',
  projects = [],
  skills = [],
  onMessageSend,
  onQuickAction,
  onActionClick,
  onSkillClick,
  onProjectClick,
}: SidecarProps) {
  const {
    isOpen,
    close,
    mode,
    setMode,
    messages,
    addMessage,
    updateMessage,
    filters,
    setFilters,
    clearFilters,
    filteredMessages,
    searchQuery,
    setSearchQuery,
    searchResults,
    showActionPlan,
    setShowActionPlan,
    currentPlanId,
  } = useOsSidecar();
  
  const [showFilters, setShowFilters] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // 🎤 Voice AI Hook
  const { handleTranscription, handleSpeaking } = useVoiceAI();
  
  // Debug logging per identificare problemi
  useEffect(() => {
    console.log('🎯 [SIDECAR] Stato isOpen cambiato:', isOpen);
    if (isOpen) {
      console.log('✅ [SIDECAR] Sidecar aperto - rendering container');
    } else {
      console.log('❌ [SIDECAR] Sidecar chiuso - non rendering');
    }
  }, [isOpen]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle send message
  const handleSend = (content: string) => {
    // Aggiungi messaggio utente (SENZA sintesi vocale)
    addMessage({
      role: 'user',
      content,
    });
    
    // Call external callback
    onMessageSend?.(content);
    
    // Simulate OS response (in real app, this comes from OS2)
    setTimeout(() => {
      const responseContent = 'Messaggio di test OS 2.0. Risposta elaborata.';
      
      addMessage({
        role: 'assistant',
        content: responseContent,
        skillId: 'business_plan.run',
        projectId: 'proj123',
        projectName: 'Progetto Ciliegie',
        status: 'done',
        kpis: [
          { label: 'VAN', value: '€850k', delta: '+12%' },
          { label: 'TIR', value: '18.5%', delta: '+2.1%' },
        ],
        artifacts: [
          { type: 'pdf', url: '#', label: 'Business Plan.pdf' },
        ],
        actions: [
          { id: 'export', label: 'Esporta', variant: 'secondary' },
          { id: 'sensitivity', label: 'Sensitivity', variant: 'primary' },
        ],
      });
      
      // 🔊 Sintesi vocale SOLO per risposte dell'OS (role: 'assistant')
      setTimeout(() => {
        console.log('🔊 [SIDECAR] Avvio sintesi vocale risposta OS...');
        handleSpeaking(true);
        
        const utterance = new SpeechSynthesisUtterance(responseContent);
        utterance.lang = 'it-IT';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          console.log('🔊 [SIDECAR] Sintesi vocale completata');
          handleSpeaking(false);
        };
        
        utterance.onerror = (event) => {
          console.error('❌ [SIDECAR] Errore sintesi vocale:', event.error);
          handleSpeaking(false);
        };
        
        speechSynthesis.speak(utterance);
      }, 500);
      
    }, 1000);
  };
  
  // Toggle message expansion
  const toggleExpand = (messageId: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      return next;
    });
  };
  
  // Display messages (with search)
  const displayMessages = searchQuery.trim() ? searchResults : filteredMessages;
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Overlay (mobile) */}
      <div
        className={cn(
          'os2-sidecar-overlay lg:hidden',
          isOpen && 'open'
        )}
        onClick={close}
        aria-hidden="true"
      />
      
      {/* Sidecar Container - Design Johnny Ive */}
      <div 
        className={cn(
          'os2-sidecar-container flex flex-col',
          isOpen && 'open'
        )}
        data-testid="os2-sidecar"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={close}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Chiudi sidecar"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Urbanova OS</h1>
                <p className="text-xs text-gray-500">
                  {displayMessages.length} messaggi
                  {Object.keys(filters).length > 0 && ' • Filtrato'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* 🎤 Voice AI */}
              <VoiceAI
                onTranscription={(text) => {
                  console.log('🎤 [SIDECAR] Trascrizione ricevuta:', text);
                  handleTranscription(text);
                  // Auto-invia il testo trascritto
                  handleSend(text);
                }}
                onSpeaking={handleSpeaking}
                className="mr-2"
              />
              
              {/* Action Plan Toggle */}
              <button
                onClick={() => setShowActionPlan(!showActionPlan)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  showActionPlan
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-500'
                )}
                aria-label="Action plan"
                title="Mostra action plan"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              
              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  Object.keys(filters).length > 0
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-500'
                )}
                aria-label="Filtri"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="px-4 pb-3">
            <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {(['ask', 'ask_to_act', 'act'] as OsMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    mode === m
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {m === 'ask' && 'Ask'}
                  {m === 'ask_to_act' && 'Ask-to-Act'}
                  {m === 'act' && 'Act'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca messaggi... (⌘K)"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                data-os-search
              />
            </div>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                {searchQuery.trim() 
                  ? 'Nessun messaggio trovato'
                  : 'Nessun messaggio ancora'
                }
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery.trim()
                  ? 'Prova a cambiare la ricerca'
                  : 'Invia un messaggio per iniziare'
                }
              </p>
            </div>
          ) : (
            <>
              {displayMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  onActionClick={(actionId) => onActionClick?.(message.id, actionId)}
                  onSkillClick={onSkillClick}
                  onProjectClick={onProjectClick}
                  isExpanded={expandedMessages.has(message.id)}
                  onToggleExpand={() => toggleExpand(message.id)}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Composer */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <Composer
            onSend={handleSend}
            onQuickAction={onQuickAction}
            suggestions={[
              { id: 'bp', label: 'Crea business plan per progetto Ciliegie' },
              { id: 'sens', label: 'Sensitivity ±15% sul prezzo' },
            ]}
          />
        </div>
      </div>
      
      {/* Filters Drawer */}
      <FiltersDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        projects={projects}
        skills={skills}
      />
      
      {/* Action Plan Panel */}
      {currentPlanId && (
        <ActionPlanPanel
          isOpen={showActionPlan}
          onClose={() => setShowActionPlan(false)}
          plan={{
            id: currentPlanId,
            goal: 'Crea Business Plan per Progetto Ciliegie',
            steps: [
              {
                id: 'step1',
                skillId: 'business_plan.run',
                name: 'Calcola VAN e TIR',
                description: 'Analisi finanziaria completa',
                status: 'done',
                startTime: new Date(Date.now() - 5000),
                endTime: new Date(Date.now() - 2000),
              },
              {
                id: 'step2',
                skillId: 'sensitivity.run',
                name: 'Sensitivity Analysis',
                description: 'Variazione ±15% prezzo',
                status: 'running',
                startTime: new Date(Date.now() - 1000),
              },
              {
                id: 'step3',
                skillId: 'term_sheet.create',
                name: 'Genera Report PDF',
                description: 'Export Business Plan',
                status: 'pending',
              },
            ],
            currentStepIndex: 1,
            status: 'running',
          }}
        />
      )}
    </>
  );
}

