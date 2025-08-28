'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { designCenterService, DesignTemplate } from '@/lib/designCenterService';
import { designProjectService, CreateProjectData } from '@/lib/designProjectService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  GitBranch as GitBranchIcon, 
  Workflow,
  Users,
  GitCommit,
  GitCompare,
  CheckSquare,
  Clock
} from 'lucide-react';

import { 
  BuildingIcon, 
  TrendingUpIcon, 
  ClockIcon, 
  HeartIcon,
  SearchIcon,
  FilterIcon,
  ChartBarIcon,
  MapIcon,
  EyeIcon,
  PlusIcon,
  MapPinIcon,
  RulerIcon,
  ShareIcon,
  DownloadIcon,
  AlertIcon,
  InfoIcon,
  BrainIcon,
  ZapIcon,
  TargetIcon,
  LightbulbIcon,
  SparklesIcon
} from '@/components/icons';
import DesignAnalyticsDashboard from '@/components/ui/DesignAnalyticsDashboard';
import AIDesignAssistant from '@/components/ui/AIDesignAssistant';
import TerrainAnalysisAdvanced from '@/components/ui/TerrainAnalysisAdvanced';
import RealTimeCollaboration from '@/components/ui/RealtimeCollaboration';
import IntelligentVersioning from '@/components/ui/IntelligentVersioning';
import ApprovalWorkflow from '@/components/ui/ApprovalWorkflow';

interface DesignFilters {
  category: string;
  zone: string;
  budget: string;
  density: string;
  minArea: number;
  maxArea: number;
  minBudget: number;
  maxBudget: number;
}

export default function DesignCenterPage() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Stati principali
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<DesignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stati per filtri e ricerca
  const [filters, setFilters] = useState<DesignFilters>({
    category: '',
    zone: '',
    budget: '',
    density: '',
    minArea: 0,
    maxArea: 1000,
    minBudget: 0,
    maxBudget: 5000000
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Stati per geolocalizzazione
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'GRANTED' | 'DENIED' | 'PENDING'>('PENDING');
  
  // Stati per analytics
  const [projects, setProjects] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Stati per Fase 3 - AI Avanzata
  const [showAI, setShowAI] = useState(false);
  const [showTerrainAnalysis, setShowTerrainAnalysis] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [aiOptimization, setAiOptimization] = useState<any>(null);

  // Stati per Fase 4 - Collaborazione Avanzata
  const [activePhase4Tab, setActivePhase4Tab] = useState<'collaboration' | 'versioning' | 'workflow'>('collaboration');
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showVersioning, setShowVersioning] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadDesignCenter();
      requestLocationPermission();
    }
  }, [authLoading, user]);

  const loadDesignCenter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carica template con fallback automatico
      let allTemplates: DesignTemplate[] = [];
      try {
        // Inizializza template di esempio se necessario
        await designCenterService.initializeSampleTemplates();
        
        // Carica tutti i template
        allTemplates = await designCenterService.getTemplates();
        console.log('✅ [DesignCenter] Template caricati da Firebase:', allTemplates.length);
      } catch (firebaseError) {
        console.warn('⚠️ [DesignCenter] Errore Firebase, uso fallback:', firebaseError);
        // Fallback ai template locali
        allTemplates = await designCenterService.getTemplates();
      }
      
      setTemplates(allTemplates);
      setFilteredTemplates(allTemplates);
      
      // Carica progetti dell'utente
      if (user?.uid) {
        try {
          const userProjects = await designProjectService.getUserProjects(user.uid);
          setProjects(userProjects);
        } catch (error) {
          console.warn('⚠️ [DesignCenter] Errore caricamento progetti:', error);
        }
      }
      
      // Inizializza AI insights
      await initializeAIInsights();
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore caricamento:', error);
      setError('Errore durante il caricamento del Design Center');
    } finally {
      setLoading(false);
    }
  };

  const initializeAIInsights = async () => {
    try {
      setAiLoading(true);
      
      // Simula chiamata AI per insights iniziali
      const insights = await generateAIInsights();
      setAiInsights(insights);
      
      // Inizializza ottimizzazione AI
      if (userLocation) {
        const optimization = await generateAIOptimization();
        setAiOptimization(optimization);
      }
      
    } catch (error) {
      console.warn('⚠️ [DesignCenter] Errore inizializzazione AI:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIInsights = async (): Promise<any[]> => {
    // Simula generazione insights AI reali
    return [
      {
        id: 'insight-1',
        type: 'market_trend',
        title: 'Trend di Mercato: Zona Appio',
        description: 'La zona Appio mostra un trend positivo per progetti residenziali di media densità',
        confidence: 0.87,
        impact: 'HIGH',
        recommendations: [
          'Considera progetti con 3-4 piani',
          'Focus su efficienza energetica classe A',
          'Integra spazi verdi comuni'
        ],
        data: {
          marketGrowth: '+12.5%',
          demandIndex: 'HIGH',
          competitionLevel: 'MEDIUM'
        }
      },
      {
        id: 'insight-2',
        type: 'design_optimization',
        title: 'Ottimizzazione Design: ROI +18%',
        description: 'Analisi AI suggerisce modifiche al layout per massimizzare il ROI',
        confidence: 0.92,
        impact: 'HIGH',
        recommendations: [
          'Riduci corridoi di 15%',
          'Aumenta superficie commerciale',
          'Ottimizza orientamento per sole'
        ],
        data: {
          roiImprovement: '+18%',
          spaceEfficiency: '+22%',
          energySavings: '+15%'
        }
      },
      {
        id: 'insight-3',
        type: 'regulatory_compliance',
        title: 'Compliance Normativa: Aggiornamenti 2024',
        description: 'Nuove normative richiedono adattamenti per progetti futuri',
        confidence: 0.95,
        impact: 'MEDIUM',
        recommendations: [
          'Aggiorna calcoli sismici',
          'Implementa nuovi standard energetici',
          'Considera requisiti anti-incendio'
        ],
        data: {
          complianceScore: '95%',
          riskLevel: 'LOW',
          updateRequired: true
        }
      }
    ];
  };

  const generateAIOptimization = async (): Promise<any> => {
    // Simula ottimizzazione AI basata su posizione
    return {
      id: 'opt-1',
      zone: 'Appio',
      city: 'Roma',
      coordinates: userLocation,
      recommendations: [
        {
          category: 'layout',
          priority: 'HIGH',
          description: 'Orientamento ottimale per massimizzare luce naturale',
          impact: '+15% comfort abitativo',
          implementation: 'Rotazione edificio di 15° verso sud-est'
        },
        {
          category: 'density',
          priority: 'MEDIUM',
          description: 'Densità ottimale per la zona: 0.8 FAR',
          impact: '+22% efficienza spaziale',
          implementation: 'Riduzione superficie per unità abitativa'
        },
        {
          category: 'sustainability',
          priority: 'HIGH',
          description: 'Integrazione sistemi rinnovabili',
          impact: '+25% efficienza energetica',
          implementation: 'Pannelli solari + pompa di calore'
        }
      ],
      constraints: {
        maxHeight: '15m',
        minDistance: '10m dal confine',
        maxCoverage: '60% del lotto',
        parkingRequired: '1 posto per unità'
      },
      opportunities: {
        incentives: ['Bonus verde', 'Detrazione 50%'],
        marketDemand: 'ALTA',
        developmentPotential: 'ECCELLENTE'
      }
    };
  };

  const handleZoneSelection = async (zone: string) => {
    setSelectedZone(zone);
    setAiLoading(true);
    
    try {
      // Genera insights specifici per la zona
      const zoneInsights = await generateZoneSpecificInsights(zone);
      setAiInsights(prev => [...prev, ...zoneInsights]);
      
      // Aggiorna ottimizzazione per la zona
      const zoneOptimization = await generateZoneOptimization(zone);
      setAiOptimization(zoneOptimization);
      
      toast(`Analisi AI completata per la zona ${zone}`, { icon: '✅' });
    } catch (error) {
      console.error('❌ [DesignCenter] Errore analisi zona:', error);
      toast('Errore durante l\'analisi AI della zona', { icon: '❌' });
    } finally {
      setAiLoading(false);
    }
  };

  const generateZoneSpecificInsights = async (zone: string): Promise<any[]> => {
    // Simula insights specifici per zona
    const zoneData = {
      'Appio': {
        demographics: { avgAge: 35, familySize: 2.8, income: 'MEDIUM-HIGH' },
        infrastructure: { transport: 'EXCELLENT', schools: 'GOOD', healthcare: 'GOOD' },
        market: { pricePerSqm: 3200, demand: 'HIGH', supply: 'LOW' }
      },
      'Centro': {
        demographics: { avgAge: 42, familySize: 2.1, income: 'HIGH' },
        infrastructure: { transport: 'EXCELLENT', schools: 'EXCELLENT', healthcare: 'EXCELLENT' },
        market: { pricePerSqm: 5800, demand: 'VERY_HIGH', supply: 'VERY_LOW' }
      }
    };
    
    const data = zoneData[zone as keyof typeof zoneData] || zoneData['Appio'];
    
    return [
      {
        id: `zone-${zone}-1`,
        type: 'zone_analysis',
        title: `Analisi Zona: ${zone}`,
        description: `Analisi dettagliata delle caratteristiche della zona ${zone}`,
        confidence: 0.89,
        impact: 'HIGH',
        data: data,
        recommendations: [
          `Target demografico: ${data.demographics.avgAge} anni, reddito ${data.demographics.income}`,
          `Prezzo di mercato: €${data.market.pricePerSqm}/m²`,
          `Domanda: ${data.market.demand}, Offerta: ${data.market.supply}`
        ]
      }
    ];
  };

  const generateZoneOptimization = async (zone: string): Promise<any> => {
    // Simula ottimizzazione specifica per zona
    return {
      id: `zone-opt-${zone}`,
      zone: zone,
      city: 'Roma',
      coordinates: userLocation,
      recommendations: [
        {
          category: 'market_strategy',
          priority: 'HIGH',
          description: `Strategia di mercato ottimale per ${zone}`,
          impact: '+25% profittabilità',
          implementation: 'Pricing dinamico basato su domanda'
        },
        {
          category: 'design_adaptation',
          priority: 'MEDIUM',
          description: 'Adattamento design per target demografico',
          impact: '+18% appeal di mercato',
          implementation: 'Spazi flessibili e servizi premium'
        }
      ],
      constraints: {
        maxHeight: '18m',
        minDistance: '12m dal confine',
        maxCoverage: '65% del lotto',
        parkingRequired: '1.2 posti per unità'
      },
      opportunities: {
        incentives: ['Bonus verde', 'Detrazione 50%', 'Credito d\'imposta'],
        marketDemand: 'MOLTO ALTA',
        developmentPotential: 'ECCELLENTE'
      }
    };
  };

  const requestLocationPermission = async () => {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });
        
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationPermission('GRANTED');
        
        // Genera ottimizzazione AI per la posizione
        const optimization = await generateAIOptimization();
        setAiOptimization(optimization);
        
      } else {
        setLocationPermission('DENIED');
      }
    } catch (error) {
      console.warn('⚠️ [DesignCenter] Errore geolocalizzazione:', error);
      setLocationPermission('DENIED');
    }
  };

  const applyFilters = () => {
    let filtered = templates;
    
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    if (filters.zone) {
      filtered = filtered.filter(t => t.zone === filters.zone);
    }
    
          if (filters.budget) {
        filtered = filtered.filter(t => {
          const budget = parseInt(filters.budget);
          return t.minBudget >= budget * 0.8 && t.maxBudget <= budget * 1.2;
        });
      }
    
    if (filters.density) {
      filtered = filtered.filter(t => t.density === filters.density);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.zone.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTemplates(filtered);
  };

  const startTemplateCustomization = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const createProjectFromTemplate = async (template: DesignTemplate) => {
    if (!user?.uid) {
      toast('Devi essere autenticato per creare un progetto', { icon: '❌' });
      return;
    }

    try {
      const projectData: CreateProjectData = {
        name: `${template.name} - Progetto`,
        description: `Progetto basato su template: ${template.name}`,
        templateId: template.id,
        template: template,
        userId: user.uid,
        location: userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Posizione non specificata',
        category: template.category,
        zone: template.zone,
        coordinates: userLocation || undefined,
        budget: {
          estimated: template.minBudget,
          currency: 'EUR'
        },
        timeline: {
          estimated: template.constructionTime
        },
        customizations: {
          area: template.minArea,
          bedrooms: 3,
          bathrooms: 2,
          floors: 2,
          parkingSpaces: 2,
          gardenArea: 100,
          balconyArea: 20,
          customFeatures: [],
          notes: `Template: ${template.name}`
        },
        tags: [template.category, template.zone],
        priority: 'MEDIUM'
      };

      const projectId = await designProjectService.createProject(projectData);
      
      toast('Progetto creato con successo!', { icon: '✅' });
      setShowTemplateModal(false);
      
      // Reindirizza alla pagina progetti
      router.push('/dashboard/progetti');
      
    } catch (error) {
      console.error('❌ [DesignCenter] Errore creazione progetto:', error);
      toast('Errore durante la creazione del progetto', { icon: '❌' });
    }
  };

  const previewTemplate = (template: DesignTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleAIOptimization = async () => {
    if (!selectedTemplate || !userLocation) {
      toast('Seleziona un template e attiva la geolocalizzazione', { icon: '❌' });
      return;
    }

    setAiLoading(true);
    try {
      // Genera ottimizzazione AI per il template selezionato
      const optimization = await generateTemplateOptimization(selectedTemplate);
      setAiOptimization(optimization);
      
      toast('Ottimizzazione AI completata!', { icon: '✅' });
    } catch (error) {
      console.error('❌ [DesignCenter] Errore ottimizzazione AI:', error);
      toast('Errore durante l\'ottimizzazione AI', { icon: '❌' });
    } finally {
      setAiLoading(false);
    }
  };

  const generateTemplateOptimization = async (template: DesignTemplate): Promise<any> => {
    // Simula ottimizzazione AI per template specifico
    return {
      id: `template-opt-${template.id}`,
      templateId: template.id,
      templateName: template.name,
      zone: template.zone,
      coordinates: userLocation,
      recommendations: [
        {
          category: 'structural',
          priority: 'HIGH',
          description: 'Ottimizzazione struttura per zona sismica',
          impact: '+20% sicurezza strutturale',
          implementation: 'Rinforzo pilastri e travi'
        },
        {
          category: 'energy',
          priority: 'HIGH',
          description: 'Miglioramento efficienza energetica',
          impact: '+25% classe energetica',
          implementation: 'Isolamento termico avanzato'
        },
        {
          category: 'layout',
          priority: 'MEDIUM',
          description: 'Ottimizzazione distribuzione spazi',
          impact: '+15% funzionalità',
          implementation: 'Ridisegno piante per flusso ottimale'
        }
      ],
      constraints: {
        maxHeight: '15m',
        minDistance: '10m dal confine',
        maxCoverage: '60% del lotto',
        parkingRequired: '1 posto per unità'
      },
      opportunities: {
        incentives: ['Bonus verde', 'Detrazione 50%'],
        marketDemand: 'ALTA',
        developmentPotential: 'ECCELLENTE'
      },
      estimatedImprovements: {
        roi: '+18%',
        energyEfficiency: '+25%',
        marketValue: '+22%',
        constructionTime: '-15%'
      }
    };
  };

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, templates]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h2>
          <p className="text-gray-600">Devi effettuare l'accesso per utilizzare il Design Center</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header con titolo aggiornato */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Design Center</h1>
          <p className="text-xl text-gray-600">Trasformiamo i tuoi progetti in realtà</p>
        </div>

        {/* Controlli principali */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAI(!showAI)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                showAI 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <BrainIcon className="h-5 w-5" />
              <span>AI Assistant</span>
            </button>
            
            <button
              onClick={() => setShowTerrainAnalysis(!showTerrainAnalysis)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                showTerrainAnalysis 
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <MapIcon className="h-5 w-5" />
              <span>Analisi Terreno</span>
            </button>
            
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                showAnalytics 
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ChartBarIcon className="h-5 w-5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setShowCollaboration(!showCollaboration)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                showCollaboration 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Collaborazione</span>
            </button>

            <button
              onClick={() => setShowVersioning(!showVersioning)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                showVersioning 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <GitBranchIcon className="h-5 w-5" />
              <span>Versioning</span>
            </button>

            <button
              onClick={() => setShowWorkflow(!showWorkflow)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                showWorkflow 
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Workflow className="h-5 w-5" />
              <span>Workflow</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
            >
              <FilterIcon className="h-5 w-5" />
              <span>Filtri</span>
            </button>
            
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca template..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* AI Assistant - Fase 3 */}
        {showAI && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <BrainIcon className="h-8 w-8 text-purple-600" />
                <span>AI Design Assistant</span>
                <SparklesIcon className="h-6 w-6 text-yellow-500 animate-pulse" />
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">AI Attiva</span>
              </div>
            </div>

            <AIDesignAssistant
              insights={aiInsights}
              optimization={aiOptimization}
              onZoneSelect={handleZoneSelection}
              onOptimize={handleAIOptimization}
              loading={aiLoading}
              selectedZone={selectedZone}
            />
          </div>
        )}

        {/* Analisi Terreno Avanzata - Fase 3 */}
        {showTerrainAnalysis && (
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <MapIcon className="h-8 w-8 text-green-600" />
                <span>Analisi Terreno Avanzata</span>
                <TargetIcon className="h-6 w-6 text-blue-500" />
              </h2>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {userLocation ? 'Posizione rilevata' : 'Posizione non disponibile'}
                </span>
              </div>
            </div>

            <TerrainAnalysisAdvanced
              userLocation={userLocation}
              onLocationUpdate={setUserLocation}
              onZoneAnalysis={handleZoneSelection}
            />
          </div>
        )}

        {/* Analytics Dashboard - Fase 3 */}
        {showAnalytics && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <ChartBarIcon className="h-8 w-8 text-orange-600" />
                <span>Analytics Avanzati</span>
                <TrendingUpIcon className="h-6 w-6 text-red-500" />
              </h2>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Tempo reale</span>
              </div>
            </div>

            <DesignAnalyticsDashboard
              projects={projects}
              templates={templates}
              aiInsights={aiInsights}
              optimization={aiOptimization}
            />
          </div>
        )}

        {/* Collaborazione in Tempo Reale - Fase 4 */}
        {showCollaboration && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
                <span>Collaborazione in Tempo Reale</span>
                <Users className="h-6 w-6 text-purple-500" />
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>

            <RealTimeCollaboration 
              designId={selectedTemplate?.id || 'default'}
              onCommentAdd={(comment) => {
                console.log('Nuovo commento:', comment);
                toast('Commento aggiunto con successo', { icon: '✅' });
              }}
              onVersionChange={(version) => {
                console.log('Versione cambiata:', version);
                toast('Versione aggiornata', { icon: '✅' });
              }}
              onWorkflowUpdate={(workflow) => {
                console.log('Workflow aggiornato:', workflow);
                toast('Workflow aggiornato', { icon: '✅' });
              }}
            />
          </div>
        )}

        {/* Versioning Intelligente - Fase 4 */}
        {showVersioning && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <GitBranchIcon className="h-8 w-8 text-emerald-600" />
                <span>Versioning Intelligente</span>
                <GitCommit className="h-6 w-6 text-teal-500" />
              </h2>
              <div className="flex items-center space-x-2">
                <GitCompare className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Controllo versioni</span>
              </div>
            </div>

            <IntelligentVersioning 
              designId={selectedTemplate?.id || 'default'}
              onVersionCreate={(version) => {
                console.log('Nuova versione:', version);
                toast('Versione creata con successo', { icon: '✅' });
              }}
              onVersionSelect={(version) => {
                console.log('Versione selezionata:', version);
                setSelectedTemplate(prev => prev ? { ...prev, version: version.versionNumber } : null);
              }}
              onVersionCompare={(version1, version2) => {
                console.log('Confronto versioni:', version1, version2);
                toast('Confronto versioni completato', { icon: '✅' });
              }}
            />
          </div>
        )}

        {/* Workflow di Approvazione - Fase 4 */}
        {showWorkflow && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Workflow className="h-8 w-8 text-amber-600" />
                <span>Workflow di Approvazione</span>
                <CheckSquare className="h-6 w-6 text-orange-500" />
              </h2>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Gestione processi</span>
              </div>
            </div>

            <ApprovalWorkflow 
              designId={selectedTemplate?.id || 'default'}
              onWorkflowCreate={(workflow) => {
                console.log('Nuovo workflow:', workflow);
                toast('Workflow creato con successo', { icon: '✅' });
              }}
              onWorkflowUpdate={(workflow) => {
                console.log('Workflow aggiornato:', workflow);
                toast('Workflow aggiornato', { icon: '✅' });
              }}
              onWorkflowComplete={(workflow) => {
                console.log('Workflow completato:', workflow);
                toast('Workflow completato con successo', { icon: '✅' });
              }}
            />
          </div>
        )}



        {/* Filtri avanzati */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtri Avanzati</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Tutte le categorie</option>
                  <option value="residential">Residenziale</option>
                  <option value="commercial">Commerciale</option>
                  <option value="mixed">Misto</option>
                  <option value="industrial">Industriale</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zona</label>
                <select
                  value={filters.zone}
                  onChange={(e) => setFilters({...filters, zone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Tutte le zone</option>
                  <option value="Appio">Appio</option>
                  <option value="Centro">Centro</option>
                  <option value="Eur">Eur</option>
                  <option value="Ostiense">Ostiense</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <select
                  value={filters.budget}
                  onChange={(e) => setFilters({...filters, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Tutti i budget</option>
                  <option value="1000000">Fino a 1M €</option>
                  <option value="2500000">Fino a 2.5M €</option>
                  <option value="5000000">Fino a 5M €</option>
                  <option value="10000000">Oltre 5M €</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Densità</label>
                <select
                  value={filters.density}
                  onChange={(e) => setFilters({...filters, density: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Tutte le densità</option>
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Template Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Errore di caricamento</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <BuildingIcon className="h-20 w-20 text-blue-600" />
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <button
                      onClick={() => previewTemplate(template)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Zona: {template.zone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RulerIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Area: {template.minArea}-{template.maxArea}m²</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUpIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Densità: {template.density}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ZapIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">Classe Energetica: {template.energyClass}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Budget:</span> €{template.minBudget.toLocaleString()}-{template.maxBudget.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Durata:</span> {template.constructionTime} mesi
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startTemplateCustomization(template)}
                      className="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Usa questo Template</span>
                    </button>
                    
                    <button
                      onClick={() => previewTemplate(template)}
                      className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Template */}
        {showTemplateModal && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="sr-only">Chiudi</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="h-64 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center mb-6">
                      <BuildingIcon className="h-24 w-24 text-blue-600" />
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Descrizione</h3>
                        <p className="text-gray-600">{selectedTemplate.description}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Caratteristiche</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Zona: {selectedTemplate.zone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RulerIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Area: {selectedTemplate.minArea}-{selectedTemplate.maxArea}m²</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUpIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Densità: {selectedTemplate.density}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ZapIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700">Classe Energetica: {selectedTemplate.energyClass}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Budget e Tempi</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Budget stimato:</span>
                            <div className="font-semibold text-gray-900">€{selectedTemplate.minBudget.toLocaleString()}-{selectedTemplate.maxBudget.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Durata stimata:</span>
                            <div className="font-semibold text-gray-900">{selectedTemplate.constructionTime} mesi</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Azioni</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => createProjectFromTemplate(selectedTemplate)}
                          className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <PlusIcon className="h-5 w-5" />
                          <span>Crea Progetto</span>
                        </button>
                        
                        <button
                          onClick={() => startTemplateCustomization(selectedTemplate)}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <LightbulbIcon className="h-5 w-5" />
                          <span>Personalizza Template</span>
                        </button>
                        
                        <button
                          onClick={() => handleAIOptimization()}
                          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <BrainIcon className="h-5 w-5" />
                          <span>Ottimizzazione AI</span>
                        </button>
                      </div>
                    </div>
                    
                    {aiOptimization && (
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <BrainIcon className="h-5 w-5 text-green-600" />
                          <span>Ottimizzazioni AI</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          {aiOptimization.recommendations?.slice(0, 3).map((rec: any, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <div className="font-medium text-gray-800">{rec.description}</div>
                                <div className="text-green-600">{rec.impact}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Condividi</h3>
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <ShareIcon className="h-4 w-4" />
                          <span>Condividi</span>
                        </button>
                        <button className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                          <DownloadIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 