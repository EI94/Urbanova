// 📊 EVALUATION SYSTEM - Sistema di valutazione e monitoring per OS 2.0 Smart
// Metriche, monitoring e valutazione continua delle performance

import { db } from '../../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';

export interface EvaluationMetrics {
  // Metriche di Performance
  responseTime: number; // ms
  accuracy: number; // 0-1
  relevance: number; // 0-1
  completeness: number; // 0-1
  
  // Metriche di Qualità
  userSatisfaction?: number; // 0-1 (da feedback utente)
  conversationFlow: number; // 0-1
  errorRate: number; // 0-1
  
  // Metriche di Sicurezza
  guardrailScore: number; // 0-1
  complianceScore: number; // 0-1
  privacyScore: number; // 0-1
  
  // Metriche di Utilizzo
  functionCallSuccess: number; // 0-1
  ragRelevance: number; // 0-1
  contextUtilization: number; // 0-1
}

export interface EvaluationEvent {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  projectId?: string;
  
  // Input
  userMessage: string;
  userContext: any;
  
  // Processo
  decisionType: 'function_call' | 'conversation' | 'clarification' | 'escalation';
  functionCalls?: any[];
  ragContext?: any;
  
  // Output
  assistantResponse?: string;
  success: boolean;
  error?: string;
  
  // Valutazione
  metrics: EvaluationMetrics;
  feedback?: {
    rating: number; // 1-5
    comment?: string;
    timestamp: Date;
  };
}

export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  totalInteractions: number;
  averageMetrics: EvaluationMetrics;
  trends: {
    responseTime: 'improving' | 'stable' | 'degrading';
    accuracy: 'improving' | 'stable' | 'degrading';
    userSatisfaction: 'improving' | 'stable' | 'degrading';
  };
  topIssues: string[];
  recommendations: string[];
}

/**
 * Sistema di valutazione e monitoring per OS 2.0 Smart
 */
export class EvaluationSystem {
  private collectionName = 'os2_evaluation_events';

  /**
   * Registra un evento di valutazione
   */
  async recordEvaluationEvent(event: Omit<EvaluationEvent, 'id' | 'timestamp'>): Promise<string> {
    try {
      // Filtra campi undefined per Firestore
      const cleanEvent = Object.fromEntries(
        Object.entries(event).filter(([_, value]) => value !== undefined)
      );

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...cleanEvent,
        timestamp: serverTimestamp(),
      });

      console.log(`📊 [Evaluation] Evento registrato: ${docRef.id}`);
      return docRef.id;

    } catch (error) {
      console.error('❌ [Evaluation] Errore registrazione evento:', error);
      throw error;
    }
  }

  /**
   * Calcola metriche per un'interazione
   */
  calculateMetrics(
    userMessage: string,
    assistantResponse: string,
    functionCalls: any[],
    ragContext: any,
    responseTime: number,
    guardrailResult: any
  ): EvaluationMetrics {
    return {
      // Performance
      responseTime,
      accuracy: this.calculateAccuracy(userMessage, assistantResponse),
      relevance: this.calculateRelevance(userMessage, assistantResponse),
      completeness: this.calculateCompleteness(userMessage, assistantResponse),
      
      // Qualità
      conversationFlow: this.calculateConversationFlow(userMessage, assistantResponse),
      errorRate: this.calculateErrorRate(functionCalls),
      
      // Sicurezza
      guardrailScore: guardrailResult.score,
      complianceScore: this.calculateComplianceScore(assistantResponse),
      privacyScore: this.calculatePrivacyScore(userMessage, assistantResponse),
      
      // Utilizzo
      functionCallSuccess: this.calculateFunctionCallSuccess(functionCalls),
      ragRelevance: this.calculateRAGRelevance(ragContext),
      contextUtilization: this.calculateContextUtilization(ragContext),
    };
  }

  /**
   * Genera report di performance
   */
  async generatePerformanceReport(
    userId?: string,
    projectId?: string,
    days: number = 7
  ): Promise<PerformanceReport> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Query eventi
      let q = query(
        collection(db, this.collectionName),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      if (userId) {
        q = query(q, where('userId', '==', userId));
      }

      if (projectId) {
        q = query(q, where('projectId', '==', projectId));
      }

      const snapshot = await getDocs(q);
      const events: EvaluationEvent[] = [];
      
      snapshot.forEach(doc => {
        events.push(doc.data() as EvaluationEvent);
      });

      // Calcola metriche aggregate
      const totalInteractions = events.length;
      const averageMetrics = this.calculateAverageMetrics(events);
      const trends = this.calculateTrends(events);
      const topIssues = this.identifyTopIssues(events);
      const recommendations = this.generateRecommendations(averageMetrics, trends, topIssues);

      return {
        period: { start: startDate, end: endDate },
        totalInteractions,
        averageMetrics,
        trends,
        topIssues,
        recommendations,
      };

    } catch (error) {
      console.error('❌ [Evaluation] Errore generazione report:', error);
      throw error;
    }
  }

  /**
   * Registra feedback utente
   */
  async recordUserFeedback(
    eventId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    try {
      // Trova l'evento e aggiorna con feedback
      const eventsRef = collection(db, this.collectionName);
      const q = query(eventsRef, where('id', '==', eventId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error(`Evento ${eventId} non trovato`);
      }

      const eventDoc = snapshot.docs[0];
      await eventDoc.ref.update({
        feedback: {
          rating,
          comment,
          timestamp: serverTimestamp(),
        },
      });

      console.log(`📊 [Evaluation] Feedback registrato per evento: ${eventId}`);

    } catch (error) {
      console.error('❌ [Evaluation] Errore registrazione feedback:', error);
      throw error;
    }
  }

  // ==================== METODI DI CALCOLO ====================

  private calculateAccuracy(userMessage: string, assistantResponse: string): number {
    // Analisi semantica della risposta rispetto alla domanda
    const messageWords = userMessage.toLowerCase().split(' ');
    const responseWords = assistantResponse.toLowerCase().split(' ');
    
    const commonWords = messageWords.filter(word => 
      responseWords.includes(word) && word.length > 3
    );
    
    return Math.min(commonWords.length / messageWords.length, 1);
  }

  private calculateRelevance(userMessage: string, assistantResponse: string): number {
    // Controlla se la risposta è pertinente al settore immobiliare
    const realEstateKeywords = [
      'progetto', 'terreno', 'immobile', 'business plan', 'fattibilità',
      'costruzione', 'permessi', 'mercato', 'investimento', 'rendimento'
    ];
    
    const responseLower = assistantResponse.toLowerCase();
    const relevantKeywords = realEstateKeywords.filter(keyword => 
      responseLower.includes(keyword)
    );
    
    return Math.min(relevantKeywords.length / realEstateKeywords.length, 1);
  }

  private calculateCompleteness(userMessage: string, assistantResponse: string): number {
    // Controlla se la risposta risponde completamente alla domanda
    const questionWords = ['cosa', 'come', 'quando', 'dove', 'perché', 'quale'];
    const messageLower = userMessage.toLowerCase();
    
    const askedQuestions = questionWords.filter(word => messageLower.includes(word));
    
    if (askedQuestions.length === 0) return 1; // Non è una domanda diretta
    
    // Controlla se la risposta contiene informazioni sufficienti
    const responseLength = assistantResponse.length;
    const expectedLength = askedQuestions.length * 100; // 100 caratteri per domanda
    
    return Math.min(responseLength / expectedLength, 1);
  }

  private calculateConversationFlow(userMessage: string, assistantResponse: string): number {
    // Controlla la fluidità della conversazione
    const flowIndicators = [
      'perfetto', 'ottimo', 'capisco', 'esatto', 'proprio così',
      'inoltre', 'inoltre', 'infine', 'quindi', 'pertanto'
    ];
    
    const responseLower = assistantResponse.toLowerCase();
    const flowScore = flowIndicators.filter(indicator => 
      responseLower.includes(indicator)
    ).length;
    
    return Math.min(flowScore / 3, 1); // Max 3 indicatori
  }

  private calculateErrorRate(functionCalls: any[]): number {
    if (functionCalls.length === 0) return 1; // Nessun errore se nessuna chiamata
    
    const failedCalls = functionCalls.filter(call => !call.success);
    return 1 - (failedCalls.length / functionCalls.length);
  }

  private calculateComplianceScore(assistantResponse: string): number {
    // Controlla presenza di disclaimer e informazioni normative
    const complianceIndicators = [
      'consulta un professionista', 'verifica con le autorità',
      'normativa vigente', 'regolamento', 'permessi'
    ];
    
    const responseLower = assistantResponse.toLowerCase();
    const complianceCount = complianceIndicators.filter(indicator => 
      responseLower.includes(indicator)
    ).length;
    
    return Math.min(complianceCount / complianceIndicators.length, 1);
  }

  private calculatePrivacyScore(userMessage: string, assistantResponse: string): number {
    // Controlla che non vengano esposti dati sensibili
    const sensitivePatterns = [
      /\b\d{16}\b/g, // Carte di credito
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{11}\b/g, // Codici fiscali
    ];
    
    const text = `${userMessage} ${assistantResponse}`;
    let violations = 0;
    
    for (const pattern of sensitivePatterns) {
      if (pattern.test(text)) {
        violations++;
      }
    }
    
    return violations === 0 ? 1 : Math.max(0, 1 - violations * 0.3);
  }

  private calculateFunctionCallSuccess(functionCalls: any[]): number {
    if (functionCalls.length === 0) return 1;
    
    const successfulCalls = functionCalls.filter(call => call.success);
    return successfulCalls.length / functionCalls.length;
  }

  private calculateRAGRelevance(ragContext: any): number {
    if (!ragContext?.relevantMemories) return 0;
    
    const memories = ragContext.relevantMemories;
    if (memories.length === 0) return 0;
    
    const averageRelevance = memories.reduce((sum: number, memory: any) => 
      sum + memory.relevanceScore, 0
    ) / memories.length;
    
    return averageRelevance;
  }

  private calculateContextUtilization(ragContext: any): number {
    if (!ragContext) return 0;
    
    let utilization = 0;
    
    if (ragContext.projectContext) utilization += 0.3;
    if (ragContext.marketContext) utilization += 0.3;
    if (ragContext.relevantMemories?.length > 0) utilization += 0.4;
    
    return Math.min(utilization, 1);
  }

  private calculateAverageMetrics(events: EvaluationEvent[]): EvaluationMetrics {
    if (events.length === 0) {
      return {
        responseTime: 0,
        accuracy: 0,
        relevance: 0,
        completeness: 0,
        conversationFlow: 0,
        errorRate: 0,
        guardrailScore: 0,
        complianceScore: 0,
        privacyScore: 0,
        functionCallSuccess: 0,
        ragRelevance: 0,
        contextUtilization: 0,
      };
    }

    const totals = events.reduce((acc, event) => {
      const metrics = event.metrics;
      return {
        responseTime: acc.responseTime + metrics.responseTime,
        accuracy: acc.accuracy + metrics.accuracy,
        relevance: acc.relevance + metrics.relevance,
        completeness: acc.completeness + metrics.completeness,
        conversationFlow: acc.conversationFlow + metrics.conversationFlow,
        errorRate: acc.errorRate + metrics.errorRate,
        guardrailScore: acc.guardrailScore + metrics.guardrailScore,
        complianceScore: acc.complianceScore + metrics.complianceScore,
        privacyScore: acc.privacyScore + metrics.privacyScore,
        functionCallSuccess: acc.functionCallSuccess + metrics.functionCallSuccess,
        ragRelevance: acc.ragRelevance + metrics.ragRelevance,
        contextUtilization: acc.contextUtilization + metrics.contextUtilization,
      };
    }, {
      responseTime: 0, accuracy: 0, relevance: 0, completeness: 0,
      conversationFlow: 0, errorRate: 0, guardrailScore: 0,
      complianceScore: 0, privacyScore: 0, functionCallSuccess: 0,
      ragRelevance: 0, contextUtilization: 0,
    });

    const count = events.length;
    return {
      responseTime: totals.responseTime / count,
      accuracy: totals.accuracy / count,
      relevance: totals.relevance / count,
      completeness: totals.completeness / count,
      conversationFlow: totals.conversationFlow / count,
      errorRate: totals.errorRate / count,
      guardrailScore: totals.guardrailScore / count,
      complianceScore: totals.complianceScore / count,
      privacyScore: totals.privacyScore / count,
      functionCallSuccess: totals.functionCallSuccess / count,
      ragRelevance: totals.ragRelevance / count,
      contextUtilization: totals.contextUtilization / count,
    };
  }

  private calculateTrends(events: EvaluationEvent[]): PerformanceReport['trends'] {
    if (events.length < 2) {
      return {
        responseTime: 'stable',
        accuracy: 'stable',
        userSatisfaction: 'stable',
      };
    }

    // Dividi eventi in due metà per confronto
    const midPoint = Math.floor(events.length / 2);
    const firstHalf = events.slice(0, midPoint);
    const secondHalf = events.slice(midPoint);

    const firstMetrics = this.calculateAverageMetrics(firstHalf);
    const secondMetrics = this.calculateAverageMetrics(secondHalf);

    const getTrend = (first: number, second: number): 'improving' | 'stable' | 'degrading' => {
      const diff = second - first;
      if (diff > 0.05) return 'improving';
      if (diff < -0.05) return 'degrading';
      return 'stable';
    };

    return {
      responseTime: getTrend(firstMetrics.responseTime, secondMetrics.responseTime),
      accuracy: getTrend(firstMetrics.accuracy, secondMetrics.accuracy),
      userSatisfaction: getTrend(
        firstMetrics.userSatisfaction || 0,
        secondMetrics.userSatisfaction || 0
      ),
    };
  }

  private identifyTopIssues(events: EvaluationEvent[]): string[] {
    const issues: { [key: string]: number } = {};

    events.forEach(event => {
      if (!event.success) {
        issues[event.error || 'Errore sconosciuto'] = (issues[event.error || 'Errore sconosciuto'] || 0) + 1;
      }

      if (event.metrics.accuracy < 0.7) {
        issues['Bassa accuratezza'] = (issues['Bassa accuratezza'] || 0) + 1;
      }

      if (event.metrics.guardrailScore < 0.8) {
        issues['Violazioni guardrails'] = (issues['Violazioni guardrails'] || 0) + 1;
      }

      if (event.metrics.responseTime > 5000) {
        issues['Tempo di risposta elevato'] = (issues['Tempo di risposta elevato'] || 0) + 1;
      }
    });

    return Object.entries(issues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  private generateRecommendations(
    metrics: EvaluationMetrics,
    trends: PerformanceReport['trends'],
    topIssues: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.accuracy < 0.8) {
      recommendations.push('Migliorare la precisione delle risposte con training aggiuntivo');
    }

    if (metrics.guardrailScore < 0.9) {
      recommendations.push('Rafforzare i guardrails per maggiore sicurezza');
    }

    if (metrics.responseTime > 3000) {
      recommendations.push('Ottimizzare i tempi di risposta del sistema');
    }

    if (trends.accuracy === 'degrading') {
      recommendations.push('Investigare il declino nell\'accuratezza');
    }

    if (topIssues.includes('Bassa accuratezza')) {
      recommendations.push('Implementare controlli di qualità più rigorosi');
    }

    return recommendations;
  }
}

/**
 * Singleton per il sistema di valutazione
 */
let evaluationInstance: EvaluationSystem;

export function getEvaluationSystem(): EvaluationSystem {
  if (!evaluationInstance) {
    evaluationInstance = new EvaluationSystem();
  }
  return evaluationInstance;
}
