'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import {
  BuildingIcon,
  TrendingUpIcon,
  ClockIcon,
  AlertTriangleIcon,
  EuroIcon,
  DocumentIcon,
  PlusIcon,
  ChartBarIcon,
  CalendarIcon,
  RocketIcon,
  CheckCircleIcon,
  XIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  UploadIcon,
  ShieldIcon,
  GlobeIcon,
  ZapIcon,
} from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  permitsService,
  Permit,
  PermitType,
  ComplianceReport,
  InspectionSchedule,
} from '@/lib/permitsService';

export default function PermessiCompliancePage() {
  // CHIRURGICO: Protezione ultra-sicura per evitare crash auth destructuring
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('❌ [PermessiCompliance] Errore useAuth:', error);
    authContext = { currentUser: null, loading: false };
  }
  const user = (authContext && typeof authContext === 'object' && 'currentUser' in authContext) ? authContext.currentUser : null;
  const [activeTab, setActiveTab] = useState<'overview' | 'permessi' | 'timeline' | 'alert'>(
    'overview'
  );

  // Stati principali
  const [permits, setPermits] = useState<Permit[]>([]);
  const [permitTypes, setPermitTypes] = useState<PermitType[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stati per modali e azioni
  const [showNewPermitModal, setShowNewPermitModal] = useState(false);
  const [showComplianceReportModal, setShowComplianceReportModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  // Stati per nuovo permesso
  const [newPermitData, setNewPermitData] = useState({
    projectId: '',
    projectName: '',
    permitTypeId: '',
    estimatedApprovalTime: 90,
    estimatedCost: 0,
    documents: [] as any[],
    notes: '',
  });

  // Stati per progetti disponibili
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Inizializza i tipi di permesso se non esistono
      await permitsService.initializePermitTypes();

      // Carica dati in parallelo
      const [userPermits, allPermitTypes, permitsStats] = await Promise.all([
        permitsService.getUserPermits(user?.uid || 'demo-user'),
        permitsService.getAllPermitTypes(),
        permitsService.getPermitsStats(user?.uid),
      ]);

      setPermits(userPermits);
      setPermitTypes(allPermitTypes);
      setStats(permitsStats);

      // Simula progetti disponibili (in produzione verrebbero da un servizio progetti)
      setAvailableProjects([
        { id: 'project-1', name: 'Villa Moderna Roma', location: 'Roma, Italia' },
        { id: 'project-2', name: 'Appartamento Centro Milano', location: 'Milano, Italia' },
        { id: 'project-3', name: 'Uffici Commerciali Torino', location: 'Torino, Italia' },
      ]);

      console.log('✅ [Permessi] Dati caricati:', {
        permits: userPermits.length,
        types: allPermitTypes.length,
        stats: permitsStats,
      });
    } catch (error) {
      console.error('❌ [Permessi] Errore caricamento dati:', error);
      setError('Impossibile caricare i dati dei permessi');
    } finally {
      setLoading(false);
    }
  };

  const createNewPermit = async () => {
    try {
      if (!newPermitData.projectId || !newPermitData.permitTypeId) {
        toast('❌ Compila tutti i campi obbligatori', { icon: '❌' });
        return;
      }

      const permitId = await permitsService.createPermit(newPermitData as any);
      console.log('✅ [Permessi] Nuovo permesso creato:', permitId);

      toast('✅ Permesso creato con successo!', { icon: '✅' });
      setShowNewPermitModal(false);

      // Reset form e ricarica dati
      setNewPermitData({
        projectId: '',
        projectName: '',
        permitTypeId: '',
        estimatedApprovalTime: 90,
        estimatedCost: 0,
        documents: [],
        notes: '',
      });

      await loadData();
    } catch (error) {
      console.error('❌ [Permessi] Errore creazione permesso:', error);
      toast('❌ Errore durante la creazione del permesso', { icon: '❌' });
    }
  };

  const generateComplianceReport = async () => {
    try {
      if (!newPermitData.projectId) {
        toast('❌ Seleziona un progetto per generare il report', { icon: '❌' });
        return;
      }

      const report = await permitsService.generateComplianceReport(newPermitData.projectId);
      console.log('✅ [Permessi] Report compliance generato:', report.id);

      toast('✅ Report compliance generato con successo!', { icon: '✅' });
      setShowComplianceReportModal(false);
    } catch (error) {
      console.error('❌ [Permessi] Errore generazione report:', error);
      toast('❌ Errore durante la generazione del report', { icon: '❌' });
    }
  };

  const scheduleInspection = async () => {
    try {
      if (!newPermitData.projectId || !newPermitData.permitTypeId) {
        toast('❌ Seleziona progetto e tipo permesso', { icon: '❌' });
        return;
      }

      const project = availableProjects.find(p => p.id === newPermitData.projectId);
      const permitType = permitTypes.find(t => t.id === newPermitData.permitTypeId);

      if (!project || !permitType) {
        toast('❌ Dati progetto o permesso non validi', { icon: '❌' });
        return;
      }

      const inspectionData = {
        projectId: newPermitData.projectId,
        projectName: project.name,
        permitId: 'new-permit', // Verrà aggiornato quando il permesso sarà creato
        permitType: permitType.name,
        inspectionType: 'PRELIMINARY' as const,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni da oggi
        estimatedDuration: 2,
        inspector: 'Ispettore Tecnico',
        location: project.location,
        requirements: ['Documentazione progetto', 'Planimetrie', 'Relazione tecnica'],
        notes: ['Sopralluogo preliminare per valutazione conformità'],
      };

      const inspectionId = await permitsService.scheduleInspection(inspectionData);
      console.log('✅ [Permessi] Sopralluogo programmato:', inspectionId);

      toast('✅ Sopralluogo programmato con successo!', { icon: '✅' });
      setShowInspectionModal(false);
    } catch (error) {
      console.error('❌ [Permessi] Errore programmazione sopralluogo:', error);
      toast('❌ Errore durante la programmazione del sopralluogo', { icon: '❌' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-orange-100 text-orange-800';
      case 'EXTENDED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <DashboardLayout title="Permessi & Compliance">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento sistema permessi...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Permessi & Compliance">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600 text-xl">❌ {error}</div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Riprova
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Permessi & Compliance">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema Permessi Intelligente</h1>
            <p className="text-gray-600 mt-2">
              AI-powered compliance tracking e gestione autorizzazioni
            </p>
          </div>

          {/* Azioni principali */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewPermitModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2 inline" />
              Nuovo Permesso
            </button>

            <button
              onClick={() => setShowComplianceReportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ChartBarIcon className="h-4 w-4 mr-2 inline" />
              Report Compliance
            </button>

            <button
              onClick={() => setShowInspectionModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <CalendarIcon className="h-4 w-4 mr-2 inline" />
              Sopralluogo
            </button>
          </div>
        </div>

        {/* Tabs di navigazione */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <BuildingIcon className="h-4 w-4" /> },
              { id: 'permessi', label: 'Permessi', icon: <DocumentIcon className="h-4 w-4" /> },
              { id: 'timeline', label: 'Timeline', icon: <ClockIcon className="h-4 w-4" /> },
              { id: 'alert', label: 'Alert', icon: <AlertTriangleIcon className="h-4 w-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenuto tab Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metriche chiave */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Totale Permessi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Approvati</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.byStatus?.APPROVED || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">In Corso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats?.byStatus?.SUBMITTED || 0) + (stats?.byStatus?.UNDER_REVIEW || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Critici</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.criticalAlerts || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <EuroIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Costo Totale</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.totalCost || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUpIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Progresso Medio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.averageProgress || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sezione Nuovo Permesso */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <RocketIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Nuovo Permesso</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Crea un nuovo permesso per il tuo progetto. Il sistema ti guiderà attraverso tutti i
                passaggi necessari.
              </p>
              <button
                onClick={() => setShowNewPermitModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                NEW Nuovo Permesso
              </button>
            </div>

            {/* Azioni rapide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowComplianceReportModal(true)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <ChartBarIcon className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">Genera Report Compliance</h4>
                <p className="text-sm text-gray-600">
                  Analisi completa della conformità del progetto
                </p>
              </button>

              <button
                onClick={() => setShowInspectionModal(true)}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <CalendarIcon className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">Programma Sopralluogo</h4>
                <p className="text-sm text-gray-600">Organizza ispezioni tecniche e sopralluoghi</p>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <ClockIcon className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">Aggiorna Timeline Progetto</h4>
                <p className="text-sm text-gray-600">Gestisci scadenze e tempistiche permessi</p>
              </button>
            </div>

            {/* Progresso per categoria */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progresso per Categoria</h3>
              <div className="space-y-4">
                {[
                  'URBANISTICO',
                  'AMBIENTALE',
                  'SICUREZZA',
                  'ENERGETICO',
                  'STRUTTURALE',
                  'ANTINCENDIO',
                ].map(category => {
                  const categoryPermits = permits.filter(p => p.permitType.category === category);
                  const avgProgress =
                    categoryPermits.length > 0
                      ? Math.round(
                          categoryPermits.reduce((total, p) => total + p.progress, 0) /
                            categoryPermits.length
                        )
                      : 0;

                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700 w-24">{category}</span>
                        <span className="text-xs text-gray-500">({categoryPermits.length})</span>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${avgProgress}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-16 text-right">
                        {avgProgress}% Progresso Medio
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alert critici */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-red-800">! Alert Critici</h3>
              </div>

              {stats?.criticalAlerts > 0 || stats?.expiringSoon > 0 ? (
                <ul className="space-y-2 text-red-700">
                  {stats?.expiringSoon > 0 && (
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>
                        <strong>Scadenza Permesso di Costruire:</strong> Presentare richiesta
                        proroga entro 10 giorni
                      </span>
                    </li>
                  )}
                  {stats?.criticalAlerts > 0 && (
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>
                        <strong>Ritardo VIA:</strong> Accelerare raccolta documentazione mancante
                      </span>
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-red-600">Nessun alert critico al momento</p>
              )}

              <button
                onClick={() => setActiveTab('alert')}
                className="mt-4 text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Vedi tutti gli alert →
              </button>
            </div>
          </div>
        )}

        {/* Contenuto tab Permessi */}
        {activeTab === 'permessi' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Gestione Permessi</h3>
              <button
                onClick={() => setShowNewPermitModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2 inline" />
                Nuovo Permesso
              </button>
            </div>

            {permits.length === 0 ? (
              <div className="text-center py-12">
                <DocumentIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nessun permesso trovato</h3>
                <p className="text-gray-500 mb-4">Crea il tuo primo permesso per iniziare</p>
                <button
                  onClick={() => setShowNewPermitModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2 inline" />
                  Crea Primo Permesso
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progetto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progresso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rischio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Costo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Azioni
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {permits.map(permit => (
                        <tr key={permit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {permit.projectName}
                              </div>
                              <div className="text-sm text-gray-500">ID: {permit.projectId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {permit.permitType.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {permit.permitType.category}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(permit.status)}`}
                            >
                              {permit.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 w-20">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${permit.progress}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600 w-12">
                                {permit.progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(permit.riskLevel)}`}
                            >
                              {permit.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(permit.cost.estimated)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedPermit(permit)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contenuto tab Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Timeline Progetto</h3>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {permits.map(permit => (
                  <div key={permit.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{permit.permitType.name}</h4>
                        <p className="text-sm text-gray-600">{permit.projectName}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(permit.status)}`}
                      >
                        {permit.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>⏱️ {permit.estimatedApprovalTime} giorni stimati</span>
                        <span>📅 {permit.createdAt ? formatDate(permit.createdAt) : 'N/A'}</span>
                        <span>💰 {formatCurrency(permit.cost.estimated)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contenuto tab Alert */}
        {activeTab === 'alert' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Sistema di Alert</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alert critici */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <AlertTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                  <h4 className="text-lg font-medium text-red-800">Alert Critici</h4>
                </div>
                <div className="space-y-2">
                  {permits
                    .filter(p => p.riskLevel === 'CRITICAL')
                    .map(permit => (
                      <div key={permit.id} className="text-red-700 text-sm">
                        • <strong>{permit.permitType.name}:</strong> Rischio critico - Intervento
                        immediato richiesto
                      </div>
                    ))}
                  {permits.filter(p => p.riskLevel === 'CRITICAL').length === 0 && (
                    <p className="text-red-600">Nessun alert critico al momento</p>
                  )}
                </div>
              </div>

              {/* Permessi in scadenza */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <ClockIcon className="h-6 w-6 text-orange-600 mr-2" />
                  <h4 className="text-lg font-medium text-orange-800">Scadenze Prossime</h4>
                </div>
                <div className="space-y-2">
                  {permits
                    .filter(
                      p =>
                        p.expiryDate &&
                        p.expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
                    )
                    .map(permit => (
                      <div key={permit.id} className="text-orange-700 text-sm">
                        • <strong>{permit.permitType.name}:</strong> Scade il{' '}
                        {permit.expiryDate ? formatDate(permit.expiryDate) : 'N/A'}
                      </div>
                    ))}
                  {permits.filter(
                    p =>
                      p.expiryDate && p.expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
                  ).length === 0 && <p className="text-orange-600">Nessuna scadenza prossima</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Nuovo Permesso */}
        {showNewPermitModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nuovo Permesso</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progetto</label>
                    <select
                      value={newPermitData.projectId}
                      onChange={e => {
                        const project = availableProjects.find(p => p.id === e.target.value);
                        setNewPermitData(prev => ({
                          ...prev,
                          projectId: e.target.value,
                          projectName: project?.name || '',
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona progetto</option>
                      {availableProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} - {project.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Permesso
                    </label>
                    <select
                      value={newPermitData.permitTypeId}
                      onChange={e => {
                        const permitType = permitTypes.find(t => t.id === e.target.value);
                        setNewPermitData(prev => ({
                          ...prev,
                          permitTypeId: e.target.value,
                          estimatedCost: permitType?.estimatedCost || 0,
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona tipo</option>
                      {permitTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempo Approvazione Stimato (giorni)
                    </label>
                    <input
                      type="number"
                      value={newPermitData.estimatedApprovalTime}
                      onChange={e =>
                        setNewPermitData(prev => ({
                          ...prev,
                          estimatedApprovalTime: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo Stimato (€)
                    </label>
                    <input
                      type="number"
                      value={newPermitData.estimatedCost}
                      onChange={e =>
                        setNewPermitData(prev => ({
                          ...prev,
                          estimatedCost: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      value={newPermitData.notes}
                      onChange={e =>
                        setNewPermitData(prev => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewPermitModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={createNewPermit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crea Permesso
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Report Compliance */}
        {showComplianceReportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Genera Report Compliance</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progetto</label>
                    <select
                      value={newPermitData.projectId}
                      onChange={e =>
                        setNewPermitData(prev => ({
                          ...prev,
                          projectId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona progetto</option>
                      {availableProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} - {project.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowComplianceReportModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={generateComplianceReport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Genera Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Sopralluogo */}
        {showInspectionModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Programma Sopralluogo</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Progetto</label>
                    <select
                      value={newPermitData.projectId}
                      onChange={e =>
                        setNewPermitData(prev => ({
                          ...prev,
                          projectId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona progetto</option>
                      {availableProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} - {project.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo Permesso
                    </label>
                    <select
                      value={newPermitData.permitTypeId}
                      onChange={e =>
                        setNewPermitData(prev => ({
                          ...prev,
                          permitTypeId: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona tipo</option>
                      {permitTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowInspectionModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={scheduleInspection}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Programma
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
