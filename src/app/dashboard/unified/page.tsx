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
  Square,
  BuildingIcon,
  EuroIcon,
  TrendingUpIcon,
  CalendarIcon,
  Users,
} from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardService, DashboardStats } from '@/lib/dashboardService';
import FeedbackWidget from '@/components/ui/FeedbackWidget';

// Mock data per i progetti (in produzione verrà da API)
const mockProjects = [
  {
    id: 'proj-1',
    name: 'Residenza Marina',
    status: 'IN_PROGRESS',
    roi: 18.5,
    progress: 65,
    nextMilestone: 'Approvazione Permessi',
    dueDate: '2025-02-15',
    location: 'Roma, EUR',
    category: 'Residenziale',
    budget: '€2.5M',
    team: ['PM', 'Architetto', 'Ingegnere'],
  },
  {
    id: 'proj-2',
    name: 'Centro Commerciale Nord',
    status: 'PLANNING',
    roi: 22.3,
    progress: 25,
    nextMilestone: 'Analisi Fattibilità',
    dueDate: '2025-03-20',
    location: 'Milano, Porta Nuova',
    category: 'Commerciale',
    budget: '€8.2M',
    team: ['PM', 'Urbanista', 'Economista'],
  },
  {
    id: 'proj-3',
    name: 'Residenza Storica',
    status: 'COMPLETED',
    roi: 15.8,
    progress: 100,
    nextMilestone: 'Collaudo Finale',
    dueDate: '2024-12-10',
    location: 'Firenze, Centro',
    category: 'Residenziale',
    budget: '€1.8M',
    team: ['PM', 'Restauratore', 'Ingegnere'],
  },
];

// Mock data per le metriche (in produzione verrà da API)
const mockMetrics = {
  totalProjects: 12,
  activeProjects: 8,
  totalROI: 19.2,
  avgPayback: 4.2,
  documentsComplete: 78,
  nextDeadlines: 3,
};

// Interfaccia per i messaggi chat
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    toolId?: string;
    actionName?: string;
    runId?: string;
  };
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Ciao! Sono Urbanova, il tuo assistente intelligente per la gestione immobiliare. Come posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolExecutions, setActiveToolExecutions] = useState<ToolExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'analytics' | 'tools' | 'business-plan' | 'market-intelligence' | 'feasibility-analysis' | 'design-center' | 'permits-compliance' | 'project-timeline' | 'project-management' | 'marketing' | 'epc'
  >('overview');
  const [showToolPanel, setShowToolPanel] = useState(false);
  
  // Chat history e quick actions
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    title: string;
    preview: string;
    timestamp: Date;
    messages: ChatMessage[];
  }>>([]);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

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

  // Carica dati dashboard
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Inizializza i dati della dashboard se necessario
        await dashboardService.initializeDashboardData();

        // Carica le statistiche iniziali
        const initialStats = await dashboardService.getDashboardStats();
        setStats(initialStats);

        console.log('✅ [Unified Dashboard] Statistiche iniziali caricate:', initialStats);
      } catch (error) {
        console.error('❌ [Unified Dashboard] Errore inizializzazione:', error);
        setError('Impossibile caricare le statistiche della dashboard');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Sottoscrizione agli aggiornamenti in tempo reale
  useEffect(() => {
    if (!stats) return;

    console.log('🔄 [Unified Dashboard] Sottoscrizione aggiornamenti real-time...');

    const unsubscribe = dashboardService.subscribeToDashboardUpdates(newStats => {
      console.log('🔄 [Unified Dashboard] Aggiornamento real-time ricevuto:', newStats);
      setStats(newStats);
    });

    return unsubscribe;
  }, [stats]);

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
        }),
      });

      if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
      }

      const data = await response.json();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.response.content,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, aiResponse];
      setMessages(finalMessages);

      // Salva nella chat history se è una conversazione significativa
      if (finalMessages.length > 2) {
        const chatTitle = inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue;
        const chatPreview = aiResponse.content.substring(0, 100) + '...';
        
        const newChat = {
          id: Date.now().toString(),
          title: chatTitle,
          preview: chatPreview,
          timestamp: new Date(),
          messages: finalMessages,
        };

        setChatHistory(prev => [newChat, ...prev.slice(0, 9)]); // Mantieni solo le ultime 10 chat
      }
    } catch (error) {
      console.error('❌ [Chatbot] Errore chiamata API:', error);
      
      // Fallback in caso di errore
      const fallbackResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content:
          `🤖 Ho capito la tua richiesta: "${inputValue}"\n\n` +
          `Posso aiutarti con:\n` +
          `• 📊 Business Plan e analisi finanziarie\n` +
          `• 📈 Market Intelligence e analisi di mercato\n` +
          `• 🎨 Design Center e progettazione\n` +
          `• 📋 Gestione progetti e documenti\n` +
          `• 🏗️ Permessi e compliance\n` +
          `• 📅 Project Timeline AI\n\n` +
          `Prova a essere più specifico su cosa vuoi fare!`,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, fallbackResponse];
      setMessages(finalMessages);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'PLANNING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Square className="w-4 h-4 text-gray-500" />;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Urbanova Dashboard</h1>
                  <p className="text-sm text-gray-500">Design Center & Project Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowToolPanel(!showToolPanel)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showToolPanel
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                Tool Panel
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {/* Sezione principale */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  DASHBOARD
                </h3>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
          <div className="flex-1 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Urbanova Interface - ChatGPT/Cursor Style */}
                <div className="bg-white rounded-lg shadow border border-gray-200 h-[600px] flex flex-col">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">Urbanova</h2>
                          <p className="text-sm text-gray-500">Assistente Intelligente per la Gestione Immobiliare</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowChatHistory(!showChatHistory)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Chat History"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowQuickActions(!showQuickActions)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Quick Actions"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                          <div className={`text-xs mt-2 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                        <button
                          onClick={() => setInputValue('Analisi di fattibilità per progetto residenziale a Milano')}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700">Analisi Fattibilità</span>
                        </button>
                        <button
                          onClick={() => setInputValue('Market Intelligence per zona Porta Nuova Milano')}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-sm"
                        >
                          <Search className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">Market Intelligence</span>
                        </button>
                        <button
                          onClick={() => setInputValue('Crea design per terreno residenziale Roma EUR')}
                          className="flex items-center space-x-2 px-3 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm"
                        >
                          <Sparkles className="w-4 h-4 text-orange-600" />
                          <span className="text-orange-700">Design Center</span>
                        </button>
                        <button
                          onClick={() => setInputValue('Business Plan completo con Comps/OMI')}
                          className="flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700">Business Plan</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Chiedi qualcosa a Urbanova..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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

                {/* Quick Stats - Minimized */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BuildingIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Progetti</p>
                        <p className="text-lg font-bold text-gray-900">{stats?.totalProjects || mockMetrics.totalProjects}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUpIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Attivi</p>
                        <p className="text-lg font-bold text-gray-900">{stats?.activeProjects || mockMetrics.activeProjects}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <EuroIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">Budget</p>
                        <p className="text-lg font-bold text-gray-900">
                          €{((stats?.totalBudget || 0) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUpIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-600">ROI</p>
                        <p className="text-lg font-bold text-gray-900">
                          {stats?.averageROI?.toFixed(1) || mockMetrics.totalROI}%
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
                        placeholder="Chiedi qualcosa a Urbanova Tool OS..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Chat History Panel */}
          {showChatHistory && (
            <div className="w-80 bg-white shadow-lg border-l border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Chat History</h3>
                  <button
                    onClick={() => setShowChatHistory(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">Nessuna chat precedente</h4>
                    <p className="text-sm text-gray-500">
                      Le tue conversazioni con Urbanova appariranno qui
                    </p>
                  </div>
                ) : (
                  chatHistory.map(chat => (
                    <div
                      key={chat.id}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setMessages(chat.messages);
                        setShowChatHistory(false);
                      }}
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{chat.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{chat.preview}</p>
                      <p className="text-xs text-gray-400">{chat.timestamp.toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tool Panel */}
          {showToolPanel && (
            <div className="w-80 bg-white shadow-lg border-l border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Tool Panel</h3>
                  <button
                    onClick={() => setShowToolPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">Tool Panel</h4>
                  <p className="text-sm text-gray-500">
                    Pannello strumenti avanzato in sviluppo
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Feedback Widget */}
      <FeedbackWidget />
    </div>
  );
}
