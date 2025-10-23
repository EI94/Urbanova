// Servizio per gestire la chat history persistente

// 🛡️ OS PROTECTION - Importa protezione CSS per chat history service
import '@/lib/osProtection';
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
      return [];
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
      const sessions = this.getChatSessions();
      console.log('🗑️ [ChatHistoryService] Sessioni PRIMA eliminazione:', sessions.length);
      console.log('🗑️ [ChatHistoryService] Sessioni da eliminare:', sessions.filter(s => s.id === sessionId).map(s => ({ id: s.id, title: s.title })));
      
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      console.log('🗑️ [ChatHistoryService] Sessioni DOPO filtro:', filteredSessions.length);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
      console.log('✅ [Chat History] Sessione eliminata:', sessionId);
      
      // Verifica che sia stata effettivamente eliminata
      const verifySessions = this.getChatSessions();
      console.log('✅ [ChatHistoryService] Verifica finale - sessioni rimanenti:', verifySessions.length);
      
    } catch (error) {
      console.error('❌ [Chat History] Errore eliminazione sessione:', error);
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
