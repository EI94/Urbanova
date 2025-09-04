// 🚀 BYPASS CLOUDFLARE AVANZATO - URBANOVA AI
// Sistema per bypassare le protezioni di casa.it e idealista.it

// import puppeteer, { Browser, Page } from 'puppeteer';

// Mock puppeteer
const puppeteer = {} as any;
type Browser = any;
type Page = any;

import { ScrapedLand, LandSearchCriteria } from '@/types/land';

export class CloudflareBypass {
  private browser: Browser | null = null;
  private isInitialized = false;

  // Configurazione avanzata per bypass Cloudflare
  private readonly bypassConfig = {
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ],
    timeouts: {
      pageLoad: 30000,
      navigation: 15000,
      cloudflare: 45000,
      captcha: 60000,
    },
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🚀 Inizializzazione Cloudflare Bypass...');

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
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-crash-upload',
          '--no-default-browser-check',
          '--no-pings',
          '--no-print-background',
          '--no-sandbox',
          '--no-zygote',
          '--single-process',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ],
      });

      this.isInitialized = true;
      console.log('✅ Cloudflare Bypass inizializzato');
    } catch (error) {
      console.error('❌ Errore inizializzazione Cloudflare Bypass:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      console.log('✅ Cloudflare Bypass chiuso');
    }
  }

  // Bypass Cloudflare per casa.it
  async bypassCasaIt(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔓 Tentativo bypass Cloudflare per casa.it...');

    if (!this.browser) {
      throw new Error('Browser non inizializzato');
    }

    const page = await this.browser.newPage();
    const results: ScrapedLand[] = [];

    try {
      // Configurazione avanzata per bypass
      await this.configurePageForBypass(page);

      // URL corretto per casa.it
      const url = `https://www.casa.it/terreni/vendita/${criteria.location.toLowerCase().replace(/\s+/g, '-')}/`;
      console.log('📡 Tentativo accesso:', url);

      // Navigazione con gestione Cloudflare
      await this.navigateWithCloudflareBypass(page, url);

      // Verifica se il bypass è riuscito
      const isBypassed = await this.verifyBypassSuccess(page);

      if (!isBypassed) {
        console.log('❌ Bypass Cloudflare fallito per casa.it');
        return [];
      }

      console.log('✅ Bypass Cloudflare riuscito per casa.it!');

      // Estrazione dati
      const lands = await this.extractCasaItLands(page, criteria);
      results.push(...lands);

      console.log(`✅ Casa.it: ${lands.length} terreni estratti con bypass`);
    } catch (error) {
      console.error('❌ Errore bypass casa.it:', error);
    } finally {
      await page.close();
    }

    return results;
  }

  // Bypass Cloudflare per idealista.it
  async bypassIdealistaIt(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    console.log('🔓 Tentativo bypass Cloudflare per idealista.it...');

    if (!this.browser) {
      throw new Error('Browser non inizializzato');
    }

    const page = await this.browser.newPage();
    const results: ScrapedLand[] = [];

    try {
      // Configurazione avanzata per bypass
      await this.configurePageForBypass(page);

      // URL corretto per idealista.it
      const url = `https://www.idealista.it/terreni/vendita/${criteria.location.toLowerCase().replace(/\s+/g, '-')}/`;
      console.log('📡 Tentativo accesso:', url);

      // Navigazione con gestione Cloudflare
      await this.navigateWithCloudflareBypass(page, url);

      // Verifica se il bypass è riuscito
      const isBypassed = await this.verifyBypassSuccess(page);

      if (!isBypassed) {
        console.log('❌ Bypass Cloudflare fallito per idealista.it');
        return [];
      }

      console.log('✅ Bypass Cloudflare riuscito per idealista.it!');

      // Estrazione dati
      const lands = await this.extractIdealistaItLands(page, criteria);
      results.push(...lands);

      console.log(`✅ Idealista.it: ${lands.length} terreni estratti con bypass`);
    } catch (error) {
      console.error('❌ Errore bypass idealista.it:', error);
    } finally {
      await page.close();
    }

    return results;
  }

  // Configurazione avanzata della pagina per bypass
  private async configurePageForBypass(page: Page): Promise<void> {
    // User Agent casuale
    const userAgent =
      this.bypassConfig.userAgents[Math.floor(Math.random() * this.bypassConfig.userAgents.length)];
    await page.setUserAgent(userAgent);

    // Viewport casuale
    const viewport =
      this.bypassConfig.viewports[Math.floor(Math.random() * this.bypassConfig.viewports.length)];
    await page.setViewport(viewport);

    // Headers avanzati per bypass
    await page.setExtraHTTPHeaders({
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
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
    });

    // Intercettazione richieste per bypass
    await page.setRequestInterception(true);

    page.on('request', (request: any) => {
      // Bypass fingerprinting
      if (request.resourceType() === 'script' && request.url().includes('fingerprint')) {
        request.abort();
      } else if (request.resourceType() === 'image') {
        // Carica solo immagini essenziali
        if (request.url().includes('logo') || request.url().includes('favicon')) {
          request.continue();
        } else {
          request.abort();
        }
      } else {
        request.continue();
      }
    });

    // Simulazione comportamento umano
    await page.evaluateOnNewDocument(() => {
      // Bypass WebDriver detection
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Bypass Chrome detection
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Bypass Permissions detection
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'granted' }),
        }),
      });

      // Bypass Languages detection
      Object.defineProperty(navigator, 'languages', {
        get: () => ['it-IT', 'it', 'en-US', 'en'],
      });
    });
  }

  // Navigazione con gestione Cloudflare
  private async navigateWithCloudflareBypass(page: Page, url: string): Promise<void> {
    try {
      // Prima navigazione
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.bypassConfig.timeouts.pageLoad,
      });

      // Gestione Cloudflare Challenge
      await this.handleCloudflareChallenge(page);

      // Attesa per rendering completo
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('⚠️ Errore navigazione, tentativo recovery...');
      await this.handleNavigationError(page, url);
    }
  }

  // Gestione Cloudflare Challenge
  private async handleCloudflareChallenge(page: Page): Promise<void> {
    try {
      // Attesa per Cloudflare Challenge
      const challengeSelector =
        'iframe[src*="cloudflare"], .cf-browser-verification, #challenge-form';

      const hasChallenge = await page.$(challengeSelector);

      if (hasChallenge) {
        console.log('🛡️ Rilevato Cloudflare Challenge, attendo risoluzione...');

        // Attesa per risoluzione automatica
        await page.waitForFunction(
          () =>
            !document.querySelector('iframe[src*="cloudflare"]') &&
            !document.querySelector('.cf-browser-verification') &&
            !document.querySelector('#challenge-form'),
          { timeout: this.bypassConfig.timeouts.cloudflare }
        );

        console.log('✅ Cloudflare Challenge risolto automaticamente');
      }

      // Gestione DataDome Captcha
      const captchaSelector = '#cmsg, .captcha, [data-cfasync]';
      const hasCaptcha = await page.$(captchaSelector);

      if (hasCaptcha) {
        console.log('🧩 Rilevato DataDome Captcha, tentativo bypass...');

        // Attesa per risoluzione automatica
        await page.waitForFunction(
          () =>
            !document.querySelector('#cmsg') &&
            !document.querySelector('.captcha') &&
            !document.querySelector('[data-cfasync]'),
          { timeout: this.bypassConfig.timeouts.captcha }
        );

        console.log('✅ DataDome Captcha risolto automaticamente');
      }
    } catch (error) {
      console.log('⚠️ Timeout gestione challenge, continuo...');
    }
  }

  // Gestione errori di navigazione
  private async handleNavigationError(page: Page, url: string): Promise<void> {
    try {
      // Retry con timeout ridotto
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.bypassConfig.timeouts.navigation,
      });

      console.log('✅ Recovery navigazione riuscito');
    } catch (error) {
      console.error('❌ Recovery navigazione fallito:', error);
      throw error;
    }
  }

  // Verifica successo bypass
  private async verifyBypassSuccess(page: Page): Promise<boolean> {
    try {
      // Verifica che non ci siano più challenge
      const hasChallenge = await page.$(
        'iframe[src*="cloudflare"], .cf-browser-verification, #challenge-form'
      );
      const hasCaptcha = await page.$('#cmsg, .captcha, [data-cfasync]');

      if (hasChallenge || hasCaptcha) {
        return false;
      }

      // Verifica che la pagina sia caricata correttamente
      const title = await page.title();
      const content = await page.content();

      return (
        title.length > 0 &&
        content.length > 10000 &&
        !content.includes('Please enable JS') &&
        !content.includes('Please wait while we verify')
      );
    } catch (error) {
      console.error('❌ Errore verifica bypass:', error);
      return false;
    }
  }

  // Estrazione terreni da casa.it
  private async extractCasaItLands(
    page: Page,
    criteria: LandSearchCriteria
  ): Promise<ScrapedLand[]> {
    const lands: ScrapedLand[] = [];

    try {
      // Selettori per casa.it
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

      let elements: any[] = [];

      for (const selector of selectors) {
        elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (elements.length === 0) {
        console.log('❌ Nessun elemento trovato su casa.it');
        return [];
      }

      // Estrazione dati
      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        try {
          const element = elements[i];

          // Estrazione prezzo
          const priceText = await element.evaluate((el: any) => {
            const priceEl = el.querySelector('.price, [class*="price"], .listing-price');
            return priceEl ? priceEl.textContent.trim() : '';
          });

          const price = this.extractPrice(priceText);

          // Estrazione area
          const areaText = await element.evaluate((el: any) => {
            const areaEl = el.querySelector('.area, [class*="area"], .listing-area');
            return areaEl ? areaEl.textContent.trim() : '';
          });

          const area = this.extractArea(areaText);

          // Estrazione titolo
          const title = await element.evaluate((el: any) => {
            const titleEl = el.querySelector('h2, h3, .title, [class*="title"]');
            return titleEl ? titleEl.textContent.trim() : `Terreno Casa ${i + 1}`;
          });

          // Estrazione link
          const url = await element.evaluate((el: any) => {
            const linkEl = el.querySelector('a');
            return linkEl ? linkEl.href : '';
          });

          if (price || area) {
            lands.push({
              id: `casa_bypass_${i}`,
              title: title,
              price: price || 0,
              location: criteria.location,
              area: area || 0,
              description: title,
              url: url,
              source: 'casa.it (BYPASS CLOUDFLARE)',
              images: [],
              features: ['Edificabile'],
              contactInfo: {},
              timestamp: new Date(),
              hasRealPrice: !!price,
              hasRealArea: !!area,
            });
          }
        } catch (error) {
          console.log(`⚠️ Errore estrazione terreno ${i + 1}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Errore estrazione terreni casa.it:', error);
    }

    return lands;
  }

  // Estrazione terreni da idealista.it
  private async extractIdealistaItLands(
    page: Page,
    criteria: LandSearchCriteria
  ): Promise<ScrapedLand[]> {
    const lands: ScrapedLand[] = [];

    try {
      // Selettori per idealista.it
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

      let elements: any[] = [];

      for (const selector of selectors) {
        elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ Trovati ${elements.length} elementi con selettore: ${selector}`);
          break;
        }
      }

      if (elements.length === 0) {
        console.log('❌ Nessun elemento trovato su idealista.it');
        return [];
      }

      // Estrazione dati
      for (let i = 0; i < Math.min(elements.length, 10); i++) {
        try {
          const element = elements[i];

          // Estrazione prezzo
          const priceText = await element.evaluate((el: any) => {
            const priceEl = el.querySelector('.price, [class*="price"], .listing-price');
            return priceEl ? priceEl.textContent.trim() : '';
          });

          const price = this.extractPrice(priceText);

          // Estrazione area
          const areaText = await element.evaluate((el: any) => {
            const areaEl = el.querySelector('.area, [class*="area"], .listing-area');
            return areaEl ? areaEl.textContent.trim() : '';
          });

          const area = this.extractArea(areaText);

          // Estrazione titolo
          const title = await element.evaluate((el: any) => {
            const titleEl = el.querySelector('h2, h3, .title, [class*="title"]');
            return titleEl ? titleEl.textContent.trim() : `Terreno Idealista ${i + 1}`;
          });

          // Estrazione link
          const url = await element.evaluate((el: any) => {
            const linkEl = el.querySelector('a');
            return linkEl ? linkEl.href : '';
          });

          if (price || area) {
            lands.push({
              id: `idealista_bypass_${i}`,
              title: title,
              price: price || 0,
              location: criteria.location,
              area: area || 0,
              description: title,
              url: url,
              source: 'idealista.it (BYPASS CLOUDFLARE)',
              images: [],
              features: ['Edificabile'],
              contactInfo: {},
              timestamp: new Date(),
              hasRealPrice: !!price,
              hasRealArea: !!area,
            });
          }
        } catch (error) {
          console.log(`⚠️ Errore estrazione terreno ${i + 1}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Errore estrazione terreni idealista.it:', error);
    }

    return lands;
  }

  // Estrazione prezzo
  private extractPrice(priceText: string): number | null {
    if (!priceText) return null;

    const match = priceText.match(/[\d.,]+/);
    if (match) {
      const price = parseFloat(match[0].replace(/[.,]/g, ''));
      return price > 1000 ? price : null;
    }

    return null;
  }

  // Estrazione area
  private extractArea(areaText: string): number | null {
    if (!areaText) return null;

    const match = areaText.match(/[\d.,]+/);
    if (match) {
      const area = parseFloat(match[0].replace(/[.,]/g, ''));
      return area > 10 ? area : null;
    }

    return null;
  }
}

export const cloudflareBypass = new CloudflareBypass();
