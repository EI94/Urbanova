// Servizio API Proxy per Bypassare Protezioni - Urbanova AI
import axios from 'axios';
import { LandSearchCriteria, ScrapedLand } from '@/types/land';

export interface ProxyService {
  name: string;
  url: string;
  apiKey?: string;
  requiresKey: boolean;
  costPerRequest: number;
  successRate: number;
}

export class APIProxyService {
  private proxyServices: ProxyService[] = [
    {
      name: 'ScrapingBee',
      url: 'https://api.scrapingbee.com/api/v1/',
      requiresKey: true,
      costPerRequest: 0.01,
      successRate: 0.85
    },
    {
      name: 'ScrapingAnt',
      url: 'https://api.scrapingant.com/v2/general',
      requiresKey: true,
      costPerRequest: 0.02,
      successRate: 0.90
    },
    {
      name: 'ScraperAPI',
      url: 'https://api.scraperapi.com/',
      requiresKey: true,
      costPerRequest: 0.015,
      successRate: 0.88
    },
    {
      name: 'ZenRows',
      url: 'https://api.zenrows.com/v1/',
      requiresKey: true,
      costPerRequest: 0.025,
      successRate: 0.92
    },
    {
      name: 'BrightData',
      url: 'https://brightdata.com/api/scraping',
      requiresKey: true,
      costPerRequest: 0.03,
      successRate: 0.95
    }
  ];

  // Configurazione API keys (da impostare in environment variables)
  private getAPIKeys(): Record<string, string> {
    return {
      scrapingbee: process.env.SCRAPINGBEE_API_KEY || '',
      scrapingant: process.env.SCRAPINGANT_API_KEY || '',
      scraperapi: process.env.SCRAPERAPI_API_KEY || '',
      zenrows: process.env.ZENROWS_API_KEY || '',
      brightdata: process.env.BRIGHTDATA_API_KEY || ''
    };
  }

  // Testa tutti i servizi proxy disponibili
  async testAllServices(): Promise<{ service: string; working: boolean; error?: string }[]> {
    const results = [];
    const testUrl = 'https://www.idealista.it/terreni/vendita/roma/';
    
    for (const service of this.proxyServices) {
      try {
        console.log(`🧪 Testando ${service.name}...`);
        const result = await this.scrapeWithService(service, testUrl);
        results.push({
          service: service.name,
          working: !!result,
          error: result ? undefined : 'Nessuna risposta'
        });
      } catch (error) {
        results.push({
          service: service.name,
          working: false,
          error: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
      }
    }
    
    return results;
  }

  // Scraping con servizio proxy specifico
  async scrapeWithService(service: ProxyService, url: string): Promise<any> {
    const apiKeys = this.getAPIKeys();
    const serviceKey = service.name.toLowerCase().replace(/\s+/g, '');
    
    if (service.requiresKey && !apiKeys[serviceKey]) {
      throw new Error(`API key mancante per ${service.name}`);
    }

    let proxyUrl = '';
    let params: any = {};

    switch (service.name) {
      case 'ScrapingBee':
        proxyUrl = `${service.url}?api_key=${apiKeys[serviceKey]}&url=${encodeURIComponent(url)}&render_js=false&premium_proxy=true`;
        break;
        
      case 'ScrapingAnt':
        proxyUrl = service.url;
        params = {
          url: url,
          'x-api-key': apiKeys[serviceKey],
          browser: 'false'
        };
        break;
        
      case 'ScraperAPI':
        proxyUrl = `${service.url}?api_key=${apiKeys[serviceKey]}&url=${encodeURIComponent(url)}&render=true&country_code=it`;
        break;
        
      case 'ZenRows':
        proxyUrl = `${service.url}?apikey=${apiKeys[serviceKey]}&url=${encodeURIComponent(url)}&js_render=true&antibot=true`;
        break;
        
      case 'BrightData':
        proxyUrl = `${service.url}?url=${encodeURIComponent(url)}&api_key=${apiKeys[serviceKey]}&render_js=true`;
        break;
        
      default:
        throw new Error(`Servizio ${service.name} non supportato`);
    }

    try {
      const response = await axios.get(proxyUrl, {
        params: Object.keys(params).length > 0 ? params : undefined,
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8'
        }
      });

      if (response.status === 200 && response.data) {
        console.log(`✅ ${service.name} riuscito`);
        return response;
      } else {
        throw new Error(`Risposta non valida da ${service.name}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${service.name} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
      throw error;
    }
  }

  // Scraping con rotazione automatica dei servizi
  async scrapeWithRotation(url: string, maxRetries: number = 3): Promise<any> {
    const apiKeys = this.getAPIKeys();
    const availableServices = this.proxyServices.filter(service => {
      if (!service.requiresKey) return true;
      const serviceKey = service.name.toLowerCase().replace(/\s+/g, '');
      return !!apiKeys[serviceKey];
    });

    if (availableServices.length === 0) {
      throw new Error('Nessun servizio proxy disponibile con API key configurata');
    }

    // Ordina per success rate
    availableServices.sort((a, b) => b.successRate - a.successRate);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const service of availableServices) {
        try {
          console.log(`🔄 Tentativo ${attempt} con ${service.name}...`);
          const result = await this.scrapeWithService(service, url);
          return result;
        } catch (error) {
          console.log(`❌ ${service.name} fallito:`, error instanceof Error ? error.message : 'Errore sconosciuto');
          continue;
        }
      }

      if (attempt < maxRetries) {
        const delay = Math.random() * 3000 + 2000;
        console.log(`⏳ Attendo ${Math.round(delay)}ms prima del prossimo tentativo...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Tutti i servizi proxy falliti');
  }

  // Scraping specifico per Idealista.it
  async scrapeIdealista(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.idealista.it/terreni/vendita/${location}/`;
      
      console.log(`🌐 Scraping Idealista.it con proxy: ${url}`);
      
      const response = await this.scrapeWithRotation(url);
      
      // Qui dovresti implementare il parsing del contenuto
      // Per ora restituiamo un array vuoto
      console.log(`✅ Idealista.it scraped con proxy`);
      
      return [];
      
    } catch (error) {
      console.error('❌ Errore scraping Idealista.it con proxy:', error);
      return [];
    }
  }

  // Scraping specifico per Casa.it
  async scrapeCasa(criteria: LandSearchCriteria): Promise<ScrapedLand[]> {
    try {
      const location = criteria.location.toLowerCase().replace(/\s+/g, '-');
      const url = `https://www.casa.it/terreni/vendita/${location}/`;
      
      console.log(`🌐 Scraping Casa.it con proxy: ${url}`);
      
      const response = await this.scrapeWithRotation(url);
      
      // Qui dovresti implementare il parsing del contenuto
      // Per ora restituiamo un array vuoto
      console.log(`✅ Casa.it scraped con proxy`);
      
      return [];
      
    } catch (error) {
      console.error('❌ Errore scraping Casa.it con proxy:', error);
      return [];
    }
  }

  // Ottieni statistiche dei servizi
  getServiceStats(): { totalServices: number; availableServices: number; totalCost: number } {
    const apiKeys = this.getAPIKeys();
    const availableServices = this.proxyServices.filter(service => {
      if (!service.requiresKey) return true;
      const serviceKey = service.name.toLowerCase().replace(/\s+/g, '');
      return !!apiKeys[serviceKey];
    });

    const totalCost = availableServices.reduce((sum, service) => sum + service.costPerRequest, 0);

    return {
      totalServices: this.proxyServices.length,
      availableServices: availableServices.length,
      totalCost
    };
  }

  // Ottieni servizi disponibili
  getAvailableServices(): ProxyService[] {
    const apiKeys = this.getAPIKeys();
    return this.proxyServices.filter(service => {
      if (!service.requiresKey) return true;
      const serviceKey = service.name.toLowerCase().replace(/\s+/g, '');
      return !!apiKeys[serviceKey];
    });
  }
}

export const apiProxyService = new APIProxyService();
