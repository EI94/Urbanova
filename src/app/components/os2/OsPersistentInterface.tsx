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
import dynamic from 'next/dynamic';
const VoiceAIChatGPT = dynamic(
  () => import('./VoiceAIChatGPT').then(mod => ({ default: mod.VoiceAIChatGPT })),
  { ssr: false }
);
import { useVoiceAI } from './useVoiceAI';
import '@/app/styles/os-persistent.css';
import '@/app/styles/voice-ai-chatgpt.css';

interface OsPersistentInterfaceProps {
  // Props esterni (opzionali)
  initialMode?: OsMode;
  projects?: Array<{ id: string; name: string }>;
  skills?: Array<{ id: string; name: string; icon: React.ReactNode }>;
  
  // Props per controllo stato esterno
  isOpen?: boolean;
  onClose?: () => void;
  
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
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onMessageSend,
  onQuickAction,
  onActionClick,
  onSkillClick,
  onProjectClick,
}: OsPersistentInterfaceProps) {
  const {
    mode,
    messages,
    filters,
    setMode,
    addMessage,
    updateMessage,
    toggleFilters,
    clearMessages,
  } = useOsSidecar();

  // Usa stato esterno se fornito, altrimenti usa hook interno
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : false;
  const close = externalOnClose || (() => {});

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

  const handleSend = async (content: string) => {
    // Aggiungi messaggio utente (SENZA sintesi vocale)
    addMessage({ role: 'user', content });
    
    // Chiama l'API OS 2.0 reale
    try {
      console.log('🎯 [OS-PERSISTENT] Invio messaggio a OS 2.0:', content);
      
      const response = await fetch('/api/os2/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          userId: 'test-user', // TODO: Usa userId reale
          userEmail: 'test@test.com', // TODO: Usa userEmail reale
          sessionId: Date.now().toString(),
        }),
      });
      
      const result = await response.json();
      console.log('📥 [OS-PERSISTENT] Response ricevuta:', result);
      
           if (result.success && result.response) {
             // Usa direttamente la risposta smart (già pulita)
             let responseContent = result.response;
             
             // Se è una risposta smart, usa direttamente il contenuto
             if (result.smart) {
               console.log('🧠 [OS-PERSISTENT] Risposta smart ricevuta:', responseContent);
             } else {
               // Per risposte tradizionali, estrai solo il contenuto conversazionale
               if (typeof responseContent === 'string' && responseContent.includes('🎯 Esegui:')) {
                 const lines = responseContent.split('\n');
                 const contentStart = lines.findIndex(line => 
                   line.includes('📊 Risultato:') || 
                   line.includes('💡 Assumptions:') ||
                   line.includes('⚠️ Rischi:')
                 );
                 
                 if (contentStart !== -1) {
                   responseContent = lines.slice(contentStart + 1).join('\n').trim();
                 }
               }
             }
             
             // Aggiungi risposta dell'OS
             addMessage({
               role: 'assistant',
               content: responseContent,
               timestamp: new Date(),
               status: 'completed',
             });

        // 🔊 Sintesi vocale SOLO per risposte dell'OS (role: 'assistant')
        setTimeout(() => {
          console.log('🔊 [OS-PERSISTENT] Avvio sintesi vocale risposta OS...');
          handleSpeaking(true);
          
          // Pulisci il contenuto per la sintesi vocale (rimuovi emoji e formattazione)
          const cleanContent = responseContent
            .replace(/[🎯✅📋📊💡⚠️⏱️]/g, '') // Rimuovi emoji
            .replace(/\*\*(.*?)\*\*/g, '$1') // Rimuovi markdown bold
            .replace(/\n\n/g, '. ') // Sostituisci doppi newline con punti
            .replace(/\n/g, ' ') // Sostituisci newline con spazi
            .trim();
          
          const utterance = new SpeechSynthesisUtterance(cleanContent);
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
        
      } else {
        // Fallback se l'API fallisce
        addMessage({
          role: 'assistant',
          content: 'Mi dispiace, ho avuto un problema. Riprova tra un momento.',
          timestamp: new Date(),
          status: 'completed',
        });
      }
      
    } catch (error) {
      console.error('❌ [OS-PERSISTENT] Errore chiamata API:', error);
      
      // Fallback in caso di errore
      addMessage({
        role: 'assistant',
        content: 'Mi dispiace, ho avuto un problema di connessione. Riprova tra un momento.',
        timestamp: new Date(),
        status: 'completed',
      });
    }
    
    // Chiama callback esterno se fornito
    onMessageSend?.(content);
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
              placeholder="Chiedi..."
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
