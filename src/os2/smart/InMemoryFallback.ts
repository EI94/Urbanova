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
   * Restituisce TUTTE le memorie recenti (LLM decide cosa usare)
   * NO keyword matching - l'LLM è smart abbastanza da capire
   */
  searchRelevantMemories(
    query: string,
    context: RAGContext,
    limit: number = 20  // Aumentato per dare più context all'LLM
  ): RAGSearchResult[] {
    const userId = context.userContext.userId;
    const userStore = this.memoryStore[userId];

    if (!userStore) {
      console.log(`🔍 [InMemory Fallback] Nessuna memoria per user ${userId}`);
      return [];
    }

    console.log(`🔍 [InMemory Fallback] Recupero memorie per user ${userId} (${userStore.conversations.length} totali)`);

    // Pulisci memorie vecchie
    this.cleanupOldMemories(userId);
    
    // Filtra solo per timestamp (evita self-match recenti)
    const now = Date.now();
    const validMemories = userStore.conversations.filter(memory => {
      const ageMs = now - memory.metadata.timestamp.getTime();
      return ageMs >= 2000; // Ignora memorie < 2s fa (probabilmente query stessa)
    });

    // Ordina per timestamp DESC (più recenti prima) e limita
    const sortedMemories = validMemories
      .sort((a, b) => b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime())
      .slice(0, limit);

    // Converti in RAGSearchResult (score = freshness)
    const results: RAGSearchResult[] = sortedMemories.map((memory, index) => {
      const ageMs = now - memory.metadata.timestamp.getTime();
      const freshnessScore = 1.0 - (index / sortedMemories.length) * 0.5; // Decrescente ma non troppo
      
      return {
        memory,
        relevanceScore: freshnessScore, // Score basato su freshness, non keyword
        contextSnippet: memory.content.substring(0, 200), // Più context per LLM
      };
    });

    console.log(`✅ [InMemory Fallback] Restituite ${results.length} memorie recenti (LLM decide rilevanza)`);
    results.slice(0, 3).forEach(r => {
      console.log(`   - ${r.contextSnippet.substring(0, 80)}...`);
    });

    return results;
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
   * ELIMINATI: tokenize, calculateRelevance, extractSnippet
   * Non servono più - l'LLM decide autonomamente la rilevanza
   * Architettura LLM-driven pura!
   */

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

