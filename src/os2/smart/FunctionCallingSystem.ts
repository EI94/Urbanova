// 🛠️ OPENAI FUNCTION CALLING - Sistema intelligente per decisioni tool
// Integrazione OpenAI Function Calling per decisioni autonome e intelligenti

import { OpenAI } from 'openai';
import { URBANOVA_PARAHELP_TEMPLATE, ParaHelpDecisionEngine } from './ParaHelpTemplate';
import { getRAGSystem, RAGContext } from './RAGSystem';
import { SkillCatalog } from '../skills/SkillCatalog';
import { CacheFactory } from '../utils/ResponseCache';
import { getWorkflowEngine, WorkflowTemplates } from '../workflows/WorkflowEngine';

export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
  confidence: number;
  reasoning: string;
}

export interface FunctionCallResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: any;
}

export interface SmartDecision {
  action: 'function_call' | 'conversation' | 'clarification' | 'escalation' | 'workflow';
  functionCalls?: FunctionCall[];
  workflow?: {
    name: string;
    steps: any[];
  };
  response?: string;
  reasoning: string;
  confidence: number;
  requiresConfirmation: boolean;
  context: {
    relevantMemories: any[];
    projectContext?: any;
    marketContext?: any;
  };
}

/**
 * Sistema OpenAI Function Calling per OS 2.0 Smart
 */
export class OpenAIFunctionCallingSystem {
  private openai: OpenAI;
  private paraHelpEngine: ParaHelpDecisionEngine;
  private ragSystem: any;
  private skillCatalog: SkillCatalog;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.paraHelpEngine = new ParaHelpDecisionEngine(URBANOVA_PARAHELP_TEMPLATE);
    this.ragSystem = getRAGSystem();
    this.skillCatalog = SkillCatalog.getInstance();
  }

  /**
   * Sistema ibrido per decisioni senza OpenAI
   */
  private makeHybridDecision(userMessage: string, context: RAGContext): SmartDecision | null {
    const message = userMessage.toLowerCase();
    
    // Workflow Multi-step
    if (this.isMultiStepRequest(message)) {
      return this.handleMultiStepWorkflow(message, context);
    }
    
    // Analisi Fattibilità - Pattern più ampi
    if ((message.includes('analisi') && (message.includes('fattibilità') || message.includes('terreno') || message.includes('terreno'))) ||
        message.includes('analizza') ||
        message.includes('fattibilità') ||
        (message.includes('terreno') && (message.includes('costruire') || message.includes('appartamenti')))) {
      return {
        action: 'function_call',
        functionCalls: [{
          name: 'feasibility.analyze',
          arguments: {
            landArea: this.extractArea(userMessage) || 1000,
            constructionCostPerSqm: 1200,
            salePrice: 3000
          },
          confidence: 0.9,
          reasoning: 'Rilevata richiesta analisi fattibilità'
        }],
        reasoning: 'Sistema ibrido: analisi fattibilità',
        confidence: 0.9,
        requiresConfirmation: false,
        context: { relevantMemories: [] },
      };
    }
    
    // Business Plan - Pattern più ampi
    if (message.includes('business plan') || 
        message.includes('piano') || 
        message.includes('bp') ||
        message.includes('business') ||
        (message.includes('calcola') && message.includes('roi')) ||
        (message.includes('progetto') && message.includes('residenziale'))) {
      return {
        action: 'function_call',
        functionCalls: [{
          name: 'business_plan.calculate',
          arguments: {
            projectName: this.extractProjectName(userMessage),
            units: this.extractUnits(userMessage) || 8,
            salePrice: 3000,
            constructionCost: 1200,
            landScenarios: [
              { price: 500, area: 1000 },
              { price: 600, area: 1200 }
            ]
          },
          confidence: 0.9,
          reasoning: 'Rilevata richiesta business plan'
        }],
        reasoning: 'Sistema ibrido: business plan',
        confidence: 0.9,
        requiresConfirmation: false,
        context: { relevantMemories: [] },
      };
    }
    
    // Lista Progetti - Pattern più ampi
    if ((message.includes('mostra') && (message.includes('progetti') || message.includes('analisi') || message.includes('business'))) ||
        message.includes('visualizza') ||
        message.includes('lista') ||
        message.includes('tutti i miei')) {
      return {
        action: 'function_call',
        functionCalls: [{
          name: 'project.list',
          arguments: {
            type: this.extractProjectType(userMessage)
          },
          confidence: 0.8,
          reasoning: 'Rilevata richiesta lista progetti'
        }],
        reasoning: 'Sistema ibrido: lista progetti',
        confidence: 0.8,
        requiresConfirmation: false,
        context: { relevantMemories: [] },
      };
    }
    
    return null; // Nessuna decisione ibrida disponibile
  }

  /**
   * Estrae informazioni dal messaggio utente
   */
  private extractLocation(message: string): string {
    const locations = ['roma', 'milano', 'firenze', 'torino', 'bologna', 'napoli', 'venezia', 'genova'];
    const found = locations.find(loc => message.toLowerCase().includes(loc));
    return found || 'Non specificata';
  }

  private extractProjectType(message: string): string {
    if (message.includes('residenziale') || message.includes('appartamenti')) return 'residenziale';
    if (message.includes('commerciale') || message.includes('uffici')) return 'commerciale';
    if (message.includes('misto')) return 'misto';
    return 'residenziale';
  }

  private extractArea(message: string): number {
    const match = message.match(/(\d+)\s*m[²2]?/i);
    return match ? parseInt(match[1]) : 0;
  }

  private extractProjectName(message: string): string {
    // Estrae nome progetto se presente
    const match = message.match(/progetto\s+([a-zA-Z\s]+)/i);
    return match ? match[1].trim() : 'Nuovo Progetto';
  }

  private extractUnits(message: string): number {
    const match = message.match(/(\d+)\s*unità/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Prende una decisione intelligente basata su contesto e memoria
   */
  async makeSmartDecision(
    userMessage: string,
    context: RAGContext
  ): Promise<SmartDecision> {
    try {
      console.log('🧠 [FunctionCalling] Prendendo decisione intelligente per:', userMessage);

      // 1. Costruisci contesto completo per LLM
      const ragContext = await this.ragSystem.buildConversationContext(userMessage, context);
      
      // 2. Prepara prompt per OpenAI con function calling
      const systemPrompt = this.buildSystemPrompt(ragContext);
      const availableFunctions = this.getAvailableFunctions();
      
      // 3. Chiama OpenAI con function calling
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        functions: availableFunctions,
        function_call: 'auto',
        temperature: 0.1,
        max_tokens: 2000,
      });

      // 4. Processa la risposta
      const decision = await this.processOpenAIResponse(response, ragContext);
      
      console.log(`✅ [FunctionCalling] Decisione presa: ${decision.action} (confidence: ${decision.confidence})`);
      
      return decision;

    } catch (error) {
      console.error('❌ [FunctionCalling] Errore decisione intelligente:', error);
      
      // Fallback intelligente basato sul messaggio utente
      const fallbackResponse = this.generateFallbackResponse(userMessage);
      
      return {
        action: 'conversation',
        response: fallbackResponse,
        reasoning: 'Fallback intelligente per errore tecnico',
        confidence: 0.7,
        requiresConfirmation: false,
        context: { relevantMemories: [] },
      };
    }
  }

  /**
   * Esegue function calls decise dal sistema
   */
  async executeFunctionCalls(
    functionCalls: FunctionCall[],
    context: RAGContext
  ): Promise<FunctionCallResult[]> {
    const results: FunctionCallResult[] = [];

    for (const functionCall of functionCalls) {
      try {
        console.log(`🛠️ [FunctionCalling] Eseguendo: ${functionCall.name}`);
        
        // Verifica se la funzione è permessa dal ParaHelp
        const validation = this.paraHelpEngine.validateAction(functionCall.name, context);
        
        if (!validation.allowed) {
          results.push({
            success: false,
            error: validation.reason || 'Azione non permessa',
          });
          continue;
        }

        // Esegui la funzione
        const result = await this.executeFunction(functionCall.name, functionCall.arguments, context);
        
        results.push({
          success: true,
          result,
          metadata: {
            functionName: functionCall.name,
            confidence: functionCall.confidence,
            reasoning: functionCall.reasoning,
          },
        });

        // Aggiorna memoria RAG
        await this.ragSystem.updateMemoryFromInteraction({
          userMessage: `Eseguito: ${functionCall.name}`,
          assistantResponse: JSON.stringify(result),
          context,
          success: true,
          metadata: {
            skillId: functionCall.name,
            inputs: functionCall.arguments,
            outputs: result,
          },
        });

      } catch (error) {
        console.error(`❌ [FunctionCalling] Errore esecuzione ${functionCall.name}:`, error);
        
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
        });
      }
    }

    return results;
  }

  /**
   * Costruisce il system prompt per OpenAI
   */
  private buildSystemPrompt(ragContext: any): string {
    const template = URBANOVA_PARAHELP_TEMPLATE;
    
    return `Sei Urbanova OS, l'assistente AI avanzato per lo sviluppo immobiliare.

🎯 TUA MISSIONE:
${template.purpose.mission}

👤 CHI SEI:
${template.role.identity}
Sei un collega collaborativo, preciso e brillante che eccede sempre le aspettative del cliente.

🛠️ COSA PUOI FARE:
Hai accesso a potenti funzioni (tools) per:
${template.role.capabilities.map(cap => `• ${cap}`).join('\n')}

📋 CONTESTO UTENTE:
- User ID: ${ragContext.userContext?.userId}
- Progetti attivi: ${ragContext.projectContext?.activeProjects || 0}
- Conversazione: ${ragContext.conversationHistory?.length || 0} messaggi precedenti

💬 CONVERSAZIONE PRECEDENTE:
${ragContext.conversationHistory?.slice(-3).map((msg: any) => 
  `${msg.role === 'user' ? '👤 Utente' : '🤖 Tu'}: ${msg.content}`
).join('\n') || 'Nessuna conversazione precedente'}

🧠 MEMORIA RILEVANTE:
${ragContext.relevantMemories?.map((m: any) => `• ${m.contentSnippet}`).join('\n') || 'Nessuna memoria rilevante'}

📌 COME DECIDERE:

1. **Per Azioni Concrete** (analisi, business plan, progetti):
   → USA FUNCTION CALLING
   → Chiama la function appropriata con parametri completi
   → Esempio: Se utente dice "analizza terreno a Roma", chiama feasibility.analyze

2. **Per Conversazioni** (saluti, domande generali, chiarimenti):
   → RISPONDI DIRETTAMENTE
   → Nessuna function calling necessaria
   → Sii amichevole ma professionale

3. **Per Workflow Complessi** (più azioni in sequenza):
   → CHIAMA MULTIPLE FUNCTIONS in ordine logico
   → Esempio: "fa tutto" → feasibility.analyze + business_plan.calculate

4. **Per Informazioni Mancanti**:
   → CHIEDI CHIARIMENTI
   → Non inventare parametri
   → Sii specifico su cosa ti serve

⚡ REGOLE CHIAVE:
• SEMPRE usa function calling per azioni concrete
• MAI inventare dati o parametri
• SEMPRE conferma prima di azioni distruttive
• SEMPRE rispondi in italiano
• SEMPRE sii empatico e collaborativo

🎨 STILE RISPOSTA (Johnny Ive):
• Minimal ma informativo
• Chiaro e diretto
• Emoji solo quando aggiungono valore
• Formattazione pulita

Ora analizza il messaggio utente e decidi la migliore azione.`;
  }

  /**
   * Ottiene le funzioni disponibili per OpenAI
   */
  private getAvailableFunctions(): any[] {
    const skills = this.skillCatalog.list();
    
    return skills.map(skill => ({
      name: skill.id,
      description: skill.summary,
      parameters: {
        type: 'object',
        properties: this.buildFunctionParameters(skill.inputsSchema),
        required: skill.inputsSchema.required || [],
      },
    }));
  }

  /**
   * Costruisce parametri per function calling
   */
  private buildFunctionParameters(schema: any): any {
    const properties: any = {};
    
    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        properties[key] = {
          type: (value as any).type,
          description: (value as any).description || `Parametro ${key}`,
        };
      }
    }
    
    return properties;
  }

  /**
   * Processa la risposta di OpenAI
   */
  private async processOpenAIResponse(response: any, ragContext: any): Promise<SmartDecision> {
    const message = response.choices[0].message;
    
    console.log('🔍 [FunctionCalling] OpenAI Response Debug:', {
      hasFunctionCall: !!message.function_call,
      hasContent: !!message.content,
      content: message.content?.substring(0, 100) + '...',
      messageKeys: Object.keys(message)
    });
    
    // Se OpenAI ha chiamato delle funzioni
    if (message.function_call) {
      const functionCall: FunctionCall = {
        name: message.function_call.name,
        arguments: JSON.parse(message.function_call.arguments),
        confidence: 0.8, // Default confidence per function calls
        reasoning: message.function_call.name,
      };

      // Verifica se richiede conferma
      const requiresConfirmation = this.paraHelpEngine.requiresConfirmation(functionCall.name);

      return {
        action: 'function_call',
        functionCalls: [functionCall],
        reasoning: `OpenAI ha deciso di eseguire: ${functionCall.name}`,
        confidence: 0.8,
        requiresConfirmation,
        context: ragContext,
      };
    }

    // Se OpenAI ha risposto con testo
    return {
      action: 'conversation',
      response: message.content,
      reasoning: 'OpenAI ha scelto di rispondere conversazionalmente',
      confidence: 0.9,
      requiresConfirmation: false,
      context: ragContext,
    };
  }

  /**
   * Esegue una funzione specifica
   */
  private async executeFunction(
    functionName: string,
    args: Record<string, any>,
    context: RAGContext
  ): Promise<any> {
    const skill = this.skillCatalog.get(functionName);
    
    if (!skill) {
      throw new Error(`Skill '${functionName}' non trovato`);
    }

    // Crea execution context
    const executionContext = {
      userId: context.userContext.userId,
      userEmail: context.userContext.userEmail,
      sessionId: context.userContext.sessionId,
      projectId: context.userContext.projectId,
      userRoles: context.userContext.userRoles,
      environment: 'production' as const,
    };

    // Esegui skill
    const result = await skill.execute(args, executionContext);
    
    return result;
  }

  /**
   * Check se la richiesta è multi-step
   */
  private isMultiStepRequest(message: string): boolean {
    // Pattern che indicano workflow multi-step
    const multiStepPatterns = [
      'tutto', 'completo', 'dall\'inizio alla fine',
      'trasforma.*in', 'crea.*e.*invia', 'analizza.*e.*crea',
      'prima.*poi', 'dopo.*voglio', 'e poi', 'e successivamente'
    ];

    return multiStepPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(message)
    );
  }

  /**
   * Gestisce workflow multi-step
   */
  private handleMultiStepWorkflow(message: string, context: RAGContext): SmartDecision {
    console.log('🔄 [FunctionCalling] Rilevato workflow multi-step');

    // Trasforma Analisi → Business Plan
    if (message.includes('trasforma') && message.includes('analisi') && message.includes('business')) {
      return {
        action: 'workflow',
        workflow: {
          name: 'feasibility_to_business_plan',
          steps: WorkflowTemplates.feasibilityToBusinessPlan(
            this.extractLocation(message),
            this.extractArea(message) || 1000,
            this.extractUnits(message) || 8
          ),
        },
        reasoning: 'Workflow: Analisi → Business Plan',
        confidence: 0.9,
        requiresConfirmation: false,
        context: { relevantMemories: [] },
      };
    }

    // Business Plan Completo (calcolo + sensitivity + export)
    if ((message.includes('business') && message.includes('tutto')) ||
        (message.includes('business') && message.includes('completo'))) {
      return {
        action: 'workflow',
        workflow: {
          name: 'business_plan_complete',
          steps: WorkflowTemplates.businessPlanComplete(
            this.extractProjectName(message)
          ),
        },
        reasoning: 'Workflow: Business Plan Completo',
        confidence: 0.9,
        requiresConfirmation: false,
        context: { relevantMemories: [] },
      };
    }

    // Workflow completo: analisi + business plan + sensitivity + invio
    if (message.includes('tutto') || message.includes('completo')) {
      return {
        action: 'conversation',
        response: '🔄 **Workflow Completo Disponibile**\n\nPosso creare un workflow completo che include:\n\n1️⃣ Analisi di Fattibilità\n2️⃣ Business Plan\n3️⃣ Sensitivity Analysis\n4️⃣ Export e Condivisione\n\nVuoi che proceda con tutto? Dimmi "sì procedi" per iniziare!',
        reasoning: 'Proposta workflow completo',
        confidence: 0.8,
        requiresConfirmation: true,
        context: { relevantMemories: [] },
      };
    }

    // Default: fallback conversazionale
    return {
      action: 'conversation',
      response: 'Ho rilevato una richiesta multi-step. Posso aiutarti a:\n• Trasformare analisi in business plan\n• Creare progetti completi\n• Gestire workflow complessi\n\nDimmi esattamente cosa vuoi fare!',
      reasoning: 'Richiesta multi-step non riconosciuta',
      confidence: 0.6,
      requiresConfirmation: false,
      context: { relevantMemories: [] },
    };
  }

  /**
   * Genera risposta di fallback intelligente basata sul messaggio utente
   */
  private generateFallbackResponse(userMessage: string): string {
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
   * Valida una decisione contro il template ParaHelp
   */
  validateDecision(decision: SmartDecision): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (decision.functionCalls) {
      for (const functionCall of decision.functionCalls) {
        const validation = this.paraHelpEngine.validateAction(functionCall.name, {});
        
        if (!validation.allowed) {
          warnings.push(`Funzione '${functionCall.name}' non è permessa`);
        }
        
        if (validation.requiresConfirmation && !decision.requiresConfirmation) {
          warnings.push(`Funzione '${functionCall.name}' richiede conferma`);
        }
      }
    }

    if (decision.confidence < 0.5) {
      warnings.push('Confidence bassa per la decisione');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }
}

/**
 * Singleton per il sistema Function Calling
 */
let functionCallingInstance: OpenAIFunctionCallingSystem;

export function getFunctionCallingSystem(): OpenAIFunctionCallingSystem {
  if (!functionCallingInstance) {
    functionCallingInstance = new OpenAIFunctionCallingSystem();
  }
  return functionCallingInstance;
}
