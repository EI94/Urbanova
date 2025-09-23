/**
 * Vector Store Service - Urbanova AI
 * Gestisce l'indicizzazione e ricerca semantica dei documenti di compliance
 */

import { DocumentSection, Citation, VectorStoreType } from '../../packages/types/src/compliance';

export interface VectorSearchResult {
  section: DocumentSection;
  relevance: number;
  citations: Citation[];
}

export interface VectorStoreConfig {
  type: VectorStoreType;
  endpoint?: string;
  apiKey?: string;
  indexName?: string;
  dimensions: number;
  similarityThreshold: number;
}

export class VectorStoreService {
  private config: VectorStoreConfig;
  private isInitialized: boolean = false;
  private fallbackStore: Map<string, DocumentSection> = new Map();

  constructor(config: VectorStoreConfig) {
    this.config = config;
    this.initialize();
  }

  /**
   * Inizializza il vector store
   */
  private async initialize(): Promise<void> {
    try {
      switch (this.config.type) {
        case 'WEAVIATE':
          await this.initializeWeaviate();
          break;
        case 'PINECONE':
          await this.initializePinecone();
          break;
        case 'LOCAL_FALLBACK':
          await this.initializeLocalFallback();
          break;
        default:
          throw new Error(`Vector store type ${this.config.type} not supported`);
      }

      this.isInitialized = true;
      console.log(`✅ [Vector Store] ${this.config.type} inizializzato`);
    } catch (error) {
      console.error(`❌ [Vector Store] Errore inizializzazione ${this.config.type}:`, error);

      // Fallback a storage locale
      console.log('🔄 [Vector Store] Fallback a storage locale');
      await this.initializeLocalFallback();
      this.isInitialized = true;
    }
  }

  /**
   * Inizializza Weaviate
   */
  private async initializeWeaviate(): Promise<void> {
    if (!this.config.endpoint) {
      throw new Error('Weaviate endpoint non configurato');
    }

    // Implementazione futura per Weaviate
    console.log('🔧 [Vector Store] Weaviate non ancora implementato, usando fallback');
    throw new Error('Weaviate non implementato');
  }

  /**
   * Inizializza Pinecone
   */
  private async initializePinecone(): Promise<void> {
    if (!this.config.apiKey || !this.config.indexName) {
      throw new Error('Pinecone API key o index name non configurati');
    }

    // Implementazione futura per Pinecone
    console.log('🔧 [Vector Store] Pinecone non ancora implementato, usando fallback');
    throw new Error('Pinecone non implementato');
  }

  /**
   * Inizializza fallback locale
   */
  private async initializeLocalFallback(): Promise<void> {
    console.log('📁 [Vector Store] Inizializzazione storage locale');
    this.fallbackStore.clear();
  }

  /**
   * Inserisce una sezione di documento nel vector store
   */
  async insertSection(section: DocumentSection): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('Vector store non inizializzato');
      }

      switch (this.config.type) {
        case 'WEAVIATE':
          return await this.insertWeaviate(section);
        case 'PINECONE':
          return await this.insertPinecone(section);
        case 'LOCAL_FALLBACK':
          return await this.insertLocalFallback(section);
        default:
          throw new Error(`Tipo vector store non supportato: ${this.config.type}`);
      }
    } catch (error) {
      console.error('❌ [Vector Store] Errore inserimento sezione:', error);

      // Fallback a storage locale
      return await this.insertLocalFallback(section);
    }
  }

  /**
   * Inserisce in Weaviate
   */
  private async insertWeaviate(section: DocumentSection): Promise<boolean> {
    // Implementazione futura
    throw new Error('Weaviate non implementato');
  }

  /**
   * Inserisce in Pinecone
   */
  private async insertPinecone(section: DocumentSection): Promise<boolean> {
    // Implementazione futura
    throw new Error('Pinecone non implementato');
  }

  /**
   * Inserisce in fallback locale
   */
  private async insertLocalFallback(section: DocumentSection): Promise<boolean> {
    try {
      this.fallbackStore.set(section.id, section);
      console.log(`📁 [Vector Store] Sezione ${section.id} salvata localmente`);
      return true;
    } catch (error) {
      console.error('❌ [Vector Store] Errore salvataggio locale:', error);
      return false;
    }
  }

  /**
   * Cerca sezioni simili
   */
  async searchSimilar(
    query: string,
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<VectorSearchResult[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('Vector store non inizializzato');
      }

      switch (this.config.type) {
        case 'WEAVIATE':
          return await this.searchWeaviate(query, limit, threshold);
        case 'PINECONE':
          return await this.searchPinecone(query, limit, threshold);
        case 'LOCAL_FALLBACK':
          return await this.searchLocalFallback(query, limit, threshold);
        default:
          throw new Error(`Tipo vector store non supportato: ${this.config.type}`);
      }
    } catch (error) {
      console.error('❌ [Vector Store] Errore ricerca:', error);

      // Fallback a storage locale
      return await this.searchLocalFallback(query, limit, threshold);
    }
  }

  /**
   * Ricerca in Weaviate
   */
  private async searchWeaviate(
    query: string,
    limit: number,
    threshold: number
  ): Promise<VectorSearchResult[]> {
    // Implementazione futura
    throw new Error('Weaviate non implementato');
  }

  /**
   * Ricerca in Pinecone
   */
  private async searchPinecone(
    query: string,
    limit: number,
    threshold: number
  ): Promise<VectorSearchResult[]> {
    // Implementazione futura
    throw new Error('Pinecone non implementato');
  }

  /**
   * Ricerca in fallback locale
   */
  private async searchLocalFallback(
    query: string,
    limit: number,
    threshold: number
  ): Promise<VectorSearchResult[]> {
    try {
      const results: VectorSearchResult[] = [];
      const queryLower = query.toLowerCase();

      // Ricerca semplice basata su testo (simulazione similarity search)
      for (const section of Array.from(this.fallbackStore.values())) {
        const contentLower = section.content.toLowerCase();
        const titleLower = section.title.toLowerCase();

        // Calcolo semplice di rilevanza basato su parole chiave
        let relevance = 0;

        // Controllo nel titolo
        if (titleLower.includes(queryLower)) {
          relevance += 0.8;
        }

        // Controllo nel contenuto
        const words = queryLower.split(' ');
        for (const word of words) {
          if (contentLower.includes(word)) {
            relevance += 0.3;
          }
        }

        // Normalizza rilevanza
        relevance = Math.min(relevance, 1.0);

        if (relevance >= threshold) {
          results.push({
            section,
            relevance,
            citations: [
              {
                id: `citation-${Date.now()}`,
                documentId: section.documentId,
                documentTitle: section.title,
                pageNumber: section.pageNumber || 0,
                sectionNumber: section.sectionNumber || '',
                subsection: section.subsection || '',
                excerpt: this.extractExcerpt(section.content, query, 200),
                relevance,
                timestamp: new Date(),
              },
            ],
          });
        }
      }

      // Ordina per rilevanza e limita risultati
      results.sort((a, b) => b.relevance - a.relevance);
      return results.slice(0, limit);
    } catch (error) {
      console.error('❌ [Vector Store] Errore ricerca locale:', error);
      return [];
    }
  }

  /**
   * Estrae un excerpt rilevante dal contenuto
   */
  private extractExcerpt(content: string, query: string, maxLength: number): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();

    // Trova la prima occorrenza della query
    const index = contentLower.indexOf(queryLower);

    if (index === -1) {
      // Se non trova la query, restituisce l'inizio del contenuto
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Calcola l'inizio e la fine dell'excerpt
    const start = Math.max(0, index - maxLength / 2);
    const end = Math.min(content.length, index + maxLength / 2);

    let excerpt = content.substring(start, end);

    // Aggiungi ellipsis se necessario
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';

    return excerpt;
  }

  /**
   * Rimuove una sezione dal vector store
   */
  async removeSection(sectionId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        throw new Error('Vector store non inizializzato');
      }

      switch (this.config.type) {
        case 'WEAVIATE':
          return await this.removeWeaviate(sectionId);
        case 'PINECONE':
          return await this.removePinecone(sectionId);
        case 'LOCAL_FALLBACK':
          return await this.removeLocalFallback(sectionId);
        default:
          throw new Error(`Tipo vector store non supportato: ${this.config.type}`);
      }
    } catch (error) {
      console.error('❌ [Vector Store] Errore rimozione sezione:', error);
      return false;
    }
  }

  /**
   * Rimuove da Weaviate
   */
  private async removeWeaviate(sectionId: string): Promise<boolean> {
    // Implementazione futura
    throw new Error('Weaviate non implementato');
  }

  /**
   * Rimuove da Pinecone
   */
  private async removePinecone(sectionId: string): Promise<boolean> {
    // Implementazione futura
    throw new Error('Pinecone non implementato');
  }

  /**
   * Rimuove da fallback locale
   */
  private async removeLocalFallback(sectionId: string): Promise<boolean> {
    try {
      const removed = this.fallbackStore.delete(sectionId);
      if (removed) {
        console.log(`🗑️ [Vector Store] Sezione ${sectionId} rimossa localmente`);
      }
      return removed;
    } catch (error) {
      console.error('❌ [Vector Store] Errore rimozione locale:', error);
      return false;
    }
  }

  /**
   * Ottiene statistiche del vector store
   */
  async getStats(): Promise<{
    type: VectorStoreType;
    totalSections: number;
    isInitialized: boolean;
    lastUpdate: Date;
  }> {
    return {
      type: this.config.type,
      totalSections: this.fallbackStore.size,
      isInitialized: this.isInitialized,
      lastUpdate: new Date(),
    };
  }

  /**
   * Verifica la salute del servizio
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
  }> {
    try {
      if (!this.isInitialized) {
        return {
          status: 'unhealthy',
          details: 'Vector store non inizializzato',
        };
      }

      // Test operazioni base
      const stats = await this.getStats();

      if (stats.totalSections > 0) {
        return {
          status: 'healthy',
          details: `Vector store funzionante con ${stats.totalSections} sezioni`,
        };
      } else {
        return {
          status: 'degraded',
          details: 'Vector store funzionante ma vuoto',
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Errore health check: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Configurazione di default
const defaultConfig: VectorStoreConfig = {
  type: 'LOCAL_FALLBACK',
  dimensions: 1536, // OpenAI embedding dimensions
  similarityThreshold: 0.7,
};

// Istanza singleton
export const vectorStoreService = new VectorStoreService(defaultConfig);

// Export per compatibilità
export default vectorStoreService;
