// Web Scraping Reale per Terreni - Urbanova AI
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

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

export interface LandSearchCriteria {
  location?: string;
  priceRange?: [number, number];
  areaRange?: [number, number];
  zoning?: string[];
  buildingRights?: boolean;
  infrastructure?: string[];
  keywords?: string[];
}

export class RealWebScraper {
  private browser: puppeteer.Browser | null = null;

  async initialize(): Promise<void> {
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
      console.log('✅ Browser Puppeteer inizializzato');
    } catch (error) {
      console.error('❌ Errore inizializzazione browser:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeLands(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log(`🔍 [RealWebScraper] Avvio scraping con criteri:`, criteria);
    
    const allLands: ScrapedLand[] = [];
    const sources = [
      { name: 'immobiliare.it', scraper: this.scrapeImmobiliareIt.bind(this) },
      { name: 'casa.it', scraper: this.scrapeCasaIt.bind(this) },
      { name: 'idealista.it', scraper: this.scrapeIdealistaIt.bind(this) }
    ];

    for (const source of sources) {
      try {
        console.log(`📡 Scraping da ${source.name}...`);
        const sourceLands = await source.scraper(criteria);
        allLands.push(...sourceLands);
        console.log(`✅ Trovati ${sourceLands.length} terreni da ${source.name}`);
      } catch (error) {
        console.error(`❌ Errore scraping da ${source.name}:`, error);
      }
    }

    // Filtra e ordina risultati
    const filteredLands = this.filterAndScoreLands(allLands, criteria);
    console.log(`🎯 Scraping completato: ${filteredLands.length} terreni validi`);
    
    return filteredLands;
  }

  private async scrapeImmobiliareIt(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const lands: ScrapedLand[] = [];
    
    try {
      const page = await this.browser!.newPage();
      
      // Costruisci URL di ricerca
      const searchUrl = this.buildImmobiliareItUrl(criteria);
      console.log(`🔗 URL ricerca: ${searchUrl}`);
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Aspetta caricamento risultati
      await page.waitForSelector('.listing-item', { timeout: 10000 });
      
      const landElements = await page.$$('.listing-item');
      
      for (let i = 0; i < Math.min(landElements.length, 10); i++) {
        try {
          const land = await this.extractLandFromImmobiliareIt(landElements[i]);
          if (land) {
            lands.push(land);
          }
        } catch (error) {
          console.error(`Errore estrazione terreno ${i}:`, error);
        }
      }
      
      await page.close();
    } catch (error) {
      console.error('Errore scraping immobiliare.it:', error);
    }
    
    return lands;
  }

  private async scrapeCasaIt(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const lands: ScrapedLand[] = [];
    
    try {
      const page = await this.browser!.newPage();
      
      const searchUrl = this.buildCasaItUrl(criteria);
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      await page.waitForSelector('.announcement-item', { timeout: 10000 });
      
      const landElements = await page.$$('.announcement-item');
      
      for (let i = 0; i < Math.min(landElements.length, 10); i++) {
        try {
          const land = await this.extractLandFromCasaIt(landElements[i]);
          if (land) {
            lands.push(land);
          }
        } catch (error) {
          console.error(`Errore estrazione terreno ${i}:`, error);
        }
      }
      
      await page.close();
    } catch (error) {
      console.error('Errore scraping casa.it:', error);
    }
    
    return lands;
  }

  private async scrapeIdealistaIt(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const lands: ScrapedLand[] = [];
    
    try {
      const page = await this.browser!.newPage();
      
      const searchUrl = this.buildIdealistaItUrl(criteria);
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      await page.waitForSelector('.item-info-container', { timeout: 10000 });
      
      const landElements = await page.$$('.item-info-container');
      
      for (let i = 0; i < Math.min(landElements.length, 10); i++) {
        try {
          const land = await this.extractLandFromIdealistaIt(landElements[i]);
          if (land) {
            lands.push(land);
          }
        } catch (error) {
          console.error(`Errore estrazione terreno ${i}:`, error);
        }
      }
      
      await page.close();
    } catch (error) {
      console.error('Errore scraping idealista.it:', error);
    }
    
    return lands;
  }

  private buildImmobiliareItUrl(criteria: LandSearchCriteria): string {
    let url = 'https://www.immobiliare.it/terreni/';
    
    if (criteria.location) {
      url += `${criteria.location.toLowerCase().replace(/\s+/g, '-')}/`;
    }
    
    const params = new URLSearchParams();
    
    if (criteria.priceRange) {
      params.append('prezzoMin', criteria.priceRange[0].toString());
      params.append('prezzoMax', criteria.priceRange[1].toString());
    }
    
    if (criteria.areaRange) {
      params.append('superficieMin', criteria.areaRange[0].toString());
      params.append('superficieMax', criteria.areaRange[1].toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  private buildCasaItUrl(criteria: LandSearchCriteria): string {
    let url = 'https://www.casa.it/terreni/';
    
    if (criteria.location) {
      url += `${criteria.location.toLowerCase().replace(/\s+/g, '-')}/`;
    }
    
    const params = new URLSearchParams();
    
    if (criteria.priceRange) {
      params.append('prezzo-min', criteria.priceRange[0].toString());
      params.append('prezzo-max', criteria.priceRange[1].toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  private buildIdealistaItUrl(criteria: LandSearchCriteria): string {
    let url = 'https://www.idealista.it/terreni/';
    
    if (criteria.location) {
      url += `${criteria.location.toLowerCase().replace(/\s+/g, '-')}/`;
    }
    
    const params = new URLSearchParams();
    
    if (criteria.priceRange) {
      params.append('precio-desde', criteria.priceRange[0].toString());
      params.append('precio-hasta', criteria.priceRange[1].toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return url;
  }

  private async extractLandFromImmobiliareIt(element: puppeteer.ElementHandle): Promise<ScrapedLand | null> {
    try {
      const title = await element.$eval('.listing-title', el => el.textContent?.trim()) || '';
      const price = await element.$eval('.listing-price', el => {
        const text = el.textContent?.trim() || '';
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
      });
      const location = await element.$eval('.listing-location', el => el.textContent?.trim()) || '';
      const area = await element.$eval('.listing-area', el => {
        const text = el.textContent?.trim() || '';
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
      });
      const url = await element.$eval('a', el => el.getAttribute('href')) || '';

      if (!title || !price || !location) return null;

      const pricePerSqm = area > 0 ? Math.round(price / area) : 0;

      return {
        id: `immobiliare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        location,
        price,
        pricePerSqm,
        area,
        zoning: 'Da verificare',
        buildingRights: 'Da verificare',
        infrastructure: [],
        description: title,
        coordinates: [0, 0], // Da geocoding
        source: 'immobiliare.it',
        url: url.startsWith('http') ? url : `https://www.immobiliare.it${url}`,
        dateScraped: new Date(),
        aiScore: this.calculateAIScore({ price, area, pricePerSqm }),
        features: [],
        contactInfo: {}
      };
    } catch (error) {
      console.error('Errore estrazione terreno immobiliare.it:', error);
      return null;
    }
  }

  private async extractLandFromCasaIt(element: puppeteer.ElementHandle): Promise<ScrapedLand | null> {
    try {
      const title = await element.$eval('.announcement-title', el => el.textContent?.trim()) || '';
      const price = await element.$eval('.announcement-price', el => {
        const text = el.textContent?.trim() || '';
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
      });
      const location = await element.$eval('.announcement-location', el => el.textContent?.trim()) || '';
      const area = await element.$eval('.announcement-area', el => {
        const text = el.textContent?.trim() || '';
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
      });
      const url = await element.$eval('a', el => el.getAttribute('href')) || '';

      if (!title || !price || !location) return null;

      const pricePerSqm = area > 0 ? Math.round(price / area) : 0;

      return {
        id: `casa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        location,
        price,
        pricePerSqm,
        area,
        zoning: 'Da verificare',
        buildingRights: 'Da verificare',
        infrastructure: [],
        description: title,
        coordinates: [0, 0],
        source: 'casa.it',
        url: url.startsWith('http') ? url : `https://www.casa.it${url}`,
        dateScraped: new Date(),
        aiScore: this.calculateAIScore({ price, area, pricePerSqm }),
        features: [],
        contactInfo: {}
      };
    } catch (error) {
      console.error('Errore estrazione terreno casa.it:', error);
      return null;
    }
  }

  private async extractLandFromIdealistaIt(element: puppeteer.ElementHandle): Promise<ScrapedLand | null> {
    try {
      const title = await element.$eval('.item-title', el => el.textContent?.trim()) || '';
      const price = await element.$eval('.item-price', el => {
        const text = el.textContent?.trim() || '';
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
      });
      const location = await element.$eval('.item-location', el => el.textContent?.trim()) || '';
      const area = await element.$eval('.item-area', el => {
        const text = el.textContent?.trim() || '';
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
      });
      const url = await element.$eval('a', el => el.getAttribute('href')) || '';

      if (!title || !price || !location) return null;

      const pricePerSqm = area > 0 ? Math.round(price / area) : 0;

      return {
        id: `idealista_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        location,
        price,
        pricePerSqm,
        area,
        zoning: 'Da verificare',
        buildingRights: 'Da verificare',
        infrastructure: [],
        description: title,
        coordinates: [0, 0],
        source: 'idealista.it',
        url: url.startsWith('http') ? url : `https://www.idealista.it${url}`,
        dateScraped: new Date(),
        aiScore: this.calculateAIScore({ price, area, pricePerSqm }),
        features: [],
        contactInfo: {}
      };
    } catch (error) {
      console.error('Errore estrazione terreno idealista.it:', error);
      return null;
    }
  }

  private calculateAIScore(land: { price: number; area: number; pricePerSqm: number }): number {
    let score = 70;

    // Bonus per prezzo competitivo
    if (land.pricePerSqm < 100) score += 15;
    else if (land.pricePerSqm < 150) score += 10;
    else if (land.pricePerSqm < 200) score += 5;

    // Bonus per area ottimale
    if (land.area >= 1000 && land.area <= 3000) score += 10;
    else if (land.area >= 500 && land.area <= 5000) score += 5;

    return Math.min(score, 100);
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

    // Ordina per AI Score decrescente
    return filtered.sort((a, b) => b.aiScore - a.aiScore);
  }
}

// Istanza singleton
export const realWebScraper = new RealWebScraper(); 