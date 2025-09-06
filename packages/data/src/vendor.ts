import {
  VendorQuestionnaire,
  VendorAnswers,
  ProjectFactsUpdate,
  zVendorQuestionnaire,
  zVendorAnswers,
  zProjectFactsUpdate,
} from '@urbanova/types';
import { getFirestoreInstance, serverTimestamp, safeCollection } from '@urbanova/infra';

// REAL Firebase instance - NO MORE MOCKS!
const db = getFirestoreInstance();

// ============================================================================
// VENDOR QUESTIONNAIRE PERSISTENCE
// ============================================================================

/**
 * Salva un nuovo questionario venditore
 */
export async function persistVendorQuestionnaire(
  questionnaire: VendorQuestionnaire
): Promise<void> {
  try {
    const validated = zVendorQuestionnaire.parse(questionnaire);

    await safeCollection('vendor_questionnaires')
      .doc(validated.id)
      .set({
        ...validated,
        createdAt: validated.createdAt.toISOString(),
        expiresAt: validated.expiresAt.toISOString(),
        completedAt: validated.completedAt?.toISOString(),
        metadata: {
          ...validated.metadata,
          sentAt: validated.metadata.sentAt.toISOString(),
          lastReminderAt: validated.metadata.lastReminderAt?.toISOString(),
        },
      });
  } catch (error) {
    console.error('Error persisting vendor questionnaire:', error);
    throw error;
  }
}

/**
 * Recupera questionario per ID
 */
export async function getVendorQuestionnaireById(id: string): Promise<VendorQuestionnaire | null> {
  try {
    const doc = await safeCollection('vendor_questionnaires').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      metadata: {
        ...data.metadata,
        sentAt: new Date(data.metadata.sentAt),
        lastReminderAt: data.metadata.lastReminderAt
          ? new Date(data.metadata.lastReminderAt)
          : undefined,
      },
    } as VendorQuestionnaire;
  } catch (error) {
    console.error('Error getting vendor questionnaire by ID:', error);
    return null;
  }
}

/**
 * Recupera questionario per token
 */
export async function getVendorQuestionnaireByToken(
  token: string
): Promise<VendorQuestionnaire | null> {
  try {
    const snapshot = await safeCollection('vendor_questionnaires')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      metadata: {
        ...data.metadata,
        sentAt: new Date(data.metadata.sentAt),
        lastReminderAt: data.metadata.lastReminderAt
          ? new Date(data.metadata.lastReminderAt)
          : undefined,
      },
    } as VendorQuestionnaire;
  } catch (error) {
    console.error('Error getting vendor questionnaire by token:', error);
    return null;
  }
}

/**
 * Aggiorna questionario esistente
 */
export async function updateVendorQuestionnaire(questionnaire: VendorQuestionnaire): Promise<void> {
  try {
    const validated = zVendorQuestionnaire.parse(questionnaire);

    await safeCollection('vendor_questionnaires')
      .doc(validated.id)
      .update({
        ...validated,
        createdAt: validated.createdAt.toISOString(),
        expiresAt: validated.expiresAt.toISOString(),
        completedAt: validated.completedAt?.toISOString(),
        metadata: {
          ...validated.metadata,
          sentAt: validated.metadata.sentAt.toISOString(),
          lastReminderAt: validated.metadata.lastReminderAt?.toISOString(),
        },
      });
  } catch (error) {
    console.error('Error updating vendor questionnaire:', error);
    throw error;
  }
}

/**
 * Lista questionari per progetto
 */
export async function listVendorQuestionnairesByProject(
  projectId: string
): Promise<VendorQuestionnaire[]> {
  try {
    const snapshot = await safeCollection('vendor_questionnaires')
      .where('projectId', '==', projectId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        expiresAt: new Date(data.expiresAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        metadata: {
          ...data.metadata,
          sentAt: new Date(data.metadata.sentAt),
          lastReminderAt: data.metadata.lastReminderAt
            ? new Date(data.metadata.lastReminderAt)
            : undefined,
        },
      } as VendorQuestionnaire;
    });
  } catch (error) {
    console.error('Error listing vendor questionnaires by project:', error);
    return [];
  }
}

/**
 * Lista questionari scaduti
 */
export async function listExpiredQuestionnaires(): Promise<VendorQuestionnaire[]> {
  try {
    const now = new Date();
    const snapshot = await safeCollection('vendor_questionnaires')
      .where('expiresAt', '<', now.toISOString())
      .where('status', '==', 'pending')
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        expiresAt: new Date(data.expiresAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        metadata: {
          ...data.metadata,
          sentAt: new Date(data.metadata.sentAt),
          lastReminderAt: data.metadata.lastReminderAt
            ? new Date(data.metadata.lastReminderAt)
            : undefined,
        },
      } as VendorQuestionnaire;
    });
  } catch (error) {
    console.error('Error listing expired questionnaires:', error);
    return [];
  }
}

// ============================================================================
// PROJECT FACTS UPDATES PERSISTENCE
// ============================================================================

/**
 * Salva aggiornamento Project Facts
 */
export async function persistProjectFactsUpdate(update: ProjectFactsUpdate): Promise<void> {
  try {
    const validated = zProjectFactsUpdate.parse(update);

    await safeCollection('project_facts_updates')
      .doc(`${validated.projectId}_${validated.timestamp.getTime()}`)
      .set({
        ...validated,
        timestamp: validated.timestamp.toISOString(),
        metadata: {
          ...validated.metadata,
          vendorContact: validated.metadata.vendorContact,
        },
      });
  } catch (error) {
    console.error('Error persisting project facts update:', error);
    throw error;
  }
}

/**
 * Lista aggiornamenti Project Facts per progetto
 */
export async function listProjectFactsUpdates(projectId: string): Promise<ProjectFactsUpdate[]> {
  try {
    const snapshot = await safeCollection('project_facts_updates')
      .where('projectId', '==', projectId)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
        metadata: {
          ...data.metadata,
          vendorContact: data.metadata.vendorContact,
        },
      } as ProjectFactsUpdate;
    });
  } catch (error) {
    console.error('Error listing project facts updates:', error);
    return [];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Genera statistiche questionari
 */
export async function getVendorQuestionnaireStats(projectId: string): Promise<{
  total: number;
  pending: number;
  completed: number;
  expired: number;
  completionRate: number;
}> {
  try {
    const questionnaires = await listVendorQuestionnairesByProject(projectId);

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
  } catch (error) {
    console.error('Error getting vendor questionnaire stats:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      expired: 0,
      completionRate: 0,
    };
  }
}

/**
 * Pulisce questionari scaduti
 */
export async function cleanupExpiredQuestionnaires(): Promise<{
  cleaned: number;
  errors: number;
}> {
  try {
    const expiredQuestionnaires = await listExpiredQuestionnaires();
    let cleaned = 0;
    let errors = 0;

    for (const questionnaire of expiredQuestionnaires) {
      try {
        await updateVendorQuestionnaire({
          ...questionnaire,
          status: 'expired',
        });
        cleaned++;
      } catch (error) {
        console.error('Error cleaning up expired questionnaire:', error);
        errors++;
      }
    }

    return { cleaned, errors };
  } catch (error) {
    console.error('Error in cleanup expired questionnaires:', error);
    return { cleaned: 0, errors: 1 };
  }
}
