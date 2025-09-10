// 🧠 INTELLIGENT RESPONSE SERVICE - SISTEMA RISPOSTE INTELLIGENTI
// Genera risposte contestuali e proattive per l'OS

import { UserMemoryProfile, QueryResult, Recommendation, Alert } from './userMemoryService';
import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface IntelligentResponse {
  response: string;
  type: 'answer' | 'suggestion' | 'insight' | 'alert' | 'question';
  confidence: number;
  relatedData: any;
  followUpQuestions: string[];
  actions: ResponseAction[];
  visualizations: Visualization[];
}

export interface ResponseAction {
  type: 'navigate' | 'create' | 'update' | 'delete' | 'share';
  label: string;
  url?: string;
  data?: any;
  icon?: string;
}

export interface Visualization {
  type: 'chart' | 'table' | 'card' | 'map' | 'timeline';
  data: any;
  title: string;
  description?: string;
}

export interface ResponseContext {
  userProfile: UserMemoryProfile;
  queryResult: QueryResult;
  conversationHistory: ChatMessage[];
  currentIntent?: string;
  sessionData: any;
}

// ============================================================================
// INTELLIGENT RESPONSE SERVICE CLASS
// ============================================================================

export class IntelligentResponseService {
  private responseTemplates: Map<string, ResponseTemplate> = new Map();
  private insightGenerators: Map<string, InsightGenerator> = new Map();

  constructor() {
    this.initializeResponseTemplates();
    this.initializeInsightGenerators();
    console.log('🧠 [IntelligentResponseService] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 Genera risposta intelligente principale
   */
  async generateResponse(
    context: ResponseContext
  ): Promise<IntelligentResponse> {
    console.log('🧠 [IntelligentResponse] Generando risposta intelligente');

    try {
      const { userProfile, queryResult } = context;
      
      // 1. Determina tipo di risposta
      const responseType = this.determineResponseType(queryResult, context);
      
      // 2. Genera risposta base
      let response = await this.generateBaseResponse(responseType, context);
      
      // 3. Aggiungi insights proattivi
      const insights = await this.generateProactiveInsights(userProfile, queryResult);
      if (insights.length > 0) {
        response += '\n\n' + this.formatInsights(insights);
      }
      
      // 4. Aggiungi raccomandazioni
      const recommendations = await this.generateRecommendations(userProfile, queryResult);
      if (recommendations.length > 0) {
        response += '\n\n' + this.formatRecommendations(recommendations);
      }
      
      // 5. Aggiungi alert se necessario
      const alerts = await this.generateAlerts(userProfile, queryResult);
      if (alerts.length > 0) {
        response += '\n\n' + this.formatAlerts(alerts);
      }
      
      // 6. Genera follow-up questions
      const followUpQuestions = this.generateFollowUpQuestions(queryResult, context);
      
      // 7. Genera azioni disponibili
      const actions = this.generateActions(queryResult, context);
      
      // 8. Genera visualizzazioni
      const visualizations = this.generateVisualizations(queryResult, context);
      
      console.log('✅ [IntelligentResponse] Risposta generata:', {
        type: responseType,
        insights: insights.length,
        recommendations: recommendations.length,
        alerts: alerts.length
      });

      return {
        response,
        type: responseType,
        confidence: queryResult.confidence,
        relatedData: queryResult.data,
        followUpQuestions,
        actions,
        visualizations
      };

    } catch (error) {
      console.error('❌ [IntelligentResponse] Errore generazione risposta:', error);
      return this.generateErrorResponse(error);
    }
  }

  // ============================================================================
  // METODI DI GENERAZIONE RISPOSTE
  // ============================================================================

  /**
   * Determina tipo di risposta
   */
  private determineResponseType(
    queryResult: QueryResult, 
    context: ResponseContext
  ): 'answer' | 'suggestion' | 'insight' | 'alert' | 'question' | 'predictive' | 'optimization' | 'market_intelligence' {
    if (!queryResult.success) {
      return 'suggestion';
    }
    
    if (queryResult.data && typeof queryResult.data === 'object') {
      if (queryResult.data.type === 'predictive_analysis') {
        return 'predictive';
      }
      if (queryResult.data.type === 'project_optimization' || queryResult.data.type === 'portfolio_optimization') {
        return 'optimization';
      }
      if (queryResult.data.type === 'market_intelligence') {
        return 'market_intelligence';
      }
      if (queryResult.data.value !== undefined) {
        return 'answer';
      }
      if (queryResult.data.metrics) {
        return 'insight';
      }
    }
    
    return 'answer';
  }

  /**
   * Genera risposta base
   */
  private async generateBaseResponse(
    type: string, 
    context: ResponseContext
  ): Promise<string> {
    const { queryResult, userProfile } = context;
    
    switch (type) {
      case 'answer':
        return this.generateAnswerResponse(queryResult, userProfile);
      
      case 'suggestion':
        return this.generateSuggestionResponse(queryResult, userProfile);
      
      case 'insight':
        return this.generateInsightResponse(queryResult, userProfile);
      
      case 'predictive':
        return this.generatePredictiveResponse(queryResult, userProfile);
      
      case 'optimization':
        return this.generateOptimizationResponse(queryResult, userProfile);
      
      case 'market_intelligence':
        return this.generateMarketIntelligenceResponse(queryResult, userProfile);
      
      case 'alert':
        return this.generateAlertResponse(queryResult, userProfile);
      
      default:
        return this.generateDefaultResponse(queryResult, userProfile);
    }
  }

  /**
   * Genera risposta per domande dirette
   */
  private generateAnswerResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    if (!queryResult.data) {
      return 'Non ho trovato i dati richiesti.';
    }
    
    const { project, metric, value, unit } = queryResult.data;
    
    if (project && metric && value !== undefined) {
      const formattedValue = this.formatValue(value, unit);
      return `📊 **${project}**\n\n**${this.getMetricDisplayName(metric)}**: ${formattedValue}\n\n${this.generateMetricContext(metric, value, userProfile)}`;
    }
    
    if (project && queryResult.data.metrics) {
      return this.generateProjectOverview(project, queryResult.data.metrics, userProfile);
    }
    
    // Genera risposta conversazionale invece di JSON grezzo
    return this.generateConversationalResponse(queryResult.data, userProfile);
  }

  /**
   * Genera risposta conversazionale invece di JSON grezzo
   */
  private generateConversationalResponse(data: any, userProfile: UserMemoryProfile): string {
    if (!data) {
      return 'Non ho trovato i dati richiesti.';
    }

    // Se è una lista di progetti
    if (data.projects && Array.isArray(data.projects)) {
      return this.formatProjectsList(data, userProfile);
    }

    // Se è un singolo progetto
    if (data.name && data.type) {
      return this.formatSingleProject(data, userProfile);
    }

    // Se è un riassunto
    if (data.summary) {
      return this.formatSummary(data, userProfile);
    }

    // Fallback conversazionale
    return this.formatGenericData(data, userProfile);
  }

  /**
   * Formatta lista di progetti in modo conversazionale
   */
  private formatProjectsList(data: any, userProfile: UserMemoryProfile): string {
    const projects = data.projects || [];
    const totalCount = data.totalCount || projects.length;
    
    if (projects.length === 0) {
      return `Non hai ancora progetti. Crea il tuo primo progetto di fattibilità per iniziare!`;
    }

    let response = `Hai ${totalCount} progetti nel tuo portafoglio:\n\n`;
    
    projects.forEach((project: any, index: number) => {
      response += `**${index + 1}. ${project.name}**\n`;
      response += `📍 ${project.location}\n`;
      response += `📊 ROI: ${project.keyMetrics?.roi || 0}% | Margine: ${project.keyMetrics?.margin || 0}%\n`;
      response += `💰 Budget: €${(project.keyMetrics?.budget || 0).toLocaleString()}\n`;
      response += `📅 Status: ${this.formatStatus(project.status)}\n\n`;
    });

    // Aggiungi insights
    if (data.summary) {
      response += `**Riepilogo Portafoglio:**\n`;
      response += `• Budget totale: €${(data.summary.totalBudget || 0).toLocaleString()}\n`;
      response += `• ROI medio: ${data.summary.averageROI || 0}%\n`;
      response += `• Zona principale: ${data.summary.topLocation || 'N/A'}\n\n`;
    }

    // Aggiungi raccomandazioni
    if (data.summary?.statusBreakdown) {
      const statuses = data.summary.statusBreakdown;
      if (statuses.PIANIFICAZIONE > 0) {
        response += `💡 Hai ${statuses.PIANIFICAZIONE} progetti in pianificazione. Considera di definire i dettagli operativi.\n`;
      }
      if (statuses.IN_CORSO > 0) {
        response += `⚡ Hai ${statuses.IN_CORSO} progetti in corso. Monitora i progressi regolarmente.\n`;
      }
    }

    return response;
  }

  /**
   * Formatta singolo progetto
   */
  private formatSingleProject(project: any, userProfile: UserMemoryProfile): string {
    let response = `**${project.name}**\n\n`;
    response += `📍 **Zona**: ${project.location}\n`;
    response += `📊 **ROI**: ${project.keyMetrics?.roi || 0}%\n`;
    response += `💰 **Budget**: €${(project.keyMetrics?.budget || 0).toLocaleString()}\n`;
    response += `📅 **Status**: ${this.formatStatus(project.status)}\n\n`;
    
    if (project.keyMetrics?.margin) {
      response += `Il margine di profitto è del ${project.keyMetrics.margin}%, che è ${this.getMarginRating(project.keyMetrics.margin)}.\n`;
    }
    
    return response;
  }

  /**
   * Formatta riassunto
   */
  private formatSummary(data: any, userProfile: UserMemoryProfile): string {
    const summary = data.summary || data;
    let response = `**Riepilogo del tuo portafoglio:**\n\n`;
    
    if (summary.totalProjects) {
      response += `📊 **Progetti totali**: ${summary.totalProjects}\n`;
    }
    if (summary.totalBudget) {
      response += `💰 **Budget totale**: €${summary.totalBudget.toLocaleString()}\n`;
    }
    if (summary.averageROI) {
      response += `📈 **ROI medio**: ${summary.averageROI}%\n`;
    }
    if (summary.topLocation) {
      response += `📍 **Zona principale**: ${summary.topLocation}\n`;
    }
    
    return response;
  }

  /**
   * Formatta dati generici
   */
  private formatGenericData(data: any, userProfile: UserMemoryProfile): string {
    if (typeof data === 'string') {
      return data;
    }
    
    if (typeof data === 'number') {
      return `Il valore è ${data.toLocaleString()}`;
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length === 0) {
        return 'Non ci sono dati disponibili.';
      }
      
      let response = 'Ecco i dati richiesti:\n\n';
      keys.forEach(key => {
        const value = data[key];
        if (typeof value === 'number') {
          response += `• **${key}**: ${value.toLocaleString()}\n`;
        } else {
          response += `• **${key}**: ${value}\n`;
        }
      });
      return response;
    }
    
    return 'Dati non disponibili.';
  }

  /**
   * Formatta status del progetto
   */
  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PIANIFICAZIONE': 'In pianificazione',
      'IN_CORSO': 'In corso',
      'COMPLETATO': 'Completato',
      'SOSPESO': 'Sospeso'
    };
    return statusMap[status] || status;
  }

  /**
   * Valuta il margine di profitto
   */
  private getMarginRating(margin: number): string {
    if (margin >= 25) return 'eccellente';
    if (margin >= 20) return 'molto buono';
    if (margin >= 15) return 'buono';
    if (margin >= 10) return 'nella media';
    return 'da migliorare';
  }

  /**
   * Genera risposta con suggerimenti
   */
  private generateSuggestionResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    let response = 'Non sono riuscito a trovare esattamente quello che cerchi.\n\n';
    
    if (queryResult.suggestions && queryResult.suggestions.length > 0) {
      response += '**Suggerimenti:**\n';
      queryResult.suggestions.forEach((suggestion, index) => {
        response += `${index + 1}. ${suggestion}\n`;
      });
    }
    
    if (queryResult.relatedProjects && queryResult.relatedProjects.length > 0) {
      response += '\n**I tuoi progetti disponibili:**\n';
      queryResult.relatedProjects.forEach((project, index) => {
        response += `${index + 1}. ${project}\n`;
      });
    }
    
    return response;
  }

  /**
   * Genera risposta con insights
   */
  private generateInsightResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    let response = '📈 **Analisi Completa**\n\n';
    
    if (queryResult.data && queryResult.data.project) {
      response += `**Progetto**: ${queryResult.data.project.name || queryResult.data.project}\n\n`;
    }
    
    if (queryResult.data && queryResult.data.analysis) {
      response += '**Analisi Dettagliata:**\n';
      Object.entries(queryResult.data.analysis).forEach(([metric, data]: [string, any]) => {
        response += `• **${this.getMetricDisplayName(metric)}**: ${data.value}${data.unit} (${data.rating})\n`;
        response += `  ${data.description}\n\n`;
      });
    }
    
    if (queryResult.data && queryResult.data.recommendations) {
      response += '**Raccomandazioni:**\n';
      queryResult.data.recommendations.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`;
      });
      response += '\n';
    }
    
    if (queryResult.data && queryResult.data.risks) {
      response += '**Rischi Identificati:**\n';
      queryResult.data.risks.forEach((risk: string, index: number) => {
        response += `⚠️ ${risk}\n`;
      });
      response += '\n';
    }
    
    if (queryResult.data && queryResult.data.opportunities) {
      response += '**Opportunità:**\n';
      queryResult.data.opportunities.forEach((opp: string, index: number) => {
        response += `🚀 ${opp}\n`;
      });
      response += '\n';
    }
    
    if (queryResult.insights && queryResult.insights.length > 0) {
      response += '**Insights:**\n';
      queryResult.insights.forEach((insight, index) => {
        response += `${index + 1}. ${insight}\n`;
      });
    }
    
    return response;
  }

  /**
   * Genera risposta di default
   */
  private generateDefaultResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    if (queryResult.success) {
      return '✅ Operazione completata con successo!';
    } else {
      return '❌ Si è verificato un errore. Riprova più tardi.';
    }
  }

  /**
   * 🔮 Genera risposta predittiva
   */
  private generatePredictiveResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    let response = '🔮 **Analisi Predittiva Avanzata**\n\n';
    
    if (queryResult.data && queryResult.data.type === 'predictive_analysis') {
      const analysis = queryResult.data;
      
      // Market Forecast
      if (analysis.marketForecast) {
        response += '📈 **Previsioni di Mercato:**\n';
        response += `📍 **Zona**: ${analysis.marketForecast.location}\n`;
        response += `⏰ **Periodo**: ${analysis.marketForecast.timeframe}\n`;
        response += `🎯 **Confidenza**: ${(analysis.marketForecast.confidence * 100).toFixed(0)}%\n\n`;
        
        if (analysis.marketForecast.trends && analysis.marketForecast.trends.length > 0) {
          response += '**Trend Identificati:**\n';
          analysis.marketForecast.trends.forEach((trend: any) => {
            const direction = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️';
            response += `${direction} **${trend.metric}**: ${trend.change > 0 ? '+' : ''}${trend.change}% (${trend.impact})\n`;
            response += `   ${trend.description}\n`;
            response += `   💡 ${trend.recommendation}\n\n`;
          });
        }
      }
      
      // Project Optimizations
      if (analysis.projectOptimizations && analysis.projectOptimizations.length > 0) {
        response += '⚡ **Ottimizzazioni Progetti:**\n';
        analysis.projectOptimizations.forEach((opt: any, index: number) => {
          response += `${index + 1}. **Progetto**: ${opt.projectId}\n`;
          response += `   💰 **ROI Potenziale**: +${opt.potentialROI.toFixed(1)}%\n`;
          response += `   💵 **Costo Implementazione**: €${opt.implementationCost.toLocaleString()}\n`;
          response += `   ⏱️ **Payback Period**: ${opt.paybackPeriod.toFixed(1)} mesi\n\n`;
        });
      }
      
      // Strategic Recommendations
      if (analysis.strategicRecommendations && analysis.strategicRecommendations.length > 0) {
        response += '🎯 **Raccomandazioni Strategiche:**\n';
        analysis.strategicRecommendations.forEach((rec: any, index: number) => {
          response += `${index + 1}. **${rec.title}** (${rec.impact})\n`;
          response += `   ${rec.description}\n`;
          if (rec.recommendations && rec.recommendations.length > 0) {
            rec.recommendations.forEach((r: string) => {
              response += `   • ${r}\n`;
            });
          }
          response += '\n';
        });
      }
      
      // Risk Assessment
      if (analysis.riskAssessment && analysis.riskAssessment.length > 0) {
        response += '⚠️ **Valutazione Rischi:**\n';
        analysis.riskAssessment.forEach((risk: any, index: number) => {
          response += `${index + 1}. **${risk.title}** (${risk.impact})\n`;
          response += `   ${risk.description}\n`;
          if (risk.recommendations && risk.recommendations.length > 0) {
            risk.recommendations.forEach((r: string) => {
              response += `   • ${r}\n`;
            });
          }
          response += '\n';
        });
      }
    }
    
    return response;
  }

  /**
   * 🏢 Genera risposta Market Intelligence
   */
  private generateMarketIntelligenceResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    // Le risposte Market Intelligence sono già formattate dal Market Intelligence OS
    // Questo metodo serve solo come fallback
    if (queryResult.insights && queryResult.insights.length > 0) {
      return queryResult.insights[0];
    }
    
    return '🏢 **Market Intelligence**\n\nInformazioni di mercato non disponibili al momento.';
  }

  /**
   * ⚡ Genera risposta di ottimizzazione
   */
  private generateOptimizationResponse(
    queryResult: QueryResult, 
    userProfile: UserMemoryProfile
  ): string {
    let response = '⚡ **Ottimizzazione Intelligente**\n\n';
    
    if (queryResult.data && queryResult.data.type === 'project_optimization') {
      const optimization = queryResult.data.optimization;
      
      response += `🎯 **Progetto**: ${queryResult.data.project}\n\n`;
      
      response += '📊 **Miglioramenti Proposti:**\n';
      optimization.improvements.forEach((improvement: any) => {
        const improvementPct = improvement.improvement > 0 ? '+' : '';
        response += `• **${improvement.metric}**: ${improvement.current} → ${improvement.optimized} (${improvementPct}${improvement.improvement.toFixed(1)}%)\n`;
        response += `  💡 ${improvement.action}\n\n`;
      });
      
      response += '💰 **Impatto Finanziario:**\n';
      response += `• **ROI Potenziale**: +${optimization.potentialROI.toFixed(1)}%\n`;
      response += `• **Costo Implementazione**: €${optimization.implementationCost.toLocaleString()}\n`;
      response += `• **Payback Period**: ${optimization.paybackPeriod.toFixed(1)} mesi\n\n`;
      
    } else if (queryResult.data && queryResult.data.type === 'portfolio_optimization') {
      const optimizations = queryResult.data.optimizations;
      
      response += `📈 **Ottimizzazione Portafoglio Completo**\n\n`;
      response += `🎯 **Progetti Ottimizzati**: ${optimizations.length}\n`;
      response += `💰 **ROI Potenziale Totale**: +${queryResult.data.totalPotentialROI.toFixed(1)}%\n\n`;
      
      response += '📊 **Dettaglio Ottimizzazioni:**\n';
      optimizations.forEach((opt: any, index: number) => {
        response += `${index + 1}. **${opt.projectId}**\n`;
        response += `   💰 ROI: +${opt.potentialROI.toFixed(1)}%\n`;
        response += `   💵 Costo: €${opt.implementationCost.toLocaleString()}\n`;
        response += `   ⏱️ Payback: ${opt.paybackPeriod.toFixed(1)} mesi\n\n`;
      });
    }
    
    return response;
  }

  /**
   * Ottiene nome display per metrica
   */
  private getMetricDisplayName(metric: string): string {
    const displayNames: Record<string, string> = {
      'totalArea': 'Area Totale',
      'buildableArea': 'Area Edificabile',
      'budget': 'Budget',
      'costPerSqm': 'Costo per m²',
      'roi': 'ROI',
      'timeline': 'Timeline',
      'status': 'Stato',
      'location': 'Posizione',
      'propertyType': 'Tipo Proprietà',
      'investmentAmount': 'Investimento',
      'revenueProjection': 'Proiezione Ricavi',
      'teamSize': 'Dimensione Team',
      'targetMarket': 'Mercato Target'
    };
    
    return displayNames[metric] || metric;
  }

  /**
   * Genera risposta di errore
   */
  private generateErrorResponse(error: any): IntelligentResponse {
    return {
      response: '❌ Si è verificato un errore nel processamento della richiesta. Riprova più tardi.',
      type: 'suggestion',
      confidence: 0,
      relatedData: null,
      followUpQuestions: ['Riprova con una domanda diversa', 'Mostrami i miei progetti'],
      actions: [],
      visualizations: []
    };
  }

  // ============================================================================
  // METODI DI FORMATTAZIONE
  // ============================================================================

  /**
   * Formatta valore con unità
   */
  private formatValue(value: any, unit?: string): string {
    if (typeof value === 'number') {
      if (unit === '€') {
        return `€${value.toLocaleString('it-IT')}`;
      }
      if (unit === 'mq') {
        return `${value.toLocaleString('it-IT')} mq`;
      }
      if (unit === '%') {
        return `${value}%`;
      }
      return value.toLocaleString('it-IT');
    }
    
    return String(value);
  }

  /**
   * Ottieni nome display per metrica
   */
  private getMetricDisplayName(metric: string): string {
    const displayNames: Record<string, string> = {
      'totalArea': 'Superficie Totale',
      'budget': 'Budget',
      'roi': 'ROI',
      'margin': 'Margine',
      'profit': 'Profitto',
      'timeline': 'Timeline'
    };
    
    return displayNames[metric] || metric;
  }

  /**
   * Genera contesto per metrica
   */
  private generateMetricContext(
    metric: string, 
    value: any, 
    userProfile: UserMemoryProfile
  ): string {
    const projects = userProfile.context.currentProjects;
    
    if (projects.length === 0) {
      return '';
    }
    
    // Calcola media per metrica
    const values = projects
      .map(p => p.keyMetrics[metric])
      .filter(v => v !== undefined && v !== null);
    
    if (values.length === 0) {
      return '';
    }
    
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const comparison = value > average ? 'sopra' : 'sotto';
    const percentage = Math.abs(((value - average) / average) * 100);
    
    return `*Questo valore è ${comparison} la media dei tuoi progetti del ${percentage.toFixed(1)}%*`;
  }

  /**
   * Genera overview progetto
   */
  private generateProjectOverview(
    projectName: string, 
    metrics: Record<string, any>, 
    userProfile: UserMemoryProfile
  ): string {
    let response = `📊 **${projectName} - Panoramica Completa**\n\n`;
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const displayName = this.getMetricDisplayName(key);
        const unit = this.getMetricUnit(key);
        const formattedValue = this.formatValue(value, unit);
        response += `**${displayName}**: ${formattedValue}\n`;
      }
    });
    
    return response;
  }

  /**
   * Ottieni unità per metrica
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
   * Formatta insights
   */
  private formatInsights(insights: string[]): string {
    if (insights.length === 0) return '';
    
    let response = '💡 **Insights Proattivi:**\n';
    insights.forEach((insight, index) => {
      response += `${index + 1}. ${insight}\n`;
    });
    
    return response;
  }

  /**
   * Formatta raccomandazioni
   */
  private formatRecommendations(recommendations: Recommendation[]): string {
    if (recommendations.length === 0) return '';
    
    let response = '🎯 **Raccomandazioni:**\n';
    recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      response += `${priority} **${rec.title}**\n${rec.description}\n\n`;
    });
    
    return response;
  }

  /**
   * Formatta alert
   */
  private formatAlerts(alerts: Alert[]): string {
    if (alerts.length === 0) return '';
    
    let response = '⚠️ **Alert Attivi:**\n';
    alerts.forEach((alert, index) => {
      const severity = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵';
      response += `${severity} **${alert.title}**\n${alert.message}\n\n`;
    });
    
    return response;
  }

  // ============================================================================
  // METODI DI GENERAZIONE INSIGHTS
  // ============================================================================

  /**
   * Genera insights proattivi
   */
  private async generateProactiveInsights(
    userProfile: UserMemoryProfile, 
    queryResult: QueryResult
  ): Promise<string[]> {
    const insights: string[] = [];
    
    // Insight basato su query
    if (queryResult.data && queryResult.data.metric === 'totalArea') {
      const area = queryResult.data.value;
      if (area > 1000) {
        insights.push(`Il progetto "${queryResult.data.project}" ha una superficie molto grande (${area} mq). Considera la suddivisione in unità più piccole per ottimizzare la vendita.`);
      }
    }
    
    // Insight basato su pattern utente
    const projects = userProfile.context.currentProjects;
    if (projects.length > 3) {
      const avgBudget = projects.reduce((sum, p) => sum + (p.keyMetrics.budget || 0), 0) / projects.length;
      if (avgBudget > 500000) {
        insights.push(`I tuoi progetti hanno un budget medio elevato (€${avgBudget.toLocaleString('it-IT')}). Considera di diversificare con progetti più piccoli per ridurre il rischio.`);
      }
    }
    
    return insights;
  }

  /**
   * Genera raccomandazioni
   */
  private async generateRecommendations(
    userProfile: UserMemoryProfile, 
    queryResult: QueryResult
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Raccomandazione basata su location
    const favoriteLocations = userProfile.preferences.favoriteLocations;
    if (favoriteLocations.length > 0) {
      recommendations.push({
        id: `rec-location-${Date.now()}`,
        type: 'opportunity',
        title: 'Espansione in Nuove Zone',
        description: `Hai molti progetti a ${favoriteLocations[0]}. Considera di esplorare zone limitrofe per diversificare il portafoglio.`,
        priority: 'medium',
        actionRequired: false,
        confidence: 0.8,
        createdAt: new Date()
      });
    }
    
    return recommendations;
  }

  /**
   * Genera alert
   */
  private async generateAlerts(
    userProfile: UserMemoryProfile, 
    queryResult: QueryResult
  ): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // Alert per progetti inattivi
    const projects = userProfile.context.currentProjects;
    const overdueProjects = projects.filter(p => {
      const daysSinceUpdate = (Date.now() - p.lastModified.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });
    
    if (overdueProjects.length > 0) {
      alerts.push({
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
    
    return alerts;
  }

  // ============================================================================
  // METODI DI GENERAZIONE FOLLOW-UP
  // ============================================================================

  /**
   * Genera domande di follow-up
   */
  private generateFollowUpQuestions(
    queryResult: QueryResult, 
    context: ResponseContext
  ): string[] {
    const questions: string[] = [];
    
    if (queryResult.success && queryResult.data) {
      if (queryResult.data.project) {
        questions.push(`Vuoi analizzare altri aspetti di ${queryResult.data.project}?`);
        questions.push(`Confronta ${queryResult.data.project} con altri progetti?`);
      }
      
      if (queryResult.data.metric) {
        questions.push(`Vuoi vedere l'andamento di ${queryResult.data.metric} nel tempo?`);
      }
    }
    
    // Domande generiche
    questions.push('Mostrami tutti i miei progetti');
    questions.push('Qual è il progetto con il ROI migliore?');
    questions.push('Crea un nuovo progetto');
    
    return questions.slice(0, 3); // Massimo 3 domande
  }

  /**
   * Genera azioni disponibili
   */
  private generateActions(
    queryResult: QueryResult, 
    context: ResponseContext
  ): ResponseAction[] {
    const actions: ResponseAction[] = [];
    
    if (queryResult.data && queryResult.data.project) {
      actions.push({
        type: 'navigate',
        label: `Vai a ${queryResult.data.project}`,
        url: `/dashboard/feasibility-analysis/${queryResult.data.project}`,
        icon: '📊'
      });
    }
    
    actions.push({
      type: 'create',
      label: 'Crea Nuovo Progetto',
      url: '/dashboard/feasibility-analysis',
      icon: '➕'
    });
    
    actions.push({
      type: 'navigate',
      label: 'Vedi Tutti i Progetti',
      url: '/dashboard/feasibility-analysis',
      icon: '📋'
    });
    
    return actions;
  }

  /**
   * Genera visualizzazioni
   */
  private generateVisualizations(
    queryResult: QueryResult, 
    context: ResponseContext
  ): Visualization[] {
    const visualizations: Visualization[] = [];
    
    if (queryResult.data && queryResult.data.metrics) {
      visualizations.push({
        type: 'card',
        data: queryResult.data.metrics,
        title: `Metriche ${queryResult.data.project}`,
        description: 'Panoramica completa del progetto'
      });
    }
    
    return visualizations;
  }

  // ============================================================================
  // INIZIALIZZAZIONE
  // ============================================================================

  /**
   * Inizializza template di risposta
   */
  private initializeResponseTemplates(): void {
    // TODO: Implementare template di risposta personalizzati
  }

  /**
   * Inizializza generatori di insights
   */
  private initializeInsightGenerators(): void {
    // TODO: Implementare generatori di insights personalizzati
  }
}

// ============================================================================
// INTERFACCE AGGIUNTIVE
// ============================================================================

interface ResponseTemplate {
  id: string;
  pattern: RegExp;
  template: string;
  variables: string[];
}

interface InsightGenerator {
  id: string;
  condition: (context: ResponseContext) => boolean;
  generator: (context: ResponseContext) => string;
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const intelligentResponseService = new IntelligentResponseService();
