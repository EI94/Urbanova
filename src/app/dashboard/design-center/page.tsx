'use client';

import React, { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';

// Mock data per i progetti
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

// Mock data per le metriche
const mockMetrics = {
  totalProjects: 12,
  activeProjects: 8,
  totalROI: 19.2,
  avgPayback: 4.2,
  documentsComplete: 78,
  nextDeadlines: 3,
};

// Mock data per i tool disponibili (in produzione verrà da API)
const availableTools = [
  {
    id: 'feasibility-tool',
    name: 'Business Plan & Fattibilità',
    description: 'Business Plan completo con ROI, margini, payback e integrazione Comps/OMI',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'Financial',
    actions: ['run_bp', 'run_sensitivity', 'get_comps_data', 'generate_report'],
  },
  {
    id: 'land-scraper',
    name: 'Land Scraper',
    description: 'Scansiona annunci immobiliari',
    icon: <Search className="w-5 h-5" />,
    category: 'Research',
    actions: ['scan_listing', 'analyze_market', 'extract_data'],
  },
  {
    id: 'document-manager',
    name: 'Document Manager',
    description: 'Gestisce documenti e compliance',
    icon: <FileText className="w-5 h-5" />,
    category: 'Compliance',
    actions: ['request_doc', 'check_status', 'generate_report'],
  },
];

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  metadata?: {
    toolId?: string;
    actionName?: string;
    executionTime?: number;
    success?: boolean;
    runId?: string;
  };
}

interface ToolExecution {
  toolId: string;
  actionName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  estimatedTime?: number;
}

interface ToolRun {
  id: string;
  toolId: string;
  action: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  finishedAt?: Date;
  executionTime?: number;
  progress?: number;
  estimatedTime?: number;
  success?: boolean;
  output?: any;
  error?: string;
}

export default function DesignCenterPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content:
        '🚀 **Urbanova Tool OS** attivato!\n\nSono il tuo assistente intelligente per la gestione immobiliare. Posso eseguire:\n\n🔧 **Tool Actions:**\n• Business Plan completo con Comps/OMI\n• Analisi di fattibilità e ROI\n• Scansione terreni e annunci\n• Gestione documenti e compliance\n\n💬 **Esempi di comandi:**\n• "Fai BP di Progetto A con ±5/±10"\n• "Business Plan Progetto B"\n• "Sensitivity Progetto C ±15%"\n• "Scansiona questo annuncio immobiliare"\n\nCome posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeToolExecutions, setActiveToolExecutions] = useState<ToolExecution[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'analytics' | 'tools' | 'business-plan'
  >('overview');
  const [showToolPanel, setShowToolPanel] = useState(false);

  // Stato per i tool runs
  const [toolRuns, setToolRuns] = useState<ToolRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Carica tool runs dall'API
  const loadToolRuns = async () => {
    try {
      setRunsLoading(true);
      const response = await fetch('/api/tools/runs?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setToolRuns(data.data.runs);
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento tool runs:', error);
    } finally {
      setRunsLoading(false);
    }
  };

  // Carica tool runs al mount
  useEffect(() => {
    loadToolRuns();
  }, []);

  // Esegue tool action tramite API
  const executeToolAction = async (toolId: string, action: string, args: any) => {
    try {
      const response = await fetch('/api/tools/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          action,
          projectId: args.projectId || 'default',
          args,
          context: {
            userId: 'current-user',
            workspaceId: 'default',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Aggiungi il nuovo run alla lista
          const newRun: ToolRun = {
            id: data.data.runId,
            toolId,
            action,
            projectId: args.projectId || 'default',
            status: data.data.status,
            startedAt: new Date(),
            estimatedTime: data.data.estimatedTime,
          };

          setToolRuns(prev => [newRun, ...prev]);

          // Posta messaggio di avvio alla chat
          const startMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'tool',
            content:
              `🚀 **Tool avviato:** ${toolId}.${action}\n\n` +
              `📋 Argomenti: ${JSON.stringify(args)}\n` +
              `⏱️ Tempo stimato: ${Math.round(data.data.estimatedTime / 1000)}s\n` +
              `🆔 Run ID: ${data.data.runId}`,
            timestamp: new Date(),
            metadata: {
              toolId,
              actionName: action,
              runId: data.data.runId,
            },
          };

          setMessages(prev => [...prev, startMessage]);

          return data.data.runId;
        }
      }
    } catch (error) {
      console.error('Errore durante esecuzione tool:', error);

      // Posta messaggio di errore alla chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'tool',
        content:
          `❌ **Errore esecuzione tool:** ${toolId}.${action}\n\n` +
          `🔍 Dettagli: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        timestamp: new Date(),
        metadata: {
          toolId,
          actionName: action,
          success: false,
        },
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Simula esecuzione tool
  const simulateToolExecution = async (toolId: string, actionName: string, args: any) => {
    const execution: ToolExecution = {
      toolId,
      actionName,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      estimatedTime: 3000,
    };

    setActiveToolExecutions(prev => [...prev, execution]);

    // Simula progress
    const progressInterval = setInterval(() => {
      setActiveToolExecutions(prev =>
        prev.map(ex =>
          ex.toolId === toolId && ex.actionName === actionName
            ? { ...ex, progress: Math.min(ex.progress + 20, 100) }
            : ex
        )
      );
    }, 600);

    // Simula completamento
    setTimeout(() => {
      setActiveToolExecutions(prev =>
        prev.map(ex =>
          ex.toolId === toolId && ex.actionName === actionName
            ? { ...ex, status: 'completed', progress: 100 }
            : ex
        )
      );

      clearInterval(progressInterval);

      // Posta messaggio di completamento alla chat
      const completionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'tool',
        content:
          `✅ **Tool completato:** ${toolId}.${actionName}\n\n` +
          `⏱️ Tempo esecuzione: 3.2s\n` +
          `📊 Status: Completato con successo\n` +
          `🔗 [Visualizza dettagli](#)`,
        timestamp: new Date(),
        metadata: {
          toolId,
          actionName,
          executionTime: 3200,
          success: true,
        },
      };

      setMessages(prev => [...prev, completionMessage]);

      // Rimuovi dopo 5 secondi
      setTimeout(() => {
        setActiveToolExecutions(prev =>
          prev.filter(ex => !(ex.toolId === toolId && ex.actionName === actionName))
        );
      }, 5000);
    }, 3000);

    return execution;
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
        const runId = await executeToolAction('feasibility-tool', 'run_sensitivity', {
          projectId: 'proj-a',
          deltas: [-0.05, 0.05],
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📊 **Analisi di Sensibilità** avviata!\n\n` +
            `Progetto: Progetto A\n` +
            `Deltas: ±5%\n` +
            `⏱️ Tempo stimato: 30s\n\n` +
            `Il tool è stato avviato e i risultati saranno disponibili a breve.`,
          timestamp: new Date(),
          metadata: {
            toolId: 'feasibility-tool',
            actionName: 'run_sensitivity',
            runId,
          },
        };
      } else if (message.includes('roi') || message.includes('fattibilità')) {
        const runId = await executeToolAction('feasibility-tool', 'calculate_roi', {
          projectId: 'proj-b',
          includeTaxes: true,
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `💰 **Calcolo ROI** avviato!\n\n` +
            `Progetto: Progetto B\n` +
            `Tasse Incluse: Sì\n` +
            `⏱️ Tempo stimato: 5s\n\n` +
            `Il calcolo è in corso...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'feasibility-tool',
            actionName: 'calculate_roi',
            runId,
          },
        };
      } else if (message.includes('scansiona') || message.includes('annuncio')) {
        const runId = await executeToolAction('land-scraper', 'scan_listing', {
          url: 'https://example.com/listing',
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `🔍 **Scansione Annuncio** avviata!\n\n` +
            `URL: https://example.com/listing\n` +
            `⏱️ Tempo stimato: 10s\n\n` +
            `La scansione è in corso...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'land-scraper',
            actionName: 'scan_listing',
            runId,
          },
        };
      } else if (
        message.includes('questionario venditore') ||
        message.includes('invia questionario') ||
        message.includes('vendor questionnaire')
      ) {
        const projectMatch =
          message.match(/progetto\s+([^\s]+)/i) || message.match(/lotto\s+([^\s]+)/i);
        const projectId = projectMatch ? projectMatch[1] : 'progetto-123';

        const vendorMatch = message.match(/(?:a|per)\s+([^,\n]+)/i);
        const vendorName = vendorMatch ? vendorMatch[1].trim() : 'Venditore';

        const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const vendorEmail = emailMatch ? emailMatch[1] : 'vendor@example.com';

        const runId = await executeToolAction('deal-caller', 'send_questionnaire', {
          projectId,
          vendorContact: {
            name: vendorName,
            email: vendorEmail,
          },
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📧 **Questionario Venditore** avviato!\n\n` +
            `👤 Destinatario: ${vendorName}\n` +
            `📧 Email: ${vendorEmail}\n` +
            `🏗️ Progetto: ${projectId}\n` +
            `⏱️ Tempo stimato: 5s\n\n` +
            `Il questionario verrà inviato e il venditore riceverà un link sicuro.`,
          timestamp: new Date(),
          metadata: {
            toolId: 'deal-caller',
            actionName: 'send_questionnaire',
            runId,
          },
        };
      } else if (message.includes('ingestione risposte') || message.includes('ingest answers')) {
        const projectMatch = message.match(/progetto\s+([^\s]+)/i);
        const projectId = projectMatch ? projectMatch[1] : 'progetto-123';

        const runId = await executeToolAction('deal-caller', 'ingest_answers', {
          projectId,
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `🔄 **Ingestione Risposte** avviata!\n\n` +
            `🏗️ Progetto: ${projectId}\n` +
            `📋 Processo: Mappatura risposte → Project Facts\n` +
            `⏱️ Tempo stimato: 10s\n\n` +
            `Le risposte verranno mappate ai Project Facts e aggiorneranno i Requirements.`,
          timestamp: new Date(),
          metadata: {
            toolId: 'deal-caller',
            actionName: 'ingest_answers',
            runId,
          },
        };
      } else if (
        message.includes('analizza mercato') ||
        message.includes('market intelligence') ||
        message.includes('heatmap')
      ) {
        const cityMatch = message.match(
          /(?:mercato|market)\s+([a-zA-Z\s]+)(?:\s+(\w+))?(?:\s+(\d+)\s+mesi?)?/i
        );
        const city = cityMatch ? cityMatch[1].trim() : 'Milano';
        const asset = cityMatch?.[2] || 'residential';
        const months = cityMatch?.[3] ? parseInt(cityMatch[3]) : 12;

        const runId = await executeToolAction('market-intelligence', 'scan_city', {
          city,
          asset:
            asset === 'residenziale'
              ? 'residential'
              : asset === 'commerciale'
                ? 'commercial'
                : 'residential',
          horizonMonths: months,
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📊 **Analisi Mercato** avviata!\n\n` +
            `🏙️ Città: ${city}\n` +
            `🏗️ Asset: ${asset}\n` +
            `⏰ Orizzonte: ${months} mesi\n` +
            `⏱️ Tempo stimato: 30s\n\n` +
            `L'analisi include KPIs, heatmap e insights di mercato.`,
          timestamp: new Date(),
          metadata: {
            toolId: 'market-intelligence',
            actionName: 'scan_city',
            runId,
          },
        };
      } else if (message.includes('trend report') || message.includes('report trend')) {
        const cityMatch = message.match(
          /(?:report|trend)\s+(?:di\s+)?([a-zA-Z\s]+)(?:\s+(\d+)\s+mesi?)?/i
        );
        const city = cityMatch ? cityMatch[1].trim() : 'Milano';
        const months = cityMatch?.[2] ? parseInt(cityMatch[2]) : 12;

        const runId = await executeToolAction('market-intelligence', 'trend_report', {
          city,
          horizonMonths: months,
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📈 **Report Trend** avviato!\n\n` +
            `🏙️ Città: ${city}\n` +
            `⏰ Orizzonte: ${months} mesi\n` +
            `📄 Output: PDF con grafici e analisi\n` +
            `⏱️ Tempo stimato: 45s\n\n` +
            `Il report includerà trend, KPIs e raccomandazioni.`,
          timestamp: new Date(),
          metadata: {
            toolId: 'market-intelligence',
            actionName: 'trend_report',
            runId,
          },
        };
      } else if (message.includes('comps') || message.includes('comparabili')) {
        const cityMatch = message.match(/(?:comps|comparabili)\s+(?:di\s+)?([a-zA-Z\s]+)/i);
        const city = cityMatch ? cityMatch[1].trim() : 'Milano';

        const runId = await executeToolAction('market-intelligence', 'comps_fetch', {
          city,
          radiusKm: 10,
          sampleSize: 100,
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📋 **Comps Fetch** avviato!\n\n` +
            `🏙️ Città: ${city}\n` +
            `🎯 Raggio: 10 km\n` +
            `📊 Sample: 100 immobili\n` +
            `⏱️ Tempo stimato: 15s\n\n` +
            `Recupero dati OMI + internal comps con outlier filtering.`,
          timestamp: new Date(),
          metadata: {
            toolId: 'market-intelligence',
            actionName: 'comps_fetch',
            runId,
          },
        };
      } else if (message.toLowerCase().startsWith('/usage')) {
        // Usage command - show current month usage
        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📊 **Usage Report - Dicembre 2024**\n\n` +
            `**OCR Processing**\n` +
            `🔹 Utilizzato: 2,500 / 10,000 (25%)\n` +
            `💰 Costo: €25.00\n\n` +
            `**Business Plans**\n` +
            `🔹 Utilizzato: 45 / 1,000 (4.5%)\n` +
            `💰 Costo: €22.50\n\n` +
            `**Market Scans**\n` +
            `🔹 Utilizzato: 180 / 5,000 (3.6%)\n` +
            `💰 Costo: €18.00\n\n` +
            `**Market Intelligence**\n` +
            `🔹 Utilizzato: 25 / 1,000 (2.5%)\n` +
            `💰 Costo: €6.25\n\n` +
            `**Questionari**\n` +
            `🔹 Utilizzato: 12 / 1,000 (1.2%)\n` +
            `💰 Costo: €1.20\n\n` +
            `💰 **Totale Mese**: €72.95\n` +
            `📋 **Piano**: Pro (€99/mese)\n` +
            `📈 **Status**: Tutto sotto controllo!`,
          timestamp: new Date(),
          metadata: {
            type: 'usage_report',
          },
        };
      } else if (
        message.toLowerCase().includes('attiva pro') ||
        message.toLowerCase().includes('upgrade pro')
      ) {
        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `🚀 **Upgrade al Piano Pro**\n\n` +
            `Stai per essere reindirizzato alla pagina di checkout per attivare il piano Pro.\n\n` +
            `✨ **Cosa ottieni:**\n` +
            `• 25 progetti (vs 5 attuali)\n` +
            `• 5 utenti (vs 1 attuale)\n` +
            `• 10,000 actions/mese (vs 1,000)\n` +
            `• Supporto prioritario\n` +
            `• Analytics avanzate\n\n` +
            `💰 **Prezzo**: €99/mese\n` +
            `🎁 **14 giorni di prova gratuita**\n\n` +
            `[Procedi al Checkout →](/dashboard/billing?upgrade=pro)`,
          timestamp: new Date(),
          metadata: {
            type: 'upgrade_prompt',
            plan: 'pro',
          },
        };
      } else if (message.includes('report') || message.includes('genera')) {
        const runId = await executeToolAction('feasibility-tool', 'generate_report', {
          projectId: 'proj-c',
          format: 'pdf',
        });

        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `📄 **Generazione Report** avviata!\n\n` +
            `Progetto: Progetto C\n` +
            `Formato: PDF\n` +
            `⏱️ Tempo stimato: 45s\n\n` +
            `Il report è in generazione...`,
          timestamp: new Date(),
          metadata: {
            toolId: 'feasibility-tool',
            actionName: 'generate_report',
            runId,
          },
        };
      } else {
        // Fallback a risposta generica
        response = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content:
            `🤖 **Urbanova Tool OS**\n\n` +
            `Ho capito la tua richiesta: "${inputValue}"\n\n` +
            `**Tool disponibili:**\n` +
            `• **feasibility-tool**: Business Plan, ROI, Sensitivity\n` +
            `• **land-scraper**: Scansione terreni e annunci\n` +
            `• **document-manager**: Gestione documenti\n\n` +
            `**Esempi di comandi:**\n` +
            `• "Fai BP di Progetto A con ±5/±10"\n` +
            `• "Business Plan Progetto B"\n` +
            `• "Sensitivity Progetto C ±15%"\n` +
            `• "Scansiona questo annuncio"`,
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

  const handleQuickAction = (action: 'new-bp' | 'sensitivity') => {
    let message = '';

    switch (action) {
      case 'new-bp':
        message = 'Fai BP di Progetto A con ±5/±10';
        break;
      case 'sensitivity':
        message = 'Sensitivity Progetto B ±15%';
        break;
    }

    if (message) {
      setInputValue(message);
      // Trigger message send after a short delay for better UX
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50';
      case 'PLANNING':
        return 'text-yellow-600 bg-yellow-50';
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <Play className="w-4 h-4" />;
      case 'PLANNING':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Urbanova Dashboard</h1>
              <p className="text-sm text-gray-600">Design Center & Project Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowToolPanel(!showToolPanel)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              <span>Tool Panel</span>
            </button>

            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Progetti</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'tools'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Tool OS</span>
              </button>

              <button
                onClick={() => setActiveTab('business-plan')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'business-plan'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Business Plan</span>
              </button>

              <button
                onClick={() => (window.location.href = '/dashboard/billing')}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <DollarSign className="w-5 h-5" />
                <span>Billing</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Progetti Totali</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockMetrics.totalProjects}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                        <p className="text-2xl font-bold text-gray-900">{mockMetrics.totalROI}%</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Payback Medio</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockMetrics.avgPayback} anni
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Documenti</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockMetrics.documentsComplete}%
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Projects */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Progetti Recenti</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {mockProjects.slice(0, 3).map(project => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{project.name}</h3>
                              <p className="text-sm text-gray-600">{project.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                            >
                              {getStatusIcon(project.status)}
                              <span className="ml-1">{project.status.replace('_', ' ')}</span>
                            </span>
                            <span className="text-sm text-gray-600">ROI: {project.roi}%</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Gestione Progetti</h2>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Nuovo Progetto</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {mockProjects.map(project => (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                          >
                            {getStatusIcon(project.status)}
                            <span className="ml-1">{project.status.replace('_', ' ')}</span>
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">ROI</span>
                            <span className="font-medium text-green-600">{project.roi}%</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Budget</span>
                            <span className="font-medium">{project.budget}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progresso</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-2">Prossima Milestone:</p>
                          <p className="text-sm font-medium text-gray-900">
                            {project.nextMilestone}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Scadenza: {new Date(project.dueDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics e Report</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Performance Progetti
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ROI Medio</span>
                        <span className="font-medium text-green-600">19.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payback Medio</span>
                        <span className="font-medium">4.2 anni</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="font-medium text-blue-600">87%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Documenti e Compliance
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completamento</span>
                        <span className="font-medium text-green-600">78%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">In Scadenza</span>
                        <span className="font-medium text-orange-600">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Scaduti</span>
                        <span className="font-medium text-red-600">0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Urbanova Tool OS</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableTools.map(tool => (
                    <div
                      key={tool.id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            {tool.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                            <p className="text-xs text-gray-500">{tool.category}</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700">Actions disponibili:</p>
                          <div className="flex flex-wrap gap-1">
                            {tool.actions.map(action => (
                              <span
                                key={action}
                                className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                              >
                                {action}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tool Runs Recenti */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Tool Runs Recenti</h3>
                    <button
                      onClick={loadToolRuns}
                      disabled={runsLoading}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                    >
                      {runsLoading ? 'Caricamento...' : 'Aggiorna'}
                    </button>
                  </div>

                  {runsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Caricamento tool runs...</p>
                    </div>
                  ) : toolRuns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {toolRuns.slice(0, 6).map(run => (
                        <div
                          key={run.id}
                          className="bg-white rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {run.toolId}.{run.action}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(run.status)}`}
                            >
                              {run.status}
                            </span>
                          </div>

                          <div className="text-xs text-gray-600 mb-2">
                            Progetto: {run.projectId}
                          </div>

                          <div className="text-xs text-gray-500">
                            {new Date(run.startedAt).toLocaleString('it-IT')}
                          </div>

                          {run.executionTime && (
                            <div className="text-xs text-gray-500 mt-1">
                              ⏱️ {run.executionTime}ms
                            </div>
                          )}

                          {run.output && run.output.pdfUrl && (
                            <div className="mt-2">
                              <a
                                href={run.output.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                📄 Visualizza Report
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Nessun tool run disponibile
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'business-plan' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Business Plan Dashboard</h2>

                {/* Business Plan Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">BP Completati</p>
                        <p className="text-2xl font-bold text-gray-900">8</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">ROI Medio</p>
                        <p className="text-2xl font-bold text-gray-900">24.5%</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Margine Medio</p>
                        <p className="text-2xl font-bold text-gray-900">18.2%</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Comps/OMI</p>
                        <p className="text-2xl font-bold text-gray-900">156</p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Search className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Plan Recenti */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Business Plan Recenti
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Residenza Marina</p>
                          <p className="text-sm text-gray-600">ROI: 28.5% | Margine: 22.1%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Aggiornato: 2 ore fa</p>
                        <button className="text-sm text-blue-600 hover:text-blue-800 underline">
                          Visualizza BP
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Centro Commerciale Nord</p>
                          <p className="text-sm text-gray-600">ROI: 31.2% | Margine: 25.8%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Aggiornato: 1 giorno fa</p>
                        <button className="text-sm text-blue-600 hover:text-blue-800 underline">
                          Visualizza BP
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Azioni Rapide</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleQuickAction('new-bp')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Plus className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Nuovo Business Plan</p>
                          <p className="text-sm text-gray-600">Crea BP per nuovo progetto</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Clicca per iniziare →
                      </div>
                    </button>

                    <button
                      onClick={() => handleQuickAction('sensitivity')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Analisi Sensibilità</p>
                          <p className="text-sm text-gray-600">Ricalcola con nuovi parametri</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Clicca per iniziare →
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Sidebar */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Urbanova Tool OS</h3>
                  <p className="text-sm text-gray-600">Assistente Intelligente</p>
                </div>
              </div>
            </div>

            {/* Active Tool Executions */}
            {activeToolExecutions.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-yellow-50">
                <h4 className="text-sm font-medium text-yellow-800 mb-3">🔄 Tool in Esecuzione</h4>
                <div className="space-y-3">
                  {activeToolExecutions.map((execution, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {execution.toolId}.{execution.actionName}
                        </span>
                        <span className="text-xs text-gray-500">{execution.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${execution.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{execution.status}</span>
                        <span className="text-xs text-gray-500">
                          {Math.round((Date.now() - execution.startTime.getTime()) / 1000)}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
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
                        : message.type === 'tool'
                          ? 'bg-green-100 text-green-900 border border-green-200'
                          : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Urbanova OS sta pensando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Chiedi qualcosa a Urbanova Tool OS..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                💡 Prova: "Fai BP di Progetto A con ±5/±10", "Invia questionario venditore per Lotto
                Via Ciliegie", "Ingestione risposte Progetto B"
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
