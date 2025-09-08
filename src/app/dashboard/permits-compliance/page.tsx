'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
          name: 'Certificato di Prevenzione Incendi',
          type: 'safety',
          status: 'pending',
          priority: 'high',
          applicationDate: '2024-01-18',
          cost: 1200,
          progress: 40,
          documents: ['domanda_vvf.pdf', 'progetto_antincendio.pdf'],
          requirements: ['Progetto Antincendio', 'Collaudo Impianti'],
        },
        {
          id: '4',
          name: 'Variante Urbanistica',
          type: 'zoning',
          status: 'rejected',
          priority: 'medium',
          applicationDate: '2023-12-10',
          cost: 3000,
        progress: 0,
          documents: ['domanda_variante.pdf'],
          requirements: ['Studio di Fattibilità', 'Piano Particolareggiato'],
          notes: 'Rigettata per mancanza di documentazione completa',
        },
      ];

      // Mock compliance checks data
      const mockCompliance: ComplianceCheck[] = [
        {
          id: '1',
          name: 'Controllo Sicurezza Lavoratori',
          category: 'safety',
          status: 'compliant',
          lastCheck: '2024-01-15',
          nextCheck: '2024-04-15',
          responsible: 'Mario Rossi',
        },
        {
          id: '2',
          name: 'Monitoraggio Emissioni',
          category: 'environmental',
          status: 'non_compliant',
          lastCheck: '2024-01-10',
          nextCheck: '2024-02-10',
          responsible: 'Giulia Bianchi',
          notes: 'Valori superiori ai limiti consentiti',
        },
        {
          id: '3',
          name: 'Verifica Documentazione Legale',
          category: 'legal',
          status: 'pending',
          lastCheck: '2023-12-20',
          nextCheck: '2024-01-20',
          responsible: 'Luca Verdi',
        },
        {
          id: '4',
          name: 'Controllo Contabilità',
          category: 'financial',
          status: 'compliant',
          lastCheck: '2024-01-05',
          nextCheck: '2024-04-05',
          responsible: 'Anna Neri',
        },
      ];

      setPermits(mockPermits);
      setComplianceChecks(mockCompliance);
    } catch (error) {
      console.error('Error loading permits and compliance data:', error);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                  <Shield className="w-5 h-5 text-white" />
                </div>
          <div>
                  <h1 className="text-xl font-semibold text-gray-900">Urbanova Dashboard</h1>
                  <p className="text-sm text-gray-500">Design Center & Project Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
                <Link
                  href="/dashboard"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
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
                  <FileText className="w-4 h-4 mr-3" />
                  Analisi Fattibilità
                </Link>
                <Link
                  href="/dashboard/design-center"
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100"
                >
                  <Target className="w-4 h-4 mr-3" />
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
                  className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors bg-blue-100 text-blue-700"
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
                  <Building className="w-4 h-4 mr-3" />
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
                  <FileText className="w-4 h-4 mr-3" />
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
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Marketing
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
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
          </div>

          {/* Content based on active tab */}
          {activeTab === 'permits' && (
            <div className="space-y-4">
              {filteredPermits.map(permit => (
                <div key={permit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{permit.name}</h3>
                        <p className="text-sm text-gray-600">{getTypeLabel(permit.type)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(permit.status)}`}>
                        {getStatusLabel(permit.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(permit.priority)}`}>
                        {getPriorityLabel(permit.priority)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Richiesta: {formatDate(permit.applicationDate)}
                      </span>
                    </div>
                    {permit.expiryDate && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Scadenza: {formatDate(permit.expiryDate)}
                        </span>
                </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Costo: {formatCurrency(permit.cost)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Progresso: {permit.progress}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${permit.progress}%` }}
                    ></div>
                </div>

                  {permit.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">{permit.notes}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {permit.requirements.map(requirement => (
                        <span key={requirement} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {requirement}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
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
              {complianceChecks.map(check => (
                <div key={check.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-gray-600" />
                      </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{check.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{check.category}</p>
                    </div>
                    </div>
                    
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                      {getStatusLabel(check.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Ultimo Controllo: {formatDate(check.lastCheck)}
                      </span>
                </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Prossimo: {formatDate(check.nextCheck)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Responsabile: {check.responsible}
                      </span>
                    </div>
                  </div>
                  
                  {check.notes && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{check.notes}</p>
                </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                        Esegui Controllo
                      </button>
                      <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                        Visualizza Dettagli
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Permessi Totali</h3>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{permits.length}</div>
                <p className="text-sm text-gray-600">Permessi registrati</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">In Attesa</h3>
                  <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {permits.filter(p => p.status === 'pending').length}
                </div>
                <p className="text-sm text-gray-600">Permessi in attesa di approvazione</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Approvati</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {permits.filter(p => p.status === 'approved').length}
                </div>
                <p className="text-sm text-gray-600">Permessi approvati</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Non Conformi</h3>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {complianceChecks.filter(c => c.status === 'non_compliant').length}
                      </div>
                <p className="text-sm text-gray-600">Controlli non conformi</p>
                    </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Costo Totale</h3>
                  <CreditCard className="w-5 h-5 text-purple-600" />
                      </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(permits.reduce((sum, p) => sum + p.cost, 0))}
                      </div>
                <p className="text-sm text-gray-600">Spesa totale permessi</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Conformità Media</h3>
                  <Shield className="w-5 h-5 text-green-600" />
            </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {Math.round((complianceChecks.filter(c => c.status === 'compliant').length / complianceChecks.length) * 100)}%
                    </div>
                <p className="text-sm text-gray-600">Livello di conformità</p>
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
