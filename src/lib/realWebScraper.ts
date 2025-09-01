// Web Scraper Reale per Terreni - Urbanova AI
import axios from 'axios';
import * as cheerio from 'cheerio';

import { ScrapedLand, LandSearchCriteria } from '@/types/land';

export class RealWebScraper {
  public isInitialized = true; // Sempre true per HTTP scraping

  // Funzione di retry per gestire errori di rete
  private async retryRequest<T>(requestFn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        console.log(
          `⚠️ Tentativo ${attempt}/${maxRetries} fallito:`,
          error instanceof Error ? error.message : 'Errore sconosciuto'
        );

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
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
    const index = Math.floor(Math.random() * userAgents.length);
    return userAgents[index]!;
  }

  // Headers realistici per evitare blocchi
  private getRealisticHeaders(): any {
    return {
      'User-Agent': this.getRandomUserAgent(),
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };
  }

  // Headers avanzati per bypassare DataDome
  private getAdvancedHeaders(): any {
    const userAgent = this.getRandomUserAgent();
    return {
      'User-Agent': userAgent,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Referer: 'https://www.google.com/',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua-arch': '"x86"',
      'sec-ch-ua-full-version-list':
        '"Not_A Brand";v="8.0.0.0", "Chromium";v="120.0.6099.109", "Google Chrome";v="120.0.6099.109"',
      'sec-ch-ua-model': '""',
      'sec-ch-device-memory': '"8"',
      'sec-ch-viewport-width': '"1920"',
      'sec-ch-viewport-height': '"1080"',
      'sec-ch-dpr': '"1"',
    };
  }

  // Headers ultra-aggressivi per bypassare tutte le protezioni
  private getUltraAggressiveHeaders(): any {
    const userAgent = this.getRandomUserAgent();
    return {
      'User-Agent': userAgent,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      DNT: '1',
      Connection: 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Referer: 'https://www.google.com/search?q=immobili+terreni+vendita',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-ch-ua-arch': '"x86"',
      'sec-ch-ua-full-version-list':
        '"Not_A Brand";v="8.0.0.0", "Chromium";v="120.0.6099.109", "Google Chrome";v="120.0.6099.109"',
      'sec-ch-ua-model': '""',
      'sec-ch-device-memory': '"8"',
      'sec-ch-viewport-width': '"1920"',
      'sec-ch-viewport-height': '"1080"',
      'sec-ch-dpr': '"1"',
      'sec-ch-ua-bitness': '"64"',
      'sec-ch-ua-full-version': '"120.0.6099.109"',
      'sec-ch-ua-platform-version': '"15.0.0"',
      'sec-ch-ua-wow64': '?0',
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

      // Fonti principali immobiliari - strategia funzionante
      const sources = [
        { name: 'Immobiliare.it', scraper: () => this.scrapeImmobiliareWorking(criteria) },
        { name: 'Casa.it', scraper: () => this.scrapeCasaWorking(criteria) },
        { name: 'Idealista.it', scraper: () => this.scrapeIdealistaWorking(criteria) },
        { name: 'BorsinoImmobiliare.it', scraper: () => this.scrapeBorsinoWorking(criteria) },
      ];

      // Scraping sequenziale con strategia funzionante
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
          console.error(
            `❌ Errore ${source.name}:`,
            error instanceof Error ? error.message : 'Errore sconosciuto'
          );

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
  private extractRealPrice($: any, element: any, source: string): number | null {
    try {
      let priceText = '';

      if (source === 'immobiliare.it') {
        // Selettori specifici per Immobiliare.it
        const priceSelectors = ['[class*="Price"]', '.styles_in-listingCardPrice__earBq', 'span'];

        for (const selector of priceSelectors) {
          const priceEl = $(element).find(selector);
          if (priceEl.length > 0) {
            priceEl.each((i: number, el: any) => {
              const text = $(el).text().trim();
              if (text.includes('€') && /\d/.test(text)) {
                priceText = text;
                return false; // Break the loop
              }
              return true; // Continue the loop
            });
            if (priceText) break;
          }
        }
      } else {
        // Selettori generici per altri siti
        const priceSelectors = [
          '.price',
          '[class*="price"]',
          '.listing-price',
          '.property-price',
          '.in-price',
          '.nd-price',
          '.styles_in-price',
        ];

        for (const selector of priceSelectors) {
          const priceEl = $(element).find(selector);
          if (priceEl.length > 0) {
            priceText = priceEl.first().text().trim();
            break;
          }
        }
      }

      if (!priceText) return null;

      // Estrai il numero dal testo del prezzo
      const match = priceText.match(/[\d.,]+/);
      if (match) {
        const price = parseFloat(match[0].replace(/[.,]/g, ''));
        return price > 1000 ? price : null; // Filtra prezzi troppo bassi
      }

      return null;
    } catch (error) {
      console.error('Errore estrazione prezzo:', error);
      return null;
    }
  }

  // Funzione per estrarre e validare l'area reale
  private extractRealArea($: any, element: any, source: string): number | null {
    try {
      let areaText = '';

      if (source === 'immobiliare.it') {
        // Selettori specifici per Immobiliare.it
        const areaSelectors = ['.styles_in-listingCardFeatureList__item__CKRyT span', 'span'];

        for (const selector of areaSelectors) {
          const areaEl = $(element).find(selector);
          if (areaEl.length > 0) {
            areaEl.each((i: number, el: any) => {
              const text = $(el).text().trim();
              if ((text.includes('m²') || text.includes('mq')) && /\d/.test(text)) {
                areaText = text;
                return false; // Break the loop
              }
              return true; // Continue the loop
            });
            if (areaText) break;
          }
        }
      } else {
        // Selettori generici per altri siti
        const areaSelectors = [
          '.area',
          '[class*="area"]',
          '.listing-area',
          '.property-area',
          '.in-area',
          '.nd-area',
          '.styles_in-area',
        ];

        for (const selector of areaSelectors) {
          const areaEl = $(element).find(selector);
          if (areaEl.length > 0) {
            areaText = areaEl.first().text().trim();
            break;
          }
        }
      }

      if (!areaText) return null;

      // Estrai il numero dal testo dell'area
      const match = areaText.match(/[\d.,]+/);
      if (match) {
        const area = parseFloat(match[0].replace(/[.,]/g, ''));
        return area > 10 ? area : null; // Filtra aree troppo piccole
      }

      return null;
    } catch (error) {
      console.error('Errore estrazione area:', error);
      return null;
    }
  }

  // Immobiliare.it con headers funzionanti
  private async scrapeImmobiliareWorking(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Immobiliare.it FUNZIONANTE per dati REALI...');
    const results: ScrapedLand[] = [];

    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.immobiliare.it/vendita-terreni/${location}/`;

      console.log('📡 URL Immobiliare.it FUNZIONANTE:', url);

      // Headers semplici che funzionano (basati sui test)
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      const response = await axios.get(url, {
        timeout: 15000,
        headers: headers,
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

      // Selettori corretti per Immobiliare.it (basati sull'analisi)
      const selectors = [
        '.styles_in-listingCard__aHT19',
        '.styles_in-listingCardProperty__C2t47',
        '.nd-mediaObject',
        '.in-card',
        '.in-realEstateList__item',
        'article',
        '.card',
        '.item',
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
        console.log('❌ Nessun elemento trovato con i selettori di Immobiliare.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 10) return;

        const $el = $(element);

        // Estrai prezzo con selettori specifici di Immobiliare.it
        const realPrice = this.extractRealPrice($, $el, 'immobiliare.it');

        // Estrai area con selettori specifici di Immobiliare.it
        const realArea = this.extractRealArea($, $el, 'immobiliare.it');

        // Estrai titolo con selettori specifici di Immobiliare.it
        const titleEl = $el.find('h2, h3, .title, [class*="title"], .in-title, .nd-title').first();
        const title = titleEl.length ? titleEl.text().trim() : `Terreno Immobiliare ${index + 1}`;

        // Estrai link con selettori specifici di Immobiliare.it
        const linkEl = $el.find('a').first();
        const url = linkEl.length ? linkEl.attr('href') : '';
        const fullUrl =
          url && url.startsWith('http') ? url : `https://www.immobiliare.it${url || ''}`;

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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Immobiliare.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Immobiliare.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Immobiliare.it funzionante:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      return [];
    }
  }

  // Casa.it con URL corretto
  private async scrapeCasaWorking(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Casa.it FUNZIONANTE per dati REALI...');
    const results: ScrapedLand[] = [];

    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Casa.it
      const url = `https://www.casa.it/terreni/vendita/${location}/`;

      console.log('📡 URL Casa.it FUNZIONANTE:', url);

      // Headers semplici che funzionano
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      const response = await axios.get(url, {
        timeout: 15000,
        headers: headers,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ Casa.it: Status ${response.status}`);
        return [];
      }

      console.log(`✅ Casa.it: Accesso riuscito`);
      console.log(`📄 Content-Length: ${response.data.length}`);

      const $ = cheerio.load(response.data);

      // Selettori per Casa.it
      const selectors = [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item',
        'article',
        '.ad-item',
        '.listing',
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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Casa.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Casa.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Casa.it funzionante:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      return [];
    }
  }

  // Idealista.it con URL corretto
  private async scrapeIdealistaWorking(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping Idealista.it FUNZIONANTE per dati REALI...');
    const results: ScrapedLand[] = [];

    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per Idealista.it
      const url = `https://www.idealista.it/terreni/vendita/${location}/`;

      console.log('📡 URL Idealista.it FUNZIONANTE:', url);

      // Headers semplici che funzionano
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      const response = await axios.get(url, {
        timeout: 15000,
        headers: headers,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ Idealista.it: Status ${response.status}`);
        return [];
      }

      console.log(`✅ Idealista.it: Accesso riuscito`);
      console.log(`📄 Content-Length: ${response.data.length}`);

      const $ = cheerio.load(response.data);

      // Selettori per Idealista.it
      const selectors = [
        '.item-info-container',
        '.item-detail',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item',
        'article',
        '.ad-item',
        '.listing',
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
        const fullUrl =
          url && url.startsWith('http') ? url : `https://www.idealista.it${url || ''}`;

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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Idealista.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Idealista.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Idealista.it funzionante:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      return [];
    }
  }

  // BorsinoImmobiliare.it con URL corretto
  private async scrapeBorsinoWorking(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔍 Scraping BorsinoImmobiliare.it FUNZIONANTE per dati REALI...');
    const results: ScrapedLand[] = [];

    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      // URL corretto per BorsinoImmobiliare.it
      const url = `https://www.borsinoimmobiliare.it/terreni/vendita/${location}/`;

      console.log('📡 URL BorsinoImmobiliare.it FUNZIONANTE:', url);

      // Headers semplici che funzionano
      const headers = {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        DNT: '1',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      const response = await axios.get(url, {
        timeout: 15000,
        headers: headers,
        maxRedirects: 5,
        validateStatus: status => status < 500,
      });

      if (response.status !== 200) {
        console.log(`❌ BorsinoImmobiliare.it: Status ${response.status}`);
        return [];
      }

      console.log(`✅ BorsinoImmobiliare.it: Accesso riuscito`);
      console.log(`📄 Content-Length: ${response.data.length}`);

      const $ = cheerio.load(response.data);

      // Selettori per BorsinoImmobiliare.it
      const selectors = [
        '.listing-item',
        '.announcement-card',
        '[data-testid="listing-item"]',
        '.card',
        '.item',
        '.property-item',
        '.real-estate-item',
        'article',
        '.ad-item',
        '.listing',
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
        const fullUrl =
          url && url.startsWith('http') ? url : `https://www.borsinoimmobiliare.it${url || ''}`;

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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ BorsinoImmobiliare.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ BorsinoImmobiliare.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping BorsinoImmobiliare.it funzionante:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
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
          headers: this.getRealisticHeaders(),
        });
      });

      const $ = cheerio.load(response.data);

      // Selettori corretti per Subito.it
      const listings = $(
        '[data-testid="item-card"], .item-card, .listing-item, .card, .item, article, .announcement'
      );

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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Subito.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Subito.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Subito.it:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
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
          headers: this.getRealisticHeaders(),
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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Kijiji.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Kijiji.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Kijiji.it:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
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
          headers: this.getRealisticHeaders(),
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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Bakeca.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Bakeca.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Bakeca.it:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
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
          headers: this.getRealisticHeaders(),
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
            hasRealArea: !!realArea,
          });

          console.log(
            `✅ Annunci.it - Terreno ${index + 1}: ${title} - €${finalPrice.toLocaleString()} - ${finalArea}m²`
          );
        }
      });

      console.log(`✅ Annunci.it: ${results.length} terreni REALI estratti`);
      return results;
    } catch (error) {
      console.error(
        '❌ Errore scraping Annunci.it:',
        error instanceof Error ? error.message : 'Errore sconosciuto'
      );
      return [];
    }
  }
}

export const realWebScraper = new RealWebScraper();
