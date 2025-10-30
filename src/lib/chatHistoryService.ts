// Servizio per gestire la chat history persistente

// 🛡️ OS PROTECTION - Carica solo lato client per evitare TDZ
if (typeof window !== 'undefined') {
  import('@/lib/osProtection').catch(() => {});
}
import { db } from './firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    toolId?: string;
    actionName?: string;
    runId?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messages: ChatMessage[];
}

class ChatHistoryService {
  private readonly STORAGE_KEY = 'urbanova_chat_history';
  private readonly MAX_SESSIONS = 50; // Massimo 50 chat salvate
  private fallbackStorage: ChatSession[] = []; // Fallback in-memory se localStorage fallisce

  // Verifica se localStorage è disponibile
  private isLocalStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Salva una sessione di chat
  saveChatSession(session: ChatSession): void {
    try {
      // Protezione per evitare crash con title undefined
      if (!session.title) {
        session.title = 'Sessione senza titolo';
      }
      
      const existingSessions = this.getChatSessions();
      
      // Rimuovi sessioni duplicate (stesso ID)
      const filteredSessions = existingSessions.filter(s => s.id !== session.id);
      
      // Aggiungi la nuova sessione all'inizio
      const updatedSessions = [session, ...filteredSessions].slice(0, this.MAX_SESSIONS);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSessions));
      console.log('✅ [Chat History] Sessione salvata:', session.title);
    } catch (error) {
      console.error('❌ [Chat History] Errore salvataggio sessione:', error);
    }
  }

  // Recupera tutte le sessioni di chat
  getChatSessions(): ChatSession[] {
    try {
      if (!this.isLocalStorageAvailable()) {
        console.warn('⚠️ [ChatHistoryService] localStorage non disponibile, uso fallback in-memory');
        return this.fallbackStorage;
      }
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      
      // Converte le date da stringa a oggetto Date e protegge title
      return sessions.map((session: any) => ({
        ...session,
        title: session.title || 'Sessione senza titolo',
        preview: session.preview || 'Nessun preview disponibile',
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('❌ [Chat History] Errore recupero sessioni:', error);
      console.warn('⚠️ [ChatHistoryService] Fallback a storage in-memory');
      return this.fallbackStorage;
    }
  }

  // Recupera una sessione specifica per ID
  getChatSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getChatSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('❌ [Chat History] Errore recupero sessione:', error);
      return null;
    }
  }

  // Elimina una sessione
  deleteChatSession(sessionId: string): void {
    try {
      console.log('🗑️ [ChatHistoryService] Eliminando sessione:', sessionId);
      
      // Verifica che localStorage sia disponibile
      if (!this.isLocalStorageAvailable()) {
        console.warn('⚠️ [ChatHistoryService] localStorage non disponibile, uso fallback in-memory');
        this.fallbackStorage = this.fallbackStorage.filter(s => s.id !== sessionId);
        console.log('✅ [ChatHistoryService] Sessione eliminata da fallback:', sessionId);
        return;
      }
      
      const sessions = this.getChatSessions();
      console.log('🗑️ [ChatHistoryService] Sessioni PRIMA eliminazione:', sessions.length);
      console.log('🗑️ [ChatHistoryService] Sessioni da eliminare:', sessions.filter(s => s.id === sessionId).map(s => ({ id: s.id, title: s.title })));
      
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      console.log('🗑️ [ChatHistoryService] Sessioni DOPO filtro:', filteredSessions.length);
      
      // Verifica che il filtro abbia funzionato
      if (filteredSessions.length === sessions.length) {
        console.warn('⚠️ [ChatHistoryService] Nessuna sessione eliminata - ID non trovato:', sessionId);
        return;
      }
      
      // Salva nel localStorage con error handling robusto
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
        console.log('✅ [Chat History] Sessione eliminata:', sessionId);
      } catch (storageError) {
        console.error('❌ [ChatHistoryService] Errore salvataggio localStorage:', storageError);
        // Prova a pulire localStorage e riprovare
        try {
          localStorage.removeItem(this.STORAGE_KEY);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
          console.log('✅ [ChatHistoryService] localStorage pulito e ripristinato');
        } catch (retryError) {
          console.error('❌ [ChatHistoryService] Errore critico localStorage:', retryError);
          throw retryError;
        }
      }
      
      // 🔥 SINCRONIZZAZIONE FIREBASE: Elimina anche le memorie RAG associate
      this.deleteFirebaseMemories(sessionId).catch(error => {
        console.error('❌ [ChatHistoryService] Errore eliminazione Firebase:', error);
        // Non bloccare l'operazione se Firebase fallisce
      });
      
      // Verifica che sia stata effettivamente eliminata
      const verifySessions = this.getChatSessions();
      console.log('✅ [ChatHistoryService] Verifica finale - sessioni rimanenti:', verifySessions.length);
      
      // Verifica finale che la sessione sia stata eliminata
      const stillExists = verifySessions.some(s => s.id === sessionId);
      if (stillExists) {
        console.error('❌ [ChatHistoryService] ERRORE CRITICO: Sessione ancora presente dopo eliminazione!');
        console.error('❌ [ChatHistoryService] Sessioni rimanenti:', verifySessions.map(s => ({ id: s.id, title: s.title })));
      } else {
        console.log('✅ [ChatHistoryService] Eliminazione confermata - sessione non più presente');
      }
      
    } catch (error) {
      console.error('❌ [Chat History] Errore eliminazione sessione:', error);
      // Rethrow per permettere al chiamante di gestire l'errore
      throw error;
    }
  }

  // 🔥 NUOVO: Elimina memorie Firebase associate alla sessione
  private async deleteFirebaseMemories(sessionId: string): Promise<void> {
    try {
      console.log('🔥 [ChatHistoryService] Eliminando memorie Firebase per sessione:', sessionId);
      
      // Estrai userId dalla sessionId (formato: session_userId_persistent)
      const userIdMatch = sessionId.match(/session_(.+)_persistent/);
      if (!userIdMatch) {
        console.warn('⚠️ [ChatHistoryService] SessionId non riconosciuto per Firebase:', sessionId);
        return;
      }
      
      const userId = userIdMatch[1];
      console.log('🔥 [ChatHistoryService] UserId estratto:', userId);
      
      // Cerca memorie RAG associate alla sessione
      const memoriesRef = collection(db, 'os2_rag_memories');
      const q = query(
        memoriesRef,
        where('userId', '==', userId),
        where('sessionId', '==', sessionId)
      );
      
      const snapshot = await getDocs(q);
      console.log('🔥 [ChatHistoryService] Trovate memorie Firebase da eliminare:', snapshot.size);
      
      // Elimina tutte le memorie trovate
      const deletePromises = snapshot.docs.map(docSnapshot => {
        console.log('🔥 [ChatHistoryService] Eliminando memoria Firebase:', docSnapshot.id);
        return deleteDoc(doc(db, 'os2_rag_memories', docSnapshot.id));
      });
      
      await Promise.all(deletePromises);
      console.log('✅ [ChatHistoryService] Memorie Firebase eliminate:', deletePromises.length);
      
    } catch (error) {
      console.error('❌ [ChatHistoryService] Errore eliminazione Firebase:', error);
      // Non bloccare l'operazione principale se Firebase fallisce
    }
  }

  // Elimina tutte le sessioni
  clearAllChatSessions(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('✅ [Chat History] Tutte le sessioni eliminate');
    } catch (error) {
      console.error('❌ [Chat History] Errore eliminazione tutte le sessioni:', error);
    }
  }

  // Aggiorna una sessione esistente
  updateChatSession(sessionId: string, updates: Partial<ChatSession>): void {
    try {
      const sessions = this.getChatSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) {
        console.warn('⚠️ [Chat History] Sessione non trovata per aggiornamento:', sessionId);
        return;
      }
      
      sessions[sessionIndex] = { ...sessions[sessionIndex], ...updates };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      console.log('✅ [Chat History] Sessione aggiornata:', sessionId);
    } catch (error) {
      console.error('❌ [Chat History] Errore aggiornamento sessione:', error);
    }
  }

  // Crea una nuova sessione da messaggi
  createSessionFromMessages(messages: ChatMessage[]): ChatSession {
    const firstUserMessage = messages.find(m => m.type === 'user');
    const title = firstUserMessage 
      ? (firstUserMessage.content.length > 30 
          ? firstUserMessage.content.substring(0, 30) + '...' 
          : firstUserMessage.content)
      : 'Nuova Chat';
    
    const lastAssistantMessage = messages.filter(m => m.type === 'assistant').pop();
    const preview = lastAssistantMessage 
      ? lastAssistantMessage.content.substring(0, 100) + '...'
      : 'Conversazione iniziata';
    
    return {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      preview,
      timestamp: new Date(),
      messages
    };
  }

  // Esporta tutte le chat in formato JSON
  exportChatHistory(): string {
    try {
      const sessions = this.getChatSessions();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('❌ [Chat History] Errore esportazione:', error);
      return '[]';
    }
  }

  // Importa chat da formato JSON
  importChatHistory(jsonData: string): boolean {
    try {
      const sessions = JSON.parse(jsonData);
      if (!Array.isArray(sessions)) {
        throw new Error('Formato dati non valido');
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      console.log('✅ [Chat History] Chat importate:', sessions.length);
      return true;
    } catch (error) {
      console.error('❌ [Chat History] Errore importazione:', error);
      return false;
    }
  }
}

export const chatHistoryService = new ChatHistoryService();
