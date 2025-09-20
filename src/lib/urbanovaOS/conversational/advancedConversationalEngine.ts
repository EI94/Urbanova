// 🧠 ADVANCED CONVERSATIONAL ENGINE - Ispirato a ChatGPT-5
// Sistema conversazionale avanzato con stati, empatia e capacità superiori

// 🛡️ OS PROTECTION - Importa protezione CSS per l'engine
import '@/lib/osProtection';

// 🧠 GOAL-ORIENTED INTENT RECOGNIZER
import { GoalOrientedIntentRecognizer, GoalOrientedIntent, ConversationContext } from '../intelligence/goalOrientedIntentRecognizer';

export interface ConversationalState {
  current: 'listening' | 'thinking' | 'analyzing' | 'calculating' | 'responding';
  emotion: 'neutral' | 'empathetic' | 'professional' | 'encouraging' | 'problem_solving';
  userSentiment: 'positive' | 'neutral' | 'frustrated' | 'angry' | 'confused';
  contextDepth: number;
  reliability: number; // 0-100
}

export interface UserIntent {
  primary: string;
  secondary: string[];
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'medium' | 'complex' | 'expert';
  dataExtracted: any;
  toolsRequired: string[];
}

export interface ConversationalResponse {
  content: string;
  state: ConversationalState;
  toolsActivated: string[];
  nextSteps: string[];
  empathyLevel: number;
}

export class AdvancedConversationalEngine {
  private currentState: ConversationalState;
  private conversationHistory: any[] = [];
  private static userMemory: Map<string, any> = new Map(); // STATIC per persistenza
  private goalOrientedRecognizer: GoalOrientedIntentRecognizer;
  private conversationContext: Map<string, ConversationContext> = new Map(); // CONTESTO PER UTENTE
  
  constructor() {
    this.currentState = {
      current: 'listening',
      emotion: 'professional',
      userSentiment: 'neutral',
      contextDepth: 0,
      reliability: 95
    };
    
    // 🧠 INIZIALIZZA GOAL-ORIENTED RECOGNIZER
    this.goalOrientedRecognizer = GoalOrientedIntentRecognizer.getInstance();
  }

  /**
   * 🧠 MEMORIA CONVERSAZIONALE AVANZATA
   * Mantiene il contesto delle conversazioni per utenti smemorati
   */
  private updateConversationMemory(userId: string, message: string, response: string) {
    if (!AdvancedConversationalEngine.userMemory.has(userId)) {
      AdvancedConversationalEngine.userMemory.set(userId, {
        conversations: [],
        lastTopics: [],
        userPreferences: {},
        currentProject: null
      });
    }
    
    const userData = AdvancedConversationalEngine.userMemory.get(userId);
    userData.conversations.push({
      timestamp: new Date(),
      userMessage: message,
      assistantResponse: response,
      topics: this.extractTopics(message)
    });
    
    // Mantieni solo le ultime 10 conversazioni
    if (userData.conversations.length > 10) {
      userData.conversations = userData.conversations.slice(-10);
    }
    
    AdvancedConversationalEngine.userMemory.set(userId, userData);
  }

  /**
   * 🔍 ESTRAZIONE TOPIC DAL MESSAGGIO
   */
  private extractTopics(message: string): string[] {
    const topics = [];
    const text = message.toLowerCase();
    
    if (text.includes('terreno') || text.includes('immobile')) topics.push('real_estate');
    if (text.includes('fattibil') || text.includes('analisi')) topics.push('feasibility');
    if (text.includes('costruzion') || text.includes('progetto')) topics.push('construction');
    if (text.includes('mercato') || text.includes('prezzo')) topics.push('market');
    if (text.includes('design') || text.includes('progett')) topics.push('design');
    
    return topics;
  }

  /**
   * 🧠 RECUPERO CONTESTO CONVERSAZIONALE
   */
  private getConversationContext(userId: string): string {
    if (!AdvancedConversationalEngine.userMemory.has(userId)) {
      return '';
    }
    
    const userData = AdvancedConversationalEngine.userMemory.get(userId);
    if (userData.conversations.length === 0) {
      return '';
    }
    
    const recentConversations = userData.conversations.slice(-3);
    let context = '## 📝 Contesto Conversazione Precedente\n\n';
    
    recentConversations.forEach((conv: any, index: number) => {
      context += `**Conversazione ${index + 1}:**\n`;
      context += `- **Utente**: ${conv.userMessage.substring(0, 100)}...\n`;
      context += `- **Argomenti**: ${conv.topics.join(', ')}\n\n`;
    });
    
    return context;
  }

  /**
   * 🎯 ANALISI AVANZATA DELL'INTENTO UTENTE CON GOAL-ORIENTED LLM
   * Analizza il messaggio con capacità superiori a ChatGPT-5 usando LLM
   */
  async analyzeUserIntent(message: string, context: any, userId: string = 'anonymous'): Promise<UserIntent> {
    console.log('🧠 [GOAL-ORIENTED] Analizzando intent utente con LLM...');
    
    try {
      // 🧠 USA GOAL-ORIENTED RECOGNIZER CON LLM
      const conversationContext = this.conversationContext.get(userId) || { 
        previousMessages: [], 
        currentProject: null,
        userPreferences: {},
        sessionGoals: []
      };
      
      const goalOrientedIntent = await this.goalOrientedRecognizer.analyzeIntentWithLLM(message, conversationContext);
      
      // 🔄 AGGIORNA CONTESTO CONVERSAZIONALE
      const updatedContext = this.goalOrientedRecognizer.updateConversationContext(
        conversationContext, 
        message, 
        goalOrientedIntent
      );
      this.conversationContext.set(userId, updatedContext);
      
      // 🔄 CONVERTI GOAL-ORIENTED INTENT IN USERINTENT
      const userIntent: UserIntent = {
        primary: goalOrientedIntent.primaryGoal,
        secondary: goalOrientedIntent.secondaryGoals,
        confidence: goalOrientedIntent.confidence,
        urgency: goalOrientedIntent.urgency,
        complexity: goalOrientedIntent.complexity,
        dataExtracted: goalOrientedIntent.extractedData,
        toolsRequired: goalOrientedIntent.requiredTools
      };
      
      console.log('✅ [GOAL-ORIENTED] Intent analizzato con LLM:', {
        primary: userIntent.primary,
        confidence: userIntent.confidence,
        toolsRequired: userIntent.toolsRequired,
        extractedData: userIntent.dataExtracted
      });
      
      return userIntent;
      
    } catch (error) {
      console.error('❌ [GOAL-ORIENTED] Errore analisi intent, usando fallback:', error);
      
      // 🔄 FALLBACK: Usa riconoscimento tradizionale
      return this.fallbackIntentAnalysis(message, context);
    }
  }

  /**
   * 🔄 FALLBACK INTENT ANALYSIS
   */
  private fallbackIntentAnalysis(message: string, context: any): UserIntent {
    const text = message.toLowerCase();
    
    // 🔍 ANALISI SENTIMENT AVANZATA
    const userSentiment = this.analyzeSentiment(text);
    
    // 🎯 RICONOSCIMENTO INTENTI MULTI-LAYER
    const intents = this.recognizeIntents(text);
    
    // 🔍 ESTRAZIONE DATI INTELLIGENTE
    const dataExtracted = this.extractDataAdvanced(message);
    
    // 🛠️ DETERMINAZIONE TOOL NECESSARI
    const toolsRequired = this.determineRequiredTools(intents, dataExtracted, message);
    
    // 📊 CALCOLO COMPLESSITÀ E URGENZA
    const complexity = this.calculateComplexity(intents, dataExtracted);
    const urgency = this.calculateUrgency(userSentiment, intents);
    
    return {
      primary: intents.primary,
      secondary: intents.secondary,
      confidence: intents.confidence,
      urgency,
      complexity,
      dataExtracted,
      toolsRequired
    };
  }

  /**
   * 🧠 GENERAZIONE RISPOSTA CONVERSAZIONALE AVANZATA
   * Genera risposte con empatia, stati e capacità superiori
   */
  async generateAdvancedResponse(
    message: string,
    context: any,
    originalRequest: any,
    projectData?: any
  ): Promise<ConversationalResponse> {
    
    // 🧠 ANALISI INTENT CON GOAL-ORIENTED LLM
    const userId = originalRequest.userId || 'anonymous';
    const intent = await this.analyzeUserIntent(message, context, userId);
    
    // 🎭 ADATTA STATO EMOTIVO
    this.adaptEmotionalState(intent);
    
    // 🧠 STATO: THINKING
    this.currentState.current = 'thinking';
    
    let response = '';
    let toolsActivated: string[] = [];
    
    // 🧠 RECUPERA CONTESTO CONVERSAZIONALE PER UTENTI SMEMORATI
    const conversationUserId = originalRequest.userId || 'anonymous';
    const conversationContext = this.getConversationContext(conversationUserId);
    
    // 💝 RISPOSTA EMPATICA INIZIALE CON CONTESTO
    response += this.generateEmpathicOpening(intent);
    
    // Se l'utente sembra smemorato o confuso, aggiungi contesto
    if (originalRequest.message.toLowerCase().includes('non ricordo') ||
        originalRequest.message.toLowerCase().includes('mi sono perso') ||
        originalRequest.message.toLowerCase().includes('ricapitolare')) {
      response += conversationContext;
    }
    
    // Se l'utente è frustrato o arrabbiato, aggiungi supporto empatico
    if (originalRequest.message.toLowerCase().includes('schifo') ||
        originalRequest.message.toLowerCase().includes('incazzato') ||
        originalRequest.message.toLowerCase().includes('frustrato') ||
        originalRequest.message.toLowerCase().includes('merda')) {
      response += this.generateEmpathicSupport(intent);
    }
    
    // 🧠 STATO: ANALYZING
    this.currentState.current = 'analyzing';
    
    // 🔍 ANALISI E ATTIVAZIONE TOOL - LOGICA INTELLIGENTE CHATGPT-5
    if (intent.primary === 'consultation') {
      // 🗂️ CONSULTAZIONE PROGETTI ESISTENTI
      response += this.generateThinkingState(intent);
      
      // 🧠 STATO: CALCULATING
      this.currentState.current = 'calculating';
      
      // 🛠️ ATTIVAZIONE TOOL CONSULTAZIONE
      const consultationResults = await this.activateConsultationTool(intent, context, originalRequest);
      toolsActivated = ['project_consultation'];
      
      response += consultationResults;
    } else if (intent.toolsRequired.length > 0) {
      response += this.generateThinkingState(intent);
      
      // 🧠 STATO: CALCULATING
      this.currentState.current = 'calculating';
      
      // 🛠️ ATTIVAZIONE TOOL GARANTITA
      const toolResults = await this.activateToolsGuaranteed(intent, context, originalRequest);
      toolsActivated = intent.toolsRequired; // Usa i tool determinati dall'intent
      
      response += toolResults;
    } else {
      // Risposta conversazionale avanzata senza tool
      response += this.generateConversationalResponse(intent, context);
    }
    
    // 🧠 STATO: RESPONDING
    this.currentState.current = 'responding';
    
    // 🚀 PROSSIMI PASSI PROATTIVI
    const nextSteps = this.generateProactiveNextSteps(intent, context);
    response += this.formatNextSteps(nextSteps);
    
    // 🧠 AGGIORNA MEMORIA CONVERSAZIONALE
    this.updateConversationMemory(userId, originalRequest.message, response);
    
    return {
      content: response,
      state: this.currentState,
      toolsActivated,
      nextSteps,
      empathyLevel: this.calculateEmpathyLevel(intent)
    };
  }

  /**
   * 💝 GENERAZIONE SUPPORTO EMPATICO PER UTENTI FRUSTRATI
   */
  private generateEmpathicSupport(intent: UserIntent): string {
    const supportMessages = [
      `## 💝 Supporto Empatico\n\nCapisco perfettamente la tua frustrazione. È normale sentirsi così quando le cose non vanno come previsto. Sono qui per aiutarti a superare questi ostacoli.\n\n`,
      `## 🤝 Supporto Professionale\n\nLa tua frustrazione è comprensibile. Insieme possiamo identificare il problema e trovare una soluzione efficace. Non sei solo in questo percorso.\n\n`,
      `## 💪 Motivazione e Supporto\n\nCapisco che questa situazione sia difficile. Ma ricorda: ogni ostacolo è un'opportunità per crescere. Sono qui per guidarti verso il successo.\n\n`
    ];
    
    const randomIndex = Math.floor(Math.random() * supportMessages.length);
    return supportMessages[randomIndex] as string;
  }

  /**
   * 🎭 ANALISI SENTIMENT AVANZATA
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'frustrated' | 'angry' | 'confused' {
    const angryWords = ['schifo', 'merda', 'inutile', 'perdendo soldi', 'incazzato', 'fallimento', 'disastro', 'cazzo'];
    const frustratedWords = ['non funziona', 'problema', 'difficoltà', 'non capisce', 'lento', 'frustrato', 'troppo complicato'];
    const confusedWords = ['non so', 'aiuto', 'come', 'cosa', 'dove', 'quando', 'non capisco'];
    const positiveWords = ['grazie', 'perfetto', 'ottimo', 'bene', 'eccellente'];
    
    if (angryWords.some(word => text.includes(word))) return 'angry';
    if (frustratedWords.some(word => text.includes(word))) return 'frustrated';
    if (confusedWords.some(word => text.includes(word))) return 'confused';
    if (positiveWords.some(word => text.includes(word))) return 'positive';
    
    return 'neutral';
  }

  /**
   * 🎯 RICONOSCIMENTO INTENTI MULTI-LAYER
   */
  private recognizeIntents(text: string): { primary: string; secondary: string[]; confidence: number } {
    const intents = {
      feasibility: 0,
      sensitivity: 0,
      risk: 0,
      market: 0,
      valuation: 0,
      planning: 0,
      consultation: 0
    };
    
    // Pattern per analisi di fattibilità
    const feasibilityPatterns = [
      'analisi di fattibilità', 'studio di fattibilità', 'business plan',
      'fattibilità', 'valutazione economica', 'terreno', 'progetto',
      'costruzione', 'investimento', 'margine', 'profitto', 'roi'
    ];
    
    // Pattern per consultazione progetti
    const consultationPatterns = [
      'mostrami', 'mostra', 'elenca', 'lista', 'progetti creati',
      'progetti salvati', 'miei progetti', 'progetti fattibilità',
      'consultazione', 'visualizza', 'vedi progetti'
    ];
    
    feasibilityPatterns.forEach(pattern => {
      if (text.includes(pattern)) intents.feasibility += 1;
    });
    
    consultationPatterns.forEach(pattern => {
      if (text.includes(pattern)) intents.consultation += 1;
    });
    
    // Pattern per analisi di sensibilità
    const sensitivityPatterns = [
      'sensibilità', 'sensitivity', 'variazione', 'scenario',
      'cosa succede se', 'e se', 'simulazione'
    ];
    
    sensitivityPatterns.forEach(pattern => {
      if (text.includes(pattern)) intents.sensitivity += 1;
    });
    
    // Determina intento primario
    const maxIntent = Object.keys(intents).reduce((a, b) => 
      intents[a as keyof typeof intents] > intents[b as keyof typeof intents] ? a : b
    ) as keyof typeof intents;
    
    const confidence = intents[maxIntent] > 0 ? 
      Math.min(intents[maxIntent] * 0.2, 0.95) : 0.3;
    
    const secondary = Object.keys(intents)
      .filter(key => key !== maxIntent && intents[key as keyof typeof intents] > 0)
      .sort((a, b) => intents[b as keyof typeof intents] - intents[a as keyof typeof intents]);
    
    return {
      primary: maxIntent,
      secondary,
      confidence
    };
  }

  /**
   * 🔍 ESTRAZIONE DATI AVANZATA
   */
  private extractDataAdvanced(message: string): any {
    const data: any = {};
    const text = message.toLowerCase();

    // 🔧 ESTRAZIONE ROBUSTA CON TOLERANZA ERRORI DI BATTITURA
    
    // Area terreno - Pattern più flessibili (UNIFICATO CON ORCHESTRATOR)
    const areaPatterns = [
      /(\d+)\s*(?:metri quadrati|mq|m²)/i,
      /terreno.*?(\d+)\s*(?:metri quadrati|mq|m²)/i,
      /(\d+)\s*(?:metri quadrati|mq|m²).*?terreno/i,
      /(\d+)\s*metri quadrati/i,
      /terreno.*?(\d+)\s*metri/i,
      /(\d+)\s*metri.*?terreno/i
    ];
    
    for (const pattern of areaPatterns) {
      const match = message.match(pattern); // USA MESSAGE COME ORCHESTRATOR
      if (match && match[1]) {
        data.buildableArea = parseInt(match[1]);
        data.landArea = data.buildableArea;
        break;
      }
    }

    // Costo costruzione - Pattern più flessibili (UNIFICATO CON ORCHESTRATOR)
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
      /consto[:\s]*(\d+)\s*euro/i, // Tolleranza errore di battitura "consto"
      /consto[:\s]*(\d+)/i
    ];
    
    for (const pattern of costPatterns) {
      const match = message.match(pattern); // USA MESSAGE COME ORCHESTRATOR
      if (match && match[1]) {
        data.constructionCostPerSqm = parseInt(match[1]);
        break;
      }
    }

    // Prezzo acquisto - Pattern più flessibili (UNIFICATO CON ORCHESTRATOR)
    const pricePatterns = [
      /acquisto[:\s]*(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro/i,
      /acquisto[:\s]*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro.*?acquisto/i,
      /terreno[:\s]*(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro/i,
      /(\d+(?:\.\d+)?)\s*(?:mila|k|000)?\s*euro.*?terreno/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = message.match(pattern); // USA MESSAGE COME ORCHESTRATOR
      if (match && match[1]) {
        let price = parseFloat(match[1]);
        if (message.includes('k') || message.includes('000') || message.includes('mila')) {
          price *= 1000;
        }
        data.purchasePrice = price;
        break;
      }
    }

    // Margine target - Pattern più flessibili (UNIFICATO CON ORCHESTRATOR)
    const marginPatterns = [
      /target[:\s]*(\d+(?:\.\d+)?)\s*%/i,
      /marginalità[:\s]*(\d+(?:\.\d+)?)\s*%/i,
      /margine[:\s]*(\d+(?:\.\d+)?)\s*%/i,
      /(\d+(?:\.\d+)?)\s*%.*?target/i,
      /(\d+(?:\.\d+)?)\s*%.*?margine/i
    ];
    
    for (const pattern of marginPatterns) {
      const match = message.match(pattern); // USA MESSAGE COME ORCHESTRATOR
      if (match && match[1]) {
        data.targetMargin = parseFloat(match[1]) / 100;
        break;
      }
    }

    // Nome progetto
    const nameMatch = message.match(/(?:progetto|nome)[:\s]*([^,.\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    }

    // Tipologia progetto
    if (text.includes('bifamiliare')) {
      data.projectType = 'bifamiliare';
      data.units = 2;
    } else if (text.includes('villa')) {
      data.projectType = 'villa';
      data.units = 1;
    } else if (text.includes('appartamento')) {
      data.projectType = 'appartamento';
      data.units = 1;
    }

    // Parcheggi
    const parkingMatch = message.match(/(\d+)\s*parcheggi/i);
    if (parkingMatch && parkingMatch[1]) {
      data.parkingSpaces = parseInt(parkingMatch[1]);
    }

    // Area per unità
    const unitAreaMatch = message.match(/(\d+)\s*metri.*?appartamento/i);
    if (unitAreaMatch && unitAreaMatch[1]) {
      data.areaPerUnit = parseInt(unitAreaMatch[1]);
    }

    // Location - Pattern più flessibili (UNIFICATO CON ORCHESTRATOR)
    const locationPatterns = [
      /a\s+([A-Za-z\s]+?)(?:\s|,|$)/i,
      /a\s+([A-Za-z\s]+?)(?:\s|,|$)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = message.match(pattern); // USA MESSAGE COME ORCHESTRATOR
      if (match && match[1] && match[1].length > 2) {
        data.location = match[1].trim();
        break;
      }
    }

    console.log('🔍 [Advanced Engine] Dati estratti:', data);
    return data;
  }

  /**
   * ⚡ ANALISI FATTIBILITÀ OTTIMIZZATA - CON TIMEOUT PROTECTION
   */
  private async generateFeasibilityAnalysisOptimized(projectData: any): Promise<string> {
    try {
      // Genera solo l'analisi, NON salvare qui (viene salvato dopo)
      let result = `## 🏗️ Analisi di Fattibilità Avanzata\n\n`;
      
      // Calcoli di fattibilità
      const totalCosts = projectData.costs.total;
      const totalRevenues = projectData.revenues.total;
      const profit = totalRevenues - totalCosts;
      const margin = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
      const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
      
      result += `### 💰 Analisi Economica\n`;
      result += `- **Investimento Totale**: €${totalCosts.toLocaleString()}\n`;
      result += `- **Ricavi Attesi**: €${totalRevenues.toLocaleString()}\n`;
      result += `- **Utile Previsto**: €${profit.toLocaleString()}\n`;
      result += `- **Margine**: ${margin.toFixed(1)}%\n`;
      result += `- **ROI**: ${roi.toFixed(1)}%\n\n`;
      
      result += `### 📊 Dati Progetto\n`;
      result += `- **Nome**: ${projectData.name}\n`;
      result += `- **Indirizzo**: ${projectData.address}\n`;
      result += `- **Area Totale**: ${projectData.totalArea} mq\n`;
      result += `- **Costo Costruzione**: €${projectData.costs.construction.subtotal.toLocaleString()}\n`;
      result += `- **Prezzo Acquisto**: €${projectData.costs.land.purchasePrice.toLocaleString()}\n`;
      result += `- **Target Margine**: ${projectData.targetMargin.toFixed(1)}%\n\n`;
      
      result += `### 🎯 Valutazione Fattibilità\n`;
      if (margin >= projectData.targetMargin) {
        result += `✅ **PROGETTO FATTIBILE** - Margine ${margin.toFixed(1)}% supera target ${projectData.targetMargin.toFixed(1)}%\n\n`;
      } else {
        result += `⚠️ **PROGETTO DA VALUTARE** - Margine ${margin.toFixed(1)}% sotto target ${projectData.targetMargin.toFixed(1)}%\n\n`;
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore analisi fattibilità ottimizzata:', error);
      return this.generateFeasibilityAnalysis(projectData);
    }
  }

  /**
   * ⚡ SUGGERIMENTI DESIGN OTTIMIZZATI - CON TIMEOUT PROTECTION
   */
  private async generateDesignSuggestionsOptimized(projectData: any): Promise<string> {
    try {
      // Importa il servizio di design
      const aiDesignService = await import('../../aiDesignService');
      // const aiDesignService = new AIDesignService();
      
      // Genera suggerimenti di design
      const designSuggestions = await (aiDesignService as any).generateDesignSuggestions?.(projectData) || [];
      
      if (designSuggestions && designSuggestions.length > 0) {
        let result = `## 🎨 Suggerimenti Design AI\n\n`;
        designSuggestions.slice(0, 3).forEach((suggestion: any) => {
          result += `### ${suggestion.title}\n`;
          result += `**Priorità**: ${suggestion.priority}\n`;
          result += `**Benefici**: ${suggestion.benefits.join(', ')}\n`;
          result += `**Impatto ROI**: +${suggestion.estimatedImpact.roi}%\n\n`;
        });
        return result;
      } else {
        return '';
      }
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore suggerimenti design ottimizzati:', error);
      return '';
    }
  }

  /**
   * ⚡ SALVATAGGIO PROGETTO OTTIMIZZATO - CON TIMEOUT PROTECTION
   */
  private async saveProjectOptimized(projectData: any, userId: string): Promise<string> {
    try {
      console.log('🔧 [Advanced Engine] Inizio salvataggio progetto ottimizzato...');
      console.log('🔧 [Advanced Engine] ProjectData ricevuto:', {
        name: projectData.name,
        address: projectData.address,
        totalArea: projectData.totalArea,
        costs: projectData.costs,
        userId
      });
      
      // Importa il servizio di fattibilità CORRETTO
      console.log('🔧 [Advanced Engine] Importando FeasibilityService...');
      const { FeasibilityService } = await import('../../feasibilityService');
      console.log('🔧 [Advanced Engine] FeasibilityService importato:', !!FeasibilityService);
      const feasibilityService = new FeasibilityService();
      console.log('🔧 [Advanced Engine] Istanza FeasibilityService creata:', !!feasibilityService);
      
      console.log('🔧 [Advanced Engine] FeasibilityService importato con successo');
      
      // Salva il progetto nella collezione CORRETTA
      console.log('🔧 [Advanced Engine] Chiamando createProject...');
      const projectId = await feasibilityService.createProject(projectData);
      
      console.log('🔧 [Advanced Engine] Risultato createProject:', projectId);
      
      if (projectId) {
        let result = `## 📊 Gestione Progetto\n\n`;
        result += `✅ **Progetto salvato automaticamente**\n`;
        result += `🆔 **ID Progetto**: ${projectId}\n`;
        result += `📝 **Stato**: Nuovo progetto di fattibilità\n`;
        result += `💾 **Salvataggio**: Automatico nella pagina Analisi Fattibilità\n\n`;
        console.log('🔧 [Advanced Engine] Progetto salvato con successo:', projectId);
        return result;
      } else {
        console.log('🔧 [Advanced Engine] Salvataggio fallito: projectId vuoto');
        return '';
      }
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore salvataggio progetto ottimizzato:', error);
      console.error('❌ [Advanced Engine] Stack trace completo:', (error as Error).stack);
      return '';
    }
  }

  /**
   * 🛠️ DETERMINAZIONE TOOL NECESSARI - LOGICA INTELLIGENTE CHATGPT-5
   */
  private determineRequiredTools(intents: any, dataExtracted: any, originalMessage: string): string[] {
    const tools: string[] = [];
    
    // 🧠 LOGICA INTELLIGENTE: Attiva tool anche per richieste generiche
    const hasProjectData = dataExtracted.buildableArea || dataExtracted.constructionCostPerSqm || 
                          dataExtracted.purchasePrice || dataExtracted.targetMargin;
    
    const text = originalMessage.toLowerCase();
    
    console.log('🔍 [DEBUG] determineRequiredTools chiamata con:', {
      text: text.substring(0, 100) + '...',
      hasProjectData,
      intents: intents,
      dataExtracted: dataExtracted
    });
    
    // 🎯 RICHIESTE DI PREZZI E COSTI - Sempre attiva
    if (this.isPriceRequest(text) || this.isCostRequest(text)) {
      tools.push('feasibility_analysis');
      return tools;
    }
    
    // 🎯 RICHIESTE DI ANALISI - Sempre attiva
    if (this.isAnalysisRequest(text)) {
      tools.push('feasibility_analysis');
      return tools;
    }
    
    // 🎯 RICHIESTE DI CONSULTAZIONE PROGETTI - Sempre attiva
    if (this.isConsultationRequest(text)) {
      tools.push('project_consultation');
      return tools;
    }
    
    // 🎯 RICHIESTE DI FATTIBILITÀ - Sempre attiva se contiene keyword
    if (this.isFeasibilityRequest(text, intents)) {
      tools.push('feasibility_analysis');
      console.log('🔍 [DEBUG] Attivato feasibility_analysis per richiesta esplicita');
      return tools;
    }
    
    // 🎯 RICHIESTE CON DATI PROGETTO - Attiva tool anche senza dati completi
    if (hasProjectData) {
      console.log('🔍 [DEBUG] Trovati dati progetto, attivando tool appropriati');
    } else {
      console.log('🔍 [DEBUG] Nessun dato progetto trovato, ma continuando con logica intelligente');
    }
    
    // 🎯 ANALISI CONTESTUALE: Riconosce l'intento specifico dell'utente
    
    // 🔍 ANALISI DI FATTIBILITÀ - Solo se esplicitamente richiesta
    if (this.isFeasibilityRequest(text, intents)) {
      tools.push('feasibility_analysis');
    }
    
    // 📊 ANALISI DI SENSIBILITÀ - Solo se richiesta
    if (this.isSensitivityRequest(text, intents)) {
      tools.push('sensitivity_analysis');
    }
    
    // ⚠️ ANALISI DI RISCHIO - Solo se richiesta
    if (this.isRiskAnalysisRequest(text, intents)) {
      tools.push('risk_analysis');
    }
    
    // 📈 BENCHMARK DI MERCATO - Solo se richiesta
    if (this.isMarketBenchmarkRequest(text, intents)) {
      tools.push('market_benchmark');
    }
    
    // 💰 VALUTAZIONE INVESTIMENTO - Solo se richiesta
    if (this.isInvestmentValuationRequest(text, intents)) {
      tools.push('investment_valuation');
    }
    
    // 🏗️ CREAZIONE PROGETTO - Solo se richiesta
    if (this.isProjectCreationRequest(text, intents)) {
      tools.push('create_project');
    }
    
    // 🎨 DESIGN CENTER - Solo se richiesta
    if (this.isDesignCenterRequest(text, intents)) {
      tools.push('design_center');
    }
    
    return tools;
  }
  
  /**
   * 💰 RICONOSCIMENTO RICHIESTE DI PREZZI
   */
  private isPriceRequest(text: string): boolean {
    const priceKeywords = [
      'quanto costa', 'costo', 'prezzo', 'tariffa', 'quanto', 'price',
      'costi', 'prezzi', 'tariffe', 'quanto viene', 'quanto pagare'
    ];
    
    return priceKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 💸 RICONOSCIMENTO RICHIESTE DI COSTI
   */
  private isCostRequest(text: string): boolean {
    const costKeywords = [
      'costo', 'spesa', 'investimento', 'budget', 'quanto spendere',
      'quanto investire', 'quanto mi costa', 'quanto devo pagare'
    ];
    
    return costKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 📊 RICONOSCIMENTO RICHIESTE DI ANALISI
   */
  private isAnalysisRequest(text: string): boolean {
    const analysisKeywords = [
      'analisi', 'studio', 'valutazione', 'calcolo', 'calcola',
      'verifica', 'controllo', 'check', 'review'
    ];
    
    return analysisKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 🔍 RICONOSCIMENTO RICHIESTA ANALISI DI FATTIBILITÀ
   */
  private isFeasibilityRequest(text: string, intents: any): boolean {
    const feasibilityKeywords = [
      'analisi di fattibilità', 'studio di fattibilità', 'business plan',
      'fattibilità', 'valutazione economica', 'profitto', 'margine',
      'roi', 'ritorno investimento', 'redditività', 'convenienza',
      'analisi', 'studio', 'valutazione', 'calcolo', 'calcola',
      'quanto costa', 'costo totale', 'spesa totale', 'investimento',
      'terreno', 'progetto', 'immobile', 'costruzione', 'crea una analisi',
      'crea un analisi', 'fai una analisi', 'fai un analisi'
    ];
    
    const keywordMatches = feasibilityKeywords.filter(keyword => text.includes(keyword));
    const hasKeywordMatch = keywordMatches.length > 0;
    const hasIntentMatch = intents.primary === 'feasibility';
    const hasConfidenceMatch = intents.confidence > 0.5 && (text.includes('terreno') || text.includes('progetto') || text.includes('immobile'));
    
    // 🎯 RICONOSCIMENTO PATTERN SPECIFICI PER L'UTENTE
    const hasCreatePattern = text.includes('crea') && (text.includes('analisi') || text.includes('fattibilità'));
    const hasDoPattern = text.includes('fai') && (text.includes('analisi') || text.includes('fattibilità'));
    
    const result = hasKeywordMatch || hasIntentMatch || hasConfidenceMatch || hasCreatePattern || hasDoPattern;
    
    console.log('🔍 [DEBUG] isFeasibilityRequest:', {
      text: text.substring(0, 100) + '...',
      keywordMatches,
      hasKeywordMatch,
      hasIntentMatch,
      hasConfidenceMatch,
      hasCreatePattern,
      hasDoPattern,
      result
    });
    
    return result;
  }

  /**
   * 🗂️ RICONOSCIMENTO RICHIESTE CONSULTAZIONE PROGETTI
   */
  private isConsultationRequest(text: string): boolean {
    const consultationKeywords = [
      'mostrami', 'mostra', 'elenca', 'lista', 'progetti creati',
      'progetti salvati', 'miei progetti', 'progetti fattibilità',
      'consultazione', 'visualizza', 'vedi progetti', 'progetti esistenti',
      'quali progetti', 'progetti precedenti', 'storico progetti'
    ];
    
    const keywordMatches = consultationKeywords.filter(keyword => text.includes(keyword));
    const hasKeywordMatch = keywordMatches.length > 0;
    
    console.log('🔍 [DEBUG] isConsultationRequest:', {
      text: text.substring(0, 100) + '...',
      keywordMatches,
      hasKeywordMatch,
      result: hasKeywordMatch
    });
    
    return hasKeywordMatch;
  }
  
  /**
   * 📊 RICONOSCIMENTO RICHIESTA ANALISI DI SENSIBILITÀ
   */
  private isSensitivityRequest(text: string, intents: any): boolean {
    const sensitivityKeywords = [
      'sensibilità', 'sensitivity', 'variazione', 'scenario',
      'cosa succede se', 'e se', 'simulazione', 'simula'
    ];
    
    return sensitivityKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'sensitivity';
  }
  
  /**
   * ⚠️ RICONOSCIMENTO RICHIESTA ANALISI DI RISCHIO
   */
  private isRiskAnalysisRequest(text: string, intents: any): boolean {
    const riskKeywords = [
      'rischio', 'risk', 'pericolo', 'problema', 'difficoltà',
      'ostacolo', 'barriera', 'minaccia'
    ];
    
    return riskKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'risk';
  }
  
  /**
   * 📈 RICONOSCIMENTO RICHIESTA BENCHMARK DI MERCATO
   */
  private isMarketBenchmarkRequest(text: string, intents: any): boolean {
    const marketKeywords = [
      'mercato', 'market', 'prezzi', 'confronto', 'benchmark',
      'competizione', 'concorrenza', 'tendenza'
    ];
    
    return marketKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'market';
  }
  
  /**
   * 💰 RICONOSCIMENTO RICHIESTA VALUTAZIONE INVESTIMENTO
   */
  private isInvestmentValuationRequest(text: string, intents: any): boolean {
    const valuationKeywords = [
      'valutazione', 'valuation', 'valore', 'prezzo', 'costo',
      'investimento', 'investire', 'acquistare'
    ];
    
    return valuationKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'valuation';
  }
  
  /**
   * 🏗️ RICONOSCIMENTO RICHIESTA CREAZIONE PROGETTO
   */
  private isProjectCreationRequest(text: string, intents: any): boolean {
    const projectKeywords = [
      'crea progetto', 'nuovo progetto', 'inizia progetto',
      'progetto', 'crea', 'nuovo', 'inizia'
    ];
    
    return projectKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'planning';
  }
  
  /**
   * 🎨 RICONOSCIMENTO RICHIESTA DESIGN CENTER
   */
  private isDesignCenterRequest(text: string, intents: any): boolean {
    const designKeywords = [
      'design', 'progettazione', 'architettura', 'layout',
      'pianta', 'rendering', 'visualizzazione'
    ];
    
    return designKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'design';
  }

  /**
   * 💝 GENERAZIONE APERTURA EMPATICA
   */
  private generateEmpathicOpening(intent: UserIntent): string {
    const sentiment = intent.dataExtracted.userSentiment || 'neutral';
    
    switch (sentiment) {
      case 'angry':
        return "Capisco la tua frustrazione e sono qui per aiutarti a risolvere questo problema. Analizziamo insieme i tuoi dati per trovare la soluzione migliore.\n\n";
      
      case 'frustrated':
        return "Comprendo che possa essere frustrante. Lavoriamo insieme per chiarire la situazione e trovare la strada giusta.\n\n";
      
      case 'confused':
        return "Nessun problema, sono qui per guidarti passo dopo passo. Analizziamo insieme i tuoi dati.\n\n";
      
      default:
        return "Perfetto! Analizziamo insieme il tuo progetto immobiliare per fornirti un'analisi completa e professionale.\n\n";
    }
  }

  /**
   * 🧠 GENERAZIONE STATO THINKING
   */
  private generateThinkingState(intent: UserIntent): string {
    return "🧠 *Sto analizzando i tuoi dati e preparando un'analisi dettagliata...*\n\n";
  }

  /**
   * 🛠️ ATTIVAZIONE TOOL GARANTITA
   */
  private async activateToolsGuaranteed(intent: UserIntent, context: any, originalRequest: any): Promise<string> {
    const data = intent.dataExtracted;
    console.log('🔍 [DEBUG CRASH] Data estratta:', data);
    
    // Crea sempre un progetto dai dati estratti nel formato FeasibilityProject
    const projectData = {
      name: data.name || 'Progetto Automatico OS',
      address: data.address || data.location || 'Indirizzo da definire',
      status: 'PIANIFICAZIONE' as const,
      startDate: new Date(),
      constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 giorni da ora
      duration: 18, // mesi
      totalArea: data.buildableArea || data.landArea || 0,
      targetMargin: (data.targetMargin || 0.25) * 100, // Converti in percentuale
      createdBy: originalRequest.userId || 'anonymous',
      notes: `Progetto creato automaticamente dall'OS - ${new Date().toISOString()}`,
      
      // Costi
      costs: {
        land: {
          purchasePrice: data.purchasePrice || 0,
          purchaseTaxes: (data.purchasePrice || 0) * 0.1, // 10% tasse
          intermediationFees: (data.purchasePrice || 0) * 0.03, // 3% commissioni
          subtotal: (data.purchasePrice || 0) * 1.13
        },
        construction: {
          excavation: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.1,
          structures: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.4,
          systems: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.2,
          finishes: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.3,
          subtotal: data.buildableArea * (data.constructionCostPerSqm || 0)
        },
        externalWorks: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.1,
        concessionFees: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.05,
        design: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.08,
        bankCharges: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.02,
        exchange: 0,
        insurance: data.buildableArea * (data.constructionCostPerSqm || 0) * 0.015,
        total: (data.purchasePrice || 0) * 1.13 + data.buildableArea * (data.constructionCostPerSqm || 0) * 1.25 // Calcolo totale
      },
      
      // Ricavi
      revenues: {
        units: data.units || Math.floor((data.buildableArea || 0) / 100), // Stima unità
        averageArea: data.areaPerApartment || 100,
        pricePerSqm: data.pricePerSqm || 0,
        revenuePerUnit: (data.pricePerSqm || 0) * (data.areaPerApartment || 100),
        totalSales: (data.pricePerSqm || 0) * (data.buildableArea || 0),
        otherRevenues: 0,
        total: (data.pricePerSqm || 0) * (data.buildableArea || 0)
      },
      
      // Risultati
      results: {
        profit: 0, // Sarà calcolato
        margin: 0, // Sarà calcolato
        roi: 0, // Sarà calcolato
        paybackPeriod: 0 // Sarà calcolato
      },
      
      isTargetAchieved: false
    };

    console.log('🔧 [Advanced Engine] Attivando TUTTI I TOOL con dati:', projectData);

    // 🎯 ATTIVAZIONE TUTTI I TOOL DISPONIBILI - CHIAMATE REALI COMPLETE
    let result = '';
    
    // 🔧 USA PROJECTDATA PASSATO SE DISPONIBILE
    const finalProjectData = projectData;
    
    console.log('🔧 [Advanced Engine] ProjectData finale:', finalProjectData);
    
    // OTTIMIZZATO: Attiva analisi di fattibilità solo se necessario
    if (finalProjectData.totalArea > 0 || finalProjectData.costs.construction.subtotal > 0 || finalProjectData.costs.land.purchasePrice > 0) {
      console.log('🔧 [Advanced Engine] Attivando analisi di fattibilità OTTIMIZZATA...');
      
      try {
        // TIMEOUT PROTECTION: Limita tempo di attesa
        const feasibilityPromise = this.generateFeasibilityAnalysisOptimized(finalProjectData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000) // 5 secondi max
        );
        
        const feasibilityResult = await Promise.race([feasibilityPromise, timeoutPromise]);
        result += feasibilityResult;
        
      } catch (error) {
        console.error('❌ [Advanced Engine] Errore analisi fattibilità:', error);
        result += this.generateFeasibilityAnalysis(finalProjectData);
      }
    }

    // 🎨 DESIGN CENTER SERVICE - Suggerimenti di design AI (OTTIMIZZATO)
    try {
      console.log('🎨 [Advanced Engine] Attivando Design Center Service OTTIMIZZATO...');
      
      // TIMEOUT PROTECTION: Limita tempo di attesa
      const designPromise = this.generateDesignSuggestionsOptimized(finalProjectData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000) // 3 secondi max
      );
      
      const designResult = await Promise.race([designPromise, timeoutPromise]);
      result += designResult;
      
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore Design Center:', error);
    }

    // 📊 PROJECT MANAGER SERVICE - RIATTIVATO CON TIMEOUT ULTRA-RIDOTTO
    try {
      console.log('📊 [Advanced Engine] Attivando Project Manager Service con timeout ultra-ridotto...');
      console.log('📊 [Advanced Engine] Dati progetto da salvare:', {
        name: finalProjectData.name,
        address: finalProjectData.address,
        totalArea: finalProjectData.totalArea,
        userId: originalRequest.userId
      });
      
      // TIMEOUT PROTECTION: Limita tempo di attesa a 5 secondi per salvataggio
      const projectPromise = this.saveProjectOptimized(finalProjectData, originalRequest.userId);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000) // 5 secondi max per salvataggio
      );
      
      try {
        const projectResult = await Promise.race([projectPromise, timeoutPromise]);
        console.log('📊 [Advanced Engine] Risultato salvataggio progetto:', projectResult);
        result += projectResult;
      } catch (timeoutError) {
        console.warn('⚠️ [Advanced Engine] Timeout salvataggio progetto (5s), continuo senza salvataggio');
        // Continua senza bloccare l'OS
      }
      
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore Project Manager:', error);
    }

    // 🏗️ DESIGN CENTER SERVICE - DISABILITATO (CAUSA TIMEOUT)
    try {
      console.log('🏗️ [Advanced Engine] DESIGN CENTER DISABILITATO - CAUSA TIMEOUT');
      // Design Center causa timeout, disabilitato permanentemente
      
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore Design Center:', error);
    }

    // 📈 ANALISI DI SENSIBILITÀ AVANZATA
    result += this.generateSensitivityAnalysis(finalProjectData);
    
    // ⚠️ ANALISI DI RISCHIO AVANZATA
    result += this.generateRiskAnalysis(finalProjectData);
    
    // 🏪 ANALISI DI MERCATO
    result += this.generateMarketBenchmark(finalProjectData);
    
    // 💰 VALUTAZIONE INVESTIMENTO
    result += this.generateInvestmentValuation(finalProjectData);
    
    console.log('🔧 [Advanced Engine] TUTTI I TOOL attivati, risultato:', result.substring(0, 200) + '...');
    return result;
  }

  /**
   * 📊 GENERAZIONE ANALISI DI SENSIBILITÀ
   */
  private generateSensitivityAnalysis(projectData: any): string {
    const baseCost = projectData.costs.construction.subtotal;
    const totalCost = projectData.costs.land.purchasePrice + baseCost + projectData.costs.insurance;
    const requiredRevenue = totalCost / (1 - projectData.targetMargin / 100);
    
    return `## 📊 Analisi di Sensibilità

### 🔄 Scenari di Variazione
- **Scenario Pessimistico (-10%)**: Prezzo vendita €${(requiredRevenue * 0.9).toLocaleString()}/mq
- **Scenario Base**: Prezzo vendita €${(requiredRevenue / projectData.totalArea).toLocaleString()}/mq  
- **Scenario Ottimistico (+10%)**: Prezzo vendita €${(requiredRevenue * 1.1).toLocaleString()}/mq

### 📈 Sensibilità Parametri
- **Costo costruzione**: ±€100/mq = ±€${(projectData.totalArea * 100).toLocaleString()} impatto totale
- **Prezzo acquisto**: ±€10,000 = ±€${(10000 * (1 - projectData.targetMargin / 100)).toLocaleString()} impatto profitto
- **Target margine**: ±5% = ±€${(totalCost * 0.05).toLocaleString()} impatto profitto

### 💡 Raccomandazioni
- Monitora costi costruzione per mantenere profittabilità
- Valuta negoziazioni su prezzo acquisto
- Considera margini flessibili in base al mercato`;
  }

  /**
   * ⚠️ GENERAZIONE ANALISI DI RISCHIO
   */
  private generateRiskAnalysis(projectData: any): string {
    return `## ⚠️ Analisi di Rischio

### 🚨 Rischi Principali
- **Rischio Mercato**: Fluttuazioni prezzi immobiliari
- **Rischio Costruzione**: Aumenti costi materiali/manodopera
- **Rischio Normativo**: Cambiamenti regolamenti urbanistici
- **Rischio Finanziario**: Variazioni tassi interesse

### 📊 Valutazione Rischi
- **Probabilità**: Media-Alta per rischi mercato
- **Impatto**: Alto per rischi costruzione
- **Mitigazione**: Diversificazione, contratti fissi, assicurazioni

### 🛡️ Strategie di Mitigazione
- Contratti a prezzo fisso con costruttori
- Assicurazioni specifiche per il settore
- Analisi di mercato continua
- Fondo di emergenza del 10% del budget`;
  }

  /**
   * 📈 GENERAZIONE BENCHMARK DI MERCATO
   */
  private generateMarketBenchmark(projectData: any): string {
    return `## 📈 Benchmark di Mercato

### 🏘️ Analisi Zona
- **Prezzo medio mq**: €3,500-4,500 (stima zona Roma)
- **Tempo vendita medio**: 6-12 mesi
- **Domanda**: Media-Alta per residenziale

### 📊 Confronto Progetto
- **Prezzo target**: €${(projectData.costs.land.purchasePrice / projectData.totalArea).toLocaleString()}/mq
- **Posizionamento**: ${(projectData.costs.land.purchasePrice / projectData.totalArea) < 3000 ? 'Sotto mercato' : 'In linea con mercato'}
- **Competitività**: ${(projectData.costs.land.purchasePrice / projectData.totalArea) < 3500 ? 'Alta' : 'Media'}

### 🎯 Raccomandazioni
- Verifica prezzi recenti nella zona specifica
- Analizza progetti simili completati
- Considera tendenze di mercato locali`;
  }

  /**
   * 💰 GENERAZIONE VALUTAZIONE INVESTIMENTO
   */
  private generateInvestmentValuation(projectData: any): string {
    const baseCost = projectData.costs.construction.subtotal;
    const totalCost = projectData.costs.land.purchasePrice + baseCost + projectData.costs.insurance;
    const requiredRevenue = totalCost / (1 - projectData.targetMargin / 100);
    const profit = requiredRevenue - totalCost;
    const roi = (profit / totalCost) * 100;
    
    return `## 💰 Valutazione Investimento

### 📊 Metriche Finanziarie
- **ROI Atteso**: ${roi.toFixed(1)}%
- **Profitto Netto**: €${profit.toLocaleString()}
- **Investimento Totale**: €${totalCost.toLocaleString()}
- **Valore Progetto**: €${requiredRevenue.toLocaleString()}

### 🎯 Valutazione Opportunità
- **Rating**: ${roi > 30 ? 'Eccellente' : roi > 20 ? 'Buona' : roi > 15 ? 'Accettabile' : 'Rischiosa'}
- **Raccomandazione**: ${roi > 25 ? 'Procedi' : roi > 15 ? 'Valuta attentamente' : 'Rivedi parametri'}

### 📈 Proiezioni
- **Break-even**: Vendita a €${(totalCost / projectData.totalArea).toLocaleString()}/mq
- **Target profitto**: Vendita a €${(requiredRevenue / projectData.totalArea).toLocaleString()}/mq`;
  }

  /**
   * 🏗️ GENERAZIONE CREAZIONE PROGETTO
   */
  private generateProjectCreation(projectData: any): string {
    return `## 🏗️ Progetto Creato

### 📋 Dettagli Progetto
- **Nome**: ${projectData.name}
- **Indirizzo**: ${projectData.address}
- **Area**: ${projectData.totalArea}mq
- **Costo costruzione**: €${projectData.costs.construction.subtotal.toLocaleString()}
- **Prezzo acquisto**: €${projectData.costs.land.purchasePrice.toLocaleString()}
- **Target margine**: ${projectData.targetMargin.toFixed(1)}%

### 🚀 Prossimi Passi
1. Verifica permessi urbanistici
2. Ottieni preventivi costruttori
3. Analizza mercato locale
4. Definisci timeline progetto
5. Valuta opzioni finanziamento

### 💡 Suggerimenti
- Usa Design Center per concept progettuali
- Attiva Market Intelligence per analisi zona
- Considera analisi di sensibilità per ottimizzazione`;
  }

  /**
   * 🎨 GENERAZIONE DESIGN CENTER
   */
  private generateDesignCenter(projectData: any): string {
    return `## 🎨 Design Center

### 🏠 Concept Progettuale
- **Tipologia**: Residenziale
- **Superficie**: ${projectData.totalArea}mq
- **Layout ottimale**: Residenziale con spazi comuni

### 🎯 Obiettivi Design
- Massimizzare valore immobiliare
- Ottimizzare distribuzione spazi
- Garantire comfort abitativo
- Rispettare normative locali

### 🛠️ Strumenti Disponibili
- Generazione layout automatici
- Rendering 3D
- Calcoli energetici
- Analisi costi per tipologia

### 💡 Raccomandazioni
- Considera orientamento ottimale
- Valuta spazi esterni
- Ottimizza distribuzione interna
- Studia soluzioni innovative`;
  }

  /**
   * 🔧 GENERAZIONE ANALISI GENERICA
   */
  private generateGenericAnalysis(projectData: any, tool: string): string {
    return `## 🔧 Analisi ${tool}

### 📊 Dati Progetto
- **Nome**: ${projectData.name}
- **Area**: ${projectData.totalArea}mq
- **Costo**: €${projectData.costs.construction.subtotal.toLocaleString()}
- **Investimento**: €${projectData.costs.land.purchasePrice.toLocaleString()}

### 💡 Informazioni
Tool specifico per ${tool} in fase di sviluppo. Contattaci per maggiori dettagli.`;
  }

  /**
   * 📊 GENERAZIONE ANALISI DI FATTIBILITÀ
   */
  private generateFeasibilityAnalysis(projectData: any): string {
    const baseCost = projectData.costs.construction.subtotal;
    const totalCost = projectData.costs.land.purchasePrice + baseCost + projectData.costs.insurance;
    const requiredRevenue = totalCost / (1 - projectData.targetMargin / 100);
    const profit = requiredRevenue - totalCost;
    const pricePerSqm = requiredRevenue / projectData.totalArea;

    return `## 📊 Analisi di Fattibilità Completa

### 💰 Analisi Economica
- **Costo terreno**: €${projectData.costs.land.purchasePrice.toLocaleString()}
- **Costo costruzione**: €${baseCost.toLocaleString()} (${projectData.totalArea}mq)
- **Assicurazioni**: €${projectData.costs.insurance.toLocaleString()}
- **Costo totale**: €${totalCost.toLocaleString()}

### 🎯 Obiettivi di Profitto
- **Target margine**: ${projectData.targetMargin.toFixed(1)}%
- **Profitto necessario**: €${profit.toLocaleString()}
- **Ricavo totale richiesto**: €${requiredRevenue.toLocaleString()}

### 💡 Prezzo di Vendita
- **Prezzo al mq necessario**: €${pricePerSqm.toLocaleString()}/mq
- **ROI previsto**: ${((profit / totalCost) * 100).toFixed(1)}%

### ✅ Raccomandazioni
${pricePerSqm > 4000 ? 
  "⚠️ Il prezzo richiesto è elevato. Verifica la competitività nel mercato locale." :
  "✅ Il prezzo sembra ragionevole per il mercato romano."}

Vuoi che approfondisca qualche aspetto specifico o generi un'analisi di sensibilità?`;
  }

  /**
   * 🚀 GENERAZIONE PROSSIMI PASSI PROATTIVI
   */
  private generateProactiveNextSteps(intent: UserIntent, context: any): string[] {
    const steps = [];
    
    if (intent.toolsRequired.includes('feasibility_analysis')) {
      steps.push("Analisi di sensibilità sui parametri chiave");
      steps.push("Ricerca prezzi di mercato nella zona");
      steps.push("Valutazione rischi del progetto");
    }
    
    steps.push("Ottimizzazione del piano finanziario");
    steps.push("Analisi competitiva del mercato");
    
    return steps;
  }

  /**
   * 📝 FORMATTAZIONE PROSSIMI PASSI
   */
  private formatNextSteps(steps: string[]): string {
    if (steps.length === 0) return '';
    
    let result = '\n\n### 🚀 Prossimi Passi Consigliati\n';
    steps.forEach((step, index) => {
      result += `${index + 1}. ${step}\n`;
    });
    
    result += '\nDimmi quale aspetto vorresti approfondire!';
    return result;
  }

  /**
   * 📊 CALCOLO LIVELLO EMPATIA
   */
  private calculateEmpathyLevel(intent: UserIntent): number {
    const baseLine = 70;
    
    if (intent.dataExtracted.userSentiment === 'angry') return 95;
    if (intent.dataExtracted.userSentiment === 'frustrated') return 85;
    if (intent.dataExtracted.userSentiment === 'confused') return 80;
    
    return baseLine;
  }

  /**
   * 🎭 ADATTAMENTO STATO EMOTIVO
   */
  private adaptEmotionalState(intent: UserIntent): void {
    switch (intent.dataExtracted.userSentiment) {
      case 'angry':
        this.currentState.emotion = 'empathetic';
        break;
      case 'frustrated':
        this.currentState.emotion = 'problem_solving';
        break;
      case 'confused':
        this.currentState.emotion = 'encouraging';
        break;
      default:
        this.currentState.emotion = 'professional';
    }
  }

  /**
   * 📊 CALCOLO COMPLESSITÀ
   */
  private calculateComplexity(intents: any, dataExtracted: any): 'simple' | 'medium' | 'complex' | 'expert' {
    const dataPoints = Object.keys(dataExtracted).filter(k => dataExtracted[k]).length;
    const intentComplexity = intents.secondary.length;
    
    if (dataPoints >= 5 && intentComplexity >= 2) return 'expert';
    if (dataPoints >= 3 && intentComplexity >= 1) return 'complex';
    if (dataPoints >= 2) return 'medium';
    return 'simple';
  }

  /**
   * ⚡ CALCOLO URGENZA
   */
  private calculateUrgency(sentiment: string, intents: any): 'low' | 'medium' | 'high' | 'critical' {
    if (sentiment === 'angry') return 'critical';
    if (sentiment === 'frustrated') return 'high';
    if (intents.confidence > 0.8) return 'high';
    if (intents.confidence > 0.5) return 'medium';
    return 'low';
  }

  /**
   * 💬 GENERAZIONE RISPOSTA CONVERSAZIONALE
   */
  private generateConversationalResponse(intent: UserIntent, context: any): string {
    return "Ti aiuto volentieri! Per fornirti un'analisi precisa, ho bisogno di alcuni dati specifici del tuo progetto. Puoi condividere dettagli come superficie del terreno, costi di costruzione, prezzo di acquisto e obiettivi di marginalità?";
  }

  /**
   * 🗂️ ATTIVAZIONE TOOL CONSULTAZIONE PROGETTI
   */
  private async activateConsultationTool(intent: UserIntent, context: any, originalRequest: any): Promise<string> {
    try {
      console.log('🗂️ [Advanced Engine] Attivando tool consultazione progetti...');
      
      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { getDocs, query, orderBy, limit } = await import('firebase/firestore');
      const { safeCollection } = await import('@/lib/firebaseUtils');
      
      // Query per ottenere i progetti di fattibilità
      const projectsQuery = query(
        safeCollection('feasibilityProjects'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      console.log('🗂️ [Advanced Engine] Eseguendo query progetti...');
      const snapshot = await getDocs(projectsQuery);
      
      if (snapshot.empty) {
        return `\n\n## 📋 I Tuoi Progetti di Fattibilità\n\n❌ **Nessun progetto trovato**\n\nNon hai ancora creato progetti di fattibilità. Puoi crearne uno nuovo chiedendomi di fare un'analisi di fattibilità!\n\n*Esempio: "Aiutami a fare uno studio di fattibilità per un terreno di 1000mq a Milano"*`;
      }
      
      let result = `\n\n## 📋 I Tuoi Progetti di Fattibilità\n\n✅ **Trovati ${snapshot.size} progetti**\n\n`;
      
      snapshot.forEach((doc: any) => {
        const project = doc.data();
        const createdAt = project.createdAt?.toDate?.() || new Date(project.createdAt);
        
        result += `### ${snapshot.docs.indexOf(doc) + 1}. ${project.name}\n`;
        result += `- **ID**: ${doc.id}\n`;
        result += `- **Indirizzo**: ${project.address}\n`;
        result += `- **Area**: ${project.totalArea} mq\n`;
        result += `- **Stato**: ${project.status}\n`;
        result += `- **ROI**: ${project.results?.roi?.toFixed(2)}%\n`;
        result += `- **Creato**: ${createdAt.toLocaleDateString('it-IT')}\n`;
        result += `- **Fattibile**: ${project.isTargetAchieved ? '✅ Sì' : '❌ No'}\n\n`;
      });
      
      result += `\n💡 **Suggerimenti:**\n`;
      result += `- Puoi chiedermi di modificare un progetto specifico\n`;
      result += `- Puoi creare un nuovo progetto di fattibilità\n`;
      result += `- Puoi confrontare progetti diversi\n\n`;
      
      console.log('✅ [Advanced Engine] Consultazione progetti completata');
      return result;
      
    } catch (error) {
      console.error('❌ [Advanced Engine] Errore consultazione progetti:', error);
      return `\n\n## 📋 I Tuoi Progetti di Fattibilità\n\n❌ **Errore nel caricamento dei progetti**\n\nSi è verificato un errore tecnico. Riprova più tardi o contatta il supporto tecnico.\n\n*Errore: ${(error as Error).message}*`;
    }
  }
}
