import {
  zDocKind,
  zDocumentStatus,
  zCDUExtractedFields,
  zVisuraExtractedFields,
  zDURCExtractedFields,
  zPlanimetriaExtractedFields,
  zProgettoExtractedFields,
  zExtractedFields,
  zDocumentMeta,
  zDocumentEntity,
  zDocRequest,
  zChecklistItem,
  zChecklist,
  type DocKind,
  type DocumentStatus,
} from '../docs';

describe('Document Types - Zod Schemas', () => {
  describe('zDocKind', () => {
    it('should validate valid document kinds', () => {
      const validKinds: DocKind[] = ['CDU', 'VISURA', 'DURC', 'PLANIMETRIA', 'PROGETTO'];

      validKinds.forEach(kind => {
        const result = zDocKind.safeParse(kind);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(kind);
        }
      });
    });

    it('should reject invalid document kinds', () => {
      const invalidKinds = ['INVALID', 'DOC', 'TEST'];

      invalidKinds.forEach(kind => {
        const result = zDocKind.safeParse(kind);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('zDocumentStatus', () => {
    it('should validate valid document statuses', () => {
      const validStatuses: DocumentStatus[] = [
        'REQUESTED',
        'UPLOADED',
        'EXTRACTED',
        'VALIDATED',
        'EXPIRED',
      ];

      validStatuses.forEach(status => {
        const result = zDocumentStatus.safeParse(status);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      });
    });

    it('should reject invalid document statuses', () => {
      const invalidStatuses = ['PENDING', 'DONE', 'FAILED'];

      invalidStatuses.forEach(status => {
        const result = zDocumentStatus.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('zCDUExtractedFields', () => {
    it('should validate valid CDU fields', () => {
      const validCDU = {
        particella: '123/45',
        destinazioneUso: 'RESIDENZIALE',
        vincoli: ['Vincolo paesaggistico', 'Vincolo archeologico'],
        superficie: 1500,
        indiceUrbanistico: 0.3,
        altezzaMax: 12,
        destinazioneSpecifica: 'Abitazione unifamiliare',
      };

      const result = zCDUExtractedFields.safeParse(validCDU);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CDU fields', () => {
      const invalidCDU = {
        particella: '', // Empty string
        destinazioneUso: 'INVALID',
        vincoli: 'Not an array', // Should be array
        superficie: '1500', // Should be number
        indiceUrbanistico: 0.3,
        altezzaMax: 12,
      };

      const result = zCDUExtractedFields.safeParse(invalidCDU);
      expect(result.success).toBe(false);
    });
  });

  describe('zVisuraExtractedFields', () => {
    it('should validate valid Visura fields', () => {
      const validVisura = {
        cciaa: 'MI-123456',
        oggettoSociale: 'Costruzioni edili',
        sedeLegale: 'Via Roma 123, Milano',
        partitaIva: '12345678901',
        codiceFiscale: 'RSSMRA80A01H501U',
        dataIscrizione: new Date('2020-01-01'),
        stato: 'ATTIVA' as const,
      };

      const result = zVisuraExtractedFields.safeParse(validVisura);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Visura fields', () => {
      const invalidVisura = {
        cciaa: 'MI-123456',
        oggettoSociale: '', // Empty string
        sedeLegale: 'Via Roma 123, Milano',
        partitaIva: '12345678901',
        codiceFiscale: 'INVALID_CF', // Invalid format
        dataIscrizione: '2020-01-01', // Should be Date
        stato: 'INVALID', // Invalid status
      };

      const result = zVisuraExtractedFields.safeParse(invalidVisura);
      expect(result.success).toBe(false);
    });
  });

  describe('zDURCExtractedFields', () => {
    it('should validate valid DURC fields', () => {
      const validDURC = {
        ditta: 'Costruzioni Rossi SRL',
        validita: new Date('2025-12-31'),
        numero: 'DURC-2024-001',
        rilasciatoDa: 'INAIL',
        dataRilascio: new Date('2024-01-01'),
        categoria: 'Costruzioni',
        classe: 'A',
      };

      const result = zDURCExtractedFields.safeParse(validDURC);
      expect(result.success).toBe(true);
    });

    it('should reject invalid DURC fields', () => {
      const invalidDURC = {
        ditta: '', // Empty string
        validita: '2025-12-31', // Should be Date
        numero: 'DURC-2024-001',
        rilasciatoDa: 'INAIL',
        dataRilascio: new Date('2024-01-01'),
        categoria: 'Costruzioni',
        classe: 'INVALID', // Invalid class
      };

      const result = zDURCExtractedFields.safeParse(invalidDURC);
      expect(result.success).toBe(false);
    });
  });

  describe('zPlanimetriaExtractedFields', () => {
    it('should validate valid Planimetria fields', () => {
      const validPlanimetria = {
        scala: '1:100',
        data: new Date('2024-01-01'),
        tecnico: 'Arch. Mario Rossi',
        superficie: 150,
        destinazione: 'Soggiorno',
        livelli: 1,
        vani: 3,
      };

      const result = zPlanimetriaExtractedFields.safeParse(validPlanimetria);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Planimetria fields', () => {
      const invalidPlanimetria = {
        scala: '1:100',
        data: '2024-01-01', // Should be Date
        tecnico: '', // Empty string
        superficie: '150', // Should be number
        destinazione: 'Soggiorno',
        livelli: 1,
        vani: 3,
      };

      const result = zPlanimetriaExtractedFields.safeParse(invalidPlanimetria);
      expect(result.success).toBe(false);
    });
  });

  describe('zProgettoExtractedFields', () => {
    it('should validate valid Progetto fields', () => {
      const validProgetto = {
        titolo: 'Progetto Ristrutturazione Casa',
        architetto: 'Arch. Mario Rossi',
        data: new Date('2024-01-01'),
        versione: '1.0',
        approvato: true,
        note: 'Progetto approvato dal comune',
      };

      const result = zProgettoExtractedFields.safeParse(validProgetto);
      expect(result.success).toBe(true);
    });

    it('should validate Progetto fields without optional note', () => {
      const validProgetto = {
        titolo: 'Progetto Ristrutturazione Casa',
        architetto: 'Arch. Mario Rossi',
        data: new Date('2024-01-01'),
        versione: '1.0',
        approvato: true,
      };

      const result = zProgettoExtractedFields.safeParse(validProgetto);
      expect(result.success).toBe(true);
    });
  });

  describe('zExtractedFields', () => {
    it('should validate CDU fields', () => {
      const cduFields = {
        particella: '123/45',
        destinazioneUso: 'RESIDENZIALE',
        vincoli: ['Vincolo paesaggistico'],
        superficie: 1500,
        indiceUrbanistico: 0.3,
        altezzaMax: 12,
      };

      const result = zExtractedFields.safeParse(cduFields);
      expect(result.success).toBe(true);
    });

    it('should validate Visura fields', () => {
      const visuraFields = {
        cciaa: 'MI-123456',
        oggettoSociale: 'Costruzioni edili',
        sedeLegale: 'Via Roma 123, Milano',
        partitaIva: '12345678901',
        codiceFiscale: 'RSSMRA80A01H501U',
        dataIscrizione: new Date('2020-01-01'),
        stato: 'ATTIVA' as const,
      };

      const result = zExtractedFields.safeParse(visuraFields);
      expect(result.success).toBe(true);
    });

    it('should reject invalid extracted fields', () => {
      const invalidFields = {
        invalidField: 'test',
        anotherField: 123,
      };

      const result = zExtractedFields.safeParse(invalidFields);
      expect(result.success).toBe(false);
    });
  });

  describe('zDocumentMeta', () => {
    it('should validate valid document metadata', () => {
      const validMeta = {
        kind: 'CDU' as const,
        projectId: 'proj-123',
        vendorId: 'vendor-456',
        required: true,
        expiresAt: new Date('2025-12-31'),
        requestedAt: new Date(),
        requestedBy: 'user-789',
      };

      const result = zDocumentMeta.safeParse(validMeta);
      expect(result.success).toBe(true);
    });

    it('should validate metadata without optional fields', () => {
      const validMeta = {
        kind: 'VISURA' as const,
        projectId: 'proj-123',
        required: false,
        requestedAt: new Date(),
        requestedBy: 'user-789',
      };

      const result = zDocumentMeta.safeParse(validMeta);
      expect(result.success).toBe(true);
    });
  });

  describe('zDocumentEntity', () => {
    it('should validate valid document entity', () => {
      const validEntity = {
        id: 'doc-123',
        meta: {
          kind: 'CDU' as const,
          projectId: 'proj-123',
          required: true,
          requestedAt: new Date(),
          requestedBy: 'user-789',
        },
        status: 'REQUESTED' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = zDocumentEntity.safeParse(validEntity);
      expect(result.success).toBe(true);
    });

    it('should validate document entity with all fields', () => {
      const validEntity = {
        id: 'doc-123',
        meta: {
          kind: 'CDU' as const,
          projectId: 'proj-123',
          vendorId: 'vendor-456',
          required: true,
          expiresAt: new Date('2025-12-31'),
          requestedAt: new Date(),
          requestedBy: 'user-789',
        },
        status: 'VALIDATED' as const,
        fileUrl: 'https://storage.googleapis.com/bucket/file.pdf',
        fileName: 'document.pdf',
        fileSize: 1024000,
        uploadedAt: new Date(),
        uploadedBy: 'user-789',
        extracted: {
          particella: '123/45',
          destinazioneUso: 'RESIDENZIALE',
          vincoli: ['Vincolo paesaggistico'],
          superficie: 1500,
          indiceUrbanistico: 0.3,
          altezzaMax: 12,
        },
        issues: [],
        validatedAt: new Date(),
        validatedBy: 'user-789',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = zDocumentEntity.safeParse(validEntity);
      expect(result.success).toBe(true);
    });
  });

  describe('zDocRequest', () => {
    it('should validate valid document request', () => {
      const validRequest = {
        projectId: 'proj-123',
        kind: 'CDU' as const,
        to: 'vendor' as const,
        messageTemplateId: 'template-123',
        uploadUrl: 'https://example.com/upload?token=abc123',
        expiresAt: new Date('2025-12-31'),
        requestedBy: 'user-789',
      };

      const result = zDocRequest.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('zChecklistItem', () => {
    it('should validate valid checklist item', () => {
      const validItem = {
        kind: 'CDU' as const,
        status: 'VALIDATED' as const,
        documentId: 'doc-123',
        lastUpdate: new Date(),
      };

      const result = zChecklistItem.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should validate checklist item with issues', () => {
      const validItem = {
        kind: 'VISURA' as const,
        status: 'EXTRACTED' as const,
        documentId: 'doc-456',
        missingFields: ['oggettoSociale'],
        issues: ['Campo oggettoSociale mancante'],
        lastUpdate: new Date(),
      };

      const result = zChecklistItem.safeParse(validItem);
      expect(result.success).toBe(true);
    });
  });

  describe('zChecklist', () => {
    it('should validate valid checklist', () => {
      const validChecklist = {
        projectId: 'proj-123',
        items: [
          {
            kind: 'CDU' as const,
            status: 'VALIDATED' as const,
            documentId: 'doc-123',
            lastUpdate: new Date(),
          },
          {
            kind: 'VISURA' as const,
            status: 'REQUESTED' as const,
            lastUpdate: new Date(),
          },
        ],
        overallStatus: 'INCOMPLETE' as const,
        completionPercentage: 50,
        lastUpdated: new Date(),
        updatedBy: 'user-789',
      };

      const result = zChecklist.safeParse(validChecklist);
      expect(result.success).toBe(true);
    });
  });
});
