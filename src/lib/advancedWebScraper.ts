// Web Scraper Avanzato per Bypassare DataDome - Urbanova AI
import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedLand, LandSearchCriteria } from '@/types/land';
import { advancedLocationService, LocationZone } from './advancedLocationService';

export class AdvancedWebScraper {
  private sessionCookies: Map<string, string> = new Map();
  private userAgentPool: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/121.0 Firefox/121.0'
  ];

  // Headers ultra-realistici per bypassare DataDome
  private getUltraRealisticHeaders(domain: string): any {
    const userAgent = this.userAgentPool[Math.floor(Math.random() * this.userAgentPool.length)];
    const isMobile = userAgent.includes('Mobile') || userAgent.includes('iPhone') || userAgent.includes('iPad');
    
    const baseHeaders = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': isMobile ? '?1' : '?0',
      'sec-ch-ua-platform': isMobile ? '"Android"' : '"Windows"',
      'sec-ch-ua-arch': '"x86"',
      'sec-ch-ua-full-version-list': '"Not_A Brand";v="8.0.0.0", "Chromium";v="120.0.6099.109", "Google Chrome";v="120.0.6099.109"',
      'sec-ch-ua-model': '""',
      'sec-ch-device-memory': '"8"',
      'sec-ch-viewport-width': isMobile ? '"375"' : '"1920"',
      'sec-ch-viewport-height': isMobile ? '"667"' : '"1080"',
      'sec-ch-dpr': '"2"',
      'sec-ch-ua-bitness': '"64"',
      'sec-ch-ua-full-version': '"120.0.6099.109"',
      'sec-ch-ua-platform-version': '"15.0.0"',
      'sec-ch-ua-wow64': '?0'
    };

    // Headers specifici per dominio
    switch (domain) {
      case 'immobiliare.it':
        return {
          ...baseHeaders,
          'Referer': 'https://www.google.com/search?q=immobili+terreni+vendita+roma',
          'Origin': 'https://www.immobiliare.it',
          'Host': 'www.immobiliare.it'
        };
      case 'casa.it':
        return {
          ...baseHeaders,
          'Referer': 'https://www.google.com/search?q=casa+terreni+vendita+roma',
          'Origin': 'https://www.casa.it',
          'Host': 'www.casa.it'
        };
      case 'idealista.it':
        return {
          ...baseHeaders,
          'Referer': 'https://www.google.com/search?q=idealista+terreni+vendita+roma',
          'Origin': 'https://www.idealista.it',
          'Host': 'www.idealista.it'
        };
      default:
        return baseHeaders;
    }
  }

  // Strategia di bypass DataDome con sessioni multiple
  private async createSession(domain: string): Promise<string> {
    try {
      // Prima richiesta per ottenere cookies
      const sessionResponse = await axios.get(`https://www.${domain}`, {
        headers: this.getUltraRealisticHeaders(domain),
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });

      // Estrai cookies dalla risposta
      const cookies = sessionResponse.headers['set-cookie'];
      if (cookies) {
        const cookieString = cookies.map(cookie => cookie.split(';')[0]).join('; ');
        this.sessionCookies.set(domain, cookieString);
        return cookieString;
      }

      return '';
    } catch (error) {
      console.log(`⚠️ Errore creazione sessione per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      return '';
    }
  }

  // Richiesta con retry e rotazione strategie
  private async makeRequest(url: string, domain: string, maxRetries: number = 3): Promise<any> {
    const strategies = [
      () => this.strategySimple(url, domain),
      () => this.strategyWithSession(url, domain),
      () => this.strategyWithProxy(url, domain),
      () => this.strategyWithDelay(url, domain)
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const strategy of strategies) {
        try {
          console.log(`🔍 Tentativo ${attempt} con strategia ${strategies.indexOf(strategy) + 1} per ${domain}`);
          const result = await strategy();
          
          if (result && result.status === 200) {
            console.log(`✅ Strategia ${strategies.indexOf(strategy) + 1} riuscita per ${domain}`);
            return result;
          }
        } catch (error) {
          console.log(`❌ Strategia ${strategies.indexOf(strategy) + 1} fallita per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          
          // Se è un errore 403, cambia strategia
          if (error instanceof Error && error.message.includes('403')) {
            console.log(`🚫 ${domain} bloccato (403). Cambio strategia...`);
            continue;
          }
        }
      }

      // Delay tra i tentativi
      if (attempt < maxRetries) {
        const delay = Math.random() * 5000 + 2000; // 2-7 secondi
        console.log(`⏳ Attendo ${Math.round(delay)}ms prima del prossimo tentativo...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Tutti i tentativi falliti per ${domain}`);
  }

  // Strategia 1: Richiesta semplice
  private async strategySimple(url: string, domain: string): Promise<any> {
    return axios.get(url, {
      headers: this.getUltraRealisticHeaders(domain),
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
  }

  // Strategia 2: Con sessione
  private async strategyWithSession(url: string, domain: string): Promise<any> {
    let cookies = this.sessionCookies.get(domain);
    if (!cookies) {
      cookies = await this.createSession(domain);
    }

    const headers = {
      ...this.getUltraRealisticHeaders(domain),
      'Cookie': cookies
    };

    return axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
  }

  // Strategia 3: Con proxy (simulato)
  private async strategyWithProxy(url: string, domain: string): Promise<any> {
    // Simula l'uso di un proxy cambiando IP virtualmente
    const headers = {
      ...this.getUltraRealisticHeaders(domain),
      'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      'X-Real-IP': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };

    return axios.get(url, {
      headers,
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
  }

  // Strategia 4: Con delay realistico
  private async strategyWithDelay(url: string, domain: string): Promise<any> {
    // Simula comportamento umano con delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
    
    return axios.get(url, {
      headers: this.getUltraRealisticHeaders(domain),
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
  }

  // Scraping principale con localizzazione avanzata
  async scrapeLandsAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🚀 Avvio scraping AVANZATO con localizzazione intelligente...');
    
    const results: ScrapedLand[] = [];
    
    try {
      // Analizza la localizzazione e ottieni zone specifiche
      const locationResults = advancedLocationService.searchLocations(criteria.location);
      
      if (locationResults.length === 0) {
        console.log('⚠️ Nessuna zona specifica trovata, uso localizzazione generica');
        return await this.scrapeWithGenericLocation(criteria);
      }

      // Usa le prime 3 zone più rilevanti
      const topZones = locationResults.slice(0, 3);
      console.log(`🎯 Zone identificate: ${topZones.map(r => r.zone.name).join(', ')}`);

      // Scraping per ogni zona
      for (const locationResult of topZones) {
        const zone = locationResult.zone;
        console.log(`🔍 Scraping zona: ${zone.name} (${zone.type})`);
        
        const zoneCriteria = {
          ...criteria,
          location: zone.name
        };

        const zoneResults = await this.scrapeWithGenericLocation(zoneCriteria);
        results.push(...zoneResults);
        
        // Delay tra le zone
        if (locationResult !== topZones[topZones.length - 1]) {
          const delay = Math.random() * 3000 + 2000;
          console.log(`⏳ Attendo ${Math.round(delay)}ms prima della prossima zona...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      console.log(`✅ Scraping avanzato completato: ${results.length} terreni totali`);
      return results;

    } catch (error) {
      console.error('❌ Errore durante lo scraping avanzato:', error);
      return [];
    }
  }

  // Scraping con localizzazione generica (fallback)
  private async scrapeWithGenericLocation(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    // Fonti alternative che funzionano meglio
    const sources = [
      { name: 'Subito.it', scraper: () => this.scrapeSubitoAdvanced(criteria) },
      { name: 'Kijiji.it', scraper: () => this.scrapeKijijiAdvanced(criteria) },
      { name: 'Bakeca.it', scraper: () => this.scrapeBakecaAdvanced(criteria) },
      { name: 'Annunci.it', scraper: () => this.scrapeAnnunciAdvanced(criteria) },
      { name: 'Immobiliare.it', scraper: () => this.scrapeImmobiliareAdvanced(criteria) }
    ];

    for (const source of sources) {
      try {
        console.log(`🔍 Scraping ${source.name}...`);
        const sourceResults = await source.scraper();
        
        if (sourceResults.length > 0) {
          results.push(...sourceResults);
          console.log(`✅ ${source.name}: ${sourceResults.length} terreni trovati`);
        } else {
          console.log(`❌ ${source.name}: nessun risultato`);
        }
        
        // Delay tra le fonti
        if (source !== sources[sources.length - 1]) {
          const delay = Math.random() * 2000 + 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
      } catch (error) {
        console.error(`❌ Errore ${source.name}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      }
    }

    return results;
  }

  // Scraping avanzato per Subito.it
  private async scrapeSubitoAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.subito.it/immobili/terreni-e-aree-edificabili/${location}/vendita/`;
      
      console.log(`📡 Subito.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'subito.it');
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Subito.it
      const listings = $('[data-testid="item-card"], .item-card, .listing-item, .card, .item, article');
      
      console.log(`📊 Trovati ${listings.length} annunci su Subito.it`);
      
      listings.each((index, element) => {
        if (index >= 15) return; // Aumentato il limite
        
        const $el = $(element);
        
        // Estrazione dati migliorata
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Subito ${index + 1}`;
        const url = this.extractUrl($el, 'subito.it');
        
        if (price || area) {
          results.push({
            id: `subito_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'subito.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Subito.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Subito.it avanzato:', error);
      return [];
    }
  }

  // Scraping avanzato per Kijiji.it
  private async scrapeKijijiAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.kijiji.it/terreni/${location}/vendita/`;
      
      console.log(`📡 Kijiji.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'kijiji.it');
      const $ = cheerio.load(response.data);
      
      const listings = $('[data-testid="listing"], .listing, .item-card, .card, .item');
      
      console.log(`📊 Trovati ${listings.length} annunci su Kijiji.it`);
      
      listings.each((index, element) => {
        if (index >= 15) return;
        
        const $el = $(element);
        
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Kijiji ${index + 1}`;
        const url = this.extractUrl($el, 'kijiji.it');
        
        if (price || area) {
          results.push({
            id: `kijiji_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'kijiji.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Kijiji.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Kijiji.it avanzato:', error);
      return [];
    }
  }

  // Scraping avanzato per Bakeca.it
  private async scrapeBakecaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.bakeca.it/annunci/vendita/terreni/${location}/`;
      
      console.log(`📡 Bakeca.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'bakeca.it');
      const $ = cheerio.load(response.data);
      
      const listings = $('[data-testid="listing"], .listing, .item-card, .card, .item');
      
      console.log(`📊 Trovati ${listings.length} annunci su Bakeca.it`);
      
      listings.each((index, element) => {
        if (index >= 15) return;
        
        const $el = $(element);
        
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Bakeca ${index + 1}`;
        const url = this.extractUrl($el, 'bakeca.it');
        
        if (price || area) {
          results.push({
            id: `bakeca_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'bakeca.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Bakeca.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Bakeca.it avanzato:', error);
      return [];
    }
  }

  // Scraping avanzato per Annunci.it
  private async scrapeAnnunciAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.annunci.it/vendita/terreni/${location}/`;
      
      console.log(`📡 Annunci.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'annunci.it');
      const $ = cheerio.load(response.data);
      
      const listings = $('[data-testid="listing"], .listing, .item-card, .card, .item');
      
      console.log(`📊 Trovati ${listings.length} annunci su Annunci.it`);
      
      listings.each((index, element) => {
        if (index >= 15) return;
        
        const $el = $(element);
        
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Annunci ${index + 1}`;
        const url = this.extractUrl($el, 'annunci.it');
        
        if (price || area) {
          results.push({
            id: `annunci_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'annunci.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Annunci.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Annunci.it avanzato:', error);
      return [];
    }
  }

  // Scraping avanzato per Immobiliare.it (con strategie multiple)
  private async scrapeImmobiliareAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.immobiliare.it/vendita-terreni/${location}/`;
      
      console.log(`📡 Immobiliare.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'immobiliare.it');
      const $ = cheerio.load(response.data);
      
      // Selettori multipli per maggiore copertura
      const selectors = [
        '.styles_in-listingCard__aHT19',
        '.styles_in-listingCardProperty__C2t47',
        '.nd-mediaObject',
        '.in-card',
        '.in-realEstateList__item',
        'article',
        '.card',
        '.item',
        '[data-testid="listing"]'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`✅ Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato su Immobiliare.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 15) return;
        
        const $el = $(element);
        
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Immobiliare ${index + 1}`;
        const url = this.extractUrl($el, 'immobiliare.it');
        
        if (price || area) {
          results.push({
            id: `immobiliare_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'immobiliare.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Immobiliare.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Immobiliare.it avanzato:', error);
      return [];
    }
  }

  // Funzioni di estrazione dati migliorate
  private extractPrice($el: any): number | null {
    try {
      const priceSelectors = [
        '.price', '[class*="price"]', '.listing-price', '.property-price',
        '.in-price', '.nd-price', '.styles_in-price', '[data-testid="price"]',
        'span', '.amount', '.value'
      ];
      
      for (const selector of priceSelectors) {
        const priceEl = $el.find(selector);
        if (priceEl.length > 0) {
          priceEl.each((i: number, el: any) => {
            const text = $el.find(el).text().trim();
            if (text.includes('€') && /\d/.test(text)) {
              const match = text.match(/[\d.,]+/);
              if (match) {
                const price = parseFloat(match[0].replace(/[.,]/g, ''));
                return price > 1000 ? price : null;
              }
            }
          });
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private extractArea($el: any): number | null {
    try {
      const areaSelectors = [
        '.area', '[class*="area"]', '.listing-area', '.property-area',
        '.in-area', '.nd-area', '.styles_in-area', '[data-testid="area"]',
        'span', '.size', '.dimensions'
      ];
      
      for (const selector of areaSelectors) {
        const areaEl = $el.find(selector);
        if (areaEl.length > 0) {
          areaEl.each((i: number, el: any) => {
            const text = $el.find(el).text().trim();
            if ((text.includes('m²') || text.includes('mq')) && /\d/.test(text)) {
              const match = text.match(/[\d.,]+/);
              if (match) {
                const area = parseFloat(match[0].replace(/[.,]/g, ''));
                return area > 10 ? area : null;
              }
            }
          });
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private extractTitle($el: any): string | null {
    try {
      const titleSelectors = [
        'h2', 'h3', '.title', '[class*="title"]', '.in-title', '.nd-title',
        '[data-testid="title"]', '.name', '.heading'
      ];
      
      for (const selector of titleSelectors) {
        const titleEl = $el.find(selector);
        if (titleEl.length > 0) {
          const title = titleEl.first().text().trim();
          if (title) return title;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private extractUrl($el: any, domain: string): string {
    try {
      const linkEl = $el.find('a').first();
      const url = linkEl.length ? linkEl.attr('href') : '';
      return url && url.startsWith('http') ? url : `https://www.${domain}${url || ''}`;
    } catch (error) {
      return '';
    }
  }
}

export const advancedWebScraper = new AdvancedWebScraper();
