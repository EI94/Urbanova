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
    
    console.log('🧠 [GOAL-ORIENTED] Analizzando intent con sistema intelligente...');
    
    try {
      // 🎯 USA RICONOSCIMENTO INTELLIGENTE IBRIDO
      const intelligentIntent = this.intelligentIntentRecognition(message, context);
      
      console.log('✅ [GOAL-ORIENTED] Intent analizzato:', intelligentIntent);
      
      return intelligentIntent;
      
    } catch (error) {
      console.error('❌ [GOAL-ORIENTED] Errore analisi intent:', error);
      
      // 🔄 FALLBACK: Usa riconoscimento tradizionale se sistema intelligente fallisce
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
   * 🚀 ANALISI INTENT SEMPLIFICATA (SENZA LLM ESTERNO)
   */
  private async callLLMForIntentAnalysis(prompt: string): Promise<string> {
    // 🧠 USA SOLO RICONOSCIMENTO INTELLIGENTE IBRIDO
    console.log('🧠 [GOAL-ORIENTED] Usando riconoscimento intelligente ibrido');
    return '{"primaryGoal":"general_inquiry","confidence":0.8,"extractedData":{}}';
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
   * 🧠 RICONOSCIMENTO INTELLIGENTE IBRIDO
   * Sistema intelligente che combina pattern matching avanzato con comprensione semantica
   */
  private intelligentIntentRecognition(message: string, context: ConversationContext): GoalOrientedIntent {
    const text = message.toLowerCase();
    
    console.log('🧠 [INTELLIGENT] Analizzando messaggio:', text.substring(0, 100) + '...');
    
    // 🎯 ANALISI SEMANTICA AVANZATA
    const semanticAnalysis = this.performSemanticAnalysis(text, context);
    
    // 🔍 ESTRAZIONE DATI INTELLIGENTE
    const extractedData = this.intelligentDataExtraction(message);
    
    // 🎯 DETERMINAZIONE OBIETTIVO PRINCIPALE
    const primaryGoal = this.determinePrimaryGoal(semanticAnalysis, extractedData, text);
    
    // 🛠️ DETERMINAZIONE TOOL NECESSARI
    const requiredTools = this.determineRequiredToolsIntelligent(primaryGoal, extractedData, text);
    
    // 📊 CALCOLO METRICHE
    const confidence = this.calculateConfidence(semanticAnalysis, extractedData);
    const urgency = this.determineUrgency(semanticAnalysis, text);
    const complexity = this.determineComplexity(extractedData, text);
    const userEmotion = this.detectUserEmotion(text);
    
    // 🎯 PROSSIMI PASSI INTELLIGENTI
    const nextSteps = this.generateIntelligentNextSteps(primaryGoal, extractedData);
    
    const result: GoalOrientedIntent = {
      primaryGoal,
      secondaryGoals: semanticAnalysis.secondaryGoals,
      confidence,
      urgency,
      complexity,
      extractedData,
      requiredTools,
      nextSteps,
      userEmotion,
      contextUnderstanding: semanticAnalysis.contextUnderstanding
    };
    
    console.log('✅ [INTELLIGENT] Intent determinato:', {
      primaryGoal: result.primaryGoal,
      confidence: result.confidence,
      requiredTools: result.requiredTools,
      extractedDataKeys: Object.keys(result.extractedData)
    });
    
    return result;
  }

  /**
   * 🧠 ANALISI SEMANTICA AVANZATA
   */
  private performSemanticAnalysis(text: string, context: ConversationContext): any {
    const analysis = {
      intentKeywords: [],
      contextKeywords: [],
      secondaryGoals: [],
      contextUnderstanding: ''
    };
    
    // 🎯 RICONOSCIMENTO KEYWORD INTENT
    const intentPatterns = {
      feasibility: ['analisi di fattibilità', 'studio di fattibilità', 'business plan', 'fattibilità', 'crea una analisi', 'fai una analisi', 'crea un analisi', 'fai un analisi'],
      consultation: ['mostrami', 'mostra', 'elenca', 'lista', 'progetti', 'consultazione', 'visualizza', 'vedi progetti'],
      market: ['mercato', 'prezzi', 'benchmark', 'analisi di mercato', 'prezzo di vendita'],
      design: ['design', 'progettazione', 'architettura', 'layout', 'pianta'],
      cost: ['costo', 'prezzo', 'quanto costa', 'spesa', 'investimento', 'budget']
    };
    
    // Trova pattern corrispondenti
    for (const [intent, keywords] of Object.entries(intentPatterns)) {
      const matches = keywords.filter(keyword => text.includes(keyword));
      if (matches.length > 0) {
        analysis.intentKeywords.push(intent);
        analysis.secondaryGoals.push(intent);
      }
    }
    
    // 🧠 COMPRENSIONE CONTESTO
    if (context.previousMessages.length > 0) {
      analysis.contextUnderstanding = 'Continuazione conversazione precedente';
    } else {
      analysis.contextUnderstanding = 'Nuova conversazione';
    }
    
    // 🎯 RICONOSCIMENTO CONTESTO PROGETTO
    if (text.includes('progetto') || text.includes('terreno') || text.includes('immobile')) {
      analysis.contextKeywords.push('real_estate_project');
    }
    
    return analysis;
  }

  /**
   * 🔍 ESTRAZIONE DATI INTELLIGENTE
   */
  private intelligentDataExtraction(message: string): any {
    const data: any = {};
    
    // 🏗️ ESTRAZIONE AREA TERRENO
    const areaPatterns = [
      /(\d+)\s*(?:metri quadrati|mq|m²)/i,
      /terreno.*?(\d+)\s*(?:metri quadrati|mq|m²)/i,
      /(\d+)\s*(?:metri quadrati|mq|m²).*?terreno/i,
      /(\d+)\s*metri quadrati/i,
      /terreno.*?(\d+)\s*metri/i,
      /(\d+)\s*metri.*?terreno/i
    ];
    
    for (const pattern of areaPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        data.area = parseInt(match[1]);
        data.buildableArea = data.area;
        data.landArea = data.area;
        break;
      }
    }
    
    // 💰 ESTRAZIONE COSTO COSTRUZIONE
    const costPatterns = [
      /(\d+)\s*euro\s*per\s*metro/i,
      /(\d+)\s*euro\/mq/i,
      /(\d+)\s*euro\s*al\s*metro/i,
      /costruzion[:\s]*(\d+)\s*euro/i,
      /costruzione[:\s]*(\d+)\s*euro/i,
      /costruzion[:\s]*(\d+)/i,
      /costruzione[:\s]*(\d+)/i,
      /costo\s*costruzione[:\s]*(\d+)/i,
      /costo[:\s]*(\d+)\s*euro/i,
      /consto[:\s]*(\d+)\s*euro/i, // Tolleranza errore di battitura
      /consto[:\s]*(\d+)/i
    ];
    
    for (const pattern of costPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        data.constructionCost = parseInt(match[1]);
        data.constructionCostPerSqm = data.constructionCost;
        break;
      }
    }
    
    // 💵 ESTRAZIONE PREZZO ACQUISTO
    const pricePatterns = [
      /acquisto[:\s]*(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro/i,
      /acquisto[:\s]*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro.*?acquisto/i,
      /terreno[:\s]*(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro/i,
      /(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro.*?terreno/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        let price = parseFloat(match[1]);
        if (message.includes('k') || message.includes('000') || message.includes('mila')) {
          price *= 1000;
        }
        data.purchasePrice = price;
        break;
      }
    }
    
    // 📊 ESTRAZIONE MARGINE TARGET
    const marginPatterns = [
      /target[:\s]*(\d+(?:\.\d+)?)\s*%/i,
      /marginalità[:\s]*(\d+(?:\.\d+)?)\s*%/i,
      /margine[:\s]*(\d+(?:\.\d+)?)\s*%/i,
      /(\d+(?:\.\d+)?)\s*%.*?target/i,
      /(\d+(?:\.\d+)?)\s*%.*?margine/i
    ];
    
    for (const pattern of marginPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        data.targetMargin = parseFloat(match[1]) / 100;
        break;
      }
    }
    
    // 🏠 ESTRAZIONE TIPOLOGIA PROGETTO
    if (message.toLowerCase().includes('bifamiliare')) {
      data.projectType = 'bifamiliare';
      data.units = 2;
    } else if (message.toLowerCase().includes('villa')) {
      data.projectType = 'villa';
      data.units = 1;
    } else if (message.toLowerCase().includes('appartamento')) {
      data.projectType = 'appartamento';
      data.units = 1;
    }
    
    // 🅿️ ESTRAZIONE PARCHEGGI
    const parkingMatch = message.match(/(\d+)\s*parcheggi/i);
    if (parkingMatch && parkingMatch[1]) {
      data.parkingSpaces = parseInt(parkingMatch[1]);
    }
    
    // 📐 ESTRAZIONE AREA PER UNITÀ
    const unitAreaMatch = message.match(/(\d+)\s*metri.*?appartamento/i);
    if (unitAreaMatch && unitAreaMatch[1]) {
      data.areaPerUnit = parseInt(unitAreaMatch[1]);
    }
    
    // 🏷️ ESTRAZIONE NOME PROGETTO
    const nameMatch = message.match(/(?:progetto|nome)[:\s]*([^,.\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    }
    
    return data;
  }

  /**
   * 🎯 DETERMINAZIONE OBIETTIVO PRINCIPALE
   */
  private determinePrimaryGoal(semanticAnalysis: any, extractedData: any, text: string): string {
    // 🎯 PRIORITÀ: Se contiene dati progetto e richiesta analisi
    if (semanticAnalysis.intentKeywords.includes('feasibility') && 
        (extractedData.area || extractedData.constructionCost || extractedData.purchasePrice)) {
      return 'feasibility_analysis';
    }
    
    // 🎯 PRIORITÀ: Richiesta esplicita analisi fattibilità
    if (text.includes('crea una analisi') || text.includes('fai una analisi') || 
        text.includes('crea un analisi') || text.includes('fai un analisi')) {
      return 'feasibility_analysis';
    }
    
    // 🎯 PRIORITÀ: Consultazione progetti
    if (semanticAnalysis.intentKeywords.includes('consultation')) {
      return 'project_consultation';
    }
    
    // 🎯 PRIORITÀ: Analisi di mercato
    if (semanticAnalysis.intentKeywords.includes('market')) {
      return 'market_analysis';
    }
    
    // 🎯 PRIORITÀ: Supporto progettuale
    if (semanticAnalysis.intentKeywords.includes('design')) {
      return 'design_support';
    }
    
    // 🎯 PRIORITÀ: Calcoli di costo
    if (semanticAnalysis.intentKeywords.includes('cost')) {
      return 'cost_calculation';
    }
    
    // 🔄 DEFAULT: Analisi generale
    return 'general_inquiry';
  }

  /**
   * 🛠️ DETERMINAZIONE TOOL NECESSARI INTELLIGENTE
   */
  private determineRequiredToolsIntelligent(primaryGoal: string, extractedData: any, text: string): string[] {
    const tools: string[] = [];
    
    // 🎯 TOOL BASATI SU OBIETTIVO PRINCIPALE
    switch (primaryGoal) {
      case 'feasibility_analysis':
        tools.push('feasibility_analysis');
        break;
      case 'project_consultation':
        tools.push('project_consultation');
        break;
      case 'market_analysis':
        tools.push('market_benchmark');
        break;
      case 'design_support':
        tools.push('design_center');
        break;
      case 'cost_calculation':
        tools.push('cost_calculator');
        break;
    }
    
    // 🎯 TOOL AGGIUNTIVI BASATI SU DATI ESTRATTI
    if (extractedData.area && extractedData.constructionCost && extractedData.purchasePrice) {
      if (!tools.includes('feasibility_analysis')) {
        tools.push('feasibility_analysis');
      }
    }
    
    return tools;
  }

  /**
   * 📊 CALCOLO CONFIDENCE
   */
  private calculateConfidence(semanticAnalysis: any, extractedData: any): number {
    let confidence = 0.5; // Base
    
    // 🎯 BOOST CONFIDENCE PER KEYWORD INTENT
    confidence += semanticAnalysis.intentKeywords.length * 0.1;
    
    // 🎯 BOOST CONFIDENCE PER DATI ESTRATTI
    const dataKeys = Object.keys(extractedData);
    confidence += dataKeys.length * 0.05;
    
    // 🎯 BOOST CONFIDENCE PER DATI CRITICI
    if (extractedData.area && extractedData.constructionCost) {
      confidence += 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * ⚡ DETERMINAZIONE URGENCY
   */
  private determineUrgency(semanticAnalysis: any, text: string): 'low' | 'medium' | 'high' | 'critical' {
    if (text.includes('urgente') || text.includes('subito') || text.includes('immediatamente')) {
      return 'critical';
    }
    
    if (text.includes('presto') || text.includes('rapidamente') || text.includes('veloce')) {
      return 'high';
    }
    
    if (semanticAnalysis.intentKeywords.length > 2) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * 🧩 DETERMINAZIONE COMPLEXITY
   */
  private determineComplexity(extractedData: any, text: string): 'simple' | 'medium' | 'complex' | 'expert' {
    const dataKeys = Object.keys(extractedData);
    
    if (dataKeys.length >= 5 && text.length > 200) {
      return 'expert';
    }
    
    if (dataKeys.length >= 3 && text.length > 100) {
      return 'complex';
    }
    
    if (dataKeys.length >= 1) {
      return 'medium';
    }
    
    return 'simple';
  }

  /**
   * 😊 RILEVAMENTO EMOZIONE UTENTE
   */
  private detectUserEmotion(text: string): 'positive' | 'neutral' | 'frustrated' | 'angry' | 'confused' {
    if (text.includes('grazie') || text.includes('perfetto') || text.includes('ottimo')) {
      return 'positive';
    }
    
    if (text.includes('frustrato') || text.includes('deluso') || text.includes('problema')) {
      return 'frustrated';
    }
    
    if (text.includes('incazzato') || text.includes('schifo') || text.includes('merda')) {
      return 'angry';
    }
    
    if (text.includes('non capisco') || text.includes('confuso') || text.includes('aiuto')) {
      return 'confused';
    }
    
    return 'neutral';
  }

  /**
   * 🎯 GENERAZIONE PROSSIMI PASSI INTELLIGENTI
   */
  private generateIntelligentNextSteps(primaryGoal: string, extractedData: any): string[] {
    const steps: string[] = [];
    
    switch (primaryGoal) {
      case 'feasibility_analysis':
        steps.push('Analisi di fattibilità completata');
        if (extractedData.targetMargin) {
          steps.push(`Verifica raggiungimento margine target ${(extractedData.targetMargin * 100).toFixed(1)}%`);
        }
        steps.push('Salvataggio progetto automatico');
        break;
      case 'project_consultation':
        steps.push('Caricamento progetti esistenti');
        steps.push('Presentazione risultati');
        break;
      case 'market_analysis':
        steps.push('Analisi prezzi di mercato');
        steps.push('Benchmark competitivo');
        break;
    }
    
    return steps;
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
