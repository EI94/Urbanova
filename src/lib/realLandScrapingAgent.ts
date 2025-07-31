// Agente Land Scraping Reale - Urbanova AI
import { realWebScraper } from './realWebScraper';
import { realEmailService, EmailNotification } from './realEmailService';
import { realAIService } from './realAIService';
import { cacheService } from './cacheService';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ScrapedLand, LandSearchCriteria, LandAnalysis, RealLandScrapingResult } from '@/types/land';

export class RealLandScrapingAgent {
  private name: string;
  private version: string;

  constructor() {
    this.name = "Real AI Land Scraper";
    this.version = "2.0";
  }

  async runAutomatedSearch(criteria: LandSearchCriteria, email: string): Promise<RealLandScrapingResult> {
    console.log(`🚀 [${this.name}] Avvio ricerca automatizzata per ${email}`);
    
    try {
      // 0. Inizializza Web Scraper
      console.log('🔧 Fase 0: Inizializzazione Web Scraper...');
      await realWebScraper.initialize();
      
      // 1. Controlla Cache per velocità
      console.log('🔍 Fase 1: Controllo Cache...');
      const cachedResult = await cacheService.get(criteria);
      if (cachedResult) {
        console.log('⚡ Risultati trovati in cache!');
        await realWebScraper.close();
        return cachedResult;
      }
      
      // 2. Web Scraping PARALLELO per velocità
      console.log('🔍 Fase 2: Web Scraping Parallelo...');
      const lands = await realWebScraper.scrapeLands(criteria);
      
      if (lands.length === 0) {
        console.log('⚠️ Nessun terreno trovato');
        await realWebScraper.close();
        return {
          lands: [],
          analysis: [],
          emailSent: false,
          summary: {
            totalFound: 0,
            averagePrice: 0,
            bestOpportunities: [],
            marketTrends: 'Nessun dato disponibile',
            recommendations: ['Ampliare i criteri di ricerca']
          }
        };
      }

      // 2. Analisi AI PARALLELA per velocità
      console.log('🤖 Fase 2: Analisi AI Parallela...');
      const topLands = lands.slice(0, 5); // Analizza solo i top 5 per efficienza
      
      const analysisPromises = topLands.map(async (land) => {
        try {
          const landAnalysis = await realAIService.analyzeLand(land);
          land.aiScore = await realAIService.calculateAdvancedAIScore(land, landAnalysis);
          return landAnalysis;
        } catch (error) {
          console.error(`Errore analisi AI per ${land.title}:`, error);
          return realAIService['fallbackAnalysis'](land);
        }
      });
      
      const analysisResults = await Promise.allSettled(analysisPromises);
      const analysis = analysisResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<LandAnalysis>).value);

      // 3. Analisi Trend e Raccomandazioni PARALLELE
      console.log('📊 Fase 3: Analisi Trend e Raccomandazioni...');
      const [marketTrends, recommendations] = await Promise.all([
        realAIService.analyzeMarketTrends(criteria.location || 'Italia'),
        realAIService.generateInvestmentRecommendations(lands)
      ]);

      // 4. Prepara Summary
      const summary = {
        totalFound: lands.length,
        averagePrice: Math.round(lands.reduce((sum, land) => sum + land.price, 0) / lands.length),
        bestOpportunities: lands.slice(0, 5),
        marketTrends,
        recommendations
      };

      // 5. Salvataggio e Email NON BLOCCANTI
      console.log('💾 Fase 4: Salvataggio e Email...');
      const savePromise = this.saveSearchResults(lands, analysis, summary, criteria, email)
        .catch(error => console.error('❌ Errore salvataggio:', error));
      
      const emailPromise = this.sendEmailNotification(email, lands, summary, analysis)
        .then(() => {
          console.log('✅ Email inviata con successo');
          return true;
        })
        .catch(error => {
          console.error('❌ Errore invio email:', error);
          return false;
        });
      
      // Attendi solo il salvataggio, email in background
      await savePromise;

      // 6. Prepara risultato finale
      const result = {
        lands,
        analysis,
        emailSent: await emailPromise,
        summary
      };

      // 7. Salva in cache per future ricerche
      await cacheService.set(criteria, result, 15 * 60 * 1000); // 15 minuti

      console.log(`✅ [${this.name}] Ricerca automatizzata completata con successo`);
      
      return result;

    } catch (error) {
      console.error(`❌ [${this.name}] Errore nella ricerca automatizzata:`, error);
      throw error;
    } finally {
      // Chiudi browser per liberare risorse
      await realWebScraper.close();
    }
  }

  private async sendEmailNotification(
    email: string, 
    lands: ScrapedLand[], 
    summary: any, 
    analysis: LandAnalysis[]
  ): Promise<void> {
    const bestLands = summary.bestOpportunities;
    const bestAnalysis = analysis.slice(0, 5);

    const notification: EmailNotification = {
      to: email,
      subject: `🏗️ ${lands.length} Nuove Opportunità Terreni - Urbanova AI`,
      htmlContent: this.generateAdvancedEmailHTML(lands, summary, bestAnalysis),
      lands,
      summary
    };

    await realEmailService.sendEmail(notification);
  }

  private generateAdvancedEmailHTML(
    lands: ScrapedLand[], 
    summary: any, 
    analysis: LandAnalysis[]
  ): string {
    const bestLandsHTML = summary.bestOpportunities.map((land: ScrapedLand, index: number) => {
      const landAnalysis = analysis[index] || analysis[0];
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${land.title}</h3>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">📍 ${land.location}</p>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #059669; font-weight: bold; font-size: 16px;">€${land.price.toLocaleString()}</span>
            <span style="color: #6b7280; font-size: 14px;">${land.area}m² • €${land.pricePerSqm}/m²</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              AI Score: ${land.aiScore}/100
            </span>
            <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
              ROI: ${landAnalysis?.estimatedROI || 8}%
            </span>
          </div>
          <div style="background: #f9fafb; padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              <strong>Analisi AI:</strong> ${landAnalysis?.riskAssessment || 'Medio'} rischio, 
              ${landAnalysis?.timeToMarket || '12-18 mesi'} al mercato
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #6b7280;">${land.source}</span>
            <a href="${land.url}" style="background: #3b82f6; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; font-size: 14px;">
              Vedi Dettagli
            </a>
          </div>
        </div>
      `;
    }).join('');

    const recommendationsHTML = summary.recommendations.map((rec: string) => 
      `<li style="margin-bottom: 4px; color: #374151;">${rec}</li>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuove Opportunità Terreni - Urbanova AI</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; text-align: center; font-size: 28px;">🏗️ Urbanova AI</h1>
          <p style="color: white; text-align: center; margin: 10px 0 0 0; font-size: 16px;">
            Scopri le migliori opportunità immobiliari con AI
          </p>
        </div>

        <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="margin: 0 0 16px 0; color: #1f2937;">📊 Riepilogo Ricerca</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${summary.totalFound}</div>
              <div style="font-size: 14px; color: #6b7280;">Terreni Trovati</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">€${summary.averagePrice.toLocaleString()}</div>
              <div style="font-size: 14px; color: #6b7280;">Prezzo Medio</div>
            </div>
          </div>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #92400e;">📈 Trend di Mercato</h3>
          <p style="margin: 0; color: #92400e; font-size: 14px;">${summary.marketTrends}</p>
        </div>

        <h2 style="margin: 0 0 16px 0; color: #1f2937;">🏆 Migliori Opportunità</h2>
        ${bestLandsHTML}

        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-top: 24px;">
          <h3 style="margin: 0 0 8px 0; color: #0c4a6e;">💡 Raccomandazioni AI</h3>
          <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
            ${recommendationsHTML}
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin: 0;">
            Questa email è stata generata automaticamente da Urbanova AI<br>
            <a href="https://urbanova.life/dashboard" style="color: #3b82f6;">Accedi al Dashboard</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private async saveSearchResults(
    lands: ScrapedLand[], 
    analysis: LandAnalysis[], 
    summary: any, 
    criteria: LandSearchCriteria, 
    email: string
  ): Promise<void> {
    try {
      const searchResult = {
        email,
        criteria,
        lands: lands.map(land => ({
          ...land,
          dateScraped: land.dateScraped?.toISOString() || new Date().toISOString()
        })),
        analysis,
        summary,
        createdAt: serverTimestamp(),
        status: 'completed'
      };

      await addDoc(collection(db, 'landSearchResults'), searchResult);
      console.log('✅ Risultati salvati nel database');
    } catch (error) {
      console.error('❌ Errore salvataggio risultati:', error);
    }
  }

  // Verifica configurazione di tutti i servizi
  async verifyAllServices(): Promise<{
    email: boolean;
    webScraping: boolean;
    ai: boolean;
  }> {
    const results = {
      email: false,
      webScraping: false,
      ai: false
    };

    try {
      // Verifica Email Service
      results.email = await realEmailService.verifyEmailConfig();
    } catch (error) {
      console.error('❌ Errore verifica email service:', error);
    }

    try {
      // Verifica Web Scraping
      await realWebScraper.initialize();
      results.webScraping = true;
      await realWebScraper.close();
    } catch (error) {
      console.error('❌ Errore verifica web scraping:', error);
    }

    try {
      // Verifica AI Service
      results.ai = await realAIService.verifyAIConfig();
    } catch (error) {
      console.error('❌ Errore verifica AI service:', error);
    }

    console.log('🔍 Stato servizi:', results);
    return results;
  }
}

// Istanza singleton
export const realLandScrapingAgent = new RealLandScrapingAgent(); 