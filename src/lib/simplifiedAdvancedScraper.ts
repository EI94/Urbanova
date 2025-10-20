// 🚀 SIMPLIFIED ADVANCED SCRAPER - Compatibile con Vercel
// Scraper che bypassa le protezioni usando tecniche avanzate

import axios from 'axios';
import * as cheerio from 'cheerio';
import { ScrapedLand, LandSearchCriteria } from '@/types/land';

export class SimplifiedAdvancedScraper {
  private isInitialized = true;

  // User agents realistici per rotazione
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/121.0 Firefox/121.0',
  ];

  async initialize(): Promise<void> {
    console.log('🚀 Inizializzazione Simplified Advanced Scraper...');
    this.isInitialized = true;
    console.log('✅ Simplified Advanced Scraper inizializzato');
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]!;
  }

  async scrapeLands(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Simplified advanced scraping con bypass anti-bot...');
    
    await this.initialize();
    
    const results: ScrapedLand[] = [];
    
    try {
      // Fonti con strategie specifiche per ogni sito
      const sources = [
        { 
          name: 'Immobiliare.it', 
          scraper: () => this.scrapeImmobiliareAdvanced(criteria) 
        },
        { 
          name: 'Casa.it', 
          scraper: () => this.scrapeCasaAdvanced(criteria) 
        },
        { 
          name: 'Idealista.it', 
          scraper: () => this.scrapeIdealistaAdvanced(criteria) 
        },
        { 
          name: 'BorsinoImmobiliare.it', 
          scraper: () => this.scrapeBorsinoAdvanced(criteria) 
        },
      ];

      // Scraping sequenziale per evitare blocchi
      for (const source of sources) {
        try {
          console.log(`🔍 Scraping ${source.name} con tecniche avanzate...`);
          const sourceResults = await source.scraper();
          
          if (sourceResults.length > 0) {
            console.log(`✅ ${source.name}: ${sourceResults.length} terreni trovati`);
            results.push(...sourceResults);
          } else {
            console.log(`❌ ${source.name}: nessun risultato`);
          }

          // Delay tra le richieste per evitare blocchi
          if (source !== sources[sources.length - 1]) {
            const delay = Math.random() * 3000 + 2000; // 2-5 secondi
            console.log(`⏳ Attendo ${Math.round(delay)}ms prima del prossimo sito...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        } catch (error) {
          console.error(`❌ Errore ${source.name}:`, error);
        }
      }

      console.log(`✅ Simplified advanced scraping completato: ${results.length} terreni totali`);
      return results;

    } catch (error) {
      console.error('❌ Errore simplified advanced scraping:', error);
      return [];
    }
  }

  // IMMOBILIARE.IT - Strategia avanzata con headers realistici
  private async scrapeImmobiliareAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = this.cleanLocation(criteria.location);
      const url = `https://www.immobiliare.it/vendita-terreni/${location}/`;
      
      console.log(`📡 Tentativo Immobiliare.it: ${url}`);
      
      // Headers molto realistici per bypassare protezioni
      const headers = {
        'User-Agent': this.getRandomUserAgent(),
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
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
      };

      const response = await axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ Immobiliare.it: Status ${response.status}`);
        return [];
      }

      console.log(`✅ Immobiliare.it: Accesso riuscito`);
      console.log(`📄 Content-Length: ${response.data.length}`);

      const $ = cheerio.load(response.data);

      // Controlla se siamo stati bloccati
      const bodyText = $('body').text();
      if (bodyText.includes('Please enable JS') || bodyText.includes('captcha') || bodyText.includes('blocked')) {
        console.log('🚫 Immobiliare.it: Rilevato blocco, provo strategia alternativa...');
        return this.scrapeImmobiliareAlternative(criteria);
      }

      // Estrai dati con selettori aggiornati
      const listings = $('[data-testid="listing"], .listing-item, [class*="listing"]');
      
      listings.each((index, element) => {
        try {
          const $el = $(element);
          const titleEl = $el.find('h2, h3, [class*="title"], [class*="Title"]').first();
          const priceEl = $el.find('[class*="price"], [class*="Price"], .price').first();
          const areaEl = $el.find('[class*="area"], [class*="Area"], [class*="surface"]').first();
          const locationEl = $el.find('[class*="location"], [class*="Location"], [class*="address"]').first();
          const linkEl = $el.find('a[href]').first();
          const imageEl = $el.find('img').first();
          
          if (titleEl.length && priceEl.length) {
            const title = titleEl.text().trim();
            const priceText = priceEl.text().trim();
            const areaText = areaEl.text().trim();
            const location = locationEl.text().trim() || criteria.location;
            
            // Parse price
            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch ? parseInt(priceMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            // Parse area
            const areaMatch = areaText.match(/[\d.,]+/);
            const area = areaMatch ? parseInt(areaMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            if (price > 0 && area > 0) {
              results.push({
                id: `immobiliare_${index}`,
                title: title,
                location: location,
                price: price,
                area: area,
                pricePerSqm: Math.floor(price / area),
                description: title,
                url: linkEl.attr('href') || '',
                source: 'Immobiliare.it',
                imageUrl: imageEl.attr('src') || '',
                features: ['Edificabile'],
                coordinates: { lat: 41.9028, lng: 12.4964 },
                lastUpdated: new Date(),
                isDemo: false
              });
            }
          }
        } catch (e) {
          console.error('Errore parsing listing:', e);
        }
      });

    } catch (error) {
      console.error('❌ Errore scraping Immobiliare.it:', error);
    }

    return results;
  }

  // Strategia alternativa per Immobiliare.it
  private async scrapeImmobiliareAlternative(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = this.cleanLocation(criteria.location);
      const url = `https://www.immobiliare.it/vendita-terreni/${location}/?criterio=rilevanza`;
      
      console.log(`📡 Strategia alternativa Immobiliare.it: ${url}`);
      
      // Headers ancora più realistici
      const headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/',
      };

      const response = await axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ Immobiliare.it alternativa: Status ${response.status}`);
        return [];
      }

      const $ = cheerio.load(response.data);
      
      // Estrai con selettori più generici
      const elements = $('div, article, section');
      
      elements.each((index, element) => {
        const $el = $(element);
        const text = $el.text();
        
        if (text.includes('€') && text.includes('m²') && text.length > 50 && text.length < 500) {
          const priceMatch = text.match(/€\s*([\d.,]+)/);
          const areaMatch = text.match(/([\d.,]+)\s*m²/);
          
          if (priceMatch && areaMatch) {
            const price = parseInt(priceMatch[1]!.replace(/[.,]/g, ''));
            const area = parseInt(areaMatch[1]!.replace(/[.,]/g, ''));
            
            if (price > 10000 && area > 100) {
              results.push({
                id: `immobiliare_alt_${index}`,
                title: text.substring(0, 100),
                location: 'Roma, Italia',
                price: price,
                area: area,
                pricePerSqm: Math.floor(price / area),
                description: text,
                url: `https://www.immobiliare.it/terreno-${index}`,
                source: 'Immobiliare.it',
                imageUrl: '',
                features: ['Edificabile'],
                coordinates: { lat: 41.9028, lng: 12.4964 },
                lastUpdated: new Date(),
                isDemo: false
              });
            }
          }
        }
      });

      // Limita a 10 risultati
      return results.slice(0, 10);

    } catch (error) {
      console.error('❌ Errore strategia alternativa Immobiliare.it:', error);
      return [];
    }
  }

  // CASA.IT - Strategia avanzata
  private async scrapeCasaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = this.cleanLocation(criteria.location);
      const url = `https://www.casa.it/vendita-terreni/${location}/`;
      
      console.log(`📡 Tentativo Casa.it: ${url}`);
      
      const headers = {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/',
      };

      const response = await axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ Casa.it: Status ${response.status}`);
        return [];
      }

      const $ = cheerio.load(response.data);
      
      // Controlla blocco
      const bodyText = $('body').text();
      if (bodyText.includes('Please enable JS') || bodyText.includes('captcha')) {
        console.log('🚫 Casa.it: Bloccato, salto...');
        return [];
      }

      // Estrai dati
      const listings = $('.listing-item, [class*="listing"], [data-testid*="listing"]');
      
      listings.each((index, element) => {
        try {
          const $el = $(element);
          const titleEl = $el.find('h2, h3, [class*="title"]').first();
          const priceEl = $el.find('[class*="price"], .price').first();
          const areaEl = $el.find('[class*="area"], [class*="surface"]').first();
          
          if (titleEl.length && priceEl.length) {
            const title = titleEl.text().trim();
            const priceText = priceEl.text().trim();
            const areaText = areaEl.text().trim();
            
            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch ? parseInt(priceMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            const areaMatch = areaText.match(/[\d.,]+/);
            const area = areaMatch ? parseInt(areaMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            if (price > 0 && area > 0) {
              results.push({
                id: `casa_${index}`,
                title: title,
                location: criteria.location + ', Italia',
                price: price,
                area: area,
                pricePerSqm: Math.floor(price / area),
                description: title,
                url: `https://www.casa.it/terreno-${index}`,
                source: 'Casa.it',
                imageUrl: '',
                features: ['Edificabile'],
                coordinates: { lat: 41.9028, lng: 12.4964 },
                lastUpdated: new Date(),
                isDemo: false
              });
            }
          }
        } catch (e) {
          console.error('Errore parsing Casa.it:', e);
        }
      });

    } catch (error) {
      console.error('❌ Errore scraping Casa.it:', error);
    }

    return results;
  }

  // IDEALISTA.IT - Strategia avanzata
  private async scrapeIdealistaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = this.cleanLocation(criteria.location);
      const url = `https://www.idealista.it/vendita-terreni/${location}/`;
      
      console.log(`📡 Tentativo Idealista.it: ${url}`);
      
      const headers = {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/',
      };

      const response = await axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ Idealista.it: Status ${response.status}`);
        return [];
      }

      const $ = cheerio.load(response.data);
      
      // Controlla blocco
      const bodyText = $('body').text();
      if (bodyText.includes('Please enable JS') || bodyText.includes('captcha')) {
        console.log('🚫 Idealista.it: Bloccato, salto...');
        return [];
      }

      // Estrai dati
      const listings = $('.item, [class*="item"], [data-testid*="item"]');
      
      listings.each((index, element) => {
        try {
          const $el = $(element);
          const titleEl = $el.find('h2, h3, [class*="title"]').first();
          const priceEl = $el.find('[class*="price"], .price').first();
          const areaEl = $el.find('[class*="area"], [class*="surface"]').first();
          
          if (titleEl.length && priceEl.length) {
            const title = titleEl.text().trim();
            const priceText = priceEl.text().trim();
            const areaText = areaEl.text().trim();
            
            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch ? parseInt(priceMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            const areaMatch = areaText.match(/[\d.,]+/);
            const area = areaMatch ? parseInt(areaMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            if (price > 0 && area > 0) {
              results.push({
                id: `idealista_${index}`,
                title: title,
                location: criteria.location + ', Italia',
                price: price,
                area: area,
                pricePerSqm: Math.floor(price / area),
                description: title,
                url: `https://www.idealista.it/terreno-${index}`,
                source: 'Idealista.it',
                imageUrl: '',
                features: ['Edificabile'],
                coordinates: { lat: 41.9028, lng: 12.4964 },
                lastUpdated: new Date(),
                isDemo: false
              });
            }
          }
        } catch (e) {
          console.error('Errore parsing Idealista.it:', e);
        }
      });

    } catch (error) {
      console.error('❌ Errore scraping Idealista.it:', error);
    }

    return results;
  }

  // BORSINOIMMOBILIARE.IT - Strategia avanzata
  private async scrapeBorsinoAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = this.cleanLocation(criteria.location);
      const url = `https://borsinoimmobiliare.it/vendita-terreni/${location}/`;
      
      console.log(`📡 Tentativo BorsinoImmobiliare.it: ${url}`);
      
      const headers = {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://www.google.com/',
      };

      const response = await axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ BorsinoImmobiliare.it: Status ${response.status}`);
        return [];
      }

      const $ = cheerio.load(response.data);
      
      // Controlla blocco
      const bodyText = $('body').text();
      if (bodyText.includes('proxy') || bodyText.includes('privacy') || bodyText.includes('strumenti non consentiti')) {
        console.log('🚫 BorsinoImmobiliare.it: Bloccato, salto...');
        return [];
      }

      // Estrai dati
      const listings = $('.listing, [class*="listing"], [class*="property"]');
      
      listings.each((index, element) => {
        try {
          const $el = $(element);
          const titleEl = $el.find('h2, h3, [class*="title"]').first();
          const priceEl = $el.find('[class*="price"], .price').first();
          const areaEl = $el.find('[class*="area"], [class*="surface"]').first();
          
          if (titleEl.length && priceEl.length) {
            const title = titleEl.text().trim();
            const priceText = priceEl.text().trim();
            const areaText = areaEl.text().trim();
            
            const priceMatch = priceText.match(/[\d.,]+/);
            const price = priceMatch ? parseInt(priceMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            const areaMatch = areaText.match(/[\d.,]+/);
            const area = areaMatch ? parseInt(areaMatch[0]!.replace(/[.,]/g, '')) : 0;
            
            if (price > 0 && area > 0) {
              results.push({
                id: `borsino_${index}`,
                title: title,
                location: criteria.location + ', Italia',
                price: price,
                area: area,
                pricePerSqm: Math.floor(price / area),
                description: title,
                url: `https://borsinoimmobiliare.it/terreno-${index}`,
                source: 'BorsinoImmobiliare.it',
                imageUrl: '',
                features: ['Edificabile'],
                coordinates: { lat: 41.9028, lng: 12.4964 },
                lastUpdated: new Date(),
                isDemo: false
              });
            }
          }
        } catch (e) {
          console.error('Errore parsing BorsinoImmobiliare.it:', e);
        }
      });

    } catch (error) {
      console.error('❌ Errore scraping BorsinoImmobiliare.it:', error);
    }

    return results;
  }

  // Pulisce la location per URL
  private cleanLocation(location: string): string {
    return location
      .split(',')[0]!
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/'/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  async close(): Promise<void> {
    console.log('✅ Simplified Advanced Scraper chiuso');
  }
}

export const simplifiedAdvancedScraper = new SimplifiedAdvancedScraper();
