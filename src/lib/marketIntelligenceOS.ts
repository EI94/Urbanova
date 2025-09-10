/**
 * 🏢 MARKET INTELLIGENCE OS - SUPER EVOLUTO
 * Sistema intelligente per ricerca automatica terreni e opportunità immobiliari
 * Superpotere per sviluppatori immobiliari
 */

import { UserMemoryProfile } from './userMemoryService';

export interface LandSearchCriteria {
  location: string;
  propertyType: 'residenziale' | 'commerciale' | 'misto' | 'uffici' | 'industriale';
  minArea: number;
  maxArea: number;
  minBudget: number;
  maxBudget: number;
  maxPricePerSqm: number;
  features: string[];
  timeline: string;
  email: string;
  frequency: 'immediata' | 'settimanale' | 'mensile';
  scheduleTime?: string; // per ricerche programmate
}

export interface LandOpportunity {
  id: string;
  title: string;
  location: string;
  address: string;
  area: number;
  price: number;
  pricePerSqm: number;
  propertyType: string;
  features: string[];
  images: string[];
  description: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  urgency: 'high' | 'medium' | 'low';
  score: number; // 0-100
  matchPercentage: number;
  lastUpdated: Date;
  source: 'portale' | 'agenzia' | 'privato' | 'asta';
  status: 'available' | 'under_offer' | 'sold' | 'withdrawn';
}

export interface MarketAnalysis {
  location: string;
  averagePrice: number;
  priceTrend: 'up' | 'down' | 'stable';
  priceChange: number;
  demandLevel: 'high' | 'medium' | 'low';
  supplyLevel: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  opportunities: number;
  risks: string[];
  recommendations: string[];
  confidence: number;
}

export interface SearchResult {
  searchId: string;
  criteria: LandSearchCriteria;
  opportunities: LandOpportunity[];
  marketAnalysis: MarketAnalysis;
  totalFound: number;
  bestMatches: LandOpportunity[];
  alerts: string[];
  nextSearchDate?: Date;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  lastExecuted: Date;
}

export interface MarketIntelligenceQuery {
  type: 'search_land' | 'analyze_market' | 'get_opportunities' | 'schedule_search' | 'compare_locations';
  criteria?: Partial<LandSearchCriteria>;
  location?: string;
  timeframe?: string;
  filters?: Record<string, any>;
}

export class MarketIntelligenceOS {
  private static instance: MarketIntelligenceOS;
  private activeSearches: Map<string, SearchResult> = new Map();
  private marketData: Map<string, MarketAnalysis> = new Map();
  private searchHistory: SearchResult[] = [];

  private constructor() {
    this.initializeMarketData();
  }

  public static getInstance(): MarketIntelligenceOS {
    if (!MarketIntelligenceOS.instance) {
      MarketIntelligenceOS.instance = new MarketIntelligenceOS();
    }
    return MarketIntelligenceOS.instance;
  }

  /**
   * 🎯 PROCESSO PRINCIPALE: Gestisce richieste intelligenti di Market Intelligence
   */
  async processMarketIntelligenceQuery(
    query: MarketIntelligenceQuery,
    userProfile: UserMemoryProfile
  ): Promise<{
    success: boolean;
    data: any;
    message: string;
    suggestions: string[];
    actions: Array<{type: string, label: string, url: string}>;
  }> {
    console.log('🏢 [MarketIntelligenceOS] Processando query:', query.type);

    try {
      switch (query.type) {
        case 'search_land':
          return await this.handleLandSearch(query, userProfile);
        
        case 'analyze_market':
          return await this.handleMarketAnalysis(query, userProfile);
        
        case 'get_opportunities':
          return await this.handleGetOpportunities(query, userProfile);
        
        case 'schedule_search':
          return await this.handleScheduleSearch(query, userProfile);
        
        case 'compare_locations':
          return await this.handleCompareLocations(query, userProfile);
        
        default:
          throw new Error('Tipo di query non supportato');
      }
    } catch (error) {
      console.error('❌ [MarketIntelligenceOS] Errore processamento:', error);
      return {
        success: false,
        data: null,
        message: 'Si è verificato un errore nel processamento della richiesta',
        suggestions: ['Riprova con una richiesta più specifica'],
        actions: []
      };
    }
  }

  /**
   * 🔍 Gestisce ricerca terreni intelligente
   */
  private async handleLandSearch(
    query: MarketIntelligenceQuery,
    userProfile: UserMemoryProfile
  ): Promise<any> {
    const criteria = query.criteria;
    
    if (!criteria) {
      return {
        success: false,
        data: null,
        message: 'Per cercare terreni, ho bisogno di più informazioni. Dimmi:',
        suggestions: [
          'In quale zona vuoi cercare?',
          'Che tipo di proprietà ti interessa?',
          'Qual è il tuo budget massimo?',
          'Che area minima ti serve?'
        ],
        actions: []
      };
    }

    // Valida criteri essenziali
    const missingFields = this.validateSearchCriteria(criteria);
    if (missingFields.length > 0) {
      return {
        success: false,
        data: null,
        message: `Per iniziare la ricerca, ho bisogno di: ${missingFields.join(', ')}`,
        suggestions: missingFields.map(field => `Specifica ${field}`),
        actions: []
      };
    }

    // Esegui ricerca
    const searchResult = await this.executeLandSearch(criteria, userProfile);
    
    return {
      success: true,
      data: {
        type: 'land_search_result',
        searchResult: searchResult
      },
      message: `🔍 **Ricerca Terreni Completata**\n\nHo trovato **${searchResult.totalFound}** opportunità che corrispondono ai tuoi criteri:\n\n📍 **Zona**: ${criteria.location}\n🏠 **Tipo**: ${criteria.propertyType}\n📏 **Area**: ${criteria.minArea}-${criteria.maxArea} m²\n💰 **Budget**: €${criteria.minBudget.toLocaleString()} - €${criteria.maxBudget.toLocaleString()}\n\n**Migliori Opportunità:**\n${searchResult.bestMatches.slice(0, 3).map((opp, i) => 
          `${i+1}. **${opp.title}** - ${opp.location}\n   📏 ${opp.area} m² | 💰 €${opp.price.toLocaleString()} (€${opp.pricePerSqm.toLocaleString()}/m²)\n   ⭐ Punteggio: ${opp.score}/100 | 🎯 Match: ${opp.matchPercentage}%`
        ).join('\n\n')}`,
      suggestions: [
        'Mostra tutti i risultati',
        'Filtra per prezzo',
        'Confronta le migliori opportunità',
        'Programma ricerche automatiche'
      ],
      actions: [
        { type: 'view_all', label: 'Vedi Tutti i Risultati', url: '/dashboard/market-intelligence' },
        { type: 'schedule', label: 'Programma Ricerca', url: '/dashboard/market-intelligence/schedule' },
        { type: 'compare', label: 'Confronta Opportunità', url: '/dashboard/market-intelligence/compare' }
      ]
    };
  }

  /**
   * 📊 Gestisce analisi di mercato
   */
  private async handleMarketAnalysis(
    query: MarketIntelligenceQuery,
    userProfile: UserMemoryProfile
  ): Promise<any> {
    const location = query.location || 'Milano';
    const analysis = await this.analyzeMarket(location);

    return {
      success: true,
      data: {
        type: 'market_analysis',
        analysis: analysis
      },
      message: `📊 **Analisi di Mercato - ${location}**\n\n💰 **Prezzo Medio**: €${analysis.averagePrice.toLocaleString()}/m²\n📈 **Trend**: ${analysis.priceTrend === 'up' ? '📈 Crescita' : analysis.priceTrend === 'down' ? '📉 Calo' : '➡️ Stabile'} (${analysis.priceChange > 0 ? '+' : ''}${analysis.priceChange}%)\n\n🎯 **Domanda**: ${this.getDemandLevel(analysis.demandLevel)}\n📦 **Offerta**: ${this.getSupplyLevel(analysis.supplyLevel)}\n🏆 **Competizione**: ${this.getCompetitionLevel(analysis.competition)}\n\n💡 **Opportunità Identificate**: ${analysis.opportunities}\n\n**Raccomandazioni:**\n${analysis.recommendations.map(rec => `• ${rec}`).join('\n')}`,
      suggestions: [
        'Confronta con altre zone',
        'Analizza trend storici',
        'Cerca opportunità specifiche',
        'Programma monitoraggio continuo'
      ],
      actions: [
        { type: 'compare', label: 'Confronta Zone', url: '/dashboard/market-intelligence/compare' },
        { type: 'search', label: 'Cerca Opportunità', url: '/dashboard/market-intelligence/search' },
        { type: 'monitor', label: 'Monitora Mercato', url: '/dashboard/market-intelligence/monitor' }
      ]
    };
  }

  /**
   * 🎯 Gestisce recupero opportunità esistenti
   */
  private async handleGetOpportunities(
    query: MarketIntelligenceQuery,
    userProfile: UserMemoryProfile
  ): Promise<any> {
    const opportunities = await this.getUserOpportunities(userProfile.userId);
    
    return {
      success: true,
      data: {
        type: 'user_opportunities',
        opportunities: opportunities
      },
      message: `🎯 **Le Tue Opportunità**\n\nHo trovato **${opportunities.length}** opportunità attive per te:\n\n${opportunities.slice(0, 5).map((opp, i) => 
          `${i+1}. **${opp.title}** - ${opp.location}\n   📏 ${opp.area} m² | 💰 €${opp.price.toLocaleString()}\n   ⭐ ${opp.score}/100 | 🎯 ${opp.matchPercentage}% | ${opp.urgency === 'high' ? '🚨 URGENTE' : opp.urgency === 'medium' ? '⚠️ Media' : '✅ Normale'}`
        ).join('\n\n')}`,
      suggestions: [
        'Filtra per urgenza',
        'Ordina per punteggio',
        'Confronta opportunità',
        'Programma follow-up'
      ],
      actions: [
        { type: 'filter', label: 'Filtra Risultati', url: '/dashboard/market-intelligence/filter' },
        { type: 'compare', label: 'Confronta', url: '/dashboard/market-intelligence/compare' },
        { type: 'schedule', label: 'Programma Follow-up', url: '/dashboard/market-intelligence/schedule' }
      ]
    };
  }

  /**
   * ⏰ Gestisce programmazione ricerche
   */
  private async handleScheduleSearch(
    query: MarketIntelligenceQuery,
    userProfile: UserMemoryProfile
  ): Promise<any> {
    const criteria = query.criteria;
    const frequency = criteria?.frequency || 'settimanale';
    const email = criteria?.email || userProfile.userEmail;

    if (!criteria?.location) {
      return {
        success: false,
        data: null,
        message: 'Per programmare una ricerca, specifica almeno la zona di interesse',
        suggestions: ['In quale zona vuoi cercare?', 'Con che frequenza?', 'A quale email inviare i risultati?'],
        actions: []
      };
    }

    const searchId = await this.scheduleRecurringSearch(criteria, userProfile.userId, email, frequency);

    return {
      success: true,
      data: {
        type: 'scheduled_search',
        searchId: searchId,
        frequency: frequency
      },
      message: `⏰ **Ricerca Programmata**\n\n✅ Ho programmato una ricerca automatica per te:\n\n📍 **Zona**: ${criteria.location}\n🏠 **Tipo**: ${criteria.propertyType || 'Tutti'}\n📅 **Frequenza**: ${frequency}\n📧 **Email**: ${email}\n\nLa ricerca verrà eseguita automaticamente e riceverai i risultati via email.`,
      suggestions: [
        'Modifica i criteri di ricerca',
        'Cambia la frequenza',
        'Aggiungi altre zone',
        'Gestisci le ricerche programmate'
      ],
      actions: [
        { type: 'edit', label: 'Modifica Ricerca', url: `/dashboard/market-intelligence/schedule/${searchId}` },
        { type: 'manage', label: 'Gestisci Ricerche', url: '/dashboard/market-intelligence/schedule' },
        { type: 'test', label: 'Testa Ricerca', url: '/dashboard/market-intelligence/test' }
      ]
    };
  }

  /**
   * 🏙️ Gestisce confronto zone
   */
  private async handleCompareLocations(
    query: MarketIntelligenceQuery,
    userProfile: UserMemoryProfile
  ): Promise<any> {
    const locations = query.filters?.locations || ['Milano', 'Roma'];
    const comparisons = [];

    for (const location of locations) {
      const analysis = await this.analyzeMarket(location);
      comparisons.push({ location, analysis });
    }

    return {
      success: true,
      data: {
        type: 'location_comparison',
        comparisons: comparisons
      },
      message: `🏙️ **Confronto Zone**\n\n${comparisons.map(comp => 
          `**${comp.location}**\n💰 Prezzo: €${comp.analysis.averagePrice.toLocaleString()}/m²\n📈 Trend: ${comp.analysis.priceChange > 0 ? '+' : ''}${comp.analysis.priceChange}%\n🎯 Domanda: ${this.getDemandLevel(comp.analysis.demandLevel)}\n💡 Opportunità: ${comp.analysis.opportunities}`
        ).join('\n\n')}`,
      suggestions: [
        'Analizza dettagliatamente ogni zona',
        'Cerca opportunità specifiche',
        'Programma monitoraggio',
        'Confronta con i tuoi progetti'
      ],
      actions: [
        { type: 'analyze', label: 'Analisi Dettagliata', url: '/dashboard/market-intelligence/analyze' },
        { type: 'search', label: 'Cerca Opportunità', url: '/dashboard/market-intelligence/search' },
        { type: 'monitor', label: 'Monitora Zone', url: '/dashboard/market-intelligence/monitor' }
      ]
    };
  }

  /**
   * 🔍 Esegue ricerca terreni
   */
  private async executeLandSearch(
    criteria: LandSearchCriteria,
    userProfile: UserMemoryProfile
  ): Promise<SearchResult> {
    // Simula ricerca con dati mock
    const opportunities = this.generateMockOpportunities(criteria);
    const marketAnalysis = await this.analyzeMarket(criteria.location);
    
    const searchResult: SearchResult = {
      searchId: `search_${Date.now()}`,
      criteria,
      opportunities,
      marketAnalysis,
      totalFound: opportunities.length,
      bestMatches: opportunities
        .filter(opp => opp.matchPercentage >= 80)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
      alerts: this.generateSearchAlerts(opportunities, criteria),
      status: 'active',
      createdAt: new Date(),
      lastExecuted: new Date()
    };

    this.activeSearches.set(searchResult.searchId, searchResult);
    this.searchHistory.push(searchResult);

    return searchResult;
  }

  /**
   * 📊 Analizza mercato
   */
  private async analyzeMarket(location: string): Promise<MarketAnalysis> {
    // Controlla cache
    if (this.marketData.has(location)) {
      return this.marketData.get(location)!;
    }

    // Simula analisi di mercato
    const analysis: MarketAnalysis = {
      location,
      averagePrice: this.getAveragePrice(location),
      priceTrend: this.getPriceTrend(location),
      priceChange: this.getPriceChange(location),
      demandLevel: this.getDemandLevel(location),
      supplyLevel: this.getSupplyLevel(location),
      competition: this.getCompetitionLevel(location),
      opportunities: this.getOpportunityCount(location),
      risks: this.getMarketRisks(location),
      recommendations: this.getMarketRecommendations(location),
      confidence: 0.78
    };

    this.marketData.set(location, analysis);
    return analysis;
  }

  /**
   * 🎯 Genera opportunità mock
   */
  private generateMockOpportunities(criteria: LandSearchCriteria): LandOpportunity[] {
    const opportunities: LandOpportunity[] = [];
    const basePrice = this.getAveragePrice(criteria.location);
    
    for (let i = 0; i < 15; i++) {
      const area = Math.floor(Math.random() * (criteria.maxArea - criteria.minArea)) + criteria.minArea;
      const pricePerSqm = basePrice * (0.8 + Math.random() * 0.4);
      const price = Math.floor(area * pricePerSqm);
      
      if (price >= criteria.minBudget && price <= criteria.maxBudget) {
        opportunities.push({
          id: `opp_${Date.now()}_${i}`,
          title: `Terreno ${criteria.propertyType} - ${criteria.location}`,
          location: criteria.location,
          address: `Via ${['Roma', 'Milano', 'Napoli', 'Torino', 'Firenze'][Math.floor(Math.random() * 5)]}, ${Math.floor(Math.random() * 200) + 1}`,
          area,
          price,
          pricePerSqm: Math.floor(pricePerSqm),
          propertyType: criteria.propertyType,
          features: this.generateRandomFeatures(),
          images: [`/images/land_${i + 1}.jpg`],
          description: `Terreno ${criteria.propertyType} di ${area} m² in zona ${criteria.location}`,
          contact: {
            name: `Agente ${i + 1}`,
            phone: `+39 3${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
            email: `agente${i + 1}@immobiliare.it`
          },
          urgency: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          score: Math.floor(60 + Math.random() * 40),
          matchPercentage: Math.floor(70 + Math.random() * 30),
          lastUpdated: new Date(),
          source: ['portale', 'agenzia', 'privato', 'asta'][Math.floor(Math.random() * 4)] as any,
          status: 'available'
        });
      }
    }

    return opportunities.sort((a, b) => b.score - a.score);
  }

  /**
   * ⏰ Programma ricerca ricorrente
   */
  private async scheduleRecurringSearch(
    criteria: LandSearchCriteria,
    userId: string,
    email: string,
    frequency: string
  ): Promise<string> {
    const searchId = `scheduled_${Date.now()}`;
    
    // In produzione, salveresti nel database
    console.log(`📅 [MarketIntelligenceOS] Ricerca programmata: ${searchId}`);
    
    return searchId;
  }

  /**
   * 🎯 Ottiene opportunità utente
   */
  private async getUserOpportunities(userId: string): Promise<LandOpportunity[]> {
    // In produzione, recupereresti dal database
    return this.searchHistory
      .flatMap(search => search.opportunities)
      .slice(0, 10);
  }

  /**
   * ✅ Valida criteri di ricerca
   */
  private validateSearchCriteria(criteria: Partial<LandSearchCriteria>): string[] {
    const missing: string[] = [];
    
    if (!criteria.location) missing.push('la zona');
    if (!criteria.propertyType) missing.push('il tipo di proprietà');
    if (!criteria.minArea) missing.push('l\'area minima');
    if (!criteria.maxArea) missing.push('l\'area massima');
    if (!criteria.minBudget) missing.push('il budget minimo');
    if (!criteria.maxBudget) missing.push('il budget massimo');
    if (!criteria.email) missing.push('l\'email per i risultati');
    
    return missing;
  }

  /**
   * 🎯 Genera alert per ricerca
   */
  private generateSearchAlerts(opportunities: LandOpportunity[], criteria: LandSearchCriteria): string[] {
    const alerts: string[] = [];
    
    if (opportunities.length === 0) {
      alerts.push('Nessuna opportunità trovata con i criteri attuali');
    } else if (opportunities.length < 5) {
      alerts.push('Poche opportunità trovate - considera di ampliare i criteri');
    }
    
    const urgentOpportunities = opportunities.filter(opp => opp.urgency === 'high');
    if (urgentOpportunities.length > 0) {
      alerts.push(`${urgentOpportunities.length} opportunità urgenti - agisci rapidamente!`);
    }
    
    return alerts;
  }

  /**
   * 🏗️ Inizializza dati di mercato
   */
  private initializeMarketData(): void {
    // Dati mock per diverse città
    const cities = ['Milano', 'Roma', 'Napoli', 'Torino', 'Firenze', 'Bologna'];
    
    cities.forEach(city => {
      const analysis: MarketAnalysis = {
        location: city,
        averagePrice: this.getAveragePrice(city),
        priceTrend: this.getPriceTrend(city),
        priceChange: this.getPriceChange(city),
        demandLevel: this.getDemandLevel(city),
        supplyLevel: this.getSupplyLevel(city),
        competition: this.getCompetitionLevel(city),
        opportunities: this.getOpportunityCount(city),
        risks: this.getMarketRisks(city),
        recommendations: this.getMarketRecommendations(city),
        confidence: 0.75 + Math.random() * 0.2
      };
      
      this.marketData.set(city, analysis);
    });
  }

  // Helper methods per dati mock
  private getAveragePrice(location: string): number {
    const prices: Record<string, number> = {
      'Milano': 8500,
      'Roma': 7200,
      'Napoli': 4500,
      'Torino': 3800,
      'Firenze': 6200,
      'Bologna': 4800
    };
    return prices[location] || 5000;
  }

  private getPriceTrend(location: string): 'up' | 'down' | 'stable' {
    const trends: Record<string, 'up' | 'down' | 'stable'> = {
      'Milano': 'up',
      'Roma': 'up',
      'Napoli': 'stable',
      'Torino': 'down',
      'Firenze': 'up',
      'Bologna': 'stable'
    };
    return trends[location] || 'stable';
  }

  private getPriceChange(location: string): number {
    const changes: Record<string, number> = {
      'Milano': 3.2,
      'Roma': 2.8,
      'Napoli': 0.5,
      'Torino': -1.2,
      'Firenze': 2.1,
      'Bologna': 0.8
    };
    return changes[location] || 0;
  }

  private getDemandLevel(location: string): 'high' | 'medium' | 'low' {
    const levels: Record<string, 'high' | 'medium' | 'low'> = {
      'Milano': 'high',
      'Roma': 'high',
      'Napoli': 'medium',
      'Torino': 'low',
      'Firenze': 'medium',
      'Bologna': 'medium'
    };
    return levels[location] || 'medium';
  }

  private getSupplyLevel(location: string): 'high' | 'medium' | 'low' {
    const levels: Record<string, 'high' | 'medium' | 'low'> = {
      'Milano': 'low',
      'Roma': 'medium',
      'Napoli': 'high',
      'Torino': 'high',
      'Firenze': 'medium',
      'Bologna': 'medium'
    };
    return levels[location] || 'medium';
  }

  private getCompetitionLevel(location: string): 'high' | 'medium' | 'low' {
    const levels: Record<string, 'high' | 'medium' | 'low'> = {
      'Milano': 'high',
      'Roma': 'high',
      'Napoli': 'medium',
      'Torino': 'low',
      'Firenze': 'medium',
      'Bologna': 'medium'
    };
    return levels[location] || 'medium';
  }

  private getOpportunityCount(location: string): number {
    const counts: Record<string, number> = {
      'Milano': 25,
      'Roma': 18,
      'Napoli': 35,
      'Torino': 42,
      'Firenze': 22,
      'Bologna': 28
    };
    return counts[location] || 20;
  }

  private getMarketRisks(location: string): string[] {
    const risks: Record<string, string[]> = {
      'Milano': ['Alta competizione', 'Prezzi elevati'],
      'Roma': ['Burocrazia complessa', 'Zona archeologica'],
      'Napoli': ['Mercato volatile', 'Infrastrutture'],
      'Torino': ['Mercato in calo', 'Poca domanda'],
      'Firenze': ['Vincoli storici', 'Turismo stagionale'],
      'Bologna': ['Mercato saturo', 'Costi elevati']
    };
    return risks[location] || ['Rischi generici'];
  }

  private getMarketRecommendations(location: string): string[] {
    const recommendations: Record<string, string[]> = {
      'Milano': ['Focus su zone emergenti', 'Considera partnership'],
      'Roma': ['Valuta zone periferiche', 'Studia vincoli normativi'],
      'Napoli': ['Opportunità di crescita', 'Diversifica il portafoglio'],
      'Torino': ['Cautela nell\'investimento', 'Valuta alternative'],
      'Firenze': ['Focus su qualità', 'Considera turismo'],
      'Bologna': ['Mercato maturo', 'Cerca nicchie']
    };
    return recommendations[location] || ['Raccomandazioni generiche'];
  }

  private generateRandomFeatures(): string[] {
    const allFeatures = [
      'Parcheggio', 'Giardino', 'Balcone', 'Terrazza', 'Cantina',
      'Box auto', 'Ascensore', 'Portiere', 'Climatizzazione',
      'Riscaldamento', 'Pavimenti in legno', 'Cucina attrezzata'
    ];
    
    const numFeatures = Math.floor(Math.random() * 4) + 2;
    return allFeatures
      .sort(() => Math.random() - 0.5)
      .slice(0, numFeatures);
  }

  private getDemandLevel(level: 'high' | 'medium' | 'low'): string {
    const levels = {
      'high': '🔥 Alta',
      'medium': '⚡ Media',
      'low': '📉 Bassa'
    };
    return levels[level];
  }

  private getSupplyLevel(level: 'high' | 'medium' | 'low'): string {
    const levels = {
      'high': '📦 Alta',
      'medium': '⚖️ Media',
      'low': '📉 Bassa'
    };
    return levels[level];
  }

  private getCompetitionLevel(level: 'high' | 'medium' | 'low'): string {
    const levels = {
      'high': '🏆 Alta',
      'medium': '⚖️ Media',
      'low': '📉 Bassa'
    };
    return levels[level];
  }
}

export const marketIntelligenceOS = MarketIntelligenceOS.getInstance();
