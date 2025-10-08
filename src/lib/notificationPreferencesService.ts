import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  NotificationPreferences, 
  NotificationType, 
  NotificationPriority,
  DEFAULT_NOTIFICATION_PREFERENCES 
} from '@/types/notificationPreferences';

/**
 * Servizio per gestire le preferenze utente per le notifiche
 */
class NotificationPreferencesService {
  private static instance: NotificationPreferencesService;

  public static getInstance(): NotificationPreferencesService {
    if (!NotificationPreferencesService.instance) {
      NotificationPreferencesService.instance = new NotificationPreferencesService();
    }
    return NotificationPreferencesService.instance;
  }

  /**
   * Ottiene le preferenze notifiche per un utente
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      const preferencesSnap = await getDoc(preferencesRef);

      if (!preferencesSnap.exists()) {
        console.log('📋 [NotificationPreferences] Nessuna preferenza trovata per utente:', userId);
        return null;
      }

      const data = preferencesSnap.data();
      return {
        id: preferencesSnap.id,
        userId: data.userId,
        global: data.global,
        types: data.types,
        channels: data.channels,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as NotificationPreferences;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore recupero preferenze:', error);
      return null;
    }
  }

  /**
   * Crea le preferenze di default per un nuovo utente
   */
  async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const now = new Date();
      const preferences: NotificationPreferences = {
        id: userId,
        userId,
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        createdAt: now,
        updatedAt: now
      };

      const preferencesRef = doc(db, 'notificationPreferences', userId);
      await setDoc(preferencesRef, {
        ...preferences,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('✅ [NotificationPreferences] Preferenze di default create per utente:', userId);
      return preferences;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore creazione preferenze:', error);
      throw error;
    }
  }

  /**
   * Aggiorna le preferenze notifiche
   */
  async updatePreferences(
    userId: string, 
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const preferencesRef = doc(db, 'notificationPreferences', userId);
      
      // Rimuovi campi che non dovrebbero essere aggiornati direttamente
      const { id, userId: _, createdAt, ...updateData } = updates;
      
      await updateDoc(preferencesRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      console.log('✅ [NotificationPreferences] Preferenze aggiornate per utente:', userId);
      
      // Restituisci le preferenze aggiornate
      return await this.getPreferences(userId);

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore aggiornamento preferenze:', error);
      return null;
    }
  }

  /**
   * Ottiene o crea le preferenze per un utente (lazy initialization)
   */
  async getOrCreatePreferences(userId: string): Promise<NotificationPreferences> {
    let preferences = await this.getPreferences(userId);
    
    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId);
    }
    
    return preferences;
  }

  /**
   * Verifica se un tipo di notifica è abilitato per un utente
   */
  async isNotificationTypeEnabled(
    userId: string, 
    type: NotificationType
  ): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Controlla se le notifiche globali sono abilitate
      if (!preferences.global.enabled) {
        return false;
      }
      
      // Controlla se questo tipo di notifica è abilitato
      return preferences.types[type]?.enabled ?? true;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore verifica tipo notifica:', error);
      return true; // Default: abilita se c'è errore
    }
  }

  /**
   * Verifica se un canale è abilitato per un tipo di notifica
   */
  async isChannelEnabled(
    userId: string, 
    type: NotificationType, 
    channel: 'in_app' | 'push' | 'email'
  ): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      // Controlla se le notifiche globali sono abilitate
      if (!preferences.global.enabled) {
        return false;
      }
      
      // Controlla se il canale globale è abilitato
      if (!preferences.channels[channel].enabled) {
        return false;
      }
      
      // Controlla se questo tipo di notifica è abilitato per questo canale
      return preferences.types[type]?.channels[channel] ?? true;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore verifica canale:', error);
      return true; // Default: abilita se c'è errore
    }
  }

  /**
   * Verifica se la priorità della notifica è sufficiente per essere inviata
   */
  async isPrioritySufficient(
    userId: string, 
    type: NotificationType, 
    priority: NotificationPriority
  ): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      const typePreferences = preferences.types[type];
      if (!typePreferences) {
        return true; // Default: abilita se tipo non trovato
      }
      
      const priorityOrder: Record<NotificationPriority, number> = {
        'LOW': 1,
        'MEDIUM': 2,
        'HIGH': 3,
        'URGENT': 4
      };
      
      const notificationPriority = priorityOrder[priority];
      const thresholdPriority = priorityOrder[typePreferences.priority_threshold];
      
      return notificationPriority >= thresholdPriority;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore verifica priorità:', error);
      return true; // Default: abilita se c'è errore
    }
  }

  /**
   * Verifica se è in quiet hours
   */
  async isQuietHours(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      if (!preferences.global.quiet_hours.enabled) {
        return false;
      }
      
      const now = new Date();
      const currentTime = now.toLocaleTimeString('it-IT', { 
        hour12: false, 
        timeZone: preferences.global.quiet_hours.timezone 
      });
      
      const startTime = preferences.global.quiet_hours.start_time;
      const endTime = preferences.global.quiet_hours.end_time;
      
      // Se start_time > end_time, le quiet hours attraversano la mezzanotte
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      } else {
        return currentTime >= startTime && currentTime <= endTime;
      }

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore verifica quiet hours:', error);
      return false; // Default: non in quiet hours se c'è errore
    }
  }

  /**
   * Aggiorna le preferenze per un tipo specifico di notifica
   */
  async updateTypePreferences(
    userId: string,
    type: NotificationType,
    typePreferences: Partial<NotificationPreferences['types'][NotificationType]>
  ): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      const updatedTypes = {
        ...preferences.types,
        [type]: {
          ...preferences.types[type],
          ...typePreferences
        }
      };
      
      await this.updatePreferences(userId, { types: updatedTypes });
      return true;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore aggiornamento tipo preferenze:', error);
      return false;
    }
  }

  /**
   * Aggiorna le preferenze per un canale
   */
  async updateChannelPreferences(
    userId: string,
    channel: 'in_app' | 'push' | 'email',
    channelPreferences: Partial<NotificationPreferences['channels'][typeof channel]>
  ): Promise<boolean> {
    try {
      const preferences = await this.getOrCreatePreferences(userId);
      
      const updatedChannels = {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel],
          ...channelPreferences
        }
      };
      
      await this.updatePreferences(userId, { channels: updatedChannels });
      return true;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore aggiornamento canale preferenze:', error);
      return false;
    }
  }

  /**
   * Resetta le preferenze ai valori di default
   */
  async resetToDefaults(userId: string): Promise<boolean> {
    try {
      const preferences = await this.createDefaultPreferences(userId);
      return !!preferences;

    } catch (error) {
      console.error('❌ [NotificationPreferences] Errore reset preferenze:', error);
      return false;
    }
  }
}

export const notificationPreferencesService = NotificationPreferencesService.getInstance();
