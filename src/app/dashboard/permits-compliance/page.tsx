'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Plus,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  CreditCard,
  Calendar,
  Target,
  Building,
  Bot,
  Sparkles,
  Settings,
} from 'lucide-react';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import DashboardLayout from '@/components/layout/DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================

interface Permit {
  id: string;
  name: string;
  type: 'building' | 'environmental' | 'safety' | 'zoning';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  applicationDate: string;
  expiryDate?: string;
  cost: number;
  progress: number;
  documents: string[];
  requirements: string[];
  notes?: string;
}

interface ComplianceCheck {
  id: string;
  name: string;
  category: 'safety' | 'environmental' | 'legal' | 'financial';
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  lastCheck: string;
  nextCheck: string;
  responsible: string;
  notes?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PermitsCompliancePage() {
  const [activeTab, setActiveTab] = useState<'permits' | 'compliance' | 'reports'>('permits');
  const [permits, setPermits] = useState<Permit[]>([]);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock permits data
      const mockPermits: Permit[] = [
        {
          id: '1',
          name: 'Permesso di Costruire',
          type: 'building',
          status: 'approved',
          priority: 'high',
          applicationDate: '2024-01-15',
          expiryDate: '2025-01-15',
          cost: 2500,
          progress: 100,
          documents: ['domanda.pdf', 'planimetrie.pdf', 'relazione_tecnica.pdf'],
          requirements: ['Planimetrie', 'Relazione Tecnica', 'Certificato Agibilità'],
        },
        {
          id: '2',
          name: 'Autorizzazione Ambientale',
          type: 'environmental',
          status: 'pending',
          priority: 'critical',
          applicationDate: '2024-01-20',
          cost: 1800,
          progress: 60,
          documents: ['domanda_ambientale.pdf', 'valutazione_impatto.pdf'],
          requirements: ['Valutazione Impatto Ambientale', 'Piano di Monitoraggio'],
        },
        {
          id: '3',
          name: 'Certificato Agibilità',
          type: 'safety',
          status: 'pending',
          priority: 'medium',
          applicationDate: '2024-02-01',
          cost: 1200,
          progress: 30,
          documents: ['domanda_agibilita.pdf'],
          requirements: ['Collaudo Statico', 'Certificato Prevenzione Incendi'],
        },
        {
          id: '4',
          name: 'Variante Urbanistica',
          type: 'zoning',
          status: 'rejected',
          priority: 'high',
          applicationDate: '2024-01-10',
          cost: 3000,
          progress: 0,
          documents: ['domanda_variante.pdf', 'studio_impatto.pdf'],
          requirements: ['Studio Impatto Ambientale', 'Parere Soprintendenza'],
          notes: 'Rigettato per mancanza documentazione paesaggistica',
        },
      ];

      // Mock compliance data
      const mockCompliance: ComplianceCheck[] = [
        {
          id: '1',
          name: 'Sicurezza Antincendio',
          category: 'safety',
          status: 'compliant',
          lastCheck: '2024-01-15',
          nextCheck: '2024-07-15',
          responsible: 'Mario Rossi',
        },
        {
          id: '2',
          name: 'Emissioni Atmosferiche',
          category: 'environmental',
          status: 'non_compliant',
          lastCheck: '2024-01-10',
          nextCheck: '2024-02-10',
          responsible: 'Giulia Bianchi',
          notes: 'Superamento limiti NOx - richiesta installazione filtro',
        },
        {
          id: '3',
          name: 'Conformità Urbanistica',
          category: 'legal',
          status: 'pending',
          lastCheck: '2024-01-05',
          nextCheck: '2024-03-05',
          responsible: 'Luca Verdi',
        },
        {
          id: '4',
          name: 'Bilancio Ambientale',
          category: 'financial',
          status: 'not_applicable',
          lastCheck: '2024-01-01',
          nextCheck: '2024-12-31',
          responsible: 'Anna Neri',
        },
      ];

      setPermits(mockPermits);
      setComplianceChecks(mockCompliance);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      expired: 'text-gray-600 bg-gray-100',
      compliant: 'text-green-600 bg-green-100',
      non_compliant: 'text-red-600 bg-red-100',
      not_applicable: 'text-gray-600 bg-gray-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'In Attesa',
      approved: 'Approvato',
      rejected: 'Rigettato',
      expired: 'Scaduto',
      compliant: 'Conforme',
      non_compliant: 'Non Conforme',
      not_applicable: 'N/A',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Bassa',
      medium: 'Media',
      high: 'Alta',
      critical: 'Critica',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      building: 'Edilizio',
      environmental: 'Ambientale',
      safety: 'Sicurezza',
      zoning: 'Urbanistico',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || permit.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout title="Permessi & Compliance">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Permessi & Compliance">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    Permessi & Compliance
                  </h1>
              <p className="text-gray-600 mt-2">
                Gestisci permessi edilizi e verifiche di conformità
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('permits')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'permits'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Permessi
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'compliance'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compliance
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'reports'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Report
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cerca permessi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tutti gli Stati</option>
                <option value="pending">In Attesa</option>
                <option value="approved">Approvato</option>
                <option value="rejected">Rigettato</option>
                <option value="expired">Scaduto</option>
              </select>
            </div>

            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Permesso
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'permits' && (
            <div className="space-y-4">
              {filteredPermits.map((permit) => (
                <div key={permit.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{permit.name}</h3>
                        <span className="text-sm text-gray-500">{getTypeLabel(permit.type)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Richiesta</p>
                          <p className="font-medium">{formatDate(permit.applicationDate)}</p>
                        </div>
                        {permit.expiryDate && (
                          <div>
                            <p className="text-sm text-gray-500">Scadenza</p>
                            <p className="font-medium">{formatDate(permit.expiryDate)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Costo</p>
                          <p className="font-medium">{formatCurrency(permit.cost)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Progresso</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${permit.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{permit.progress}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                          {getStatusLabel(permit.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(permit.priority)}`}>
                          {getPriorityLabel(permit.priority)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {permit.requirements.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {req}
                          </span>
                        ))}
                      </div>

                      {permit.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-sm text-yellow-800">{permit.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="space-y-4">
              {complianceChecks.map((check) => (
                <div key={check.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900">{check.name}</h3>
                        <span className="text-sm text-gray-500 capitalize">{check.category}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Ultimo Controllo</p>
                          <p className="font-medium">{formatDate(check.lastCheck)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Prossimo Controllo</p>
                          <p className="font-medium">{formatDate(check.nextCheck)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Responsabile</p>
                          <p className="font-medium">{check.responsible}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {getStatusLabel(check.status)}
                        </span>
                      </div>

                      {check.notes && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-sm text-red-800">{check.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        Gestisci
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Compliance</h3>
              <p className="text-gray-600">I report di compliance saranno disponibili a breve.</p>
            </div>
          )}
        </div>
      </div>

      <FeedbackWidget />
    </DashboardLayout>
  );
}