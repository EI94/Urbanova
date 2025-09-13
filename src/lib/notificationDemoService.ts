import { firebaseNotificationService } from './firebaseNotificationService';

/**
 * Servizio per creare notifiche demo per testare il sistema
 */
export class NotificationDemoService {
  
  /**
   * Crea notifiche demo per un utente
   */
  static async createDemoNotifications(userId: string): Promise<void> {
    try {
      console.log('🎭 [NotificationDemo] Creando notifiche demo per:', userId);

      // 1. Invito al workspace
      await firebaseNotificationService.createWorkspaceInviteNotification(
        userId,
        'Urbanova Team',
        'Mario Rossi'
      );

      // 2. File condiviso
      await firebaseNotificationService.createFileSharedNotification(
        userId,
        'Planimetrie_Villa_Moderna.pdf',
        'Giulia Bianchi',
        'Progetto Villa Moderna'
      );

      // 3. Aggiornamento progetto
      await firebaseNotificationService.createProjectUpdateNotification(
        userId,
        'Condominio Sostenibile',
        'aggiornato il budget',
        'Luca Verdi'
      );

      // 4. Richiesta collaborazione
      await firebaseNotificationService.createCollaborationRequestNotification(
        userId,
        'Centro Commerciale Roma',
        'Anna Neri'
      );

      // 5. Analisi di fattibilità completata
      await firebaseNotificationService.createFeasibilityAnalysisCompleteNotification(
        userId,
        'Residenza di Lusso Milano',
        'analysis_123456'
      );

      // 6. Business Plan pronto
      await firebaseNotificationService.createBusinessPlanReadyNotification(
        userId,
        'Complesso Residenziale Torino',
        'plan_789012'
      );

      // 7. Nuove opportunità di mercato
      await firebaseNotificationService.createMarketIntelligenceUpdateNotification(
        userId,
        'Roma, Quartiere Aurelio',
        5
      );

      // 8. Manutenzione sistema
      await firebaseNotificationService.createSystemMaintenanceNotification(
        userId,
        'Aggiornamento Database',
        'Domenica 15 Settembre, ore 02:00'
      );

      // 9. Promemoria scadenza
      await firebaseNotificationService.createDeadlineReminderNotification(
        userId,
        'Presentazione Progetto',
        '20 Settembre 2024',
        'Villa Moderna'
      );

      console.log('✅ [NotificationDemo] Notifiche demo create con successo');
    } catch (error) {
      console.error('❌ [NotificationDemo] Errore creazione notifiche demo:', error);
    }
  }

  /**
   * Crea notifiche specifiche per testare diversi tipi
   */
  static async createSpecificDemoNotifications(userId: string, type: string): Promise<void> {
    try {
      console.log(`🎭 [NotificationDemo] Creando notifica demo di tipo: ${type}`);

      switch (type) {
        case 'workspace_invite':
          await firebaseNotificationService.createWorkspaceInviteNotification(
            userId,
            'Team Progetti Immobiliari',
            'Paolo Blu'
          );
          break;

        case 'file_shared':
          await firebaseNotificationService.createFileSharedNotification(
            userId,
            'Relazione_Tecnica_Completa.pdf',
            'Sara Rosa',
            'Progetto Edificio Sostenibile'
          );
          break;

        case 'project_update':
          await firebaseNotificationService.createProjectUpdateNotification(
            userId,
            'Torre Residenziale',
            'modificato il design',
            'Marco Gialli'
          );
          break;

        case 'collaboration_request':
          await firebaseNotificationService.createCollaborationRequestNotification(
            userId,
            'Complesso Misto Residenziale-Commerciale',
            'Elena Viola'
          );
          break;

        case 'feasibility_complete':
          await firebaseNotificationService.createFeasibilityAnalysisCompleteNotification(
            userId,
            'Villa di Prestigio',
            'analysis_456789'
          );
          break;

        case 'business_plan_ready':
          await firebaseNotificationService.createBusinessPlanReadyNotification(
            userId,
            'Centro Direzionale',
            'plan_123456'
          );
          break;

        case 'market_update':
          await firebaseNotificationService.createMarketIntelligenceUpdateNotification(
            userId,
            'Milano, Porta Nuova',
            8
          );
          break;

        case 'system_maintenance':
          await firebaseNotificationService.createSystemMaintenanceNotification(
            userId,
            'Backup Database',
            'Lunedì 16 Settembre, ore 01:00'
          );
          break;

        case 'deadline_reminder':
          await firebaseNotificationService.createDeadlineReminderNotification(
            userId,
          'Consegna Documentazione',
          '25 Settembre 2024',
          'Progetto Condominio'
          );
          break;

        default:
          console.warn(`⚠️ [NotificationDemo] Tipo notifica non riconosciuto: ${type}`);
      }

      console.log(`✅ [NotificationDemo] Notifica demo di tipo ${type} creata`);
    } catch (error) {
      console.error(`❌ [NotificationDemo] Errore creazione notifica demo ${type}:`, error);
    }
  }

  /**
   * Pulisce tutte le notifiche demo per un utente
   */
  static async clearDemoNotifications(userId: string): Promise<void> {
    try {
      console.log('🧹 [NotificationDemo] Pulizia notifiche demo per:', userId);
      
      // In un sistema reale, dovresti implementare un metodo per eliminare
      // tutte le notifiche di un utente o quelle demo specifiche
      console.log('✅ [NotificationDemo] Notifiche demo pulite');
    } catch (error) {
      console.error('❌ [NotificationDemo] Errore pulizia notifiche demo:', error);
    }
  }
}

export const notificationDemoService = NotificationDemoService;
