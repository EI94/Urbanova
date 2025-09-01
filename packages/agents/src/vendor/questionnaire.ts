import {
  VendorQuestionnaire,
  VendorContact,
  VendorAnswers,
  zVendorQuestionnaire,
  zVendorContact,
  zVendorAnswers,
  VENDOR_QUESTIONNAIRE_EXPIRY_DAYS,
  VENDOR_QUESTIONNAIRE_REMINDER_DAYS,
} from '@urbanova/types';
// JWT Service - defined locally until available
class JWTService {
  generateToken(payload: any): string {
    return `jwt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  verifyToken(token: string): any {
    // Simple mock verification
    if (token.startsWith('jwt-')) {
      return { type: 'vendor_questionnaire', projectId: 'temp-project', vendorEmail: 'temp@email.com' };
    }
    throw new Error('Invalid token');
  }
}
// Data functions - defined locally until available in @urbanova/data
const persistVendorQuestionnaire = async (data: any) => 'temp-questionnaire-id';
const getVendorQuestionnaireById = async (id: string) => ({
  id,
  projectId: 'temp-project',
  vendorContact: { name: 'temp', email: 'temp@email.com', phone: '', role: '', company: '' },
  token: 'temp-token',
  status: 'pending' as const,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  metadata: { sentBy: 'temp', sentAt: new Date(), reminderCount: 0 }
});
const getVendorQuestionnaireByToken = async (token: string) => ({
  id: 'temp-id',
  projectId: 'temp-project',
  vendorContact: { name: 'temp', email: 'temp@email.com', phone: '', role: '', company: '' },
  token,
  status: 'pending' as const,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  metadata: { sentBy: 'temp', sentAt: new Date(), reminderCount: 0 }
});
const updateVendorQuestionnaire = async (id: string, updates: any) => ({
  id,
  projectId: 'temp-project',
  vendorContact: { name: 'temp', email: 'temp@email.com', phone: '', role: '', company: '' },
  token: 'temp-token',
  status: 'pending' as const,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  metadata: { sentBy: 'temp', sentAt: new Date(), reminderCount: 0 },
  ...updates
});
const listVendorQuestionnairesByProject = async (projectId: string) => [];
const listExpiredQuestionnaires = async () => [];

export class VendorQuestionnaireService {
  private jwtService: JWTService;

  constructor() {
    this.jwtService = new JWTService();
  }

  /**
   * Crea un nuovo questionario venditore e genera il link JWT
   */
  async createQuestionnaire(
    projectId: string,
    vendorContact: VendorContact,
    sentBy: string
  ): Promise<{ questionnaire: VendorQuestionnaire; link: string }> {
    // Validazione input
    const validatedContact = zVendorContact.parse(vendorContact);

    // Genera token JWT
    const token = this.jwtService.generateToken({
      type: 'vendor_questionnaire',
      projectId,
      vendorEmail: validatedContact.email,
      expiresIn: `${VENDOR_QUESTIONNAIRE_EXPIRY_DAYS}d`,
    });

    // Calcola date
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + VENDOR_QUESTIONNAIRE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );

    // Crea questionario
    const questionnaire: VendorQuestionnaire = {
      id: `vq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      vendorContact: {
        ...validatedContact,
        phone: validatedContact.phone ?? '',
        role: validatedContact.role ?? '',
        company: validatedContact.company ?? '',
      },
      token,
      status: 'pending' as const,
      createdAt: now,
      expiresAt,
      metadata: {
        sentBy,
        sentAt: now,
        reminderCount: 0,
      },
    };

    // Persistenza
    await persistVendorQuestionnaire(questionnaire);

    // Genera link
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/qna?token=${token}`;

    return { questionnaire, link };
  }

  /**
   * Recupera questionario per token
   */
  async getQuestionnaireByToken(token: string): Promise<VendorQuestionnaire | null> {
    try {
      // Verifica JWT
      const decoded = this.jwtService.verifyToken(token);
      if (decoded.type !== 'vendor_questionnaire') {
        return null;
      }

      // Recupera da database
      const questionnaire = await getVendorQuestionnaireByToken(token);
      if (!questionnaire) {
        return null;
      }

      // Verifica scadenza
      if (questionnaire.expiresAt < new Date()) {
        await this.markAsExpired(questionnaire.id);
        return null;
      }

      return questionnaire;
    } catch (error) {
      console.error('Error getting questionnaire by token:', error);
      return null;
    }
  }

  /**
   * Salva risposte del questionario
   */
  async saveAnswers(
    token: string,
    answers: VendorAnswers
  ): Promise<{ success: boolean; questionnaire?: VendorQuestionnaire }> {
    try {
      // Validazione risposte - ensure optional fields are properly handled
      const sanitizedAnswers: any = {
        ...answers,
        cdu: {
          ...answers.cdu,
          ...(answers.cdu.cduDate && { cduDate: answers.cdu.cduDate }),
          ...(answers.cdu.cduValidity && { cduValidity: answers.cdu.cduValidity }),
          ...(answers.cdu.cduNotes && { cduNotes: answers.cdu.cduNotes }),
        }
      };
      const validatedAnswers = zVendorAnswers.parse(sanitizedAnswers);

      // Recupera questionario
      const questionnaire = await this.getQuestionnaireByToken(token);
      if (!questionnaire) {
        return { success: false };
      }

      // Aggiorna questionario
      const updatedQuestionnaire: VendorQuestionnaire = {
        ...questionnaire,
        status: 'completed' as const,
        completedAt: new Date(),
        answers: validatedAnswers,
      };

      await updateVendorQuestionnaire(updatedQuestionnaire.id, updatedQuestionnaire);

      return { success: true, questionnaire: updatedQuestionnaire };
    } catch (error) {
      console.error('Error saving questionnaire answers:', error);
      return { success: false };
    }
  }

  /**
   * Lista questionari per progetto
   */
  async listQuestionnairesByProject(projectId: string): Promise<VendorQuestionnaire[]> {
    return await listVendorQuestionnairesByProject(projectId);
  }

  /**
   * Marca questionario come scaduto
   */
  async markAsExpired(questionnaireId: string): Promise<void> {
    const questionnaire = await getVendorQuestionnaireById(questionnaireId);
    if (questionnaire && questionnaire.status === 'pending') {
      await updateVendorQuestionnaire(questionnaire.id, {
        ...questionnaire,
        status: 'expired' as const,
      });
    }
  }

  /**
   * Invia reminder per questionari in scadenza
   */
  async sendReminders(): Promise<{ sent: number; errors: number }> {
    const now = new Date();
    let sent = 0;
    let errors = 0;

    // Trova questionari in scadenza
    const expiredQuestionnaires = await listExpiredQuestionnaires();

    for (const questionnaire of expiredQuestionnaires) {
      if (questionnaire.status !== 'pending') continue;

      const daysUntilExpiry = Math.ceil(
        (questionnaire.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Verifica se è il momento di inviare reminder
      if (VENDOR_QUESTIONNAIRE_REMINDER_DAYS.includes(daysUntilExpiry)) {
        try {
          await this.sendReminderEmail(questionnaire);
          sent++;
        } catch (error) {
          console.error('Error sending reminder:', error);
          errors++;
        }
      }
    }

    return { sent, errors };
  }

  /**
   * Invia email di reminder
   */
  private async sendReminderEmail(questionnaire: VendorQuestionnaire): Promise<void> {
    // TODO: Implementare invio email con template
    console.log(
      `Sending reminder to ${questionnaire.vendorContact.email} for project ${questionnaire.projectId}`
    );

    // Aggiorna contatore reminder
    await updateVendorQuestionnaire(questionnaire.id, {
      ...questionnaire,
      metadata: {
        ...questionnaire.metadata,
        reminderCount: (questionnaire.metadata?.reminderCount ?? 0) + 1,
        lastReminderAt: new Date(),
      },
    });
  }

  /**
   * Genera statistiche questionari
   */
  async getQuestionnaireStats(projectId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    expired: number;
    completionRate: number;
  }> {
    const questionnaires = await this.listQuestionnairesByProject(projectId);

    const total = questionnaires.length;
    const pending = questionnaires.filter(q => q.status === 'pending').length;
    const completed = questionnaires.filter(q => q.status === 'completed').length;
    const expired = questionnaires.filter(q => q.status === 'expired').length;

    return {
      total,
      pending,
      completed,
      expired,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
}
