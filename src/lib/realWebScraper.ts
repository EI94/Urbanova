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
      
      // Fonti alternative che non hanno protezioni anti-bot aggressive
      const sources = [
        { name: 'Casa.it', scraper: () => this.scrapeCasaHTTP(criteria) },
        { name: 'Idealista.it', scraper: () => this.scrapeIdealistaHTTP(criteria) },
        { name: 'BorsinoImmobiliare.it', scraper: () => this.scrapeBorsinoImmobiliareHTTP(criteria) },
        { name: 'Subito.it', scraper: () => this.scrapeSubitoHTTP(criteria) },
        { name: 'Kijiji.it', scraper: () => this.scrapeKijijiHTTP(criteria) }
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

  private async scrapeImmobiliareHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Immobiliare.it HTTP per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.immobiliare.it/vendita-terreni/${location}/`;
      
      console.log('📡 URL Immobiliare.it HTTP:', url);
      
      // Usa retry logic per gestire errori di rete
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000, // Ridotto da 15000 a 10000 per evitare errori di rete
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Immobiliare.it - BASATI SU DATI REALI
      const selectors = [
        // Selettori specifici per la struttura reale di Immobiliare.it (CSS Modules)
        '.styles_in-listingCard__aHT19',
        '.styles_in-listingCardProperty__C2t47',
        '.nd-mediaObject',
        // Selettori generici per fallback
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.in-card',
        '.in-realEstateList__item--featured',
        'article[data-testid="listing-item"]',
        '.in-realEstateList__item--standard',
        '.in-realEstateList__item',
        'article',
        '.card',
        '.item',
        '.listing',
        '.announcement'
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
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Cerca il link principale dell'annuncio
        const linkEl = $el.find('a[href*="/vendita/"], a[href*="/annunci/"], a[href*="/terreni/"], a[href*="/property/"], a[href*="/immobile/"]').first();
        const titleEl = $el.find('[class*="Title"], h1, h2, h3, .title, [class*="title"]').first();
        
        // Se non trova link specifici, cerca qualsiasi link nell'elemento
        const fallbackLinkEl = linkEl.length === 0 ? $el.find('a').first() : linkEl;
        const finalLinkEl = fallbackLinkEl;
        
        if (finalLinkEl.length) {
          const title = titleEl.length ? titleEl.text().trim() : `Terreno a ${criteria.location}`;
          const url = finalLinkEl.attr('href');
          
          if (url && url.length > 10) {
            // Estrai prezzo REALE
            const realPrice = this.extractRealPrice($, element, 'Immobiliare.it');
            
            // Estrai area REALE
            const realArea = this.extractRealArea($, element, 'Immobiliare.it');
            
            // ACCETTA se abbiamo ALMENO UN dato reale (prezzo O area)
            if (realPrice || realArea) {
            const fullUrl = url.startsWith('http') ? url : `https://www.immobiliare.it${url}`;
              
              // Usa valori di fallback solo se necessario, ma marca come non verificati
              const finalPrice = realPrice || 0; // 0 indica prezzo non disponibile
              const finalArea = realArea || 0; // 0 indica area non disponibile
            
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
                // Marca i dati mancanti per trasparenza
                hasRealPrice: !!realPrice,
                hasRealArea: !!realArea
              });
              
              const priceInfo = realPrice ? `€${realPrice.toLocaleString()}` : 'Prezzo non disponibile';
              const areaInfo = realArea ? `${realArea}m²` : 'Area non disponibile';
              console.log(`✅ Annuncio REALE Immobiliare.it: ${title} - ${priceInfo} - ${areaInfo}`);
            } else {
              console.log(`⚠️ Annuncio scartato - nessun dato reale trovato: ${title}`);
            }
          }
        }
      });
      
      console.log(`✅ Immobiliare.it HTTP: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Immobiliare.it HTTP:', error);
      return [];
    }
  }

  private async scrapeCasaHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Casa.it HTTP per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.casa.it/terreni/vendita/${location}`;
      
      console.log('📡 URL Casa.it HTTP:', url);
      
      const response = await axios.get(url, {
        timeout: 10000, // Ridotto da 15000 a 10000 per evitare errori di rete
        headers: this.getRealisticHeaders()
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Casa.it
      const selectors = [
        '.announcement-item',
        '.property-card',
        '[data-testid="property-card"]',
        '.listing-item',
        '.casa-card',
        '.property-item',
        'article[data-testid="property-card"]'
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
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Cerca il link principale dell'annuncio
        const linkEl = $el.find('a[href*="/vendita/"], a[href*="/annunci/"], a[href*="/terreni/"], a[href*="/property/"]').first();
        const titleEl = $el.find('h2, h3, .title, [class*="title"], .property-title').first();
        
        if (linkEl.length) {
          const title = titleEl.length ? titleEl.text().trim() : `Terreno a ${criteria.location}`;
          const url = linkEl.attr('href');
          
          if (url && url.length > 10) {
            // Estrai prezzo REALE
            const realPrice = this.extractRealPrice($, element, 'Casa.it');
            
            // Estrai area REALE
            const realArea = this.extractRealArea($, element, 'Casa.it');
            
            // ACCETTA se abbiamo ALMENO UN dato reale (prezzo O area)
            if (realPrice || realArea) {
            const fullUrl = url.startsWith('http') ? url : `https://www.casa.it${url}`;
              
              // Usa valori di fallback solo se necessario, ma marca come non verificati
              const finalPrice = realPrice || 0; // 0 indica prezzo non disponibile
              const finalArea = realArea || 0; // 0 indica area non disponibile
            
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
                // Marca i dati mancanti per trasparenza
                hasRealPrice: !!realPrice,
                hasRealArea: !!realArea
              });
              
              const priceInfo = realPrice ? `€${realPrice.toLocaleString()}` : 'Prezzo non disponibile';
              const areaInfo = realArea ? `${realArea}m²` : 'Area non disponibile';
              console.log(`✅ Annuncio REALE Casa.it: ${title} - ${priceInfo} - ${areaInfo}`);
            } else {
              console.log(`⚠️ Annuncio scartato - nessun dato reale trovato: ${title}`);
            }
          }
        }
      });
      
      console.log(`✅ Casa.it HTTP: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Casa.it HTTP:', error);
      return [];
    }
  }

  private async scrapeIdealistaHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Idealista.it HTTP per dati REALI...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.idealista.it/terreni/vendita/${location}`;
      
      console.log('📡 URL Idealista.it HTTP:', url);
      
      const response = await axios.get(url, {
        timeout: 10000, // Ridotto da 15000 a 10000 per evitare errori di rete
        headers: this.getRealisticHeaders()
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori aggiornati per Idealista.it
      const selectors = [
        '.item-info-container',
        '.property-item',
        '[data-testid="property-card"]',
        '.listing-item',
        '.item',
        '.property-card',
        'article[data-testid="property-card"]',
        '.item-detail'
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
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Cerca il link principale dell'annuncio
        const linkEl = $el.find('a[href*="/vendita/"], a[href*="/annunci/"], a[href*="/terreni/"], a[href*="/property/"], a[href*="/inmueble/"]').first();
        const titleEl = $el.find('h2, h3, .title, [class*="title"], .item-title').first();
        
        if (linkEl.length) {
          const title = titleEl.length ? titleEl.text().trim() : `Terreno a ${criteria.location}`;
          const url = linkEl.attr('href');
          
          if (url && url.length > 10) {
            // Estrai prezzo REALE
            const realPrice = this.extractRealPrice($, element, 'Idealista.it');
            
            // Estrai area REALE
            const realArea = this.extractRealArea($, element, 'Idealista.it');
            
            // ACCETTA se abbiamo ALMENO UN dato reale (prezzo O area)
            if (realPrice || realArea) {
            const fullUrl = url.startsWith('http') ? url : `https://www.idealista.it${url}`;
              
              // Usa valori di fallback solo se necessario, ma marca come non verificati
              const finalPrice = realPrice || 0; // 0 indica prezzo non disponibile
              const finalArea = realArea || 0; // 0 indica area non disponibile
            
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
                // Marca i dati mancanti per trasparenza
                hasRealPrice: !!realPrice,
                hasRealArea: !!realArea
              });
              
              const priceInfo = realPrice ? `€${realPrice.toLocaleString()}` : 'Prezzo non disponibile';
              const areaInfo = realArea ? `${realArea}m²` : 'Area non disponibile';
              console.log(`✅ Annuncio REALE Idealista.it: ${title} - ${priceInfo} - ${areaInfo}`);
            } else {
              console.log(`⚠️ Annuncio scartato - nessun dato reale trovato: ${title}`);
            }
          }
        }
      });
      
      console.log(`✅ Idealista.it HTTP: ${results.length} terreni REALI estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Idealista.it HTTP:', error);
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

  private async scrapeSubitoHTTP(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Subito.it per terreni...');
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location || 'Roma';
      const url = `https://www.subito.it/immobili/terreni-e-aree-edificabili/${location}/vendita/`;
      
      console.log(`📡 Richiesta HTTP: ${url}`);
      
      const response = await this.retryRequest(async () => {
        return axios.get(url, {
          timeout: 10000,
          headers: this.getRealisticHeaders()
        });
      });
      
      const $ = cheerio.load(response.data);
      
      // Selettori per Subito.it
      const listings = $('[data-testid="item-card"], .item-card, .listing-item');
      
      console.log(`📊 Trovati ${listings.length} annunci su Subito.it`);
      
      listings.each((index, element) => {
        if (index >= 10) return; // Limita a 10 risultati
        
        const $el = $(element);
        
        // Estrai prezzo
        const priceEl = $el.find('[data-testid="price"], .price, [class*="price"]');
        const realPrice = this.extractRealPrice($, priceEl, 'subito.it');
        
        // Estrai area
        const areaEl = $el.find('[data-testid="features"], .features, [class*="features"]');
        const realArea = this.extractRealArea($, areaEl, 'subito.it');
        
        // Estrai titolo
        const titleEl = $el.find('[data-testid="title"], .title, h2, h3');
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
}

export const realWebScraper = new RealWebScraper(); 