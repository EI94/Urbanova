/**
 * Tipi di notifiche disponibili
 */
export type NotificationType = 
  | 'PROJECT'           // Nuovi progetti creati
  | 'FEASIBILITY'       // Analisi di fattibilità completate
  | 'BUSINESS_PLAN'     // Business plan completati
  | 'DEADLINE'          // Scadenze progetti
  | 'LEAD'              // Nuovi lead acquisiti
  | 'SYSTEM'            // Notifiche di sistema
  | 'PERFORMANCE'       // Warning performance
  | 'ERROR'             // Errori di sistema
  | 'WARNING'           // Warning generali
  | 'SUCCESS'           // Operazioni completate con successo
  | 'MESSAGE'           // Messaggi generici
  | 'ALERT';            // Allerte urgenti

// Priorità rimosse dal sistema

/**
 * Canali di notifica
 */
export type NotificationChannel = 'in_app' | 'push' | 'email';

/**
 * Preferenze per un tipo specifico di notifica
 */
export interface NotificationTypePreferences {
  enabled: boolean;
  channels: {
    in_app: boolean;
    push: boolean;
    email: boolean;
  };
}

/**
 * Preferenze globali per le notifiche
 */
export interface NotificationPreferences {
  id: string;
  userId: string;
  
  // Preferenze globali
  global: {
    enabled: boolean;
    quiet_hours: {
      enabled: boolean;
      start_time: string; // "22:00"
      end_time: string;   // "08:00"
      timezone: string;   // "Europe/Rome"
    };
    digest_mode: {
      enabled: boolean;
      frequency: 'hourly' | 'daily' | 'weekly';
      summary_types: NotificationType[];
    };
  };

  // Preferenze per tipo di notifica
  types: Record<NotificationType, NotificationTypePreferences>;

  // Preferenze per canale
  channels: {
    in_app: {
      enabled: boolean;
      sound: boolean;
      vibration: boolean;
    };
    push: {
      enabled: boolean;
      sound: boolean;
      badge: boolean;
      critical_alerts: boolean; // Solo per URGENT
    };
    email: {
      enabled: boolean;
      frequency: 'immediate' | 'hourly' | 'daily';
      include_summary: boolean;
    };
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template per le preferenze di default
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  global: {
    enabled: true,
    quiet_hours: {
      enabled: false,
      start_time: "22:00",
      end_time: "08:00",
      timezone: "Europe/Rome"
    },
    digest_mode: {
      enabled: false,
      frequency: 'daily',
      summary_types: ['SYSTEM', 'PERFORMANCE']
    }
  },
  
  types: {
    PROJECT: {
      enabled: true,
      channels: { in_app: true, push: true, email: false }
    },
    FEASIBILITY: {
      enabled: true,
      channels: { in_app: true, push: true, email: true }
    },
    BUSINESS_PLAN: {
      enabled: true,
      channels: { in_app: true, push: true, email: true }
    },
    DEADLINE: {
      enabled: true,
      channels: { in_app: true, push: true, email: true }
    },
    LEAD: {
      enabled: true,
      channels: { in_app: true, push: true, email: false }
    },
    SYSTEM: {
      enabled: true,
      channels: { in_app: true, push: false, email: false }
    },
    PERFORMANCE: {
      enabled: true,
      channels: { in_app: true, push: false, email: false }
    },
    ERROR: {
      enabled: true,
      channels: { in_app: true, push: true, email: true }
    },
    WARNING: {
      enabled: true,
      channels: { in_app: true, push: true, email: false }
    },
    SUCCESS: {
      enabled: true,
      channels: { in_app: true, push: false, email: false }
    },
    MESSAGE: {
      enabled: true,
      channels: { in_app: true, push: true, email: false }
    },
    ALERT: {
      enabled: true,
      channels: { in_app: true, push: true, email: true }
    }
  },
  
  channels: {
    in_app: {
      enabled: true,
      sound: true,
      vibration: true
    },
    push: {
      enabled: true,
      sound: true,
      badge: true,
      critical_alerts: true
    },
    email: {
      enabled: false,
      frequency: 'daily',
      include_summary: true
    }
  }
};
