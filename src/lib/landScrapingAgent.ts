// Agente per Web Scraping di Terreni e Notifiche Email
export interface LandSearchCriteria {
  location?: string;
  priceRange?: [number, number];
  areaRange?: [number, number];
  zoning?: string[];
  buildingRights?: boolean;
  infrastructure?: string[];
  keywords?: string[];
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

export interface EmailNotification {
  to: string;
  subject: string;
  htmlContent: string;
  lands: ScrapedLand[];
  summary: {
    totalFound: number;
    averagePrice: number;
    bestOpportunities: ScrapedLand[];
  };
}

export class LandScrapingAgent {
  private name: string;
  private version: string;
  private sources: string[];
  private emailService: EmailService;

  constructor() {
    this.name = "AI Land Scraper";
    this.version = "1.0";
    this.sources = [
      'immobiliare.it',
      'casa.it', 
      'idealista.it',
      'subito.it',
      'bakeca.it',
      'agenziaentrate.gov.it'
    ];
    this.emailService = new EmailService();
  }

  async scrapeLands(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log(`🔍 [${this.name}] Avvio scraping terreni con criteri:`, criteria);
    
    // Simula scraping da multiple fonti
    const allLands: ScrapedLand[] = [];
    
    for (const source of this.sources) {
      try {
        const sourceLands = await this.scrapeFromSource(source, criteria);
        allLands.push(...sourceLands);
        console.log(`✅ [${this.name}] Trovati ${sourceLands.length} terreni da ${source}`);
      } catch (error) {
        console.error(`❌ [${this.name}] Errore scraping da ${source}:`, error);
      }
    }

    // Filtra e ordina per AI Score
    const filteredLands = this.filterAndScoreLands(allLands, criteria);
    
    console.log(`🎯 [${this.name}] Scraping completato: ${filteredLands.length} terreni validi`);
    return filteredLands;
  }

  private async scrapeFromSource(source: string, criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    // Simula delay di scraping
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const mockLands: ScrapedLand[] = [];
    const numLands = Math.floor(Math.random() * 8) + 3; // 3-10 terreni per fonte
    
    for (let i = 0; i < numLands; i++) {
      mockLands.push(this.generateMockLand(source, criteria));
    }
    
    return mockLands;
  }

  private generateMockLand(source: string, criteria: LandSearchCriteria): ScrapedLand {
    const locations = ['Milano', 'Roma', 'Torino', 'Napoli', 'Firenze', 'Bologna', 'Genova'];
    const zonings = ['Residenziale', 'Commerciale', 'Industriale', 'Agricolo', 'Misto'];
    const infrastructures = ['Strada asfaltata', 'Energia elettrica', 'Acqua', 'Gas', 'Fognature', 'Internet'];
    
    const location = criteria.location || locations[Math.floor(Math.random() * locations.length)];
    const area = Math.floor(Math.random() * 5000) + 500; // 500-5500 mq
    const pricePerSqm = Math.floor(Math.random() * 200) + 50; // 50-250 €/mq
    const price = area * pricePerSqm;
    const zoning = zonings[Math.floor(Math.random() * zonings.length)];
    
    return {
      id: `land_${source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Terreno edificabile ${location} - ${area}m²`,
      location: `${location}, Italia`,
      price,
      pricePerSqm,
      area,
      zoning,
      buildingRights: Math.random() > 0.3 ? 'Sì' : 'Da verificare',
      infrastructure: infrastructures.slice(0, Math.floor(Math.random() * 4) + 2),
      description: `Terreno edificabile di ${area}m² a ${location}. Zona ${zoning.toLowerCase()}. Prezzo competitivo di €${pricePerSqm}/m².`,
      coordinates: [
        41.9028 + (Math.random() - 0.5) * 0.1, // Latitudine approssimativa Italia
        12.4964 + (Math.random() - 0.5) * 0.1  // Longitudine approssimativa Italia
      ],
      source,
      url: `https://${source}/terreno-${Math.random().toString(36).substr(2, 9)}`,
      dateScraped: new Date(),
      aiScore: Math.floor(Math.random() * 40) + 60, // 60-100
      features: [
        'Piano regolatore favorevole',
        'Trasporti pubblici vicini',
        'Servizi essenziali disponibili',
        'Potenziale di rivalutazione'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      contactInfo: {
        phone: `+39 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        email: `agente@${source}.it`,
        agent: `Agente ${Math.random().toString(36).substr(2, 6)}`
      }
    };
  }

  private filterAndScoreLands(lands: ScrapedLand[], criteria: LandSearchCriteria): ScrapedLand[] {
    let filtered = lands;

    // Filtra per prezzo
    if (criteria.priceRange) {
      filtered = filtered.filter(land => 
        land.price >= criteria.priceRange![0] && land.price <= criteria.priceRange![1]
      );
    }

    // Filtra per area
    if (criteria.areaRange) {
      filtered = filtered.filter(land => 
        land.area >= criteria.areaRange![0] && land.area <= criteria.areaRange![1]
      );
    }

    // Filtra per localizzazione
    if (criteria.location) {
      filtered = filtered.filter(land => 
        land.location.toLowerCase().includes(criteria.location!.toLowerCase())
      );
    }

    // Calcola AI Score migliorato
    filtered = filtered.map(land => ({
      ...land,
      aiScore: this.calculateAIScore(land, criteria)
    }));

    // Ordina per AI Score decrescente
    return filtered.sort((a, b) => b.aiScore - a.aiScore);
  }

  private calculateAIScore(land: ScrapedLand, criteria: LandSearchCriteria): number {
    let score = 70; // Base score

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

    // Bonus per localizzazione
    if (criteria.location && land.location.toLowerCase().includes(criteria.location.toLowerCase())) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  async sendEmailNotification(email: string, lands: ScrapedLand[], criteria: LandSearchCriteria): Promise<void> {
    console.log(`📧 [${this.name}] Invio notifica email a ${email}`);
    
    const bestLands = lands.slice(0, 5); // Top 5 opportunità
    const summary = {
      totalFound: lands.length,
      averagePrice: Math.round(lands.reduce((sum, land) => sum + land.price, 0) / lands.length),
      bestOpportunities: bestLands
    };

    const notification: EmailNotification = {
      to: email,
      subject: `🏗️ ${lands.length} Nuove Opportunità Terreni - Urbanova AI`,
      htmlContent: this.generateEmailHTML(lands, summary, criteria),
      lands,
      summary
    };

    await this.emailService.sendEmail(notification);
    console.log(`✅ [${this.name}] Email inviata con successo`);
  }

  private generateEmailHTML(lands: ScrapedLand[], summary: any, criteria: LandSearchCriteria): string {
    const bestLandsHTML = summary.bestOpportunities.map((land: ScrapedLand) => `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${land.title}</h3>
        <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">📍 ${land.location}</p>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #059669; font-weight: bold; font-size: 16px;">€${land.price.toLocaleString()}</span>
          <span style="color: #6b7280; font-size: 14px;">${land.area}m² • €${land.pricePerSqm}/m²</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            AI Score: ${land.aiScore}/100
          </span>
          <a href="${land.url}" style="background: #3b82f6; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px;">
            Vedi Dettagli
          </a>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuove Opportunità Terreni - Urbanova AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">🏗️ Urbanova AI</h1>
          <p style="color: white; text-align: center; margin: 10px 0 0 0; font-size: 16px;">
            Scopri le migliori opportunità immobiliari
          </p>
        </div>

        <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937;">📊 Riepilogo Ricerca</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${summary.totalFound}</div>
              <div style="font-size: 14px; color: #6b7280;">Terreni Trovati</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">€${summary.averagePrice.toLocaleString()}</div>
              <div style="font-size: 14px; color: #6b7280;">Prezzo Medio</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">${criteria.location || 'Italia'}</div>
              <div style="font-size: 14px; color: #6b7280;">Zona Ricerca</div>
            </div>
          </div>
        </div>

        <h2 style="margin: 0 0 16px 0; color: #1f2937;">🏆 Migliori Opportunità</h2>
        ${bestLandsHTML}

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #92400e;">💡 Prossimi Passi</h3>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li>Analizza la fattibilità economica di ogni opportunità</li>
            <li>Verifica i permessi edificabilità e la conformità urbanistica</li>
            <li>Contatta gli agenti per visite e sopralluoghi</li>
            <li>Utilizza l'AI di Urbanova per analisi approfondite</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questa email è stata generata automaticamente da Urbanova AI<br>
            <a href="http://localhost:3112/dashboard" style="color: #3b82f6;">Accedi al Dashboard</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  async runAutomatedSearch(criteria: LandSearchCriteria, email: string): Promise<void> {
    console.log(`🤖 [${this.name}] Avvio ricerca automatizzata per ${email}`);
    
    try {
      // 1. Scraping terreni
      const lands = await this.scrapeLands(criteria);
      
      if (lands.length === 0) {
        console.log(`⚠️ [${this.name}] Nessun terreno trovato con i criteri specificati`);
        return;
      }

      // 2. Invia email con risultati
      await this.sendEmailNotification(email, lands, criteria);
      
      // 3. Salva risultati nel database (per future analisi)
      await this.saveSearchResults(lands, criteria, email);
      
      console.log(`✅ [${this.name}] Ricerca automatizzata completata con successo`);
    } catch (error) {
      console.error(`❌ [${this.name}] Errore nella ricerca automatizzata:`, error);
      throw error;
    }
  }

  private async saveSearchResults(lands: ScrapedLand[], criteria: LandSearchCriteria, email: string): Promise<void> {
    // Simula salvataggio nel database
    console.log(`💾 [${this.name}] Salvataggio ${lands.length} risultati nel database`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Servizio Email (Mock)
class EmailService {
  async sendEmail(notification: EmailNotification): Promise<void> {
    // Simula invio email
    console.log(`📧 [EmailService] Invio email a ${notification.to}`);
    console.log(`📧 [EmailService] Oggetto: ${notification.subject}`);
    console.log(`📧 [EmailService] Contenuto: ${notification.htmlContent.substring(0, 100)}...`);
    
    // Simula delay di invio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ [EmailService] Email inviata con successo`);
  }
}

// Factory per creare l'agente
export class LandScrapingAgentFactory {
  static createAgent(): LandScrapingAgent {
    return new LandScrapingAgent();
  }
} 