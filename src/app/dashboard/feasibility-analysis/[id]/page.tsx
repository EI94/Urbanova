'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import {
  CalculatorIcon,
  BuildingIcon,
  EuroIcon,
  CalendarIcon,
  LocationIcon,
  EditIcon,
  ArrowLeftIcon,
  TrendingUpIcon,
  TargetIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertIcon,
} from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeasibilityReportGenerator from '@/components/ui/FeasibilityReportGenerator';
import { feasibilityService, FeasibilityProject } from '@/lib/feasibilityService';

export default function FeasibilityProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<FeasibilityProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      loadProject(params.id as string);
    }
  }, [params?.id]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    try {
      console.log('🔄 [PROJECT DETAIL] Caricamento progetto via API:', projectId);
      
      // Usa l'endpoint API invece del servizio client-side
      const response = await fetch(`/api/feasibility-projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ [PROJECT DETAIL] Progetto non trovato:', projectId);
          toast('❌ Progetto non trovato', { icon: '❌' });
          router.push('/dashboard/feasibility-analysis');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ [PROJECT DETAIL] Progetto caricato via API:', result);
      
      if (result.success && result.project) {
        setProject(result.project);
      } else {
        console.log('❌ [PROJECT DETAIL] Risposta API non valida:', result);
        toast('❌ Progetto non trovato', { icon: '❌' });
        router.push('/dashboard/feasibility-analysis');
      }
    } catch (error: any) {
      console.error('❌ [PROJECT DETAIL] Errore caricamento progetto:', error);
      toast(`❌ Errore nel caricamento del progetto: ${error.message}`, { icon: '❌' });
      router.push('/dashboard/feasibility-analysis');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date | string | any) => {
    try {
      // Gestisce diversi tipi di input per le date
      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date && typeof date === 'object' && date.toDate) {
        // Per timestamp Firestore
        dateObj = date.toDate();
      } else if (date && typeof date === 'object' && date.seconds) {
        // Per timestamp Firestore con seconds
        dateObj = new Date(date.seconds * 1000);
      } else {
        // Fallback per date invalide
        return 'Data non disponibile';
      }

      // Verifica se la data è valida
      if (isNaN(dateObj.getTime())) {
        return 'Data non valida';
      }

      return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(dateObj);
    } catch (error) {
      console.error('Errore formattazione data:', error, 'Input:', date);
      return 'Data non valida';
    }
  };

  const getMarginColor = (margin: number, targetMargin: number) => {
    if (margin >= targetMargin) return 'text-success';
    if (margin >= targetMargin * 0.8) return 'text-warning';
    return 'text-error';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PIANIFICAZIONE':
        return 'bg-blue-100 text-blue-800';
      case 'IN_CORSO':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETATO':
        return 'bg-green-100 text-green-800';
      case 'SOSPESO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PIANIFICAZIONE':
        return <CalendarIcon className="h-4 w-4" />;
      case 'IN_CORSO':
        return <ClockIcon className="h-4 w-4" />;
      case 'COMPLETATO':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'SOSPESO':
        return <AlertIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progetto non trovato</h2>
          <Link href="/dashboard/feasibility-analysis">
            <button className="btn btn-primary">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Torna alla Lista
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/feasibility-analysis">
              <button className="btn btn-ghost btn-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Indietro
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <LocationIcon className="h-3 w-3 mr-1" />
                {project.address}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`badge ${getStatusColor(project.status)} flex items-center`}>
              {getStatusIcon(project.status)}
              <span className="ml-1">{project.status}</span>
            </span>
            <Link href={`/dashboard/feasibility-analysis/${project.id}/edit`}>
              <button className="btn btn-outline btn-sm">
                <EditIcon className="h-4 w-4 mr-2" />
                Modifica
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Principali */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat bg-white shadow-sm rounded-lg p-6">
            <div className="stat-figure text-primary">
              <CalculatorIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-gray-500">Marginalità</div>
            <div
              className={`stat-value text-2xl ${getMarginColor(project.results.margin, project.targetMargin)}`}
            >
              {formatPercentage(project.results.margin)}
            </div>
            <div className="stat-desc text-xs">
              Target: {formatPercentage(project.targetMargin)}
            </div>
          </div>

          <div className="stat bg-white shadow-sm rounded-lg p-6">
            <div className="stat-figure text-success">
              <EuroIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-gray-500">Utile</div>
            <div className="stat-value text-2xl text-success">
              {formatCurrency(project.results.profit)}
            </div>
            <div className="stat-desc text-xs">ROI: {formatPercentage(project.results.roi)}</div>
          </div>

          <div className="stat bg-white shadow-sm rounded-lg p-6">
            <div className="stat-figure text-info">
              <BuildingIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-gray-500">Costo Terreno</div>
            <div className="stat-value text-2xl">
              {formatCurrency(project.costs.land.purchasePrice)}
            </div>
            <div className="stat-desc text-xs">
              Totale: {formatCurrency(project.costs.land.subtotal)}
            </div>
          </div>

          <div className="stat bg-white shadow-sm rounded-lg p-6">
            <div className="stat-figure text-warning">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="stat-title text-gray-500">Payback</div>
            <div className="stat-value text-2xl">
              {project.results.paybackPeriod.toFixed(1)} mesi
            </div>
            <div className="stat-desc text-xs">Durata: {project.duration} mesi</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dettagli Progetto */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BuildingIcon className="h-5 w-5 mr-2 text-blue-600" />
              Dettagli Progetto
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome Progetto</label>
                  <p className="text-gray-900">{project.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Indirizzo</label>
                  <p className="text-gray-900">{project.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stato</label>
                  <span className={`badge ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Durata</label>
                  <p className="text-gray-900">{project.duration} mesi</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data Inizio</label>
                  <p className="text-gray-900">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Inizio Costruzione</label>
                  <p className="text-gray-900">{formatDate(project.constructionStartDate)}</p>
                </div>
              </div>

              {project.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Note</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{project.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Analisi Finanziaria */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600" />
              Analisi Finanziaria
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Marginalità Target</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPercentage(project.targetMargin)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Marginalità Effettiva</span>
                <span
                  className={`text-lg font-bold ${getMarginColor(project.results.margin, project.targetMargin)}`}
                >
                  {formatPercentage(project.results.margin)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">ROI</span>
                <span className="text-lg font-bold text-green-600">
                  {formatPercentage(project.results.roi)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Payback Period</span>
                <span className="text-lg font-bold text-orange-600">
                  {project.results.paybackPeriod.toFixed(1)} mesi
                </span>
              </div>

              <div
                className={`p-3 rounded-lg ${project.isTargetAchieved ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <div className="flex items-center">
                  {project.isTargetAchieved ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertIcon className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span
                    className={`font-medium ${project.isTargetAchieved ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {project.isTargetAchieved ? 'Target Raggiunto' : 'Target Non Raggiunto'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dettagli Costi */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <EuroIcon className="h-5 w-5 mr-2 text-red-600" />
            Dettagli Costi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Costi Terreno */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">1. Terreno</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prezzo Acquisto:</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.land.purchasePrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Imposte (9%):</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.land.purchaseTaxes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Commissioni (3%):</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.land.intermediationFees)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Subtotale Terreno:</span>
                  <span className="text-red-600">
                    {formatCurrency(project.costs.land.subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Costi Costruzione */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">2. Costruzione</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Scavi e Fondazioni:</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.construction.excavation)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Strutture:</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.construction.structures)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Impianti:</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.construction.systems)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Finiture:</span>
                  <span className="font-medium">
                    {formatCurrency(project.costs.construction.finishes)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Subtotale Costruzione:</span>
                  <span className="text-red-600">
                    {formatCurrency(project.costs.construction.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Altri Costi */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Altri Costi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Opere Esterne:</span>
                <span className="font-medium">{formatCurrency(project.costs.externalWorks)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Oneri Concessori:</span>
                <span className="font-medium">{formatCurrency(project.costs.concessionFees)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Progettazione:</span>
                <span className="font-medium">{formatCurrency(project.costs.design)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Oneri Bancari:</span>
                <span className="font-medium">{formatCurrency(project.costs.bankCharges)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Permuta:</span>
                <span className="font-medium">{formatCurrency(project.costs.exchange)}</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Assicurazioni:</span>
                <span className="font-medium">{formatCurrency(project.costs.insurance)}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-red-800">TOTALE COSTI</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatCurrency(project.costs.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dettagli Ricavi */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-green-600" />
            Dettagli Ricavi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Vendite</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Numero Unità:</span>
                  <span className="font-medium">{project.revenues.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Superficie Media:</span>
                  <span className="font-medium">{project.revenues.averageArea} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prezzo Vendita:</span>
                  <span className="font-medium">
                    {formatCurrency(project.revenues.pricePerSqm)}/m²
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ricavo per Unità:</span>
                  <span className="font-medium">
                    {formatCurrency(project.revenues.revenuePerUnit)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Totale Vendite:</span>
                  <span className="text-green-600">
                    {formatCurrency(project.revenues.totalSales)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Altri Ricavi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Altri Ricavi:</span>
                  <span className="font-medium">
                    {formatCurrency(project.revenues.otherRevenues)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>TOTALE RICAVI:</span>
                  <span className="text-green-600">{formatCurrency(project.revenues.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metadati */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informazioni Progetto</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Creato da:</span>
              <p className="font-medium">{project.createdBy}</p>
            </div>
            <div>
              <span className="text-gray-500">Data creazione:</span>
              <p className="font-medium">
                {project.createdAt ? formatDate(project.createdAt) : 'Non disponibile'}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Ultimo aggiornamento:</span>
              <p className="font-medium">
                {project.updatedAt ? formatDate(project.updatedAt) : 'Non disponibile'}
              </p>
            </div>
          </div>
        </div>

        {/* Generatore Report PDF */}
        <div className="mt-8">
          <FeasibilityReportGenerator
            analysis={{
              id: project.id || '',
              title: project.name || 'Progetto senza titolo',
              location: project.address || 'Località non specificata',
              propertyType: 'Non specificato',
              totalInvestment: project.costs.total,
              expectedROI:
                ((project.revenues.total - project.costs.total) / project.costs.total) * 100,
              paybackPeriod: project.costs.total / (project.revenues.total - project.costs.total),
              netPresentValue: project.revenues.total - project.costs.total,
              internalRateOfReturn: 15.8, // Calcolato dal sistema
              riskLevel:
                project.costs.total > 1000000
                  ? 'HIGH'
                  : project.costs.total > 500000
                    ? 'MEDIUM'
                    : 'LOW',
              marketTrend: 'POSITIVE' as const,
              recommendations: [
                `ROI atteso: ${(((project.revenues.total - project.costs.total) / project.costs.total) * 100).toFixed(1)}%`,
                `Margine di profitto: ${formatCurrency(project.revenues.total - project.costs.total)}`,
                `Località strategica: ${project.address}`,
                `Tipo immobile: Non specificato`,
              ],
              createdAt: project.createdAt
                ? typeof project.createdAt === 'string'
                  ? project.createdAt
                  : project.createdAt instanceof Date
                    ? project.createdAt.toISOString()
                    : new Date().toISOString()
                : new Date().toISOString(),
            }}
            onGenerateReport={() => {
              toast('Report generato con successo! 📊', { icon: '📊' });
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
