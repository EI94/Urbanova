'use client';

// 🎨 OS 2.0 PERSISTENT INTERFACE - Design Johnny Ive
// Esperienza stile Cursor: persistente, accessibile, elegante

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Filter,
  LayoutList,
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Maximize2,
  Bot,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOsSidecar, OsMode } from '@/hooks/os2/useOsSidecar';
import { MessageItem } from './MessageItem';
import { Composer } from './Composer';
import { FiltersDrawer } from './FiltersDrawer';
import { ActionPlanPanel } from './ActionPlanPanel';
import { VoiceAIChatGPT, useVoiceAI } from './VoiceAIChatGPT';
import '@/app/styles/os-persistent.css';
import '@/app/styles/voice-ai-chatgpt.css';

interface OsPersistentInterfaceProps {
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

export function OsPersistentInterface({
  initialMode = 'ask_to_act',
  projects = [],
  skills = [],
  onMessageSend,
  onQuickAction,
  onActionClick,
  onSkillClick,
  onProjectClick,
}: OsPersistentInterfaceProps) {
  const {
    isOpen,
    mode,
    messages,
    filters,
    setMode,
    addMessage,
    updateMessage,
    toggleFilters,
    clearMessages,
    close,
  } = useOsSidecar();

  const { handleTranscription, handleSpeaking } = useVoiceAI();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ai nuovi messaggi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug logging
  useEffect(() => {
    console.log('🎯 [OS-PERSISTENT] Stato isOpen cambiato:', isOpen);
    if (isOpen) {
      console.log('✅ [OS-PERSISTENT] OS aperto - rendering interface');
    } else {
      console.log('❌ [OS-PERSISTENT] OS chiuso - non rendering');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = (content: string) => {
    addMessage({ role: 'user', content });
    onMessageSend?.(content);

    // Simula risposta OS 2.0
    setTimeout(() => {
      const responseContent = 'Messaggio di test OS 2.0. Risposta elaborata.';
      addMessage({
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        status: 'completed',
        skills: ['business-plan'],
        projects: ['test-project'],
        kpis: [
          { label: 'VAN', value: '+€245k', trend: 'up' },
          { label: 'TIR', value: '12.5%', trend: 'up' },
        ],
        artifacts: [
          { type: 'pdf', name: 'Business Plan.pdf', url: '#' },
          { type: 'excel', name: 'Sensitivity Analysis.xlsx', url: '#' },
        ],
        actions: [
          { id: 'open-sensitivity', label: 'Apri sensitivity', icon: '📊' },
          { id: 'generate-term-sheet', label: 'Genera term sheet', icon: '📄' },
        ],
      });

      // Sintesi vocale automatica
      setTimeout(() => {
        console.log('🔊 [OS-PERSISTENT] Avvio sintesi vocale risposta...');
        handleSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(responseContent);
        utterance.lang = 'it-IT';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.onend = () => {
          console.log('🔊 [OS-PERSISTENT] Sintesi vocale completata');
          handleSpeaking(false);
        };
        utterance.onerror = (event) => {
          console.error('❌ [OS-PERSISTENT] Errore sintesi vocale:', event.error);
          handleSpeaking(false);
        };
        speechSynthesis.speak(utterance);
      }, 500);
    }, 1000);
  };

  return (
    <>
      {/* Overlay per mobile */}
      <div 
        className={cn(
          'os-persistent-overlay lg:hidden',
          isOpen && 'open'
        )}
        onClick={close}
        aria-hidden="true"
      />
      
      <div className="os-persistent-container">
      {/* Header OS 2.0 */}
      <div className="os-persistent-header">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
            <span className="font-semibold text-gray-900">Urbanova OS 2.0</span>
          </div>
          
          <div className="flex items-center gap-1 ml-auto">
            {/* Voice AI ChatGPT Style */}
            <VoiceAIChatGPT
              onTranscription={(text) => {
                console.log('🎤 [OS-PERSISTENT] Trascrizione ricevuta:', text);
                handleTranscription(text);
                handleSend(text);
              }}
              onSpeaking={handleSpeaking}
              className="mr-2"
            />
            
            {/* Controlli */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
              )}
              title="Filtri"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowActionPlan(!showActionPlan)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                showActionPlan ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-100'
              )}
              title="Piano d'azione"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={isMinimized ? 'Espandi' : 'Riduci'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => {
                console.log('🎯 [OS-PERSISTENT] Chiusura OS');
                close();
              }}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title="Chiudi OS"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenuto principale */}
      {!isMinimized && (
        <div className="os-persistent-content">
          {/* Area messaggi */}
          <div className="os-persistent-messages">
            {messages.length === 0 ? (
              <div className="os-persistent-empty">
                <div className="text-center">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cosa posso fare per te oggi?
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Chiedi qualsiasi cosa o usa i suggerimenti qui sotto
                  </p>
                  
                  {/* Suggerimenti */}
                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <button
                      onClick={() => handleSend('Crea un nuovo studio di fattibilità')}
                      className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">Studio di fattibilità</div>
                      <div className="text-sm text-gray-500">Analisi completa progetto</div>
                    </button>
                    
                    <button
                      onClick={() => handleSend('Cerca terreni a Roma')}
                      className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">Market Intelligence</div>
                      <div className="text-sm text-gray-500">Trova opportunità</div>
                    </button>
                    
                    <button
                      onClick={() => handleSend('Crea un nuovo progetto')}
                      className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">Nuovo progetto</div>
                      <div className="text-sm text-gray-500">Inizia da zero</div>
                    </button>
                    
                    <button
                      onClick={() => handleSend('Mostra la mappa interattiva')}
                      className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900">Mappa interattiva</div>
                      <div className="text-sm text-gray-500">Visualizza progetti</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <MessageItem
                    key={index}
                    message={message}
                    onActionClick={onActionClick}
                    onSkillClick={onSkillClick}
                    onProjectClick={onProjectClick}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="os-persistent-composer">
            <Composer
              onSend={handleSend}
              onVoiceTranscription={(text) => {
                console.log('🎤 [OS-PERSISTENT-COMPOSER] Trascrizione ricevuta:', text);
                handleTranscription(text);
              }}
              placeholder="Chiedi qualcosa..."
              disabled={false}
            />
          </div>
        </div>
      )}

      {/* Filtri Drawer */}
      {showFilters && (
        <FiltersDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={toggleFilters}
          projects={projects}
          skills={skills}
        />
      )}

      {/* Action Plan Panel */}
      {showActionPlan && (
        <ActionPlanPanel
          isOpen={showActionPlan}
          onClose={() => setShowActionPlan(false)}
          messages={messages}
          onActionClick={onActionClick}
        />
      )}
      </div>
    </>
  );
}
