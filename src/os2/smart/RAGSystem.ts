// 🧠 RAG SYSTEM - Retrieval Augmented Generation per OS 2.0 Smart
// Sistema avanzato di memoria e contesto per conversazioni intelligenti

import { OpenAI } from 'openai';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';

export interface RAGContext {
  userContext: {
    userId: string;
    userEmail: string;
    sessionId: string;
    projectId?: string;
    userRoles: string[];
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  projectContext?: {
    projectId: string;
    projectName: string;
    projectType: string;
    currentPhase: string;
    keyMetrics: any;
    recentActivities: any[];
  };
  marketContext?: {
    location: string;
    marketTrends: any;
    comparableProjects: any[];
    regulatoryUpdates: any[];
  };
}

export interface RAGMemory {
  id: string;
  userId: string;
  sessionId: string;
  projectId?: string;
  type: 'conversation' | 'project' | 'market' | 'user_preference' | 'skill_execution';
  content: string;
  embedding?: number[];
  metadata: {
    timestamp: Date;
    importance: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    source: string;
    confidence: number;
  };
  relationships: string[]; // IDs di memorie correlate
}

export interface RAGSearchResult {
  memory: RAGMemory;
  relevanceScore: number;
  contextSnippet: string;
  relationshipContext?: RAGMemory[];
}

/**
 * Sistema RAG avanzato per Urbanova OS 2.0
 */
export class AdvancedRAGSystem {
  private openai: OpenAI;
  private embeddingModel = 'text-embedding-3-small';
  private maxContextTokens = 8000;
  private relevanceThreshold = 0.7;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Genera embedding per un testo
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ [RAG] Errore generazione embedding:', error);
      throw error;
    }
  }

  /**
   * Salva memoria nel sistema RAG
   */
  async saveMemory(memory: Omit<RAGMemory, 'id' | 'embedding'>): Promise<string> {
    try {
      // Genera embedding per il contenuto
      const embedding = await this.generateEmbedding(memory.content);
      
      // Crea documento Firestore
      const memoryDoc = {
        ...memory,
        embedding,
        id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          ...memory.metadata,
          timestamp: new Date(),
        }
      };

      // Salva in Firestore
      await db.collection('os2_rag_memories').doc(memoryDoc.id).set(memoryDoc);
      
      console.log(`✅ [RAG] Memoria salvata: ${memoryDoc.id} (${memory.type})`);
      return memoryDoc.id;
    } catch (error) {
      console.error('❌ [RAG] Errore salvataggio memoria:', error);
      throw error;
    }
  }

  /**
   * Cerca memorie rilevanti per un contesto
   */
  async searchRelevantMemories(
    query: string,
    context: RAGContext,
    limit: number = 10
  ): Promise<RAGSearchResult[]> {
    try {
      // Genera embedding per la query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Cerca memorie rilevanti
      const memoriesRef = collection(db, 'os2_rag_memories');
      
      // Filtra per utente e progetto se specificato
      let q = query(memoriesRef);
      
      if (context.userContext.projectId) {
        q = query(
          memoriesRef,
          where('projectId', '==', context.userContext.projectId),
          orderBy('metadata.timestamp', 'desc'),
          limit(50) // Limita per performance
        );
      } else {
        q = query(
          memoriesRef,
          where('userId', '==', context.userContext.userId),
          orderBy('metadata.timestamp', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(q);
      const memories: RAGMemory[] = [];
      
      snapshot.forEach(doc => {
        memories.push(doc.data() as RAGMemory);
      });

      // Calcola similarità coseno per ogni memoria
      const results: RAGSearchResult[] = [];
      
      for (const memory of memories) {
        if (memory.embedding) {
          const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);
          
          if (similarity >= this.relevanceThreshold) {
            results.push({
              memory,
              relevanceScore: similarity,
              contextSnippet: this.extractContextSnippet(memory.content, query),
            });
          }
        }
      }

      // Ordina per rilevanza e limita risultati
      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

    } catch (error) {
      console.error('❌ [RAG] Errore ricerca memorie:', error);
      return [];
    }
  }

  /**
   * Costruisce contesto completo per una conversazione
   */
  async buildConversationContext(
    userMessage: string,
    context: RAGContext
  ): Promise<{
    relevantMemories: RAGSearchResult[];
    projectContext?: any;
    marketContext?: any;
    conversationSummary: string;
  }> {
    try {
      console.log('🧠 [RAG] Costruendo contesto conversazione...');

      // 1. Cerca memorie rilevanti
      const relevantMemories = await this.searchRelevantMemories(userMessage, context);

      // 2. Carica contesto progetto se disponibile
      let projectContext;
      if (context.projectContext?.projectId) {
        projectContext = await this.loadProjectContext(context.projectContext.projectId);
      }

      // 3. Carica contesto di mercato se rilevante
      let marketContext;
      if (this.isMarketRelatedQuery(userMessage)) {
        marketContext = await this.loadMarketContext(context.userContext.userId);
      }

      // 4. Genera riassunto conversazione
      const conversationSummary = await this.generateConversationSummary(
        context.conversationHistory,
        relevantMemories
      );

      console.log(`✅ [RAG] Contesto costruito: ${relevantMemories.length} memorie rilevanti`);

      return {
        relevantMemories,
        projectContext,
        marketContext,
        conversationSummary,
      };

    } catch (error) {
      console.error('❌ [RAG] Errore costruzione contesto:', error);
      return {
        relevantMemories: [],
        conversationSummary: 'Contesto non disponibile',
      };
    }
  }

  /**
   * Aggiorna memoria basata su interazione
   */
  async updateMemoryFromInteraction(
    interaction: {
      userMessage: string;
      assistantResponse: string;
      context: RAGContext;
      success: boolean;
      metadata?: any;
    }
  ): Promise<void> {
    try {
      // Salva conversazione
      await this.saveMemory({
        userId: interaction.context.userContext.userId,
        sessionId: interaction.context.userContext.sessionId,
        projectId: interaction.context.userContext.projectId,
        type: 'conversation',
        content: `User: ${interaction.userMessage}\nAssistant: ${interaction.assistantResponse}`,
        metadata: {
          timestamp: new Date(),
          importance: 'medium',
          tags: ['conversation', 'interaction'],
          source: 'user_interaction',
          confidence: interaction.success ? 1.0 : 0.5,
        },
        relationships: [],
      });

      // Se è un'esecuzione di skill, salva anche quello
      if (interaction.metadata?.skillId) {
        await this.saveMemory({
          userId: interaction.context.userContext.userId,
          sessionId: interaction.context.userContext.sessionId,
          projectId: interaction.context.userContext.projectId,
          type: 'skill_execution',
          content: `Skill: ${interaction.metadata.skillId}\nInput: ${JSON.stringify(interaction.metadata.inputs)}\nOutput: ${JSON.stringify(interaction.metadata.outputs)}`,
          metadata: {
            timestamp: new Date(),
            importance: 'high',
            tags: ['skill', interaction.metadata.skillId],
            source: 'skill_execution',
            confidence: interaction.success ? 1.0 : 0.3,
          },
          relationships: [],
        });
      }

    } catch (error) {
      console.error('❌ [RAG] Errore aggiornamento memoria:', error);
    }
  }

  /**
   * Calcola similarità coseno tra due vettori
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Estrae snippet di contesto da un contenuto
   */
  private extractContextSnippet(content: string, query: string): string {
    const queryWords = query.toLowerCase().split(' ');
    const sentences = content.split(/[.!?]+/);
    
    // Trova la frase più rilevante
    let bestSentence = sentences[0];
    let maxScore = 0;
    
    for (const sentence of sentences) {
      const sentenceWords = sentence.toLowerCase().split(' ');
      const score = queryWords.filter(word => sentenceWords.includes(word)).length;
      
      if (score > maxScore) {
        maxScore = score;
        bestSentence = sentence;
      }
    }
    
    return bestSentence.trim();
  }

  /**
   * Determina se una query è relativa al mercato
   */
  private isMarketRelatedQuery(query: string): boolean {
    const marketKeywords = [
      'mercato', 'prezzo', 'vendita', 'affitto', 'comparabili',
      'trend', 'analisi', 'intelligence', 'terreno', 'immobile'
    ];
    
    const lowerQuery = query.toLowerCase();
    return marketKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Carica contesto progetto
   */
  private async loadProjectContext(projectId: string): Promise<any> {
    try {
      const projectDoc = await getDoc(doc(db, 'feasibilityProjects', projectId));
      return projectDoc.exists() ? projectDoc.data() : null;
    } catch (error) {
      console.error('❌ [RAG] Errore caricamento contesto progetto:', error);
      return null;
    }
  }

  /**
   * Carica contesto di mercato
   */
  private async loadMarketContext(userId: string): Promise<any> {
    try {
      // Carica dati di mercato recenti per l'utente
      const marketRef = collection(db, 'market_intelligence');
      const q = query(
        marketRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      const marketData = [];
      
      snapshot.forEach(doc => {
        marketData.push(doc.data());
      });
      
      return marketData;
    } catch (error) {
      console.error('❌ [RAG] Errore caricamento contesto mercato:', error);
      return null;
    }
  }

  /**
   * Genera riassunto conversazione
   */
  private async generateConversationSummary(
    history: Array<{ role: string; content: string; timestamp: Date }>,
    relevantMemories: RAGSearchResult[]
  ): Promise<string> {
    try {
      if (history.length === 0) return 'Nessuna conversazione precedente';

      // Prendi ultimi 5 messaggi
      const recentMessages = history.slice(-5);
      const conversationText = recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      // Se ci sono memorie rilevanti, includile nel riassunto
      const memoryContext = relevantMemories
        .slice(0, 3)
        .map(m => m.contextSnippet)
        .join(' ');

      const prompt = `Riassumi questa conversazione in italiano in modo conciso (max 200 caratteri):

Conversazione:
${conversationText}

Contesto rilevante:
${memoryContext}

Riassunto:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.3,
      });

      return response.choices[0].message.content || 'Riassunto non disponibile';

    } catch (error) {
      console.error('❌ [RAG] Errore generazione riassunto:', error);
      return 'Riassunto non disponibile';
    }
  }
}

/**
 * Singleton per il sistema RAG
 */
let ragSystemInstance: AdvancedRAGSystem;

export function getRAGSystem(): AdvancedRAGSystem {
  if (!ragSystemInstance) {
    ragSystemInstance = new AdvancedRAGSystem();
  }
  return ragSystemInstance;
}
