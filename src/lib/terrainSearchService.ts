/**
 * Terrain Search Service
 * Servizio per la ricerca di terreni con database ISTAT completo
 */

import { GeographicSearchResult } from '@/components/ui/GeographicSearch';

export interface TerrainSearchCriteria {
  location?: string;
  comune?: string;
  provincia?: string;
  regione?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  type?: 'residenziale' | 'commerciale' | 'industriale' | 'agricolo' | 'all';
  status?: 'disponibile' | 'venduto' | 'riservato' | 'all';
  minAiScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'all';
  features?: string[];
  radius?: number; // km
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TerrainData {
  id: string;
  comune: string;
  provincia: string;
  regione: string;
  lat: number;
  lng: number;
  price: number;
  area: number;
  type: 'residenziale' | 'commerciale' | 'industriale' | 'agricolo';
  status: 'disponibile' | 'venduto' | 'riservato';
  features: string[];
  images: string[];
  description: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  aiScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  opportunities: string[];
  createdAt: Date;
  updatedAt: Date;
  source: string;
  url?: string;
}

export interface TerrainSearchResult {
  terrains: TerrainData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  location?: GeographicSearchResult;
  stats: {
    averagePrice: number;
    averageArea: number;
    averageAiScore: number;
    totalAvailable: number;
    priceRange: {
      min: number;
      max: number;
    };
    areaRange: {
      min: number;
      max: number;
    };
  };
}

export interface TerrainAnalysis {
  location: GeographicSearchResult;
  marketTrends: {
    priceTrend: 'crescente' | 'stabile' | 'decrescente';
    demandLevel: 'alto' | 'medio' | 'basso';
    supplyLevel: 'alto' | 'medio' | 'basso';
    competitionLevel: 'alto' | 'medio' | 'basso';
  };
  opportunities: {
    residential: number; // score 0-100
    commercial: number;
    industrial: number;
    agricultural: number;
  };
  risks: {
    environmental: 'low' | 'medium' | 'high';
    regulatory: 'low' | 'medium' | 'high';
    market: 'low' | 'medium' | 'high';
    infrastructure: 'low' | 'medium' | 'high';
  };
  recommendations: string[];
  aiInsights: {
    score: number;
    confidence: number;
    reasoning: string[];
  };
}

class TerrainSearchService {
  private baseUrl = '/api/terrain';

  /**
   * Ricerca terreni con criteri avanzati
   */
  async searchTerrains(criteria: TerrainSearchCriteria): Promise<TerrainSearchResult> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore ricerca terreni:', error);
      throw error;
    }
  }

  /**
   * Ricerca terreni per location specifica
   */
  async searchTerrainsByLocation(
    location: GeographicSearchResult,
    criteria: Partial<TerrainSearchCriteria> = {}
  ): Promise<TerrainSearchResult> {
    const searchCriteria: TerrainSearchCriteria = {
      ...criteria,
      comune: location.nome,
      provincia: location.provincia,
      regione: location.regione,
      coordinates: {
        lat: location.latitudine,
        lng: location.longitudine,
      },
    };

    return this.searchTerrains(searchCriteria);
  }

  /**
   * Analisi approfondita di una location
   */
  async analyzeLocation(location: GeographicSearchResult): Promise<TerrainAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            nome: location.nome,
            provincia: location.provincia,
            regione: location.regione,
            latitudine: location.latitudine,
            longitudine: location.longitudine,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore analisi location:', error);
      throw error;
    }
  }

  /**
   * Ottieni dettagli di un terreno specifico
   */
  async getTerrainDetails(terrainId: string): Promise<TerrainData> {
    try {
      const response = await fetch(`${this.baseUrl}/${terrainId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore dettagli terreno:', error);
      throw error;
    }
  }

  /**
   * Ricerca suggerimenti per autocomplete
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<GeographicSearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore suggerimenti:', error);
      return [];
    }
  }

  /**
   * Ricerca terreni simili
   */
  async getSimilarTerrains(terrainId: string, limit: number = 5): Promise<TerrainData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${terrainId}/similar?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore terreni simili:', error);
      return [];
    }
  }

  /**
   * Salva ricerca per notifiche future
   */
  async saveSearchAlert(criteria: TerrainSearchCriteria, email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteria,
          email,
          frequency: 'weekly', // daily, weekly, monthly
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Errore salvataggio alert:', error);
      throw error;
    }
  }

  /**
   * Ottieni statistiche generali
   */
  async getMarketStats(): Promise<{
    totalTerrains: number;
    averagePrice: number;
    averageArea: number;
    topRegions: Array<{
      regione: string;
      count: number;
      averagePrice: number;
    }>;
    priceTrends: Array<{
      month: string;
      averagePrice: number;
    }>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/stats`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore statistiche:', error);
      throw error;
    }
  }

  /**
   * Ricerca avanzata con filtri multipli
   */
  async advancedSearch(criteria: TerrainSearchCriteria & {
    sortBy?: 'price' | 'area' | 'aiScore' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<TerrainSearchResult> {
    try {
      const response = await fetch(`${this.baseUrl}/advanced-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(criteria),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Errore ricerca avanzata:', error);
      throw error;
    }
  }

  /**
   * Esporta risultati ricerca
   */
  async exportResults(
    criteria: TerrainSearchCriteria,
    format: 'csv' | 'xlsx' | 'pdf' = 'csv'
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          criteria,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('❌ Errore esportazione:', error);
      throw error;
    }
  }
}

export const terrainSearchService = new TerrainSearchService();
