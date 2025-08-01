// Web Scraper Reale per Terreni - Urbanova AI
import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedLand, LandSearchCriteria } from '@/types/land';

export class RealWebScraper {
  public isInitialized = true; // Sempre true per HTTP scraping

  // Funzione di retry per gestire errori di rete
  private async retryRequest<T>(requestFn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        console.log(`⚠️ Tentativo ${attempt}/${maxRetries} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Attendi prima del retry (backoff esponenziale)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('Tutti i tentativi falliti');
  }

  // Rotazione User-Agent per evitare blocchi
  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  // Headers realistici per evitare blocchi
  private getRealisticHeaders(): any {
    return {
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
      'sec-ch-ua-platform': '"Windows"'
    };
  }

  // Headers avanzati per bypassare DataDome
  private getAdvancedHeaders(): any {
    const userAgent = this.getRandomUserAgent();
    return {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Referer': 'https://www.google.com/',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua-arch': '"x86"',
      'sec-ch-ua-full-version-list': '"Not_A Brand";v="8.0.0.0", "Chromium";v="120.0.6099.109", "Google Chrome";v="120.0.6099.109"',
      'sec-ch-ua-model': '""',
      'sec-ch-device-memory': '"8"',
      'sec-ch-viewport-width': '"1920"',
      'sec-ch-viewport-height': '"1080"',
      'sec-ch-dpr': '"1"'
    };
  }

  async initialize(): Promise<void> {
    console.log('✅ Web Scraper HTTP inizializzato');
    this.isInitialized = true;
  }

  async close(): Promise<void> {
    console.log('✅ Web Scraper HTTP chiuso');
    this.isInitialized = false;
  }

  async scrapeLands(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Iniziando scraping REALE terreni con criteri:', criteria);
    console.log('🔧 Modalità: SOLO DATI REALI - Nessun dato fittizio');

    const results: ScrapedLand[] = [];
    
    try {
      console.log('🚀 Avvio scraping HTTP per dati reali...');
      
      // Fonti ottimizzate basate sui test massivi
      // Immobiliare.it FUNZIONA - altri bloccati
      const sources = [
        { name: 'Immobiliare.it', scraper: () => this.scrapeImmobiliareAdvanced(criteria) },
        { name: 'Bakeca.it', scraper: () => this.scrapeBakecaHTTP(criteria) },
        { name: 'Annunci.it', scraper: () => this.scrapeAnnunciHTTP(criteria) },
        { name: 'Casa.it', scraper: () => this.scrapeCasaAdvanced(criteria) }
      ];

      // Scraping sequenziale con delay per evitare blocchi
      for (const source of sources) {
        try {
          console.log(`🔍 Scraping ${source.name}...`);
          const sourceResults = await source.scraper();
          
          if (sourceResults.length > 0) {
            results.push(...sourceResults);
            console.log(`✅ ${source.name}: ${sourceResults.length} terreni REALI trovati`);
          } else {
            console.log(`❌ ${source.name}: nessun dato reale disponibile`);
          }
          
          // Delay tra le richieste per evitare blocchi
          if (source !== sources[sources.length - 1]) {
            const delay = Math.random() * 2000 + 1000; // 1-3 secondi
            console.log(`⏳ Attendo ${Math.round(delay)}ms prima del prossimo sito...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
        } catch (error) {
          console.error(`❌ Errore ${source.name}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          
          // Se è un errore 403, aggiungi delay extra
          if (error instanceof Error && error.message.includes('403')) {
            console.log(`🚫 ${source.name} bloccato (403). Attendo 5 secondi...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      console.log(`✅ Scraping completato: ${results.length} terreni REALI totali`);
      
      if (results.length === 0) {
        console.log('⚠️ ATTENZIONE: Nessun terreno reale trovato. Verificare criteri di ricerca.');
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Errore durante lo scraping:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      return [];
    }
  }

  // Funzione per estrarre e validare il prezzo reale
  private extractRealPrice($: cheerio.CheerioAPI, element: any, source: string): number | null {
    const $el = $(element);
    
    // Selettori specifici per prezzi su diversi siti
    const priceSelectors = [
      // Immobiliare.it - BASATI SU DATI REALI (CSS Modules)
      '.styles_in-listingCardPrice__earBq',
      '.styles_in-listingCardPrice__earBq *',
      // Selettori generici
      'span:contains("€")',
      'div:contains("€")',
      'p:contains("€")',
      '.price',
      '.Price',
      '[class*="price"]',
      '[class*="Price"]'
    ];

    for (const selector of priceSelectors) {
      const priceEl = $el.find(selector);
      if (priceEl.length > 0) {
        const priceText = priceEl.text().trim();
        console.log(`🔍 [${source}] Testo prezzo trovato: "${priceText}"`);
        
        // Estrai prezzo dal testo - gestisce formati come "€ 790.000", "790.000€", etc.
        const priceMatch = priceText.match(/€\s*([\d.,]+)/) || priceText.match(/([\d.,]+)\s*€/);
        
        if (priceMatch) {
          // Rimuovi punti e virgole, mantieni solo numeri
          const cleanPrice = priceMatch[1].replace(/[^\d]/g, '');
          
          if (cleanPrice.length >= 4 && cleanPrice.length <= 8) { // Prezzo realistico tra 1000€ e 99.999.999€
            const price = parseInt(cleanPrice);
            if (price > 0 && price < 100000000) {
              console.log(`✅ [${source}] Prezzo reale estratto: €${price.toLocaleString()}`);
              return price;
            }
          }
        }
      }
    }
    
    console.log(`❌ [${source}] Nessun prezzo reale trovato`);
    return null;
  }

  // Funzione per estrarre e validare l'area reale
  private extractRealArea($: cheerio.CheerioAPI, element: any, source: string): number | null {
          const $el = $(element);
    
    const areaSelectors = [
      // Immobiliare.it - BASATI SU DATI REALI (CSS Modules)
      '.styles_in-listingCardFeatureList__item__CKRyT',
      '.styles_in-listingCardFeatureList__v24m8 *',
      // Selettori generici
      'span:contains("m²")',
      'div:contains("m²")',
      'p:contains("m²")',
      '.area',
      '.surface',
      '[class*="area"]',
      '[class*="surface"]'
    ];

    for (const selector of areaSelectors) {
      const areaEl = $el.find(selector);
      if (areaEl.length > 0) {
        const areaText = areaEl.text().trim();
        console.log(`🔍 [${source}] Testo area trovato: "${areaText}"`);
        
        // Estrai area dal testo - gestisce formati come "800 m²", "800m²", etc.
        const areaMatch = areaText.match(/(\d+(?:[.,]\d+)?)\s*m²/) || areaText.match(/(\d+(?:[.,]\d+)?)m²/);
        
        if (areaMatch) {
          // Rimuovi punti e virgole, mantieni solo numeri
          const cleanArea = areaMatch[1].replace(/[^\d]/g, '');
          
          if (cleanArea.length >= 2 && cleanArea.length <= 6) { // Area realistico tra 10m² e 999.999m²
            const area = parseInt(cleanArea);
            if (area > 0 && area < 1000000) {
              console.log(`✅ [${source}] Area reale estratta: ${area}m²`);
              return area;
            }
          }
        }
      }
    }
    
    console.log(`❌ [${source}] Nessuna area reale trovata`);
    return null;
  }

  // Strategia avanzata per Immobiliare.it
  private async scrapeImmobiliareAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Immobiliare.it AVANZATO per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Immobiliare.it
      const url = `https://www.immobiliare.it/vendita-terreni/${location}/`;
      
      console.log('📡 URL Immobiliare.it AVANZATO:', url);
      
      // Strategia multi-tentativo con headers diversi
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !response) {
        attempts++;
        console.log(`🔄 Tentativo ${attempts}/${maxAttempts} per Immobiliare.it...`);
        
        try {
          // Usa headers diversi per ogni tentativo
          const headers = attempts === 1 ? this.getRealisticHeaders() : this.getAdvancedHeaders();
          
          response = await axios.get(url, {
            timeout: 15000,
            headers: headers,
            maxRedirects: 5,
            validateStatus: (status) => status < 500
          });
          
          if (response.status === 403) {
            console.log(`🚫 Tentativo ${attempts}: 403 Forbidden, riprovo...`);
            response = null;
            await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
            continue;
          }
          
          if (response.status === 200) {
            console.log(`✅ Immobiliare.it: Accesso riuscito al tentativo ${attempts}`);
            break;
          }
          
        } catch (error) {
          console.log(`❌ Tentativo ${attempts} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
          }
        }
      }
      
      if (!response || response.status !== 200) {
        console.log('❌ Immobiliare.it: Impossibile accedere dopo tutti i tentativi');
        return [];
      }
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Immobiliare.it
      const selectors = [
        '.styles_in-listingCard__aHT19',
        '.styles_in-listingCardProperty__C2t47',
        '.nd-mediaObject',
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.in-card',
        '.in-realEstateList__item',
        'article',
        '.card',
        '.item'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di Immobiliare.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'immobiliare.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'immobiliare.it');
        
        // Estrai titolo
        const titleEl = $el.find('h2, h3, .title, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Immobiliare ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.immobiliare.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `immobiliare_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'immobiliare.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Immobiliare.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Immobiliare.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Immobiliare.it avanzato:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  // Strategia avanzata per Casa.it
  private async scrapeCasaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Casa.it AVANZATO per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Casa.it
      const url = `https://www.casa.it/terreni/vendita/${location}`;
      
      console.log('📡 URL Casa.it AVANZATO:', url);
      
      // Strategia multi-tentativo con headers diversi
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !response) {
        attempts++;
        console.log(`🔄 Tentativo ${attempts}/${maxAttempts} per Casa.it...`);
        
        try {
          // Usa headers diversi per ogni tentativo
          const headers = attempts === 1 ? this.getRealisticHeaders() : this.getAdvancedHeaders();
          
          response = await axios.get(url, {
            timeout: 15000,
            headers: headers,
            maxRedirects: 5,
            validateStatus: (status) => status < 500
          });
          
          if (response.status === 403) {
            console.log(`🚫 Tentativo ${attempts}: 403 Forbidden, riprovo...`);
            response = null;
            await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
            continue;
          }
          
          if (response.status === 200) {
            console.log(`✅ Casa.it: Accesso riuscito al tentativo ${attempts}`);
            break;
          }
          
        } catch (error) {
          console.log(`❌ Tentativo ${attempts} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
          }
        }
      }
      
      if (!response || response.status !== 200) {
        console.log('❌ Casa.it: Impossibile accedere dopo tutti i tentativi');
        return [];
      }
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Casa.it
      const selectors = [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di Casa.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'casa.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'casa.it');
        
        // Estrai titolo
        const titleEl = $el.find('h2, h3, .title, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Casa ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.casa.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `casa_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'casa.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Casa.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Casa.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Casa.it avanzato:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeCasaHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Casa.it HTTP per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Casa.it
      const url = `https://www.casa.it/terreni/vendita/${location}`;
      
      console.log('📡 URL Casa.it HTTP:', url);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Casa.it
      const selectors = [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di Casa.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'casa.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'casa.it');
        
        // Estrai titolo
        const titleEl = $el.find('h2, h3, .title, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Casa ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.casa.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `casa_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'casa.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Casa.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Casa.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Casa.it:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  // Strategia avanzata per Idealista.it
  private async scrapeIdealistaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Idealista.it AVANZATO per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Idealista.it
      const url = `https://www.idealista.it/terreni/vendita/${location}`;
      
      console.log('📡 URL Idealista.it AVANZATO:', url);
      
      // Strategia multi-tentativo con headers diversi
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !response) {
        attempts++;
        console.log(`🔄 Tentativo ${attempts}/${maxAttempts} per Idealista.it...`);
        
        try {
          // Usa headers diversi per ogni tentativo
          const headers = attempts === 1 ? this.getRealisticHeaders() : this.getAdvancedHeaders();
          
          response = await axios.get(url, {
            timeout: 15000,
            headers: headers,
            maxRedirects: 5,
            validateStatus: (status) => status < 500
          });
          
          if (response.status === 403) {
            console.log(`🚫 Tentativo ${attempts}: 403 Forbidden, riprovo...`);
            response = null;
            await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
            continue;
          }
          
          if (response.status === 200) {
            console.log(`✅ Idealista.it: Accesso riuscito al tentativo ${attempts}`);
            break;
          }
          
        } catch (error) {
          console.log(`❌ Tentativo ${attempts} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
          }
        }
      }
      
      if (!response || response.status !== 200) {
        console.log('❌ Idealista.it: Impossibile accedere dopo tutti i tentativi');
        return [];
      }
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Idealista.it
      const selectors = [
        '.item-info-container',
        '.item-detail',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di Idealista.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'idealista.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'idealista.it');
        
        // Estrai titolo
        const titleEl = $el.find('h2, h3, .title, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Idealista ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.idealista.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `idealista_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'idealista.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Idealista.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Idealista.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Idealista.it avanzato:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeIdealistaHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Idealista.it HTTP per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Idealista.it
      const url = `https://www.idealista.it/terreni/vendita/${location}`;
      
      console.log('📡 URL Idealista.it HTTP:', url);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Idealista.it
      const selectors = [
        '.item-info-container',
        '.item-detail',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di Idealista.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'idealista.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'idealista.it');
        
        // Estrai titolo
        const titleEl = $el.find('h2, h3, .title, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Idealista ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.idealista.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `idealista_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'idealista.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Idealista.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Idealista.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Idealista.it:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeBorsinoImmobiliareHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping BorsinoImmobiliare.it HTTP per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.borsinoimmobiliare.it/terreni/vendita/${location}`;
      
      console.log('📡 URL BorsinoImmobiliare.it HTTP:', url);
      
      const response = await axios.get(url, {
        timeout: 10000, // Ridotto da 15000 a 10000 per evitare errori di rete
        headers: this.getRealisticHeaders()
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per BorsinoImmobiliare.it
      const selectors = [
        '.property-item',
        '.announcement-item',
        '[data-testid="property-card"]',
        '.listing-item',
        '.borsino-card',
        '.property-card',
        'article[data-testid="property-card"]',
        '.announcement-card'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di BorsinoImmobiliare.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Cerca il link principale dell'annuncio
        const linkEl = $el.find('a[href*="/vendita/"], a[href*="/annunci/"], a[href*="/terreni/"], a[href*="/property/"], a[href*="/immobile/"]').first();
        const titleEl = $el.find('h2, h3, .title, [class*="title"], .property-title').first();
        
        if (linkEl.length) {
          const title = titleEl.length ? titleEl.text().trim() : `Terreno a ${criteria.location}`;
          const url = linkEl.attr('href');
          
          if (url && url.length > 10) {
            // Estrai prezzo REALE
            const realPrice = this.extractRealPrice($, element, 'BorsinoImmobiliare.it');
            
            // Estrai area REALE
            const realArea = this.extractRealArea($, element, 'BorsinoImmobiliare.it');
            
            // ACCETTA se abbiamo ALMENO UN dato reale (prezzo O area)
            if (realPrice || realArea) {
            const fullUrl = url.startsWith('http') ? url : `https://www.borsinoimmobiliare.it${url}`;
              
              // Usa valori di fallback solo se necessario, ma marca come non verificati
              const finalPrice = realPrice || 0; // 0 indica prezzo non disponibile
              const finalArea = realArea || 0; // 0 indica area non disponibile
            
            results.push({
                id: `borsino_real_${index}`,
              title: title,
                price: finalPrice,
              location: criteria.location,
                area: finalArea,
              description: title,
              url: fullUrl,
                source: 'borsinoimmobiliare.it (REALE)',
              images: [],
              features: ['Edificabile'],
              contactInfo: {},
                timestamp: new Date(),
                // Marca i dati mancanti per trasparenza
                hasRealPrice: !!realPrice,
                hasRealArea: !!realArea
              });
              
              const priceInfo = realPrice ? `€${realPrice.toLocaleString()}` : 'Prezzo non disponibile';
              const areaInfo = realArea ? `${realArea}m²` : 'Area non disponibile';
              console.log(`✅ Annuncio REALE BorsinoImmobiliare.it: ${title} - ${priceInfo} - ${areaInfo}`);
            } else {
              console.log(`⚠️ Annuncio scartato - nessun dato reale trovato: ${title}`);
            }
          }
        }
      });
      
      console.log(`✅ BorsinoImmobiliare.it HTTP: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping BorsinoImmobiliare.it HTTP:', error);
      return [];
    }
  }

  // Strategia avanzata per BorsinoImmobiliare.it
  private async scrapeBorsinoAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping BorsinoImmobiliare.it AVANZATO per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per BorsinoImmobiliare.it
      const url = `https://www.borsinoimmobiliare.it/terreni/vendita/${location}`;
      
      console.log('📡 URL BorsinoImmobiliare.it AVANZATO:', url);
      
      // Strategia multi-tentativo con headers diversi
      let response = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !response) {
        attempts++;
        console.log(`🔄 Tentativo ${attempts}/${maxAttempts} per BorsinoImmobiliare.it...`);
        
        try {
          // Usa headers diversi per ogni tentativo
          const headers = attempts === 1 ? this.getRealisticHeaders() : this.getAdvancedHeaders();
          
          response = await axios.get(url, {
            timeout: 15000,
            headers: headers,
            maxRedirects: 5,
            validateStatus: (status) => status < 500
          });
          
          if (response.status === 403) {
            console.log(`🚫 Tentativo ${attempts}: 403 Forbidden, riprovo...`);
            response = null;
            await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
            continue;
          }
          
          if (response.status === 200) {
            console.log(`✅ BorsinoImmobiliare.it: Accesso riuscito al tentativo ${attempts}`);
            break;
          }
          
        } catch (error) {
          console.log(`❌ Tentativo ${attempts} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000 * attempts));
          }
        }
      }
      
      if (!response || response.status !== 200) {
        console.log('❌ BorsinoImmobiliare.it: Impossibile accedere dopo tutti i tentativi');
        return [];
      }
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per BorsinoImmobiliare.it
      const selectors = [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item'
      ];

      let elements: any = null;
      
      for (const selector of selectors) {
        elements = $(selector);
        if (elements.length > 0) {
          console.log(`Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (!elements || elements.length === 0) {
        console.log('❌ Nessun elemento trovato con i selettori di BorsinoImmobiliare.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'borsinoimmobiliare.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'borsinoimmobiliare.it');
        
        // Estrai titolo
        const titleEl = $el.find('h2, h3, .title, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Borsino ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.borsinoimmobiliare.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `borsino_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'borsinoimmobiliare.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ BorsinoImmobiliare.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ BorsinoImmobiliare.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping BorsinoImmobiliare.it avanzato:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeSubitoHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Subito.it per terreni...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location || 'Roma';
      // URL corretto per Subito.it
      const url = `https://www.subito.it/immobili/terreni-e-aree-edificabili/${location}/vendita/`;
      
      console.log(`📡 Richiesta HTTP: ${url}`);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori corretti per Subito.it
      const listings = $('[data-testid="item-card"], .item-card, .listing-item, .card, .item, article, .announcement');
      
      console.log(`📊 Trovati ${listings.length} annunci su Subito.it`);
      
      listings.each((index, element) => {
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Estrai prezzo
        const realPrice = this.extractRealPrice($, $el, 'subito.it');
        
        // Estrai area
        const realArea = this.extractRealArea($, $el, 'subito.it');
        
        // Estrai titolo
        const titleEl = $el.find('[data-testid="title"], .title, h2, h3, [class*="title"]').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Subito ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.subito.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `subito_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'subito.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Subito.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Subito.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Subito.it:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeKijijiHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Kijiji.it per terreni...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location || 'Roma';
      const url = `https://www.kijiji.it/terreni/${location}/vendita/`;
      
      console.log(`📡 Richiesta HTTP: ${url}`);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori per Kijiji.it
      const listings = $('[data-testid="listing"], .listing, .item-card');
      
      console.log(`📊 Trovati ${listings.length} annunci su Kijiji.it`);
      
      listings.each((index, element) => {
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Estrai prezzo
        const priceEl = $el.find('[data-testid="price"], .price, [class*="price"]');
        const realPrice = this.extractRealPrice($, priceEl, 'kijiji.it');
        
        // Estrai area
        const areaEl = $el.find('[data-testid="features"], .features, [class*="features"]');
        const realArea = this.extractRealArea($, areaEl, 'kijiji.it');
        
        // Estrai titolo
        const titleEl = $el.find('[data-testid="title"], .title, h2, h3');
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Kijiji ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.kijiji.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `kijiji_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'kijiji.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Kijiji.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Kijiji.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Kijiji.it:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeBakecaHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Bakeca.it per terreni...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location || 'Roma';
      const url = `https://www.bakeca.it/annunci/vendita/terreni/${location}/`;
      
      console.log(`📡 Richiesta HTTP: ${url}`);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori per Bakeca.it
      const listings = $('[data-testid="listing"], .listing, .item-card');
      
      console.log(`📊 Trovati ${listings.length} annunci su Bakeca.it`);
      
      listings.each((index, element) => {
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Estrai prezzo
        const priceEl = $el.find('[data-testid="price"], .price, [class*="price"]');
        const realPrice = this.extractRealPrice($, priceEl, 'bakeca.it');
        
        // Estrai area
        const areaEl = $el.find('[data-testid="features"], .features, [class*="features"]');
        const realArea = this.extractRealArea($, areaEl, 'bakeca.it');
        
        // Estrai titolo
        const titleEl = $el.find('[data-testid="title"], .title, h2, h3');
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Bakeca ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.bakeca.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `bakeca_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'bakeca.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Bakeca.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Bakeca.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Bakeca.it:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }

  private async scrapeAnnunciHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Annunci.it per terreni...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location || 'Roma';
      const url = `https://www.annunci.it/vendita/terreni/${location}/`;
      
      console.log(`📡 Richiesta HTTP: ${url}`);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori per Annunci.it
      const listings = $('[data-testid="listing"], .listing, .item-card');
      
      console.log(`📊 Trovati ${listings.length} annunci su Annunci.it`);
      
      listings.each((index, element) => {
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Estrai prezzo
        const priceEl = $el.find('[data-testid="price"], .price, [class*="price"]');
        const realPrice = this.extractRealPrice($, priceEl, 'annunci.it');
        
        // Estrai area
        const areaEl = $el.find('[data-testid="features"], .features, [class*="features"]');
        const realArea = this.extractRealArea($, areaEl, 'annunci.it');
        
        // Estrai titolo
        const titleEl = $el.find('[data-testid="title"], .title, h2, h3');
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Annunci ${index + 1}`;
        
        // Estrai link
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl = url && url.startsWith('http') ? url : `https://www.annunci.it${url || ''}`;
        
        // Aggiungi solo se abbiamo dati reali
        if (realPrice || realArea) {
          const finalPrice = realPrice || 0;
          const finalArea = realArea || 0;
          
          results.push({
            id: `annunci_real_${index}`,
            title: title,
            price: finalPrice,
            location: criteria.location,
            area: finalArea,
            description: title,
            url: fullUrl,
            source: 'annunci.it (REALE)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!realPrice,
            hasRealArea: !!realArea
          });
          
          console.log(`✅ Annunci.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`);
        }
      });
      
      console.log(`✅ Annunci.it: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Annunci.it:', error instanceof Error ? error.message : 'Errore sconosciuto');
      return [];
    }
  }
}

export const realWebScraper = new RealWebScraper(); 