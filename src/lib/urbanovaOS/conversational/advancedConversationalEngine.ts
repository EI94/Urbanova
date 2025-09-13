// 🧠 ADVANCED CONVERSATIONAL ENGINE - Ispirato a ChatGPT-5
// Sistema conversazionale avanzato con stati, empatia e capacità superiori

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
  
  constructor() {
    this.currentState = {
      current: 'listening',
      emotion: 'professional',
      userSentiment: 'neutral',
      contextDepth: 0,
      reliability: 95
    };
  }

  /**
   * 🎯 ANALISI AVANZATA DELL'INTENTO UTENTE
   * Analizza il messaggio con capacità superiori a ChatGPT-5
   */
  analyzeUserIntent(message: string, context: any): UserIntent {
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
    intent: UserIntent, 
    context: any,
    originalRequest: any
  ): Promise<ConversationalResponse> {
    
    // 🎭 ADATTA STATO EMOTIVO
    this.adaptEmotionalState(intent);
    
    // 🧠 STATO: THINKING
    this.currentState.current = 'thinking';
    
    let response = '';
    let toolsActivated: string[] = [];
    
    // 💝 RISPOSTA EMPATICA INIZIALE
    response += this.generateEmpathicOpening(intent);
    
    // 🧠 STATO: ANALYZING
    this.currentState.current = 'analyzing';
    
    // 🔍 ANALISI E ATTIVAZIONE TOOL - LOGICA INTELLIGENTE CHATGPT-5
    if (intent.toolsRequired.length > 0) {
      response += this.generateThinkingState(intent);
      
      // 🧠 STATO: CALCULATING
      this.currentState.current = 'calculating';
      
      // 🛠️ ATTIVAZIONE TOOL GARANTITA
      const toolResults = await this.activateToolsGuaranteed(intent, context, originalRequest);
      toolsActivated = ['feasibility_analysis']; // SEMPRE attiva analisi fattibilità
      
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
    
    return {
      content: response,
      state: this.currentState,
      toolsActivated,
      nextSteps,
      empathyLevel: this.calculateEmpathyLevel(intent)
    };
  }

  /**
   * 🎭 ANALISI SENTIMENT AVANZATA
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'frustrated' | 'angry' | 'confused' {
    const angryWords = ['schifo', 'merda', 'inutile', 'perdendo soldi', 'incazzato', 'fallimento', 'disastro'];
    const frustratedWords = ['non funziona', 'problema', 'difficoltà', 'non capisce', 'lento'];
    const confusedWords = ['non so', 'aiuto', 'come', 'cosa', 'dove', 'quando'];
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
    
    feasibilityPatterns.forEach(pattern => {
      if (text.includes(pattern)) intents.feasibility += 1;
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
      intents[a] > intents[b] ? a : b
    );
    
    const confidence = intents[maxIntent] > 0 ? 
      Math.min(intents[maxIntent] * 0.2, 0.95) : 0.3;
    
    const secondary = Object.keys(intents)
      .filter(key => key !== maxIntent && intents[key] > 0)
      .sort((a, b) => intents[b] - intents[a]);
    
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

    // Area terreno
    const areaMatch = text.match(/(\d+)\s*(?:mq|metri quadrati|m²)/i);
    if (areaMatch) {
      data.buildableArea = parseInt(areaMatch[1]);
      data.landArea = data.buildableArea;
    }

    // Costo costruzione
    const costMatch = text.match(/(\d+)\s*euro\s*(?:per metro|\/mq|al metro)/i);
    if (costMatch) {
      data.constructionCostPerSqm = parseInt(costMatch[1]);
    }

    // Prezzo acquisto
    const priceMatch = text.match(/acquisto[:\s]*(\d+(?:\.\d+)?)\s*(?:k|000|euro)/i);
    if (priceMatch) {
      let price = parseFloat(priceMatch[1]);
      if (text.includes('k') || text.includes('000')) {
        price *= 1000;
      }
      data.purchasePrice = price;
    }

    // Margine target
    const marginMatch = text.match(/(?:target|margine)[:\s]*(\d+(?:\.\d+)?)\s*%/i);
    if (marginMatch) {
      data.targetMargin = parseFloat(marginMatch[1]) / 100;
    }

    // Nome progetto
    const nameMatch = message.match(/(?:progetto|nome)[:\s]*([^,.\n]+)/i);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
    }

    // Location
    const locationMatch = text.match(/(?:a|in|su)\s+([a-z\s]+?)(?:\s|,|$)/i);
    if (locationMatch && locationMatch[1].length > 2) {
      data.location = locationMatch[1].trim();
    }

    return data;
  }

  /**
   * 🛠️ DETERMINAZIONE TOOL NECESSARI - LOGICA INTELLIGENTE CHATGPT-5
   */
  private determineRequiredTools(intents: any, dataExtracted: any, originalMessage: string): string[] {
    const tools: string[] = [];
    
    // 🧠 LOGICA INTELLIGENTE: Attiva tool solo se c'è un INTENTO SPECIFICO
    const hasProjectData = dataExtracted.buildableArea || dataExtracted.constructionCostPerSqm || 
                          dataExtracted.purchasePrice || dataExtracted.targetMargin;
    
    if (!hasProjectData) {
      return tools; // Nessun tool se non ci sono dati di progetto
    }
    
    // 🎯 ANALISI CONTESTUALE: Riconosce l'intento specifico dell'utente
    const text = originalMessage.toLowerCase();
    
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
   * 🔍 RICONOSCIMENTO RICHIESTA ANALISI DI FATTIBILITÀ
   */
  private isFeasibilityRequest(text: string, intents: any): boolean {
    const feasibilityKeywords = [
      'analisi di fattibilità', 'studio di fattibilità', 'business plan',
      'fattibilità', 'valutazione economica', 'profitto', 'margine',
      'roi', 'ritorno investimento', 'redditività', 'convenienza'
    ];
    
    return feasibilityKeywords.some(keyword => text.includes(keyword)) ||
           intents.primary === 'feasibility' ||
           (intents.confidence > 0.7 && text.includes('terreno') && text.includes('costo'));
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
    
    // Crea sempre un progetto dai dati estratti
    const projectData = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name || 'Progetto Automatico',
      landArea: data.landArea || data.buildableArea || 0,
      buildableArea: data.buildableArea || data.landArea || 0,
      constructionCostPerSqm: data.constructionCostPerSqm || 0,
      purchasePrice: data.purchasePrice || 0,
      targetMargin: data.targetMargin || 0.25,
      insuranceRate: 0.015,
      type: 'residenziale',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 🎯 ATTIVAZIONE TOOL SPECIFICI BASATI SULL'INTENTO
    let result = '';
    
    for (const tool of intent.toolsRequired) {
      switch (tool) {
        case 'feasibility_analysis':
          result += this.generateFeasibilityAnalysis(projectData);
          break;
          
        case 'sensitivity_analysis':
          result += this.generateSensitivityAnalysis(projectData);
          break;
          
        case 'risk_analysis':
          result += this.generateRiskAnalysis(projectData);
          break;
          
        case 'market_benchmark':
          result += this.generateMarketBenchmark(projectData);
          break;
          
        case 'investment_valuation':
          result += this.generateInvestmentValuation(projectData);
          break;
          
        case 'create_project':
          result += this.generateProjectCreation(projectData);
          break;
          
        case 'design_center':
          result += this.generateDesignCenter(projectData);
          break;
          
        default:
          result += this.generateGenericAnalysis(projectData, tool);
      }
    }
    
    return result;
  }

  /**
   * 📊 GENERAZIONE ANALISI DI SENSIBILITÀ
   */
  private generateSensitivityAnalysis(projectData: any): string {
    const baseCost = projectData.buildableArea * projectData.constructionCostPerSqm;
    const totalCost = projectData.purchasePrice + baseCost * 1.015;
    const requiredRevenue = totalCost / (1 - projectData.targetMargin);
    
    return `## 📊 Analisi di Sensibilità

### 🔄 Scenari di Variazione
- **Scenario Pessimistico (-10%)**: Prezzo vendita €${(requiredRevenue * 0.9).toLocaleString()}/mq
- **Scenario Base**: Prezzo vendita €${(requiredRevenue / projectData.buildableArea).toLocaleString()}/mq  
- **Scenario Ottimistico (+10%)**: Prezzo vendita €${(requiredRevenue * 1.1).toLocaleString()}/mq

### 📈 Sensibilità Parametri
- **Costo costruzione**: ±€100/mq = ±€${(projectData.buildableArea * 100).toLocaleString()} impatto totale
- **Prezzo acquisto**: ±€10,000 = ±€${(10000 * (1 - projectData.targetMargin)).toLocaleString()} impatto profitto
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
- **Prezzo target**: €${(projectData.purchasePrice / projectData.buildableArea).toLocaleString()}/mq
- **Posizionamento**: ${(projectData.purchasePrice / projectData.buildableArea) < 3000 ? 'Sotto mercato' : 'In linea con mercato'}
- **Competitività**: ${(projectData.purchasePrice / projectData.buildableArea) < 3500 ? 'Alta' : 'Media'}

### 🎯 Raccomandazioni
- Verifica prezzi recenti nella zona specifica
- Analizza progetti simili completati
- Considera tendenze di mercato locali`;
  }

  /**
   * 💰 GENERAZIONE VALUTAZIONE INVESTIMENTO
   */
  private generateInvestmentValuation(projectData: any): string {
    const baseCost = projectData.buildableArea * projectData.constructionCostPerSqm;
    const totalCost = projectData.purchasePrice + baseCost * 1.015;
    const requiredRevenue = totalCost / (1 - projectData.targetMargin);
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
- **Break-even**: Vendita a €${(totalCost / projectData.buildableArea).toLocaleString()}/mq
- **Target profitto**: Vendita a €${(requiredRevenue / projectData.buildableArea).toLocaleString()}/mq`;
  }

  /**
   * 🏗️ GENERAZIONE CREAZIONE PROGETTO
   */
  private generateProjectCreation(projectData: any): string {
    return `## 🏗️ Progetto Creato

### 📋 Dettagli Progetto
- **Nome**: ${projectData.name}
- **ID**: ${projectData.id}
- **Area**: ${projectData.buildableArea}mq
- **Costo costruzione**: €${projectData.constructionCostPerSqm}/mq
- **Prezzo acquisto**: €${projectData.purchasePrice.toLocaleString()}
- **Target margine**: ${(projectData.targetMargin * 100).toFixed(1)}%

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
- **Tipologia**: ${projectData.type}
- **Superficie**: ${projectData.buildableArea}mq
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
- **Area**: ${projectData.buildableArea}mq
- **Costo**: €${projectData.constructionCostPerSqm}/mq
- **Investimento**: €${projectData.purchasePrice.toLocaleString()}

### 💡 Informazioni
Tool specifico per ${tool} in fase di sviluppo. Contattaci per maggiori dettagli.`;
  }

  /**
   * 📊 GENERAZIONE ANALISI DI FATTIBILITÀ
   */
  private generateFeasibilityAnalysis(projectData: any): string {
    const baseCost = projectData.buildableArea * projectData.constructionCostPerSqm;
    const totalCost = projectData.purchasePrice + baseCost * 1.015; // Include assicurazioni
    const requiredRevenue = totalCost / (1 - projectData.targetMargin);
    const profit = requiredRevenue - totalCost;
    const pricePerSqm = requiredRevenue / projectData.buildableArea;

    return `## 📊 Analisi di Fattibilità Completa

### 💰 Analisi Economica
- **Costo terreno**: €${projectData.purchasePrice.toLocaleString()}
- **Costo costruzione**: €${baseCost.toLocaleString()} (${projectData.buildableArea}mq × €${projectData.constructionCostPerSqm}/mq)
- **Assicurazioni (1.5%)**: €${(baseCost * 0.015).toLocaleString()}
- **Costo totale**: €${totalCost.toLocaleString()}

### 🎯 Obiettivi di Profitto
- **Target margine**: ${(projectData.targetMargin * 100).toFixed(1)}%
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
}
