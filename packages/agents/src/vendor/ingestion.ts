import {
  VendorQuestionnaire,
  VendorAnswers,
  ProjectFactsUpdate,
  zProjectFactsUpdate,
} from '@urbanova/types';
import { getProjectById, updateProject, persistProjectFactsUpdate } from '@urbanova/data';

export class ProjectFactsIngestionService {
  /**
   * Ingestisce le risposte del questionario nei Project Facts
   */
  async ingestQuestionnaireAnswers(
    questionnaire: VendorQuestionnaire,
    updatedBy: string
  ): Promise<{ success: boolean; changes: ProjectFactsUpdate['changes'] }> {
    try {
      if (!questionnaire.answers) {
        throw new Error('Questionnaire has no answers');
      }

      // Recupera progetto esistente
      const project = await getProjectById(questionnaire.projectId);
      if (!project) {
        throw new Error(`Project ${questionnaire.projectId} not found`);
      }

      // Mappa risposte a Project Facts
      const changes = this.mapAnswersToProjectFacts(questionnaire.answers, project);

      // Applica modifiche al progetto
      const updatedProject = this.applyChangesToProject(project, changes);

      // Salva progetto aggiornato
      await updateProject(updatedProject);

      // Salva audit delle modifiche
      const factsUpdate: ProjectFactsUpdate = {
        projectId: questionnaire.projectId,
        source: 'vendor_questionnaire',
        timestamp: new Date(),
        updatedBy,
        changes,
        metadata: {
          questionnaireId: questionnaire.id,
          vendorContact: questionnaire.vendorContact,
        },
      };

      await persistProjectFactsUpdate(factsUpdate);

      return { success: true, changes };
    } catch (error) {
      console.error('Error ingesting questionnaire answers:', error);
      return { success: false, changes: [] };
    }
  }

  /**
   * Mappa le risposte del questionario ai Project Facts
   */
  private mapAnswersToProjectFacts(
    answers: VendorAnswers,
    project: any
  ): ProjectFactsUpdate['changes'] {
    const changes: ProjectFactsUpdate['changes'] = [];

    // CDU Section
    if (answers.cdu.hasCDU !== undefined) {
      changes.push({
        field: 'hasCDU',
        oldValue: project.facts?.hasCDU,
        newValue: answers.cdu.hasCDU,
        confidence: 0.95,
      });
    }

    if (answers.cdu.cduDate) {
      changes.push({
        field: 'cduDate',
        oldValue: project.facts?.cduDate,
        newValue: answers.cdu.cduDate,
        confidence: 0.9,
      });
    }

    if (answers.cdu.cduValidity) {
      changes.push({
        field: 'cduValidity',
        oldValue: project.facts?.cduValidity,
        newValue: answers.cdu.cduValidity,
        confidence: 0.9,
      });
    }

    if (answers.cdu.cduNotes) {
      changes.push({
        field: 'cduNotes',
        oldValue: project.facts?.cduNotes,
        newValue: answers.cdu.cduNotes,
        confidence: 0.85,
      });
    }

    // Project Section
    if (answers.project.hasSubmittedProject !== undefined) {
      changes.push({
        field: 'hasSubmittedProject',
        oldValue: project.facts?.hasSubmittedProject,
        newValue: answers.project.hasSubmittedProject,
        confidence: 0.95,
      });
    }

    if (answers.project.projectSubmissionDate) {
      changes.push({
        field: 'projectSubmissionDate',
        oldValue: project.facts?.projectSubmissionDate,
        newValue: answers.project.projectSubmissionDate,
        confidence: 0.9,
      });
    }

    if (answers.project.projectApprovalStatus) {
      changes.push({
        field: 'projectApprovalStatus',
        oldValue: project.facts?.projectApprovalStatus,
        newValue: answers.project.projectApprovalStatus,
        confidence: 0.9,
      });
    }

    if (answers.project.projectNotes) {
      changes.push({
        field: 'projectNotes',
        oldValue: project.facts?.projectNotes,
        newValue: answers.project.projectNotes,
        confidence: 0.85,
      });
    }

    // Sale Section
    if (answers.sale.saleType) {
      changes.push({
        field: 'saleType',
        oldValue: project.facts?.saleType,
        newValue: answers.sale.saleType,
        confidence: 0.95,
      });
    }

    if (answers.sale.saleMotivation) {
      changes.push({
        field: 'saleMotivation',
        oldValue: project.facts?.saleMotivation,
        newValue: answers.sale.saleMotivation,
        confidence: 0.8,
      });
    }

    if (answers.sale.saleUrgency) {
      changes.push({
        field: 'saleUrgency',
        oldValue: project.facts?.saleUrgency,
        newValue: answers.sale.saleUrgency,
        confidence: 0.85,
      });
    }

    // Constraints Section
    if (answers.constraints.urbanConstraints.length > 0) {
      changes.push({
        field: 'urbanConstraints',
        oldValue: project.facts?.urbanConstraints,
        newValue: answers.constraints.urbanConstraints,
        confidence: 0.9,
      });
    }

    if (answers.constraints.easements.length > 0) {
      changes.push({
        field: 'easements',
        oldValue: project.facts?.easements,
        newValue: answers.constraints.easements,
        confidence: 0.9,
      });
    }

    if (answers.constraints.accessLimitations.length > 0) {
      changes.push({
        field: 'accessLimitations',
        oldValue: project.facts?.accessLimitations,
        newValue: answers.constraints.accessLimitations,
        confidence: 0.9,
      });
    }

    if (answers.constraints.constraintNotes) {
      changes.push({
        field: 'constraintNotes',
        oldValue: project.facts?.constraintNotes,
        newValue: answers.constraints.constraintNotes,
        confidence: 0.85,
      });
    }

    // Documents Section
    if (answers.documents.availableDocuments.length > 0) {
      changes.push({
        field: 'availableDocuments',
        oldValue: project.facts?.availableDocuments,
        newValue: answers.documents.availableDocuments,
        confidence: 0.95,
      });
    }

    if (answers.documents.documentNotes) {
      changes.push({
        field: 'documentNotes',
        oldValue: project.facts?.documentNotes,
        newValue: answers.documents.documentNotes,
        confidence: 0.85,
      });
    }

    // Additional Info
    if (answers.additional.notes) {
      changes.push({
        field: 'vendorNotes',
        oldValue: project.facts?.vendorNotes,
        newValue: answers.additional.notes,
        confidence: 0.8,
      });
    }

    if (answers.additional.contactPreference) {
      changes.push({
        field: 'vendorContactPreference',
        oldValue: project.facts?.vendorContactPreference,
        newValue: answers.additional.contactPreference,
        confidence: 0.9,
      });
    }

    if (answers.additional.bestTimeToContact) {
      changes.push({
        field: 'vendorBestTimeToContact',
        oldValue: project.facts?.vendorBestTimeToContact,
        newValue: answers.additional.bestTimeToContact,
        confidence: 0.85,
      });
    }

    return changes;
  }

  /**
   * Applica le modifiche al progetto
   */
  private applyChangesToProject(project: any, changes: ProjectFactsUpdate['changes']): any {
    const updatedProject = { ...project };

    // Inizializza facts se non esistono
    if (!updatedProject.facts) {
      updatedProject.facts = {};
    }

    // Applica ogni modifica
    for (const change of changes) {
      updatedProject.facts[change.field] = change.newValue;
    }

    // Aggiungi metadata per tracciabilità
    updatedProject.facts.lastUpdatedBy = 'vendor_questionnaire';
    updatedProject.facts.lastUpdatedAt = new Date().toISOString();

    return updatedProject;
  }

  /**
   * Calcola il completamento dei Requirements basato sui Project Facts
   */
  async calculateRequirementsCompletion(projectId: string): Promise<{
    totalFields: number;
    completedFields: number;
    completionRate: number;
    missingFields: string[];
  }> {
    const project = await getProjectById(projectId);
    if (!project || !project.facts) {
      return {
        totalFields: 0,
        completedFields: 0,
        completionRate: 0,
        missingFields: [],
      };
    }

    // Definizione campi richiesti per Requirements
    const requiredFields = [
      'hasCDU',
      'hasSubmittedProject',
      'saleType',
      'saleUrgency',
      'urbanConstraints',
      'easements',
      'accessLimitations',
      'availableDocuments',
    ];

    const optionalFields = [
      'cduDate',
      'cduValidity',
      'cduNotes',
      'projectSubmissionDate',
      'projectApprovalStatus',
      'projectNotes',
      'saleMotivation',
      'constraintNotes',
      'documentNotes',
      'vendorNotes',
      'vendorContactPreference',
      'vendorBestTimeToContact',
    ];

    const allFields = [...requiredFields, ...optionalFields];
    const completedFields = allFields.filter(field => {
      const value = project.facts[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    });

    const missingFields = allFields.filter(field => {
      const value = project.facts[field];
      if (Array.isArray(value)) {
        return value.length === 0;
      }
      return value === undefined || value === null || value === '';
    });

    return {
      totalFields: allFields.length,
      completedFields: completedFields.length,
      completionRate: (completedFields.length / allFields.length) * 100,
      missingFields,
    };
  }

  /**
   * Genera report di ingestione
   */
  async generateIngestionReport(questionnaireId: string): Promise<{
    questionnaire: VendorQuestionnaire;
    changes: ProjectFactsUpdate['changes'];
    requirementsCompletion: {
      totalFields: number;
      completedFields: number;
      completionRate: number;
      missingFields: string[];
    };
  } | null> {
    // TODO: Implementare recupero questionnaire e generazione report
    return null;
  }
}
