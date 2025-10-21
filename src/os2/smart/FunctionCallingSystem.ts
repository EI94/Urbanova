// 🛠️ OPENAI FUNCTION CALLING - Sistema intelligente per decisioni tool
// Integrazione OpenAI Function Calling per decisioni autonome e intelligenti

import { OpenAI } from 'openai';
import { URBANOVA_PARAHELP_TEMPLATE, ParaHelpDecisionEngine } from './ParaHelpTemplate';
import { getRAGSystem, RAGContext } from './RAGSystem';
import { SkillCatalog } from '../skills/SkillCatalog';

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
  action: 'function_call' | 'conversation' | 'clarification' | 'escalation';
  functionCalls?: FunctionCall[];
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
   * Prende una decisione intelligente basata su contesto e memoria
   */
  async makeSmartDecision(
    userMessage: string,
    context: RAGContext
  ): Promise<SmartDecision> {
    try {
      console.log('🧠 [FunctionCalling] Prendendo decisione intelligente per:', userMessage);

      // 1. Costruisci contesto completo
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
    
    return `Sei l'assistente AI di Urbanova per lo sviluppo immobiliare. 

IDENTITÀ E RUOLO:
- ${template.role.identity}
- Dominio: ${template.purpose.domain}
- Audience: ${template.audience.primary}

CAPACITÀ DISPONIBILI:
${template.role.capabilities.map(cap => `• ${cap}`).join('\n')}

LIMITAZIONI:
${template.role.limitations.map(lim => `• ${lim}`).join('\n')}

AZIONI CHE RICHIEDONO CONFERMA:
${template.actionFlow.confirmation_required.map(action => `• ${action}`).join('\n')}

AZIONI PROIBITE:
${template.exclusions.forbidden_actions.map(action => `• ${action}`).join('\n')}

CONTESTO CONVERSAZIONE:
${ragContext.conversationSummary}

CONTESTO PROGETTO:
${ragContext.projectContext ? JSON.stringify(ragContext.projectContext, null, 2) : 'Nessun progetto attivo'}

MEMORIE RILEVANTI:
${ragContext.relevantMemories.map(m => `• ${m.contextSnippet}`).join('\n')}

ISTRUZIONI:
1. Analizza il messaggio utente e determina l'azione più appropriata
2. Usa function calling per azioni concrete quando possibile
3. Mantieni conversazione naturale per chiarimenti
4. Rispetta sempre le limitazioni e richieste di conferma
5. Fornisci reasoning dettagliato per ogni decisione
6. Rispondi sempre in italiano

Quando usi function calling, assicurati che:
- L'azione sia permessa dal template ParaHelp
- I parametri siano completi e corretti
- La confidence sia realistica basata sui dati disponibili`;
  }

  /**
   * Ottiene le funzioni disponibili per OpenAI
   */
  private getAvailableFunctions(): any[] {
    const skills = this.skillCatalog.getAllSkills();
    
    return skills.map(skill => ({
      name: skill.meta.id,
      description: skill.meta.summary,
      parameters: {
        type: 'object',
        properties: this.buildFunctionParameters(skill.meta.inputsSchema),
        required: skill.meta.inputsSchema.required || [],
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
    const skill = this.skillCatalog.getSkill(functionName);
    
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
