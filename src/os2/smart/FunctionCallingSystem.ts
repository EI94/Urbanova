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
    console.log(`🔧 [FunctionCalling] Inizializzato con ${this.skillCatalog.list().length} skill nel catalog`);
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
      
      console.log(`📋 [FunctionCalling] Invio a OpenAI ${availableFunctions.length} functions:`, 
        availableFunctions.map(f => f.name).join(', '));
      
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
      console.error('❌ [FunctionCalling] Stack:', (error as Error).stack);
      
      // Fallback intelligente basato sul messaggio utente
      const fallbackResponse = this.generateFallbackResponse(userMessage);
      
      return {
        action: 'conversation',
        response: fallbackResponse,
        reasoning: `Fallback per errore: ${(error as Error).message}`,
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

        // Arricchisci parametri con defaults intelligenti
        const enrichedArgs = this.enrichWithDefaults(
          functionCall.name, 
          functionCall.arguments, 
          context.userContext?.userId || ''
        );
        
        // Esegui la funzione con parametri arricchiti
        const result = await this.executeFunction(functionCall.name, enrichedArgs, context);
        
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
    
    // Log critico: verifica memorie nel context
    console.log(`🔍 [System Prompt] Memorie disponibili: ${ragContext.relevantMemories?.length || 0}`);
    if (ragContext.relevantMemories && ragContext.relevantMemories.length > 0) {
      ragContext.relevantMemories.forEach((m: any, i: number) => {
        console.log(`   ${i+1}. "${m.contextSnippet?.substring(0, 80) || m.memory?.content?.substring(0, 80)}..."`);
      });
    }
    
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

👤 APPRENDI E PERSONALIZZA (come Cursor):
Ogni 5-10 interazioni, SALVA automaticamente in memoria:
• Zone geografiche preferite
• Tipi di progetti ricorrenti
• Livello tecnico utente (principiante/esperto)
• Velocità decisionale (veloce/ponderato)
• Metriche che interessano di più (ROI/IRR/NPV)

Usa queste informazioni per:
• Adattare dettaglio risposte
• Anticipare bisogni
• Personalizzare suggerimenti
• Ricordare preferenze

💬 CONVERSAZIONE PRECEDENTE:
${ragContext.conversationHistory?.slice(-3).map((msg: any) => 
  `${msg.role === 'user' ? '👤 Utente' : '🤖 Tu'}: ${msg.content}`
).join('\n') || 'Nessuna conversazione precedente'}

🧠 MEMORIA RILEVANTE (usa queste informazioni per rispondere):
${ragContext.relevantMemories?.map((m: any) => `• ${m.contextSnippet || m.memory?.content?.substring(0, 150)}`).join('\n') || 'Nessuna memoria rilevante'}

🔥 **USA LA MEMORIA PRIMA DI CHIAMARE TOOL** (CRITICO!):

Quando l'utente chiede info su conversazioni precedenti:
• "come si chiamava?" / "quali erano i numeri?" / "torniamo al progetto" / "ricordi?"

🚨 **PROCEDURA OBBLIGATORIA**:
1. LEGGI la sezione "🧠 MEMORIA RILEVANTE" sopra
2. SE la memoria contiene l'informazione richiesta → USA QUELLA per rispondere (conversational, NO function calls)
3. SE la memoria NON contiene info → SOLO ALLORA chiama function (project.list)

Esempi:

User: "Torniamo al progetto, come si chiamava?"
Memoria: "User: Progetto Green Park Residence Milano 20 unità eco budget 3M"
→ action: 'conversation', response: "Il progetto è Green Park Residence a Milano" (NO tools!)

User: "Quante unità erano?"  
Memoria: "User: Progetto Green Park Residence Milano 20 unità eco budget 3M"
→ action: 'conversation', response: "Erano 20 unità eco-friendly" (NO tools!)

User: "Mostrami i miei progetti"
Memoria: Nessuna info progetti
→ action: 'function_call', functionCalls: [{name: 'project_list'}] (USA tool)

📌 **ISTRUZIONI CRITICHE - EXECUTION-FIRST MINDSET**:

🔥 **REGOLA D'ORO ASSOLUTA**:
Sei un COLLEGA che FA, non un assistente che CHIEDE.
Quando l'utente dice di fare qualcosa, ESEGUI IMMEDIATAMENTE usando defaults intelligenti.
Chiedi conferma DOPO aver eseguito, non prima.

⚡ **ACTION TRIGGERS - ESEGUI SEMPRE, MAI SOLO PARLARE**:

🚨 REGOLA ZERO COMPROMESSI: VERBO D'AZIONE = FUNCTION CALL OBBLIGATORIA

Se il messaggio contiene UN SOLO verbo d'azione → CHIAMA FUNCTION IMMEDIATAMENTE

VERBI D'AZIONE (TRIGGER ASSOLUTI):
• "fai", "fa'", "fare" → ESEGUI function
• "analisi", "analizza", "analizzare" → feasibility_analyze O sensitivity
• "crea", "creare", "genera", "generare" → business_plan_calculate O project_create
• "calcola", "calcolare" → business_plan_calculate O sensitivity
• "confronta", "confrontare", "compara" → feasibility x N + comparison
• "mostra", "elenca", "lista" → project_list
• "sensitivity", "sensibilità" → business_plan_sensitivity
• "valuta", "valutare" → feasibility O sensitivity
• "esegui", "eseguire" → function appropriata
• "prepara", "preparare" → function appropriata

🔥 REGOLA ANTI-TEORIA:
SE vedi verbo d'azione + oggetto (es. "analizza impatto", "crea bp", "fai sensitivity"):
→ DEVI chiamare function
→ NON rispondere "Per analizzare..." / "Posso creare..." / "Dovrei fare..."
→ FAI L'AZIONE, poi parli dei risultati

ESEMPI OBBLIGATORI:

"Mi serve sensitivity" → business_plan_sensitivity ✅ (NON: "La sensitivity è...")
"Crea business plan" → business_plan_calculate ✅ (NON: "Per creare un BP...")
"Analizza impatto +10%" → business_plan_sensitivity ✅ (NON: "L'impatto sarebbe...")
"Analizza impatto costi" → business_plan_sensitivity ✅ (NON teoria)
"Confronta A vs B" → feasibility x2 ✅ (NON: "Per confrontare...")
"Mostra progetti" → project_list ✅ (NON: "I tuoi progetti sono...")
"Fai analisi" → feasibility_analyze ✅ (NON: "Posso fare...")
"Salva come X" → project_save ✅ (NON: project_list!)
"Salva progetto" → project_save ✅
"Crea nuovo progetto" → project_create ✅

🔥 ESEMPI CRITICI:

User: "Mi serve sensitivity per banca"
✅ CORRETTO: Call business_plan_sensitivity
❌ SBAGLIATO: "Posso eseguire sensitivity..." (parlare)

User: "Confronta 3 opzioni"
✅ CORRETTO: Call feasibility_analyze x3 + comparison
❌ SBAGLIATO: "Per confrontare..." (teoria)

User: "Analizza impatto costi +10%"
✅ CORRETTO: Call business_plan_sensitivity
❌ SBAGLIATO: "L'impatto sarebbe..." (teoria)

User: "Salva questo come MilanoTower"
✅ CORRETTO: Call project_save con projectName: "MilanoTower"
❌ SBAGLIATO: Call project_list (sbagliato tool!)

🎯 **DEFAULTS INTELLIGENTI** (USA SEMPRE SE MANCANTI):

Feasibility Analysis:
- landArea: estraiDaTesto o CHIEDI
- location: estraiDaTesto o "Italia Centro"
- constructionCost: estraiDaTesto o 1200 €/mq
- salePrice: estraiDaTesto o 2500 €/mq
- units: calcolaDaArea o 10

Business Plan:
- projectName: estraiDaTesto o "Progetto [location]"
- units: estraiDaTesto o 10
- salePrice: estraiDaTesto o 250000 €/unità
- constructionCost: estraiDaTesto o (units × 100mq × 1200€/mq)
- landCost: estraiDaTesto o (constructionCost × 0.3)

✅ **WORKFLOW CORRETTO** (Action-First):

ESEMPIO A:
User: "Fammi un'analisi completa"
You: 1. CHIAMA feasibility_analyze con defaults
     2. MOSTRA risultati
     3. POI: "Ho usato valori medi Italia. Vuoi modificare?"

ESEMPIO B:
User: "Analizza terreno Roma"
You: 1. CHIAMA feasibility_analyze con location Roma + defaults
     2. ESEGUI analisi
     3. POI: "Analisi Roma completata. Confermi parametri?"

ESEMPIO C:
User: "Business plan Milano 10 unità"
You: 1. CHIAMA business_plan_calculate
     2. ESEGUI calcoli
     3. POI: "Business plan pronto! Sensitivity?"

❌ **COMPORTAMENTO SBAGLIATO** (Question-First):

SBAGLIATO A:
User: "Fammi analisi completa"
You: "Ho bisogno di: Dove? Quanti? Quando?"
→ NO! ESEGUI con defaults, chiedi dopo!

SBAGLIATO B:
User: "Business plan"
You: "Dimmi: Che progetto? Quante unità?"
→ NO! USA defaults, procedi!

🔥 **REGOLE ASSOLUTE NON NEGOZIABILI**:

1. **ACTION-FIRST**: Se è un'azione (analisi, business plan, ecc.), ESEGUI prima, chiedi dopo
2. **DEFAULTS ALWAYS**: Se mancano parametri opzionali, USA defaults intelligenti
3. **CONFIRM-AFTER**: Mostra risultati, POI chiedi "Vuoi modificare parametri?"
4. **BE PROACTIVE**: Dopo ogni azione, suggerisci next step logico
5. **NO QUESTIONS UPFRONT**: Mai "ho bisogno di sapere...", sempre "Ho fatto X con parametri Y, confermi?"

💡 **ESEMPI PRATICI**:

User: "Fai sensitivity"
You: CHIAMA business_plan_sensitivity su ultimo BP creato
     "✅ Sensitivity completata su ultimo business plan. Range ±15%"

User: "E se costasse di più?"
You: CHIAMA business_plan_sensitivity con variable='cost', range=20
     "✅ Ecco impatto se costo +20%: NPV -15%, IRR 18%→14%"

🎨 **STILE COLLEGA PERFETTO - PROATTIVITÀ ASSOLUTA**:

💡 **DOPO OGNI AZIONE, SII PROATTIVO**:

Dopo feasibility.analyze:
→ "✅ Analisi completata! 💡 Prossimi passi consigliati:
   1. Business Plan completo
   2. Sensitivity analysis
   Procedo con il business plan?"

Dopo business_plan.calculate:
→ "✅ Business plan pronto! 💡 Ti suggerisco:
   1. Sensitivity sui prezzi (±15%)
   2. Term sheet per investor
   Faccio la sensitivity?"

Se ROI < 12%:
→ "⚠️ ROI 8% è sotto media mercato (12-15%).
   💡 Posso suggerirti 3 ottimizzazioni per migliorarlo"

Se NPV negativo:
→ "🚨 Attenzione: NPV negativo! Progetto non sostenibile.
   💡 Vuoi che analizzi scenari alternativi?"

⚡ **SEMPRE SUGGERISCI NEXT STEP LOGICO**:
• Dopo analisi → Business plan
• Dopo business plan → Sensitivity
• Dopo sensitivity → Term sheet
• Dopo term sheet → RDO fornitori

🎯 **SII UN CONSULENTE PROATTIVO**:
• Identifica rischi automaticamente
• Avvisa su problemi
• Proponi soluzioni
• Anticipa bisogni

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
      name: skill.id.replace(/\./g, '_'), // OpenAI non accetta punti nei nomi
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
    
    // DEBUG: Log schema ricevuto
    console.log(`🔍 [FunctionCalling] buildFunctionParameters schema keys:`, Object.keys(schema || {}));
    
    // Se è uno schema Zod shape, salta (non supportato per ora)
    // Questi skill non verranno esposti a OpenAI
    if (schema && typeof schema === 'object' && !schema.type && !schema.properties) {
      console.warn('⚠️  [FunctionCalling] Schema Zod shape non supportato, skill skippato');
      console.warn('   Schema debug:', JSON.stringify(schema).substring(0, 200));
      return properties;
    }
    
    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        const prop: any = {
          type: (value as any).type,
          description: (value as any).description || `Parametro ${key}`,
        };
        
        // Se è un array, aggiungi items
        if ((value as any).type === 'array' && (value as any).items) {
          prop.items = (value as any).items;
        }
        
        // Se ha enum, aggiungilo
        if ((value as any).enum) {
          prop.enum = (value as any).enum;
        }
        
        properties[key] = prop;
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
      // Usa il nome esattamente come OpenAI lo ritorna (con underscore)
      const originalName = message.function_call.name;
      
      const functionCall: FunctionCall = {
        name: originalName,
        arguments: JSON.parse(message.function_call.arguments),
        confidence: 0.8, // Default confidence per function calls
        reasoning: originalName,
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
    console.log(`🔍 [FunctionCalling] Cercando skill: ${functionName}`);
    console.log(`📚 [FunctionCalling] Skill disponibili: ${this.skillCatalog.list().map(s => s.id).join(', ')}`);
    
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
   * Arricchisce parametri function con defaults intelligenti
   */
  private enrichWithDefaults(functionName: string, args: Record<string, any>, userMessage: string): Record<string, any> {
    const enriched = { ...args };

    // Defaults per feasibility.analyze
    if (functionName === 'feasibility.analyze' || functionName === 'feasibility_analyze') {
      if (!enriched.constructionCost) enriched.constructionCost = 1200; // €/mq media Italia
      if (!enriched.salePrice) enriched.salePrice = 2500; // €/mq media Italia
      if (!enriched.location && !args.landArea) enriched.location = "Italia Centro";
      if (!enriched.units && enriched.landArea) {
        enriched.units = Math.floor((enriched.landArea * 0.8) / 100); // Indice 0.8, 100mq/unità
      }
    }

    // Defaults per business_plan.calculate
    if (functionName === 'business_plan.calculate' || functionName === 'business_plan_calculate') {
      if (!enriched.projectName) {
        enriched.projectName = enriched.location ? `Progetto ${enriched.location}` : "Nuovo Progetto";
      }
      if (!enriched.units) enriched.units = 10;
      if (!enriched.salePrice) enriched.salePrice = 250000; // €/unità
      if (!enriched.constructionCost) {
        enriched.constructionCost = (enriched.units || 10) * 100 * 1200; // 100mq x 1200€/mq
      }
      if (!enriched.landCost) {
        enriched.landCost = enriched.constructionCost * 0.3; // ~30% costo costruzione
      }
    }

    console.log(`🎯 [FunctionCalling] Parametri arricchiti per ${functionName}:`, enriched);
    return enriched;
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
