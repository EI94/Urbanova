'use client';

/**
 * 🏦 BUSINESS PLAN PAGE - JOHNNY IVE STYLE
 * 
 * UX Principles:
 * - Minimale ma potente
 * - Animazioni fluide e naturali
 * - Progressive disclosure
 * - Feedback immediato
 * - Zero friction
 * - Every interaction delights
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  FileText,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  Send,
  X,
  ChevronRight,
  Zap,
  Award,
  Play,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Info,
  Eye,
  Edit,
  Trash2,
  Star
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FeedbackWidget from '@/components/ui/FeedbackWidget';
import BusinessPlanForm from '@/components/business-plan/BusinessPlanForm';
import ScenarioComparison from '@/components/business-plan/ScenarioComparison';
import SensitivityAnalysis from '@/components/business-plan/SensitivityAnalysis';
import type { BusinessPlanInput, BusinessPlanOutput, ScenarioComparison as ScenarioComparisonType, SensitivityOutput } from '@/lib/businessPlanService';
import { businessPlanExportService } from '@/lib/businessPlanExportService';
import { toast } from 'react-hot-toast';

// State management type
type ViewMode = 'welcome' | 'list' | 'form' | 'results';
type ResultsTab = 'overview' | 'scenarios' | 'sensitivity' | 'cashflow' | 'levers';

// Utility function per formattare numeri
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.round(num).toString();
};

export default function BusinessPlanPage() {
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  
  // State principale
  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [resultsTab, setResultsTab] = useState<ResultsTab>('overview');
  
  // Dati Business Plan
  const [bpInput, setBpInput] = useState<BusinessPlanInput | null>(null);
  const [bpOutputs, setBpOutputs] = useState<BusinessPlanOutput[]>([]);
  const [comparison, setComparison] = useState<ScenarioComparisonType | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityOutput[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [feasibilityProjectId, setFeasibilityProjectId] = useState<string | null>(null);
  
  // Stato per salvataggio Business Plan
  const [isSaving, setIsSaving] = useState(false);
  const [savedBusinessPlanId, setSavedBusinessPlanId] = useState<string | null>(null);
  
  // Lista Business Plan salvati
  const [savedBusinessPlans, setSavedBusinessPlans] = useState<any[]>([]);
  const [isLoadingBusinessPlans, setIsLoadingBusinessPlans] = useState(false);
  
  
  // Stati per calcolo e errori
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Carica lista Business Plan salvati
  useEffect(() => {
    if (currentUser?.uid) {
      loadSavedBusinessPlans();
    }
  }, [currentUser]);

  // Pre-fill da Feasibility Analysis o Business Plan esistente
  useEffect(() => {
    const projectId = searchParams?.get('projectId');
    const fromFeasibility = searchParams?.get('fromFeasibility');
    const businessPlanId = searchParams?.get('businessPlanId');
    const mode = searchParams?.get('mode'); // 'view', 'edit'
    
    // Aspetta che l'utente sia autenticato prima di caricare i dati
    if (!currentUser?.uid) {
      console.log('⏳ [BusinessPlan] Aspetto autenticazione per caricamento dati...');
      return;
    }
    
    if (projectId && fromFeasibility === 'true') {
      console.log('📊 [BusinessPlan] Caricamento dati da Feasibility:', projectId);
      loadFromFeasibility(projectId);
    } else if (businessPlanId) {
      console.log('📋 [BusinessPlan] Caricamento Business Plan esistente:', businessPlanId, 'mode:', mode);
      loadExistingBusinessPlan(businessPlanId, mode);
    }
  }, [searchParams, currentUser]);
  
  /**
   * Carica lista Business Plan salvati
   */
  const loadSavedBusinessPlans = async () => {
    if (!currentUser?.uid) return;
    
    setIsLoadingBusinessPlans(true);
    try {
      console.log('📋 [BusinessPlan] Caricamento Business Plan salvati...');
      
      const response = await fetch(`/api/business-plan?userId=${currentUser.uid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Errore caricamento lista');
      }

      setSavedBusinessPlans(result.businessPlans || []);
      console.log(`✅ [BusinessPlan] Caricati ${result.businessPlans?.length || 0} Business Plan`);
      
    } catch (error: any) {
      console.error('❌ [BusinessPlan] Errore caricamento lista:', error);
      toast(`❌ Errore nel caricamento dei Business Plan: ${error.message}`);
    } finally {
      setIsLoadingBusinessPlans(false);
    }
  };

  /**
   * Elimina Business Plan
   */
  const deleteBusinessPlan = async (businessPlanId: string) => {
    if (!currentUser?.uid) return;
    
    if (!confirm('Sei sicuro di voler eliminare questo Business Plan?')) {
      return;
    }

    try {
      console.log('🗑️ [BusinessPlan] Eliminazione Business Plan:', businessPlanId);
      
      const response = await fetch(`/api/business-plan?id=${businessPlanId}&userId=${currentUser.uid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Errore eliminazione');
      }

      // Aggiorna la lista
      await loadSavedBusinessPlans();
      toast('✅ Business Plan eliminato con successo');
      
    } catch (error: any) {
      console.error('❌ [BusinessPlan] Errore eliminazione:', error);
      toast(`❌ Errore nell'eliminazione: ${error.message}`);
    }
  };

  /**
   * 📋 CARICA BUSINESS PLAN ESISTENTE
   */
  const loadExistingBusinessPlan = async (businessPlanId: string, mode: 'view' | 'edit' = 'view') => {
    try {
      console.log('📋 [BusinessPlan] Loading existing BP:', businessPlanId, 'mode:', mode);
      console.log('📋 [BusinessPlan] Current user:', currentUser?.uid);
      
      // Aspetta che l'utente sia autenticato
      if (!currentUser?.uid) {
        console.log('⏳ [BusinessPlan] Aspetto autenticazione utente...');
        // Aspetta fino a 5 secondi per l'autenticazione
        let attempts = 0;
        while (!currentUser?.uid && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!currentUser?.uid) {
          throw new Error('Utente non autenticato. Effettua il login per accedere ai Business Plan.');
        }
      }
      
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { getDoc, doc } = await import('firebase/firestore');
      
      const businessPlanDoc = doc(db, 'feasibilityProjects', businessPlanId);
      const docSnapshot = await getDoc(businessPlanDoc);
      
      if (!docSnapshot.exists()) {
        throw new Error('Business Plan non trovato');
      }
      
      const businessPlanData = docSnapshot.data();
      console.log('📋 [BusinessPlan] Business Plan data:', {
        userId: businessPlanData?.userId,
        currentUserId: currentUser?.uid,
        documentType: businessPlanData?.documentType,
        projectName: businessPlanData?.input?.projectName
      });
      
      // Verifica che appartenga all'utente corrente
      if (businessPlanData?.userId !== currentUser?.uid) {
        console.error('❌ [BusinessPlan] Autorizzazione fallita:', {
          businessPlanUserId: businessPlanData?.userId,
          currentUserId: currentUser?.uid,
          match: businessPlanData?.userId === currentUser?.uid
        });
        throw new Error('Non autorizzato ad accedere a questo Business Plan');
      }
      
      // Verifica che sia un Business Plan
      if (businessPlanData?.documentType !== 'BUSINESS_PLAN') {
        throw new Error('Documento non è un Business Plan');
      }
      
      console.log('📋 [BusinessPlan] Business Plan caricato con successo:', businessPlanData);
      
      // Carica i dati nel form
      setBpInput(businessPlanData.input);
      setBpOutputs(businessPlanData.outputs || []);
      setComparison(businessPlanData.comparison || null);
      setSensitivity(businessPlanData.sensitivity || []);
      setSelectedScenarioId(businessPlanData.outputs?.[0]?.scenarioId || '');
      setSavedBusinessPlanId(businessPlanId);
      
      // Imposta la modalità appropriata
      if (mode === 'edit') {
        setViewMode('form');
        toast('✅ Business Plan caricato per la modifica', { icon: '✏️' });
      } else {
        setViewMode('results');
        setResultsTab('overview');
        toast('✅ Business Plan caricato per la visualizzazione', { icon: '👁️' });
      }
      
      // Mostra messaggio informativo se creato da analisi di fattibilità
      if (businessPlanData.sourceFeasibilityId) {
        toast('ℹ️ Questo Business Plan è stato creato da un\'analisi di fattibilità ed è ora indipendente', { 
          icon: '🔗',
          duration: 5000 
        });
      }
      
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore caricamento BP esistente:', error);
      toast(`❌ Errore nel caricamento: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      // Torna alla welcome screen
      setViewMode('welcome');
    }
  };
  
  /**
   * Carica dati da progetto Feasibility Analysis
   */
  const loadFromFeasibility = async (projectId: string) => {
    try {
      console.log('📊 [BusinessPlan] Loading feasibility data for:', projectId);
      
      // Carica i dati del progetto di fattibilità
      const response = await fetch(`/api/feasibility-projects/${projectId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.project) {
        throw new Error('Progetto non trovato');
      }

      const feasibilityProject = result.project;
      console.log('📊 [BusinessPlan] Progetto caricato:', feasibilityProject);

      // Pre-popolare il form con i dati del progetto di fattibilità
      const businessPlanData: BusinessPlanInput = {
        projectName: feasibilityProject.name || '',
        location: feasibilityProject.address || '',
        type: 'RESIDENTIAL' as const,
        totalUnits: feasibilityProject.revenues?.units || 1,
        
        // Configurazione ricavi
        revenueConfig: {
          method: 'PER_UNIT',
          averagePrice: feasibilityProject.revenues?.pricePerSqm ? 
            feasibilityProject.revenues.pricePerSqm * (feasibilityProject.revenues.averageArea || 100) : 0,
          salesCommission: 3,
          discounts: 0,
          salesCalendar: [
            { period: 't1', units: Math.floor((feasibilityProject.revenues?.units || 1) / 2) },
            { period: 't2', units: Math.ceil((feasibilityProject.revenues?.units || 1) / 2) }
          ]
        },
        
        // Configurazione costi
        costConfig: {
          constructionMethod: 'PER_UNIT',
          constructionCostPerUnit: feasibilityProject.costs?.pricePerSqm ? 
            feasibilityProject.costs.pricePerSqm * (feasibilityProject.revenues?.averageArea || 100) : 0,
          contingency: feasibilityProject.costs?.contingency || 0,
          developmentCharges: {
            method: 'TOTAL',
            total: 0,
            breakdown: {
              urbanization: 0,
              utilities: 0,
              permits: 0,
              taxes: 0
            }
          },
          softCosts: {
            percentage: 8,
            breakdown: {
              permits: 2,
              design: 3,
              supervision: 1,
              safety: 1,
              insurance: 1,
              marketing: 2
            }
          }
        },
        
        // Configurazione finanza
        financeConfig: {
          discountRate: 12,
          debt: {
            enabled: false,
            amount: 0,
            interestRate: 4.5,
            term: 20,
            ltv: 0,
            dscr: 1.2,
            fees: 0,
            amortizationType: 'FRENCH'
          }
        },
        
        // Configurazione timing
        timingConfig: {
          constructionTimeline: [
            { phase: 'Fondazioni', period: 't0' },
            { phase: 'Struttura', period: 't1' },
            { phase: 'Finiture', period: 't2' }
          ],
          permitDelay: 6
        },
        
        // Target
        targets: {
          margin: feasibilityProject.targetMargin || 15,
          minimumDSCR: 1.2
        },
        
        // Scenari terreno
        landScenarios: [{
          id: 'default-scenario',
          name: 'Scenario Base',
          type: 'CASH' as const,
          upfrontPayment: feasibilityProject.costs?.land || 200000,
          description: 'Scenario Base dal progetto di fattibilità'
        }]
      };

      // Imposta i dati nel form
      setBpInput(businessPlanData);
      setFeasibilityProjectId(projectId);
      
      // Mostra il form pre-popolato
      setViewMode('form');
      
      toast('✅ Dati del progetto di fattibilità caricati nel Business Plan');
      toast('ℹ️ Il Business Plan sarà indipendente dall\'analisi di fattibilità originale', { 
        icon: '🔗',
        duration: 5000 
      });
      
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore caricamento feasibility:', error);
      toast('❌ Errore nel caricamento del progetto di fattibilità');
      // Mostra comunque il form vuoto
      setViewMode('form');
    }
  };
  
  /**
   * 🧹 SANITIZZA DATI PER FIRESTORE
   */
  const sanitizeForFirestore = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized;
  };

  /**
   * 💾 SALVA BUSINESS PLAN (CON SANITIZZAZIONE)
   */
  const saveBusinessPlan = async (isDraft: boolean = false) => {
    if (!currentUser?.uid) {
      toast('❌ Utente non autenticato');
      return;
    }
    
    // Per le bozze, permette il salvataggio anche con dati minimi
    if (!isDraft && !bpInput) {
      toast('❌ Dati mancanti per il salvataggio completo');
      return;
    }

    setIsSaving(true);
    try {
      console.log(`💾 [BusinessPlan] Salvataggio ${isDraft ? 'bozza' : 'completo'} Business Plan...`);
      
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      
      // Sanitizza i dati per rimuovere valori undefined
      const sanitizedInput = bpInput ? sanitizeForFirestore(bpInput) : {};
      const sanitizedOutputs = bpOutputs.length > 0 ? sanitizeForFirestore(bpOutputs) : [];
      
      // Per le bozze, crea dati minimi se bpInput è vuoto
      const projectName = sanitizedInput.projectName || 'Business Plan Bozza';
      const projectId = sanitizedInput.projectId || `bp_${Date.now()}`;
      
      const businessPlanData = {
        userId: currentUser.uid,
        projectId: projectId,
        projectName: projectName,
        input: sanitizedInput,
        outputs: sanitizedOutputs,
        documentType: 'BUSINESS_PLAN',
        isDraft: isDraft,
        status: isDraft ? 'draft' : 'completed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'feasibilityProjects'), businessPlanData);
      
      setSavedBusinessPlanId(docRef.id);
      
      // Aggiorna la lista dei Business Plan salvati
      await loadSavedBusinessPlans();
      
      if (isDraft) {
        toast('✅ Business Plan salvato come bozza! Puoi completarlo in seguito.', { icon: '📝' });
      } else {
        toast('✅ Business Plan salvato con successo!', { icon: '💾' });
      }
      
    } catch (error: any) {
      console.error('❌ [BusinessPlan] Errore salvataggio:', error);
      toast(`❌ Errore nel salvataggio: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 🚀 SALVA AUTOMATICAMENTE IN BOZZA
   */
  const autoSaveDraft = async (formData?: BusinessPlanInput) => {
    if (!currentUser?.uid) return;
    
    try {
      console.log('🔄 [BusinessPlan] Auto-salvataggio bozza...');
      
      // Usa i dati del form se forniti, altrimenti usa bpInput
      const dataToSave = formData || bpInput;
      
      // Aggiorna bpInput con i nuovi dati
      if (dataToSave) {
        setBpInput(dataToSave);
      }
      
      await saveBusinessPlan(true);
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore auto-salvataggio:', error);
    }
  };

  /**
   * 👁️ VISUALIZZA BUSINESS PLAN
   */
  const viewBusinessPlan = (businessPlanId: string) => {
    const url = `/dashboard/business-plan?businessPlanId=${businessPlanId}&mode=view`;
    window.open(url, '_blank');
  };

  /**
   * ✏️ MODIFICA BUSINESS PLAN
   */
  const editBusinessPlan = (businessPlanId: string) => {
    const url = `/dashboard/business-plan?businessPlanId=${businessPlanId}&mode=edit`;
    window.location.href = url;
  };

  /**
   * 📤 CONDIVIDI BUSINESS PLAN
   */
  const shareBusinessPlan = async (businessPlanId: string, businessPlanName: string) => {
    try {
      // Crea URL di condivisione
      const shareUrl = `${window.location.origin}/dashboard/business-plan?businessPlanId=${businessPlanId}&mode=view&shared=true`;
      
      // Copia negli appunti
      await navigator.clipboard.writeText(shareUrl);
      
      toast('✅ Link di condivisione copiato negli appunti!', { icon: '📋' });
      
      // Mostra modal di condivisione (opzionale)
      const shareData = {
        title: `Business Plan: ${businessPlanName}`,
        text: `Guarda questo Business Plan su Urbanova: ${businessPlanName}`,
        url: shareUrl
      };
      
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log('Condivisione nativa annullata');
        }
      }
      
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore condivisione:', error);
      toast('❌ Errore nella condivisione');
    }
  };
  
  /**
   * 🎯 CALCOLA BUSINESS PLAN
   */
  const calculateBusinessPlan = async (input: BusinessPlanInput) => {
    setIsCalculating(true);
    setError(null);
    
    try {
      console.log('📊 [BusinessPlan] Calcolo in corso...', input);
      
      const response = await fetch('/api/business-plan/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          userId: currentUser?.uid || 'anonymous',
          includeSensitivity: true,
          compareScenarios: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [BusinessPlan] Errore API:', errorData);
        
        // Gestisci errori di validazione con messaggi dettagliati
        if (errorData.details) {
          setError(`${errorData.error}: ${errorData.details}`);
          if (errorData.suggestion) {
            toast(`💡 Suggerimento: ${errorData.suggestion}`, { 
              icon: '💡',
              duration: 8000 
            });
          }
        } else {
          setError(errorData.error || `Errore HTTP ${response.status}`);
        }
        return;
      }
      
      const data = await response.json();
      
      console.log('✅ [BusinessPlan] Calcolo completato:', data);
      
      // Salva risultati
      setBpInput(input);
      setBpOutputs(data.outputs);
      setComparison(data.comparison);
      setSensitivity(data.sensitivity || []);
      setSelectedScenarioId(data.outputs[0]?.scenarioId || '');
      
      // Switch a view risultati
      setViewMode('results');
      setResultsTab('overview');
      
      // Reset stato salvataggio
      setSavedBusinessPlanId(null);
      
      // Auto-salva in bozza se ci sono risultati
      if (data.outputs && data.outputs.length > 0) {
        setTimeout(() => {
          autoSaveDraft();
        }, 1000); // Aspetta 1 secondo per permettere il rendering
      }
      
      toast('✅ Business Plan calcolato con successo!', { icon: '🎉' });
      
    } catch (err) {
      console.error('❌ [BusinessPlan] Errore:', err);
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      toast(`❌ Errore nel calcolo: ${errorMessage}`, { icon: '❌' });
    } finally {
      setIsCalculating(false);
    }
  };
  

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('it-IT', {
      maximumFractionDigits: 0 
    }).format(Math.round(num));
  };
  
  /**
   * 📄 EXPORT PDF
   */
  const handleExportPDF = async () => {
    if (!bpInput || bpOutputs.length === 0) return;
    
    try {
      console.log('📄 [Export] Generando PDF...');
      const pdfBlob = await businessPlanExportService.exportToPDF(bpInput, bpOutputs, comparison || undefined);
      businessPlanExportService.downloadFile(pdfBlob, `BusinessPlan_${bpInput.projectName}_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('✅ [Export] PDF scaricato con successo');
    } catch (error) {
      console.error('❌ [Export] Errore export PDF:', error);
      alert('Errore durante l\'export PDF');
    }
  };
  
  /**
   * 📊 EXPORT EXCEL
   */
  const handleExportExcel = async () => {
    if (!bpInput || bpOutputs.length === 0) return;
    
    try {
      console.log('📊 [Export] Generando Excel...');
      const csvDataUrl = await businessPlanExportService.exportToExcel(bpInput, bpOutputs);
      businessPlanExportService.downloadFile(csvDataUrl, `BusinessPlan_${bpInput.projectName}_${new Date().toISOString().split('T')[0]}.csv`);
      console.log('✅ [Export] Excel scaricato con successo');
    } catch (error) {
      console.error('❌ [Export] Errore export Excel:', error);
      alert('Errore durante l\'export Excel');
    }
  };

  // Ottieni scenario selezionato
  const selectedScenario = bpOutputs.find(s => s.scenarioId === selectedScenarioId);

  // Loading state per autenticazione quando si carica un BP esistente
  if (!currentUser && (searchParams?.get('businessPlanId') || searchParams?.get('projectId'))) {
    return (
      <DashboardLayout title="Business Plan">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifica autenticazione...</p>
            <p className="text-sm text-gray-500 mt-2">Caricamento dati Business Plan</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Business Plan">
        <div className="max-w-7xl mx-auto">
        
        {/* ============================================================================ */}
        {/* WELCOME SCREEN - MINIMALE E BELLISSIMO */}
        {/* ============================================================================ */}
        {viewMode === 'welcome' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Business Plan
                  </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Genera, valuta e spiega business plan immobiliari con VAN, TIR, DSCR e leve di negoziazione.
              <br />
              <span className="text-base text-gray-500 mt-2 block">Input in 3-5 minuti • Scenari multipli • Sensitivity automatica</span>
                <br />
                <span className="text-sm text-blue-600 mt-2 block flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Auto-salvataggio: i tuoi Business Plan vengono salvati automaticamente come bozze
                </span>
              </p>
            </div>

            {/* Lista Business Plan salvati */}
            {savedBusinessPlans.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mr-3" />
                    I tuoi Business Plan
                  </h2>
                  <span className="text-sm text-gray-500">
                    {savedBusinessPlans.length} Business Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedBusinessPlans.map((bp, index) => (
                    <div key={bp.id} className={`bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors ${index === 0 ? 'ring-2 ring-blue-200' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{bp.projectName}</h3>
                            {bp.isDraft && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                Bozza
                              </span>
                            )}
                            {index === 0 && (
                              <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                <Star className="w-3 h-3" />
                                <span>Più recente</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{bp.location}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{bp.totalUnits} unità</span>
                            <span>{bp.scenariosCount} scenari</span>
                            <span className={bp.isDraft ? 'text-yellow-600' : 'text-green-600'}>
                              {bp.isDraft ? 'In lavorazione' : 'Completato'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex space-x-1">
              <button
                              onClick={() => viewBusinessPlan(bp.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizza"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => editBusinessPlan(bp.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Modifica"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => shareBusinessPlan(bp.id, bp.projectName)}
                              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Condividi"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBusinessPlan(bp.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
          </div>

                          {/* Pulsante Crea Progetto */}
                          <Link
                            href={`/dashboard/progetti/nuovo?businessPlanId=${bp.id}&fromBusinessPlan=true`}
                            className="group relative px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-1 text-xs font-medium"
                            title="Crea Progetto da questo Business Plan"
                          >
                            <Plus className="w-3 h-3 transition-transform group-hover:scale-110" />
                            <span className="whitespace-nowrap">Crea Progetto</span>
                          </Link>
                        </div>
                      </div>
                      
                      {/* Metriche principali */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-green-600">€{formatNumber(bp.bestNPV)}</div>
                          <div className="text-gray-500">VAN</div>
                    </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{bp.bestIRR.toFixed(1)}%</div>
                          <div className="text-gray-500">TIR</div>
                  </div>
                        <div className="text-center">
                          <div className="font-medium text-purple-600">{bp.bestMargin.toFixed(1)}%</div>
                          <div className="text-gray-500">Margine</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA per creare nuovi Business Plan */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-gray-500 mb-6">
                <div className="h-px bg-gray-300 flex-1 w-24"></div>
                <span className="text-sm">Crea nuovo Business Plan</span>
                <div className="h-px bg-gray-300 flex-1 w-24"></div>
              </div>
            
              {/* CTA Cards - Centrata */}
              <div className="flex justify-center">
                {/* Form Mode - Centrato */}
              <button
                  onClick={() => setViewMode('form')}
                  className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-lg border-2 border-blue-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 hover:scale-105 max-w-md w-full"
              >
                  <div className="absolute top-6 right-6 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                
                <div className="text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Crea nuovo Business Plan</h3>
                  <p className="text-gray-600 mb-4">
                      Input guidato con defaults intelligenti. Tab organizzati per ricavi, costi, scenari terreno e finanza.
                  </p>
                  
                    <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                      <span>Inizia →</span>
                    </div>
                </div>
              </button>
                  </div>

            {/* Quick Example */}
              <div className="mt-12 max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-blue-600" />
                    </div>
                  <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">Come funziona:</div>
                      <p className="text-sm text-gray-600">
                        Compila il form guidato con i dati del tuo progetto immobiliare. L'OS 2.0 ti aiuterà con suggerimenti intelligenti e calcoli automatici per VAN, TIR e scenari multipli.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

        {/* ============================================================================ */}
        {/* FORM MODE */}
        {/* ============================================================================ */}
        {viewMode === 'form' && (
          <div className="animate-fade-in">
            {/* Breadcrumb elegante */}
            <div className="mb-6 flex items-center space-x-2 text-sm">
                    <button
                onClick={() => setViewMode('welcome')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                Business Plan
                    </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {savedBusinessPlanId ? (
                <>
                  <span className="text-gray-500">{bpInput?.projectName || 'Business Plan'}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">Modifica</span>
                </>
              ) : (
              <span className="text-gray-900 font-medium">Nuovo</span>
              )}
                </div>

            <BusinessPlanForm
              initialData={bpInput as Partial<BusinessPlanInput> | undefined}
              feasibilityProjectId={feasibilityProjectId || undefined}
              onSubmit={calculateBusinessPlan}
              onCancel={() => setViewMode('welcome')}
              loading={isCalculating}
              onAutoSave={autoSaveDraft}
                        />
                      </div>
        )}
        
        
        {/* ============================================================================ */}
        {/* RESULTS VIEW - METRICHE E SCENARI */}
        {/* ============================================================================ */}
        {viewMode === 'results' && bpOutputs.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {/* Header con breadcrumb e actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
              <button 
                onClick={() => setViewMode('welcome')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                  <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
                      <div>
                  <h1 className="text-3xl font-bold text-gray-900">{bpInput?.projectName}</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {bpInput?.location} • {bpOutputs.length} scenari analizzati
                    {savedBusinessPlanId && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Salvato
                      </span>
                    )}
                  </p>
                    </div>
                      </div>

              <div className="flex items-center space-x-3">
                {/* Pulsanti Salva Intelligenti */}
                {!savedBusinessPlanId ? (
                  <div className="flex items-center space-x-2">
                        <button
                      onClick={() => saveBusinessPlan(false)}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Salvataggio...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Salva Completo</span>
                        </>
                      )}
                  </button>

                  <button
                      onClick={() => saveBusinessPlan(true)}
                      disabled={isSaving}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:bg-gray-50 transition-colors flex items-center space-x-2 text-sm"
                  >
                      <FileText className="w-4 h-4" />
                      <span>Bozza</span>
                  </button>
                      </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Salvato</span>
                    </div>
                    
                <button 
                      onClick={() => saveBusinessPlan(false)}
                      disabled={isSaving}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 disabled:bg-blue-50 transition-colors flex items-center space-x-2 text-sm"
                >
                      <Download className="w-4 h-4" />
                      <span>Aggiorna</span>
                </button>
                </div>
                )}

                <button
                  onClick={() => setViewMode('form')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Modifica</span>
                </button>
                
                {savedBusinessPlanId && (
                  <button
                    onClick={() => shareBusinessPlan(savedBusinessPlanId, bpInput?.projectName || 'Business Plan')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Condividi</span>
                  </button>
                )}
                
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
                
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                      </div>
                    </div>

            {/* Tabs Premium - Apple Style */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2">
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'scenarios', label: 'Scenari', icon: TrendingUp },
                  { id: 'sensitivity', label: 'Sensitivity', icon: Zap },
                  { id: 'cashflow', label: 'Cash Flow', icon: DollarSign },
                  { id: 'levers', label: 'Leve', icon: Award }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = resultsTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setResultsTab(tab.id as ResultsTab)}
                      className={`
                        flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl
                        font-medium text-sm transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                  </div>
                      </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              {/* OVERVIEW TAB */}
              {resultsTab === 'overview' && selectedScenario && (
                <div className="space-y-6">
                  {/* Hero Metrics - Premium Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { 
                        label: 'VAN', 
                        value: formatNumber(selectedScenario.metrics.npv),
                        unit: '€',
                        color: 'from-green-500 to-emerald-600',
                        icon: TrendingUp,
                        explanation: selectedScenario.explanations['npv']
                      },
                      { 
                        label: 'TIR', 
                        value: selectedScenario.metrics.irr.toFixed(1),
                        unit: '%',
                        color: 'from-blue-500 to-cyan-600',
                        icon: BarChart3,
                        explanation: selectedScenario.explanations['irr']
                      },
                      { 
                        label: 'Margine', 
                        value: selectedScenario.summary.marginPercentage.toFixed(1),
                        unit: '%',
                        color: 'from-purple-500 to-pink-600',
                        icon: Award,
                        explanation: selectedScenario.explanations['margin']
                      },
                      { 
                        label: 'Payback', 
                        value: selectedScenario.metrics.payback.toFixed(1),
                        unit: 'anni',
                        color: 'from-orange-500 to-red-600',
                        icon: TrendingDown,
                        explanation: selectedScenario.explanations['payback']
                      }
                    ].map((metric, i) => {
                      const Icon = metric.icon;
                      
                      return (
                        <div 
                          key={metric.label}
                          className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
                          title={metric.explanation}
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          {/* Gradient Background on Hover */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                          
                          {/* Icon */}
                          <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Label */}
                          <div className="text-sm font-medium text-gray-600 mb-2">{metric.label}</div>
                          
                          {/* Value */}
                          <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                            <span className="text-lg text-gray-500">{metric.unit}</span>
                          </div>

                          {/* Tooltip on hover */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gray-900/95 text-white text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl">
                            {metric.explanation}
                          </div>
                    </div>
                      );
                    })}
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Ricavi e Costi */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                        Riepilogo Finanziario
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Ricavi Totali</span>
                          <span className="font-bold text-green-600">
                            €{formatNumber(selectedScenario.summary.totalRevenue)}
                          </span>
                  </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Costi Totali</span>
                          <span className="font-bold text-orange-600">
                            €{formatNumber(selectedScenario.summary.totalCosts)}
                          </span>
                </div>

                        <div className="flex justify-between items-center py-3 bg-gradient-to-r from-green-50 to-emerald-50 -mx-2 px-4 rounded-xl">
                          <span className="text-sm font-medium text-gray-900">Utile Netto</span>
                          <span className="text-xl font-bold text-green-600">
                            €{formatNumber(selectedScenario.summary.profit)}
                          </span>
              </div>
            </div>
                    </div>

                    {/* Assunzioni Chiave */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Assunzioni Chiave
                      </h4>
                      
                      <ul className="space-y-2">
                        {selectedScenario.keyAssumptions.map((assumption, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                            <span>{assumption}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
              </div>

                  {/* Alerts (se presenti) */}
                  {selectedScenario.alerts.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-900 mb-3">Alert e Raccomandazioni</h4>
                    <div className="space-y-3">
                            {selectedScenario.alerts.map((alert, i) => (
                              <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="font-medium text-gray-900 mb-1">{alert.message}</div>
                                <div className="text-sm text-gray-600 mb-2">{alert.impact}</div>
                                {alert.recommendation && (
                                  <div className="text-sm text-blue-600 flex items-center">
                                    <Zap className="w-3 h-3 mr-1" />
                                    {alert.recommendation}
                      </div>
                                )}
                      </div>
                            ))}
                      </div>
                      </div>
                      </div>
                      </div>
                  )}
                    </div>
              )}
              
              {/* SCENARIOS TAB */}
              {resultsTab === 'scenarios' && comparison && (
                <ScenarioComparison
                  comparison={comparison}
                  selectedScenarioId={selectedScenarioId}
                  onSelectScenario={setSelectedScenarioId}
                />
              )}
              
              {/* SENSITIVITY TAB */}
              {resultsTab === 'sensitivity' && sensitivity.length > 0 && (
                <SensitivityAnalysis
                  sensitivity={sensitivity}
                  baseScenarioName={selectedScenario?.scenarioName || ''}
                  onVariableChange={(variable, value) => {
                    console.log('Variable changed:', variable, value);
                    // TODO: Ricalcola con nuovo valore
                  }}
                />
              )}
              
              {/* CASH FLOW TAB */}
              {resultsTab === 'cashflow' && selectedScenario && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Cash Flow per Periodo</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedScenario.scenarioName}</p>
                  </div>

                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 rounded-t-xl">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Periodo</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Ricavi</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Costruzione</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Soft Costs</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Terreno</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">Interessi</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">CF Netto</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">CF Cumulato</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedScenario.cashFlow.map((cf, i) => (
                            <tr key={cf.period} className="hover:bg-blue-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-blue-600 text-xs">{cf.period.toUpperCase()}</span>
                      </div>
                                  <span className="text-gray-500 text-xs">{cf.months}m</span>
                      </div>
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-green-600">
                                {cf.revenue > 0 ? `€${formatNumber(cf.revenue)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-orange-600">
                                {cf.constructionCost > 0 ? `-€${formatNumber(cf.constructionCost)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-orange-600">
                                {cf.softCosts > 0 ? `-€${formatNumber(cf.softCosts)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-purple-600">
                                {cf.landPayment > 0 ? `-€${formatNumber(cf.landPayment)}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right text-red-600">
                                {cf.interestAndFees > 0 ? `-€${formatNumber(cf.interestAndFees)}` : '-'}
                              </td>
                              <td className={`px-4 py-3 text-right font-bold ${cf.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {cf.netCashFlow >= 0 ? '+' : ''}{formatNumber(cf.netCashFlow)}
                              </td>
                              <td className={`px-4 py-3 text-right font-bold ${cf.cumulativeCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {cf.cumulativeCashFlow >= 0 ? '+' : ''}{formatNumber(cf.cumulativeCashFlow)}
                              </td>
                            </tr>
                          ))}
                          
                          {/* Totali Row */}
                          <tr className="bg-gray-100 font-bold">
                            <td className="px-4 py-3">TOTALI</td>
                            <td className="px-4 py-3 text-right text-green-600">
                              €{formatNumber(selectedScenario.cashFlow.reduce((sum, cf) => sum + cf.revenue, 0))}
                            </td>
                            <td className="px-4 py-3 text-right text-orange-600" colSpan={4}>
                              -€{formatNumber(
                                selectedScenario.cashFlow.reduce((sum, cf) => 
                                  sum + cf.constructionCost + cf.softCosts + cf.landPayment + cf.interestAndFees, 0
                                )
                              )}
                            </td>
                            <td className={`px-4 py-3 text-right ${selectedScenario.summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} colSpan={2}>
                              {selectedScenario.summary.profit >= 0 ? '+' : ''}€{formatNumber(selectedScenario.summary.profit)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
          )}

              {/* LEVE TAB */}
              {resultsTab === 'levers' && selectedScenario && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-start space-x-3 mb-4">
                      <Award className="w-6 h-6 text-purple-600" />
                <div>
                        <h3 className="font-semibold text-purple-900">Leve di Negoziazione</h3>
                        <p className="text-sm text-purple-700 mt-1">Numeri pronti per la trattativa con il venditore</p>
                          </div>
                          </div>
                        </div>

                  {selectedScenario.negotiationLevers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedScenario.negotiationLevers.map((lever, i) => (
                        <div 
                          key={i}
                          className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-sm font-medium text-gray-600">{lever.type.replace(/_/g, ' ')}</div>
                            <Zap className="w-4 h-4 text-purple-600 group-hover:scale-125 transition-transform" />
                      </div>
                          
                          <h4 className="font-semibold text-gray-900 mb-2 leading-snug">{lever.description}</h4>
                          
                          <div className="bg-purple-50 rounded-xl p-3 mb-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">Attuale</span>
                              <span className="text-sm font-medium text-gray-900">
                                €{formatNumber(lever.currentValue)}
                              </span>
                  </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-gray-600">Target</span>
                              <span className="text-sm font-bold text-purple-600">
                                €{formatNumber(lever.targetValue)}
                              </span>
                      </div>
                            <div className="pt-2 border-t border-purple-200">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-purple-700">Impatto VAN</span>
                                <span className="text-sm font-bold text-purple-600">
                                  +€{formatNumber(lever.deltaImpact)}
                                </span>
                    </div>
                </div>
              </div>

                          <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-lg p-3">
                            💡 {lever.explanation}
                          </p>
                  </div>
                    ))}
                  </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">Nessuna leva di negoziazione disponibile per questo scenario</p>
                </div>
                  )}
              </div>
              )}
                        </div>
                      </div>
        )}

        {/* Loading Overlay Premium */}
        {isCalculating && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              {/* Animated Logo */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <BarChart3 className="w-12 h-12 text-white animate-pulse" />
                          </div>
                      </div>

              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Calcolo in corso</h3>
              <p className="text-gray-600 mb-6">Stiamo elaborando scenari, VAN, TIR e leve di negoziazione...</p>
              
              {/* Progress Dots */}
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

        {/* Error Display Premium */}
        {error && (
          <div className="fixed top-6 right-6 z-50 animate-slide-in">
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-2xl max-w-md">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">Errore</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
            </div>
        </div>
            </div>
          )}
      </div>
      
      <FeedbackWidget />
      
      {/* Custom Animations CSS */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </DashboardLayout>
  );
}