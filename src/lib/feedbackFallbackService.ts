// Servizio di Fallback per Feedback - Funziona anche offline
export interface FeedbackData {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'question' | 'other';
  category?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  screen?: string;
  userAgent?: string;
  timestamp: Date;
  userEmail?: string;
  attachments?: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  tags: string[];
  emailSent: boolean;
  emailSentAt: Date;
  firebaseSaved: boolean;
}

class FeedbackFallbackService {
  private storageKey = 'urbanova_feedback_queue';
  private maxRetries = 3;
  private retryDelay = 5000; // 5 secondi

  // Salva feedback localmente se Firebase non è disponibile
  async saveFeedbackLocally(
    feedback: Omit<
      FeedbackData,
      'id' | 'timestamp' | 'status' | 'emailSent' | 'emailSentAt' | 'firebaseSaved'
    >
  ): Promise<string> {
    const feedbackData: FeedbackData = {
      ...feedback,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'new',
      emailSent: false,
      emailSentAt: new Date(),
      firebaseSaved: false,
    };

    try {
      // Salva nella coda locale
      const queue = this.getLocalQueue();
      queue.push(feedbackData);
      this.saveLocalQueue(queue);

      console.log('💾 [FeedbackFallback] Feedback salvato localmente:', feedbackData.id);

      // Programma il tentativo di sincronizzazione
      this.scheduleSync();

      return feedbackData.id;
    } catch (error) {
      console.error('❌ [FeedbackFallback] Errore salvataggio locale:', error);
      throw error;
    }
  }

  // Ottieni la coda locale
  private getLocalQueue(): FeedbackData[] {
    try {
      if (typeof window === 'undefined') return [];

      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('⚠️ [FeedbackFallback] Errore lettura coda locale:', error);
      return [];
    }
  }

  // Salva la coda locale
  private saveLocalQueue(queue: FeedbackData[]): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.warn('⚠️ [FeedbackFallback] Errore salvataggio coda locale:', error);
    }
  }

  // Programma la sincronizzazione
  private scheduleSync(): void {
    if (typeof window === 'undefined') return;

    // Usa setTimeout per evitare conflitti con altri processi
    setTimeout(() => {
      this.syncWithFirebase();
    }, this.retryDelay);
  }

  // Sincronizza con Firebase quando disponibile
  async syncWithFirebase(): Promise<void> {
    try {
      const queue = this.getLocalQueue();
      if (queue.length === 0) return;

      console.log(`🔄 [FeedbackFallback] Tentativo sincronizzazione ${queue.length} feedback...`);

      // Import dinamico per evitare errori di build
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

      const syncedIds: string[] = [];
      const failedItems: FeedbackData[] = [];

      for (const item of queue) {
        try {
          // Prepara i dati per Firebase
          const firebaseData = {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            localId: item.id, // Mantieni riferimento all'ID locale
            syncedAt: serverTimestamp(),
          };

          // Rimuovi proprietà non Firebase
          delete (firebaseData as any).id;
          delete (firebaseData as any).localId;

          const docRef = await addDoc(collection(db, 'feedback'), firebaseData);
          syncedIds.push(item.id);

          console.log(`✅ [FeedbackFallback] Feedback sincronizzato: ${item.id} -> ${docRef.id}`);
        } catch (error) {
          console.warn(`⚠️ [FeedbackFallback] Errore sincronizzazione ${item.id}:`, error);
          failedItems.push(item);
        }
      }

      // Aggiorna la coda locale
      if (syncedIds.length > 0) {
        const updatedQueue = queue.filter(item => !syncedIds.includes(item.id));
        this.saveLocalQueue(updatedQueue);

        console.log(
          `🎉 [FeedbackFallback] Sincronizzazione completata: ${syncedIds.length}/${queue.length} feedback sincronizzati`
        );
      }

      // Se ci sono ancora elementi falliti, riprogramma
      if (failedItems.length > 0) {
        console.log(
          `⏰ [FeedbackFallback] ${failedItems.length} feedback falliti, riprogrammo sincronizzazione...`
        );
        setTimeout(() => {
          this.syncWithFirebase();
        }, this.retryDelay * 2);
      }
    } catch (error) {
      console.warn('⚠️ [FeedbackFallback] Errore sincronizzazione generale:', error);

      // Riprogramma il tentativo
      setTimeout(() => {
        this.syncWithFirebase();
      }, this.retryDelay * 2);
    }
  }

  // Ottieni statistiche della coda locale
  getLocalQueueStats(): { total: number; pending: number; synced: number } {
    try {
      const queue = this.getLocalQueue();
      const total = queue.length;
      const pending = queue.filter(item => !item.firebaseSaved).length;
      const synced = total - pending;

      return { total, pending, synced };
    } catch (error) {
      console.warn('⚠️ [FeedbackFallback] Errore statistiche coda locale:', error);
      return { total: 0, pending: 0, synced: 0 };
    }
  }

  // Pulisci la coda locale (per debug)
  clearLocalQueue(): void {
    try {
      if (typeof window === 'undefined') return;

      localStorage.removeItem(this.storageKey);
      console.log('🗑️ [FeedbackFallback] Coda locale pulita');
    } catch (error) {
      console.warn('⚠️ [FeedbackFallback] Errore pulizia coda locale:', error);
    }
  }

  // Forza la sincronizzazione immediata
  async forceSync(): Promise<void> {
    console.log('🚀 [FeedbackFallback] Sincronizzazione forzata...');
    await this.syncWithFirebase();
  }

  // Controlla se il servizio è disponibile
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 'localStorage' in window;
  }
}

export const feedbackFallbackService = new FeedbackFallbackService();
