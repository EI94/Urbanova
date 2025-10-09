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
  Bot,
  Sparkles,
  MessageCircle,
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
  Info
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
type ViewMode = 'welcome' | 'form' | 'results' | 'chat';
type ResultsTab = 'overview' | 'scenarios' | 'sensitivity' | 'cashflow' | 'levers';

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
  
  // Loading e stati
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chat mode
  const [chatMessages, setChatMessages] = useState<Array<{id: string; type: 'user' | 'assistant'; content: string; timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Pre-fill da Feasibility Analysis (se viene da lì)
  useEffect(() => {
    const projectId = searchParams?.get('projectId');
    const fromFeasibility = searchParams?.get('fromFeasibility');
    
    if (projectId && fromFeasibility === 'true') {
      console.log('📊 [BusinessPlan] Caricamento dati da Feasibility:', projectId);
      loadFromFeasibility(projectId);
    }
  }, [searchParams]);
  
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
      const businessPlanData = {
        projectName: feasibilityProject.name || '',
        location: feasibilityProject.address || '',
        type: 'RESIDENTIAL' as const, // Default, può essere modificato
        totalUnits: feasibilityProject.revenues?.units || 1,
        
        // Ricavi dal progetto di fattibilità
        averagePrice: feasibilityProject.revenues?.pricePerSqm ? 
          feasibilityProject.revenues.pricePerSqm * (feasibilityProject.revenues.averageArea || 100) : 0,
        salesCommission: 3, // Default
        discounts: 0, // Default
        
        // Costi dal progetto di fattibilità
        constructionCostPerUnit: feasibilityProject.costs?.pricePerSqm ? 
          feasibilityProject.costs.pricePerSqm * (feasibilityProject.revenues?.averageArea || 100) : 0,
        contingency: feasibilityProject.costs?.contingency || 0,
        
        // Costi indiretti
        softCostPercentage: 8, // Default
        developmentCharges: 0, // Default
        utilities: 0, // Default
        
        // Finanza
        discountRate: 12, // Default
        
        // Tempi (default)
        salesCalendar: [],
        constructionTimeline: [],
        
        // Scenari terreno (vuoti)
        landScenarios: [],
        
        // Target
        targetMargin: feasibilityProject.targetMargin || 15,
        minimumDSCR: 1.2 // Default
      };

      // Imposta i dati nel form
      setBpInput(businessPlanData);
      setFeasibilityProjectId(projectId);
      
      // Mostra il form pre-popolato
      setViewMode('form');
      
      toast('✅ Dati del progetto di fattibilità caricati nel Business Plan');
      
    } catch (error) {
      console.error('❌ [BusinessPlan] Errore caricamento feasibility:', error);
      toast('❌ Errore nel caricamento del progetto di fattibilità');
      // Mostra comunque il form vuoto
      setViewMode('form');
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
        throw new Error('Errore calcolo Business Plan');
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
      
    } catch (err) {
      console.error('❌ [BusinessPlan] Errore:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsCalculating(false);
    }
  };
  
  /**
   * 💬 CHAT HANDLER
   */
  const handleChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      // Chiama Urbanova OS per interpretare richiesta BP
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          userId: currentUser?.uid || 'anonymous',
          userEmail: currentUser?.email || 'anonymous@urbanova.it',
          context: 'business_plan',
          history: chatMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.type === 'user' ? 'user' : 'assistant',
            timestamp: msg.timestamp.toISOString()
          }))
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore nella risposta dell\'OS');
      }
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: data.response || data.message || 'Risposta ricevuta',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Se l'OS ha estratto dati BP, proponi di calcolarli
      if (data.extractedData && data.extractedData.businessPlanData) {
        // TODO: Popola form con dati estratti
        console.log('📊 Dati BP estratti dal chat:', data.extractedData.businessPlanData);
      }
      
      // Log per debugging
      console.log('🤖 [BusinessPlan OS] Risposta ricevuta:', {
        hasResponse: !!data.response,
        hasMessage: !!data.message,
        responseLength: data.response?.length || 0
      });
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant' as const,
        content: 'Mi dispiace, c\'è stato un errore. Puoi provare a riformulare la richiesta?',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
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

  return (
    <DashboardLayout title="Business Plan">
        <div className="max-w-7xl mx-auto">
        
        {/* ============================================================================ */}
        {/* WELCOME SCREEN - MINIMALE E BELLISSIMO */}
        {/* ============================================================================ */}
        {viewMode === 'welcome' && (
          <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
            {/* Hero Animation */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
                    Business Plan
                  </h1>
            
            <p className="text-xl text-gray-600 mb-12 text-center max-w-2xl">
              Genera, valuta e spiega business plan immobiliari con VAN, TIR, DSCR e leve di negoziazione.
              <br />
              <span className="text-base text-gray-500 mt-2 block">Input in 3-5 minuti • Scenari multipli • Sensitivity automatica</span>
            </p>
            
            {/* CTA Cards - Eleganti */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {/* Form Mode */}
              <button
                onClick={() => setViewMode('form')}
                className="group relative bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute top-6 right-6 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-blue-600" />
          </div>

                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Form Strutturato</h3>
                  <p className="text-gray-600 mb-4">
                    Input guidato con defaults intelligenti. Tab organizzati per ricavi, costi, scenari terreno e finanza.
                  </p>
                  
                  <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                    <span>Inizia →</span>
                    </div>
                  </div>
              </button>
              
              {/* Chat Mode */}
              <button
                onClick={() => setViewMode('chat')}
                className="group relative bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 shadow-lg border-2 border-purple-200 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="absolute top-6 right-6 w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6 text-purple-600" />
                    </div>
                
                <div className="text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">Chat con OS</h3>
                    <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                    </div>
                  <p className="text-gray-600 mb-4">
                    Linguaggio naturale. Scrivi "Ciliegie: 4 case, 390k prezzo..." e l'OS estrae i dati e calcola tutto.
                  </p>
                  
                  <div className="flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform">
                    <span>Prova →</span>
                    </div>
                </div>
              </button>
                  </div>

            {/* Quick Example */}
            <div className="mt-12 max-w-2xl">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                    </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-1">Esempio prompt chat:</div>
                    <p className="text-sm text-gray-600 italic">
                      "Ciliegie: 4 case, prezzo 390k, costo 200k, S1 terreno 220k cash, S2 permuta 1 casa +80k a t2, S3 pagamento 300k a t1, tasso 12%. Dammi VAN, TIR, margini e leve."
                    </p>
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
              <span className="text-gray-900 font-medium">Nuovo</span>
                </div>

            <BusinessPlanForm
              initialData={bpInput as Partial<BusinessPlanInput> | undefined}
              feasibilityProjectId={feasibilityProjectId || undefined}
              onSubmit={calculateBusinessPlan}
              onCancel={() => setViewMode('welcome')}
              loading={isCalculating}
                        />
                      </div>
        )}
        
        {/* ============================================================================ */}
        {/* CHAT MODE */}
        {/* ============================================================================ */}
        {viewMode === 'chat' && (
          <div className="animate-fade-in">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center space-x-2 text-sm">
              <button 
                onClick={() => setViewMode('welcome')}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Business Plan
              </button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">Chat</span>
                      </div>

            {/* Chat Interface - Stile ChatGPT */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                      <div>
                      <div className="font-semibold text-gray-900">Urbanova Business Plan OS</div>
                      <div className="text-xs text-gray-500">Powered by AI • Linguaggio naturale</div>
                    </div>
                      </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                      </div>
                    </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 180px)' }}>
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-6">
                    <div className="text-center max-w-xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Dimmi tutto del tuo progetto
                      </h3>
                      <p className="text-gray-600">
                        Scrivi in linguaggio naturale. L'OS estrarrà i dati e calcolerà VAN, TIR, DSCR e leve di negoziazione.
                      </p>
                    </div>
                    
                    {/* Quick Examples */}
                    <div className="w-full max-w-2xl space-y-2">
                      <div className="text-xs text-gray-500 text-center mb-3">Esempi rapidi:</div>
                      {[
                        "Ciliegie: 4 case, 390k prezzo, 200k costo, terreno 220k cash",
                        "Permuta: 1 casa in permuta + 80k contributo a t2",
                        "Sensitivity su prezzo ±10% e tasso 8-20%"
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setChatInput(example)}
                          className="w-full p-4 text-left bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-sm text-gray-700">{example}</span>
                        </button>
                      ))}
                      </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                    >
                      <div
                        className={`max-w-2xl rounded-3xl px-6 py-4 ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        <div className={`text-xs mt-2 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-3xl px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">Urbanova sta analizzando...</span>
                      </div>
                    </div>
                  </div>
                )}
                      </div>

              {/* Input Area - Premium */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                        <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleChatMessage()}
                    placeholder="Scrivi qui i dati del progetto..."
                    className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                    disabled={isChatLoading}
                  />
                  <button
                    onClick={handleChatMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                      </div>

                {/* Switch to Form */}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setViewMode('form')}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Preferisci il form strutturato? <span className="underline">Passa al form</span>
                  </button>
                      </div>
                    </div>
                      </div>
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
                  <p className="text-sm text-gray-600 mt-1">{bpInput?.location} • {bpOutputs.length} scenari analizzati</p>
                </div>
                      </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode('form')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Modifica</span>
                </button>
                
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