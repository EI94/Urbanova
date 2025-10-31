// 🧠 RAG SYSTEM - Retrieval Augmented Generation per OS 2.0 Smart
// Sistema avanzato di memoria e contesto per conversazioni intelligenti

import { OpenAI } from 'openai';
import { collection, query as firestoreQuery, where, getDocs, orderBy, limit as firestoreLimit, doc, getDoc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Lazy loader per firebase - evita TDZ
let firebaseModulePromise: Promise<typeof import('../../lib/firebase')> | null = null;
const getFirebaseDb = async () => {
  if (!firebaseModulePromise) {
    firebaseModulePromise = import('../../lib/firebase');
  }
  const module = await firebaseModulePromise;
  return module.db;
};
import { getInMemoryFallback } from './InMemoryFallback';

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
      console.log(`🔄 [RAG] Generando embedding con OpenAI per: "${text.substring(0, 50)}..."`);
      
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text,
      });
      
      console.log(`✅ [RAG] Embedding generato: ${response.data[0].embedding.length} dimensioni`);
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ [RAG] ERRORE generazione embedding OpenAI:', error);
      console.error('❌ [RAG] Text length:', text.length);
      console.error('❌ [RAG] Model:', this.embeddingModel);
      throw error;
    }
  }

  /**
   * Salva memoria nel sistema RAG
   */
  async saveMemory(memory: Omit<RAGMemory, 'id' | 'embedding'>): Promise<string> {
    try {
      console.log(`💾 [RAG] Tentativo salvataggio memoria tipo: ${memory.type}, userId: ${memory.userId}`);
      
      // Genera embedding per il contenuto
      console.log(`🔄 [RAG] Generando embedding per: "${memory.content.substring(0, 50)}..."`);
      const embedding = await this.generateEmbedding(memory.content);
      console.log(`✅ [RAG] Embedding generato: ${embedding.length} dimensioni`);
      
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

      // Rimuovi campi undefined prima di salvare su Firestore
      const cleanMemoryDoc = Object.fromEntries(
        Object.entries(memoryDoc).filter(([_, value]) => value !== undefined)
      );
      
      console.log(`📝 [RAG] Salvando in Firestore: os2_rag_memories/${memoryDoc.id}`);
      
      // Salva in Firestore v9+
      const db = await getFirebaseDb();
      const memoriesRef = collection(db, 'os2_rag_memories');
      const docRef = doc(memoriesRef, memoryDoc.id);
      await setDoc(docRef, cleanMemoryDoc);
      
      console.log(`✅ [RAG] Memoria salvata con successo: ${memoryDoc.id} (${memory.type})`);
      return memoryDoc.id;
    } catch (error) {
      console.error('❌ [RAG] Errore salvataggio Firestore:', error);
      console.warn('🔄 [RAG] Fallback a sistema in-memory...');
      
      // FALLBACK: Usa sistema in-memory
      try {
        const fallback = getInMemoryFallback();
        const memoryId = await fallback.saveMemory(memory);
        console.log(`✅ [RAG Fallback] Memoria salvata in-memory: ${memoryId}`);
        return memoryId;
      } catch (fallbackError) {
        console.error('❌ [RAG Fallback] Errore anche in fallback:', fallbackError);
        throw fallbackError;
      }
    }
  }

  /**
   * Restituisce memorie recenti per contesto LLM
   * LLM-DRIVEN: NO keyword matching, NO similarity threshold
   * L'LLM decide autonomamente cosa è rilevante
   */
  async searchRelevantMemories(
    query: string,
    context: RAGContext,
    limit: number = 20  // Più memorie per LLM
  ): Promise<RAGSearchResult[]> {
    try {
      console.log(`🔍 [RAG] Recupero memorie recenti per user ${context.userContext.userId}...`);
      
      // Cerca memorie in Firestore
      const db = await getFirebaseDb();
      const memoriesRef = collection(db, 'os2_rag_memories');
      
      // Query semplice: ultime N memorie utente, ordinate per timestamp
      const searchQuery = firestoreQuery(
        memoriesRef,
        where('userId', '==', context.userContext.userId),
        orderBy('metadata.timestamp', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(searchQuery);
      const memories: RAGMemory[] = [];
      
      snapshot.forEach(doc => {
        memories.push(doc.data() as RAGMemory);
      });

      // Converti in RAGSearchResult (NO similarity calc - inutile)
      const results: RAGSearchResult[] = memories.map((memory, index) => {
        const freshnessScore = 1.0 - (index / memories.length) * 0.3;
        
        return {
          memory,
          relevanceScore: freshnessScore, // Score basato SOLO su freshness
          contextSnippet: memory.content.substring(0, 200), // Snippet lungo per LLM
        };
      });

      console.log(`✅ [RAG] Trovate ${results.length} memorie (LLM decide rilevanza)`);
      
      return results;

    } catch (error) {
      console.error('❌ [RAG] Errore ricerca Firestore:', error);
      console.warn('🔄 [RAG] Fallback a ricerca in-memory...');
      
      // FALLBACK: Usa ricerca in-memory
      try {
        const fallback = getInMemoryFallback();
        const results = fallback.searchRelevantMemories(query, context, limit);
        console.log(`✅ [RAG Fallback] Trovate ${results.length} memorie in-memory`);
        return results;
      } catch (fallbackError) {
        console.error('❌ [RAG Fallback] Errore anche in fallback:', fallbackError);
        return [];
      }
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

      // 3. Carica contesto di mercato (sempre - LLM decide se usarlo)
      let marketContext;
      try {
        marketContext = await this.loadMarketContext(context.userContext.userId);
      } catch (error) {
        // Market context opzionale
        marketContext = null;
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 [RAG] updateMemoryFromInteraction CHIAMATO!');
    console.log(`   User: ${interaction.userMessage.substring(0, 80)}`);
    console.log(`   Assistant: ${interaction.assistantResponse.substring(0, 80)}`);
    console.log(`   UserId: ${interaction.context.userContext.userId}`);
    console.log(`   SessionId: ${interaction.context.userContext.sessionId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Salva conversazione
      console.log('💾 [RAG] Chiamando saveMemory per conversazione...');
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
        console.log(`💾 [RAG] Chiamando saveMemory per skill: ${interaction.metadata.skillId}...`);
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

      console.log('✅ [RAG] updateMemoryFromInteraction COMPLETATO con successo!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ [RAG] ERRORE in updateMemoryFromInteraction:', error);
      console.error('❌ Stack:', (error as Error).stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  }

  /**
   * ELIMINATI: cosineSimilarity, extractContextSnippet, isMarketRelatedQuery
   * Architettura LLM-DRIVEN pura - NO keyword matching stupido
   * L'LLM riceve tutte le memorie recenti e decide autonomamente
   */

  /**
   * Carica contesto progetto
   */
  private async loadProjectContext(projectId: string): Promise<any> {
    try {
      const db = await getFirebaseDb();
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
      const db = await getFirebaseDb();
      const marketRef = collection(db, 'market_intelligence');
      const q = firestoreQuery(
        marketRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        firestoreLimit(5)
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
