// 🧠 USER MEMORY SERVICE - ANGELO CUSTODE IRRINUNCIABILE
// Sistema unificato per memoria contestuale, query intelligenti e insights proattivi

// 🛡️ OS PROTECTION - Importa protezione CSS per user memory service
import '@/lib/osProtection';

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
// import { predictiveAnalyticsService, PredictiveInsight, MarketForecast, ProjectOptimization } from './predictiveAnalyticsService';
// import { marketIntelligenceOS, MarketIntelligenceQuery } from './marketIntelligenceOS';
import { db } from '@/lib/firebase';
import { FeasibilityProject } from '@/types/feasibility';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface UserMemoryProfile {
  userId: string;
  userEmail: string;
  preferences: UserPreferences;
  context: UserContext;
  insights: UserInsights;
  lastUpdated: Date;
}

export interface UserPreferences {
  favoriteLocations: string[];
  typicalBudgetRange: [number, number];
  preferredPropertyTypes: string[];
  designStyles: string[];
  businessTypes: string[];
  sectors: string[];
  communicationStyle: 'detailed' | 'concise' | 'technical';
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
}

export interface UserContext {
  currentProjects: ProjectContext[];
  recentSearches: SearchContext[];
  activeConversations: ConversationContext[];
  lastActivity: Date;
  sessionData: SessionData;
}

export interface ProjectContext {
  id: string;
  name: string;
  type: 'feasibility' | 'market-intelligence' | 'design' | 'business-plan';
  status: string;
  location: string;
  keyMetrics: Record<string, any>;
  lastModified: Date;
  importance: 'high' | 'medium' | 'low';
}

export interface SearchContext {
  query: string;
  results: number;
  timestamp: Date;
  filters: Record<string, any>;
  success: boolean;
}

export interface ConversationContext {
  id: string;
  title: string;
  lastMessage: Date;
  messageCount: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SessionData {
  currentIntent?: string;
  currentProject?: string;
  conversationFlow: string[];
  temporaryData: Record<string, any>;
}

export interface UserInsights {
  patterns: UserPatterns;
  recommendations: Recommendation[];
  alerts: Alert[];
  trends: Trend[];
  opportunities: Opportunity[];
}

export interface UserPatterns {
  projectFrequency: number;
  averageProjectSize: number;
  averageBudget: number;
  preferredTimeline: string;
  seasonalTrends: Record<string, number>;
  successRate: number;
  commonIssues: string[];
}

export interface Recommendation {
  id: string;
  type: 'project' | 'optimization' | 'opportunity' | 'warning';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  relatedProject?: string;
  confidence: number;
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: 'budget' | 'timeline' | 'quality' | 'opportunity';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  projectId?: string;
  actionUrl?: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface Trend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface Opportunity {
  id: string;
  type: 'market' | 'cost' | 'efficiency' | 'growth';
  title: string;
  description: string;
  potentialValue: number;
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  confidence: number;
  relatedData: Record<string, any>;
}

export interface QueryResult {
  success: boolean;
  data: any;
  confidence: number;
  source: string;
  relatedProjects: string[];
  suggestions: string[];
  insights: string[];
}

export interface NaturalQuery {
  originalQuery: string;
  parsedQuery: ParsedQuery;
  intent: QueryIntent;
  entities: Entity[];
  context: QueryContext;
}

export interface ParsedQuery {
  action: string;
  entity: string;
  metric?: string;
  filters: Record<string, any>;
  timeframe?: string;
  comparison?: string;
}

export interface QueryIntent {
  type: 'get_metric' | 'compare' | 'analyze' | 'recommend' | 'search' | 'create';
  confidence: number;
  parameters: Record<string, any>;
}

export interface Entity {
  type: 'project' | 'location' | 'metric' | 'date' | 'number';
  value: string;
  confidence: number;
  synonyms: string[];
}

export interface QueryContext {
  userHistory: string[];
  currentProjects: string[];
  recentSearches: string[];
  preferences: Record<string, any>;
}

// ============================================================================
// USER MEMORY SERVICE CLASS
// ============================================================================

export class UserMemoryService {
  private memoryCache: Map<string, UserMemoryProfile> = new Map();
  private queryCache: Map<string, QueryResult> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minuti
  private readonly MAX_CACHE_SIZE = 1000;

  constructor() {
    console.log('🧠 [UserMemoryService] Inizializzato - Angelo Custode Attivo');
  }

  // ============================================================================
  // METODI PRINCIPALI - INTERFACCIA PUBBLICA
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Processa query naturale dell'utente
   * Es: "Quanti metri quadrati ha il progetto Ciliegie?"
   */
  async processNaturalQuery(
    query: string, 
    userId: string, 
    userEmail: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<QueryResult> {
    console.log('🔍 [UserMemory] Processando query naturale:', query);

    try {
      // 1. Carica/aggiorna profilo utente
      console.log('🔍 [UserMemory] Step 1: Caricando profilo utente...');
      const userProfile = await this.getOrCreateUserProfile(userId, userEmail);
      console.log('✅ [UserMemory] Step 1: Profilo utente caricato');
      
      // 2. Analizza query naturale
      console.log('🔍 [UserMemory] Step 2: Analizzando query naturale...');
      const naturalQuery = await this.parseNaturalQuery(query, userProfile, conversationHistory);
      console.log('✅ [UserMemory] Step 2: Query naturale analizzata:', naturalQuery.intent.type);
      
      // 3. Esegui query semantica
      console.log('🔍 [UserMemory] Step 3: Eseguendo query semantica...');
      const result = await this.executeSemanticQuery(naturalQuery, userProfile);
      console.log('✅ [UserMemory] Step 3: Query semantica eseguita:', result.success);
      
      // Debug: verifica se ci sono progetti nel profilo
      console.log('🔍 [UserMemory] Debug - Progetti nel profilo:', userProfile.context.projects?.length || 0);
      
      // 4. Genera insights proattivi
      console.log('🔍 [UserMemory] Step 4: Generando insights proattivi...');
      const insights = await this.generateProactiveInsights(userProfile, result);
      console.log('✅ [UserMemory] Step 4: Insights generati');
      
      // 5. Aggiorna memoria utente
      console.log('🔍 [UserMemory] Step 5: Aggiornando memoria utente...');
      await this.updateUserMemory(userProfile, query, result);
      console.log('✅ [UserMemory] Step 5: Memoria utente aggiornata');
      
      // 6. Combina risultato con insights
      console.log('🔍 [UserMemory] Step 6: Combinando risultato con insights...');
      const enrichedResult: QueryResult = {
        ...result,
        insights: insights.map(i => i.description),
        suggestions: await this.generateSuggestions(userProfile, result)
      };

      console.log('✅ [UserMemory] Query processata con successo');
      return enrichedResult;

    } catch (error) {
      console.error('❌ [UserMemory] Errore processamento query:', error);
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'error',
        relatedProjects: [],
        suggestions: ['Riprova con una domanda più specifica'],
        insights: ['Si è verificato un errore nel processamento della richiesta']
      };
    }
  }

  /**
   * 🔮 GENERA ANALISI PREDITTIVA COMPLETA
   * Superpotere per sviluppatori immobiliari
   */
  async generatePredictiveAnalysis(
    userId: string,
    userEmail: string,
    timeframe: string = '6 mesi'
  ): Promise<any> {
    console.log('🔮 [UserMemory] Generando analisi predittiva...');
    
    const userProfile = await this.getOrCreateUserProfile(userId, userEmail);
    // return await predictiveAnalyticsService.generatePredictiveAnalysis(userProfile, timeframe);
    return {
      marketForecast: { trend: 'stable', confidence: 0.7 },
      projectOptimizations: [],
      strategicRecommendations: [],
      riskAssessment: []
    };
  }

  /**
   * 📈 OTTIMIZZA PROGETTO SPECIFICO
   * Superpotere di ottimizzazione automatica
   */
  async optimizeProject(
    projectId: string,
    userId: string,
    userEmail: string
  ): Promise<ProjectOptimization | null> {
    console.log('⚡ [UserMemory] Ottimizzando progetto:', projectId);
    
    const userProfile = await this.getOrCreateUserProfile(userId, userEmail);
    const project = userProfile.context.currentProjects.find(p => p.id === projectId);
    
    if (!project) {
      console.warn('⚠️ [UserMemory] Progetto non trovato:', projectId);
      return null;
    }

    // Simula ottimizzazione
    const currentMetrics = project.keyMetrics;
    const optimizedMetrics = {
      ...currentMetrics,
      roi: Math.min(currentMetrics.roi * 1.15, 25),
      margin: Math.min(currentMetrics.margin * 1.12, 30),
      timeline: Math.max(currentMetrics.timeline * 0.9, 6)
    };

    const improvements = [
      {
        metric: 'ROI',
        current: currentMetrics.roi,
        optimized: optimizedMetrics.roi,
        improvement: ((optimizedMetrics.roi - currentMetrics.roi) / currentMetrics.roi) * 100,
        action: 'Implementa tecnologie cost-effective e ottimizza la gestione'
      },
      {
        metric: 'Margine',
        current: currentMetrics.margin,
        optimized: optimizedMetrics.margin,
        improvement: ((optimizedMetrics.margin - currentMetrics.margin) / currentMetrics.margin) * 100,
        action: 'Riduci costi operativi e migliora efficienza'
      }
    ];

    return {
      projectId,
      currentMetrics,
      optimizedMetrics,
      improvements,
      potentialROI: optimizedMetrics.roi - currentMetrics.roi,
      implementationCost: currentMetrics.budget * 0.05,
      paybackPeriod: (currentMetrics.budget * 0.05) / (currentMetrics.budget * (optimizedMetrics.roi - currentMetrics.roi) / 100)
    };
  }

  /**
   * 🧠 Ottieni profilo utente completo
   */
  async getUserProfile(userId: string): Promise<UserMemoryProfile | null> {
    return this.memoryCache.get(userId) || null;
  }

  /**
   * 📊 Ottieni insights proattivi per l'utente
   */
  async getProactiveInsights(userId: string): Promise<Recommendation[]> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    return profile.insights.recommendations.filter(r => !r.actionRequired);
  }

  /**
   * 🚨 Ottieni alert attivi per l'utente
   */
  async getActiveAlerts(userId: string): Promise<Alert[]> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    return profile.insights.alerts.filter(a => !a.acknowledged);
  }

  /**
   * 🔄 Aggiorna contesto conversazionale
   */
  async updateConversationContext(
    userId: string, 
    message: ChatMessage, 
    intent?: string
  ): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return;

    // Aggiorna contesto sessione
    profile.context.sessionData.conversationFlow.push(message.content);
    if (intent) {
      profile.context.sessionData.currentIntent = intent;
    }

    // Mantieni solo ultimi 50 messaggi
    if (profile.context.sessionData.conversationFlow.length > 50) {
      profile.context.sessionData.conversationFlow = 
        profile.context.sessionData.conversationFlow.slice(-50);
    }

    // Salva aggiornamenti
    this.memoryCache.set(userId, profile);
  }

  // ============================================================================
  // METODI PRIVATI - LOGICA INTERNA
  // ============================================================================

  /**
   * Ottieni o crea profilo utente
   */
  private async getOrCreateUserProfile(
    userId: string, 
    userEmail: string
  ): Promise<UserMemoryProfile> {
    // Controlla cache
    let profile = this.memoryCache.get(userId);
    
    if (profile) {
      console.log('🧠 [UserMemory] Profilo caricato da cache');
      return profile;
    }

    console.log('🔄 [UserMemory] Creando nuovo profilo utente');
    
    // Crea nuovo profilo
    profile = {
      userId,
      userEmail,
      preferences: await this.initializeUserPreferences(),
      context: await this.initializeUserContext(userId),
      insights: await this.initializeUserInsights(),
      lastUpdated: new Date()
    };

    // Carica dati esistenti
    await this.loadUserData(profile);
    
    // Salva in cache
    this.memoryCache.set(userId, profile);
    
    return profile;
  }

  /**
   * Inizializza preferenze utente
   */
  private async initializeUserPreferences(): Promise<UserPreferences> {
    return {
      favoriteLocations: [],
      typicalBudgetRange: [0, 0],
      preferredPropertyTypes: [],
      designStyles: [],
      businessTypes: [],
      sectors: [],
      communicationStyle: 'detailed',
      notificationFrequency: 'immediate'
    };
  }

  /**
   * Inizializza contesto utente
   */
  private async initializeUserContext(userId: string): Promise<UserContext> {
    return {
      currentProjects: [],
      recentSearches: [],
      activeConversations: [],
      lastActivity: new Date(),
      sessionData: {
        conversationFlow: [],
        temporaryData: {}
      }
    };
  }

  /**
   * Inizializza insights utente
   */
  private async initializeUserInsights(): Promise<UserInsights> {
    return {
      patterns: {
        projectFrequency: 0,
        averageProjectSize: 0,
        averageBudget: 0,
        preferredTimeline: '',
        seasonalTrends: {},
        successRate: 0,
        commonIssues: []
      },
      recommendations: [],
      alerts: [],
      trends: [],
      opportunities: []
    };
  }

  /**
   * Carica dati utente esistenti
   */
  private async loadUserData(profile: UserMemoryProfile): Promise<void> {
    try {
      console.log('🔄 [UserMemory] Caricamento dati utente esistenti...');
      
      // Carica progetti feasibility
      const feasibilityProjects = await this.loadFeasibilityProjects(profile.userId);
      
      // Carica progetti design
      const designProjects = await this.loadDesignProjects(profile.userId);
      
      // Carica business plans
      const businessPlans = await this.loadBusinessPlans(profile.userId);
      
      // Carica ricerche market intelligence
      const marketSearches = await this.loadMarketSearches(profile.userId);
      
      // Aggiorna contesto con progetti
      profile.context.currentProjects = [
        ...feasibilityProjects,
        ...designProjects,
        ...businessPlans,
        ...marketSearches
      ];

      // Analizza pattern utente
      await this.analyzeUserPatterns(profile);
      
      // Genera insights
      await this.generateUserInsights(profile);
      
      console.log('✅ [UserMemory] Dati utente caricati:', {
        projects: profile.context.currentProjects.length,
        recommendations: profile.insights.recommendations.length,
        alerts: profile.insights.alerts.length
      });

    } catch (error) {
      console.error('❌ [UserMemory] Errore caricamento dati utente:', error);
    }
  }

  /**
   * Carica progetti feasibility
   */
  private async loadFeasibilityProjects(userId: string): Promise<ProjectContext[]> {
    try {
      console.log('🔄 [UserMemory] Caricamento progetti feasibility per utente:', userId);
      
      // Verifica che l'utente sia autenticato
      if (!userId || userId === 'test-user') {
        console.log('⚠️ [UserMemory] Utente non autenticato o di test, restituendo array vuoto');
        return [];
      }
      
      // Carica progetti reali da Firebase
      const projectsRef = collection(db!, 'feasibilityProjects');
      const q = query(
        projectsRef,
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const projects: ProjectContext[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        projects.push({
          id: doc.id,
          name: data.name || 'Progetto senza nome',
          type: 'feasibility',
          status: data.status || 'unknown',
          location: data.address || 'Non specificato',
          keyMetrics: {
            totalArea: data.totalArea || 0,
            budget: data.costs?.total || 0,
            roi: data.results?.roi || 0,
            margin: data.results?.margin || 0,
            timeline: data.duration || 0
          },
          lastModified: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
          importance: this.calculateProjectImportance(data)
        });
      });
      
      console.log('✅ [UserMemory] Progetti reali caricati:', projects.length);
      return projects;
    } catch (error: any) {
      console.error('❌ [UserMemory] Errore caricamento progetti feasibility:', error);
      
      // Se è un errore di permessi Firebase, logga specificamente
      if (error.code === 'permission-denied') {
        console.error('🔒 [UserMemory] Errore permessi Firebase - utente non autenticato o senza permessi');
      } else if (error.message?.includes('Missing or insufficient permissions')) {
        console.error('🔒 [UserMemory] Permessi insufficienti per accedere ai progetti');
      }
      
      return [];
    }
  }

  /**
   * Carica progetti design
   */
  private async loadDesignProjects(userId: string): Promise<ProjectContext[]> {
    // TODO: Implementare caricamento progetti design
    return [];
  }

  /**
   * Carica business plans
   */
  private async loadBusinessPlans(userId: string): Promise<ProjectContext[]> {
    // TODO: Implementare caricamento business plans
    return [];
  }

  /**
   * Carica ricerche market intelligence
   */
  private async loadMarketSearches(userId: string): Promise<ProjectContext[]> {
    // TODO: Implementare caricamento ricerche market intelligence
    return [];
  }

  /**
   * Analizza pattern utente
   */
  private async analyzeUserPatterns(profile: UserMemoryProfile): Promise<void> {
    const projects = profile.context.currentProjects;
    
    if (projects.length === 0) return;

    // Analizza pattern budget
    const budgets = projects
      .map(p => p.keyMetrics.budget)
      .filter(b => b > 0);
    
    if (budgets.length > 0) {
      const avgBudget = budgets.reduce((a, b) => a + b, 0) / budgets.length;
      profile.preferences.typicalBudgetRange = [
        Math.floor(avgBudget * 0.8),
        Math.floor(avgBudget * 1.2)
      ];
    }

    // Analizza pattern location
    const locations = projects.map(p => p.location).filter(l => l && l !== 'Non specificato');
    const locationCounts = locations.reduce((acc, loc) => {
      acc[loc] = (acc[loc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    profile.preferences.favoriteLocations = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([loc]) => loc);

    // Analizza pattern timeline
    const timelines = projects.map(p => p.keyMetrics.timeline).filter(t => t);
    if (timelines.length > 0) {
      profile.insights.patterns.preferredTimeline = timelines[0]; // Semplificato
    }

    // Calcola metriche aggregate
    profile.insights.patterns.projectFrequency = projects.length;
    profile.insights.patterns.averageProjectSize = projects
      .map(p => p.keyMetrics.totalArea || 0)
      .reduce((a, b) => a + b, 0) / projects.length;
    profile.insights.patterns.averageBudget = budgets.length > 0 ? 
      budgets.reduce((a, b) => a + b, 0) / budgets.length : 0;
  }

  /**
   * Genera insights utente
   */
  private async generateUserInsights(profile: UserMemoryProfile): Promise<void> {
    const projects = profile.context.currentProjects;
    
    // Genera raccomandazioni basate su pattern
    if (profile.preferences.favoriteLocations.length > 0) {
      profile.insights.recommendations.push({
        id: `rec-location-${Date.now()}`,
        type: 'opportunity',
        title: 'Espansione in Nuove Zone',
        description: `Hai molti progetti a ${profile.preferences.favoriteLocations[0]}. Considera di esplorare zone limitrofe per diversificare il portafoglio.`,
        priority: 'medium',
        actionRequired: false,
        confidence: 0.8,
        createdAt: new Date()
      });
    }

    // Genera alert per progetti in ritardo
    const overdueProjects = projects.filter(p => {
      const daysSinceUpdate = (Date.now() - p.lastModified.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });

    if (overdueProjects.length > 0) {
      profile.insights.alerts.push({
        id: `alert-overdue-${Date.now()}`,
        type: 'timeline',
        severity: 'warning',
        title: 'Progetti Inattivi',
        message: `${overdueProjects.length} progetti non vengono aggiornati da più di 30 giorni`,
        projectId: overdueProjects[0].id,
        actionUrl: `/dashboard/feasibility-analysis/${overdueProjects[0].id}`,
        createdAt: new Date(),
        acknowledged: false
      });
    }
  }

  /**
   * Parsing query naturale
   */
  private async parseNaturalQuery(
    query: string, 
    profile: UserMemoryProfile,
    conversationHistory: ChatMessage[]
  ): Promise<NaturalQuery> {
    console.log('🔍 [UserMemory] Parsing query naturale:', query);

    const lowerQuery = query.toLowerCase();
    
    // Estrai entità (progetti, metriche, etc.)
    const entities = this.extractEntities(query, profile);
    
    // Determina intent
    const intent = this.determineQueryIntent(query, entities);
    
    // Estrai parametri
    const parsedQuery = this.parseQueryParameters(query, entities);
    
    return {
      originalQuery: query,
      parsedQuery,
      intent,
      entities,
      context: {
        userHistory: profile.context.sessionData.conversationFlow,
        currentProjects: profile.context.currentProjects.map(p => p.name),
        recentSearches: profile.context.recentSearches.map(s => s.query),
        preferences: profile.preferences
      }
    };
  }

  /**
   * Estrai entità dalla query
   */
  private extractEntities(query: string, profile: UserMemoryProfile): Entity[] {
    const entities: Entity[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Cerca progetti per nome (anche parziale)
    profile.context.currentProjects.forEach(project => {
      const projectNameLower = project.name.toLowerCase();
      
      // Cerca match esatto
      if (lowerQuery.includes(projectNameLower)) {
        entities.push({
          type: 'project',
          value: project.name,
          confidence: 0.9,
          synonyms: [projectNameLower]
        });
      } else {
        // Cerca match parziale (es. "Ciliegie" in "Progetto Ciliegie")
        const projectWords = projectNameLower.split(' ');
        for (const word of projectWords) {
          if (word.length > 3 && lowerQuery.includes(word)) {
            entities.push({
              type: 'project',
              value: project.name,
              confidence: 0.8,
              synonyms: [word, projectNameLower]
            });
            break; // Evita duplicati
          }
        }
      }
    });
    
    // Cerca metriche
    const metricKeywords = {
      'metri quadrati': 'totalArea',
      'mq': 'totalArea',
      'superficie': 'totalArea',
      'budget': 'budget',
      'costo': 'budget',
      'prezzo': 'budget',
      'roi': 'roi',
      'margine': 'margin',
      'profitto': 'profit',
      'timeline': 'timeline',
      'durata': 'timeline'
    };
    
    Object.entries(metricKeywords).forEach(([keyword, metric]) => {
      if (lowerQuery.includes(keyword)) {
        entities.push({
          type: 'metric',
          value: metric,
          confidence: 0.8,
          synonyms: [keyword]
        });
      }
    });
    
    // Cerca numeri
    const numberMatch = query.match(/(\d+)/);
    if (numberMatch) {
      entities.push({
        type: 'number',
        value: numberMatch[1],
        confidence: 0.7,
        synonyms: [numberMatch[1]]
      });
    }
    
    return entities;
  }

  /**
   * Determina intent della query
   */
  private determineQueryIntent(query: string, entities: Entity[]): QueryIntent {
    const lowerQuery = query.toLowerCase();
    
    // ===== MARKET INTELLIGENCE PATTERNS (PRIORITÀ MASSIMA) =====
    
    // Query Market Intelligence - Ricerca terreni
    if (lowerQuery.includes('cerca') || lowerQuery.includes('trova') || 
        lowerQuery.includes('ricerca') || lowerQuery.includes('mostra') || 
        lowerQuery.includes('filtra') || lowerQuery.includes('cerco') || 
        lowerQuery.includes('trovare') || lowerQuery.includes('ricercare')) {
      if (lowerQuery.includes('terreno') || lowerQuery.includes('terreni') || 
          lowerQuery.includes('immobile') || lowerQuery.includes('immobili') || 
          lowerQuery.includes('proprietà') || lowerQuery.includes('appartamento') || 
          lowerQuery.includes('appartamenti') || lowerQuery.includes('casa') || 
          lowerQuery.includes('case') || lowerQuery.includes('ufficio') || 
          lowerQuery.includes('uffici') || lowerQuery.includes('negozio') || 
          lowerQuery.includes('negozi') || lowerQuery.includes('capannone') || 
          lowerQuery.includes('capannoni') || lowerQuery.includes('magazzino') || 
          lowerQuery.includes('magazzini') || lowerQuery.includes('bene immobiliare') || 
          lowerQuery.includes('beni immobiliari') || lowerQuery.includes('investimento immobiliare') || 
          lowerQuery.includes('investimenti immobiliari')) {
        console.log('🎯 [UserMemory] Market Intelligence - Ricerca terreni riconosciuta');
        return {
          type: 'market_intelligence',
          confidence: 0.98,
          parameters: { action: 'search_land' }
        };
      }
    }
    
    // Query Market Intelligence - Analisi mercato
    if (lowerQuery.includes('analisi') || lowerQuery.includes('analizza') || 
        lowerQuery.includes('come sta') || lowerQuery.includes('stato del') || 
        lowerQuery.includes('andamento del') || lowerQuery.includes('previsioni del') || 
        lowerQuery.includes('trend del') || lowerQuery.includes('analizzare') || 
        lowerQuery.includes('analisi del') || lowerQuery.includes('fai un\'analisi') || 
        lowerQuery.includes('fai analisi') || lowerQuery.includes('analizza il')) {
      if (lowerQuery.includes('mercato') || lowerQuery.includes('mercati') || 
          lowerQuery.includes('immobiliare') || lowerQuery.includes('immobiliari') || 
          lowerQuery.includes('settore immobiliare') || lowerQuery.includes('real estate') || 
          lowerQuery.includes('mercato immobiliare') || lowerQuery.includes('mercati immobiliari') || 
          lowerQuery.includes('real estate market')) {
        console.log('🎯 [UserMemory] Market Intelligence - Analisi mercato riconosciuta');
        return {
          type: 'market_intelligence',
          confidence: 0.98,
          parameters: { action: 'analyze_market' }
        };
      }
    }
    
    // Query Market Intelligence - Opportunità
    if (lowerQuery.includes('opportunità') || lowerQuery.includes('occasioni') || 
        lowerQuery.includes('migliori') || lowerQuery.includes('migliori opportunità') || 
        lowerQuery.includes('investimenti') || lowerQuery.includes('affari') || 
        lowerQuery.includes('deal') || lowerQuery.includes('deals') || 
        lowerQuery.includes('offerte') || lowerQuery.includes('offerte speciali')) {
      console.log('🎯 [UserMemory] Market Intelligence - Opportunità riconosciuta');
      return {
        type: 'market_intelligence',
        confidence: 0.9,
        parameters: { action: 'get_opportunities' }
      };
    }
    
    // ===== PATTERN BASE =====
    
    // Query sui progetti (quanti progetti, miei progetti, portafoglio)
    if (lowerQuery.includes('progetti') && (
        lowerQuery.includes('quanti') || lowerQuery.includes('quanto') ||
        lowerQuery.includes('miei') || lowerQuery.includes('portafoglio') ||
        lowerQuery.includes('attivi') || lowerQuery.includes('ho')
      )) {
      console.log('🎯 [UserMemory] Query sui progetti riconosciuta');
      return {
        type: 'search',
        confidence: 0.95,
        parameters: { action: 'get_projects' }
      };
    }
    
    // Query per ottenere metriche
    if (lowerQuery.includes('quanto') || lowerQuery.includes('quanti') || 
        lowerQuery.includes('qual è') || lowerQuery.includes('dimmi')) {
      return {
        type: 'get_metric',
        confidence: 0.9,
        parameters: { metric: entities.find(e => e.type === 'metric')?.value }
      };
    }
    
    // Query di confronto
    if (lowerQuery.includes('confronta') || lowerQuery.includes('paragona') || 
        lowerQuery.includes('vs') || lowerQuery.includes('rispetto')) {
      return {
        type: 'compare',
        confidence: 0.8,
        parameters: { 
          projects: entities.filter(e => e.type === 'project').map(e => e.value),
          metric: entities.find(e => e.type === 'metric')?.value 
        }
      };
    }
    
    // Query di analisi
    if (lowerQuery.includes('analizza') || lowerQuery.includes('valuta') || 
        lowerQuery.includes('come sta')) {
      return {
        type: 'analyze',
        confidence: 0.8,
        parameters: { project: entities.find(e => e.type === 'project')?.value }
      };
    }

    // Query predittive
    if (lowerQuery.includes('previsioni') || lowerQuery.includes('forecast') || 
        lowerQuery.includes('predici') || lowerQuery.includes('trend') || 
        lowerQuery.includes('tendenze') || lowerQuery.includes('analisi predittiva')) {
      return {
        type: 'predictive',
        confidence: 0.9,
        parameters: { timeframe: this.extractTimeframe(query) }
      };
    }

    // Query di ottimizzazione
    if (lowerQuery.includes('ottimizza') || lowerQuery.includes('migliora') || 
        lowerQuery.includes('massimizza') || lowerQuery.includes('aumenta')) {
      return {
        type: 'optimize',
        confidence: 0.85,
        parameters: { 
          project: entities.find(e => e.type === 'project')?.value,
          metric: entities.find(e => e.type === 'metric')?.value
        }
      };
    }

    // Query Market Intelligence
    if (lowerQuery.includes('cerca') && (lowerQuery.includes('terreno') || lowerQuery.includes('immobile'))) {
      console.log('🏢 [UserMemory] Riconosciuto intent Market Intelligence: search_land');
      return {
        type: 'market_intelligence',
        confidence: 0.9,
        parameters: { 
          action: 'search_land',
          location: this.extractLocation(query),
          propertyType: this.extractPropertyType(query),
          budget: this.extractBudget(query),
          area: this.extractArea(query)
        }
      };
    }

    if (lowerQuery.includes('analisi') && lowerQuery.includes('mercato')) {
      console.log('🏢 [UserMemory] Riconosciuto intent Market Intelligence: analyze_market');
      return {
        type: 'market_intelligence',
        confidence: 0.9,
        parameters: { 
          action: 'analyze_market',
          location: this.extractLocation(query)
        }
      };
    }

    if (lowerQuery.includes('opportunità') || lowerQuery.includes('occasioni')) {
      console.log('🏢 [UserMemory] Riconosciuto intent Market Intelligence: get_opportunities');
      return {
        type: 'market_intelligence',
        confidence: 0.85,
        parameters: { 
          action: 'get_opportunities'
        }
      };
    }
    
    // Default: ricerca
    return {
      type: 'search',
      confidence: 0.5,
      parameters: {}
    };
  }

  /**
   * Estrai parametri dalla query
   */
  private parseQueryParameters(query: string, entities: Entity[]): ParsedQuery {
    const projectEntity = entities.find(e => e.type === 'project');
    const metricEntity = entities.find(e => e.type === 'metric');
    
    return {
      action: 'get',
      entity: projectEntity?.value || '',
      metric: metricEntity?.value,
      filters: {},
      timeframe: undefined,
      comparison: undefined
    };
  }

  /**
   * Esegui query semantica
   */
  private async executeSemanticQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('🔍 [UserMemory] Esecuzione query semantica:', naturalQuery.intent.type);
    
    try {
      switch (naturalQuery.intent.type) {
        case 'get_metric':
          return await this.executeGetMetricQuery(naturalQuery, profile);
        
        case 'compare':
          return await this.executeCompareQuery(naturalQuery, profile);
        
        case 'analyze':
          return await this.executeAnalyzeQuery(naturalQuery, profile);
        
        case 'predictive':
          return await this.executePredictiveQuery(naturalQuery, profile);
        
        case 'optimize':
          return await this.executeOptimizeQuery(naturalQuery, profile);
        
        case 'market_intelligence':
          return await this.executeMarketIntelligenceQuery(naturalQuery, profile);
        
        default:
          return await this.executeSearchQuery(naturalQuery, profile);
      }
    } catch (error) {
      console.error('❌ [UserMemory] Errore esecuzione query semantica:', error);
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'error',
        relatedProjects: [],
        suggestions: [],
        insights: []
      };
    }
  }

  /**
   * Esegui query per ottenere metriche
   */
  private async executeGetMetricQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    const projectName = naturalQuery.parsedQuery.entity;
    const metric = naturalQuery.parsedQuery.metric;
    
    // Trova progetto
    const project = profile.context.currentProjects.find(p => 
      p.name.toLowerCase().includes(projectName.toLowerCase())
    );
    
    if (!project) {
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'not_found',
        relatedProjects: profile.context.currentProjects.map(p => p.name),
        suggestions: ['Progetto non trovato. Ecco i tuoi progetti disponibili:'],
        insights: []
      };
    }
    
    if (!metric) {
      return {
        success: true,
        data: {
          project: project.name,
          metrics: project.keyMetrics
        },
        confidence: 0.9,
        source: 'user_memory',
        relatedProjects: [project.name],
        suggestions: [],
        insights: []
      };
    }
    
    const metricValue = project.keyMetrics[metric];
    
    if (metricValue === undefined) {
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'metric_not_found',
        relatedProjects: [project.name],
        suggestions: [`Metrica "${metric}" non disponibile per questo progetto`],
        insights: []
      };
    }
    
    return {
      success: true,
      data: {
        project: project.name,
        metric: metric,
        value: metricValue,
        unit: this.getMetricUnit(metric)
      },
      confidence: 0.95,
      source: 'user_memory',
      relatedProjects: [project.name],
      suggestions: [],
      insights: []
    };
  }

  /**
   * Esegui query di confronto
   */
  private async executeCompareQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('🔍 [UserMemory] Esecuzione query di confronto');
    
    const projects = profile.context.currentProjects;
    const projectNames = naturalQuery.intent.parameters?.projects || [];
    const metric = naturalQuery.intent.parameters?.metric;
    
    if (projectNames.length < 2) {
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'insufficient_data',
        relatedProjects: projects.map(p => p.name),
        suggestions: [
          'Specifica almeno due progetti da confrontare',
          'Prova: "Confronta Ciliegie con Villa Roma"',
          'Prova: "Confronta i budget dei miei progetti"'
        ],
        insights: []
      };
    }
    
    // Trova i progetti da confrontare
    const projectsToCompare = projects.filter(p => 
      projectNames.some(name => {
        const projectName = p.name.toLowerCase();
        const searchName = name.toLowerCase();
        return projectName.includes(searchName) || searchName.includes(projectName);
      })
    );
    
    if (projectsToCompare.length < 2) {
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'projects_not_found',
        relatedProjects: projects.map(p => p.name),
        suggestions: [
          'Progetti non trovati. Ecco i tuoi progetti disponibili:',
          ...projects.map(p => `- ${p.name}`)
        ],
        insights: []
      };
    }
    
    // Esegui confronto
    const comparison = this.performProjectComparison(projectsToCompare, metric);
    
    return {
      success: true,
      data: comparison,
      confidence: 0.9,
      source: 'user_memory',
      relatedProjects: projectsToCompare.map(p => p.name),
      suggestions: this.generateComparisonSuggestions(projectsToCompare),
      insights: this.generateComparisonInsights(comparison)
    };
  }

  /**
   * Esegui query di analisi
   */
  private async executeAnalyzeQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('🔍 [UserMemory] Esecuzione query di analisi');
    
    const projects = profile.context.currentProjects;
    const projectName = naturalQuery.parsedQuery.entity;
    const aspect = naturalQuery.parsedQuery.metric;
    
    if (!projectName) {
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'no_project_specified',
        relatedProjects: projects.map(p => p.name),
        suggestions: [
          'Specifica il progetto da analizzare',
          'Prova: "Analizza il progetto Ciliegie"',
          'Prova: "Come sta Villa Roma?"'
        ],
        insights: []
      };
    }
    
    // Trova il progetto da analizzare
    const project = projects.find(p => 
      p.name.toLowerCase().includes(projectName.toLowerCase())
    );
    
    if (!project) {
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'project_not_found',
        relatedProjects: projects.map(p => p.name),
        suggestions: [
          'Progetto non trovato. Ecco i tuoi progetti disponibili:',
          ...projects.map(p => `- ${p.name}`)
        ],
        insights: []
      };
    }
    
    // Esegui analisi del progetto
    const analysis = this.performProjectAnalysis(project, aspect);
    
    return {
      success: true,
      data: analysis,
      confidence: 0.95,
      source: 'user_memory',
      relatedProjects: [project.name],
      suggestions: this.generateAnalysisSuggestions(project),
      insights: this.generateAnalysisInsights(analysis)
    };
  }

  /**
   * Esegui query di ricerca
   */
  private async executeSearchQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('🔍 [UserMemory] Esecuzione query di ricerca');
    
    const projects = profile.context.currentProjects;
    
    // Gestione specifica per query sui progetti
    if (naturalQuery.intent.parameters.action === 'get_projects') {
      console.log('🎯 [UserMemory] Query specifica sui progetti');
      
      if (projects.length === 0) {
        return {
          success: true,
          data: {
            projects: [],
            totalCount: 0,
            message: 'Non hai ancora progetti nel tuo portafoglio. Crea il tuo primo progetto di fattibilità per iniziare!'
          },
          confidence: 1.0,
          source: 'user_memory',
          relatedProjects: [],
          suggestions: [
            'Crea un nuovo progetto di fattibilità',
            'Crea un business plan',
            'Inizia una ricerca di terreni'
          ],
          insights: []
        };
      }
      
      return {
        success: true,
        data: {
          projects: projects,
          totalCount: projects.length,
          message: `Hai ${projects.length} progetti nel tuo portafoglio`
        },
        confidence: 1.0,
        source: 'user_memory',
        relatedProjects: projects.map(p => p.name),
        suggestions: [
          'Visualizza i dettagli di un progetto specifico',
          'Confronta i progetti tra loro',
          'Analizza le performance del portafoglio'
        ],
        insights: this.generatePortfolioInsights(projects)
      };
    }
    
    if (projects.length === 0) {
      return {
        success: true,
        data: {
          projects: [],
          totalCount: 0,
          message: 'Non hai ancora progetti. Crea il tuo primo progetto!'
        },
        confidence: 1.0,
        source: 'user_memory',
        relatedProjects: [],
        suggestions: [
          'Crea un nuovo progetto di fattibilità',
          'Crea un business plan',
          'Inizia una ricerca di terreni'
        ],
        insights: []
      };
    }
    
    // Filtra progetti basandosi sui filtri della query
    let filteredProjects = projects;
    
    if (naturalQuery.parsedQuery.filters) {
      const filters = naturalQuery.parsedQuery.filters;
      
      if (filters.budget) {
        filteredProjects = filteredProjects.filter(p => 
          p.keyMetrics.budget && p.keyMetrics.budget >= filters.budget
        );
      }
      
      if (filters.area) {
        filteredProjects = filteredProjects.filter(p => 
          p.keyMetrics.totalArea && p.keyMetrics.totalArea >= filters.area
        );
      }
      
      if (filters.location) {
        filteredProjects = filteredProjects.filter(p => 
          p.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
    }
    
    // Ordina progetti per importanza e data
    const sortedProjects = filteredProjects.sort((a, b) => {
      // Prima per importanza
      const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];
      if (importanceDiff !== 0) return importanceDiff;
      
      // Poi per data di modifica
      return b.lastModified.getTime() - a.lastModified.getTime();
    });
    
    // Genera insights sui progetti
    const insights = this.generateProjectInsights(sortedProjects);
    
    return {
      success: true,
      data: {
        projects: sortedProjects,
        totalCount: sortedProjects.length,
        filteredCount: filteredProjects.length,
        summary: this.generateProjectSummary(sortedProjects)
      },
      confidence: 0.95,
      source: 'user_memory',
      relatedProjects: sortedProjects.map(p => p.name),
      suggestions: this.generateSearchSuggestions(sortedProjects),
      insights: insights
    };
  }

  /**
   * Ottieni unità di misura per metrica
   */
  private getMetricUnit(metric: string): string {
    const units: Record<string, string> = {
      'totalArea': 'mq',
      'budget': '€',
      'roi': '%',
      'margin': '%',
      'profit': '€',
      'timeline': 'mesi'
    };
    
    return units[metric] || '';
  }

  /**
   * Genera insights sui progetti
   */
  private generateProjectInsights(projects: ProjectContext[]): string[] {
    const insights: string[] = [];
    
    if (projects.length === 0) return insights;
    
    // Insight su numero progetti
    if (projects.length > 5) {
      insights.push(`Hai ${projects.length} progetti attivi - ottima diversificazione del portafoglio!`);
    } else if (projects.length === 1) {
      insights.push('Hai un solo progetto attivo. Considera di diversificare per ridurre i rischi.');
    }
    
    // Insight su budget totale
    const totalBudget = projects.reduce((sum, p) => sum + (p.keyMetrics.budget || 0), 0);
    if (totalBudget > 0) {
      insights.push(`Investimento totale: €${totalBudget.toLocaleString('it-IT')}`);
    }
    
    // Insight su performance
    const highROIProjects = projects.filter(p => (p.keyMetrics.roi || 0) > 20);
    if (highROIProjects.length > 0) {
      insights.push(`${highROIProjects.length} progetti con ROI superiore al 20% - ottima performance!`);
    }
    
    // Insight su location
    const locations = projects.map(p => p.location);
    const uniqueLocations = [...new Set(locations)];
    if (uniqueLocations.length > 1) {
      insights.push(`Progetti in ${uniqueLocations.length} città diverse - buona diversificazione geografica`);
    }
    
    return insights;
  }

  /**
   * Genera riassunto progetti
   */
  private generateProjectSummary(projects: ProjectContext[]): any {
    if (projects.length === 0) {
      return {
        totalProjects: 0,
        totalBudget: 0,
        averageROI: 0,
        topLocation: null,
        statusBreakdown: {}
      };
    }
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.keyMetrics.budget || 0), 0);
    const averageROI = projects.reduce((sum, p) => sum + (p.keyMetrics.roi || 0), 0) / projects.length;
    
    // Trova location più comune
    const locationCounts = projects.reduce((acc, p) => {
      acc[p.location] = (acc[p.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topLocation = Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
    
    // Breakdown per status
    const statusBreakdown = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalProjects: projects.length,
      totalBudget,
      averageROI: Math.round(averageROI * 10) / 10,
      topLocation,
      statusBreakdown
    };
  }

  /**
   * Genera suggerimenti per ricerca
   */
  private generateSearchSuggestions(projects: ProjectContext[]): string[] {
    const suggestions: string[] = [];
    
    if (projects.length === 0) {
      suggestions.push('Crea il tuo primo progetto di fattibilità');
      suggestions.push('Inizia una ricerca di terreni');
      suggestions.push('Sviluppa un business plan');
      return suggestions;
    }
    
    // Suggerimenti basati sui progetti esistenti
    const highBudgetProjects = projects.filter(p => (p.keyMetrics.budget || 0) > 500000);
    if (highBudgetProjects.length > 0) {
      suggestions.push(`Analizza i progetti ad alto budget (${highBudgetProjects.length} progetti)`);
    }
    
    const recentProjects = projects.filter(p => 
      (Date.now() - p.lastModified.getTime()) < 7 * 24 * 60 * 60 * 1000
    );
    if (recentProjects.length > 0) {
      suggestions.push(`Controlla i progetti recenti (${recentProjects.length} progetti)`);
    }
    
    // Suggerimenti generici
    suggestions.push('Confronta i progetti per performance');
    suggestions.push('Analizza il progetto con il ROI migliore');
    suggestions.push('Crea un nuovo progetto');
    
    return suggestions;
  }

  /**
   * Esegui confronto tra progetti
   */
  private performProjectComparison(projects: ProjectContext[], metric?: string): any {
    const comparison = {
      projects: projects.map(p => ({
        name: p.name,
        location: p.location,
        status: p.status,
        metrics: p.keyMetrics,
        lastModified: p.lastModified,
        importance: p.importance
      })),
      comparison: {} as Record<string, any>,
      winner: null as string | null,
      insights: [] as string[]
    };
    
    if (metric) {
      // Confronto per metrica specifica
      const metricValues = projects.map(p => ({
        name: p.name,
        value: p.keyMetrics[metric] || 0
      }));
      
      metricValues.sort((a, b) => b.value - a.value);
      comparison.comparison[metric] = metricValues;
      comparison.winner = metricValues[0].name;
      
      // Calcola differenze percentuali
      if (metricValues.length >= 2) {
        const best = metricValues[0].value;
        const second = metricValues[1].value;
        const difference = ((best - second) / second) * 100;
        comparison.insights.push(
          `${metricValues[0].name} supera ${metricValues[1].name} del ${difference.toFixed(1)}%`
        );
      }
    } else {
      // Confronto completo
      const metrics = ['budget', 'totalArea', 'roi', 'margin', 'timeline'];
      
      metrics.forEach(metricKey => {
        const metricValues = projects.map(p => ({
          name: p.name,
          value: p.keyMetrics[metricKey] || 0
        }));
        
        metricValues.sort((a, b) => b.value - a.value);
        comparison.comparison[metricKey] = metricValues;
      });
      
      // Determina il vincitore generale basato su ROI
      const roiValues = projects.map(p => ({
        name: p.name,
        value: p.keyMetrics.roi || 0
      }));
      roiValues.sort((a, b) => b.value - a.value);
      comparison.winner = roiValues[0].name;
    }
    
    return comparison;
  }

  /**
   * Genera suggerimenti per confronto
   */
  private generateComparisonSuggestions(projects: ProjectContext[]): string[] {
    const suggestions: string[] = [];
    
    suggestions.push(`Analizza ${projects[0].name} in dettaglio`);
    suggestions.push(`Analizza ${projects[1].name} in dettaglio`);
    suggestions.push('Confronta altri progetti');
    suggestions.push('Crea un nuovo progetto');
    
    return suggestions;
  }

  /**
   * Genera insights per confronto
   */
  private generateComparisonInsights(comparison: any): string[] {
    const insights: string[] = [];
    
    if (comparison.winner) {
      insights.push(`Il progetto migliore è ${comparison.winner}`);
    }
    
    if (comparison.insights.length > 0) {
      insights.push(...comparison.insights);
    }
    
    // Insight aggiuntivi
    const projects = comparison.projects;
    if (projects.length >= 2) {
      const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.metrics.budget || 0), 0);
      if (totalBudget > 0) {
        insights.push(`Investimento totale confrontato: €${totalBudget.toLocaleString('it-IT')}`);
      }
    }
    
    return insights;
  }

  /**
   * 🔮 Esegui query predittiva
   */
  private async executePredictiveQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('🔮 [UserMemory] Esecuzione query predittiva');
    
    try {
      const timeframe = naturalQuery.intent.parameters?.timeframe || '6 mesi';
      const analysis = await this.generatePredictiveAnalysis(
        profile.userId, 
        profile.userEmail, 
        timeframe
      );

      return {
        success: true,
        data: {
          type: 'predictive_analysis',
          marketForecast: analysis.marketForecast,
          projectOptimizations: analysis.projectOptimizations,
          strategicRecommendations: analysis.strategicRecommendations,
          riskAssessment: analysis.riskAssessment
        },
        confidence: 0.85,
        source: 'predictive_analytics',
        relatedProjects: profile.context.currentProjects.map(p => p.name),
        suggestions: [
          'Visualizza i dettagli delle ottimizzazioni',
          'Analizza i rischi identificati',
          'Implementa le raccomandazioni strategiche'
        ],
        insights: [
          `Analisi predittiva completata per ${timeframe}`,
          `Identificate ${analysis.projectOptimizations.length} ottimizzazioni possibili`,
          `Rilevati ${analysis.riskAssessment.length} rischi potenziali`
        ]
      };
    } catch (error) {
      console.error('❌ [UserMemory] Errore query predittiva:', error);
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'error',
        relatedProjects: [],
        suggestions: ['Riprova con una query più specifica'],
        insights: ['Errore nell\'analisi predittiva']
      };
    }
  }

  /**
   * ⚡ Esegui query di ottimizzazione
   */
  private async executeOptimizeQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('⚡ [UserMemory] Esecuzione query di ottimizzazione');
    
    try {
      const projectName = naturalQuery.intent.parameters?.project;
      const metric = naturalQuery.intent.parameters?.metric;

      if (projectName) {
        // Ottimizza progetto specifico
        const project = profile.context.currentProjects.find(p => 
          p.name.toLowerCase().includes(projectName.toLowerCase())
        );

        if (!project) {
          return {
            success: false,
            data: null,
            confidence: 0,
            source: 'project_not_found',
            relatedProjects: profile.context.currentProjects.map(p => p.name),
            suggestions: ['Specifica un progetto valido'],
            insights: ['Progetto non trovato']
          };
        }

        const optimization = await this.optimizeProject(
          project.id, 
          profile.userId, 
          profile.userEmail
        );

        if (!optimization) {
          throw new Error('Errore nell\'ottimizzazione del progetto');
        }

        return {
          success: true,
          data: {
            type: 'project_optimization',
            project: project.name,
            optimization: optimization
          },
          confidence: 0.88,
          source: 'optimization_engine',
          relatedProjects: [project.name],
          suggestions: [
            'Implementa le ottimizzazioni suggerite',
            'Analizza il ROI potenziale',
            'Valuta i costi di implementazione'
          ],
          insights: [
            `Ottimizzazione completata per ${project.name}`,
            `ROI potenziale: +${optimization.potentialROI.toFixed(1)}%`,
            `Payback period: ${optimization.paybackPeriod.toFixed(1)} mesi`
          ]
        };
      } else {
        // Ottimizza tutti i progetti
        const optimizations = [];
        for (const project of profile.context.currentProjects) {
          const optimization = await this.optimizeProject(
            project.id, 
            profile.userId, 
            profile.userEmail
          );
          if (optimization) {
            optimizations.push(optimization);
          }
        }

        return {
          success: true,
          data: {
            type: 'portfolio_optimization',
            optimizations: optimizations,
            totalPotentialROI: optimizations.reduce((sum, opt) => sum + opt.potentialROI, 0)
          },
          confidence: 0.82,
          source: 'optimization_engine',
          relatedProjects: profile.context.currentProjects.map(p => p.name),
          suggestions: [
            'Implementa le ottimizzazioni prioritarie',
            'Analizza l\'impatto complessivo',
            'Pianifica l\'implementazione graduale'
          ],
          insights: [
            `Ottimizzazioni per ${optimizations.length} progetti`,
            `ROI potenziale totale: +${optimizations.reduce((sum, opt) => sum + opt.potentialROI, 0).toFixed(1)}%`,
            'Focus sui progetti con maggiore potenziale'
          ]
        };
      }
    } catch (error) {
      console.error('❌ [UserMemory] Errore query ottimizzazione:', error);
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'error',
        relatedProjects: [],
        suggestions: ['Riprova con una query più specifica'],
        insights: ['Errore nell\'ottimizzazione']
      };
    }
  }

  /**
   * 📅 Estrai timeframe dalla query
   */
  private extractTimeframe(query: string): string {
    const timeframeMatch = query.match(/(\d+)\s*(mese|mesi|month|months|anno|anni|year|years)/i);
    if (timeframeMatch) {
      return `${timeframeMatch[1]} ${timeframeMatch[2]}`;
    }
    return '6 mesi';
  }

  /**
   * 🏢 Esegui query Market Intelligence
   */
  private async executeMarketIntelligenceQuery(
    naturalQuery: NaturalQuery, 
    profile: UserMemoryProfile
  ): Promise<QueryResult> {
    console.log('🏢 [UserMemory] Esecuzione query Market Intelligence');
    
    try {
      const action = naturalQuery.intent.parameters?.action;
      const location = naturalQuery.intent.parameters?.location;
      const propertyType = naturalQuery.intent.parameters?.propertyType;
      const budget = naturalQuery.intent.parameters?.budget;
      const area = naturalQuery.intent.parameters?.area;

      // Costruisci query per Market Intelligence OS
      const marketQuery: MarketIntelligenceQuery = {
        type: action as any,
        criteria: {
          location,
          propertyType: propertyType as any,
          minBudget: budget?.min,
          maxBudget: budget?.max,
          minArea: area?.min,
          maxArea: area?.max,
          email: profile.userEmail
        },
        location,
        timeframe: '6 mesi'
      };

      // Processa con Market Intelligence OS
      // const result = await marketIntelligenceOS.processMarketIntelligenceQuery(marketQuery, profile);
      const result = { success: false, data: null, suggestions: [], message: 'Market Intelligence non disponibile' };

      return {
        success: result.success,
        data: {
          type: 'market_intelligence',
          ...result.data
        },
        confidence: 0.9,
        source: 'market_intelligence_os',
        relatedProjects: profile.context.currentProjects.map(p => p.name),
        suggestions: result.suggestions,
        insights: [result.message]
      };
    } catch (error) {
      console.error('❌ [UserMemory] Errore query Market Intelligence:', error);
      return {
        success: false,
        data: null,
        confidence: 0,
        source: 'error',
        relatedProjects: [],
        suggestions: ['Riprova con una query più specifica'],
        insights: ['Errore nella ricerca Market Intelligence']
      };
    }
  }

  /**
   * 🏙️ Estrai location dalla query
   */
  private extractLocation(query: string): string | undefined {
    const cities = ['Milano', 'Roma', 'Napoli', 'Torino', 'Firenze', 'Bologna', 'Venezia', 'Genova'];
    const found = cities.find(city => query.toLowerCase().includes(city.toLowerCase()));
    return found;
  }

  /**
   * 🏠 Estrai tipo proprietà dalla query
   */
  private extractPropertyType(query: string): string | undefined {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('residenziale') || lowerQuery.includes('casa') || lowerQuery.includes('appartamento')) {
      return 'residenziale';
    }
    if (lowerQuery.includes('commerciale') || lowerQuery.includes('negozio') || lowerQuery.includes('ufficio')) {
      return 'commerciale';
    }
    if (lowerQuery.includes('industriale') || lowerQuery.includes('capannone') || lowerQuery.includes('magazzino')) {
      return 'industriale';
    }
    if (lowerQuery.includes('misto')) {
      return 'misto';
    }
    return undefined;
  }

  /**
   * 💰 Estrai budget dalla query
   */
  private extractBudget(query: string): { min: number; max: number } | undefined {
    const budgetMatch = query.match(/(\d+)\s*(?:-|a|fino a)\s*(\d+)\s*(?:euro|€|k|mila)/i);
    if (budgetMatch) {
      const min = parseInt(budgetMatch[1]) * (budgetMatch[0].includes('k') ? 1000 : 1);
      const max = parseInt(budgetMatch[2]) * (budgetMatch[0].includes('k') ? 1000 : 1);
      return { min, max };
    }
    
    const singleBudgetMatch = query.match(/(\d+)\s*(?:euro|€|k|mila)/i);
    if (singleBudgetMatch) {
      const budget = parseInt(singleBudgetMatch[1]) * (singleBudgetMatch[0].includes('k') ? 1000 : 1);
      return { min: budget * 0.8, max: budget * 1.2 };
    }
    
    return undefined;
  }

  /**
   * 📏 Estrai area dalla query
   */
  private extractArea(query: string): { min: number; max: number } | undefined {
    const areaMatch = query.match(/(\d+)\s*(?:-|a|fino a)\s*(\d+)\s*(?:mq|m²|metri)/i);
    if (areaMatch) {
      return { min: parseInt(areaMatch[1]), max: parseInt(areaMatch[2]) };
    }
    
    const singleAreaMatch = query.match(/(\d+)\s*(?:mq|m²|metri)/i);
    if (singleAreaMatch) {
      const area = parseInt(singleAreaMatch[1]);
      return { min: area * 0.8, max: area * 1.2 };
    }
    
    return undefined;
  }

  /**
   * Esegui analisi del progetto
   */
  private performProjectAnalysis(project: ProjectContext, aspect?: string): any {
    const analysis = {
      project: {
        name: project.name,
        location: project.location,
        status: project.status,
        importance: project.importance,
        lastModified: project.lastModified
      },
      metrics: project.keyMetrics,
      analysis: {} as Record<string, any>,
      recommendations: [] as string[],
      risks: [] as string[],
      opportunities: [] as string[]
    };
    
    // Analisi per aspetto specifico
    if (aspect) {
      const value = project.keyMetrics[aspect];
      if (value !== undefined) {
        analysis.analysis[aspect] = {
          value: value,
          unit: this.getMetricUnit(aspect),
          rating: this.rateMetric(aspect, value),
          description: this.describeMetric(aspect, value)
        };
      }
    } else {
      // Analisi completa
      Object.entries(project.keyMetrics).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          analysis.analysis[key] = {
            value: value,
            unit: this.getMetricUnit(key),
            rating: this.rateMetric(key, value),
            description: this.describeMetric(key, value)
          };
        }
      });
    }
    
    // Genera raccomandazioni
    analysis.recommendations = this.generateProjectRecommendations(project);
    
    // Identifica rischi
    analysis.risks = this.identifyProjectRisks(project);
    
    // Identifica opportunità
    analysis.opportunities = this.identifyProjectOpportunities(project);
    
    return analysis;
  }

  /**
   * Valuta una metrica
   */
  private rateMetric(metric: string, value: number): 'excellent' | 'good' | 'average' | 'poor' {
    const thresholds: Record<string, { excellent: number; good: number; average: number }> = {
      'roi': { excellent: 25, good: 20, average: 15 },
      'margin': { excellent: 30, good: 25, average: 20 },
      'budget': { excellent: 1000000, good: 500000, average: 200000 },
      'totalArea': { excellent: 2000, good: 1000, average: 500 },
      'timeline': { excellent: 6, good: 12, average: 18 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'average';
    
    if (value >= threshold.excellent) return 'excellent';
    if (value >= threshold.good) return 'good';
    if (value >= threshold.average) return 'average';
    return 'poor';
  }

  /**
   * Descrivi una metrica
   */
  private describeMetric(metric: string, value: number): string {
    const rating = this.rateMetric(metric, value);
    const descriptions: Record<string, Record<string, string>> = {
      'roi': {
        excellent: 'ROI eccezionale - investimento molto redditizio',
        good: 'ROI buono - investimento redditizio',
        average: 'ROI nella media - investimento moderatamente redditizio',
        poor: 'ROI basso - investimento poco redditizio'
      },
      'margin': {
        excellent: 'Margine eccellente - profittabilità molto alta',
        good: 'Margine buono - profittabilità alta',
        average: 'Margine nella media - profittabilità moderata',
        poor: 'Margine basso - profittabilità limitata'
      },
      'budget': {
        excellent: 'Budget elevato - progetto di grande portata',
        good: 'Budget buono - progetto di media portata',
        average: 'Budget nella media - progetto di piccola portata',
        poor: 'Budget limitato - progetto di piccola portata'
      },
      'totalArea': {
        excellent: 'Superficie molto ampia - progetto di grande scala',
        good: 'Superficie ampia - progetto di media scala',
        average: 'Superficie nella media - progetto di piccola scala',
        poor: 'Superficie limitata - progetto di piccola scala'
      },
      'timeline': {
        excellent: 'Timeline molto veloce - progetto rapido',
        good: 'Timeline veloce - progetto tempestivo',
        average: 'Timeline nella media - progetto standard',
        poor: 'Timeline lunga - progetto lento'
      }
    };
    
    return descriptions[metric]?.[rating] || 'Valore nella media';
  }

  /**
   * Genera raccomandazioni per il progetto
   */
  private generateProjectRecommendations(project: ProjectContext): string[] {
    const recommendations: string[] = [];
    
    // Raccomandazioni basate su ROI
    if (project.keyMetrics.roi && project.keyMetrics.roi < 15) {
      recommendations.push('Considera di ottimizzare i costi per migliorare il ROI');
    }
    
    // Raccomandazioni basate su budget
    if (project.keyMetrics.budget && project.keyMetrics.budget > 1000000) {
      recommendations.push('Progetto ad alto budget - monitora attentamente i costi');
    }
    
    // Raccomandazioni basate su area
    if (project.keyMetrics.totalArea && project.keyMetrics.totalArea > 1500) {
      recommendations.push('Progetto di grande superficie - considera la suddivisione in fasi');
    }
    
    // Raccomandazioni basate su status
    if (project.status === 'PIANIFICAZIONE') {
      recommendations.push('Progetto in pianificazione - definisci i dettagli operativi');
    } else if (project.status === 'IN_CORSO') {
      recommendations.push('Progetto in corso - monitora i progressi regolarmente');
    }
    
    return recommendations;
  }

  /**
   * Identifica rischi del progetto
   */
  private identifyProjectRisks(project: ProjectContext): string[] {
    const risks: string[] = [];
    
    // Rischio budget
    if (project.keyMetrics.budget && project.keyMetrics.budget > 1000000) {
      risks.push('Rischio di sforamento budget - progetto ad alto investimento');
    }
    
    // Rischio timeline
    if (project.keyMetrics.timeline && project.keyMetrics.timeline > 24) {
      risks.push('Rischio di ritardo - timeline molto lunga');
    }
    
    // Rischio ROI
    if (project.keyMetrics.roi && project.keyMetrics.roi < 10) {
      risks.push('Rischio di bassa redditività - ROI molto basso');
    }
    
    // Rischio status
    if (project.status === 'PIANIFICAZIONE') {
      risks.push('Rischio di stallo - progetto in pianificazione da tempo');
    }
    
    return risks;
  }

  /**
   * Identifica opportunità del progetto
   */
  private identifyProjectOpportunities(project: ProjectContext): string[] {
    const opportunities: string[] = [];
    
    // Opportunità ROI
    if (project.keyMetrics.roi && project.keyMetrics.roi > 20) {
      opportunities.push('Opportunità di espansione - ROI molto alto');
    }
    
    // Opportunità budget
    if (project.keyMetrics.budget && project.keyMetrics.budget < 500000) {
      opportunities.push('Opportunità di scalabilità - budget contenuto');
    }
    
    // Opportunità area
    if (project.keyMetrics.totalArea && project.keyMetrics.totalArea > 1000) {
      opportunities.push('Opportunità di diversificazione - superficie ampia');
    }
    
    // Opportunità status
    if (project.status === 'IN_CORSO') {
      opportunities.push('Opportunità di accelerazione - progetto già avviato');
    }
    
    return opportunities;
  }

  /**
   * Genera suggerimenti per analisi
   */
  private generateAnalysisSuggestions(project: ProjectContext): string[] {
    const suggestions: string[] = [];
    
    suggestions.push(`Confronta ${project.name} con altri progetti`);
    suggestions.push(`Analizza le performance di ${project.name}`);
    suggestions.push(`Ottimizza ${project.name}`);
    suggestions.push('Crea un nuovo progetto');
    
    return suggestions;
  }

  /**
   * Genera insights per analisi
   */
  private generateAnalysisInsights(analysis: any): string[] {
    const insights: string[] = [];
    
    if (analysis.recommendations.length > 0) {
      insights.push(`Raccomandazioni: ${analysis.recommendations.length} suggerimenti per ottimizzare il progetto`);
    }
    
    if (analysis.risks.length > 0) {
      insights.push(`Rischi identificati: ${analysis.risks.length} aree da monitorare`);
    }
    
    if (analysis.opportunities.length > 0) {
      insights.push(`Opportunità: ${analysis.opportunities.length} possibilità di miglioramento`);
    }
    
    return insights;
  }

  /**
   * Genera insights proattivi
   */
  private async generateProactiveInsights(
    profile: UserMemoryProfile, 
    result: QueryResult
  ): Promise<Recommendation[]> {
    const insights: Recommendation[] = [];
    
    // Insight basato su query
    if (result.success && result.data?.metric === 'totalArea') {
      const area = result.data.value;
      if (area > 1000) {
        insights.push({
          id: `insight-large-area-${Date.now()}`,
          type: 'optimization',
          title: 'Progetto di Grande Superficie',
          description: `Il progetto "${result.data.project}" ha ${area} mq. Considera la suddivisione in unità più piccole per ottimizzare la vendita.`,
          priority: 'medium',
          actionRequired: false,
          relatedProject: result.data.project,
          confidence: 0.8,
          createdAt: new Date()
        });
      }
    }
    
    return insights;
  }

  /**
   * Genera suggerimenti
   */
  private async generateSuggestions(
    profile: UserMemoryProfile, 
    result: QueryResult
  ): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (!result.success) {
      suggestions.push('Prova a riformulare la domanda');
      suggestions.push('Usa il nome esatto del progetto');
      suggestions.push('Chiedi "Mostrami tutti i miei progetti"');
    }
    
    if (result.relatedProjects.length > 0) {
      suggestions.push(`Prova: "Analizza il progetto ${result.relatedProjects[0]}"`);
      suggestions.push(`Prova: "Confronta ${result.relatedProjects[0]} con altri progetti"`);
    }
    
    return suggestions;
  }

  /**
   * Aggiorna memoria utente
   */
  private async updateUserMemory(
    profile: UserMemoryProfile, 
    query: string, 
    result: QueryResult
  ): Promise<void> {
    // Aggiungi query alla cronologia
    profile.context.recentSearches.unshift({
      query,
      results: result.relatedProjects.length,
      timestamp: new Date(),
      filters: {},
      success: result.success
    });
    
    // Mantieni solo ultime 20 ricerche
    if (profile.context.recentSearches.length > 20) {
      profile.context.recentSearches = profile.context.recentSearches.slice(0, 20);
    }
    
    // Aggiorna timestamp
    profile.lastUpdated = new Date();
    
    // Salva in cache
    this.memoryCache.set(profile.userId, profile);
  }

  /**
   * Calcola l'importanza di un progetto basata sui suoi dati
   */
  private calculateProjectImportance(data: any): 'high' | 'medium' | 'low' {
    // Calcola importanza basata su ROI, budget e status
    const roi = data.results?.roi || 0;
    const budget = data.costs?.total || 0;
    const status = data.status;
    
    // Progetti con ROI alto e budget significativo sono importanti
    if (roi > 20 && budget > 500000) {
      return 'high';
    }
    
    // Progetti in corso o con ROI medio sono mediamente importanti
    if (status === 'IN_CORSO' || (roi > 10 && budget > 200000)) {
      return 'medium';
    }
    
    // Altri progetti sono di bassa importanza
    return 'low';
  }

  /**
   * Genera insights per il portafoglio progetti
   */
  private generatePortfolioInsights(projects: ProjectContext[]): string[] {
    const insights: string[] = [];
    
    if (projects.length === 0) return insights;
    
    // Calcola metriche aggregate
    const totalBudget = projects.reduce((sum, p) => sum + (p.keyMetrics.budget || 0), 0);
    const avgROI = projects.reduce((sum, p) => sum + (p.keyMetrics.roi || 0), 0) / projects.length;
    const totalArea = projects.reduce((sum, p) => sum + (p.keyMetrics.totalArea || 0), 0);
    
    // Insights basati sui dati
    if (avgROI > 15) {
      insights.push(`Il tuo portafoglio ha un ROI medio eccellente del ${avgROI.toFixed(1)}%`);
    } else if (avgROI > 10) {
      insights.push(`Il tuo portafoglio ha un ROI medio buono del ${avgROI.toFixed(1)}%`);
    }
    
    if (totalBudget > 2000000) {
      insights.push(`Hai un portafoglio di investimenti significativo (€${(totalBudget / 1000000).toFixed(1)}M)`);
    }
    
    if (totalArea > 20000) {
      insights.push(`Gestisci una superficie totale di ${(totalArea / 1000).toFixed(1)}K m²`);
    }
    
    // Insights sui progetti più importanti
    const highImportanceProjects = projects.filter(p => p.importance === 'high');
    if (highImportanceProjects.length > 0) {
      insights.push(`Hai ${highImportanceProjects.length} progetti ad alta priorità nel portafoglio`);
    }
    
    return insights;
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const userMemoryService = new UserMemoryService();
