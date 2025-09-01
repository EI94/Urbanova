// Document Validation Service for Doc Hunter v1

import type { DocKind, ExtractedFields } from './ocr';

// Document types - defined locally until available in @urbanova/types
export interface DocumentEntity {
  id: string;
  extracted?: ExtractedFields;
  status: string;
  meta: {
    kind: DocKind;
    [key: string]: any;
  };
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  kind?: DocKind;
  status?: string;
  documentId?: string;
  missingFields?: string[];
  issues?: string[];
  lastUpdate?: Date;
}
import { ocrService } from './ocr';
import { getRequiredFieldsForKind } from './templates';

export interface ValidationResult {
  isValid: boolean;
  status: 'VALIDATED' | 'EXTRACTED';
  issues: string[];
  missingFields: string[];
  confidence: number;
  recommendations: string[];
}

export interface ValidationContext {
  projectId: string;
  projectRequirements?: Record<string, any>;
  vendorInfo?: Record<string, any>;
}

export class DocumentValidationService {
  async validateDocument(
    document: DocumentEntity,
    context: ValidationContext
  ): Promise<ValidationResult> {
    const { extracted, status } = document;
    const kind = document.meta.kind;

    // If document is not extracted yet, can't validate
    if (status !== 'EXTRACTED' || !extracted) {
      return {
        isValid: false,
        status: 'EXTRACTED',
        issues: ['Documento non ancora processato da OCR'],
        missingFields: [],
        confidence: 0,
        recommendations: ['Completare estrazione OCR prima della validazione'],
      };
    }

    // Get required fields for this document kind
    const requiredFields = getRequiredFieldsForKind(kind);

    // Validate extracted fields
    const validation = ocrService.validateExtractedFields(extracted, kind, requiredFields);

    // Calculate confidence
    const confidence = ocrService.calculateConfidence(extracted, requiredFields);

    // Project-specific validation
    const projectValidation = await this.validateAgainstProjectRequirements(document, context);

    // Combine all validation results
    const allIssues = [...validation.issues, ...projectValidation.issues];

    const allMissingFields = [...validation.missingFields, ...projectValidation.missingFields];

    const isValid = validation.isValid && projectValidation.isValid;
    const finalStatus = isValid ? 'VALIDATED' : 'EXTRACTED';

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      kind,
      allIssues,
      allMissingFields,
      confidence
    );

    return {
      isValid,
      status: finalStatus,
      issues: allIssues,
      missingFields: allMissingFields,
      confidence,
      recommendations,
    };
  }

  private async validateAgainstProjectRequirements(
    document: DocumentEntity,
    context: ValidationContext
  ): Promise<{ isValid: boolean; issues: string[]; missingFields: string[] }> {
    const issues: string[] = [];
    const missingFields: string[] = [];

    // Project-specific validation logic
    if (context.projectRequirements) {
      const { projectRequirements } = context;

      // Example: Check if DURC covers the project's construction category
      if (document.meta.kind === 'DURC' && projectRequirements.constructionCategory) {
        // This would check if the DURC covers the required construction category
        // For now, mock validation
        if (
          projectRequirements.constructionCategory === 'RESIDENTIAL' &&
          document.extracted &&
          'categoria' in document.extracted
        ) {
          const durc = document.extracted as any;
          if (durc.categoria !== 'Costruzioni' && durc.categoria !== 'Edilizia') {
            issues.push('DURC non copre la categoria di lavori richiesta per il progetto');
          }
        }
      }

      // Example: Check if CDU matches project location
      if (document.meta.kind === 'CDU' && projectRequirements.location) {
        // This would validate CDU against project location
        // For now, mock validation
        if (
          projectRequirements.location.city === 'Milano' &&
          document.extracted &&
          'particella' in document.extracted
        ) {
          // Mock validation - in real implementation would check against cadastral data
          console.log('Validating CDU against project location');
        }
      }
    }

    // Vendor-specific validation
    if (context.vendorInfo && document.meta.vendorId) {
      // This would validate document against vendor information
      // For now, mock validation
      console.log('Validating document against vendor info');
    }

    return {
      isValid: issues.length === 0 && missingFields.length === 0,
      issues,
      missingFields,
    };
  }

  private generateRecommendations(
    kind: DocKind,
    issues: string[],
    missingFields: string[],
    confidence: number
  ): string[] {
    const recommendations: string[] = [];

    // Confidence-based recommendations
    if (confidence < 0.5) {
      recommendations.push('Confidenza OCR molto bassa - verificare manualmente il documento');
    } else if (confidence < 0.8) {
      recommendations.push('Confidenza OCR moderata - revisione manuale consigliata');
    }

    // Issue-specific recommendations
    issues.forEach(issue => {
      switch (issue) {
        case 'DURC scaduto':
          recommendations.push('Richiedere DURC aggiornato al fornitore');
          break;
        case 'Azienda non attiva':
          recommendations.push('Verificare stato azienda con Camera di Commercio');
          break;
        case 'Superficie deve essere maggiore di zero':
          recommendations.push('Verificare dati catastali della particella');
          break;
        default:
          recommendations.push(`Risolvere: ${issue}`);
      }
    });

    // Missing fields recommendations
    if (missingFields.length > 0) {
      recommendations.push(`Campi mancanti: ${missingFields.join(', ')} - completare documento`);
    }

    // Document kind specific recommendations
    switch (kind) {
      case 'CDU':
        if (missingFields.includes('vincoli')) {
          recommendations.push('Verificare presenza vincoli paesaggistici o archeologici');
        }
        break;
      case 'VISURA':
        if (missingFields.includes('oggettoSociale')) {
          recommendations.push('Verificare pertinenza oggetto sociale con lavori richiesti');
        }
        break;
      case 'DURC':
        if (missingFields.includes('validita')) {
          recommendations.push('Verificare data di scadenza DURC');
        }
        break;
      case 'PLANIMETRIA':
        if (missingFields.includes('scala')) {
          recommendations.push('Verificare scala del disegno per il progetto');
        }
        break;
      case 'PROGETTO':
        if (missingFields.includes('approvato')) {
          recommendations.push('Verificare stato approvazione progetto');
        }
        break;
    }

    return recommendations;
  }

  // Validate multiple documents for a project
  async validateProjectDocuments(
    documents: DocumentEntity[],
    context: ValidationContext
  ): Promise<{
    overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
    completionPercentage: number;
    items: ChecklistItem[];
    summary: string;
  }> {
    const items: ChecklistItem[] = [];
    let validatedCount = 0;
    let totalCount = documents.length;

    for (const document of documents) {
      const validation = await this.validateDocument(document, context);

      items.push({
        id: document.id,
        description: `Documento ${document.meta.kind}`,
        completed: validation.status === 'VALIDATED',
        required: true,
        kind: document.meta.kind,
        status: validation.status,
        documentId: document.id,
        missingFields: validation.missingFields,
        issues: validation.issues,
        lastUpdate: new Date(),
      });

      if (validation.status === 'VALIDATED') {
        validatedCount++;
      }
    }

    const completionPercentage = totalCount > 0 ? (validatedCount / totalCount) * 100 : 0;

    let overallStatus: 'INCOMPLETE' | 'COMPLETE' | 'VALIDATION_REQUIRED';
    if (completionPercentage === 100) {
      overallStatus = 'COMPLETE';
    } else if (validatedCount > 0) {
      overallStatus = 'VALIDATION_REQUIRED';
    } else {
      overallStatus = 'INCOMPLETE';
    }

    // Generate summary
    const summary = this.generateProjectSummary(items, completionPercentage);

    return {
      overallStatus,
      completionPercentage,
      items,
      summary,
    };
  }

  private generateProjectSummary(items: ChecklistItem[], completionPercentage: number): string {
    const completed = items.filter(item => item.status === 'VALIDATED').length;
    const total = items.length;
    const pending = items.filter(item => item.status === 'REQUESTED').length;
    const extracted = items.filter(item => item.status === 'EXTRACTED').length;

    let summary = `Documenti progetto: ${completed}/${total} completati (${completionPercentage.toFixed(0)}%)`;

    if (pending > 0) {
      summary += `\n• ${pending} documenti in attesa di upload`;
    }

    if (extracted > 0) {
      summary += `\n• ${extracted} documenti estratti, in attesa di validazione`;
    }

    // Add specific issues
    const itemsWithIssues = items.filter(item => item.issues && item.issues.length > 0);
    if (itemsWithIssues.length > 0) {
      summary += `\n\nProblemi rilevati:`;
      itemsWithIssues.forEach(item => {
        summary += `\n• ${item.kind}: ${(item.issues || []).join(', ')}`;
      });
    }

    return summary;
  }
}

export const documentValidationService = new DocumentValidationService();
