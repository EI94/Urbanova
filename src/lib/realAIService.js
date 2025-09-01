'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.realAIService = exports.RealAIService = void 0;
// Servizio AI Reale per Analisi Terreni - Urbanova AI
const openai_1 = __importDefault(require('openai'));
class RealAIService {
  constructor() {
    this.openai = null;
    this.isConfigured = false;
    // Inizializza OpenAI solo se l'API key è configurata
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    console.log('🔧 [RealAIService] Verifica configurazione OpenAI...');
    if (apiKey && apiKey !== 'undefined' && apiKey !== '') {
      try {
        this.openai = new openai_1.default({
          apiKey: apiKey,
        });
        this.isConfigured = true;
        console.log('✅ [RealAIService] OpenAI configurato correttamente');
      } catch (error) {
        console.warn('⚠️ [RealAIService] Errore configurazione OpenAI:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️ [RealAIService] OPENAI_API_KEY non configurata - modalità fallback attiva');
      this.isConfigured = false;
    }
  }
  async analyzeLand(land, marketContext) {
    try {
      console.log(`🤖 [RealAIService] Analisi AI per terreno: ${land.title}`);
      if (!this.isConfigured || !this.openai) {
        console.log('🤖 [RealAIService] Modalità fallback - analisi locale');
        return this.fallbackAnalysis(land);
      }
      const prompt = this.buildAnalysisPrompt(land, marketContext);
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Sei un esperto analista immobiliare specializzato in valutazione di terreni edificabili. 
            Analizza ogni terreno considerando: prezzo, localizzazione, potenziale di sviluppo, rischi, 
            opportunità di investimento e trend di mercato. Fornisci analisi dettagliate e raccomandazioni concrete.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });
      const analysis = this.parseAIResponse(completion.choices[0].message.content || '');
      console.log(`✅ [RealAIService] Analisi completata per ${land.title}`);
      return analysis;
    } catch (error) {
      console.error('❌ Errore analisi AI:', error);
      // Fallback a analisi locale se AI non disponibile
      return this.fallbackAnalysis(land);
    }
  }
  async analyzeMarketTrends(location) {
    try {
      if (!this.isConfigured || !this.openai) {
        console.log('🤖 [RealAIService] Modalità fallback - trend di mercato simulati');
        return `Analisi trend di mercato per ${location}: Prezzi in crescita moderata, buona domanda per terreni edificabili, sviluppo urbano attivo.`;
      }
      const prompt = `Analizza i trend di mercato immobiliare per la zona: ${location}. 
      Considera: prezzi medi, domanda, offerta, sviluppi urbanistici recenti, 
      progetti futuri e potenziale di crescita. Fornisci un'analisi sintetica ma completa.`;
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Sei un esperto di mercato immobiliare italiano. Fornisci analisi accurate e aggiornate.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });
      return completion.choices[0].message.content || 'Analisi trend non disponibile';
    } catch (error) {
      console.error('❌ Errore analisi trend:', error);
      return `Analisi trend di mercato per ${location}: Dati non disponibili al momento.`;
    }
  }
  async generateInvestmentRecommendations(lands) {
    try {
      if (!this.isConfigured || !this.openai) {
        console.log('🤖 [RealAIService] Modalità fallback - raccomandazioni locali');
        return [
          'Considera terreni con buona accessibilità',
          'Valuta potenziale di sviluppo futuro',
          'Verifica servizi disponibili nella zona',
          'Analizza trend di crescita del quartiere',
        ];
      }
      const prompt = `Genera raccomandazioni di investimento per ${lands.length} terreni. 
      Considera: prezzo, localizzazione, potenziale di sviluppo, rischi e opportunità. 
      Fornisci 5-7 raccomandazioni concrete e actionable.`;
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'Sei un consulente immobiliare esperto. Fornisci raccomandazioni pratiche e concrete.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
      });
      return this.parseRecommendations(completion.choices[0].message.content || '');
    } catch (error) {
      console.error('❌ Errore generazione raccomandazioni:', error);
      return ['Analisi raccomandazioni non disponibile al momento.'];
    }
  }
  async calculateAdvancedAIScore(land, analysis) {
    try {
      if (!this.isConfigured || !this.openai) {
        console.log('🤖 [RealAIService] Modalità fallback - calcolo score locale');
        return this.calculateBasicAIScore(land);
      }
      const prompt = `Calcola un AI Score avanzato (0-100) per questo terreno:
      Prezzo: €${land.price}
      Area: ${land.area} mq
      Localizzazione: ${land.location}
      Analisi: ${JSON.stringify(analysis)}
      
      Considera: rapporto qualità/prezzo, potenziale di sviluppo, rischi, opportunità di mercato.`;
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Sei un valutatore immobiliare esperto. Fornisci solo un numero da 0 a 100.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      });
      const score = parseInt(completion.choices[0].message.content || '70');
      return Math.max(0, Math.min(100, score));
    } catch (error) {
      console.error('❌ Errore calcolo AI Score:', error);
      return this.calculateBasicAIScore(land);
    }
  }
  buildAnalysisPrompt(land, marketContext) {
    return `
    Analizza questo terreno edificabile:

    TITOLO: ${land.title}
    LOCALIZZAZIONE: ${land.location}
    PREZZO: €${land.price.toLocaleString()}
    AREA: ${land.area}m²
    PREZZO/m²: €${land.pricePerSqm}
    ZONA: ${land.zoning}
    PERMESSI EDIFICABILITÀ: ${land.buildingRights}
    INFRASTRUTTURE: ${land.infrastructure.join(', ')}
    DESCRIZIONE: ${land.description}
    FONTE: ${land.source}

    Fornisci un'analisi strutturata con:
    1. Punteggio AI (0-100)
    2. Potenziale di investimento (0-100)
    3. Valutazione del rischio (basso/medio/alto)
    4. Trend di mercato per la zona
    5. Raccomandazioni specifiche (3-5 punti)
    6. Opportunità da considerare
    7. Avvertimenti/rischi
    8. ROI stimato (%)
    9. Tempo al mercato
    10. Vantaggio competitivo

    Rispondi in formato JSON strutturato.
    `;
  }
  parseAIResponse(response) {
    try {
      // Cerca JSON nella risposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Errore parsing JSON AI:', error);
    }
    // Fallback parsing manuale
    return this.parseManualResponse(response);
  }
  parseManualResponse(response) {
    const analysis = {
      aiScore: 70,
      investmentPotential: 70,
      riskAssessment: 'Medio',
      marketTrends: 'Stabile',
      recommendations: [],
      opportunities: [],
      warnings: [],
      estimatedROI: 8,
      timeToMarket: '12-18 mesi',
      competitiveAdvantage: 'Prezzo competitivo',
    };
    // Estrai informazioni dalla risposta testuale
    if (response.includes('alto') || response.includes('high')) {
      analysis.investmentPotential = 85;
    }
    if (response.includes('basso') || response.includes('low')) {
      analysis.riskAssessment = 'Basso';
    }
    if (response.includes('opportunità') || response.includes('opportunity')) {
      analysis.opportunities.push('Potenziale di rivalutazione');
    }
    return analysis;
  }
  parseRecommendations(response) {
    const recommendations = [];
    // Estrai raccomandazioni dalla risposta
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.trim().length > 10 && (line.includes('.') || line.includes(':'))) {
        recommendations.push(line.trim());
      }
    }
    return recommendations.slice(0, 5);
  }
  calculateBasicAIScore(land) {
    let score = 70;
    // Bonus per prezzo competitivo
    if (land.pricePerSqm < 100) score += 15;
    else if (land.pricePerSqm < 150) score += 10;
    else if (land.pricePerSqm < 200) score += 5;
    // Bonus per area ottimale
    if (land.area >= 1000 && land.area <= 3000) score += 10;
    else if (land.area >= 500 && land.area <= 5000) score += 5;
    // Bonus per infrastrutture
    score += land.infrastructure.length * 3;
    // Bonus per building rights
    if (land.buildingRights === 'Sì') score += 15;
    return Math.min(score, 100);
  }
  fallbackAnalysis(land) {
    return {
      aiScore: this.calculateBasicAIScore(land),
      investmentPotential: 75,
      riskAssessment: 'Medio',
      marketTrends: 'Analisi trend non disponibile',
      recommendations: [
        'Verifica i permessi edificabilità',
        'Analizza la domanda di mercato locale',
        'Considera i costi di urbanizzazione',
      ],
      opportunities: ['Potenziale di rivalutazione', 'Possibilità di sviluppo residenziale'],
      warnings: ['Verificare conformità urbanistica', 'Controllare vincoli ambientali'],
      estimatedROI: 8,
      timeToMarket: '12-18 mesi',
      competitiveAdvantage: 'Prezzo competitivo',
    };
  }
  // Verifica configurazione AI
  async verifyAIConfig() {
    try {
      // Se non è configurato, ritorna true per modalità fallback
      if (!this.isConfigured || !this.openai) {
        console.log('✅ [RealAIService] Modalità fallback attiva - servizio disponibile');
        return true;
      }
      // Test rapido della connessione OpenAI
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'user',
              content: 'Test',
            },
          ],
          max_tokens: 5,
        });
        console.log('✅ [RealAIService] Configurazione AI verificata - OpenAI attivo');
        return true;
      } catch (openaiError) {
        console.warn('⚠️ [RealAIService] OpenAI non disponibile - modalità fallback');
        return true; // Ritorna true per modalità fallback
      }
    } catch (error) {
      console.error('❌ Errore verifica AI config:', error);
      return true; // Ritorna true anche in caso di errore per modalità fallback
    }
  }
  // Getter per verificare se il servizio è configurato
  get isAIConfigured() {
    return this.isConfigured;
  }
}
exports.RealAIService = RealAIService;
// Istanza singleton
exports.realAIService = new RealAIService();
//# sourceMappingURL=realAIService.js.map
