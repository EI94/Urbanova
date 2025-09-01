'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Settings,
  X,
  Command,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

// Mock data per i tool disponibili
const availableTools = [
  {
    id: 'feasibility-tool',
    name: 'Analisi Fattibilità',
    category: 'financial',
    icon: <Zap className="w-4 h-4" />,
    actions: [
      {
        name: 'run_sensitivity',
        description: 'Esegue analisi di sensibilità',
        shortcut: 'sensitivity',
        args: ['projectId', 'deltas'],
      },
      {
        name: 'calculate_roi',
        description: 'Calcola ROI del progetto',
        shortcut: 'roi',
        args: ['projectId', 'includeTaxes'],
      },
      {
        name: 'generate_report',
        description: 'Genera report fattibilità',
        shortcut: 'report',
        args: ['projectId', 'format'],
      },
    ],
  },
  {
    id: 'land-scraper',
    name: 'Land Scraper',
    category: 'research',
    icon: <Search className="w-4 h-4" />,
    actions: [
      {
        name: 'scan_listing',
        description: 'Scansiona singolo annuncio',
        shortcut: 'scan',
        args: ['url'],
      },
      {
        name: 'analyze_market',
        description: 'Analizza trend di mercato',
        shortcut: 'market',
        args: ['location', 'propertyType'],
      },
    ],
  },
  {
    id: 'document-manager',
    name: 'Document Manager',
    category: 'compliance',
    icon: <Settings className="w-4 h-4" />,
    actions: [
      {
        name: 'request_doc',
        description: 'Richiede nuovo documento',
        shortcut: 'doc',
        args: ['projectId', 'docType', 'vendor'],
      },
      {
        name: 'check_status',
        description: 'Verifica stato documenti',
        shortcut: 'status',
        args: ['projectId'],
      },
    ],
  },
];

interface Tool {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  actions: ToolAction[];
}

interface ToolAction {
  name: string;
  description: string;
  shortcut: string;
  args: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showRunActionModal, setShowRunActionModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedAction, setSelectedAction] = useState<ToolAction | null>(null);
  const [actionArgs, setActionArgs] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filtra tool e actions per ricerca
  const filteredResults = availableTools
    .flatMap(tool =>
      tool.actions.map(action => ({
        tool,
        action,
        searchText: `${tool.name} ${action.name} ${action.shortcut}`.toLowerCase(),
      }))
    )
    .filter(result => result.searchText.includes(searchQuery.toLowerCase()));

  // Gestione shortcut da tastiera
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            const { tool, action } = filteredResults[selectedIndex];
            openRunActionModal(tool, action);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, onClose]);

  // Focus input quando si apre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll to selected item
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Apri modal esecuzione azione
  const openRunActionModal = (tool: Tool, action: ToolAction) => {
    setSelectedTool(tool);
    setSelectedAction(action);
    setActionArgs({});
    setShowRunActionModal(true);
    onClose(); // Chiudi command palette
  };

  // Esegui azione tool
  const executeToolAction = async () => {
    if (!selectedTool || !selectedAction) return;

    setIsExecuting(true);

    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Post messaggio a chat (simulato)
      console.log(
        `Tool ${selectedTool.id}.${selectedAction.name} eseguito con successo!`,
        actionArgs
      );

      // Chiudi modal
      setShowRunActionModal(false);
      setSelectedTool(null);
      setSelectedAction(null);
      setActionArgs({});
    } catch (error) {
      console.error('Errore durante esecuzione tool:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Genera form per argomenti
  const renderActionForm = () => {
    if (!selectedAction) return null;

    return (
      <div className="space-y-4">
        {selectedAction.args.map(arg => (
          <div key={arg}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{arg}</label>
            {arg === 'includeTaxes' ? (
              <input
                type="checkbox"
                checked={actionArgs[arg] || false}
                onChange={e => setActionArgs(prev => ({ ...prev, [arg]: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            ) : arg === 'deltas' ? (
              <input
                type="text"
                placeholder="5,10,15"
                value={actionArgs[arg] || ''}
                onChange={e => setActionArgs(prev => ({ ...prev, [arg]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : arg === 'format' ? (
              <select
                value={actionArgs[arg] || 'pdf'}
                onChange={e => setActionArgs(prev => ({ ...prev, [arg]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="html">HTML</option>
              </select>
            ) : (
              <input
                type="text"
                placeholder={`Inserisci ${arg}`}
                value={actionArgs[arg] || ''}
                onChange={e => setActionArgs(prev => ({ ...prev, [arg]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Command Palette Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Command className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cerca tool e azioni..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-lg border-none outline-none placeholder-gray-400"
                />
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
            {filteredResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nessun risultato trovato</p>
                <p className="text-sm">Prova a cercare con termini diversi</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredResults.map((result, index) => (
                  <button
                    key={`${result.tool.id}-${result.action.name}`}
                    onClick={() => openRunActionModal(result.tool, result.action)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        {result.tool.icon}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{result.tool.name}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700">{result.action.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{result.action.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                            {result.tool.category}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-xs text-blue-600 rounded">
                            {result.action.shortcut}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-400">
                        <span className="text-xs">↵</span>
                        <Play className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-3 h-3" />
                  <ArrowDown className="w-3 h-3" />
                  <span>Naviga</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>↵</span>
                  <span>Esegui</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Esc</span>
                  <span>Chiudi</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Run Action Modal */}
      {showRunActionModal && selectedTool && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {selectedTool.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedTool.name}.{selectedAction.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedAction.description}</p>
                </div>
              </div>
            </div>

            <div className="p-6">{renderActionForm()}</div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowRunActionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isExecuting}
                >
                  Annulla
                </button>

                <button
                  onClick={executeToolAction}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isExecuting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Esecuzione...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Esegui Action</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
