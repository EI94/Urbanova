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

  // Strategia 5: Browser simulation con Puppeteer (se disponibile)
  private async strategyWithPuppeteer(url: string, domain: string): Promise<any> {
    try {
      // Prova a usare Puppeteer se disponibile
      const puppeteer = await this.getPuppeteer();
      if (!puppeteer) {
        throw new Error('Puppeteer non disponibile');
      }

      console.log(`🤖 Tentativo con Puppeteer per ${domain}...`);
      
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });

      const page = await browser.newPage();
      
      // Imposta User-Agent realistico
      await page.setUserAgent(this.userAgentPool[Math.floor(Math.random() * this.userAgentPool.length)]);
      
      // Imposta viewport realistico
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Imposta headers extra
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      });

      // Naviga alla pagina
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Attendi che la pagina sia completamente caricata
      await page.waitForTimeout(3000);

      // Gestisci eventuali popup o cookie banner
      try {
        await page.click('[data-testid="cookie-accept"], .cookie-accept, #accept-cookies, .accept-cookies', { timeout: 5000 });
      } catch (e) {
        // Ignora se non trova il banner
      }

      // Ottieni il contenuto HTML
      const html = await page.content();
      
      await browser.close();
      
      return {
        status: 200,
        data: html,
        headers: {}
      };
      
    } catch (error) {
      console.log(`❌ Puppeteer fallito per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
    }
  }

  // Strategia 6: Strategia con rotazione IP (simulata)
  private async strategyWithIPRotation(url: string, domain: string): Promise<any> {
    try {
      console.log(`🌐 Tentativo con rotazione IP per ${domain}...`);
      
      // Simula rotazione IP cambiando headers
      const headers = {
        ...this.getUltraRealisticHeaders(domain),
        'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'X-Real-IP': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'CF-Connecting-IP': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      };

      return axios.get(url, {
        headers,
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status < 500
      });
      
    } catch (error) {
      console.log(`❌ Rotazione IP fallita per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
    }
  }

  // Strategia 7: Playwright (se disponibile)
  private async strategyWithPlaywright(url: string, domain: string): Promise<any> {
    try {
      // Prova a usare Playwright se disponibile
      const playwright = await this.getPlaywright();
      if (!playwright) {
        throw new Error('Playwright non disponibile');
      }

      console.log(`🤖 Tentativo con Playwright per ${domain}...`);
      
      const browser = await playwright.chromium.launch({
        headless: true
      });

      const context = await browser.newContext({
        userAgent: this.userAgentPool[Math.floor(Math.random() * this.userAgentPool.length)],
        viewport: { width: 1920, height: 1080 },
        extraHTTPHeaders: {
          'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      const page = await context.newPage();
      
      // Naviga alla pagina
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Attendi caricamento
      await page.waitForTimeout(3000);
      
      // Gestisci cookie banner
      try {
        await page.click('[data-testid="cookie-accept"], .cookie-accept, #accept-cookies, .accept-cookies', { timeout: 5000 });
      } catch (e) {
        // Ignora se non trova il banner
      }
      
      const html = await page.content();
      
      await browser.close();
      
      return {
        status: 200,
        data: html,
        headers: {}
      };
      
    } catch (error) {
      console.log(`❌ Playwright fallito per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
    }
  }

  // Strategia 8: OpenAI Web Scraping (gratuito con API key esistente)
  private async strategyWithOpenAI(url: string, domain: string): Promise<any> {
    try {
      console.log(`🤖 Tentativo con OpenAI per ${domain}...`);
      
      // Usa OpenAI per analizzare la pagina (se disponibile)
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error('OpenAI API key non configurata');
      }

      // Per ora, questa è una strategia placeholder
      // In futuro potremmo usare OpenAI per analizzare contenuti web
      console.log(`✅ OpenAI disponibile per ${domain}`);
      
      // Fallback alla strategia semplice
      return await this.strategySimple(url, domain);
      
    } catch (error) {
      console.log(`❌ Strategia OpenAI fallita per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
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

  // Richiesta con retry e rotazione strategie ULTRA-VELOCI (solo gratuite)
  private async makeRequest(url: string, domain: string, maxRetries: number = 1): Promise<any> {
    // Solo strategie ultra-veloci
    const ultraFastStrategies = [
      () => this.strategySimple(url, domain),
      () => this.strategyWithSession(url, domain)
    ];

    // Prova solo le strategie ultra-veloci
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (let i = 0; i < ultraFastStrategies.length; i++) {
        try {
          console.log(`⚡ Tentativo ${attempt} con strategia ultra-veloce ${i + 1} per ${domain}`);
          const result = await ultraFastStrategies[i]();
          
          if (result && result.status === 200) {
            console.log(`✅ Strategia ultra-veloce ${i + 1} riuscita per ${domain}`);
            return result;
          }
        } catch (error) {
          console.log(`❌ Strategia ultra-veloce ${i + 1} fallita per ${domain}:`, error instanceof Error ? error.message : 'Errore sconosciuto');
        }
      }

      // Delay minimo tra i tentativi
      if (attempt < maxRetries) {
        const delay = Math.random() * 200 + 100; // 0.1-0.3 secondi
        console.log(`⏳ Attendo ${Math.round(delay)}ms prima del prossimo tentativo...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error(`Tutte le strategie fallite per ${domain}`);
  }

  // Funzioni helper per ottenere librerie browser automation
  private async getPuppeteer(): Promise<any> {
    try {
      return await import('puppeteer');
    } catch (error) {
      return null;
    }
  }

  private async getPlaywright(): Promise<any> {
    try {
      return await import('playwright');
    } catch (error) {
      return null;
    }
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
    
    // Fonti ottimizzate - solo quelle che funzionano
    const sources = [
      { name: 'Kijiji.it', scraper: () => this.scrapeKijijiAdvanced(criteria) },
      { name: 'Subito.it', scraper: () => this.scrapeSubitoAdvanced(criteria) },
      { name: 'Immobiliare.it', scraper: () => this.scrapeImmobiliareAdvanced(criteria) }
    ];

    // Scraping sequenziale ottimizzato
    console.log(`🚀 Avvio scraping sequenziale per ${sources.length} fonti...`);
    
    for (const source of sources) {
      try {
        console.log(`🔍 Avvio scraping ${source.name}...`);
        
        // Timeout di 15 secondi per ogni fonte
        const sourceResults = await Promise.race([
          source.scraper(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout ${source.name}`)), 15000)
          )
        ]);
        
        if (sourceResults.length > 0) {
          results.push(...sourceResults);
          console.log(`✅ ${source.name}: ${sourceResults.length} terreni trovati`);
          
          // Se abbiamo abbastanza risultati, fermiamoci
          if (results.length >= 3) {
            console.log(`🎯 Abbastanza risultati (${results.length}), fermo qui`);
            break;
          }
        } else {
          console.log(`⚠️ ${source.name}: nessun risultato`);
        }
        
      } catch (error) {
        console.log(`❌ ${source.name} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      }
      
      // Delay breve tra le fonti
      if (source !== sources[sources.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 Totale terreni estratti: ${results.length}`);
    
    // Se non abbiamo risultati, usa dati demo per dimostrare la funzionalità
    if (results.length === 0) {
      console.log('🎭 Nessun risultato reale, uso dati demo per dimostrare la funzionalità...');
      
      const demoLands = [
        {
          id: 'demo_1',
          title: 'Terreno edificabile - Roma EUR',
          price: 95000,
          location: criteria.location,
          area: 1200,
          description: 'Terreno edificabile in zona EUR, ottima posizione per sviluppo residenziale',
          url: 'https://www.immobiliare.it/annunci/demo/1',
          source: 'immobiliare.it (DEMO)',
          images: [],
          features: ['Edificabile', 'Servizi disponibili'],
          contactInfo: {},
          timestamp: new Date().toISOString(),
          hasRealPrice: false,
          hasRealArea: false
        },
        {
          id: 'demo_2',
          title: 'Area commerciale - Roma Trastevere',
          price: 180000,
          location: criteria.location,
          area: 800,
          description: 'Area commerciale in zona Trastevere, ideale per attività commerciali',
          url: 'https://www.subito.it/annunci/demo/2',
          source: 'subito.it (DEMO)',
          images: [],
          features: ['Commerciale', 'Centro città'],
          contactInfo: {},
          timestamp: new Date().toISOString(),
          hasRealPrice: false,
          hasRealArea: false
        },
        {
          id: 'demo_3',
          title: 'Terreno agricolo - Roma Parioli',
          price: 75000,
          location: criteria.location,
          area: 2500,
          description: 'Terreno agricolo in zona Parioli, possibilità di cambio di destinazione',
          url: 'https://www.kijiji.it/annunci/demo/3',
          source: 'kijiji.it (DEMO)',
          images: [],
          features: ['Agricolo', 'Cambio destinazione'],
          contactInfo: {},
          timestamp: new Date().toISOString(),
          hasRealPrice: false,
          hasRealArea: false
        }
      ];
      
      results.push(...demoLands);
      console.log(`🎭 Aggiunti ${demoLands.length} terreni demo`);
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

  // Scraping avanzato per Idealista.it con strategie multiple
  private async scrapeIdealistaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.idealista.it/terreni/vendita/${location}/`;
      
      console.log(`📡 Idealista.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'idealista.it');
      const $ = cheerio.load(response.data);
      
      // Selettori multipli per Idealista.it
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
        '.in-list-item',
        '.nd-list-item'
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
        console.log('❌ Nessun elemento trovato su Idealista.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 15) return;
        
        const $el = $(element);
        
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Idealista ${index + 1}`;
        const url = this.extractUrl($el, 'idealista.it');
        
        if (price || area) {
          results.push({
            id: `idealista_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'idealista.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Idealista.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Idealista.it avanzato:', error);
      return [];
    }
  }

  // Scraping avanzato per Casa.it con strategie multiple
  private async scrapeCasaAdvanced(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    const results: ScrapedLand[] = [];
    
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.casa.it/terreni/vendita/${location}/`;
      
      console.log(`📡 Casa.it URL: ${url}`);
      
      const response = await this.makeRequest(url, 'casa.it');
      const $ = cheerio.load(response.data);
      
      // Selettori multipli per Casa.it
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
        '.in-listing-item',
        '.nd-listing-item'
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
        console.log('❌ Nessun elemento trovato su Casa.it');
        return [];
      }

      elements.each((index: number, element: any) => {
        if (index >= 15) return;
        
        const $el = $(element);
        
        const price = this.extractPrice($el);
        const area = this.extractArea($el);
        const title = this.extractTitle($el) || `Terreno Casa ${index + 1}`;
        const url = this.extractUrl($el, 'casa.it');
        
        if (price || area) {
          results.push({
            id: `casa_adv_${index}`,
            title,
            price: price || 0,
            location: criteria.location,
            area: area || 0,
            description: title,
            url,
            source: 'casa.it (AVANZATO)',
            images: [],
            features: ['Edificabile'],
            contactInfo: {},
            timestamp: new Date(),
            hasRealPrice: !!price,
            hasRealArea: !!area
          });
        }
      });
      
      console.log(`✅ Casa.it: ${results.length} terreni estratti`);
      return results;
      
    } catch (error) {
      console.error('❌ Errore scraping Casa.it avanzato:', error);
      return [];
    }
  }
}

export const advancedWebScraper = new AdvancedWebScraper();
