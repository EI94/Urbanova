// 🧠 SOFIA 2.0 - CONTEXTUAL MEMORY SYSTEM
// Sistema di memoria conversazionale avanzato per Urbanova

import { ChatMessage } from '@/types/chat';

// ============================================================================
// INTERFACCE TYPESCRIPT
// ============================================================================

export interface ConversationMemory {
  sessionId: string;
  userId: string;
  userEmail: string;
  startTime: Date;
  lastActivity: Date;
  
  // Memoria conversazionale completa
  conversationContext: ConversationContext;
  
  // Memoria utente persistente
  userProfile: UserProfileMemory;
  
  // Memoria progetti e dati
  projectContext: ProjectContextMemory;
  
  // Memoria intenzioni e obiettivi
  intentMemory: IntentMemory;
  
  // Memoria preferenze e pattern
  preferenceMemory: PreferenceMemory;
}

export interface ConversationContext {
  // Tutti i messaggi della conversazione
  messages: ChatMessage[];
  
  // Informazioni estratte da ogni messaggio
  extractedInfo: ExtractedInformation[];
  
  // Contesto attuale della conversazione
  currentContext: {
    topic: string;
    mood: 'professional' | 'casual' | 'urgent' | 'exploratory';
    userGoal: string | null;
    missingInfo: string[];
    providedInfo: string[];
  };
  
  // Pattern conversazionali
  conversationPatterns: {
    questionTypes: string[];
    responseStyles: string[];
    topicsDiscussed: string[];
    userPreferences: string[];
  };
}

export interface ExtractedInformation {
  messageId: string;
  timestamp: Date;
  
  // Informazioni estratte
  entities: {
    projects?: string[];
    locations?: string[];
    budgets?: number[];
    dates?: Date[];
    preferences?: string[];
    questions?: string[];
    requests?: string[];
  };
  
  // Intenti rilevati
  intents: {
    primary: string;
    secondary: string[];
    confidence: number;
  };
  
  // Azioni suggerite
  suggestedActions: {
    tool: string;
    parameters: any;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export interface UserProfileMemory {
  // Preferenze conversazionali
  communicationStyle: {
    formality: 'formal' | 'casual' | 'mixed';
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    responseFormat: 'text' | 'structured' | 'visual';
  };
  
  // Pattern di lavoro
  workPatterns: {
    preferredTimes: string[];
    projectTypes: string[];
    budgetRanges: number[];
    locations: string[];
  };
  
  // Storico decisioni
  decisionHistory: {
    timestamp: Date;
    decision: string;
    context: string;
    outcome: 'positive' | 'negative' | 'neutral';
  }[];
}

export interface ProjectContextMemory {
  // Progetti attivi
  activeProjects: {
    id: string;
    name: string;
    status: string;
    lastUpdate: Date;
    keyMetrics: any;
  }[];
  
  // Progetti discussi
  discussedProjects: {
    projectId: string;
    discussionCount: number;
    lastDiscussion: Date;
    topics: string[];
  }[];
  
  // Opportunità identificate
  opportunities: {
    id: string;
    type: string;
    description: string;
    priority: number;
    status: 'new' | 'evaluating' | 'pursuing' | 'rejected';
  }[];
}

export interface IntentMemory {
  // Intenti ricorrenti
  recurringIntents: {
    intent: string;
    frequency: number;
    lastUsed: Date;
    successRate: number;
  }[];
  
  // Obiettivi attivi
  activeGoals: {
    goal: string;
    progress: number;
    nextSteps: string[];
    deadline?: Date;
  }[];
  
  // Contesto intenzioni
  intentContext: {
    currentIntent: string | null;
    intentHistory: string[];
    intentTransitions: { from: string; to: string; reason: string }[];
  };
}

export interface PreferenceMemory {
  // Preferenze esplicite
  explicitPreferences: {
    category: string;
    value: string;
    confidence: number;
    source: 'direct' | 'inferred' | 'learned';
  }[];
  
  // Preferenze inferite
  inferredPreferences: {
    pattern: string;
    confidence: number;
    evidence: string[];
  }[];
  
  // Pattern comportamentali
  behavioralPatterns: {
    pattern: string;
    frequency: number;
    context: string[];
  }[];
}

// ============================================================================
// SOFIA MEMORY SYSTEM CLASS
// ============================================================================

export class SofiaMemorySystem {
  private memoryStore: Map<string, ConversationMemory> = new Map();
  private globalUserMemory: Map<string, UserProfileMemory> = new Map();

  constructor() {
    console.log('🧠 [SofiaMemorySystem] Inizializzato');
  }

  // ============================================================================
  // METODI PRINCIPALI
  // ============================================================================

  /**
   * 🎯 METODO PRINCIPALE: Aggiorna memoria con nuovo messaggio
   */
  async updateMemory(
    sessionId: string,
    userId: string,
    userEmail: string,
    message: ChatMessage,
    extractedInfo: ExtractedInformation
  ): Promise<ConversationMemory> {
    console.log('🧠 [SofiaMemory] Aggiornando memoria per sessione:', sessionId);

    try {
      // 1. Ottieni o crea memoria sessione
      let memory = this.memoryStore.get(sessionId);
      if (!memory) {
        memory = await this.createNewMemory(sessionId, userId, userEmail);
      }

      // 2. Aggiorna contesto conversazione
      await this.updateConversationContext(memory, message, extractedInfo);

      // 3. Aggiorna memoria utente
      await this.updateUserProfileMemory(memory, extractedInfo);

      // 4. Aggiorna contesto progetti
      await this.updateProjectContextMemory(memory, extractedInfo);

      // 5. Aggiorna memoria intenzioni
      await this.updateIntentMemory(memory, extractedInfo);

      // 6. Aggiorna preferenze
      await this.updatePreferenceMemory(memory, extractedInfo);

      // 7. Salva memoria aggiornata
      this.memoryStore.set(sessionId, memory);

      console.log('✅ [SofiaMemory] Memoria aggiornata:', {
        sessionId,
        messagesCount: memory.conversationContext.messages.length,
        extractedInfoCount: memory.conversationContext.extractedInfo.length
      });

      return memory;

    } catch (error) {
      console.error('❌ [SofiaMemory] Errore aggiornamento memoria:', error);
      throw error;
    }
  }

  /**
   * 🔍 Ottieni memoria completa per sessione
   */
  getMemory(sessionId: string): ConversationMemory | null {
    return this.memoryStore.get(sessionId) || null;
  }

  /**
   * 🧹 Pulisci memoria sessione
   */
  clearSessionMemory(sessionId: string): void {
    this.memoryStore.delete(sessionId);
    console.log('🧹 [SofiaMemory] Memoria sessione pulita:', sessionId);
  }

  /**
   * 📊 Ottieni statistiche memoria
   */
  getMemoryStats(): any {
    return {
      activeSessions: this.memoryStore.size,
      totalUsers: this.globalUserMemory.size,
      averageMessagesPerSession: this.calculateAverageMessages(),
      memoryUtilization: this.calculateMemoryUtilization()
    };
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  /**
   * Crea nuova memoria sessione
   */
  private async createNewMemory(
    sessionId: string,
    userId: string,
    userEmail: string
  ): Promise<ConversationMemory> {
    const now = new Date();
    
    return {
      sessionId,
      userId,
      userEmail,
      startTime: now,
      lastActivity: now,
      
      conversationContext: {
        messages: [],
        extractedInfo: [],
        currentContext: {
          topic: 'general',
          mood: 'professional',
          userGoal: null,
          missingInfo: [],
          providedInfo: []
        },
        conversationPatterns: {
          questionTypes: [],
          responseStyles: [],
          topicsDiscussed: [],
          userPreferences: []
        }
      },
      
      userProfile: await this.loadUserProfileMemory(userId),
      projectContext: {
        activeProjects: [],
        discussedProjects: [],
        opportunities: []
      },
      intentMemory: {
        recurringIntents: [],
        activeGoals: [],
        intentContext: {
          currentIntent: null,
          intentHistory: [],
          intentTransitions: []
        }
      },
      preferenceMemory: {
        explicitPreferences: [],
        inferredPreferences: [],
        behavioralPatterns: []
      }
    };
  }

  /**
   * Aggiorna contesto conversazione
   */
  private async updateConversationContext(
    memory: ConversationMemory,
    message: ChatMessage,
    extractedInfo: ExtractedInformation
  ): Promise<void> {
    // Aggiungi messaggio
    memory.conversationContext.messages.push(message);
    memory.conversationContext.extractedInfo.push(extractedInfo);
    
    // Aggiorna contesto attuale
    const context = memory.conversationContext.currentContext;
    
    // Aggiorna topic basato su entità estratte
    if (extractedInfo.entities.projects?.length > 0) {
      context.topic = 'projects';
    } else if (extractedInfo.entities.locations?.length > 0) {
      context.topic = 'locations';
    } else if (extractedInfo.entities.budgets?.length > 0) {
      context.topic = 'budget';
    }
    
    // Aggiorna mood basato su tono del messaggio
    context.mood = this.detectMood(message.content);
    
    // Aggiorna informazioni fornite/mancanti
    this.updateInfoStatus(context, extractedInfo);
    
    // Aggiorna pattern conversazionali
    this.updateConversationPatterns(memory.conversationContext.conversationPatterns, extractedInfo);
    
    memory.lastActivity = new Date();
  }

  /**
   * Aggiorna memoria profilo utente
   */
  private async updateUserProfileMemory(
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<void> {
    const profile = memory.userProfile;
    
    // Aggiorna preferenze comunicative
    if (extractedInfo.entities.preferences) {
      extractedInfo.entities.preferences.forEach(pref => {
        profile.communicationStyle.formality = this.inferFormality(pref);
        profile.communicationStyle.detailLevel = this.inferDetailLevel(pref);
      });
    }
    
    // Aggiorna pattern di lavoro
    if (extractedInfo.entities.locations) {
      profile.workPatterns.locations.push(...extractedInfo.entities.locations);
    }
    if (extractedInfo.entities.budgets) {
      profile.workPatterns.budgetRanges.push(...extractedInfo.entities.budgets);
    }
    
    // Salva memoria globale utente
    this.globalUserMemory.set(memory.userId, profile);
  }

  /**
   * Aggiorna contesto progetti
   */
  private async updateProjectContextMemory(
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<void> {
    const projectContext = memory.projectContext;
    
    // Aggiorna progetti discussi
    if (extractedInfo.entities.projects) {
      extractedInfo.entities.projects.forEach(projectName => {
        const existing = projectContext.discussedProjects.find(p => p.projectId === projectName);
        if (existing) {
          existing.discussionCount++;
          existing.lastDiscussion = new Date();
        } else {
          projectContext.discussedProjects.push({
            projectId: projectName,
            discussionCount: 1,
            lastDiscussion: new Date(),
            topics: [extractedInfo.intents.primary]
          });
        }
      });
    }
  }

  /**
   * Aggiorna memoria intenzioni
   */
  private async updateIntentMemory(
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<void> {
    const intentMemory = memory.intentMemory;
    
    // Aggiorna intenti ricorrenti
    const existingIntent = intentMemory.recurringIntents.find(i => i.intent === extractedInfo.intents.primary);
    if (existingIntent) {
      existingIntent.frequency++;
      existingIntent.lastUsed = new Date();
    } else {
      intentMemory.recurringIntents.push({
        intent: extractedInfo.intents.primary,
        frequency: 1,
        lastUsed: new Date(),
        successRate: 1.0
      });
    }
    
    // Aggiorna contesto intenzioni
    if (intentMemory.intentContext.currentIntent !== extractedInfo.intents.primary) {
      if (intentMemory.intentContext.currentIntent) {
        intentMemory.intentContext.intentTransitions.push({
          from: intentMemory.intentContext.currentIntent,
          to: extractedInfo.intents.primary,
          reason: 'user_request'
        });
      }
      intentMemory.intentContext.currentIntent = extractedInfo.intents.primary;
      intentMemory.intentContext.intentHistory.push(extractedInfo.intents.primary);
    }
  }

  /**
   * Aggiorna memoria preferenze
   */
  private async updatePreferenceMemory(
    memory: ConversationMemory,
    extractedInfo: ExtractedInformation
  ): Promise<void> {
    const preferenceMemory = memory.preferenceMemory;
    
    // Aggiungi preferenze esplicite
    if (extractedInfo.entities.preferences) {
      extractedInfo.entities.preferences.forEach(pref => {
        preferenceMemory.explicitPreferences.push({
          category: 'communication',
          value: pref,
          confidence: 0.9,
          source: 'direct'
        });
      });
    }
    
    // Inferisci preferenze da pattern
    this.inferPreferencesFromPatterns(preferenceMemory, extractedInfo);
  }

  // ============================================================================
  // METODI DI SUPPORTO
  // ============================================================================

  private async loadUserProfileMemory(userId: string): Promise<UserProfileMemory> {
    // Carica da memoria globale o crea nuovo
    let profile = this.globalUserMemory.get(userId);
    if (!profile) {
      profile = {
        communicationStyle: {
          formality: 'professional',
          detailLevel: 'detailed',
          responseFormat: 'structured'
        },
        workPatterns: {
          preferredTimes: [],
          projectTypes: [],
          budgetRanges: [],
          locations: []
        },
        decisionHistory: []
      };
    }
    return profile;
  }

  private detectMood(content: string): 'professional' | 'casual' | 'urgent' | 'exploratory' {
    const urgentKeywords = ['urgente', 'subito', 'asap', 'emergenza'];
    const casualKeywords = ['ciao', 'ciao', 'grazie', 'perfetto'];
    const exploratoryKeywords = ['vorrei sapere', 'come funziona', 'puoi spiegarmi'];
    
    const lowerContent = content.toLowerCase();
    
    if (urgentKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'urgent';
    } else if (casualKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'casual';
    } else if (exploratoryKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'exploratory';
    }
    
    return 'professional';
  }

  private updateInfoStatus(context: any, extractedInfo: ExtractedInformation): void {
    // Logica per aggiornare informazioni fornite/mancanti
    // Implementazione semplificata
  }

  private updateConversationPatterns(patterns: any, extractedInfo: ExtractedInformation): void {
    // Aggiorna pattern conversazionali
    patterns.topicsDiscussed.push(extractedInfo.intents.primary);
  }

  private inferFormality(preference: string): 'formal' | 'casual' | 'mixed' {
    // Logica per inferire formalità
    return 'professional';
  }

  private inferDetailLevel(preference: string): 'brief' | 'detailed' | 'comprehensive' {
    // Logica per inferire livello di dettaglio
    return 'detailed';
  }

  private inferPreferencesFromPatterns(preferenceMemory: PreferenceMemory, extractedInfo: ExtractedInformation): void {
    // Logica per inferire preferenze da pattern
  }

  private calculateAverageMessages(): number {
    const sessions = Array.from(this.memoryStore.values());
    if (sessions.length === 0) return 0;
    
    const totalMessages = sessions.reduce((sum, session) => 
      sum + session.conversationContext.messages.length, 0);
    
    return totalMessages / sessions.length;
  }

  private calculateMemoryUtilization(): number {
    // Calcola utilizzo memoria (implementazione semplificata)
    return this.memoryStore.size / 100; // Assumendo max 100 sessioni
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const sofiaMemorySystem = new SofiaMemorySystem();
