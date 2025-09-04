import { z } from 'zod';
import { VendorQuestionnaireService } from '@urbanova/agents/src/vendor/questionnaire';
import { ProjectFactsIngestionService } from '@urbanova/agents/src/vendor/ingestion';
import { VendorContact } from '@urbanova/types';

// ============================================================================
// DEAL CALLER MANIFEST
// ============================================================================

export const dealCallerManifest = {
  name: 'dealCaller',
  version: '1.0.0',
  description: 'Gestione questionari venditori e ingestione Project Facts',
  intents: [
    'invia questionario venditore',
    'questionario venditore',
    'ingestione risposte',
    'project facts',
    'vendor questionnaire',
  ],
  tags: ['vendor', 'questionnaire', 'project-facts', 'ingestion'],
};

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const sendQuestionnaireSchema = z.object({
  projectId: z.string().min(1, 'Project ID richiesto'),
  vendorContact: z.object({
    name: z.string().min(1, 'Nome venditore richiesto'),
    email: z.string().email('Email venditore non valida'),
    phone: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
  }),
  sentBy: z.string().optional().default('system'),
});

const ingestAnswersSchema = z.object({
  projectId: z.string().min(1, 'Project ID richiesto'),
  updatedBy: z.string().optional().default('system'),
});

// ============================================================================
// DEAL CALLER ACTIONS
// ============================================================================

export const dealCallerActions = {
  /**
   * Invia questionario venditore e genera link JWT
   */
  send_questionnaire: async (args: z.infer<typeof sendQuestionnaireSchema>) => {
    try {
      const validated = sendQuestionnaireSchema.parse(args);

      const questionnaireService = new VendorQuestionnaireService();

      const result = await questionnaireService.createQuestionnaire(
        validated.projectId,
        validated.vendorContact as any,
        validated.sentBy
      );

      return {
        success: true,
        questionnaire: {
          id: result.questionnaire.id,
          projectId: result.questionnaire.projectId,
          vendorContact: result.questionnaire.vendorContact,
          status: result.questionnaire.status,
          expiresAt: result.questionnaire.expiresAt,
          link: result.link,
        },
        message: `Questionario inviato a ${validated.vendorContact.name} (${validated.vendorContact.email})`,
        link: result.link,
      };
    } catch (error) {
      console.error('Error sending questionnaire:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        message: "Errore nell'invio del questionario",
      };
    }
  },

  /**
   * Ingerisce le risposte del questionario nei Project Facts
   */
  ingest_answers: async (args: z.infer<typeof ingestAnswersSchema>) => {
    try {
      const validated = ingestAnswersSchema.parse(args);

      const questionnaireService = new VendorQuestionnaireService();
      const ingestionService = new ProjectFactsIngestionService();

      // Recupera questionari completati per il progetto
      const questionnaires = await questionnaireService.listQuestionnairesByProject(
        validated.projectId
      );
      const completedQuestionnaires = questionnaires.filter(
        q => q.status === 'completed' && q.answers
      );

      if (completedQuestionnaires.length === 0) {
        return {
          success: false,
          message: 'Nessun questionario completato trovato per questo progetto',
          ingested: 0,
          changes: [],
        };
      }

      let totalChanges = 0;
      const allChanges: any[] = [];

      // Ingerisce ogni questionario completato
      for (const questionnaire of completedQuestionnaires) {
        if (questionnaire.answers) {
          const result = await ingestionService.ingestQuestionnaireAnswers(
            questionnaire,
            validated.updatedBy
          );

          if (result.success) {
            totalChanges += result.changes.length;
            allChanges.push(...result.changes);
          }
        }
      }

      // Calcola completamento Requirements
      const requirementsCompletion = await ingestionService.calculateRequirementsCompletion(
        validated.projectId
      );

      return {
        success: true,
        message: `Ingestione completata: ${totalChanges} modifiche applicate`,
        ingested: completedQuestionnaires.length,
        changes: totalChanges,
        requirementsCompletion: {
          totalFields: requirementsCompletion.totalFields,
          completedFields: requirementsCompletion.completedFields,
          completionRate: Math.round(requirementsCompletion.completionRate * 100) / 100,
          missingFields: requirementsCompletion.missingFields,
        },
      };
    } catch (error) {
      console.error('Error ingesting answers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        message: "Errore nell'ingestione delle risposte",
      };
    }
  },

  /**
   * Genera statistiche questionari per progetto
   */
  get_questionnaire_stats: async (args: { projectId: string }) => {
    try {
      const questionnaireService = new VendorQuestionnaireService();

      const stats = await questionnaireService.getQuestionnaireStats(args.projectId);

      return {
        success: true,
        stats: {
          total: stats.total,
          pending: stats.pending,
          completed: stats.completed,
          expired: stats.expired,
          completionRate: Math.round(stats.completionRate * 100) / 100,
        },
        message: `Statistiche questionari per progetto ${args.projectId}`,
      };
    } catch (error) {
      console.error('Error getting questionnaire stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        message: 'Errore nel recupero delle statistiche',
      };
    }
  },

  /**
   * Invia reminder per questionari in scadenza
   */
  send_reminders: async () => {
    try {
      const questionnaireService = new VendorQuestionnaireService();

      const result = await questionnaireService.sendReminders();

      return {
        success: true,
        sent: result.sent,
        errors: result.errors,
        message: `Reminder inviati: ${result.sent} successi, ${result.errors} errori`,
      };
    } catch (error) {
      console.error('Error sending reminders:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
        message: "Errore nell'invio dei reminder",
      };
    }
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Genera messaggio di risposta per il chat
 */
export function generateQuestionnaireResponse(
  action: string,
  result: any,
  projectId: string
): string {
  switch (action) {
    case 'send_questionnaire':
      if (result.success) {
        return `✅ Questionario inviato con successo!\n\n📧 **Destinatario:** ${result.questionnaire.vendorContact.name} (${result.questionnaire.vendorContact.email})\n🔗 **Link:** ${result.link}\n⏰ **Scadenza:** ${new Date(result.questionnaire.expiresAt).toLocaleDateString('it-IT')}\n\nIl venditore riceverà un link sicuro per compilare il questionario.`;
      } else {
        return `❌ Errore nell'invio del questionario: ${result.error}`;
      }

    case 'ingest_answers':
      if (result.success) {
        return `✅ Ingestione completata!\n\n📊 **Risultati:**\n• Questionari processati: ${result.ingested}\n• Modifiche applicate: ${result.changes}\n• Completamento Requirements: ${result.requirementsCompletion.completionRate}%\n\n📋 **Campi completati:** ${result.requirementsCompletion.completedFields}/${result.requirementsCompletion.totalFields}`;
      } else {
        return `❌ Errore nell'ingestione: ${result.error}`;
      }

    case 'get_questionnaire_stats':
      if (result.success) {
        return `📊 **Statistiche Questionari - Progetto ${projectId}**\n\n• Totale inviati: ${result.stats.total}\n• In attesa: ${result.stats.pending}\n• Completati: ${result.stats.completed}\n• Scaduti: ${result.stats.expired}\n• Tasso completamento: ${result.stats.completionRate}%`;
      } else {
        return `❌ Errore nel recupero statistiche: ${result.error}`;
      }

    default:
      return 'Azione non riconosciuta';
  }
}
