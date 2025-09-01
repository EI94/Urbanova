// OCR Service for Doc Hunter v1 - Google Document AI with Tesseract fallback

import type {
  DocKind,
  ExtractedFields,
  CDUExtractedFields,
  VisuraExtractedFields,
  DURCExtractedFields,
  PlanimetriaExtractedFields,
  ProgettoExtractedFields,
} from '@urbanova/types';

export interface OCRExtractionResult {
  fields: ExtractedFields;
  issues: string[];
  confidence: number;
  processor: 'google-doc-ai' | 'tesseract';
}

export interface OCRExtractionOptions {
  forceFallback?: boolean;
  language?: string;
  confidenceThreshold?: number;
}

export class OCRService {
  private googleDocAIProcessorIds: Record<DocKind, string>;
  private confidenceThreshold: number;

  constructor() {
    this.googleDocAIProcessorIds = {
      CDU: process.env.DOC_AI_PROCESSOR_ID_CDU || '',
      VISURA: process.env.DOC_AI_PROCESSOR_ID_VISURA || '',
      DURC: process.env.DOC_AI_PROCESSOR_ID_DURC || '',
      PLANIMETRIA: process.env.DOC_AI_PROCESSOR_ID_PLANIMETRIA || '',
      PROGETTO: process.env.DOC_AI_PROCESSOR_ID_PROGETTO || '',
    };
    this.confidenceThreshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD || '0.7');
  }

  async extractFields(
    fileUrl: string,
    kind: DocKind,
    options: OCRExtractionOptions = {}
  ): Promise<OCRExtractionResult> {
    try {
      // Try Google Document AI first (unless fallback is forced)
      if (!options.forceFallback && this.googleDocAIProcessorIds[kind]) {
        return await this.extractWithGoogleDocAI(fileUrl, kind);
      }
    } catch (error) {
      console.warn('Google Document AI failed, falling back to Tesseract:', error);
    }

    // Fallback to Tesseract
    return await this.extractWithTesseract(fileUrl, kind, options);
  }

  private async extractWithGoogleDocAI(
    fileUrl: string,
    kind: DocKind
  ): Promise<OCRExtractionResult> {
    // This would integrate with Google Document AI API
    // For now, return a mock implementation
    console.log(`Extracting with Google Document AI for ${kind} from ${fileUrl}`);

    // Mock extraction based on document kind
    const mockResult = this.getMockExtractionResult(kind);

    return {
      fields: mockResult.fields,
      issues: mockResult.issues,
      confidence: 0.95,
      processor: 'google-doc-ai',
    };
  }

  private async extractWithTesseract(
    fileUrl: string,
    kind: DocKind,
    options: OCRExtractionOptions
  ): Promise<OCRExtractionResult> {
    // This would integrate with Tesseract OCR
    // For now, return a mock implementation
    console.log(`Extracting with Tesseract for ${kind} from ${fileUrl}`);

    const mockResult = this.getMockExtractionResult(kind);

    return {
      fields: mockResult.fields,
      issues: mockResult.issues,
      confidence: 0.75, // Lower confidence for Tesseract
      processor: 'tesseract',
    };
  }

  private getMockExtractionResult(kind: DocKind): { fields: ExtractedFields; issues: string[] } {
    switch (kind) {
      case 'CDU':
        return {
          fields: {
            particella: '123/45',
            destinazioneUso: 'RESIDENZIALE',
            vincoli: ['Vincolo paesaggistico', 'Vincolo archeologico'],
            superficie: 1500,
            indiceUrbanistico: 0.3,
            altezzaMax: 12,
            destinazioneSpecifica: 'Abitazione unifamiliare',
          } as CDUExtractedFields,
          issues: [],
        };

      case 'VISURA':
        return {
          fields: {
            cciaa: 'MI-123456',
            oggettoSociale: 'Costruzioni edili',
            sedeLegale: 'Via Roma 123, Milano',
            partitaIva: '12345678901',
            codiceFiscale: 'RSSMRA80A01H501U',
            dataIscrizione: new Date('2020-01-01'),
            stato: 'ATTIVA',
          } as VisuraExtractedFields,
          issues: [],
        };

      case 'DURC':
        return {
          fields: {
            ditta: 'Costruzioni Rossi SRL',
            validita: new Date('2025-12-31'),
            numero: 'DURC-2024-001',
            rilasciatoDa: 'INAIL',
            dataRilascio: new Date('2024-01-01'),
            categoria: 'Costruzioni',
            classe: 'A',
          } as DURCExtractedFields,
          issues: [],
        };

      case 'PLANIMETRIA':
        return {
          fields: {
            scala: '1:100',
            data: new Date('2024-01-01'),
            tecnico: 'Arch. Mario Rossi',
            superficie: 150,
            destinazione: 'Soggiorno',
            livelli: 1,
            vani: 3,
          } as PlanimetriaExtractedFields,
          issues: [],
        };

      case 'PROGETTO':
        return {
          fields: {
            titolo: 'Progetto Ristrutturazione Casa',
            architetto: 'Arch. Mario Rossi',
            data: new Date('2024-01-01'),
            versione: '1.0',
            approvato: true,
            note: 'Progetto approvato dal comune',
          } as ProgettoExtractedFields,
          issues: [],
        };

      default:
        throw new Error(`Unsupported document kind: ${kind}`);
    }
  }

  // Validate extracted fields against required fields for the document kind
  validateExtractedFields(
    extracted: ExtractedFields,
    kind: DocKind,
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[]; issues: string[] } {
    const missingFields: string[] = [];
    const issues: string[] = [];

    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!this.hasField(extracted, field)) {
        missingFields.push(field);
      }
    });

    // Document-specific validation
    switch (kind) {
      case 'CDU':
        if (
          this.hasField(extracted, 'superficie') &&
          (extracted as CDUExtractedFields).superficie <= 0
        ) {
          issues.push('Superficie deve essere maggiore di zero');
        }
        break;

      case 'VISURA':
        if (
          this.hasField(extracted, 'stato') &&
          (extracted as VisuraExtractedFields).stato !== 'ATTIVA'
        ) {
          issues.push('Azienda non attiva');
        }
        break;

      case 'DURC':
        if (
          this.hasField(extracted, 'validita') &&
          (extracted as DURCExtractedFields).validita < new Date()
        ) {
          issues.push('DURC scaduto');
        }
        break;

      case 'PLANIMETRIA':
        if (
          this.hasField(extracted, 'scala') &&
          !(extracted as PlanimetriaExtractedFields).scala.includes(':')
        ) {
          issues.push('Formato scala non valido');
        }
        break;

      case 'PROGETTO':
        if (
          this.hasField(extracted, 'approvato') &&
          !(extracted as ProgettoExtractedFields).approvato
        ) {
          issues.push('Progetto non ancora approvato');
        }
        break;
    }

    return {
      isValid: missingFields.length === 0 && issues.length === 0,
      missingFields,
      issues,
    };
  }

  private hasField(extracted: ExtractedFields, field: string): boolean {
    return field in extracted && extracted[field as keyof ExtractedFields] !== undefined;
  }

  // Get confidence score for extracted fields
  calculateConfidence(extracted: ExtractedFields, requiredFields: string[]): number {
    const totalFields = requiredFields.length;
    const presentFields = requiredFields.filter(field => this.hasField(extracted, field)).length;

    return presentFields / totalFields;
  }
}

export const ocrService = new OCRService();
