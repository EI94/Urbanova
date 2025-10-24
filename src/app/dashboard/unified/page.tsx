'use client';

/**
 * 🏠 DASHBOARD UNIFICATO - VERSIONE SEMPLIFICATA
 * 
 * Usa direttamente DashboardLayout invece di sidebar personalizzata
 * Per risolvere il problema delle due sidebar diverse
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MessageCircle,
  BarChart3,
  FileText,
  Settings,
  Plus,
  Send,
  Bot,
  User,
  TrendingUp,
  Calendar,
  Target,
  DollarSign,
  Building2,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  BuildingIcon,
  EuroIcon,
  Euro,
  TrendingUpIcon,
  CalendarIcon,
  Users,
  Trash2,
  Bell,
  X,
} from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { dashboardService, DashboardStats } from '@/lib/dashboardService';
import { chatHistoryService, ChatSession } from '@/lib/chatHistoryService';
import { ChatMessage } from '@/types/chat';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import WorkspaceManager from '@/components/workspace/WorkspaceManager';
import ProjectPreview from '@/components/chat/ProjectPreview';
import NotificationsPanel from '@/components/ui/NotificationsPanel';
import UserProfilePanelFixed from '@/components/ui/UserProfilePanelFixed';
import { Workspace } from '@/types/workspace';
import { ProjectPreview as ProjectPreviewType } from '@/lib/intentService';
import { firebaseNotificationService } from '@/lib/firebaseNotificationService';
import { firebaseUserProfileService } from '@/lib/firebaseUserProfileService';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import { GeographicSearch, GeographicSearchResult } from '@/components/ui/GeographicSearch';
import { VoiceAIChatGPT, useVoiceAI } from '@/app/components/os2/VoiceAIChatGPT';
import { useOpenAITTS } from '@/hooks/useOpenAITTS';
import { ResultMessage } from '@/components/chat/ResultMessage';
import { ConversationDeleteModal } from '@/components/ui/ConversationDeleteModal';
import { ConversationList } from '@/components/ui/ConversationList';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Interfaccia per le esecuzioni tool
interface ToolExecution {
  id: string;
  toolId: string;
  action: string;
  status: 'running' | 'completed' | 'error';
  progress: number;
  startTime: Date;
  endTime?: Date;
  output?: any;
  error?: string;
}

export default function UnifiedDashboardPage() {
  const { t } = useLanguage();
  const { darkMode, setDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolExecutions, setActiveToolExecutions] = useState<ToolExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat history e quick actions
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Conversation deletion
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    sessionId: string;
    title: string;
  }>({ isOpen: false, sessionId: '', title: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Funzioni per gestione conversazioni
  const handleConfirmDelete = async () => {
    if (!deleteModal.sessionId) return;
      
      setIsDeleting(true);
    try {
      await chatHistoryService.deleteChatSession(deleteModal.sessionId);
      setChatHistory(prev => prev.filter(session => session.id !== deleteModal.sessionId));
      setDeleteModal({ isOpen: false, sessionId: '', title: '' });
    } catch (error) {
      console.error('Errore eliminazione conversazione:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Funzione per quick actions
  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'feasibility':
        message = 'Crea un nuovo studio di fattibilità per un progetto immobiliare';
        break;
      case 'search':
        message = 'Cerca comuni e zone italiane per opportunità immobiliari';
        break;
      case 'project':
        message = 'Crea un nuovo progetto immobiliare';
        break;
      case 'map':
        message = 'Visualizza la mappa interattiva dei progetti';
        break;
      default:
        message = action;
    }
    setInputValue(message);
    handleSendMessage();
  };

  // Funzione per inviare messaggi
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simula risposta AI
      setTimeout(() => {
        const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
          content: 'Grazie per la tua richiesta! Come posso aiutarti con il tuo progetto immobiliare?',
        timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
        } catch (error) {
      console.error('Errore invio messaggio:', error);
      setIsLoading(false);
    }
  };

    return (
    <DashboardLayout title="Dashboard">
          <div className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
                {/* Urbanova Interface - ChatGPT/Cursor Style */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow border flex-1 flex flex-col`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                    <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Urbanova AI Assistant
                    </h1>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowChatHistory(!showChatHistory)}
                          className={`p-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                          title="Chat History"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowQuickActions(!showQuickActions)}
                          className={`p-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                          title="Quick Actions"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      // Stato vuoto stile ChatGPT
                      <div className="flex flex-col items-center justify-center h-full space-y-8">
                        <div className="text-center">
                          <h2 className={`text-3xl font-medium ${darkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                            Cosa c'è in programma oggi?
                          </h2>
                        </div>
                        
                        {/* Suggerimenti eleganti stile ChatGPT */}
                        <div className="space-y-3 w-full max-w-2xl">
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      Ecco alcune cose che puoi fare:
                          </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                        onClick={() => handleQuickAction('feasibility')}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Crea un nuovo studio di fattibilità
                        </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Analizza la fattibilità di un progetto immobiliare
                      </div>
                              </div>
                                    </div>
                      </button>
                                
                                      <button
                        onClick={() => handleQuickAction('search')}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Search className="w-4 h-4 text-green-600" />
                                  </div>
                          <div className="text-left">
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Cerca comuni e zone italiane
                                  </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Esplora opportunità immobiliari
                              </div>
                            </div>
                          </div>
                      </button>
                      
                        <button
                        onClick={() => handleQuickAction('project')}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Plus className="w-4 h-4 text-purple-600" />
                      </div>
                          <div className="text-left">
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Crea un nuovo progetto
                        </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Inizia un nuovo progetto immobiliare
                    </div>
                  </div>
                        </div>
                      </button>
                      
                        <button
                        onClick={() => handleQuickAction('map')}
                        className={`p-4 rounded-lg border transition-all hover:shadow-md ${darkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                        >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-orange-600" />
                      </div>
                          <div className="text-left">
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Visualizza mappa interattiva
                      </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Esplora progetti sulla mappa
                        </div>
                    </div>
                  </div>
                      </button>
                      </div>
                      </div>
                    </div>
              ) : (
                // Messaggi della chat
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-blue-600' 
                              : 'bg-gradient-to-r from-blue-500 to-purple-600'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                    </div>
                          <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-4 rounded-lg ${
                            message.type === 'user'
                                ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                                : darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                            }`}>
                              <MarkdownRenderer content={message.content} />
                          </div>
                        </div>
                      </div>
                          </div>
                        </div>
                  ))}
                      </div>
                    )}
                            </div>
            
            {/* Input Area */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                      <input
                        type="text"
                        value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                        placeholder="Chiedi qualcosa..."
                    className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    }`}
                        disabled={isLoading}
                      />
                </div>
                      <button
                        onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    isLoading || !inputValue.trim()
                      ? darkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                        <Send className="w-4 h-4" />
                  )}
                    </button>
                  </div>
                </div>
              </div>
                </div>
              </div>
              
      {/* Conversation Delete Modal */}
      <ConversationDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, sessionId: '', title: '' })}
        onConfirm={handleConfirmDelete}
        conversationTitle={deleteModal.title}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
