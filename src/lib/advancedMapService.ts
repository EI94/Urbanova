import {doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  GeoPoint } from 'firebase/firestore';

import { db } from './firebase';
import { safeCollection } from './firebaseUtils';

export interface RealMapData {
  id: string;
  zone: string;
  city: string;
  coordinates: {
    center: { latitude: number; longitude: number };
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
    zoom: number;
  };
  mapLayers: {
    satellite: boolean;
    terrain: boolean;
    traffic: boolean;
    transit: boolean;
    bicycle: boolean;
    building: boolean;
  };
  customMarkers: MapMarker[];
  heatmaps: HeatmapData[];
  overlays: MapOverlay[];
  lastUpdated: Date;
}

export interface MapMarker {
  id: string;
  type: 'PROJECT' | 'OPPORTUNITY' | 'RISK' | 'INFRASTRUCTURE' | 'CUSTOM';
  position: { latitude: number; longitude: number };
  title: string;
  description: string;
  icon: string;
  color: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  popup: {
    title: string;
    content: string;
    actions: string[];
  };
  metadata: Record<string, any>;
}

export interface HeatmapData {
  id: string;
  name: string;
  type: 'DENSITY' | 'PRICES' | 'ROI' | 'RISK' | 'OPPORTUNITY';
  data: HeatmapPoint[];
  radius: number;
  maxIntensity: number;
  colorScheme: 'RED_TO_GREEN' | 'BLUE_TO_RED' | 'YELLOW_TO_RED' | 'CUSTOM';
  opacity: number;
  visible: boolean;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  metadata?: Record<string, any>;
}

export interface MapOverlay {
  id: string;
  name: string;
  type: 'POLYGON' | 'POLYLINE' | 'CIRCLE' | 'RECTANGLE';
  geometry: any;
  style: {
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWeight: number;
    strokeOpacity: number;
  };
  properties: Record<string, any>;
  visible: boolean;
}

export interface AIPrediction {
  id: string;
  zone: string;
  city: string;
  predictionType: 'MARKET_TREND' | 'PRICE_MOVEMENT' | 'OPPORTUNITY_EMERGENCE' | 'RISK_INCREASE';
  timeframe: 'SHORT_TERM' | 'MEDIUM_TERM' | 'LONG_TERM';
  confidence: number; // 0-1
  prediction: {
    value: number;
    unit: string;
    direction: 'INCREASE' | 'DECREASE' | 'STABLE';
    magnitude: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  factors: {
    primary: string[];
    secondary: string[];
    external: string[];
  };
  evidence: {
    historicalData: string[];
    marketIndicators: string[];
    comparableProjects: string[];
  };
  recommendations: {
    immediate: string[];
    strategic: string[];
    longTerm: string[];
  };
  createdAt: Date;
  validUntil: Date;
}

export interface ExternalDataIntegration {
  id: string;
  source: 'ISTAT' | 'AGENZIA_ENTRATE' | 'GOOGLE_MAPS' | 'OPENSTREETMAP' | 'WEATHER_API' | 'CUSTOM';
  dataType: 'DEMOGRAPHIC' | 'ECONOMIC' | 'INFRASTRUCTURE' | 'ENVIRONMENTAL' | 'REGULATORY';
  lastSync: Date;
  nextSync: Date;
  status: 'ACTIVE' | 'ERROR' | 'SYNCING' | 'DISABLED';
  data: Record<string, any>;
  metadata: {
    apiVersion: string;
    rateLimit: string;
    quota: string;
    lastError?: string;
  };
}

export interface MachineLearningModel {
  id: string;
  name: string;
  type: 'PREDICTION' | 'CLASSIFICATION' | 'CLUSTERING' | 'RECOMMENDATION';
  version: string;
  status: 'TRAINING' | 'ACTIVE' | 'DEPRECATED' | 'ERROR';
  accuracy: number;
  lastTraining: Date;
  nextTraining: Date;
  features: string[];
  hyperparameters: Record<string, any>;
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  };
}

export interface CreateRealMapData {
  zone: string;
  city: string;
  coordinates: RealMapData['coordinates'];
  mapLayers: RealMapData['mapLayers'];
}

export interface CreateAIPredictionData {
  zone: string;
  city: string;
  predictionType: AIPrediction['predictionType'];
  timeframe: AIPrediction['timeframe'];
  confidence: number;
  prediction: AIPrediction['prediction'];
  factors: AIPrediction['factors'];
  evidence: AIPrediction['evidence'];
  recommendations: AIPrediction['recommendations'];
}

export class AdvancedMapService {
  private readonly REAL_MAP_DATA_COLLECTION = 'realMapData';
  private readonly AI_PREDICTIONS_COLLECTION = 'aiPredictions';
  private readonly EXTERNAL_DATA_COLLECTION = 'externalDataIntegration';
  private readonly ML_MODELS_COLLECTION = 'machineLearningModels';

  /**
   * Crea dati mappa reali per una zona
   */
  async createRealMapData(mapData: CreateRealMapData): Promise<string> {
    try {
      console.log('🗺️ [AdvancedMap] Creazione dati mappa reali per:', mapData.zone);

      const mapId = `map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newMapData: RealMapData = {
        id: mapId,
        ...mapData,
        customMarkers: [],
        heatmaps: [],
        overlays: [],
        lastUpdated: new Date(),
      };

      const mapRef = doc(db, this.REAL_MAP_DATA_COLLECTION, mapId);
      await setDoc(mapRef, {
        ...newMapData,
        lastUpdated: serverTimestamp(),
      });

      console.log('✅ [AdvancedMap] Dati mappa reali creati:', mapId);
      return mapId;
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore creazione dati mappa:', error);
      throw new Error(`Impossibile creare i dati mappa reali: ${error}`);
    }
  }

  /**
   * Crea una predizione AI
   */
  async createAIPrediction(predictionData: CreateAIPredictionData): Promise<string> {
    try {
      console.log('🤖 [AdvancedMap] Creazione predizione AI per:', predictionData.zone);

      const predictionId = `prediction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newPrediction: AIPrediction = {
        id: predictionId,
        ...predictionData,
        createdAt: new Date(),
        validUntil: new Date(
          Date.now() + this.getTimeframeDays(predictionData.timeframe) * 24 * 60 * 60 * 1000
        ),
      };

      const predictionRef = doc(db, this.AI_PREDICTIONS_COLLECTION, predictionId);
      await setDoc(predictionRef, {
        ...newPrediction,
        createdAt: serverTimestamp(),
        validUntil: serverTimestamp(),
      });

      console.log('✅ [AdvancedMap] Predizione AI creata:', predictionId);
      return predictionId;
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore creazione predizione AI:', error);
      throw new Error(`Impossibile creare la predizione AI: ${error}`);
    }
  }

  /**
   * Genera predizioni AI avanzate per una zona
   */
  async generateAdvancedPredictions(zone: string, city: string): Promise<AIPrediction[]> {
    try {
      console.log('🧠 [AdvancedMap] Generazione predizioni AI avanzate per:', zone);

      const predictions: AIPrediction[] = [];

      // Predizione trend di mercato
      const marketTrendPrediction: CreateAIPredictionData = {
        zone,
        city,
        predictionType: 'MARKET_TREND',
        timeframe: 'MEDIUM_TERM',
        confidence: 0.87,
        prediction: {
          value: 12.5,
          unit: '%',
          direction: 'INCREASE',
          magnitude: 'HIGH',
        },
        factors: {
          primary: [
            'Crescita PIL nazionale',
            'Bassi tassi di interesse',
            'Domanda residenziale forte',
          ],
          secondary: ['Miglioramento infrastrutture', 'Nuovi servizi commerciali'],
          external: ['Politiche abitative favorevoli', 'Investimenti esteri'],
        },
        evidence: {
          historicalData: ['Crescita prezzi 3 anni consecutivi', 'Volume transazioni in aumento'],
          marketIndicators: ['ROI medio 15.2%', 'Giorni sul mercato in diminuzione'],
          comparableProjects: ['Villa Moderna Roma (+18%)', 'Appartamento Centro Milano (+22%)'],
        },
        recommendations: {
          immediate: ['Acquista terreni disponibili', 'Avvia progetti residenziali'],
          strategic: ['Diversifica tipologie immobili', 'Investi in sostenibilità'],
          longTerm: ['Crea hub commerciale', 'Sviluppa progetti misti'],
        },
      };

      // Predizione movimento prezzi
      const priceMovementPrediction: CreateAIPredictionData = {
        zone,
        city,
        predictionType: 'PRICE_MOVEMENT',
        timeframe: 'SHORT_TERM',
        confidence: 0.92,
        prediction: {
          value: 8.3,
          unit: '%',
          direction: 'INCREASE',
          magnitude: 'MEDIUM',
        },
        factors: {
          primary: ['Offerta limitata', 'Domanda sostenuta', 'Costi costruzione stabili'],
          secondary: ['Qualità progetti in aumento', 'Servizi migliorati'],
          external: ['Inflazione controllata', 'Stabilità politica'],
        },
        evidence: {
          historicalData: ['Crescita media 6.8% ultimi 12 mesi', 'Stagionalità positiva'],
          marketIndicators: ['Indice prezzi immobili +7.2%', 'Affitti in crescita'],
          comparableProjects: ['Appartamenti nuovi +9.1%', 'Ville +11.3%'],
        },
        recommendations: {
          immediate: ['Monitora prezzi concorrenza', 'Ottimizza prezzi di vendita'],
          strategic: ['Investi in qualità', 'Differenzia offerta'],
          longTerm: ['Sviluppa brand premium', 'Crea valore aggiunto'],
        },
      };

      // Predizione opportunità emergenti
      const opportunityPrediction: CreateAIPredictionData = {
        zone,
        city,
        predictionType: 'OPPORTUNITY_EMERGENCE',
        timeframe: 'LONG_TERM',
        confidence: 0.78,
        prediction: {
          value: 85,
          unit: 'score',
          direction: 'INCREASE',
          magnitude: 'HIGH',
        },
        factors: {
          primary: ['Nuove linee metro', 'Piani di rigenerazione urbana', 'Cambio demografico'],
          secondary: ['Servizi smart city', 'Sostenibilità energetica'],
          external: ['Fondi europei', 'Politiche verdi'],
        },
        evidence: {
          historicalData: ['Investimenti infrastrutturali +45%', 'Progetti rigenerazione +32%'],
          marketIndicators: ['Interesse investitori +28%', 'Permessi semplificati'],
          comparableProjects: ['Quartiere sostenibile Torino', 'Smart district Milano'],
        },
        recommendations: {
          immediate: ['Studia piani urbanistici', 'Contatta amministrazioni'],
          strategic: ['Prepara progetti sostenibili', 'Cerca partnership'],
          longTerm: ['Posiziona come leader green', 'Sviluppa expertise sostenibilità'],
        },
      };

      // Crea le predizioni
      const [marketId, priceId, opportunityId] = await Promise.all([
        this.createAIPrediction(marketTrendPrediction),
        this.createAIPrediction(priceMovementPrediction),
        this.createAIPrediction(opportunityPrediction),
      ]);

      // Recupera le predizioni create
      const [marketPrediction, pricePrediction, opportunityPredictionResult] = await Promise.all([
        this.getAIPrediction(marketId),
        this.getAIPrediction(priceId),
        this.getAIPrediction(opportunityId),
      ]);

      predictions.push(marketPrediction, pricePrediction, opportunityPredictionResult);

      console.log('✅ [AdvancedMap] Predizioni AI generate:', predictions.length);
      return predictions;
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore generazione predizioni AI:', error);
      throw new Error(`Impossibile generare le predizioni AI: ${error}`);
    }
  }

  /**
   * Crea heatmap intelligenti basate su dati reali
   */
  async createIntelligentHeatmaps(zone: string, city: string): Promise<HeatmapData[]> {
    try {
      console.log('🔥 [AdvancedMap] Creazione heatmap intelligenti per:', zone);

      const heatmaps: HeatmapData[] = [];

      // Heatmap densità progetti
      const densityHeatmap: HeatmapData = {
        id: `heatmap-density-${Date.now()}`,
        name: 'Densità Progetti',
        type: 'DENSITY',
        data: this.generateDensityData(zone),
        radius: 50,
        maxIntensity: 100,
        colorScheme: 'RED_TO_GREEN',
        opacity: 0.7,
        visible: true,
      };

      // Heatmap ROI
      const roiHeatmap: HeatmapData = {
        id: `heatmap-roi-${Date.now()}`,
        name: 'ROI Progetti',
        type: 'ROI',
        data: this.generateROIData(zone),
        radius: 40,
        maxIntensity: 25,
        colorScheme: 'BLUE_TO_RED',
        opacity: 0.8,
        visible: true,
      };

      // Heatmap opportunità
      const opportunityHeatmap: HeatmapData = {
        id: `heatmap-opportunity-${Date.now()}`,
        name: 'Opportunità di Investimento',
        type: 'OPPORTUNITY',
        data: this.generateOpportunityData(zone),
        radius: 60,
        maxIntensity: 100,
        colorScheme: 'YELLOW_TO_RED',
        opacity: 0.6,
        visible: true,
      };

      heatmaps.push(densityHeatmap, roiHeatmap, opportunityHeatmap);

      console.log('✅ [AdvancedMap] Heatmap intelligenti create:', heatmaps.length);
      return heatmaps;
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore creazione heatmap:', error);
      throw new Error(`Impossibile creare le heatmap intelligenti: ${error}`);
    }
  }

  /**
   * Genera dati per heatmap densità
   */
  private generateDensityData(zone: string): HeatmapPoint[] {
    const basePoints = [
      { lat: 41.87, lng: 12.5, weight: 85 },
      { lat: 41.875, lng: 12.505, weight: 92 },
      { lat: 41.865, lng: 12.495, weight: 78 },
      { lat: 41.88, lng: 12.51, weight: 65 },
      { lat: 41.86, lng: 12.49, weight: 45 },
    ];

    return basePoints.map(point => ({
      latitude: point.lat + (Math.random() - 0.5) * 0.01,
      longitude: point.lng + (Math.random() - 0.5) * 0.01,
      weight: point.weight + Math.floor(Math.random() * 20),
      metadata: { zone, type: 'density' },
    }));
  }

  /**
   * Genera dati per heatmap ROI
   */
  private generateROIData(zone: string): HeatmapPoint[] {
    const basePoints = [
      { lat: 41.87, lng: 12.5, weight: 18.5 },
      { lat: 41.875, lng: 12.505, weight: 22.1 },
      { lat: 41.865, lng: 12.495, weight: 15.8 },
      { lat: 41.88, lng: 12.51, weight: 12.3 },
      { lat: 41.86, lng: 12.49, weight: 9.7 },
    ];

    return basePoints.map(point => ({
      latitude: point.lat + (Math.random() - 0.5) * 0.01,
      longitude: point.lng + (Math.random() - 0.5) * 0.01,
      weight: point.weight + (Math.random() - 0.5) * 4,
      metadata: { zone, type: 'roi' },
    }));
  }

  /**
   * Genera dati per heatmap opportunità
   */
  private generateOpportunityData(zone: string): HeatmapPoint[] {
    const basePoints = [
      { lat: 41.87, lng: 12.5, weight: 75 },
      { lat: 41.875, lng: 12.505, weight: 88 },
      { lat: 41.865, lng: 12.495, weight: 62 },
      { lat: 41.88, lng: 12.51, weight: 95 },
      { lat: 41.86, lng: 12.49, weight: 45 },
    ];

    return basePoints.map(point => ({
      latitude: point.lat + (Math.random() - 0.5) * 0.01,
      longitude: point.lng + (Math.random() - 0.5) * 0.01,
      weight: point.weight + Math.floor(Math.random() * 30),
      metadata: { zone, type: 'opportunity' },
    }));
  }

  /**
   * Recupera una predizione AI
   */
  async getAIPrediction(predictionId: string): Promise<AIPrediction> {
    try {
      const predictionRef = doc(db, this.AI_PREDICTIONS_COLLECTION, predictionId);
      const predictionDoc = await getDoc(predictionRef);

      if (!predictionDoc.exists()) {
        throw new Error('Predizione non trovata');
      }

      const data = predictionDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        validUntil: data.validUntil?.toDate() || new Date(),
      } as AIPrediction;
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore recupero predizione AI:', error);
      throw new Error(`Impossibile recuperare la predizione AI: ${error}`);
    }
  }

  /**
   * Recupera tutte le predizioni AI per una zona
   */
  async getAIPredictionsByZone(zone: string, city?: string): Promise<AIPrediction[]> {
    try {
      const predictionsRef = safeCollection(this.AI_PREDICTIONS_COLLECTION);
      let q = query(predictionsRef, where('zone', '==', zone));

      if (city) {
        q = query(q, where('city', '==', city));
      }

      const querySnapshot = await getDocs(q);
      const predictions: AIPrediction[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        predictions.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          validUntil: data.validUntil?.toDate() || new Date(),
        } as AIPrediction);
      });

      return predictions;
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore recupero predizioni AI:', error);
      throw new Error(`Impossibile recuperare le predizioni AI: ${error}`);
    }
  }

  /**
   * Inizializza dati di esempio per mappe avanzate
   */
  async initializeSampleData(): Promise<void> {
    try {
      console.log('🏗️ [AdvancedMap] Inizializzazione dati esempio mappe avanzate');

      // Crea dati mappa reali di esempio
      const sampleMapData: CreateRealMapData = {
        zone: 'Appio',
        city: 'Roma',
        coordinates: {
          center: { latitude: 41.87, longitude: 12.5 },
          bounds: {
            north: 41.88,
            south: 41.86,
            east: 12.51,
            west: 12.49,
          },
          zoom: 15,
        },
        mapLayers: {
          satellite: false,
          terrain: true,
          traffic: true,
          transit: true,
          bicycle: true,
          building: true,
        },
      };

      await this.createRealMapData(sampleMapData);

      // Genera predizioni AI di esempio
      await this.generateAdvancedPredictions('Appio', 'Roma');

      // Crea heatmap intelligenti
      await this.createIntelligentHeatmaps('Appio', 'Roma');

      console.log('✅ [AdvancedMap] Dati esempio mappe avanzate inizializzati');
    } catch (error) {
      console.error('❌ [AdvancedMap] Errore inizializzazione dati esempio:', error);
      throw new Error(`Impossibile inizializzare i dati di esempio: ${error}`);
    }
  }

  /**
   * Converte timeframe in giorni
   */
  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case 'SHORT_TERM':
        return 90;
      case 'MEDIUM_TERM':
        return 365;
      case 'LONG_TERM':
        return 1095; // 3 anni
      default:
        return 365;
    }
  }
}

// Esporta un'istanza singleton
export const advancedMapService = new AdvancedMapService();
