import {
  zChatCommand,
  zDealInputByLink,
  zDealInputBySearch,
  zDealProcessingResult,
  zEnhancedChatResponse,
} from '../chat';

describe('Chat Types Validation', () => {
  describe('zDealInputByLink', () => {
    it('should validate valid link input', () => {
      const validInput = {
        type: 'LINK' as const,
        link: 'https://example.com/terreno',
        sensitivity: {
          optimistic: 5,
          pessimistic: 10,
        },
      };

      const result = zDealInputByLink.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate link input with default sensitivity', () => {
      const validInput = {
        type: 'LINK' as const,
        link: 'https://example.com/terreno',
      };

      const result = zDealInputByLink.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sensitivity.optimistic).toBe(5);
        expect(result.data.sensitivity.pessimistic).toBe(10);
      }
    });

    it('should reject invalid URL', () => {
      const invalidInput = {
        type: 'LINK' as const,
        link: 'not-a-url',
      };

      const result = zDealInputByLink.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject sensitivity out of range', () => {
      const invalidInput = {
        type: 'LINK' as const,
        link: 'https://example.com/terreno',
        sensitivity: {
          optimistic: 60, // > 50
          pessimistic: 10,
        },
      };

      const result = zDealInputByLink.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('zDealInputBySearch', () => {
    it('should validate valid search input', () => {
      const validInput = {
        type: 'SEARCH' as const,
        city: 'Milano',
        budgetMax: '1.2M',
        sensitivity: {
          optimistic: 5,
          pessimistic: 10,
        },
      };

      const result = zDealInputBySearch.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate search input with default sensitivity', () => {
      const validInput = {
        type: 'SEARCH' as const,
        city: 'Roma',
        budgetMax: '500K',
      };

      const result = zDealInputBySearch.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sensitivity.optimistic).toBe(5);
        expect(result.data.sensitivity.pessimistic).toBe(10);
      }
    });

    it('should reject empty city', () => {
      const invalidInput = {
        type: 'SEARCH' as const,
        city: '',
        budgetMax: '1M',
      };

      const result = zDealInputBySearch.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject invalid budget format', () => {
      const invalidInput = {
        type: 'SEARCH' as const,
        city: 'Milano',
        budgetMax: 'invalid',
      };

      const result = zDealInputBySearch.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept valid budget formats', () => {
      const validFormats = ['1M', '500K', '1.5M', '750K', '2.3M'];

      validFormats.forEach(budget => {
        const input = {
          type: 'SEARCH' as const,
          city: 'Milano',
          budgetMax: budget,
        };

        const result = zDealInputBySearch.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('zDealProcessingResult', () => {
    it('should validate valid processing result', () => {
      const validResult = {
        projectId: 'project-123',
        dealId: 'deal-456',
        feasibilityId: 'feasibility-789',
        title: 'Terreno Milano Centro',
        roi: 15.5,
        paybackYears: 4.2,
        pdfUrl: 'https://storage.googleapis.com/bucket/deal-memo.pdf',
        projectDeepLink: '/dashboard/projects/project-123',
      };

      const result = zDealProcessingResult.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidResult = {
        projectId: 'project-123',
        dealId: 'deal-456',
        feasibilityId: 'feasibility-789',
        title: 'Terreno Milano Centro',
        roi: 15.5,
        paybackYears: 4.2,
        pdfUrl: 'not-a-url',
        projectDeepLink: '/dashboard/projects/project-123',
      };

      const result = zDealProcessingResult.safeParse(invalidResult);
      expect(result.success).toBe(false);
    });
  });

  describe('zEnhancedChatResponse', () => {
    it('should validate valid chat response', () => {
      const validResponse = {
        id: 'response-123',
        commandId: 'command-456',
        message: 'Deal Memo pronto!',
        type: 'TEXT' as const,
        actions: [
          {
            type: 'VIEW_PDF',
            label: 'Visualizza PDF',
            url: 'https://example.com/pdf',
          },
        ],
        metadata: {
          processingTime: 150,
          confidence: 0.9,
          nextSteps: ['Rivedi il memo'],
          dealResult: {
            projectId: 'project-123',
            dealId: 'deal-456',
            feasibilityId: 'feasibility-789',
            title: 'Terreno Milano',
            roi: 15.5,
            paybackYears: 4.2,
            pdfUrl: 'https://example.com/pdf',
            projectDeepLink: '/dashboard/projects/project-123',
          },
        },
      };

      const result = zEnhancedChatResponse.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate response without optional fields', () => {
      const minimalResponse = {
        id: 'response-123',
        commandId: 'command-456',
        message: 'Comando eseguito',
        type: 'TEXT' as const,
        metadata: {
          processingTime: 100,
          confidence: 0.8,
          nextSteps: [],
        },
      };

      const result = zEnhancedChatResponse.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });
  });
});
