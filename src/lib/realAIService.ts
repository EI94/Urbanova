// Servizio AI Reale per Analisi Terreni - Urbanova AI
import OpenAI from 'openai';

export interface LandAnalysis {
  aiScore: number;
  investmentPotential: number;
  riskAssessment: string;
  marketTrends: string;
  recommendations: string[];
  opportunities: string[];
  warnings: string[];
  estimatedROI: number;
  timeToMarket: string;
  competitiveAdvantage: string;
}

export interface ScrapedLand {
  id: string;
  title: string;
  location: string;
  price: number;
  pricePerSqm: number;
  area: number;
  zoning: string;
  buildingRights: string;
  infrastructure: string[];
  description: string;
  coordinates: [number, number];
  source: string;
  url: string;
  dateScraped: Date;
  aiScore: number;
  features: string[];
  images?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    agent?: string;
  };
}

export class RealAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeLand(land: ScrapedLand, marketContext?: any): Promise<LandAnalysis> {
    try {
      console.log(`🤖 [RealAIService] Analisi AI per terreno: ${land.title}`);

      const prompt = this.buildAnalysisPrompt(land, marketContext);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Sei un esperto analista immobiliare specializzato in valutazione di terreni edificabili. 
            Analizza ogni terreno considerando: prezzo, localizzazione, potenziale di sviluppo, rischi, 
            opportunità di investimento e trend di mercato. Fornisci analisi dettagliate e raccomandazioni concrete.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
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

  async analyzeMarketTrends(location: string): Promise<string> {
    try {
      const prompt = `Analizza i trend di mercato immobiliare per la zona: ${location}. 
      Considera: prezzi medi, domanda, offerta, sviluppi urbanistici recenti, 
      progetti futuri e potenziale di crescita. Fornisci un'analisi sintetica ma completa.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sei un esperto di mercato immobiliare italiano. Fornisci analisi accurate e aggiornate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      });

      return completion.choices[0].message.content || 'Analisi trend non disponibile';

    } catch (error) {
      console.error('❌ Errore analisi trend:', error);
      return 'Analisi trend non disponibile';
    }
  }

  async generateInvestmentRecommendations(lands: ScrapedLand[]): Promise<string[]> {
    try {
      const landsSummary = lands.map(land => 
        `${land.title} - ${land.location} - €${land.price.toLocaleString()} - ${land.area}m²`
      ).join('\n');

      const prompt = `Analizza questi terreni e fornisci 5 raccomandazioni di investimento specifiche:
      
      ${landsSummary}
      
      Considera: diversificazione, rischio/rendimento, timing, strategie di sviluppo.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sei un consulente di investimenti immobiliari. Fornisci raccomandazioni concrete e actionable."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content || '';
      return this.parseRecommendations(response);

    } catch (error) {
      console.error('❌ Errore raccomandazioni:', error);
      return [
        'Diversifica il portfolio tra diverse zone',
        'Valuta terreni con permessi edificabilità',
        'Considera il potenziale di rivalutazione',
        'Analizza la domanda di mercato locale',
        'Verifica la sostenibilità finanziaria'
      ];
    }
  }

  async calculateAdvancedAIScore(land: ScrapedLand, analysis: LandAnalysis): Promise<number> {
    try {
      const prompt = `Calcola un punteggio AI avanzato (0-100) per questo terreno:
      
      Terreno: ${land.title}
      Prezzo: €${land.price.toLocaleString()}
      Area: ${land.area}m²
      Prezzo/m²: €${land.pricePerSqm}
      Localizzazione: ${land.location}
      Analisi: ${JSON.stringify(analysis)}
      
      Considera: prezzo competitivo, localizzazione, potenziale sviluppo, rischi, 
      infrastrutture, trend di mercato. Fornisci solo il numero.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sei un sistema di scoring immobiliare. Rispondi solo con un numero da 0 a 100."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 10
      });

      const score = parseInt(completion.choices[0].message.content || '70');
      return Math.max(0, Math.min(100, score));

    } catch (error) {
      console.error('❌ Errore calcolo AI score:', error);
      return this.calculateBasicAIScore(land);
    }
  }

  private buildAnalysisPrompt(land: ScrapedLand, marketContext?: any): string {
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

  private parseAIResponse(response: string): LandAnalysis {
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

  private parseManualResponse(response: string): LandAnalysis {
    const analysis: LandAnalysis = {
      aiScore: 70,
      investmentPotential: 70,
      riskAssessment: 'Medio',
      marketTrends: 'Stabile',
      recommendations: [],
      opportunities: [],
      warnings: [],
      estimatedROI: 8,
      timeToMarket: '12-18 mesi',
      competitiveAdvantage: 'Prezzo competitivo'
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

  private parseRecommendations(response: string): string[] {
    const recommendations: string[] = [];
    
    // Estrai raccomandazioni dalla risposta
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.trim().length > 10 && (line.includes('.') || line.includes(':'))) {
        recommendations.push(line.trim());
      }
    }

    return recommendations.slice(0, 5);
  }

  private calculateBasicAIScore(land: ScrapedLand): number {
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

  private fallbackAnalysis(land: ScrapedLand): LandAnalysis {
    return {
      aiScore: this.calculateBasicAIScore(land),
      investmentPotential: 75,
      riskAssessment: 'Medio',
      marketTrends: 'Analisi trend non disponibile',
      recommendations: [
        'Verifica i permessi edificabilità',
        'Analizza la domanda di mercato locale',
        'Considera i costi di urbanizzazione'
      ],
      opportunities: [
        'Potenziale di rivalutazione',
        'Possibilità di sviluppo residenziale'
      ],
      warnings: [
        'Verificare conformità urbanistica',
        'Controllare vincoli ambientali'
      ],
      estimatedROI: 8,
      timeToMarket: '12-18 mesi',
      competitiveAdvantage: 'Prezzo competitivo'
    };
  }

  // Verifica configurazione AI
  async verifyAIConfig(): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: "Test configurazione OpenAI"
          }
        ],
        max_tokens: 10
      });

      console.log('✅ Configurazione AI verificata');
      return true;
    } catch (error) {
      console.error('❌ Errore verifica AI config:', error);
      return false;
    }
  }
}

// Istanza singleton
export const realAIService = new RealAIService(); 