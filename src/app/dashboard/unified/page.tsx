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
  AlertIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  SearchIcon,
  ChartIcon,
} from 'lucide-react';

import { useLanguage } from '@/contexts/LanguageContext';
import { dashboardService, DashboardStats } from '@/lib/dashboardService';

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
      content:
        '🚀 **Urbanova Tool OS** attivato!\n\nSono il tuo assistente intelligente per la gestione immobiliare. Posso eseguire:\n\n🔧 **Tool Actions:**\n• Business Plan completo con Comps/OMI\n• Analisi di fattibilità e ROI\n• Scansione terreni e annunci\n• Gestione documenti e compliance\n• Market Intelligence\n• Design Center\n• Project Timeline AI\n\n💬 **Esempi di comandi:**\n• "Fai BP di Progetto A con ±5/±10"\n• "Business Plan Progetto B"\n• "Sensitivity Progetto C ±15%"\n• "Scansiona questo annuncio immobiliare"\n• "Analisi Market Intelligence per Milano"\n• "Crea design per terreno Roma EUR"\n\nCome posso aiutarti oggi?',
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

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simula processing
    setTimeout(async () => {
      let response: ChatMessage;

      const message = inputValue.toLowerCase();

      // Tool OS Integration - Utilizza API reale
      if (
        message.includes('business plan') ||
        message.includes('bp') ||
        message.includes('proforma') ||
        message.includes('costi') ||
        message.includes('ricavi')
      ) {
        const runId = await executeToolAction('feasibility-tool', 'run_bp', {
          projectId: 'proj-a',
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📊 **Business Plan** avviato!\n\n` +
            `Progetto: Progetto A\n` +
            `📈 Calcolo: ROI, Margini, Payback\n` +
            `🔍 Comps/OMI: Integrazione automatica\n` +
            `⏱️ Tempo stimato: 45s\n\n` +
            `Il Business Plan è in elaborazione...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'feasibility-tool',
            actionName: 'run_bp',
            runId,
          },
        };
      } else if (message.includes('sensitivity') || message.includes('sensibilità')) {
        const runId = await executeToolAction('feasibility-tool', 'sensitivity_analysis', {
          projectId: 'proj-b',
          variations: '±15%',
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📊 **Analisi di Sensibilità** avviata!\n\n` +
            `Progetto: Progetto B\n` +
            `📈 Variazioni: ±15%\n` +
            `🔍 Parametri: Prezzo, Costi, Tempi\n` +
            `⏱️ Tempo stimato: 30s\n\n` +
            `L'analisi di sensibilità è in corso...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'feasibility-tool',
            actionName: 'sensitivity_analysis',
            runId,
          },
        };
      } else if (message.includes('market intelligence') || message.includes('analisi mercato')) {
        const runId = await executeToolAction('market-intelligence-tool', 'analyze_market', {
          location: 'Milano',
          propertyType: 'residential',
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📊 **Market Intelligence** avviata!\n\n` +
            `📍 Zona: Milano\n` +
            `🏠 Tipo: Residenziale\n` +
            `📈 Analisi: Trend prezzi, domanda, offerta\n` +
            `⏱️ Tempo stimato: 60s\n\n` +
            `L'analisi di mercato è in corso...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'market-intelligence-tool',
            actionName: 'analyze_market',
            runId,
          },
        };
      } else if (message.includes('design') || message.includes('progetto') || message.includes('terreno')) {
        const runId = await executeToolAction('design-center-tool', 'create_design', {
          location: 'Roma EUR',
          propertyType: 'residential',
        });

        response = {
          id: (Date.now() + 1).toString(),
          content:
            `🎨 **Design Center** avviato!\n\n` +
            `📍 Zona: Roma EUR\n` +
            `🏠 Tipo: Residenziale\n` +
            `🎨 Generazione: Design AI-powered\n` +
            `⏱️ Tempo stimato: 90s\n\n` +
            `La creazione del design è in corso...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'design-center-tool',
            actionName: 'create_design',
            runId,
          },
        };
      } else {
        response = {
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
      }

      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
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
                <button
                  onClick={() => setActiveTab('market-intelligence')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'market-intelligence'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-4 h-4 mr-3" />
                  Market Intelligence
                </button>
                <button
                  onClick={() => setActiveTab('feasibility-analysis')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'feasibility-analysis'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </button>
                <button
                  onClick={() => setActiveTab('design-center')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'design-center'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-3" />
                  Design Center
                </button>
              </div>

              {/* Planning & Compliance */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PLANNING/COMPLIANCE
                </h3>
                <button
                  onClick={() => setActiveTab('business-plan')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'business-plan'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  Business Plan
                </button>
                <button
                  onClick={() => setActiveTab('permits-compliance')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'permits-compliance'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Shield className="w-4 h-4 mr-3" />
                  Permessi & Compliance
                </button>
                <button
                  onClick={() => setActiveTab('project-timeline')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'project-timeline'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Project Timeline AI
                </button>
              </div>

              {/* Progetti */}
              <div className="space-y-1">
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  PROGETTI
                </h3>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'projects'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Progetti
                </button>
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
                <button
                  onClick={() => setActiveTab('project-management')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'project-management'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  Gestione Progetti
                </button>
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
                <button
                  onClick={() => setActiveTab('marketing')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'marketing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Marketing
                </button>
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
                <button
                  onClick={() => setActiveTab('epc')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'epc'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-3" />
                  EPC
                </button>
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
                  Tool OS
                </button>
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
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Panoramica generale dei tuoi progetti immobiliari</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Ultimo aggiornamento</p>
                    <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
                  </div>
                </div>

                {/* Statistiche Principali */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BuildingIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects || mockMetrics.totalProjects}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUpIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Progetti Attivi</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.activeProjects || mockMetrics.activeProjects}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <EuroIcon className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Budget Totale</p>
                        <p className="text-2xl font-bold text-gray-900">
                          €{((stats?.totalBudget || 0) / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <TrendingUpIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats?.averageROI?.toFixed(1) || mockMetrics.totalROI}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progetti Recenti */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Progetti Recenti</h3>
                  <div className="space-y-4">
                    {mockProjects.map(project => (
                      <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <p className="text-sm text-gray-500">{project.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1">{project.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">ROI: {project.roi}%</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <BuildingIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="text-sm font-medium text-blue-900">Nuovo Progetto</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('market-intelligence')}
                      className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <TrendingUpIcon className="h-5 w-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium text-green-900">Market Intelligence</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('feasibility-analysis')}
                      className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <EuroIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium text-purple-900">Analisi Fattibilità</span>
                    </button>
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

            {/* Placeholder per altre sezioni */}
            {activeTab !== 'overview' && activeTab !== 'tools' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">
                      {activeTab.replace('-', ' ')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Sezione {activeTab.replace('-', ' ')} - In sviluppo
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sezione in Sviluppo
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Questa sezione è in fase di sviluppo e sarà disponibile presto.
                    </p>
                    <button
                      onClick={() => setActiveTab('tools')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Usa Tool OS per questa funzionalità
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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
    </div>
  );
}
