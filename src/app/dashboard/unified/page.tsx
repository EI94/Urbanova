'use client';

import React, { useState, useRef, useEffect } from 'react';
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

// I dati mock sono stati rimossi - ora utilizziamo dati reali dal database

// Le interfacce ChatMessage e ChatSession sono ora importate da chatHistoryService

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
  const { currentUser } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolExecutions, setActiveToolExecutions] = useState<ToolExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'analytics' | 'tools' | 'business-plan' | 'market-intelligence' | 'feasibility-analysis' | 'design-center' | 'permits-compliance' | 'project-timeline' | 'project-management' | 'marketing' | 'epc'
  >('overview');
  
  // Chat history e quick actions
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Workspace management
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  
  // Project previews from chat
  const [projectPreviews, setProjectPreviews] = useState<ProjectPreviewType[]>([]);

  // Notifications, Profile, Settings
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Stato per i dati della dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carica dati dashboard e chat history
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // 🔒 CONTROLLO AUTENTICAZIONE: Solo se l'utente è autenticato
        if (!currentUser?.uid) {
          console.warn('⚠️ [Unified Dashboard] Utente non autenticato, skip caricamento dati');
          setLoading(false);
          return;
        }

        // Inizializza i dati della dashboard se necessario
        await dashboardService.initializeDashboardData();

        // Carica le statistiche iniziali
        const initialStats = await dashboardService.getDashboardStats();
        setStats(initialStats);

        // Carica la chat history persistente
        const savedChatHistory = chatHistoryService.getChatSessions();
        setChatHistory(savedChatHistory);
        console.log('✅ [Chat History] Caricate sessioni salvate:', savedChatHistory.length);

        // Carica workspace dell'utente
        if (currentUser) {
          await loadWorkspaces();
          // Carica notifiche e profilo utente
          await loadUserData();
        }

        console.log('✅ [Unified Dashboard] Statistiche iniziali caricate:', initialStats);
      } catch (error) {
        console.error('❌ [Unified Dashboard] Errore inizializzazione:', error);
        setError('Impossibile caricare le statistiche della dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [currentUser?.uid]);

  // Sottoscrizione agli aggiornamenti in tempo reale
  useEffect(() => {
    if (!stats) return;

    console.log('🔄 [Unified Dashboard] Sottoscrizione aggiornamenti real-time...');

    const unsubscribe = dashboardService.subscribeToDashboardUpdates(newStats => {
      console.log('🔄 [Unified Dashboard] Aggiornamento real-time ricevuto:', newStats);
      setStats(newStats);
    }, currentUser?.uid);

    return unsubscribe;
  }, [stats]);

  // Carica dati utente (notifiche e profilo)
  const loadUserData = async () => {
    try {
      if (!currentUser?.uid) return;

      const [notificationsData, profileData] = await Promise.all([
        firebaseNotificationService.getNotifications(currentUser.uid),
        firebaseUserProfileService.getUserProfile(currentUser.uid),
      ]);

      setNotifications(notificationsData);
      setUserProfile(profileData);
      console.log('✅ [User Data] Notifiche e profilo caricati');
    } catch (error) {
      console.error('❌ [User Data] Errore caricamento dati utente:', error);
    }
  };

  // Esegue tool action tramite API
  const executeToolAction = async (toolId: string, action: string, args: any) => {
    try {
      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          action,
          args,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.runId;
    } catch (error) {
      console.error('Errore nell\'esecuzione tool action:', error);
      throw error;
    }
  };

  // Simula esecuzione tool
  const simulateToolExecution = async (toolId: string, action: string, args: any) => {
    const executionId = `exec_${Date.now()}`;
    
    const execution: ToolExecution = {
      id: executionId,
      toolId,
      action,
      status: 'running',
      progress: 0,
      startTime: new Date(),
    };

    setActiveToolExecutions(prev => [...prev, execution]);

    // Simula progresso
    const interval = setInterval(() => {
      setActiveToolExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, progress: Math.min(exec.progress + 10, 100) }
            : exec
        )
      );
    }, 500);

    // Simula completamento dopo 3 secondi
    setTimeout(() => {
      clearInterval(interval);
      setActiveToolExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { 
                ...exec, 
                status: 'completed', 
                progress: 100, 
                endTime: new Date(),
                output: { success: true, message: 'Tool execution completed successfully' }
              }
            : exec
        )
      );
    }, 3000);

    return executionId;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Chiama l'API reale del chatbot
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          history: newMessages.slice(-10), // Invia solo gli ultimi 10 messaggi come contesto
          userId: currentUser?.uid,
          userEmail: currentUser?.email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        ...(data.type ? {
          intelligentData: {
            type: data.type,
            confidence: data.confidence,
            relatedData: data.relatedData,
            followUpQuestions: data.followUpQuestions || [],
            actions: data.actions || [],
            visualizations: data.visualizations || []
          }
        } : {})
      };

      // Gestisci project preview se presente
      if (data.projectPreview) {
        setProjectPreviews(prev => [data.projectPreview, ...prev]);
        console.log('✅ [Chat] Project preview aggiunto:', data.projectPreview.id);
      }

      const finalMessages = [...newMessages, aiResponse];
      setMessages(finalMessages);

      // Salva nella chat history persistente se è una conversazione significativa
      if (finalMessages.length > 2) {
        let sessionToUpdate: ChatSession | null = null;
        
        // Se abbiamo una sessione corrente, aggiornala
        if (currentSessionId) {
          sessionToUpdate = chatHistoryService.getChatSession(currentSessionId);
        }
        
        if (sessionToUpdate) {
          // Aggiorna sessione esistente
          sessionToUpdate.messages = finalMessages;
          sessionToUpdate.preview = aiResponse.content.substring(0, 100) + '...';
          chatHistoryService.saveChatSession(sessionToUpdate);
          console.log('✅ [Chat History] Sessione aggiornata:', sessionToUpdate.title || 'Senza titolo');
        } else {
          // Crea nuova sessione
          const newSession = chatHistoryService.createSessionFromMessages(finalMessages);
          chatHistoryService.saveChatSession(newSession);
          setCurrentSessionId(newSession.id);
          console.log('✅ [Chat History] Nuova sessione creata:', newSession.title || 'Senza titolo');
        }
        
        // Ricarica la chat history
        const updatedHistory = chatHistoryService.getChatSessions();
        setChatHistory(updatedHistory);
      }
    } catch (error) {
      console.error('❌ [Chatbot] Errore chiamata API:', error);
      
      // Fallback in caso di errore
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          `Ciao! Sono qui per aiutarti con tutto quello che riguarda lo sviluppo immobiliare. Posso supportarti nella creazione di business plan, analisi di mercato, progettazione, gestione documenti, permessi e molto altro.\n\n` +
          `Dimmi pure cosa hai in mente - magari vuoi iniziare un nuovo progetto, analizzare un terreno specifico, o hai bisogno di aiuto con la documentazione? Sono qui per rendere il tuo lavoro più semplice e efficace.`,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, fallbackResponse];
      setMessages(finalMessages);

      // Salva anche il fallback nella chat history
      if (finalMessages.length > 2) {
        let sessionToUpdate: ChatSession | null = null;
        
        if (currentSessionId) {
          sessionToUpdate = chatHistoryService.getChatSession(currentSessionId);
        }
        
        if (sessionToUpdate) {
          sessionToUpdate.messages = finalMessages;
          sessionToUpdate.preview = fallbackResponse.content.substring(0, 100) + '...';
          chatHistoryService.saveChatSession(sessionToUpdate);
        } else {
          const newSession = chatHistoryService.createSessionFromMessages(finalMessages);
          chatHistoryService.saveChatSession(newSession);
          setCurrentSessionId(newSession.id);
        }
        
        const updatedHistory = chatHistoryService.getChatSessions();
        setChatHistory(updatedHistory);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Carica workspace dell'utente
  const loadWorkspaces = async () => {
    try {
      if (!currentUser) return;
      
      const response = await fetch(`/api/workspace/user/${currentUser.uid}`);
      const data = await response.json();
      
      if (data.success) {
        setWorkspaces(data.workspaces);
        console.log('✅ [Workspace] Workspace caricati:', data.workspaces.length);
      }
    } catch (error) {
      console.error('❌ [Workspace] Errore caricamento workspace:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'PLANNING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PLANNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento dashboard unificata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Urbanova</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Notifiche */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Notifiche"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
              
              {/* Profilo */}
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Profilo"
              >
                <User className="w-5 h-5" />
              </button>
              
              {/* Workspace */}
              <button 
                onClick={() => setShowWorkspaceManager(true)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Gestione Workspace"
              >
                <Users className="w-5 h-5" />
              </button>
              
              {/* Settings */}
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Impostazioni"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-r min-h-screen`}>
          <div className="p-4">
            <nav className="space-y-2">
              {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className={`px-3 py-2 text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>
                  DASHBOARD
                </h3>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'overview'
                      ? darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Overview
                </button>
              </div>

              {/* Discovery */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DISCOVERY
                </h3>
                <Link
                  href="/dashboard/market-intelligence"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Search className="w-4 h-4 mr-3" />
                  Market Intelligence
                </Link>
                <Link
                  href="/dashboard/feasibility-analysis"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Design Center
                </Link>
              </div>

              {/* Planning & Compliance */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLANNING/COMPLIANCE
                </h3>
                <Link
                  href="/dashboard/business-plan"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Business Plan
                </Link>
                <Link
                  href="/dashboard/permits-compliance"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </Link>
                <Link
                  href="/dashboard/project-timeline"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Project Timeline AI
                </Link>
              </div>

              {/* Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PROGETTI
                </h3>
                <Link
                  href="/dashboard/progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Progetti
                </Link>
                <Link
                  href="/dashboard/progetti/nuovo"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-3" />
                  Nuovo Progetto
                </Link>
                <Link
                  href="/dashboard/mappa-progetti"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Mappa Progetti
                </Link>
              </div>

              {/* Gestione Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GESTIONE PROGETTI
                </h3>
                <Link
                  href="/dashboard/project-management"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </Link>
                <Link
                  href="/dashboard/project-management/documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Documenti
                </Link>
                <Link
                  href="/dashboard/project-management/meetings"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Riunioni
                </Link>
              </div>

              {/* Marketing/Sales */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  MARKETING/SALES
                </h3>
                <Link
                  href="/dashboard/marketing"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
                <Link
                  href="/dashboard/marketing/campaigns"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
                  Campagne
                </Link>
                <Link
                  href="/dashboard/marketing/materials"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Materiali
                </Link>
              </div>

              {/* Construction/EPC */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  CONSTRUCTION/EPC
                </h3>
                <Link
                  href="/dashboard/epc"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  EPC
                </Link>
                <Link
                  href="/dashboard/epc/construction-site"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Construction Site
                </Link>
                <Link
                  href="/dashboard/epc/technical-documents"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Technical Documents
                </Link>
                <Link
                  href="/dashboard/epc/permits"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permits
                </Link>
              </div>

              {/* Tool OS */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI ASSISTANT
                </h3>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'tools'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bot className="w-4 h-4 mr-3" />
                  Urbanova OS
                </button>
              </div>

              {/* Feedback */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SUPPORTO
                </h3>
                <Link
                  href="/dashboard/feedback"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Feedback
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Content Area */}
          <div className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {activeTab === 'overview' && (
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
                            Prova a chiedere qualcosa come:
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() => setInputValue('Crea un nuovo studio di fattibilità')}
                              className={`w-full p-3 text-left border rounded-lg transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              "Crea un nuovo studio di fattibilità"
                            </button>
                            <button
                              onClick={() => setInputValue('Cerca terreni e immobili')}
                              className={`w-full p-3 text-left border rounded-lg transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              "Cerca terreni e immobili"
                            </button>
                            <button
                              onClick={() => setInputValue('Crea un nuovo progetto')}
                              className={`w-full p-3 text-left border rounded-lg transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300' 
                                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              "Crea un nuovo progetto"
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                      <div key={message.id} className="space-y-2">
                        <div
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <MarkdownRenderer content={message.content} className="text-sm leading-relaxed" />
                            
                            {/* Mostra dati intelligenti se presenti */}
                            {message.intelligentData && (
                              <div className="mt-3 space-y-2">
                                {/* Follow-up questions */}
                                {message.intelligentData.followUpQuestions.length > 0 && (
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-xs font-medium text-blue-700 mb-2">Domande correlate:</div>
                                    <div className="space-y-1">
                                      {message.intelligentData.followUpQuestions.map((question, qIndex) => (
                                        <button
                                          key={qIndex}
                                          onClick={() => setInputValue(question)}
                                          className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2 rounded transition-colors"
                                        >
                                          {question}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Actions */}
                                {message.intelligentData.actions.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {message.intelligentData.actions.map((action, aIndex) => (
                                      <button
                                        key={aIndex}
                                        onClick={() => {
                                          if (action.url) {
                                            window.open(action.url, '_blank');
                                          }
                                        }}
                                        className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs transition-colors"
                                      >
                                        {action.icon && <span>{action.icon}</span>}
                                        <span>{action.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Confidence indicator */}
                                {message.intelligentData.confidence > 0 && (
                                  <div className="text-xs text-gray-500">
                                    Confidenza: {Math.round(message.intelligentData.confidence * 100)}%
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className={`text-xs mt-2 ${
                              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Mostra project preview dopo l'ultimo messaggio dell'assistente */}
                        {message.type === 'assistant' && index === messages.length - 1 && projectPreviews.length > 0 && (
                          <div className="flex justify-start mt-3">
                            <div className="max-w-md">
                              {projectPreviews.map(project => (
                                <ProjectPreview
                                  key={project.id}
                                  project={project}
                                  onViewProject={(projectId) => {
                                    console.log('Visualizza progetto:', projectId);
                                    // Redirect al progetto
                                    window.open(project.url, '_blank');
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      ))
                    )}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="text-sm">Urbanova sta pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Quick Actions */}
                  {showQuickActions && (
                    <div className="p-4 border-t border-gray-200">
                    </div>
                  )}
                  
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Chiedi qualcosa..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm input-box"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats - Compact */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-blue-100 rounded-lg kpi-card-icon">
                        <BuildingIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-600 kpi-card-text">Progetti</p>
                        <p className="text-sm font-bold text-gray-900 kpi-card-value">{stats?.totalProjects || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-green-100 rounded-lg kpi-card-icon">
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-600 kpi-card-text">Attivi</p>
                        <p className="text-sm font-bold text-gray-900 kpi-card-value">{stats?.activeProjects || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-yellow-100 rounded-lg kpi-card-icon">
                        <EuroIcon className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-600 kpi-card-text">Budget</p>
                        <p className="text-sm font-bold text-gray-900 kpi-card-value">
                          €{((stats?.totalBudget || 0) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-3 border border-gray-200 kpi-card">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-purple-100 rounded-lg kpi-card-icon">
                        <TrendingUpIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="ml-2">
                        <p className="text-xs font-medium text-gray-600 kpi-card-text">ROI</p>
                        <p className="text-sm font-bold text-gray-900 kpi-card-value">
                          {stats?.averageROI?.toFixed(1) || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Urbanova Tool OS</h1>
                    <p className="text-gray-600 mt-1">Assistente Intelligente</p>
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="bg-white rounded-lg shadow border border-gray-200 h-96 flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">Urbanova Tool OS</span>
                      <span className="text-sm text-gray-500">• Assistente Intelligente</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            <span className="text-sm">Urbanova sta pensando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Chiedi qualcosa..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent input-box"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Tool Executions */}
                {activeToolExecutions.length > 0 && (
                  <div className="bg-white rounded-lg shadow border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Esecuzioni Tool Attive</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {activeToolExecutions.map(execution => (
                        <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {execution.toolId} - {execution.action}
                              </p>
                              <p className="text-xs text-gray-500">
                                {execution.status === 'running' ? 'In corso...' : 'Completato'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${execution.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{execution.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Solo Overview e Tools sono disponibili nella dashboard unificata */}
            {activeTab !== 'overview' && activeTab !== 'tools' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Unificata</h1>
                    <p className="text-gray-600 mt-1">Interfaccia principale con Urbanova OS</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Benvenuto nella Dashboard Unificata
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Usa la sidebar per navigare alle funzionalità specifiche o interagisci con Urbanova OS.
                    </p>
                    <button
                      onClick={() => setActiveTab('tools')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Interagisci con Urbanova OS
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat History Panel - Stile ChatGPT */}
          {showChatHistory && (
            <div className="w-80 bg-gray-900 text-white shadow-lg border-l border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-white">Conversazioni</h3>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Nuovo bottone chat */}
              <div className="p-3 border-b border-gray-700">
                <button
                  onClick={() => {
                    setMessages([]);
                    setCurrentSessionId(null);
                    setShowChatHistory(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Nuova conversazione</span>
                </button>
              </div>
              
              <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-white mb-1">Nessuna conversazione</h4>
                    <p className="text-sm text-gray-400">
                      Le tue chat con Urbanova appariranno qui
                    </p>
                  </div>
                ) : (
                  chatHistory.map(chat => (
                    <div
                      key={chat.id}
                      className={`p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group relative ${
                        currentSessionId === chat.id ? 'bg-gray-800' : ''
                      }`}
                      onClick={() => {
                        setMessages(chat.messages);
                        setCurrentSessionId(chat.id);
                        setShowChatHistory(false);
                        console.log('✅ [Chat History] Sessione caricata:', chat.title || 'Senza titolo');
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm truncate mb-1">{chat.title || 'Sessione senza titolo'}</h4>
                          <p className="text-xs text-gray-400 truncate">{chat.preview || 'Nessun preview disponibile'}</p>
                        </div>
                        <div className="ml-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-gray-500">
                            {new Date(chat.timestamp).toLocaleDateString('it-IT', { 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Sei sicuro di voler eliminare questa conversazione?')) {
                            chatHistoryService.deleteChatSession(chat.id);
                            const updatedHistory = chatHistoryService.getChatSessions();
                            setChatHistory(updatedHistory);
                            console.log('✅ [Chat History] Sessione eliminata:', chat.title || 'Senza titolo');
                          }
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all"
                        title="Elimina conversazione"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
      
      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Profile Panel */}
      <UserProfilePanelFixed
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setShowSettings(false)} />
      )}
      {showSettings && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Impostazioni</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4 space-y-6">
            {/* Dark Mode Toggle */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Aspetto</h4>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🌙</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Modalità Scura</p>
                    <p className="text-sm text-gray-500">Attiva il tema scuro per tutte le pagine</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notifiche */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Notifiche</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notifiche Email</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notifiche Push</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Aggiornamenti Progetti</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Privacy</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Profilo Pubblico</span>
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Condivisione Dati</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            {/* Azioni */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Azioni</h4>
              <div className="space-y-2">
                <button className="w-full p-3 text-left text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  Esporta Dati
                </button>
                <button className="w-full p-3 text-left text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  Cambia Password
                </button>
                <button className="w-full p-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Elimina Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Manager Modal */}
      <WorkspaceManager
        isOpen={showWorkspaceManager}
        onClose={() => setShowWorkspaceManager(false)}
        workspaces={workspaces}
        onWorkspaceCreated={(workspace) => {
          setWorkspaces(prev => [workspace, ...prev]);
        }}
        onMemberInvited={() => {
          // Ricarica i workspace per aggiornare i membri
          loadWorkspaces();
        }}
      />
    </div>
  );
}
