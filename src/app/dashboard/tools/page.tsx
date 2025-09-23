'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Settings,
  Play,
  Pause,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Upload,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';

// Mock data per i tool
const mockTools = [
  {
    id: 'feasibility-tool',
    name: 'Analisi Fattibilità',
    version: '1.0.0',
    description: 'Tool per analisi finanziarie, ROI e analisi di sensibilità',
    category: 'financial',
    icon: <Zap className="w-6 h-6" />,
    enabled: true,
    actions: [
      {
        name: 'run_sensitivity',
        description: 'Esegue analisi di sensibilità',
        requiredRole: 'pm',
        confirm: false,
        longRunning: false,
      },
      {
        name: 'calculate_roi',
        description: 'Calcola ROI del progetto',
        requiredRole: 'pm',
        confirm: false,
        longRunning: false,
      },
      {
        name: 'generate_report',
        description: 'Genera report fattibilità',
        requiredRole: 'pm',
        confirm: true,
        longRunning: true,
      },
    ],
    config: {
      defaultDeltas: [-0.1, -0.05, 0.05, 0.1],
      includeTaxes: true,
      reportFormat: 'pdf',
    },
    secrets: {
      apiKey: 'sk-...',
      webhookUrl: 'https://...',
    },
  },
  {
    id: 'land-scraper',
    name: 'Land Scraper',
    version: '2.1.0',
    description: 'Scansiona annunci immobiliari e estrae dati strutturati',
    category: 'research',
    icon: <Search className="w-6 h-6" />,
    enabled: false,
    actions: [
      {
        name: 'scan_listing',
        description: 'Scansiona singolo annuncio',
        requiredRole: 'sales',
        confirm: false,
        longRunning: false,
      },
      {
        name: 'analyze_market',
        description: 'Analizza trend di mercato',
        requiredRole: 'pm',
        confirm: false,
        longRunning: true,
      },
    ],
    config: {
      maxListings: 100,
      includeImages: true,
      language: 'it',
    },
    secrets: {
      proxyUrl: 'http://...',
      userAgent: 'Mozilla/5.0...',
    },
  },
  {
    id: 'document-manager',
    name: 'Document Manager',
    version: '1.5.0',
    description: 'Gestisce documenti, compliance e workflow approvazioni',
    category: 'compliance',
    icon: <Shield className="w-6 h-6" />,
    enabled: true,
    actions: [
      {
        name: 'request_doc',
        description: 'Richiede nuovo documento',
        requiredRole: 'pm',
        confirm: true,
        longRunning: false,
      },
      {
        name: 'check_status',
        description: 'Verifica stato documenti',
        requiredRole: 'pm',
        confirm: false,
        longRunning: false,
      },
    ],
    config: {
      autoReminders: true,
      reminderDays: [7, 3, 1],
      defaultApprovers: ['pm', 'owner'],
    },
    secrets: {
      storageBucket: 'urbanova-docs',
      encryptionKey: 'enc-...',
    },
  },
];

// Mock data per i tool runs
const mockToolRuns = [
  {
    id: 'run-1',
    toolId: 'feasibility-tool',
    action: 'run_sensitivity',
    projectId: 'proj-a',
    status: 'completed',
    startedAt: new Date(Date.now() - 3600000),
    finishedAt: new Date(Date.now() - 3500000),
    executionTime: 100000,
    success: true,
    output: {
      baseRoi: 15.5,
      range: { min: 14.7, max: 16.3 },
      pdfUrl: 'https://example.com/report.pdf',
    },
  },
  {
    id: 'run-2',
    toolId: 'land-scraper',
    action: 'analyze_market',
    projectId: 'proj-b',
    status: 'running',
    startedAt: new Date(Date.now() - 1800000),
    progress: 65,
    estimatedTime: 300000,
  },
  {
    id: 'run-3',
    toolId: 'document-manager',
    action: 'request_doc',
    projectId: 'proj-c',
    status: 'failed',
    startedAt: new Date(Date.now() - 900000),
    finishedAt: new Date(Date.now() - 800000),
    error: 'Documento non trovato nel sistema',
  },
];

interface Tool {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  enabled: boolean;
  actions: ToolAction[];
  config: Record<string, any>;
  secrets: Record<string, string>;
}

interface ToolAction {
  name: string;
  description: string;
  requiredRole: string;
  confirm: boolean;
  longRunning: boolean;
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

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'installed' | 'catalog'>('installed');
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [toolRuns, setToolRuns] = useState<ToolRun[]>(mockToolRuns as any);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showRunActionModal, setShowRunActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ToolAction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showSecrets, setShowSecrets] = useState(false);

  // Filtra tool per ricerca
  const filteredTools = tools.filter(
    tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtra tool runs per status
  const filteredToolRuns = toolRuns.filter(
    run => statusFilter === 'all' || run.status === statusFilter
  );

  // Toggle abilitazione tool
  const toggleTool = (toolId: string) => {
    setTools(prev =>
      prev.map(tool => (tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool))
    );
  };

  // Apri drawer dettagli tool
  const openToolDetail = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDetailDrawer(true);
  };

  // Apri modal esecuzione azione
  const openRunActionModal = (tool: Tool, action: ToolAction) => {
    setSelectedTool(tool);
    setSelectedAction(action);
    setShowRunActionModal(true);
  };

  // Esegui azione tool
  const runToolAction = async (toolId: string, action: string, args: any) => {
    try {
      // Simula chiamata API
      const newRun: ToolRun = {
        id: `run-${Date.now()}`,
        toolId,
        action,
        projectId: args.projectId || 'default',
        status: 'running',
        startedAt: new Date(),
        estimatedTime: 30000,
      };

      setToolRuns(prev => [newRun, ...prev]);

      // Simula completamento dopo 3 secondi
      setTimeout(() => {
        setToolRuns(prev =>
          prev.map(run =>
            run.id === newRun.id
              ? {
                  ...run,
                  status: 'completed',
                  finishedAt: new Date(),
                  executionTime: 3000,
                  success: true,
                  output: {
                    message: 'Azione completata con successo',
                    timestamp: new Date().toISOString(),
                  },
                }
              : run
          )
        );
      }, 3000);

      setShowRunActionModal(false);
    } catch (error) {
      console.error('Errore durante esecuzione tool:', error);
    }
  };

  // Cancella tool run
  const cancelToolRun = (runId: string) => {
    setToolRuns(prev =>
      prev.map(run => (run.id === runId ? { ...run, status: 'cancelled' } : run))
    );
  };

  // Retry tool run
  const retryToolRun = (run: ToolRun) => {
    const newRun: ToolRun = {
      ...run,
      id: `run-${Date.now()}`,
      status: 'running',
      startedAt: new Date(),
      finishedAt: undefined,
      executionTime: undefined,
      success: undefined,
      output: undefined,
      error: undefined,
    } as any;

    setToolRuns(prev => [newRun, ...prev]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Urbanova Tool OS</h1>
            <p className="text-sm text-gray-600">Gestisci tool, automazioni e integrazioni</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Installa Tool</span>
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
                onClick={() => setActiveTab('installed')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'installed'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Tool Installati</span>
              </button>

              <button
                onClick={() => setActiveTab('catalog')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'catalog'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Download className="w-5 h-5" />
                <span>Catalogo</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'installed' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cerca tool..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tutti gli status</option>
                    <option value="running">In esecuzione</option>
                    <option value="completed">Completati</option>
                    <option value="failed">Falliti</option>
                    <option value="cancelled">Cancellati</option>
                  </select>
                </div>

                <button
                  onClick={() => setToolRuns([...mockToolRuns] as any)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Aggiorna</span>
                </button>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map(tool => (
                  <div
                    key={tool.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            {tool.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                            <p className="text-xs text-gray-500">v{tool.version}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleTool(tool.id)}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                              tool.enabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {tool.enabled ? 'Abilitato' : 'Disabilitato'}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium text-gray-700">Actions disponibili:</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.actions.slice(0, 3).map(action => (
                            <span
                              key={action.name}
                              className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded"
                            >
                              {action.name}
                            </span>
                          ))}
                          {tool.actions.length > 3 && (
                            <span className="px-2 py-1 bg-blue-100 text-xs text-blue-700 rounded">
                              +{tool.actions.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 capitalize">{tool.category}</span>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openToolDetail(tool)}
                            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            Dettagli
                          </button>

                          <div className="relative">
                            <select
                              onChange={e => {
                                if (e.target.value) {
                                  const action = tool.actions.find(a => a.name === e.target.value);
                                  if (action) {
                                    openRunActionModal(tool, action);
                                  }
                                  e.target.value = '';
                                }
                              }}
                              className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors bg-transparent border-none cursor-pointer"
                            >
                              <option value="">Esegui Action</option>
                              {tool.actions.map(action => (
                                <option key={action.name} value={action.name}>
                                  {action.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tool Runs */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Tool Runs Recenti</h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {filteredToolRuns.map(run => (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(run.status)}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}
                            >
                              {run.status}
                            </span>
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {run.toolId}.{run.action}
                            </p>
                            <p className="text-sm text-gray-600">Progetto: {run.projectId}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {run.startedAt.toLocaleTimeString('it-IT')}
                            </p>
                            {run.executionTime && (
                              <p className="text-xs text-gray-500">{run.executionTime}ms</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {run.status === 'running' && (
                              <button
                                onClick={() => cancelToolRun(run.id)}
                                className="px-2 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                              >
                                Cancella
                              </button>
                            )}

                            {(run.status === 'failed' || run.status === 'cancelled') && (
                              <button
                                onClick={() => retryToolRun(run)}
                                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Riprova
                              </button>
                            )}

                            {run.status === 'completed' && run.output?.pdfUrl && (
                              <a
                                href={run.output.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 text-xs text-green-600 hover:text-green-800 transition-colors"
                              >
                                Scarica
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Catalogo Tool</h2>
              <p className="text-gray-600">
                Scopri e installa nuovi tool per potenziare il tuo workflow.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tool disponibili per installazione */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Marketplace Tool</h3>
                        <p className="text-xs text-gray-500">Coming Soon</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Installa tool da terze parti e dalla community Urbanova.
                    </p>

                    <button className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg cursor-not-allowed">
                      Disponibile Presto
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tool Detail Drawer */}
      {showDetailDrawer && selectedTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-2xl h-5/6 rounded-t-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    {selectedTool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTool.name}</h3>
                    <p className="text-sm text-gray-600">v{selectedTool.version}</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto h-full">
              <div className="space-y-6">
                {/* Configurazione */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Configurazione</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedTool.config).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key}
                        </label>
                        <input
                          type="text"
                          defaultValue={String(value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secrets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Secrets</h4>
                    <button
                      onClick={() => setShowSecrets(!showSecrets)}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showSecrets ? 'Nascondi' : 'Mostra'}</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(selectedTool.secrets).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {key}
                        </label>
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          defaultValue={value}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Actions Disponibili</h4>
                  <div className="space-y-3">
                    {selectedTool.actions.map(action => (
                      <div key={action.name} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{action.name}</h5>
                          <span className="text-xs text-gray-500 capitalize">
                            {action.requiredRole}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        <div className="flex items-center space-x-2">
                          {action.confirm && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Richiede conferma
                            </span>
                          )}
                          {action.longRunning && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              Long running
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Chiudi
                </button>

                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Disinstalla
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Salva Configurazione
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Action Modal */}
      {showRunActionModal && selectedTool && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Esegui {selectedAction.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedAction.description}</p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                  <input
                    type="text"
                    placeholder="Inserisci ID progetto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {selectedAction.name === 'run_sensitivity' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deltas (%)
                    </label>
                    <input
                      type="text"
                      placeholder="5,10,15"
                      defaultValue="5,10,15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {selectedAction.name === 'calculate_roi' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeTaxes"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="includeTaxes" className="text-sm text-gray-700">
                      Include tasse nel calcolo
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowRunActionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annulla
                </button>

                <button
                  onClick={() => {
                    runToolAction(selectedTool.id, selectedAction.name, {
                      projectId: 'proj-test',
                    });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Esegui Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
