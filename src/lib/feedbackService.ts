import {query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  where } from 'firebase/firestore';

import { db } from '@/lib/firebase';

// 🛡️ OS PROTECTION - Importa protezione CSS per feedback service
import '@/lib/osProtection';
import { safeCollection } from './firebaseUtils';

export interface Feedback {
  id: string;
  type: 'bug' | 'improvement' | 'feature' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  screen?: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  userEmail?: string;
  attachmentUrl?: string;
  createdAt: any;
  updatedAt?: any;
  assignedTo?: string;
  resolvedAt?: any;
  resolution?: string;
  tags: string[];
}

export class FeedbackService {
  private readonly COLLECTION = 'feedback';

  // Ottieni tutti i feedback (solo per admin)
  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const feedbacksRef = safeCollection(this.COLLECTION);
      const q = query(feedbacksRef, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Feedback[];
    } catch (error) {
      console.error('❌ [FeedbackService] Errore recupero feedback:', error);
      throw new Error('Impossibile recuperare i feedback');
    }
  }

  // Ottieni feedback per stato
  async getFeedbackByStatus(status: Feedback['status']): Promise<Feedback[]> {
    try {
      const feedbacksRef = safeCollection(this.COLLECTION);
      const q = query(feedbacksRef, where('status', '==', status), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Feedback[];
    } catch (error) {
      console.error('❌ [FeedbackService] Errore recupero feedback per stato:', error);
      throw new Error('Impossibile recuperare i feedback');
    }
  }

  // Ottieni feedback per priorità
  async getFeedbackByPriority(priority: Feedback['priority']): Promise<Feedback[]> {
    try {
      const feedbacksRef = safeCollection(this.COLLECTION);
      const q = query(
        feedbacksRef,
        where('priority', '==', priority),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Feedback[];
    } catch (error) {
      console.error('❌ [FeedbackService] Errore recupero feedback per priorità:', error);
      throw new Error('Impossibile recuperare i feedback');
    }
  }

  // Aggiorna stato feedback
  async updateFeedbackStatus(feedbackId: string, status: Feedback['status']): Promise<void> {
    try {
      const feedbackRef = doc(db, this.COLLECTION, feedbackId);
      await updateDoc(feedbackRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'resolved' && { resolvedAt: serverTimestamp() }),
      });
    } catch (error) {
      console.error('❌ [FeedbackService] Errore aggiornamento stato:', error);
      throw new Error('Impossibile aggiornare lo stato del feedback');
    }
  }

  // Assegna feedback a un utente
  async assignFeedback(feedbackId: string, assignedTo: string): Promise<void> {
    try {
      const feedbackRef = doc(db, this.COLLECTION, feedbackId);
      await updateDoc(feedbackRef, {
        assignedTo,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ [FeedbackService] Errore assegnazione feedback:', error);
      throw new Error('Impossibile assegnare il feedback');
    }
  }

  // Aggiungi risoluzione al feedback
  async addResolution(feedbackId: string, resolution: string): Promise<void> {
    try {
      const feedbackRef = doc(db, this.COLLECTION, feedbackId);
      await updateDoc(feedbackRef, {
        resolution,
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('❌ [FeedbackService] Errore aggiunta risoluzione:', error);
      throw new Error('Impossibile aggiungere la risoluzione');
    }
  }

  // Ottieni statistiche feedback
  async getFeedbackStats(): Promise<{
    total: number;
    byStatus: Record<Feedback['status'], number>;
    byPriority: Record<Feedback['priority'], number>;
    byType: Record<Feedback['type'], number>;
  }> {
    try {
      const feedbacks = await this.getAllFeedback();

      const byStatus = feedbacks.reduce(
        (acc, feedback) => {
          acc[feedback.status] = (acc[feedback.status] || 0) + 1;
          return acc;
        },
        {} as Record<Feedback['status'], number>
      );

      const byPriority = feedbacks.reduce(
        (acc, feedback) => {
          acc[feedback.priority] = (acc[feedback.priority] || 0) + 1;
          return acc;
        },
        {} as Record<Feedback['priority'], number>
      );

      const byType = feedbacks.reduce(
        (acc, feedback) => {
          acc[feedback.type] = (acc[feedback.type] || 0) + 1;
          return acc;
        },
        {} as Record<Feedback['type'], number>
      );

      return {
        total: feedbacks.length,
        byStatus,
        byPriority,
        byType,
      };
    } catch (error) {
      console.error('❌ [FeedbackService] Errore recupero statistiche:', error);
      throw new Error('Impossibile recuperare le statistiche');
    }
  }

  // Cerca feedback per testo
  async searchFeedback(searchTerm: string): Promise<Feedback[]> {
    try {
      const feedbacks = await this.getAllFeedback();

      return feedbacks.filter(
        feedback =>
          feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.screen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feedback.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('❌ [FeedbackService] Errore ricerca feedback:', error);
      throw new Error('Impossibile cercare nei feedback');
    }
  }
}

export const feedbackService = new FeedbackService();
