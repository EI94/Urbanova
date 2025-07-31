// Web Scraper Reale per Terreni - Urbanova AI
import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedLand, LandSearchCriteria } from '@/types/land';

export class RealWebScraper {
  public isInitialized = true; // Sempre true per HTTP scraping

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
      
      // Scraping HTTP parallelo per dati reali
      const scrapingPromises = [
        this.scrapeImmobiliareHTTP(criteria),
        this.scrapeCasaHTTP(criteria),
        this.scrapeIdealistaHTTP(criteria),
        this.scrapeBorsinoImmobiliareHTTP(criteria)
      ];

      const allResults = await Promise.allSettled(scrapingPromises);
      
      allResults.forEach((result, index) => {
        const sourceNames = ['Immobiliare.it', 'Casa.it', 'Idealista.it', 'Borsino Immobiliare'];
        if (result.status === 'fulfilled' && result.value.length > 0) {
          results.push(...result.value);
          console.log(`✅ ${sourceNames[index]}: ${result.value.length} terreni REALI trovati`);
        } else {
          console.log(`❌ ${sourceNames[index]}: nessun dato reale disponibile`);
          if (result.status === 'rejected') {
            console.error(`Errore dettagliato ${sourceNames[index]}:`, result.reason);
          }
        }
      });

      console.log(`✅ Scraping completato: ${results.length} terreni REALI totali`);
      
      if (results.length === 0) {
        console.log('⚠️ ATTENZIONE: Nessun terreno reale trovato. Verificare criteri di ricerca.');
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Errore durante lo scraping:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
      return []; // Ritorna array vuoto invece di dati fittizi
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
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
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
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache'
        }
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
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache'
        }
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
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache'
        }
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
}

export const realWebScraper = new RealWebScraper(); 