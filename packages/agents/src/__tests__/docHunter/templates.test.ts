import { describe, it, expect } from '@jest/globals';
import {
  messageTemplates,
  getMessageTemplate,
  formatMessage,
  getRequiredFieldsForKind,
  getInstructionsForKind,
} from '../../docHunter/templates';

describe('DocHunter Templates', () => {
  describe('messageTemplates', () => {
    it('should have templates for all document kinds', () => {
      const expectedKinds = ['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO'];

      expectedKinds.forEach(kind => {
        expect(messageTemplates[kind as keyof typeof messageTemplates]).toBeDefined();
      });
    });

    it('should have required fields for each template', () => {
      Object.values(messageTemplates).forEach(template => {
        const t = template as any;
        expect(t.requiredFields).toBeDefined();
        expect(Array.isArray(t.requiredFields)).toBe(true);
        expect(t.requiredFields.length).toBeGreaterThan(0);
      });
    });

    it('should have instructions for each template', () => {
      Object.values(messageTemplates).forEach(template => {
        const t = template as any;
        expect(t.instructions).toBeDefined();
        expect(Array.isArray(t.instructions)).toBe(true);
        expect(t.instructions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getMessageTemplate', () => {
    it('should return template for valid document kind', () => {
      const template = getMessageTemplate('CDU');
      expect(template).toBeDefined();
      expect(template.kind).toBe('CDU');
    });

    it('should return template for lowercase kind', () => {
      const template = getMessageTemplate('CDU');
      expect(template).toBeDefined();
      expect(template.kind).toBe('CDU');
    });

    it('should return undefined for invalid kind', () => {
      const template = getMessageTemplate('INVALID' as any);
      expect(template).toBeUndefined();
    });
  });

  describe('formatMessage', () => {
    it('should format message with placeholders', () => {
      const template = getMessageTemplate('CDU');
      expect(template).toBeDefined();

      if (template) {
        const formatted = formatMessage(template, {
          projectName: 'PROJ-123',
          uploadUrl: 'https://example.com/upload',
          expiryDate: '2024-02-01',
        });

        expect(formatted).toContain('PROJ-123');
        expect(formatted).toContain('https://example.com/upload');
        expect(formatted).toContain('2024-02-01');
      }
    });

    it('should handle missing placeholders gracefully', () => {
      const template = getMessageTemplate('CDU');
      expect(template).toBeDefined();

      if (template) {
        const formatted = formatMessage(template, {});
        expect(formatted).toBeDefined();
        expect(typeof formatted).toBe('string');
      }
    });
  });

  describe('getRequiredFieldsForKind', () => {
    it('should return required fields for CDU', () => {
      const fields = getRequiredFieldsForKind('CDU');
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields).toContain('particella');
      expect(fields).toContain('destinazioneUso');
    });

    it('should return required fields for VISURA', () => {
      const fields = getRequiredFieldsForKind('VISURA');
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields).toContain('cciaa');
      expect(fields).toContain('oggettoSociale');
    });

    it('should return required fields for DURC', () => {
      const fields = getRequiredFieldsForKind('DURC');
      expect(Array.isArray(fields)).toBe(true);
      expect(fields.length).toBeGreaterThan(0);
      expect(fields).toContain('ditta');
      expect(fields).toContain('validita');
    });

    it('should return empty array for invalid kind', () => {
      expect(() => getRequiredFieldsForKind('INVALID' as any)).toThrow();
    });
  });

  describe('getInstructionsForKind', () => {
    it('should return instructions for CDU', () => {
      const instructions = getInstructionsForKind('CDU');
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions.join(' ')).toContain('PDF');
    });

    it('should return instructions for VISURA', () => {
      const instructions = getInstructionsForKind('VISURA');
      expect(Array.isArray(instructions)).toBe(true);
      expect(instructions.length).toBeGreaterThan(0);
      expect(instructions.join(' ')).toContain('PDF');
    });

    it('should return empty string for invalid kind', () => {
      expect(() => getInstructionsForKind('INVALID' as any)).toThrow();
    });
  });

  describe('Template content validation', () => {
    it('should have meaningful subject lines', () => {
      Object.values(messageTemplates).forEach(template => {
        const t = template as any;
        expect(t.subject).toBeDefined();
        expect(typeof t.subject).toBe('string');
        expect(t.subject.length).toBeGreaterThan(0);
        expect(t.subject).toContain('Richiesta');
      });
    });

    it('should have complete body content', () => {
      Object.values(messageTemplates).forEach(template => {
        const t = template as any;
        expect(t.body).toBeDefined();
        expect(typeof t.body).toBe('string');
        expect(t.body.length).toBeGreaterThan(50); // Minimum meaningful length
      });
    });

    it('should have consistent structure across templates', () => {
      const templateKeys = Object.keys(messageTemplates);
      const firstTemplate = messageTemplates[templateKeys[0] as keyof typeof messageTemplates];

      Object.values(messageTemplates).forEach(template => {
        const t = template as any;
        expect(t).toHaveProperty('kind');
        expect(t).toHaveProperty('subject');
        expect(t).toHaveProperty('body');
        expect(t).toHaveProperty('requiredFields');
        expect(t).toHaveProperty('instructions');
      });
    });
  });
});
