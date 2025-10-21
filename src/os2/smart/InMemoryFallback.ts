// 🧠 IN-MEMORY FALLBACK - Sistema memoria temporaneo per RAG
// Fallback robusto quando Firestore non è disponibile

import { RAGContext, RAGMemory, RAGSearchResult } from './RAGSystem';

interface MemoryStore {
  [userId: string]: {
    conversations: RAGMemory[];
    projectData: Map<string, any>;
    lastAccess: Date;
  };
}

/**
 * Sistema di memoria in-memory come fallback per RAG
 * Mantiene memorie per durata sessione + buffer tempo
 */
export class InMemoryRAGFallback {
  private memoryStore: MemoryStore = {};
  private maxMemoriesPerUser = 100;
  private memoryTTL = 24 * 60 * 60 * 1000; // 24 ore

  /**
   * Salva memoria in-memory
   */
  async saveMemory(memory: Omit<RAGMemory, 'id' | 'embedding'>): Promise<string> {
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Inizializza storage utente se non esiste
    if (!this.memoryStore[memory.userId]) {
      this.memoryStore[memory.userId] = {
        conversations: [],
        projectData: new Map(),
        lastAccess: new Date(),
      };
    }

    const userStore = this.memoryStore[memory.userId];
    
    // Crea memoria completa
    const fullMemory: RAGMemory = {
      ...memory,
      id: memoryId,
      embedding: [], // Non usiamo embeddings in fallback
    };

    // Salva conversazione
    userStore.conversations.push(fullMemory);
    userStore.lastAccess = new Date();

    // Estrai dati progetto se presenti nel contenuto
    this.extractAndSaveProjectData(memory, userStore);

    // Limita numero memorie
    if (userStore.conversations.length > this.maxMemoriesPerUser) {
      userStore.conversations = userStore.conversations.slice(-this.maxMemoriesPerUser);
    }

    console.log(`💾 [InMemory Fallback] Memoria salvata: ${memoryId} per user ${memory.userId}`);
    console.log(`   Totale memorie utente: ${userStore.conversations.length}`);
    
    return memoryId;
  }

  /**
   * Cerca memorie rilevanti usando keyword matching semplice
   */
  searchRelevantMemories(
    query: string,
    context: RAGContext,
    limit: number = 10
  ): RAGSearchResult[] {
    const userId = context.userContext.userId;
    const userStore = this.memoryStore[userId];

    if (!userStore) {
      console.log(`🔍 [InMemory Fallback] Nessuna memoria per user ${userId}`);
      return [];
    }

    console.log(`🔍 [InMemory Fallback] Cercando in ${userStore.conversations.length} memorie...`);

    // Pulisci memorie vecchie
    this.cleanupOldMemories(userId);

    // Tokenizza query
    const queryTokens = this.tokenize(query.toLowerCase());
    
    // Calcola rilevanza per ogni memoria
    const results: RAGSearchResult[] = [];
    
    for (const memory of userStore.conversations) {
      const contentTokens = this.tokenize(memory.content.toLowerCase());
      const relevanceScore = this.calculateRelevance(queryTokens, contentTokens);
      
      if (relevanceScore > 0.3) { // Threshold più basso di embeddings
        results.push({
          memory,
          relevanceScore,
          contextSnippet: this.extractSnippet(memory.content, query),
        });
      }
    }

    // Ordina per rilevanza e limita
    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    console.log(`✅ [InMemory Fallback] Trovate ${sortedResults.length} memorie rilevanti`);
    sortedResults.forEach(r => {
      console.log(`   - Score: ${r.relevanceScore.toFixed(2)} | ${r.contextSnippet.substring(0, 60)}...`);
    });

    return sortedResults;
  }

  /**
   * Recupera dati progetto salvati
   */
  getProjectData(userId: string, projectName: string): any {
    const userStore = this.memoryStore[userId];
    if (!userStore) return null;

    return userStore.projectData.get(projectName.toLowerCase());
  }

  /**
   * Recupera tutti i progetti utente
   */
  getUserProjects(userId: string): Array<{name: string; data: any}> {
    const userStore = this.memoryStore[userId];
    if (!userStore) return [];

    const projects: Array<{name: string; data: any}> = [];
    userStore.projectData.forEach((data, name) => {
      projects.push({ name, data });
    });

    return projects;
  }

  /**
   * Estrae e salva dati progetto dal contenuto
   */
  private extractAndSaveProjectData(
    memory: Omit<RAGMemory, 'id' | 'embedding'>,
    userStore: MemoryStore[string]
  ): void {
    const content = memory.content.toLowerCase();
    
    // Pattern per identificare progetti
    const projectPatterns = [
      /progetto\s+([a-z0-9\s]+)(?:,|\.|residence|building|tower|park|center)/gi,
      /([a-z]+\s+(?:park|residence|tower|center|building|plaza))/gi,
    ];

    for (const pattern of projectPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const projectName = match[1].trim();
        
        if (projectName.length > 3) { // Nome valido
          // Estrai dati numerici associati
          const projectData = this.extractProjectNumbers(memory.content, projectName);
          
          if (Object.keys(projectData).length > 0) {
            userStore.projectData.set(projectName.toLowerCase(), {
              name: projectName,
              ...projectData,
              lastMentioned: new Date(),
              source: memory.content.substring(0, 200),
            });
            
            console.log(`📊 [InMemory Fallback] Dati progetto salvati: "${projectName}"`, projectData);
          }
        }
      }
    }
  }

  /**
   * Estrae numeri associati a un progetto
   */
  private extractProjectNumbers(content: string, projectName: string): any {
    const data: any = {};
    
    // Pattern per numeri
    const patterns = {
      units: /(\d+)\s*(?:unità|units|appartamenti|apartments)/i,
      budget: /budget\s*(?:di\s*)?[€$]?\s*(\d+(?:\.\d+)?)\s*(?:M|milioni|million)?/i,
      area: /(\d+)\s*(?:mq|m2|sqm|metri)/i,
      location: /(Milano|Roma|Torino|Firenze|Napoli|Bologna|Venezia)/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = content.match(pattern);
      if (match) {
        data[key] = match[1];
      }
    }

    return data;
  }

  /**
   * Tokenizza testo
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Calcola rilevanza tra query e contenuto (TF-IDF semplificato)
   */
  private calculateRelevance(queryTokens: string[], contentTokens: string[]): number {
    const contentSet = new Set(contentTokens);
    let matches = 0;
    
    for (const token of queryTokens) {
      if (contentSet.has(token)) {
        matches++;
      }
    }

    return matches / Math.max(queryTokens.length, 1);
  }

  /**
   * Estrae snippet rilevante
   */
  private extractSnippet(content: string, query: string, maxLength: number = 100): string {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    
    const index = contentLower.indexOf(queryLower);
    
    if (index !== -1) {
      const start = Math.max(0, index - 20);
      const end = Math.min(content.length, index + maxLength);
      return content.substring(start, end);
    }

    return content.substring(0, maxLength);
  }

  /**
   * Pulisce memorie vecchie
   */
  private cleanupOldMemories(userId: string): void {
    const userStore = this.memoryStore[userId];
    if (!userStore) return;

    const now = Date.now();
    const ttl = this.memoryTTL;

    userStore.conversations = userStore.conversations.filter(memory => {
      const age = now - memory.metadata.timestamp.getTime();
      return age < ttl;
    });
  }

  /**
   * Ottieni statistiche memoria
   */
  getStats(): {
    totalUsers: number;
    totalMemories: number;
    totalProjects: number;
  } {
    let totalMemories = 0;
    let totalProjects = 0;

    Object.values(this.memoryStore).forEach(store => {
      totalMemories += store.conversations.length;
      totalProjects += store.projectData.size;
    });

    return {
      totalUsers: Object.keys(this.memoryStore).length,
      totalMemories,
      totalProjects,
    };
  }

  /**
   * Reset memoria utente (per test)
   */
  clearUserMemory(userId: string): void {
    delete this.memoryStore[userId];
    console.log(`🗑️ [InMemory Fallback] Memoria utente ${userId} eliminata`);
  }

  /**
   * Reset completo (per test)
   */
  clearAll(): void {
    this.memoryStore = {};
    console.log(`🗑️ [InMemory Fallback] Memoria completa eliminata`);
  }
}

// Singleton globale
let fallbackInstance: InMemoryRAGFallback | null = null;

export function getInMemoryFallback(): InMemoryRAGFallback {
  if (!fallbackInstance) {
    fallbackInstance = new InMemoryRAGFallback();
    console.log('🧠 [InMemory Fallback] Sistema inizializzato');
  }
  return fallbackInstance;
}

