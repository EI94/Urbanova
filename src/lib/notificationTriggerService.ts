import { firebaseNotificationService } from './firebaseNotificationService';

/**
 * Servizio per generare notifiche automatiche basate su eventi del sistema
 * Integra con tutti i moduli di Urbanova per creare notifiche contestuali
 */
export class NotificationTriggerService {
  private static instance: NotificationTriggerService;

  public static getInstance(): NotificationTriggerService {
    if (!NotificationTriggerService.instance) {
      NotificationTriggerService.instance = new NotificationTriggerService();
    }
    return NotificationTriggerService.instance;
  }

  // ========================================
  // NOTIFICHE PROGETTI
  // ========================================

  /**
   * Notifica creazione nuovo progetto
   */
  async notifyProjectCreated(userId: string, projectData: {
    projectId: string;
    projectName: string;
    projectType: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'PROJECT',
        priority: 'MEDIUM',
        title: '🎉 Nuovo Progetto Creato',
        message: `Il progetto "${projectData.projectName}" è stato creato con successo.`,
        data: {
          projectId: projectData.projectId,
          projectName: projectData.projectName,
          projectType: projectData.projectType,
          action: 'project_created'
        },
        actions: [
          {
            type: 'view_project',
            label: 'Visualizza Progetto',
            url: `/dashboard/projects/${projectData.projectId}`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica progetto creato inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica progetto creato:', error);
    }
  }

  /**
   * Notifica completamento analisi di fattibilità
   */
  async notifyFeasibilityCompleted(userId: string, analysisData: {
    projectId: string;
    projectName: string;
    roi: number;
    margin: number;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'SUCCESS',
        priority: 'HIGH',
        title: '📊 Analisi di Fattibilità Completata',
        message: `L'analisi per "${analysisData.projectName}" mostra ROI ${analysisData.roi.toFixed(1)}% e margine ${analysisData.margin.toFixed(1)}%.`,
        data: {
          projectId: analysisData.projectId,
          projectName: analysisData.projectName,
          roi: analysisData.roi,
          margin: analysisData.margin,
          action: 'feasibility_completed'
        },
        actions: [
          {
            type: 'view_analysis',
            label: 'Visualizza Analisi',
            url: `/dashboard/feasibility-analysis?projectId=${analysisData.projectId}`
          },
          {
            type: 'create_business_plan',
            label: 'Crea Business Plan',
            url: `/dashboard/business-plan?projectId=${analysisData.projectId}&fromFeasibility=true`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica fattibilità completata inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica fattibilità:', error);
    }
  }

  /**
   * Notifica completamento Business Plan
   */
  async notifyBusinessPlanCompleted(userId: string, bpData: {
    projectId: string;
    projectName: string;
    npv: number;
    irr: number;
    bestScenario: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'SUCCESS',
        priority: 'HIGH',
        title: '💰 Business Plan Completato',
        message: `Business Plan per "${bpData.projectName}" completato. VAN: €${bpData.npv.toLocaleString()}, TIR: ${bpData.irr.toFixed(1)}%. Scenario migliore: ${bpData.bestScenario}.`,
        data: {
          projectId: bpData.projectId,
          projectName: bpData.projectName,
          npv: bpData.npv,
          irr: bpData.irr,
          bestScenario: bpData.bestScenario,
          action: 'business_plan_completed'
        },
        actions: [
          {
            type: 'view_business_plan',
            label: 'Visualizza Business Plan',
            url: `/dashboard/business-plan?projectId=${bpData.projectId}`
          },
          {
            type: 'export_pdf',
            label: 'Esporta PDF',
            url: `/dashboard/business-plan?projectId=${bpData.projectId}&export=pdf`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica Business Plan completato inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica Business Plan:', error);
    }
  }

  // ========================================
  // NOTIFICHE SISTEMA
  // ========================================

  /**
   * Notifica scadenza progetto
   */
  async notifyProjectDeadline(userId: string, projectData: {
    projectId: string;
    projectName: string;
    deadline: Date;
    daysRemaining: number;
  }): Promise<void> {
    try {
      const priority = projectData.daysRemaining <= 3 ? 'URGENT' : 
                     projectData.daysRemaining <= 7 ? 'HIGH' : 'MEDIUM';
      
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'ALERT',
        priority,
        title: '⏰ Scadenza Progetto',
        message: `Il progetto "${projectData.projectName}" scade tra ${projectData.daysRemaining} giorni (${projectData.deadline.toLocaleDateString()}).`,
        data: {
          projectId: projectData.projectId,
          projectName: projectData.projectName,
          deadline: projectData.deadline,
          daysRemaining: projectData.daysRemaining,
          action: 'project_deadline'
        },
        actions: [
          {
            type: 'view_project',
            label: 'Visualizza Progetto',
            url: `/dashboard/projects/${projectData.projectId}`
          },
          {
            type: 'extend_deadline',
            label: 'Prolunga Scadenza',
            url: `/dashboard/projects/${projectData.projectId}?action=extend`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica scadenza progetto inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica scadenza:', error);
    }
  }

  /**
   * Notifica nuovo messaggio OS
   */
  async notifyOSMessage(userId: string, messageData: {
    messageId: string;
    message: string;
    response: string;
    toolUsed?: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'MESSAGE',
        priority: 'LOW',
        title: '🤖 Risposta OS Disponibile',
        message: `Urbanova OS ha risposto alla tua richiesta${messageData.toolUsed ? ` usando ${messageData.toolUsed}` : ''}.`,
        data: {
          messageId: messageData.messageId,
          message: messageData.message,
          response: messageData.response,
          toolUsed: messageData.toolUsed,
          action: 'os_message'
        },
        actions: [
          {
            type: 'view_conversation',
            label: 'Visualizza Conversazione',
            url: `/dashboard/os?messageId=${messageData.messageId}`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica messaggio OS inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica OS:', error);
    }
  }

  // ========================================
  // NOTIFICHE MARKETING/SALES
  // ========================================

  /**
   * Notifica nuovo lead
   */
  async notifyNewLead(userId: string, leadData: {
    leadId: string;
    leadName: string;
    leadEmail: string;
    leadSource: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'SUCCESS',
        priority: 'HIGH',
        title: '🎯 Nuovo Lead Ricevuto',
        message: `Nuovo lead: ${leadData.leadName} (${leadData.leadEmail}) da ${leadData.leadSource}.`,
        data: {
          leadId: leadData.leadId,
          leadName: leadData.leadName,
          leadEmail: leadData.leadEmail,
          leadSource: leadData.leadSource,
          action: 'new_lead'
        },
        actions: [
          {
            type: 'view_lead',
            label: 'Visualizza Lead',
            url: `/dashboard/leads/${leadData.leadId}`
          },
          {
            type: 'contact_lead',
            label: 'Contatta Lead',
            url: `/dashboard/leads/${leadData.leadId}?action=contact`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica nuovo lead inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica lead:', error);
    }
  }

  /**
   * Notifica conversione lead
   */
  async notifyLeadConverted(userId: string, conversionData: {
    leadId: string;
    leadName: string;
    projectId: string;
    projectName: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'SUCCESS',
        priority: 'HIGH',
        title: '🎉 Lead Convertito!',
        message: `Il lead ${conversionData.leadName} è stato convertito nel progetto "${conversionData.projectName}".`,
        data: {
          leadId: conversionData.leadId,
          leadName: conversionData.leadName,
          projectId: conversionData.projectId,
          projectName: conversionData.projectName,
          action: 'lead_converted'
        },
        actions: [
          {
            type: 'view_project',
            label: 'Visualizza Progetto',
            url: `/dashboard/projects/${conversionData.projectId}`
          },
          {
            type: 'view_lead',
            label: 'Visualizza Lead',
            url: `/dashboard/leads/${conversionData.leadId}`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica conversione lead inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica conversione:', error);
    }
  }

  // ========================================
  // NOTIFICHE ERRORI E WARNING
  // ========================================

  /**
   * Notifica errore sistema
   */
  async notifySystemError(userId: string, errorData: {
    errorId: string;
    errorType: string;
    errorMessage: string;
    component: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'ERROR',
        priority: 'HIGH',
        title: '⚠️ Errore Sistema',
        message: `Errore in ${errorData.component}: ${errorData.errorMessage}`,
        data: {
          errorId: errorData.errorId,
          errorType: errorData.errorType,
          errorMessage: errorData.errorMessage,
          component: errorData.component,
          action: 'system_error'
        },
        actions: [
          {
            type: 'view_error',
            label: 'Visualizza Dettagli',
            url: `/dashboard/system/errors/${errorData.errorId}`
          },
          {
            type: 'report_error',
            label: 'Segnala Bug',
            url: `/dashboard/support?errorId=${errorData.errorId}`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica errore sistema inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica errore:', error);
    }
  }

  /**
   * Notifica warning performance
   */
  async notifyPerformanceWarning(userId: string, warningData: {
    component: string;
    metric: string;
    value: number;
    threshold: number;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'WARNING',
        priority: 'MEDIUM',
        title: '⚡ Warning Performance',
        message: `${warningData.component}: ${warningData.metric} è ${warningData.value} (soglia: ${warningData.threshold}).`,
        data: {
          component: warningData.component,
          metric: warningData.metric,
          value: warningData.value,
          threshold: warningData.threshold,
          action: 'performance_warning'
        },
        actions: [
          {
            type: 'view_performance',
            label: 'Visualizza Performance',
            url: `/dashboard/system/performance`
          },
          {
            type: 'optimize',
            label: 'Ottimizza',
            url: `/dashboard/system/optimize?component=${warningData.component}`
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica warning performance inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica warning:', error);
    }
  }

  // ========================================
  // NOTIFICHE BENVENUTO E ONBOARDING
  // ========================================

  /**
   * Notifica benvenuto nuovo utente
   */
  async notifyWelcomeNewUser(userId: string, userData: {
    userName: string;
    userEmail: string;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'SUCCESS',
        priority: 'HIGH',
        title: '🎉 Benvenuto in Urbanova!',
        message: `Ciao ${userData.userName}! Benvenuto nella piattaforma Urbanova. Inizia creando il tuo primo progetto.`,
        data: {
          userName: userData.userName,
          userEmail: userData.userEmail,
          action: 'welcome'
        },
        actions: [
          {
            type: 'create_project',
            label: 'Crea Primo Progetto',
            url: '/dashboard/projects/new'
          },
          {
            type: 'take_tour',
            label: 'Fai il Tour',
            url: '/dashboard/onboarding/tour'
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica benvenuto inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica benvenuto:', error);
    }
  }

  /**
   * Notifica completamento onboarding
   */
  async notifyOnboardingCompleted(userId: string, completionData: {
    stepsCompleted: number;
    totalSteps: number;
  }): Promise<void> {
    try {
      await firebaseNotificationService.createNotificationWithPreferences({
        userId,
        type: 'SUCCESS',
        priority: 'MEDIUM',
        title: '🎯 Onboarding Completato!',
        message: `Hai completato ${completionData.stepsCompleted}/${completionData.totalSteps} passi dell'onboarding. Sei pronto per iniziare!`,
        data: {
          stepsCompleted: completionData.stepsCompleted,
          totalSteps: completionData.totalSteps,
          action: 'onboarding_completed'
        },
        actions: [
          {
            type: 'start_working',
            label: 'Inizia a Lavorare',
            url: '/dashboard'
          },
          {
            type: 'view_achievements',
            label: 'Visualizza Risultati',
            url: '/dashboard/achievements'
          }
        ]
      });
      console.log('✅ [NotificationTrigger] Notifica onboarding completato inviata');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore notifica onboarding:', error);
    }
  }

  // ========================================
  // UTILITY E HELPER
  // ========================================

  /**
   * Pulisce notifiche scadute
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      // Questa funzione dovrebbe essere chiamata periodicamente da un cron job
      // Per ora è un placeholder per future implementazioni
      console.log('🔄 [NotificationTrigger] Pulizia notifiche scadute (placeholder)');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore pulizia notifiche:', error);
    }
  }

  /**
   * Genera notifiche di test per debugging
   */
  async generateTestNotifications(userId: string): Promise<void> {
    try {
      // Notifica progetto creato
      await this.notifyProjectCreated(userId, {
        projectId: 'test-project-1',
        projectName: 'Progetto Test Milano',
        projectType: 'Residenziale'
      });

      // Notifica fattibilità completata
      await this.notifyFeasibilityCompleted(userId, {
        projectId: 'test-project-1',
        projectName: 'Progetto Test Milano',
        roi: 12.5,
        margin: 18.3
      });

      // Notifica Business Plan completato
      await this.notifyBusinessPlanCompleted(userId, {
        projectId: 'test-project-1',
        projectName: 'Progetto Test Milano',
        npv: 1250000,
        irr: 15.2,
        bestScenario: 'Cash'
      });

      // Notifica nuovo lead
      await this.notifyNewLead(userId, {
        leadId: 'test-lead-1',
        leadName: 'Mario Rossi',
        leadEmail: 'mario.rossi@email.com',
        leadSource: 'Sito Web'
      });

      // Notifica scadenza progetto
      await this.notifyProjectDeadline(userId, {
        projectId: 'test-project-1',
        projectName: 'Progetto Test Milano',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 giorni
        daysRemaining: 5
      });

      console.log('✅ [NotificationTrigger] Notifiche di test generate');
    } catch (error) {
      console.error('❌ [NotificationTrigger] Errore generazione notifiche test:', error);
    }
  }
}

// Export singleton instance
export const notificationTriggerService = NotificationTriggerService.getInstance();
