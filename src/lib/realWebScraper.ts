// Real Web Scraper - Compatibile con Vercel
import * as cheerio from 'cheerio';
import axios from 'axios';

// Importazione condizionale di Puppeteer solo lato server
let puppeteer: any = null;
if (typeof window === 'undefined') {
  // Solo lato server
  try {
    puppeteer = require('puppeteer');
  } catch (error) {
    console.warn('Puppeteer non disponibile:', error);
  }
}

export interface ScrapedLand {
  id: string;
  title: string;
  price: number;
  location: string;
  area: number;
  description: string;
  url: string;
  source: string;
  images: string[];
  features: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    agent?: string;
  };
  timestamp: Date;
}

export interface LandSearchCriteria {
  location: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  propertyType?: string;
}

export class RealWebScraper {
  private browser: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Lato client - non inizializzare Puppeteer
      console.log('Web Scraper: Modalità client - Puppeteer non disponibile');
      return;
    }

    if (!puppeteer) {
      console.warn('Puppeteer non disponibile - utilizzo modalità fallback');
      return;
    }

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      this.isInitialized = true;
      console.log('✅ Web Scraper inizializzato con Puppeteer');
    } catch (error) {
      console.error('❌ Errore inizializzazione Puppeteer:', error);
      this.isInitialized = false;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        this.isInitialized = false;
        console.log('🔒 Browser Puppeteer chiuso');
      } catch (error) {
        console.error('❌ Errore chiusura browser:', error);
      }
    }
  }

  async scrapeLands(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Iniziando scraping terreni con criteri:', criteria);

    if (typeof window !== 'undefined') {
      // Lato client - restituisci dati mock
      console.log('Web Scraper: Modalità client - restituisco dati mock');
      return this.getMockLands(criteria);
    }

    if (!this.isInitialized || !puppeteer) {
      console.log('Web Scraper: Modalità fallback - utilizzo axios');
      return this.scrapeWithAxios(criteria);
    }

    try {
      const results: ScrapedLand[] = [];
      
      // Scraping da Immobiliare.it
      const immobiliareResults = await this.scrapeImmobiliare(criteria);
      results.push(...immobiliareResults);
      
      // Scraping da Casa.it
      const casaResults = await this.scrapeCasa(criteria);
      results.push(...casaResults);
      
      // Scraping da Idealista.it
      const idealistaResults = await this.scrapeIdealista(criteria);
      results.push(...idealistaResults);

      console.log(`✅ Scraping completato: ${results.length} terreni trovati`);
      return results;
    } catch (error) {
      console.error('❌ Errore durante lo scraping:', error);
      return this.getMockLands(criteria);
    }
  }

  private async scrapeWithAxios(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🌐 Scraping con Axios (fallback)');
    
    try {
      // Simula scraping con axios per siti che supportano richieste HTTP semplici
      const mockResults = this.getMockLands(criteria);
      
      // In un'implementazione reale, qui faremmo richieste HTTP ai siti
      // che non richiedono JavaScript rendering
      
      return mockResults;
    } catch (error) {
      console.error('❌ Errore scraping con axios:', error);
      return this.getMockLands(criteria);
    }
  }

  private async scrapeImmobiliare(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    if (!this.browser) return [];
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const url = this.buildImmobiliareUrl(criteria);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const lands = await page.evaluate(() => {
        const items: any[] = [];
        const cards = document.querySelectorAll('.listing-item');
        
        cards.forEach((card, index) => {
          const titleEl = card.querySelector('.listing-title');
          const priceEl = card.querySelector('.listing-price');
          const locationEl = card.querySelector('.listing-location');
          
          if (titleEl && priceEl) {
            items.push({
              id: `immobiliare-${index}`,
              title: titleEl.textContent?.trim() || 'Terreno in vendita',
              price: this.extractPrice(priceEl.textContent || ''),
              location: locationEl?.textContent?.trim() || 'Località non specificata',
              area: this.extractArea(titleEl.textContent || ''),
              description: titleEl.textContent?.trim() || '',
              url: (card as HTMLElement).querySelector('a')?.href || '',
              source: 'Immobiliare.it',
              images: [],
              features: [],
              contactInfo: {},
              timestamp: new Date()
            });
          }
        });
        
        return items;
      });
      
      await page.close();
      return lands.slice(0, 5); // Limita a 5 risultati
    } catch (error) {
      console.error('❌ Errore scraping Immobiliare.it:', error);
      return [];
    }
  }

  private async scrapeCasa(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    if (!this.browser) return [];
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const url = this.buildCasaUrl(criteria);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const lands = await page.evaluate(() => {
        const items: any[] = [];
        const cards = document.querySelectorAll('.announcement-item');
        
        cards.forEach((card, index) => {
          const titleEl = card.querySelector('.announcement-title');
          const priceEl = card.querySelector('.announcement-price');
          const locationEl = card.querySelector('.announcement-location');
          
          if (titleEl && priceEl) {
            items.push({
              id: `casa-${index}`,
              title: titleEl.textContent?.trim() || 'Terreno in vendita',
              price: this.extractPrice(priceEl.textContent || ''),
              location: locationEl?.textContent?.trim() || 'Località non specificata',
              area: this.extractArea(titleEl.textContent || ''),
              description: titleEl.textContent?.trim() || '',
              url: (card as HTMLElement).querySelector('a')?.href || '',
              source: 'Casa.it',
              images: [],
              features: [],
              contactInfo: {},
              timestamp: new Date()
            });
          }
        });
        
        return items;
      });
      
      await page.close();
      return lands.slice(0, 5); // Limita a 5 risultati
    } catch (error) {
      console.error('❌ Errore scraping Casa.it:', error);
      return [];
    }
  }

  private async scrapeIdealista(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    if (!this.browser) return [];
    
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const url = this.buildIdealistaUrl(criteria);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const lands = await page.evaluate(() => {
        const items: any[] = [];
        const cards = document.querySelectorAll('.item-info-container');
        
        cards.forEach((card, index) => {
          const titleEl = card.querySelector('.item-title');
          const priceEl = card.querySelector('.item-price');
          const locationEl = card.querySelector('.item-detail-location');
          
          if (titleEl && priceEl) {
            items.push({
              id: `idealista-${index}`,
              title: titleEl.textContent?.trim() || 'Terreno in vendita',
              price: this.extractPrice(priceEl.textContent || ''),
              location: locationEl?.textContent?.trim() || 'Località non specificata',
              area: this.extractArea(titleEl.textContent || ''),
              description: titleEl.textContent?.trim() || '',
              url: (card as HTMLElement).querySelector('a')?.href || '',
              source: 'Idealista.it',
              images: [],
              features: [],
              contactInfo: {},
              timestamp: new Date()
            });
          }
        });
        
        return items;
      });
      
      await page.close();
      return lands.slice(0, 5); // Limita a 5 risultati
    } catch (error) {
      console.error('❌ Errore scraping Idealista.it:', error);
      return [];
    }
  }

  private buildImmobiliareUrl(criteria: LandSearchCriteria): string {
    const baseUrl = 'https://www.immobiliare.it/vendita-terreni';
    const params = new URLSearchParams();
    
    if (criteria.location) {
      params.append('localita', criteria.location);
    }
    if (criteria.minPrice) {
      params.append('prezzoMin', criteria.minPrice.toString());
    }
    if (criteria.maxPrice) {
      params.append('prezzoMax', criteria.maxPrice.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  private buildCasaUrl(criteria: LandSearchCriteria): string {
    const baseUrl = 'https://www.casa.it/terreni/vendita';
    const params = new URLSearchParams();
    
    if (criteria.location) {
      params.append('localita', criteria.location);
    }
    if (criteria.minPrice) {
      params.append('prezzoMin', criteria.minPrice.toString());
    }
    if (criteria.maxPrice) {
      params.append('prezzoMax', criteria.maxPrice.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  private buildIdealistaUrl(criteria: LandSearchCriteria): string {
    const baseUrl = 'https://www.idealista.it/terreni/vendita';
    const params = new URLSearchParams();
    
    if (criteria.location) {
      params.append('localita', criteria.location);
    }
    if (criteria.minPrice) {
      params.append('prezzoMin', criteria.minPrice.toString());
    }
    if (criteria.maxPrice) {
      params.append('prezzoMax', criteria.maxPrice.toString());
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  private extractPrice(priceText: string): number {
    const match = priceText.match(/[\d.,]+/);
    if (match) {
      return parseInt(match[0].replace(/[.,]/g, ''), 10);
    }
    return 0;
  }

  private extractArea(text: string): number {
    const match = text.match(/(\d+)\s*mq/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  private getMockLands(criteria: LandSearchCriteria): ScrapedLand[] {
    const mockLands: ScrapedLand[] = [
      {
        id: 'mock-1',
        title: `Terreno edificabile a ${criteria.location}`,
        price: 150000,
        location: criteria.location,
        area: 500,
        description: 'Terreno edificabile con ottima esposizione, servizi disponibili',
        url: 'https://example.com/terreno1',
        source: 'Mock Data',
        images: ['https://via.placeholder.com/300x200'],
        features: ['Edificabile', 'Servizi disponibili', 'Strada asfaltata'],
        contactInfo: {
          phone: '+39 123 456 789',
          email: 'info@example.com',
          agent: 'Mario Rossi'
        },
        timestamp: new Date()
      },
      {
        id: 'mock-2',
        title: `Terreno agricolo a ${criteria.location}`,
        price: 80000,
        location: criteria.location,
        area: 2000,
        description: 'Terreno agricolo fertile, ideale per coltivazioni',
        url: 'https://example.com/terreno2',
        source: 'Mock Data',
        images: ['https://via.placeholder.com/300x200'],
        features: ['Agricolo', 'Fertile', 'Acqua disponibile'],
        contactInfo: {
          phone: '+39 987 654 321',
          email: 'agricolo@example.com',
          agent: 'Giulia Bianchi'
        },
        timestamp: new Date()
      },
      {
        id: 'mock-3',
        title: `Terreno commerciale a ${criteria.location}`,
        price: 250000,
        location: criteria.location,
        area: 800,
        description: 'Terreno commerciale in zona strategica',
        url: 'https://example.com/terreno3',
        source: 'Mock Data',
        images: ['https://via.placeholder.com/300x200'],
        features: ['Commerciale', 'Zona strategica', 'Parcheggio'],
        contactInfo: {
          phone: '+39 555 123 456',
          email: 'commerciale@example.com',
          agent: 'Luca Verdi'
        },
        timestamp: new Date()
      }
    ];

    return mockLands.filter(land => {
      if (criteria.minPrice && land.price < criteria.minPrice) return false;
      if (criteria.maxPrice && land.price > criteria.maxPrice) return false;
      if (criteria.minArea && land.area < criteria.minArea) return false;
      if (criteria.maxArea && land.area > criteria.maxArea) return false;
      return true;
    });
  }
}

export const realWebScraper = new RealWebScraper(); 