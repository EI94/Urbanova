// 🧠 GOAL-ORIENTED INTENT RECOGNIZER - Sistema intelligente per riconoscimento intent
// Usa LLM per capire autonomamente le intenzioni del cliente

// 🛡️ OS PROTECTION
import '@/lib/osProtection';

export interface GoalOrientedIntent {
  primaryGoal: string;
  secondaryGoals: string[];
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  extractedData: any;
  requiredTools: string[];
  nextSteps: string[];
  userEmotion: 'positive' | 'neutral' | 'frustrated' | 'angry' | 'confused';
  contextUnderstanding: string;
}

export interface ConversationContext {
  previousMessages: string[];
  currentProject?: any;
  userPreferences?: any;
  sessionGoals?: string[];
}

export class GoalOrientedIntentRecognizer {
  private static instance: GoalOrientedIntentRecognizer;
  
  public static getInstance(): GoalOrientedIntentRecognizer {
    if (!GoalOrientedIntentRecognizer.instance) {
      GoalOrientedIntentRecognizer.instance = new GoalOrientedIntentRecognizer();
    }
    return GoalOrientedIntentRecognizer.instance;
  }

  /**
   * 🧠 ANALISI INTENT GOAL-ORIENTED CON LLM
   * L'LLM analizza il messaggio e capisce autonomamente l'intento del cliente
   */
  async analyzeIntentWithLLM(
    message: string, 
    context: ConversationContext = { previousMessages: [] }
  ): Promise<GoalOrientedIntent> {
    
    console.log('🧠 [GOAL-ORIENTED] Analizzando intent con LLM...');
    
    try {
      // 🎯 PROMPT INTELLIGENTE PER LLM
      const analysisPrompt = this.buildAnalysisPrompt(message, context);
      
      // 🚀 CHIAMATA LLM PER ANALISI INTENT
      const llmResponse = await this.callLLMForIntentAnalysis(analysisPrompt);
      
      // 🔍 PARSING RISPOSTA LLM
      const parsedIntent = this.parseLLMResponse(llmResponse);
      
      console.log('✅ [GOAL-ORIENTED] Intent analizzato:', parsedIntent);
      
      return parsedIntent;
      
    } catch (error) {
      console.error('❌ [GOAL-ORIENTED] Errore analisi intent:', error);
      
      // 🔄 FALLBACK: Usa riconoscimento tradizionale se LLM fallisce
      return this.fallbackIntentRecognition(message, context);
    }
  }

  /**
   * 🎯 COSTRUZIONE PROMPT INTELLIGENTE PER LLM
   */
  private buildAnalysisPrompt(message: string, context: ConversationContext): string {
    const contextInfo = context.previousMessages.length > 0 
      ? `\n\nCONTESTO CONVERSAZIONALE:\n${context.previousMessages.slice(-3).join('\n')}`
      : '';
    
    const currentProjectInfo = context.currentProject 
      ? `\n\nPROGETTO CORRENTE:\n${JSON.stringify(context.currentProject, null, 2)}`
      : '';

    return `Sei un assistente AI esperto in sviluppo immobiliare e analisi di fattibilità. 
Analizza il seguente messaggio dell'utente e determina la sua intenzione principale e secondaria.

MESSAGGIO UTENTE:
"${message}"
${contextInfo}${currentProjectInfo}

Analizza il messaggio e rispondi SOLO con un JSON valido nel seguente formato:

{
  "primaryGoal": "stringa che descrive l'obiettivo principale dell'utente",
  "secondaryGoals": ["obiettivo secondario 1", "obiettivo secondario 2"],
  "confidence": 0.95,
  "urgency": "low|medium|high|critical",
  "complexity": "simple|medium|complex|expert",
  "extractedData": {
    "projectName": "nome progetto se presente",
    "location": "ubicazione se presente",
    "area": "superficie in mq se presente",
    "projectType": "tipologia progetto se presente",
    "constructionCost": "costo costruzione se presente",
    "purchasePrice": "prezzo acquisto se presente",
    "targetMargin": "margine target se presente",
    "units": "numero unità se presente",
    "parkingSpaces": "numero parcheggi se presente"
  },
  "requiredTools": ["tool1", "tool2"],
  "nextSteps": ["passo successivo 1", "passo successivo 2"],
  "userEmotion": "positive|neutral|frustrated|angry|confused",
  "contextUnderstanding": "breve spiegazione di come hai capito il contesto"
}

OBIETTIVI POSSIBILI:
- feasibility_analysis: L'utente vuole fare un'analisi di fattibilità
- project_consultation: L'utente vuole consultare progetti esistenti
- market_analysis: L'utente vuole analisi di mercato
- design_support: L'utente vuole supporto progettuale
- cost_calculation: L'utente vuole calcoli di costi
- investment_advice: L'utente vuole consigli di investimento

TOOL DISPONIBILI:
- feasibility_analysis: Analisi di fattibilità immobiliare
- project_consultation: Consultazione progetti esistenti
- market_benchmark: Benchmark di mercato
- design_center: Supporto progettuale
- cost_calculator: Calcolatore costi
- investment_advisor: Consulente investimenti

Rispondi SOLO con il JSON, senza altre spiegazioni.`;
  }

  /**
   * 🚀 CHIAMATA LLM PER ANALISI INTENT
   */
  private async callLLMForIntentAnalysis(prompt: string): Promise<string> {
    try {
      // 🎯 USA OPENAI PER ANALISI INTENT
      const response = await fetch('/api/openai-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'gpt-4',
          temperature: 0.1, // Bassa temperatura per risposte consistenti
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.choices?.[0]?.message?.content || '';

    } catch (error) {
      console.error('❌ [GOAL-ORIENTED] Errore chiamata LLM:', error);
      
      // 🔄 FALLBACK: Usa endpoint chat esistente
      return await this.fallbackLLMCall(prompt);
    }
  }

  /**
   * 🔄 FALLBACK LLM CALL
   */
  private async fallbackLLMCall(prompt: string): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
          userId: 'intent-recognizer',
          userEmail: 'system@urbanova.life'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';

    } catch (error) {
      console.error('❌ [GOAL-ORIENTED] Errore fallback LLM:', error);
      throw error;
    }
  }

  /**
   * 🔍 PARSING RISPOSTA LLM
   */
  private parseLLMResponse(llmResponse: string): GoalOrientedIntent {
    try {
      // 🧹 PULIZIA RISPOSTA LLM
      const cleanedResponse = llmResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '') // Rimuovi testo prima del JSON
        .replace(/[^}]*$/, '') // Rimuovi testo dopo il JSON
        .trim();

      console.log('🔍 [GOAL-ORIENTED] Risposta LLM pulita:', cleanedResponse);

      // 📊 PARSING JSON
      const parsed = JSON.parse(cleanedResponse);
      
      // ✅ VALIDAZIONE E NORMALIZZAZIONE
      return {
        primaryGoal: parsed.primaryGoal || 'general_inquiry',
        secondaryGoals: Array.isArray(parsed.secondaryGoals) ? parsed.secondaryGoals : [],
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        urgency: ['low', 'medium', 'high', 'critical'].includes(parsed.urgency) ? parsed.urgency : 'medium',
        complexity: ['simple', 'medium', 'complex', 'expert'].includes(parsed.complexity) ? parsed.complexity : 'medium',
        extractedData: parsed.extractedData || {},
        requiredTools: Array.isArray(parsed.requiredTools) ? parsed.requiredTools : [],
        nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : [],
        userEmotion: ['positive', 'neutral', 'frustrated', 'angry', 'confused'].includes(parsed.userEmotion) ? parsed.userEmotion : 'neutral',
        contextUnderstanding: parsed.contextUnderstanding || 'Contesto analizzato dal LLM'
      };

    } catch (error) {
      console.error('❌ [GOAL-ORIENTED] Errore parsing LLM response:', error);
      console.error('❌ [GOAL-ORIENTED] Risposta originale:', llmResponse);
      
      // 🔄 FALLBACK: Parsing manuale
      return this.manualParsing(llmResponse);
    }
  }

  /**
   * 🔄 PARSING MANUALE FALLBACK
   */
  private manualParsing(llmResponse: string): GoalOrientedIntent {
    const text = llmResponse.toLowerCase();
    
    // 🎯 RICONOSCIMENTO MANUALE INTENT
    let primaryGoal = 'general_inquiry';
    let requiredTools: string[] = [];
    
    if (text.includes('fattibilità') || text.includes('analisi') || text.includes('studio')) {
      primaryGoal = 'feasibility_analysis';
      requiredTools.push('feasibility_analysis');
    }
    
    if (text.includes('progetti') || text.includes('mostra') || text.includes('lista')) {
      primaryGoal = 'project_consultation';
      requiredTools.push('project_consultation');
    }
    
    if (text.includes('mercato') || text.includes('prezzi') || text.includes('benchmark')) {
      primaryGoal = 'market_analysis';
      requiredTools.push('market_benchmark');
    }

    return {
      primaryGoal,
      secondaryGoals: [],
      confidence: 0.7,
      urgency: 'medium',
      complexity: 'medium',
      extractedData: {},
      requiredTools,
      nextSteps: ['Analisi completata'],
      userEmotion: 'neutral',
      contextUnderstanding: 'Parsing manuale fallback'
    };
  }

  /**
   * 🔄 FALLBACK INTENT RECOGNITION
   */
  private fallbackIntentRecognition(message: string, context: ConversationContext): GoalOrientedIntent {
    const text = message.toLowerCase();
    
    // 🎯 LOGICA FALLBACK SEMPLICE
    let primaryGoal = 'general_inquiry';
    let requiredTools: string[] = [];
    let extractedData: any = {};
    
    // Estrazione dati base
    const areaMatch = text.match(/(\d+)\s*(?:metri|mq)/);
    if (areaMatch) extractedData.area = parseInt(areaMatch[1]);
    
    const costMatch = text.match(/(\d+)\s*euro/);
    if (costMatch) extractedData.constructionCost = parseInt(costMatch[1]);
    
    const priceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mila|k|000)/);
    if (priceMatch) extractedData.purchasePrice = parseFloat(priceMatch[1]) * 1000;
    
    // Riconoscimento intent
    if (text.includes('fattibilità') || text.includes('analisi') || text.includes('crea') || text.includes('fai')) {
      primaryGoal = 'feasibility_analysis';
      requiredTools.push('feasibility_analysis');
    }
    
    if (text.includes('progetti') || text.includes('mostra') || text.includes('lista')) {
      primaryGoal = 'project_consultation';
      requiredTools.push('project_consultation');
    }

    return {
      primaryGoal,
      secondaryGoals: [],
      confidence: 0.6,
      urgency: 'medium',
      complexity: 'medium',
      extractedData,
      requiredTools,
      nextSteps: ['Analisi completata'],
      userEmotion: 'neutral',
      contextUnderstanding: 'Riconoscimento fallback tradizionale'
    };
  }

  /**
   * 🧠 AGGIORNAMENTO CONTESTO CONVERSAZIONALE
   */
  updateConversationContext(
    context: ConversationContext, 
    message: string, 
    intent: GoalOrientedIntent
  ): ConversationContext {
    const updatedContext = { ...context };
    
    // Aggiungi messaggio alla cronologia
    updatedContext.previousMessages.push(message);
    
    // Mantieni solo gli ultimi 5 messaggi
    if (updatedContext.previousMessages.length > 5) {
      updatedContext.previousMessages = updatedContext.previousMessages.slice(-5);
    }
    
    // Aggiorna obiettivi sessione
    if (!updatedContext.sessionGoals) {
      updatedContext.sessionGoals = [];
    }
    
    if (!updatedContext.sessionGoals.includes(intent.primaryGoal)) {
      updatedContext.sessionGoals.push(intent.primaryGoal);
    }
    
    // Mantieni solo gli ultimi 3 obiettivi
    if (updatedContext.sessionGoals.length > 3) {
      updatedContext.sessionGoals = updatedContext.sessionGoals.slice(-3);
    }
    
    return updatedContext;
  }
}

export default GoalOrientedIntentRecognizer;
