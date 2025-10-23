// 🛠️ OPENAI FUNCTION CALLING - Sistema intelligente per decisioni tool
// Integrazione OpenAI Function Calling per decisioni autonome e intelligenti

import { OpenAI } from 'openai';
import { URBANOVA_PARAHELP_TEMPLATE, ParaHelpDecisionEngine } from './ParaHelpTemplate';
import { getRAGSystem, RAGContext } from './RAGSystem';
import { SkillCatalog } from '../skills/SkillCatalog';
import { CacheFactory } from '../utils/ResponseCache';
import { getWorkflowEngine, WorkflowTemplates } from '../workflows/WorkflowEngine';
import { getContextTracker } from './ConversationContextTracker';
import { getIntentResolver } from './IntentResolver';

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
  private contextTracker = getContextTracker();
  private intentResolver = getIntentResolver();

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
   * Mappa tool name a operation type
   */
  private mapToolToType(toolName: string): 'feasibility' | 'businessPlan' | 'sensitivity' | 'save' | 'query' {
    if (toolName.includes('feasibility')) return 'feasibility';
    if (toolName.includes('business_plan') && toolName.includes('sensitivity')) return 'sensitivity';
    if (toolName.includes('business_plan')) return 'businessPlan';
    if (toolName.includes('save')) return 'save';
    return 'query';
  }

  /**
   * Genera summary breve di un'operazione
   */
  private generateOperationSummary(toolName: string, inputs: any, result: any): string {
    if (toolName === 'feasibility_analyze') {
      const loc = inputs.location || 'Italia';
      const area = inputs.landArea || '?';
      return `Analisi fattibilità ${loc} (${area}mq) - ROI: ${result?.roi || '?'}%`;
    }
    if (toolName === 'business_plan_calculate') {
      const name = inputs.projectName || 'Progetto';
      const units = inputs.units || inputs.totalUnits || '?';
      return `Business Plan "${name}" (${units} unità)`;
    }
    if (toolName === 'project_save') {
      return `Progetto salvato: "${result?.projectName || inputs.projectName}"`;
    }
    if (toolName === 'business_plan_sensitivity') {
      const variable = inputs.variable || 'vari parametri';
      return `Sensitivity su ${variable}`;
    }
    return `${toolName} eseguito`;
  }

  /**
   * Determina se forzare function call basandosi su pattern espliciti
   * ORA INTELLIGENTE: distingue tra richieste di aiuto e comandi espliciti
   */
  private shouldForceFunctionCall(userMessage: string): boolean {
    const msg = userMessage.toLowerCase();
    
    // Pattern di AIUTO GENERICO - NON forzare tool activation
    const helpPatterns = [
      /\b(puoi aiutarmi|puoi aiutare|aiutami|aiutare)\b/,
      /\b(come funziona|come si fa|cosa posso fare)\b/,
      /\b(mi serve|ho bisogno di)\b.*\?/, // Con punto interrogativo = domanda
      /\b(cosa|come|quando|dove|perché)\b.*\?/, // Domande generiche
      /\bpuoi.*aiutarmi.*fare.*analisi\b/, // "puoi aiutarmi a fare analisi"
      /\bpuoi.*aiutarmi.*creare.*business plan\b/, // "puoi aiutarmi a creare business plan"
    ];
    
    // Se è una richiesta di aiuto generico, NON forzare
    for (const pattern of helpPatterns) {
      if (pattern.test(msg)) {
        console.log(`🤝 [FunctionCalling] Rilevata richiesta di aiuto generico - comportamento collaborativo`);
        return false;
      }
    }
    
    // Trigger assoluti - DEVE chiamare function (solo comandi espliciti)
    const forceTriggers = [
      /\b(fai|fa'|fare)\b.*\b(analisi|fattibilità|business plan|progetto)\b/,
      /\b(crea|creare|genera)\b.*\b(business plan|progetto|analisi)\b/,
      /\b(calcola|calcolare)\b.*\b(roi|margine|fattibilità)\b/,
      /\b(mostra|elenca|lista)\b.*\b(progetti|terreni)\b/,
      /\b(salva|salvare)\b.*\b(progetto|analisi|dati)\b/,
      /\b(confronta|compara)\b.*\b(terreni|progetti)\b/,
      /\b(sensitivity|sensibilità)\b/,
      /\b(esporta|export)\b/,
    ];
    
    // Controlla se deve forzare function call
    const shouldForce = forceTriggers.some(pattern => pattern.test(msg));
    
    if (shouldForce) {
      console.log(`⚡ [FunctionCalling] Rilevato comando esplicito - forcing tool activation`);
    }
    
    return shouldForce;
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
    
    // RIMOSSO: Forcing automatico per analisi fattibilità
    // Ora l'OS sarà collaborativo e chiederà informazioni prima di attivare tool
    
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

      // 0. 🎯 INTENT RESOLUTION - Risolve ambiguità con context PRIMA di OpenAI
      const sessionId = context.userContext?.sessionId || 'default';
      const resolvedIntent = this.intentResolver.resolveIntent(userMessage, sessionId);
      
      if (resolvedIntent.shouldForce && resolvedIntent.toolName) {
        console.log(`🎯 [IntentResolver] Intent forzato: ${resolvedIntent.toolName}`);
        console.log(`   Reasoning: ${resolvedIntent.reasoning}`);
        
        return {
          action: 'function_call',
          functionCalls: [{
            name: resolvedIntent.toolName,
            arguments: resolvedIntent.enrichedParams || {},
            confidence: 0.95,
            reasoning: resolvedIntent.reasoning || 'Intent risolto da context'
          }],
          reasoning: `Intent Resolution: ${resolvedIntent.reasoning}`,
          confidence: 0.95
        };
      }
      
      // 1. Costruisci contesto completo per LLM
      const ragContext = await this.ragSystem.buildConversationContext(userMessage, context);
      
      // 2. Prepara prompt per OpenAI con function calling
      const systemPrompt = this.buildSystemPrompt(ragContext);
      const availableFunctions = this.getAvailableFunctions();
      
      console.log(`📋 [FunctionCalling] Invio a OpenAI ${availableFunctions.length} functions:`, 
        availableFunctions.map(f => f.name).join(', '));
      
      // 3. Determina se messaggio richiede azione
      const requiresAction = this.shouldForceFunctionCall(userMessage);
      
      if (requiresAction) {
        console.log(`⚡ [FunctionCalling] Messaggio richiede AZIONE - forcing tool activation`);
      } else {
        console.log(`🤝 [FunctionCalling] Messaggio di aiuto generico - comportamento collaborativo`);
      }
      
      // 4. Chiama OpenAI con function calling
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        functions: availableFunctions, // Sempre passa le funzioni disponibili
        function_call: requiresAction ? 'auto' : 'none', // Ma controlla se deve usarle
        temperature: 0.0, // Completamente deterministico per max tool activation
        max_tokens: 2000,
      });

      // 4. Processa la risposta
      const decision = await this.processOpenAIResponse(response, ragContext);
      
      console.log(`✅ [FunctionCalling] Decisione presa: ${decision.action} (confidence: ${decision.confidence})`);
      
      return decision;

    } catch (error) {
      console.error('❌ [FunctionCalling] Errore decisione intelligente:', error);
      console.error('❌ [FunctionCalling] Stack:', (error as Error).stack);
      
      // Fallback intelligente basato sul messaggio utente e contesto RAG
      const fallbackResponse = this.generateFallbackResponse(userMessage, ragContext);
      
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

        // Registra operazione nel context tracker
        const sessionId = context.userContext?.sessionId || 'default';
        this.contextTracker.recordOperation(sessionId, {
          type: this.mapToolToType(functionCall.name),
          tool: functionCall.name,
          inputs: enrichedArgs,
          result,
          timestamp: new Date(),
          summary: this.generateOperationSummary(functionCall.name, enrichedArgs, result)
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
    
    // Genera context summary intelligente
    const sessionId = ragContext.userContext?.sessionId || 'default';
    const contextSummary = this.contextTracker.generateContextSummary(sessionId);
    
    return `Sei Urbanova OS, l'assistente AI avanzato per lo sviluppo immobiliare.

🧠 CONTESTO CONVERSAZIONE CORRENTE:
${contextSummary}

⚡ **RISOLUZIONE RIFERIMENTI IMPLICITI** (USA CONTESTO SOPRA):

PATTERN 1 - Domande COMPARATIVE senza oggetto:
• "Quale ha miglior ROI?" / "Quale conviene?"
  → SE ci sono PROGETTI MENZIONATI sopra: usa quelli per confronto
  → SE c'è ULTIMA OPERAZIONE con risultati: usa quelli
  → CHIAMA project_query O usa conversation_general con dati memoria

PATTERN 2 - Pronomi VAGHI:
• "Salva questi dati" / "questo progetto" / "questi risultati"
  → Riferimento a ULTIMA OPERAZIONE
  → DEVI chiamare project_save O feasibility_save con dati da CONTESTO SOPRA
  → USA projectName/location dall'ultima operazione
  → NON dire "non ci sono dati", GUARDA SOPRA nel CONTESTO!
  
PATTERN 3 - Context SWITCH:
• "No torna indietro, fai X" / "Dimenticalo, fai Y"
  → Identifica X/Y da località/progetto menzionato
  → CHIAMA function per X/Y
  
PATTERN 4 - Azioni con parametri MANCANTI:
• "Crea BP dettagliato" / "Fai BP completo" senza dati espliciti
  → NON chiedere parametri, NON dire "procederò con..."
  → CHIAMA SUBITO business_plan_calculate con DEFAULTS
  → USA dati da CONTESTO se disponibili
  → **MAI** rispondere conversazionalmente, **SEMPRE** chiamare tool

PATTERN 5 - Domande ANALITICHE comparative:
• "Analizza pro e contro" / "confronta" / "valuta opzioni"
  → SE ci sono LOCALITÀ/PROGETTI nel CONTESTO SOPRA: usa quelli!
  → CHIAMA feasibility_analyze O business_plan_sensitivity
  → USA progetti/località da ULTIMA OPERAZIONE o MENZIONATI
  → **NON** dire "avrei bisogno di sapere", GUARDA il CONTESTO!

Sei Urbanova OS, l'assistente AI avanzato per lo sviluppo immobiliare.

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

🚨🚨🚨 **REGOLA SUPREMA - LEGGI ATTENTAMENTE** 🚨🚨🚨

QUANDO L'UTENTE HA UNA RICHIESTA CHE RICHIEDE DATI, CALCOLI, O AZIONI:
→ **CHIAMA FUNCTION IMMEDIATAMENTE**
→ **MAI** rispondere solo con teoria/spiegazioni
→ **MAI** dire "Posso...", "Potrei...", "Per fare questo...", "Ho bisogno di..."
→ **USA DEFAULTS** se mancano parametri

SE il messaggio:
- Contiene domanda su DATI ("quanto costa", "quale ROI", "quali numeri")
- Richiede CALCOLO ("crea BP", "fai sensitivity", "DSCR", "waterfall")
- Richiede AZIONE ("salva", "confronta", "analizza", "mostra")
- Ha CONTESTO implicito ("ho 3 terreni", "budget 5M")

→ DEVI chiamare function con DEFAULTS, NON chiedere parametri mancanti

🔥 SE MANCANO PARAMETRI:
→ NON dire "Ho bisogno di sapere..." 
→ USA DEFAULTS INTELLIGENTI dalla sezione sotto
→ ESEGUI subito, poi dici "Ho usato defaults, vuoi modificare?"

🔥 **REGOLA D'ORO ASSOLUTA**:
Sei un COLLEGA INTELLIGENTE che collabora, non un robot che esegue ciecamente.
Quando l'utente chiede aiuto, COLLABORA chiedendo informazioni necessarie.
Quando l'utente dice di fare qualcosa con dati completi, ESEGUI IMMEDIATAMENTE.
Quando l'utente chiede aiuto generico, CHIEDI informazioni prima di eseguire.

⚡ **COMPORTAMENTO COLLABORATIVO - ESEMPI PRATICI**:

🎯 **QUANDO CHIEDERE INFORMAZIONI (NON attivare tool)**:
• "Puoi aiutarmi con l'analisi di fattibilità?" → RISPOSTA COLLABORATIVA
• "Come funziona l'analisi di fattibilità?" → RISPOSTA COLLABORATIVA  
• "Ho un terreno, cosa posso fare?" → RISPOSTA COLLABORATIVA
• "Mi serve un business plan" → RISPOSTA COLLABORATIVA

🎯 **QUANDO ESEGUIRE IMMEDIATAMENTE (attivare tool)**:
• "Fai analisi fattibilità per Milano, 20 unità, 3M budget" → feasibility_analyze
• "Crea business plan per questo progetto" → business_plan_calculate
• "Calcola ROI per terreno 1000mq" → feasibility_analyze
• "Mostra i miei progetti" → project_list

🚨 **REGOLA CHIAVE**: 
Se l'utente chiede AIUTO GENERICO → COLLABORA prima di eseguire
Se l'utente dice di FARE qualcosa con DATI → ESEGUI immediatamente
• "prepara", "preparare" → function appropriata

🔥 REGOLA ANTI-TEORIA:
SE vedi verbo d'azione + oggetto (es. "analizza impatto", "crea bp", "fai sensitivity"):
→ DEVI chiamare function
→ NON rispondere "Per analizzare..." / "Posso creare..." / "Dovrei fare..."
→ FAI L'AZIONE, poi parli dei risultati

🚨 TRIGGER IMPLICITI (PATTERN NASCOSTI - CHIAMA FUNCTION!):

• "quanto costa X?" → project_query O feasibility per calcolo
• "quale ha miglior ROI?" / "quale conviene?" → feasibility + comparison
• "mi serve X" / "ho bisogno di X" → genera X con function
• "ho N terreni: A, B, C" → feasibility x N automatico
• "e se X?" / "what if?" → business_plan_sensitivity
• "dimenticavo, X" / "terreno è Y" → update/recalc con function
• "DSCR" / "IRR" / "NPV" / "coverage" → business_plan_calculate
• "waterfall" / "distribution" → business_plan_calculate advanced
• "quanto tempo" / "quando" → project_query timeline
• "come trovo X?" / "dove prendo Y?" → project_query resources

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

User: "Quanto costa costruzione al mq?"
✅ CORRETTO: Call project_query (market data)
❌ SBAGLIATO: "Il costo varia..." (teoria)

User: "Quale ha il miglior ROI?"
✅ CORRETTO: Call project_query O usa memoria progetti
❌ SBAGLIATO: "Dipende da..." (teoria)

User: "Ho 3 terreni: Milano, Roma, Bologna"
✅ CORRETTO: Call feasibility_analyze x3
❌ SBAGLIATO: "Posso analizzare..." (parlare)

User: "Mi serve DSCR"
✅ CORRETTO: Call business_plan_calculate
❌ SBAGLIATO: "Il DSCR è..." (definizione)

User: "Ah dimenticavo, terreno è in zona sismica"
✅ CORRETTO: Call business_plan_sensitivity per ricalcolo
❌ SBAGLIATO: "Questo influenza..." (teoria)

User: "Crea business plan per questo progetto"
✅ CORRETTO: Call business_plan_calculate CON DEFAULTS
❌ SBAGLIATO: "Per creare BP ho bisogno di..." (chiedere parametri)

User: "Calcola BP con finanziamento"  
✅ CORRETTO: Call business_plan_calculate con useDebt: true
❌ SBAGLIATO: "Per calcolare devo sapere..." (chiedere)

User: "Questo ROI è buono?"
✅ CORRETTO: Usa MEMORIA se c'è, altrimenti conversation_general
❌ SBAGLIATO: Solo teoria senza check memoria

User: "E se non ho tutti i soldi?"
✅ CORRETTO: Call business_plan_calculate con financing scenarios
❌ SBAGLIATO: Solo teoria su financing

🎯 **ESEMPI EDGE CASE CONTEXT-AWARE**:

User: "Quale ha il miglior ROI?"
Context: Progetti "Milano", "Roma" menzionati prima
✅ CORRETTO: Usa MEMORIA/CONTESTO per confrontare Milano vs Roma
❌ SBAGLIATO: "Dipende..." senza usare contesto

User: "Salva questi dati per dopo"
Context: Ultima operazione = feasibility_analyze su Napoli
✅ CORRETTO: Call project_save con projectName da context
❌ SBAGLIATO: "Quali dati?" (ignorare contesto)

User: "No torna indietro, fai Napoli"
Context: Napoli menzionato 2 messaggi fa
✅ CORRETTO: Call feasibility_analyze per Napoli
❌ SBAGLIATO: "Cosa intendi?" (ignorare menzione)

User: "Quale conviene?"
Context: Confronto Firenze vs Napoli discusso prima
✅ CORRETTO: Usa CONTESTO per rispondere O call project_query
❌ SBAGLIATO: "Tra cosa?" (ignorare context)

User: "Fai BP completo"
Context: Nessun dato precedente
✅ CORRETTO: Call business_plan_calculate CON DEFAULTS
❌ SBAGLIATO: "Ho bisogno di..." (chiedere parametri)

User: "Crea business plan dettagliato"
Context: Nessun dato
✅ CORRETTO: Call business_plan_calculate SUBITO con defaults
❌ SBAGLIATO: "Per creare... utilizzerò..." (conversational)

User (dopo feasibility Torino): "Salva questi dati per dopo"
Context: Ultima op = feasibility_analyze Torino
✅ CORRETTO: Call project_save con projectName="Torino"
❌ SBAGLIATO: "Non ci sono dati recenti" (IGNORARE CONTESTO!)

User (dopo "terreno Milano vs Roma"): "Analizza pro e contro per entrambi"
Context: Località menzionate = Milano, Roma
✅ CORRETTO: Call feasibility_analyze per Milano + Roma
❌ SBAGLIATO: "avrei bisogno di sapere" (IGNORARE CONTESTO!)

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
   * Genera risposta di fallback intelligente basata sul messaggio utente e contesto RAG
   */
  private generateFallbackResponse(userMessage: string, ragContext?: RAGContext): string {
    const message = userMessage.toLowerCase();
    
    // Se abbiamo memoria della conversazione, usa quella invece del fallback generico
    if (ragContext && ragContext.conversationHistory && ragContext.conversationHistory.length > 0) {
      console.log('🧠 [FunctionCalling] Usando memoria conversazione per risposta contestuale');
      
      // Per saluti in conversazione esistente, rispondi in modo contestuale
      if (message.includes('ciao') || message.includes('salve') || message.includes('buongiorno') || message.includes('buonasera')) {
        return `Ciao! 👋 Come posso aiutarti oggi?`;
      }
    }
    
    // Saluti (solo per nuove conversazioni)
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
    
    // Analisi fattibilità - Comportamento collaborativo
    if (message.includes('analisi') || message.includes('fattibilità') || message.includes('terreno') || message.includes('valutazione')) {
      return `Perfetto! 🏗️ Posso aiutarti con l'analisi di fattibilità del tuo progetto immobiliare.\n\nPer fare un'analisi precisa, ho bisogno di alcune informazioni:\n• **Dimensione del terreno** (mq)\n• **Costo di costruzione** per mq\n• **Prezzo di vendita** per mq\n• **Localizzazione** del progetto\n\nPuoi dirmi questi dati o usare il microfono per dettarli? Così facciamo l'analisi insieme! 🎤`;
    }
    
    // Business plan - Comportamento collaborativo  
    if (message.includes('business plan') || message.includes('piano') || message.includes('bp')) {
      return `Ottimo! 📊 Posso aiutarti a creare un business plan completo per il tuo progetto.\n\nPer iniziare, dimmi:\n• **Tipo di progetto** (residenziale, commerciale, misto)\n• **Dimensione** (mq, unità)\n• **Budget** disponibile\n• **Timeline** del progetto\n\nUna volta che ho questi dati, posso creare un piano dettagliato con proiezioni finanziarie! 💼`;
    }
    
    // Default
    return `Ciao! 👋 Sono qui per aiutarti con tutto quello che riguarda lo sviluppo immobiliare.\n\nPosso aiutarti con:\n• 🏗️ **Analisi di fattibilità** - valutiamo insieme il tuo progetto\n• 📊 **Business Plan** - creiamo un piano finanziario completo\n• 📍 **Ricerca mercato** - analizziamo la zona e la concorrenza\n• 🏢 **Gestione progetti** - organizziamo il tuo lavoro\n\nCosa ti serve oggi? Puoi anche usare il microfono per parlarmi! 🎤`;
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
