'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.territorialIntelligenceService = exports.TerritorialIntelligenceService = void 0;
const firestore_1 = require('firebase/firestore');
const firebase_1 = require('./firebase');
class TerritorialIntelligenceService {
  constructor() {
    this.MARKET_TRENDS_COLLECTION = 'marketTrends';
    this.ZONE_ANALYSIS_COLLECTION = 'zoneAnalysis';
    this.DEMOGRAPHIC_INSIGHTS_COLLECTION = 'demographicInsights';
    this.INFRASTRUCTURE_ANALYSIS_COLLECTION = 'infrastructureAnalysis';
    this.INVESTMENT_OPPORTUNITIES_COLLECTION = 'investmentOpportunities';
  }
  /**
   * Crea un nuovo trend di mercato
   */
  async createMarketTrend(trendData) {
    try {
      console.log('📈 [TerritorialIntelligence] Creazione trend di mercato:', trendData.zone);
      const trendId = `trend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTrend = {
        id: trendId,
        ...trendData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const trendRef = (0, firestore_1.doc)(firebase_1.db, this.MARKET_TRENDS_COLLECTION, trendId);
      await (0, firestore_1.setDoc)(trendRef, {
        ...newTrend,
        createdAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
      console.log('✅ [TerritorialIntelligence] Trend di mercato creato:', trendId);
      return trendId;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore creazione trend:', error);
      throw new Error(`Impossibile creare il trend di mercato: ${error}`);
    }
  }
  /**
   * Crea un'analisi di zona
   */
  async createZoneAnalysis(analysisData) {
    try {
      console.log('🗺️ [TerritorialIntelligence] Creazione analisi zona:', analysisData.zone);
      const analysisId = `zone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newAnalysis = {
        id: analysisId,
        ...analysisData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const analysisRef = (0, firestore_1.doc)(
        firebase_1.db,
        this.ZONE_ANALYSIS_COLLECTION,
        analysisId
      );
      await (0, firestore_1.setDoc)(analysisRef, {
        ...newAnalysis,
        createdAt: (0, firestore_1.serverTimestamp)(),
        updatedAt: (0, firestore_1.serverTimestamp)(),
      });
      console.log('✅ [TerritorialIntelligence] Analisi zona creata:', analysisId);
      return analysisId;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore creazione analisi zona:', error);
      throw new Error(`Impossibile creare l'analisi di zona: ${error}`);
    }
  }
  /**
   * Recupera tutti i trend di mercato per una zona
   */
  async getMarketTrendsByZone(zone, city) {
    try {
      console.log('📊 [TerritorialIntelligence] Recupero trend per zona:', zone);
      const trendsRef = (0, firestore_1.collection)(firebase_1.db, this.MARKET_TRENDS_COLLECTION);
      let q = (0, firestore_1.query)(trendsRef, (0, firestore_1.where)('zone', '==', zone));
      if (city) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('city', '==', city));
      }
      const querySnapshot = await (0, firestore_1.getDocs)(q);
      const trends = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        trends.push({
          ...data,
          dataPoints: data.dataPoints.map(dp => ({
            ...dp,
            date: dp.date?.toDate() || new Date(),
          })),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      console.log('✅ [TerritorialIntelligence] Trend recuperati:', trends.length);
      return trends;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore recupero trend:', error);
      throw new Error(`Impossibile recuperare i trend di mercato: ${error}`);
    }
  }
  /**
   * Recupera analisi di zona
   */
  async getZoneAnalysis(zone, city) {
    try {
      console.log('🗺️ [TerritorialIntelligence] Recupero analisi zona:', zone);
      const analysisRef = (0, firestore_1.collection)(firebase_1.db, this.ZONE_ANALYSIS_COLLECTION);
      let q = (0, firestore_1.query)(analysisRef, (0, firestore_1.where)('zone', '==', zone));
      if (city) {
        q = (0, firestore_1.query)(q, (0, firestore_1.where)('city', '==', city));
      }
      const querySnapshot = await (0, firestore_1.getDocs)(q);
      const analyses = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        analyses.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });
      console.log('✅ [TerritorialIntelligence] Analisi zona recuperate:', analyses.length);
      return analyses;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore recupero analisi zona:', error);
      throw new Error(`Impossibile recuperare l'analisi di zona: ${error}`);
    }
  }
  /**
   * Analizza opportunità di investimento per una zona
   */
  async analyzeInvestmentOpportunities(zone, city) {
    try {
      console.log('💡 [TerritorialIntelligence] Analisi opportunità investimento:', zone);
      // Recupera dati di mercato e analisi zona
      const [trends, zoneAnalysis] = await Promise.all([
        this.getMarketTrendsByZone(zone, city),
        this.getZoneAnalysis(zone, city),
      ]);
      const opportunities = [];
      // Analisi segmenti underserved
      if (trends.length > 0) {
        const residentialTrends = trends.filter(t => t.propertyType === 'RESIDENTIAL');
        const commercialTrends = trends.filter(t => t.propertyType === 'COMMERCIAL');
        // Opportunità residenziali
        if (residentialTrends.length > 0) {
          const avgROI =
            residentialTrends.reduce((sum, t) => sum + t.analysis.priceChange, 0) /
            residentialTrends.length;
          if (avgROI > 5) {
            // ROI > 5%
            opportunities.push({
              id: `opp-${Date.now()}-1`,
              zone,
              city,
              type: 'GROWTH_ZONE',
              description: 'Zona residenziale con forte crescita dei prezzi e alta domanda',
              potential: {
                roi: avgROI,
                timeframe: 'MEDIUM',
                risk: 'MEDIUM',
                scalability: 'HIGH',
              },
              market: {
                targetDemand: 150,
                competition: 'MEDIUM',
                barriers: ['Permessi urbanistici', 'Costi di costruzione'],
                advantages: ['Domanda alta', 'Crescita prezzi', 'Infrastrutture esistenti'],
              },
              requirements: {
                minimumInvestment: 500000,
                expertise: ['Sviluppo residenziale', 'Gestione permessi'],
                timeline: 18,
                permits: ['Permesso di costruire', 'Autorizzazione paesaggistica'],
              },
              evidence: {
                dataPoints: [`ROI medio: ${avgROI.toFixed(1)}%`, 'Crescita prezzi sostenuta'],
                trends: ['Domanda in aumento', 'Offerta limitata'],
                comparableProjects: ['Villa Moderna Roma', 'Appartamento Centro Milano'],
              },
              createdAt: new Date(),
              priority: 'HIGH',
            });
          }
        }
        // Opportunità commerciali
        if (commercialTrends.length > 0) {
          const avgROI =
            commercialTrends.reduce((sum, t) => sum + t.analysis.priceChange, 0) /
            commercialTrends.length;
          if (avgROI > 8) {
            // ROI > 8%
            opportunities.push({
              id: `opp-${Date.now()}-2`,
              zone,
              city,
              type: 'UNDERSERVED_SEGMENT',
              description: 'Segmento commerciale con alta redditività e bassa concorrenza',
              potential: {
                roi: avgROI,
                timeframe: 'LONG',
                risk: 'LOW',
                scalability: 'HIGH',
              },
              market: {
                targetDemand: 80,
                competition: 'LOW',
                barriers: ['Capitale iniziale', 'Conoscenza settore'],
                advantages: ['ROI alto', 'Bassa concorrenza', 'Domanda stabile'],
              },
              requirements: {
                minimumInvestment: 1000000,
                expertise: ['Sviluppo commerciale', 'Gestione affitti'],
                timeline: 24,
                permits: ["Cambio destinazione d'uso", 'Licenza commerciale'],
              },
              evidence: {
                dataPoints: [`ROI medio: ${avgROI.toFixed(1)}%`, 'Bassa concorrenza'],
                trends: ['Domanda stabile', 'Crescita settore'],
                comparableProjects: ['Uffici Commerciali Torino'],
              },
              createdAt: new Date(),
              priority: 'CRITICAL',
            });
          }
        }
      }
      // Analisi zone di rigenerazione
      if (zoneAnalysis.length > 0) {
        const analysis = zoneAnalysis[0];
        if (analysis.metrics.projectDensity < 2) {
          // Bassa densità progetti
          opportunities.push({
            id: `opp-${Date.now()}-3`,
            zone,
            city,
            type: 'REGENERATION_AREA',
            description: 'Zona con bassa densità di progetti e alto potenziale di sviluppo',
            potential: {
              roi: 12,
              timeframe: 'LONG',
              risk: 'MEDIUM',
              scalability: 'HIGH',
            },
            market: {
              targetDemand: 200,
              competition: 'LOW',
              barriers: ['Infrastrutture limitate', 'Permessi complessi'],
              advantages: ['Bassa concorrenza', 'Alto potenziale', 'Prezzi accessibili'],
            },
            requirements: {
              minimumInvestment: 800000,
              expertise: ['Sviluppo urbano', 'Gestione complessa'],
              timeline: 36,
              permits: ['Piano di rigenerazione', 'Varianti urbanistiche'],
            },
            evidence: {
              dataPoints: [
                `Densità progetti: ${analysis.metrics.projectDensity}/km²`,
                'Bassa concorrenza',
              ],
              trends: ['Interesse crescente', 'Piani di sviluppo'],
              comparableProjects: ['Progetti di rigenerazione urbana'],
            },
            createdAt: new Date(),
            priority: 'MEDIUM',
          });
        }
      }
      console.log('✅ [TerritorialIntelligence] Opportunità analizzate:', opportunities.length);
      return opportunities;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore analisi opportunità:', error);
      throw new Error(`Impossibile analizzare le opportunità di investimento: ${error}`);
    }
  }
  /**
   * Genera insights demografici per una zona
   */
  async generateDemographicInsights(zone, city) {
    try {
      console.log('👥 [TerritorialIntelligence] Generazione insights demografici:', zone);
      // Simula dati demografici (in produzione verrebbero da API esterne)
      const demographicData = {
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zone,
        city,
        data: {
          population: {
            total: 15000 + Math.floor(Math.random() * 10000),
            density: 2500 + Math.floor(Math.random() * 1500),
            growthRate: 0.8 + Math.random() * 1.2,
            ageDistribution: {
              under18: 18 + Math.floor(Math.random() * 5),
              '18-35': 25 + Math.floor(Math.random() * 8),
              '36-50': 30 + Math.floor(Math.random() * 10),
              '51-65': 20 + Math.floor(Math.random() * 8),
              over65: 7 + Math.floor(Math.random() * 5),
            },
          },
          income: {
            average: 35000 + Math.floor(Math.random() * 15000),
            median: 32000 + Math.floor(Math.random() * 12000),
            distribution: {
              low: 25 + Math.floor(Math.random() * 10),
              medium: 50 + Math.floor(Math.random() * 15),
              high: 25 + Math.floor(Math.random() * 10),
            },
          },
          education: {
            universityDegree: 35 + Math.floor(Math.random() * 20),
            highSchool: 45 + Math.floor(Math.random() * 15),
            primary: 20 + Math.floor(Math.random() * 10),
          },
          employment: {
            unemploymentRate: 5 + Math.random() * 8,
            mainSectors: ['Servizi', 'Commercio', 'Industria'],
            averageSalary: 28000 + Math.floor(Math.random() * 12000),
          },
        },
        insights: {
          targetMarket: ['Famiglie giovani', 'Professionisti'],
          purchasingPower: 'MEDIUM',
          lifestylePreferences: ['Vicino ai servizi', 'Trasporto pubblico', 'Verde'],
          investmentCapacity: 'MEDIUM',
        },
        source: 'Estimated',
        lastUpdated: new Date(),
      };
      console.log('✅ [TerritorialIntelligence] Insights demografici generati');
      return demographicData;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore generazione insights demografici:', error);
      throw new Error(`Impossibile generare gli insights demografici: ${error}`);
    }
  }
  /**
   * Analizza infrastrutture per una zona
   */
  async analyzeInfrastructure(zone, city) {
    try {
      console.log('🏗️ [TerritorialIntelligence] Analisi infrastrutture:', zone);
      // Simula analisi infrastrutture (in produzione verrebbero da API esterne)
      const infrastructureData = {
        id: `infra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zone,
        city,
        transport: {
          metro: {
            lines: city === 'Roma' ? ['A', 'B'] : city === 'Milano' ? ['M1', 'M2'] : [],
            stations: city === 'Roma' ? 8 : city === 'Milano' ? 12 : 0,
            coverage: city === 'Roma' ? 85 : city === 'Milano' ? 90 : 0,
          },
          bus: {
            lines: 15 + Math.floor(Math.random() * 20),
            frequency: 'Ogni 10-15 minuti',
            coverage: 70 + Math.floor(Math.random() * 25),
          },
          train: {
            stations: city === 'Roma' ? 3 : city === 'Milano' ? 4 : 1,
            connections: ['Centro città', 'Aeroporto', 'Città vicine'],
            frequency: 'Ogni 30 minuti',
          },
          roads: {
            highways: city === 'Roma' ? ['A1', 'A24'] : city === 'Milano' ? ['A1', 'A4'] : ['A1'],
            mainRoads: 8 + Math.floor(Math.random() * 12),
            accessibility: 80 + Math.floor(Math.random() * 15),
          },
        },
        services: {
          healthcare: {
            hospitals: 1 + Math.floor(Math.random() * 2),
            clinics: 3 + Math.floor(Math.random() * 5),
            coverage: 85 + Math.floor(Math.random() * 10),
          },
          education: {
            schools: 5 + Math.floor(Math.random() * 8),
            universities: city === 'Roma' ? 2 : city === 'Milano' ? 3 : 1,
            quality: 75 + Math.floor(Math.random() * 20),
          },
          shopping: {
            malls: 1 + Math.floor(Math.random() * 2),
            supermarkets: 4 + Math.floor(Math.random() * 6),
            specialty: 8 + Math.floor(Math.random() * 12),
          },
          recreation: {
            parks: 3 + Math.floor(Math.random() * 5),
            gyms: 2 + Math.floor(Math.random() * 4),
            cultural: 2 + Math.floor(Math.random() * 3),
          },
        },
        utilities: {
          water: {
            coverage: 95 + Math.floor(Math.random() * 5),
            quality: 85 + Math.floor(Math.random() * 10),
          },
          electricity: { coverage: 100, reliability: 95 + Math.floor(Math.random() * 5) },
          internet: {
            fiber: 80 + Math.floor(Math.random() * 20),
            mobile: 95 + Math.floor(Math.random() * 5),
            speed: 50 + Math.floor(Math.random() * 50),
          },
          waste: { collection: 100, recycling: 60 + Math.floor(Math.random() * 30) },
        },
        accessibility: {
          overall: 80 + Math.floor(Math.random() * 15),
          publicTransport: 75 + Math.floor(Math.random() * 20),
          carAccess: 90 + Math.floor(Math.random() * 10),
          walking: 70 + Math.floor(Math.random() * 25),
          cycling: 60 + Math.floor(Math.random() * 30),
        },
        lastUpdated: new Date(),
      };
      console.log('✅ [TerritorialIntelligence] Infrastrutture analizzate');
      return infrastructureData;
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore analisi infrastrutture:', error);
      throw new Error(`Impossibile analizzare le infrastrutture: ${error}`);
    }
  }
  /**
   * Inizializza dati di esempio per l'intelligence territoriale
   */
  async initializeSampleData() {
    try {
      console.log('🏗️ [TerritorialIntelligence] Inizializzazione dati esempio');
      // Crea trend di mercato di esempio
      const sampleTrends = [
        {
          zone: 'Appio',
          city: 'Roma',
          province: 'RM',
          region: 'Lazio',
          propertyType: 'RESIDENTIAL',
          trend: 'RISING',
          confidence: 0.85,
          dataPoints: [
            {
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              averagePrice: 3200,
              volume: 45,
              daysOnMarket: 28,
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              averagePrice: 3350,
              volume: 52,
              daysOnMarket: 25,
            },
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              averagePrice: 3500,
              volume: 58,
              daysOnMarket: 22,
            },
          ],
          analysis: {
            priceChange: 9.4,
            volumeChange: 28.9,
            marketVelocity: 25,
            demandSupplyRatio: 1.8,
          },
          factors: {
            economic: ['Crescita PIL', 'Bassi tassi di interesse'],
            demographic: ['Incremento popolazione giovane', 'Migrazione da centro'],
            infrastructure: ['Nuova metro C', 'Miglioramento strade'],
            regulatory: ['Piani urbanistici favorevoli', 'Incentivi ristrutturazione'],
          },
        },
        {
          zone: 'Quadrilatero della Moda',
          city: 'Milano',
          province: 'MI',
          region: 'Lombardia',
          propertyType: 'COMMERCIAL',
          trend: 'RISING',
          confidence: 0.92,
          dataPoints: [
            {
              date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              averagePrice: 8500,
              volume: 12,
              daysOnMarket: 45,
            },
            {
              date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              averagePrice: 8900,
              volume: 15,
              daysOnMarket: 38,
            },
            {
              date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              averagePrice: 9200,
              volume: 18,
              daysOnMarket: 32,
            },
          ],
          analysis: {
            priceChange: 8.2,
            volumeChange: 50.0,
            marketVelocity: 38,
            demandSupplyRatio: 2.1,
          },
          factors: {
            economic: ['Turismo in ripresa', 'Investimenti esteri'],
            demographic: ['Alto reddito', 'Professionisti internazionali'],
            infrastructure: ['Metro M1', 'Aeroporto Malpensa'],
            regulatory: ['ZTL ben gestita', 'Permessi semplificati'],
          },
        },
      ];
      // Crea analisi di zona di esempio
      const sampleZoneAnalysis = [
        {
          zone: 'Appio',
          city: 'Roma',
          province: 'RM',
          coordinates: {
            center: { latitude: 41.87, longitude: 12.5 },
            bounds: {
              north: 41.88,
              south: 41.86,
              east: 12.51,
              west: 12.49,
            },
          },
          metrics: {
            projectDensity: 3.2,
            averageROI: 12.5,
            averageBudget: 850000,
            completionRate: 87.5,
            marketVolatility: 0.15,
          },
          opportunities: {
            underservedSegments: ['Appartamenti di lusso', 'Uffici moderni'],
            growthPotential: 78,
            investmentGaps: ['Edifici storici da ristrutturare', 'Nuove costruzioni'],
            emergingTrends: ['Smart home', 'Sostenibilità'],
          },
          risks: {
            oversaturation: 'LOW',
            regulatoryChanges: 'MEDIUM',
            economicVulnerability: 'LOW',
            environmentalFactors: 'LOW',
          },
          recommendations: {
            shortTerm: ['Acquista terreni disponibili', 'Avvia progetti residenziali'],
            mediumTerm: ['Sviluppa progetti misti', 'Investi in sostenibilità'],
            longTerm: ['Crea hub commerciale', 'Rigenera aree industriali'],
          },
        },
      ];
      // Crea i dati di esempio
      for (const trendData of sampleTrends) {
        await this.createMarketTrend(trendData);
      }
      for (const analysisData of sampleZoneAnalysis) {
        await this.createZoneAnalysis(analysisData);
      }
      console.log('✅ [TerritorialIntelligence] Dati esempio inizializzati');
    } catch (error) {
      console.error('❌ [TerritorialIntelligence] Errore inizializzazione dati esempio:', error);
      throw new Error(`Impossibile inizializzare i dati di esempio: ${error}`);
    }
  }
}
exports.TerritorialIntelligenceService = TerritorialIntelligenceService;
// Esporta un'istanza singleton
exports.territorialIntelligenceService = new TerritorialIntelligenceService();
//# sourceMappingURL=territorialIntelligenceService.js.map
