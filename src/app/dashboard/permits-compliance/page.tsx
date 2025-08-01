'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';

interface Permit {
  id: string;
  name: string;
  category: 'URBANISTICO' | 'AMBIENTALE' | 'SICUREZZA' | 'COMMERCIALE' | 'ENERGETICO';
  status: 'NON_RICHIESTO' | 'IN_PREPARAZIONE' | 'PRESENTATO' | 'IN_ESAME' | 'APPROVATO' | 'RIGETTATO' | 'SCADUTO';
  priority: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BASSO';
  requiredBy: Date;
  estimatedDuration: number; // giorni
  cost: number;
  authority: string;
  dependencies: string[]; // permessi prerequisiti
  documentation: string[];
  currentStep: string;
  progress: number; // 0-100
  assignedTo?: string;
  notes?: string;
  submittedDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  aiRecommendations?: string[];
}

interface ComplianceAlert {
  id: string;
  type: 'SCADENZA' | 'MODIFICA_NORMATIVA' | 'RITARDO' | 'MANCANZA';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  actionRequired: string;
  deadline?: Date;
  relatedPermits: string[];
}

export default function PermitsCompliancePage() {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'permits' | 'timeline' | 'alerts'>('overview');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Mock data
  useEffect(() => {
    const mockPermits: Permit[] = [
      {
        id: 'permit-1',
        name: 'Permesso di Costruire',
        category: 'URBANISTICO',
        status: 'IN_ESAME',
        priority: 'CRITICO',
        requiredBy: new Date('2024-03-15'),
        estimatedDuration: 60,
        cost: 2500,
        authority: 'Comune di Milano - Ufficio Urbanistica',
        dependencies: ['Nulla Osta Soprintendenza'],
        documentation: ['Progetto architettonico', 'Relazione tecnica', 'Calcoli strutturali', 'Piano sicurezza'],
        currentStep: 'Esame istruttorio',
        progress: 65,
        assignedTo: 'Arch. Marco Rossi',
        submittedDate: new Date('2024-01-10'),
        aiRecommendations: ['Aggiornare documentazione antincendio entro 5 giorni', 'Schedulare sopralluogo tecnico']
      },
      {
        id: 'permit-2',
        name: 'Valutazione Impatto Ambientale',
        category: 'AMBIENTALE',
        status: 'IN_PREPARAZIONE',
        priority: 'ALTO',
        requiredBy: new Date('2024-02-28'),
        estimatedDuration: 90,
        cost: 5000,
        authority: 'Regione Lombardia - ARPA',
        dependencies: [],
        documentation: ['Studio impatto ambientale', 'Relazione geologica', 'Analisi acustica'],
        currentStep: 'Raccolta documentazione',
        progress: 30,
        assignedTo: 'Ing. Laura Bianchi',
        aiRecommendations: ['Richiedere analisi rumore urgente', 'Completare studio flora/fauna']
      },
      {
        id: 'permit-3',
        name: 'Certificazione Energetica',
        category: 'ENERGETICO',
        status: 'APPROVATO',
        priority: 'MEDIO',
        requiredBy: new Date('2024-01-31'),
        estimatedDuration: 30,
        cost: 800,
        authority: 'Certificatore Energetico Accreditato',
        dependencies: ['Permesso di Costruire'],
        documentation: ['APE preliminare', 'Calcoli energetici'],
        currentStep: 'Completato',
        progress: 100,
        assignedTo: 'Ing. Giuseppe Verdi',
        approvalDate: new Date('2024-01-25'),
        expiryDate: new Date('2034-01-25'),
      },
      {
        id: 'permit-4',
        name: 'Autorizzazione Antincendio',
        category: 'SICUREZZA',
        status: 'NON_RICHIESTO',
        priority: 'ALTO',
        requiredBy: new Date('2024-04-01'),
        estimatedDuration: 45,
        cost: 1200,
        authority: 'Vigili del Fuoco - Comando Provinciale',
        dependencies: ['Permesso di Costruire'],
        documentation: ['Progetto antincendio', 'Relazione tecnica', 'Planimetrie evacuazione'],
        currentStep: 'Da avviare',
        progress: 0,
        aiRecommendations: ['Iniziare iter immediatamente - rischio ritardo critico']
      }
    ];

    const mockAlerts: ComplianceAlert[] = [
      {
        id: 'alert-1',
        type: 'SCADENZA',
        severity: 'HIGH',
        title: 'Scadenza Permesso di Costruire',
        description: 'Il permesso di costruire scade tra 15 giorni. È necessario richiedere la proroga.',
        actionRequired: 'Presentare richiesta proroga entro 10 giorni',
        deadline: new Date('2024-02-15'),
        relatedPermits: ['permit-1']
      },
      {
        id: 'alert-2',
        type: 'MODIFICA_NORMATIVA',
        severity: 'MEDIUM',
        title: 'Aggiornamento Normativa Energetica',
        description: 'Nuove disposizioni regionali per certificazioni energetiche in vigore dal 1 marzo',
        actionRequired: 'Verificare conformità progetto alle nuove norme',
        relatedPermits: ['permit-3']
      },
      {
        id: 'alert-3',
        type: 'RITARDO',
        severity: 'HIGH',
        title: 'Ritardo VIA',
        description: 'Valutazione Impatto Ambientale in ritardo di 10 giorni sulla tabella di marcia',
        actionRequired: 'Accelerare raccolta documentazione mancante',
        relatedPermits: ['permit-2']
      }
    ];

    setTimeout(() => {
      setPermits(mockPermits);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVATO': return 'text-green-600 bg-green-50';
      case 'IN_ESAME': return 'text-blue-600 bg-blue-50';
      case 'IN_PREPARAZIONE': return 'text-yellow-600 bg-yellow-50';
      case 'PRESENTATO': return 'text-purple-600 bg-purple-50';
      case 'NON_RICHIESTO': return 'text-gray-600 bg-gray-50';
      case 'RIGETTATO': return 'text-red-600 bg-red-50';
      case 'SCADUTO': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICO': return 'text-red-600 bg-red-50 border-red-200';
      case 'ALTO': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIO': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'BASSO': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT').format(date);
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPermits = selectedFilter === 'ALL' 
    ? permits 
    : permits.filter(p => p.category === selectedFilter);

  const stats = {
    total: permits.length,
    approved: permits.filter(p => p.status === 'APPROVATO').length,
    inProgress: permits.filter(p => ['IN_ESAME', 'PRESENTATO', 'IN_PREPARAZIONE'].includes(p.status)).length,
    critical: permits.filter(p => p.priority === 'CRITICO').length,
    totalCost: permits.reduce((sum, p) => sum + p.cost, 0),
    avgProgress: Math.round(permits.reduce((sum, p) => sum + p.progress, 0) / permits.length)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema Permessi Intelligente</h1>
            <p className="text-gray-600">AI-powered compliance tracking e gestione autorizzazioni</p>
          </div>
          {/* BuildingIcon removed */}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'permits', name: 'Permessi', icon: '📋' },
              { id: 'timeline', name: 'Timeline', icon: '⏱️' },
              { id: 'alerts', name: 'Alert', icon: '🚨', badge: alerts.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <span>{tab.icon}</span>
                {tab.name}
                {tab.badge && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Totale Permessi</div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Approvati</div>
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">In Corso</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Critici</div>
                <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Costo Totale</div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalCost)}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">Progresso Medio</div>
                <div className="text-2xl font-bold text-indigo-600">{stats.avgProgress}%</div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Azioni Rapide</h3>
                <div className="space-y-3">
                  <Button variant="primary" fullWidth>
                    🆕 Nuovo Permesso
                  </Button>
                  <Button variant="outline" fullWidth>
                    📊 Genera Report Compliance
                  </Button>
                  <Button variant="outline" fullWidth>
                    📅 Programma Sopralluogo
                  </Button>
                  <Button variant="outline" fullWidth>
                    🔄 Aggiorna Timeline Progetto
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Permessi per Categoria</h3>
                <div className="space-y-3">
                  {['URBANISTICO', 'AMBIENTALE', 'SICUREZZA', 'ENERGETICO'].map((category) => {
                    const count = permits.filter(p => p.category === category).length;
                    const percentage = permits.length > 0 ? (count / permits.length) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Critical Alerts Preview */}
            {alerts.filter(a => a.severity === 'HIGH').length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-3">🚨 Alert Critici</h3>
                <div className="space-y-2">
                  {alerts.filter(a => a.severity === 'HIGH').slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">{alert.title}</p>
                        <p className="text-sm text-red-700">{alert.actionRequired}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('alerts')}>
                    Vedi tutti gli alert →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Permits Tab */}
        {activeTab === 'permits' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'URBANISTICO', 'AMBIENTALE', 'SICUREZZA', 'ENERGETICO', 'COMMERCIALE'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    selectedFilter === filter
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'ALL' ? 'Tutti' : filter}
                </button>
              ))}
            </div>

            {/* Permits List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                filteredPermits.map((permit) => (
                  <div key={permit.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{permit.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                            {permit.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(permit.priority)}`}>
                            {permit.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Autorità:</strong> {permit.authority}</p>
                          <p><strong>Scadenza:</strong> {formatDate(permit.requiredBy)} 
                            <span className={`ml-2 ${getDaysUntil(permit.requiredBy) < 30 ? 'text-red-600' : 'text-gray-500'}`}>
                              ({getDaysUntil(permit.requiredBy)} giorni)
                            </span>
                          </p>
                          <p><strong>Costo:</strong> {formatCurrency(permit.cost)}</p>
                          <p><strong>Responsabile:</strong> {permit.assignedTo || 'Non assegnato'}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{permit.progress}%</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${permit.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">{permit.currentStep}</div>
                      </div>
                    </div>

                    {permit.dependencies.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">Dipendenze: </span>
                        <span className="text-sm text-gray-600">{permit.dependencies.join(', ')}</span>
                      </div>
                    )}

                    {permit.aiRecommendations && permit.aiRecommendations.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">🤖 Raccomandazioni AI:</h5>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {permit.aiRecommendations.map((rec, idx) => (
                            <li key={idx}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex space-x-3">
                      <Button variant="primary" size="sm">
                        Dettagli
                      </Button>
                      <Button variant="outline" size="sm">
                        Aggiorna Stato
                      </Button>
                      {permit.status === 'NON_RICHIESTO' && (
                        <Button variant="outline" size="sm">
                          Avvia Pratica
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">📅 Timeline Permessi</h3>
            
            <div className="space-y-6">
              {permits.map((permit, idx) => (
                <div key={permit.id} className="relative">
                  {idx !== permits.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      permit.status === 'APPROVATO' ? 'bg-green-100 text-green-600' :
                      permit.status === 'IN_ESAME' ? 'bg-blue-100 text-blue-600' :
                      permit.status === 'IN_PREPARAZIONE' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {permit.status === 'APPROVATO' ? '✓' : 
                       permit.status === 'IN_ESAME' ? '⏳' :
                       permit.status === 'IN_PREPARAZIONE' ? '📝' : '○'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{permit.name}</h4>
                        <span className="text-sm text-gray-500">{formatDate(permit.requiredBy)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{permit.currentStep}</p>
                      
                      <div className="mt-2 flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${permit.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{permit.progress}%</span>
                        </div>
                        
                        <span className="text-xs text-gray-500">
                          {permit.assignedTo || 'Non assegnato'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">🚨 Alert & Notifiche</h3>
              <Button variant="outline" size="sm">
                Segna tutti come letti
              </Button>
            </div>

            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-yellow-800">Azione richiesta:</p>
                      <p className="text-sm text-yellow-700">{alert.actionRequired}</p>
                      {alert.deadline && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Scadenza: {formatDate(alert.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button variant="primary" size="sm">
                    Gestisci
                  </Button>
                  <Button variant="outline" size="sm">
                    Posticipa
                  </Button>
                  <Button variant="ghost" size="sm">
                    Segna come letto
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 