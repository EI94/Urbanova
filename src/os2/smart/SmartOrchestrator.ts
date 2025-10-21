// 🚀 SMART ORCHESTRATOR - Orchestratore intelligente per OS 2.0 Smart
// Combina RAG, Function Calling, Guardrails e Evaluation in un sistema unificato

import { getRAGSystem, RAGContext } from './RAGSystem';
import { getFunctionCallingSystem, SmartDecision } from './FunctionCallingSystem';
import { getGuardrailsSystem, GuardrailContext } from './GuardrailsSystem';
import { getEvaluationSystem, EvaluationEvent } from './EvaluationSystem';
import { URBANOVA_PARAHELP_TEMPLATE } from './ParaHelpTemplate';

export interface SmartOSRequest {
  userMessage: string;
  userId: string;
  userEmail: string;
  sessionId: string;
  projectId?: string;
  userRoles?: string[];
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

export interface SmartOSResponse {
  success: boolean;
  response?: string;
  functionCalls?: any[];
  requiresConfirmation: boolean;
  reasoning: string;
  confidence: number;
  metadata: {
    ragContext: any;
    guardrailResult: any;
    evaluationMetrics: any;
    processingTime: number;
  };
  error?: string;
}

/**
 * Orchestratore Smart per OS 2.0
 * Combina tutti i sistemi intelligenti in un flusso unificato
 */
export class SmartOSOrchestrator {
  private ragSystem = getRAGSystem();
  private functionCallingSystem = getFunctionCallingSystem();
  private guardrailsSystem = getGuardrailsSystem();
  private evaluationSystem = getEvaluationSystem();

  /**
   * Processa una richiesta completa attraverso il sistema smart
   */
  async processRequest(request: SmartOSRequest): Promise<SmartOSResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 [SmartOS] Processando richiesta intelligente...');

      // 1. Costruisci contesto RAG
      const ragContext: RAGContext = {
        userContext: {
          userId: request.userId,
          userEmail: request.userEmail,
          sessionId: request.sessionId,
          projectId: request.projectId,
          userRoles: request.userRoles || ['editor'],
        },
        conversationHistory: request.conversationHistory || [],
      };

      // 2. Prendi decisione intelligente
      let decision;
      try {
        decision = await this.functionCallingSystem.makeSmartDecision(
          request.userMessage,
          ragContext
        );
        
        console.log(`🧠 [SmartOS] Decisione presa:`, {
          action: decision.action,
          hasResponse: !!decision.response,
          hasFunctionCalls: !!(decision.functionCalls && decision.functionCalls.length > 0),
          response: decision.response?.substring(0, 100) + '...'
        });
      } catch (error) {
        console.error('❌ [SmartOS] Errore decisione intelligente:', error);
        // Fallback diretto
        decision = {
          action: 'conversation',
          response: this.generateIntelligentFallback(request.userMessage),
          reasoning: 'Fallback per errore decisione',
          confidence: 0.7,
          requiresConfirmation: false,
          context: { relevantMemories: [] },
        };
      }

      // 3. Esegui function calls se necessario
      let functionResults: any[] = [];
      if (decision.functionCalls && decision.functionCalls.length > 0) {
        functionResults = await this.functionCallingSystem.executeFunctionCalls(
          decision.functionCalls,
          ragContext
        );
      }

      // 4. Genera risposta finale
      let finalResponse = decision.response || '';
      
      if (decision.functionCalls && functionResults.length > 0) {
        finalResponse = await this.generateResponseFromFunctionResults(
          request.userMessage,
          decision.functionCalls,
          functionResults,
          ragContext
        );
      } else if (decision.action === 'conversation' && decision.response) {
        // Per risposte conversazionali dirette, usa la risposta di OpenAI
        finalResponse = decision.response;
        console.log(`💬 [SmartOS] Risposta conversazionale: ${finalResponse}`);
      } else {
        // Fallback: genera risposta intelligente basata sul messaggio
        finalResponse = this.generateIntelligentFallback(request.userMessage);
        console.log(`🔄 [SmartOS] Fallback intelligente: ${finalResponse}`);
      }

      // 5. Applica guardrails
      const guardrailContext: GuardrailContext = {
        userMessage: request.userMessage,
        assistantResponse: finalResponse,
        functionCalls: decision.functionCalls,
        userContext: ragContext.userContext,
        conversationHistory: ragContext.conversationHistory,
      };

      const guardrailResult = await this.guardrailsSystem.validateResponse(guardrailContext);

      // 6. Applica correzioni se necessario
      if (!guardrailResult.passed) {
        finalResponse = await this.guardrailsSystem.applyCorrections(
          finalResponse,
          guardrailResult.violations
        );
      }

      // 7. Calcola metriche di valutazione
      const processingTime = Date.now() - startTime;
      const evaluationMetrics = this.evaluationSystem.calculateMetrics(
        request.userMessage,
        finalResponse,
        decision.functionCalls || [],
        ragContext,
        processingTime,
        guardrailResult
      );

      // 8. Registra evento di valutazione
      const evaluationEvent: Omit<EvaluationEvent, 'id' | 'timestamp'> = {
        userId: request.userId,
        sessionId: request.sessionId,
        projectId: request.projectId,
        userMessage: request.userMessage,
        userContext: ragContext.userContext,
        decisionType: decision.action,
        functionCalls: decision.functionCalls,
        ragContext,
        assistantResponse: finalResponse,
        success: guardrailResult.passed,
        metrics: evaluationMetrics,
      };

      await this.evaluationSystem.recordEvaluationEvent(evaluationEvent);

      // 9. Aggiorna memoria RAG
      await this.ragSystem.updateMemoryFromInteraction({
        userMessage: request.userMessage,
        assistantResponse: finalResponse,
        context: ragContext,
        success: guardrailResult.passed,
        metadata: {
          skillId: decision.functionCalls?.[0]?.name,
          inputs: decision.functionCalls?.[0]?.arguments,
          outputs: functionResults,
        },
      });

      console.log(`✅ [SmartOS] Richiesta processata: ${decision.action} (${processingTime}ms)`);

      return {
        success: guardrailResult.passed,
        response: finalResponse,
        functionCalls: decision.functionCalls,
        requiresConfirmation: decision.requiresConfirmation,
        reasoning: decision.reasoning,
        confidence: decision.confidence,
        metadata: {
          ragContext,
          guardrailResult,
          evaluationMetrics,
          processingTime,
        },
      };

    } catch (error) {
      console.error('❌ [SmartOS] Errore processamento richiesta:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        requiresConfirmation: false,
        reasoning: 'Errore nel sistema smart',
        confidence: 0,
        metadata: {
          ragContext: null,
          guardrailResult: null,
          evaluationMetrics: null,
          processingTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Genera risposta basata sui risultati delle function calls
   */
  private async generateResponseFromFunctionResults(
    userMessage: string,
    functionCalls: any[],
    functionResults: any[],
    ragContext: RAGContext
  ): Promise<string> {
    try {
      // Se c'è solo una function call e ha successo, genera risposta specifica
      if (functionCalls.length === 1 && functionResults[0]?.success) {
        const functionCall = functionCalls[0];
        const result = functionResults[0].result;

        // Genera risposta basata sul tipo di skill
        switch (functionCall.name) {
          case 'conversation.general':
            return result.response || 'Come posso aiutarti oggi?';

          case 'business_plan.run':
            return this.formatBusinessPlanResponse(result);

          case 'feasibility_analysis.run':
            return this.formatFeasibilityResponse(result);

          case 'project.list':
            return this.formatProjectListResponse(result);

          default:
            return this.formatGenericFunctionResponse(functionCall.name, result);
        }
      }

      // Per multiple function calls o fallimenti, genera risposta aggregata
      return this.formatAggregatedResponse(functionCalls, functionResults);

    } catch (error) {
      console.error('❌ [SmartOS] Errore generazione risposta:', error);
      return 'Ho elaborato la tua richiesta. Come posso aiutarti ulteriormente?';
    }
  }

  /**
   * Genera fallback intelligente basato sul messaggio utente
   */
  private generateIntelligentFallback(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Saluti
    if (message.includes('ciao') || message.includes('salve') || message.includes('buongiorno') || message.includes('buonasera')) {
      return `Ciao! 👋 Sono l'assistente di Urbanova. Posso aiutarti con:\n\n• 📊 Analisi di fattibilità\n• 📈 Business Plan\n• 🏗️ Gestione progetti\n• 📧 Comunicazioni\n\nCosa posso fare per te oggi?`;
    }
    
    // Business Plan
    if (message.includes('business plan') || message.includes('bp') || message.includes('piano')) {
      return `📈 **Business Plan**\n\nPosso aiutarti a creare un Business Plan completo per il tuo progetto immobiliare.\n\nPer iniziare, dimmi:\n• Che tipo di progetto hai in mente?\n• In quale zona?\n• Quante unità?\n\nOppure usa il pulsante "Crea Business Plan" nel dashboard!`;
    }
    
    // Analisi Fattibilità
    if (message.includes('analisi') || message.includes('fattibilità') || message.includes('terreno') || message.includes('valutazione')) {
      return `📊 **Analisi di Fattibilità**\n\nPosso analizzare la fattibilità del tuo progetto immobiliare.\n\nPer iniziare, dimmi:\n• Dove si trova il terreno?\n• Che tipo di progetto vuoi realizzare?\n• Quali sono le caratteristiche principali?\n\nOppure usa il pulsante "Nuova Analisi" nel dashboard!`;
    }
    
    // Progetti
    if (message.includes('progetto') || message.includes('progetti') || message.includes('lista')) {
      return `🏗️ **Gestione Progetti**\n\nPosso aiutarti a gestire i tuoi progetti immobiliari.\n\nPuoi:\n• Visualizzare tutti i tuoi progetti\n• Creare nuovi progetti\n• Modificare progetti esistenti\n• Generare report\n\nVai nella sezione "Progetti" del dashboard!`;
    }
    
    // Aiuto generico
    if (message.includes('aiuto') || message.includes('help') || message.includes('cosa') || message.includes('come')) {
      return `🤖 **Come posso aiutarti**\n\nSono l'assistente di Urbanova e posso aiutarti con:\n\n• **Analisi di Fattibilità** - Valuta terreni e progetti\n• **Business Plan** - Crea piani finanziari completi\n• **Gestione Progetti** - Organizza i tuoi progetti\n• **Comunicazioni** - Invia RDO e gestisci fornitori\n• **Market Intelligence** - Analizza il mercato immobiliare\n\nDimmi cosa ti serve e ti guiderò! 🚀`;
    }
    
    // Default
    return `Capisco! 💡 Posso aiutarti con progetti immobiliari, business plan, analisi di fattibilità e molto altro.\n\nProva a dirmi qualcosa come:\n• "Crea un business plan"\n• "Analizza questo terreno"\n• "Mostra i miei progetti"\n\nCosa ti serve?`;
  }

  /**
   * Formatta risposta per Business Plan
   */
  private formatBusinessPlanResponse(result: any): string {
    if (!result) return 'Business Plan elaborato con successo.';

    const response = `📊 **Business Plan Completato**

✅ Analisi finanziaria completata
📈 Metriche chiave:
${result.kpis ? result.kpis.map((kpi: any) => `• ${kpi.label}: ${kpi.value}`).join('\n') : ''}

${result.artifacts ? `📄 Documenti generati:\n${result.artifacts.map((art: any) => `• ${art.name}`).join('\n')}` : ''}

Vuoi esplorare qualche aspetto specifico o procedere con il prossimo passo?`;

    return response;
  }

  /**
   * Formatta risposta per Analisi di Fattibilità
   */
  private formatFeasibilityResponse(result: any): string {
    if (!result) return 'Analisi di fattibilità completata.';

    const response = `🏗️ **Analisi di Fattibilità Completata**

✅ Valutazione terreno completata
📊 Risultati:
${result.roi ? `• ROI: ${result.roi}%` : ''}
${result.margin ? `• Margine: ${result.margin}%` : ''}
${result.payback ? `• Payback: ${result.payback} anni` : ''}

${result.recommendations ? `💡 Raccomandazioni:\n${result.recommendations}` : ''}

Vuoi procedere con un Business Plan dettagliato?`;

    return response;
  }

  /**
   * Formatta risposta per lista progetti
   */
  private formatProjectListResponse(result: any): string {
    if (!result || !result.projects) return 'Nessun progetto trovato.';

    const projects = result.projects;
    const response = `📋 **I Tuoi Progetti** (${projects.length} trovati)

${projects.slice(0, 5).map((project: any, index: number) => 
  `${index + 1}. **${project.name || 'Progetto senza nome'}**\n   📍 ${project.location || 'Posizione non specificata'}\n   📊 ${project.status || 'In corso'}`
).join('\n\n')}

${projects.length > 5 ? `\n... e altri ${projects.length - 5} progetti` : ''}

Vuoi aprire un progetto specifico o crearne uno nuovo?`;

    return response;
  }

  /**
   * Formatta risposta generica per function calls
   */
  private formatGenericFunctionResponse(functionName: string, result: any): string {
    const skillNames: { [key: string]: string } = {
      'business_plan.run': 'Business Plan',
      'feasibility_analysis.run': 'Analisi di Fattibilità',
      'project.list': 'Lista Progetti',
      'rdo_send.run': 'Invio RDO',
      'email_send.run': 'Invio Email',
    };

    const skillName = skillNames[functionName] || functionName;
    
    return `✅ **${skillName} Completato**

Operazione eseguita con successo. ${result ? 'Risultati disponibili.' : ''}

Come posso aiutarti ulteriormente?`;
  }

  /**
   * Formatta risposta aggregata per multiple function calls
   */
  private formatAggregatedResponse(functionCalls: any[], functionResults: any[]): string {
    const successfulCalls = functionCalls.filter((_, index) => functionResults[index]?.success);
    const failedCalls = functionCalls.filter((_, index) => !functionResults[index]?.success);

    let response = '🔄 **Operazioni Completate**\n\n';

    if (successfulCalls.length > 0) {
      response += `✅ **Successo** (${successfulCalls.length}):\n`;
      successfulCalls.forEach(call => {
        response += `• ${call.name}\n`;
      });
    }

    if (failedCalls.length > 0) {
      response += `\n❌ **Fallite** (${failedCalls.length}):\n`;
      failedCalls.forEach(call => {
        response += `• ${call.name}\n`;
      });
    }

    response += '\nCome posso aiutarti ulteriormente?';
    return response;
  }

  /**
   * Ottiene report di performance
   */
  async getPerformanceReport(
    userId?: string,
    projectId?: string,
    days: number = 7
  ) {
    return await this.evaluationSystem.generatePerformanceReport(userId, projectId, days);
  }

  /**
   * Registra feedback utente
   */
  async recordUserFeedback(
    eventId: string,
    rating: number,
    comment?: string
  ) {
    return await this.evaluationSystem.recordUserFeedback(eventId, rating, comment);
  }
}

/**
 * Singleton per l'orchestratore smart
 */
let smartOrchestratorInstance: SmartOSOrchestrator;

export function getSmartOSOrchestrator(): SmartOSOrchestrator {
  if (!smartOrchestratorInstance) {
    smartOrchestratorInstance = new SmartOSOrchestrator();
  }
  return smartOrchestratorInstance;
}
