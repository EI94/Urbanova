import { VendorQuestionnaireService } from '../../vendor/questionnaire';
import { VendorContact } from '@urbanova/types';

describe('VendorQuestionnaireService', () => {
  let service: VendorQuestionnaireService;

  beforeEach(() => {
    service = new VendorQuestionnaireService();
  });

  describe('createQuestionnaire', () => {
    it('should create a questionnaire with valid input', async () => {
      const vendorContact: VendorContact = {
        name: 'Mario Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 123 456 7890',
        company: 'Rossi Immobiliare',
        role: 'Proprietario',
      };

      const result = await service.createQuestionnaire('progetto-123', vendorContact, 'test-user');

      expect(result.questionnaire).toBeDefined();
      expect(result.questionnaire.projectId).toBe('progetto-123');
      expect(result.questionnaire.vendorContact).toEqual(vendorContact);
      expect(result.questionnaire.status).toBe('pending');
      expect(result.questionnaire.token).toBeDefined();
      expect(result.link).toContain('/vendor/qna?token=');
    });

    it('should validate vendor contact input', async () => {
      const invalidContact = {
        name: '',
        email: 'invalid-email',
      };

      await expect(
        service.createQuestionnaire('progetto-123', invalidContact as any, 'test-user')
      ).rejects.toThrow();
    });
  });

  describe('getQuestionnaireByToken', () => {
    it('should return null for invalid token', async () => {
      const result = await service.getQuestionnaireByToken('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('saveAnswers', () => {
    it('should save valid answers', async () => {
      // First create a questionnaire
      const vendorContact: VendorContact = {
        name: 'Test Vendor',
        email: 'test@example.com',
      };

      const { questionnaire } = await service.createQuestionnaire(
        'progetto-123',
        vendorContact,
        'test-user'
      );

      const answers = {
        cdu: {
          hasCDU: true,
          cduDate: '2024-01-15',
          cduValidity: '5 anni',
          cduNotes: 'CDU rilasciato per residenziale',
        },
        project: {
          hasSubmittedProject: true,
          projectSubmissionDate: '2024-02-01',
          projectApprovalStatus: 'pending' as const,
          projectNotes: 'Progetto in fase di approvazione',
        },
        sale: {
          saleType: 'asset' as const,
          saleMotivation: 'Liquidazione',
          saleUrgency: 'medium' as const,
        },
        constraints: {
          urbanConstraints: ['vincoli_paesaggistici'],
          easements: ['passaggio_servitu'],
          accessLimitations: ['strada_privata'],
          constraintNotes: 'Vincoli standard',
        },
        documents: {
          availableDocuments: ['planimetrie', 'relazioni_tecniche'],
          documentNotes: 'Documentazione completa',
        },
        additional: {
          notes: 'Note aggiuntive',
          contactPreference: 'email' as const,
          bestTimeToContact: 'Mattina',
        },
      };

      const result = await service.saveAnswers(questionnaire.token, answers);

      expect(result.success).toBe(true);
      expect(result.questionnaire).toBeDefined();
      expect(result.questionnaire?.status).toBe('completed');
      expect(result.questionnaire?.answers).toEqual(answers);
    });
  });

  describe('getQuestionnaireStats', () => {
    it('should return correct statistics', async () => {
      const stats = await service.getQuestionnaireStats('progetto-123');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('expired');
      expect(stats).toHaveProperty('completionRate');

      expect(typeof stats.total).toBe('number');
      expect(typeof stats.completionRate).toBe('number');
      expect(stats.completionRate).toBeGreaterThanOrEqual(0);
      expect(stats.completionRate).toBeLessThanOrEqual(100);
    });
  });
});
