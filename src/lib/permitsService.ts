import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
} from 'firebase/firestore';

import { db } from './firebase';

export interface PermitType {
  id: string;
  name: string;
  category:
    | 'URBANISTICO'
    | 'AMBIENTALE'
    | 'SICUREZZA'
    | 'ENERGETICO'
    | 'STRUTTURALE'
    | 'ANTINCENDIO';
  description: string;
  requiredDocuments: string[];
  estimatedTime: number; // giorni
  estimatedCost: number;
  isRequired: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  regulations: string[];
  complianceRules: string[];
}

export interface Permit {
  id: string;
  projectId: string;
  projectName: string;
  permitType: PermitType;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXTENDED';
  submissionDate?: Date;
  approvalDate?: Date;
  expiryDate?: Date;
  estimatedApprovalTime: number; // giorni
  actualApprovalTime?: number; // giorni
  cost: {
    estimated: number;
    actual: number;
    currency: string;
  };
  documents: {
    id: string;
    name: string;
    type: string;
    status: 'REQUIRED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    url?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    notes?: string;
  }[];
  complianceScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  progress: number; // 0-100
  assignedTo?: string;
  reviewer?: string;
  notes: string[];
  alerts: {
    id: string;
    type: 'WARNING' | 'ERROR' | 'INFO';
    message: string;
    createdAt: Date;
    isResolved: boolean;
    resolvedAt?: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ComplianceReport {
  id: string;
  projectId: string;
  projectName: string;
  overallScore: number;
  categoryScores: Record<string, number>;
  riskAssessment: {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    categoryRisks: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>;
    recommendations: string[];
  };
  missingDocuments: string[];
  expiringPermits: Permit[];
  criticalIssues: string[];
  generatedAt: Date;
  validUntil: Date;
}

export interface InspectionSchedule {
  id: string;
  projectId: string;
  projectName: string;
  permitId: string;
  permitType: string;
  inspectionType: 'PRELIMINARY' | 'DURING_CONSTRUCTION' | 'FINAL' | 'COMPLIANCE';
  scheduledDate: Date;
  estimatedDuration: number; // ore
  inspector: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  location: string;
  requirements: string[];
  notes: string[];
  result?: {
    passed: boolean;
    findings: string[];
    recommendations: string[];
    nextInspectionDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermitData {
  projectId: string;
  projectName: string;
  permitTypeId: string;
  estimatedApprovalTime: number;
  estimatedCost: number;
  documents: {
    name: string;
    type: string;
    status: 'REQUIRED' | 'SUBMITTED';
    url?: string;
    notes?: string;
  }[];
  notes?: string[];
}

export class PermitsService {
  private readonly PERMITS_COLLECTION = 'permits';
  private readonly PERMIT_TYPES_COLLECTION = 'permitTypes';
  private readonly COMPLIANCE_REPORTS_COLLECTION = 'complianceReports';
  private readonly INSPECTION_SCHEDULES_COLLECTION = 'inspectionSchedules';

  /**
   * Inizializza i tipi di permesso standard
   */
  async initializePermitTypes(): Promise<void> {
    try {
      console.log('🏗️ [PermitsService] Inizializzazione tipi permesso...');

      const permitTypes: PermitType[] = [
        {
          id: 'urbanistico',
          name: 'Permesso di Costruire',
          category: 'URBANISTICO',
          description: 'Autorizzazione per la realizzazione di opere edilizie',
          requiredDocuments: [
            'Planimetrie progetto',
            'Relazione tecnica',
            'Certificato di conformità urbanistica',
            'Documentazione catastale',
            'Progetto strutturale',
          ],
          estimatedTime: 90,
          estimatedCost: 2500,
          isRequired: true,
          priority: 'HIGH',
          regulations: [
            'D.P.R. 380/2001',
            'Regolamento Edilizio Comunale',
            'Piano Regolatore Generale',
          ],
          complianceRules: [
            'Rispetto delle distanze dai confini',
            "Conformità alla destinazione d'uso",
            'Rispetto degli indici urbanistici',
          ],
        },
        {
          id: 'ambientale',
          name: 'Valutazione Impatto Ambientale (VIA)',
          category: 'AMBIENTALE',
          description: "Valutazione dell'impatto ambientale del progetto",
          requiredDocuments: [
            'Studio di impatto ambientale',
            'Relazione ambientale',
            'Piano di monitoraggio',
            'Valutazione acustica',
            'Valutazione emissioni',
          ],
          estimatedTime: 180,
          estimatedCost: 15000,
          isRequired: false,
          priority: 'MEDIUM',
          regulations: ['D.Lgs. 152/2006', 'Direttiva 2011/92/UE', 'Regolamento regionale VIA'],
          complianceRules: [
            'Valutazione impatto su flora e fauna',
            'Analisi emissioni inquinanti',
            'Piano di mitigazione impatti',
          ],
        },
        {
          id: 'sicurezza',
          name: 'Permesso Sicurezza Lavoro',
          category: 'SICUREZZA',
          description: 'Autorizzazione per la sicurezza durante i lavori',
          requiredDocuments: [
            'Piano di sicurezza',
            'Valutazione rischi',
            'Procedure di emergenza',
            'Formazione personale',
            'Dichiarazione conformità DPI',
          ],
          estimatedTime: 30,
          estimatedCost: 800,
          isRequired: true,
          priority: 'HIGH',
          regulations: ['D.Lgs. 81/2008', 'Accordo Stato-Regioni', 'Norme tecniche UNI'],
          complianceRules: [
            'Valutazione rischi specifici',
            'Formazione obbligatoria personale',
            'Procedure di emergenza documentate',
          ],
        },
        {
          id: 'energetico',
          name: 'Certificazione Energetica',
          category: 'ENERGETICO',
          description: 'Certificazione della prestazione energetica',
          requiredDocuments: [
            'Progetto energetico',
            'Calcoli termici',
            'Specifiche materiali',
            'Relazione tecnica',
            'Planimetrie termiche',
          ],
          estimatedTime: 45,
          estimatedCost: 1200,
          isRequired: true,
          priority: 'MEDIUM',
          regulations: ['D.Lgs. 192/2005', 'D.M. 26/06/2015', 'Norme tecniche UNI/TS 11300'],
          complianceRules: [
            'Rispetto classe energetica minima',
            'Utilizzo fonti rinnovabili',
            'Isolamento termico conforme',
          ],
        },
        {
          id: 'strutturale',
          name: 'Progetto Strutturale',
          category: 'STRUTTURALE',
          description: "Progetto strutturale dell'edificio",
          requiredDocuments: [
            'Calcoli strutturali',
            'Planimetrie strutturali',
            'Relazione tecnica',
            'Specifiche materiali',
            'Verifiche di sicurezza',
          ],
          estimatedTime: 60,
          estimatedCost: 3000,
          isRequired: true,
          priority: 'HIGH',
          regulations: ['D.M. 17/01/2018', 'Norme tecniche costruzioni', 'Eurocodici strutturali'],
          complianceRules: [
            'Verifica sicurezza strutturale',
            'Rispetto coefficienti di sicurezza',
            'Analisi stati limite',
          ],
        },
        {
          id: 'antincendio',
          name: 'Prevenzione Incendi',
          category: 'ANTINCENDIO',
          description: 'Progetto prevenzione incendi',
          requiredDocuments: [
            'Progetto antincendio',
            'Relazione tecnica',
            'Planimetrie antincendio',
            'Calcoli evacuazione',
            'Specifiche materiali',
          ],
          estimatedTime: 45,
          estimatedCost: 2000,
          isRequired: true,
          priority: 'HIGH',
          regulations: ['D.M. 03/08/2015', 'D.M. 07/08/2012', 'Norme tecniche antincendio'],
          complianceRules: [
            'Rispetto distanze di sicurezza',
            'Percorsi di evacuazione idonei',
            'Resistenza al fuoco strutture',
          ],
        },
      ];

      for (const permitType of permitTypes) {
        const docRef = doc(db, this.PERMIT_TYPES_COLLECTION, permitType.id);
        await setDoc(docRef, {
          ...permitType,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      console.log('✅ [PermitsService] Tipi permesso inizializzati:', permitTypes.length);
    } catch (error) {
      console.error('❌ [PermitsService] Errore inizializzazione tipi permesso:', error);
      throw new Error(`Impossibile inizializzare i tipi di permesso: ${error}`);
    }
  }

  /**
   * Crea un nuovo permesso
   */
  async createPermit(permitData: CreatePermitData): Promise<string> {
    try {
      console.log(
        '🏗️ [PermitsService] Creazione nuovo permesso per progetto:',
        permitData.projectName
      );

      // Recupera il tipo di permesso
      const permitType = await this.getPermitType(permitData.permitTypeId);
      if (!permitType) {
        throw new Error('Tipo di permesso non trovato');
      }

      const permitId = `permit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newPermit: Permit = {
        id: permitId,
        projectId: permitData.projectId,
        projectName: permitData.projectName,
        permitType,
        status: 'DRAFT',
        estimatedApprovalTime: permitData.estimatedApprovalTime,
        cost: {
          estimated: permitData.estimatedCost,
          actual: 0,
          currency: 'EUR',
        },
        documents: permitData.documents.map(doc => ({
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...doc,
          submittedAt: doc.status === 'SUBMITTED' ? new Date() : undefined,
        })) as Permit['documents'],
        complianceScore: 0,
        riskLevel: 'MEDIUM',
        progress: 0,
        notes: permitData.notes || [],
        alerts: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // TODO: Integrare con AuthContext
        lastModifiedBy: 'current-user',
      };

      const permitRef = doc(db, this.PERMITS_COLLECTION, permitId);
      await setDoc(permitRef, {
        ...newPermit,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [PermitsService] Permesso creato con successo:', permitId);
      return permitId;
    } catch (error) {
      console.error('❌ [PermitsService] Errore creazione permesso:', error);
      throw new Error(`Impossibile creare il permesso: ${error}`);
    }
  }

  /**
   * Recupera tutti i permessi di un progetto
   */
  async getProjectPermits(projectId: string): Promise<Permit[]> {
    try {
      console.log('📋 [PermitsService] Recupero permessi progetto:', projectId);

      const permitsRef = collection(db, this.PERMITS_COLLECTION);
      const q = query(
        permitsRef,
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const permits: Permit[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        permits.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          submissionDate: data.submissionDate?.toDate(),
          approvalDate: data.approvalDate?.toDate(),
          expiryDate: data.expiryDate?.toDate(),
        } as Permit);
      });

      console.log('✅ [PermitsService] Permessi recuperati:', permits.length);
      return permits;
    } catch (error) {
      console.error('❌ [PermitsService] Errore recupero permessi:', error);
      throw new Error(`Impossibile recuperare i permessi: ${error}`);
    }
  }

  /**
   * Recupera tutti i permessi di un utente
   */
  async getUserPermits(userId: string): Promise<Permit[]> {
    try {
      console.log('📋 [PermitsService] Recupero permessi utente:', userId);

      const permitsRef = collection(db, this.PERMITS_COLLECTION);
      const q = query(permitsRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const permits: Permit[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        permits.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          submissionDate: data.submissionDate?.toDate(),
          approvalDate: data.approvalDate?.toDate(),
          expiryDate: data.expiryDate?.toDate(),
        } as Permit);
      });

      console.log('✅ [PermitsService] Permessi utente recuperati:', permits.length);
      return permits;
    } catch (error) {
      console.error('❌ [PermitsService] Errore recupero permessi utente:', error);
      throw new Error(`Impossibile recuperare i permessi utente: ${error}`);
    }
  }

  /**
   * Recupera un permesso specifico
   */
  async getPermit(permitId: string): Promise<Permit | null> {
    try {
      console.log('🔍 [PermitsService] Recupero permesso:', permitId);

      const permitRef = doc(db, this.PERMITS_COLLECTION, permitId);
      const permitDoc = await getDoc(permitRef);

      if (!permitDoc.exists()) {
        console.log('⚠️ [PermitsService] Permesso non trovato:', permitId);
        return null;
      }

      const data = permitDoc.data();
      const permit: Permit = {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        submissionDate: data.submissionDate?.toDate(),
        approvalDate: data.approvalDate?.toDate(),
        expiryDate: data.expiryDate?.toDate(),
      } as Permit;

      console.log('✅ [PermitsService] Permesso recuperato:', permit.projectName);
      return permit;
    } catch (error) {
      console.error('❌ [PermitsService] Errore recupero permesso:', error);
      throw new Error(`Impossibile recuperare il permesso: ${error}`);
    }
  }

  /**
   * Recupera un tipo di permesso
   */
  async getPermitType(typeId: string): Promise<PermitType | null> {
    try {
      console.log('🔍 [PermitsService] Recupero tipo permesso:', typeId);

      const typeRef = doc(db, this.PERMIT_TYPES_COLLECTION, typeId);
      const typeDoc = await getDoc(typeRef);

      if (!typeDoc.exists()) {
        console.log('⚠️ [PermitsService] Tipo permesso non trovato:', typeId);
        return null;
      }

      const data = typeDoc.data() as PermitType;
      console.log('✅ [PermitsService] Tipo permesso recuperato:', data.name);
      return data;
    } catch (error) {
      console.error('❌ [PermitsService] Errore recupero tipo permesso:', error);
      throw new Error(`Impossibile recuperare il tipo di permesso: ${error}`);
    }
  }

  /**
   * Recupera tutti i tipi di permesso
   */
  async getAllPermitTypes(): Promise<PermitType[]> {
    try {
      console.log('📋 [PermitsService] Recupero tutti i tipi permesso');

      const typesRef = collection(db, this.PERMIT_TYPES_COLLECTION);
      const querySnapshot = await getDocs(typesRef);

      const types: PermitType[] = [];
      querySnapshot.forEach(doc => {
        types.push(doc.data() as PermitType);
      });

      console.log('✅ [PermitsService] Tipi permesso recuperati:', types.length);
      return types;
    } catch (error) {
      console.error('❌ [PermitsService] Errore recupero tipi permesso:', error);
      throw new Error(`Impossibile recuperare i tipi di permesso: ${error}`);
    }
  }

  /**
   * Aggiorna un permesso
   */
  async updatePermit(permitId: string, updates: Partial<Permit>): Promise<void> {
    try {
      console.log('✏️ [PermitsService] Aggiornamento permesso:', permitId);

      const permitRef = doc(db, this.PERMITS_COLLECTION, permitId);
      await updateDoc(permitRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: 'current-user', // TODO: Integrare con AuthContext
      });

      console.log('✅ [PermitsService] Permesso aggiornato con successo');
    } catch (error) {
      console.error('❌ [PermitsService] Errore aggiornamento permesso:', error);
      throw new Error(`Impossibile aggiornare il permesso: ${error}`);
    }
  }

  /**
   * Cambia lo stato di un permesso
   */
  async changePermitStatus(permitId: string, status: Permit['status']): Promise<void> {
    try {
      console.log('🔄 [PermitsService] Cambio stato permesso:', permitId, status);

      const updates: Partial<Permit> = { status };

      // Aggiorna date in base al nuovo stato
      if (status === 'SUBMITTED') {
        updates.submissionDate = new Date();
      } else if (status === 'APPROVED') {
        updates.approvalDate = new Date();
        updates.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 anno
      }

      await this.updatePermit(permitId, updates);

      console.log('✅ [PermitsService] Stato permesso aggiornato');
    } catch (error) {
      console.error('❌ [PermitsService] Errore cambio stato permesso:', error);
      throw new Error(`Impossibile cambiare lo stato del permesso: ${error}`);
    }
  }

  /**
   * Aggiorna il progresso di un permesso
   */
  async updatePermitProgress(permitId: string, progress: number): Promise<void> {
    try {
      console.log('📊 [PermitsService] Aggiornamento progresso permesso:', permitId, progress);

      await this.updatePermit(permitId, { progress });

      console.log('✅ [PermitsService] Progresso permesso aggiornato');
    } catch (error) {
      console.error('❌ [PermitsService] Errore aggiornamento progresso permesso:', error);
      throw new Error(`Impossibile aggiornare il progresso del permesso: ${error}`);
    }
  }

  /**
   * Aggiunge un documento a un permesso
   */
  async addDocumentToPermit(
    permitId: string,
    document: {
      name: string;
      type: string;
      url?: string;
      notes?: string;
    }
  ): Promise<void> {
    try {
      console.log('📄 [PermitsService] Aggiunta documento al permesso:', permitId);

      const permit = await this.getPermit(permitId);
      if (!permit) {
        throw new Error('Permesso non trovato');
      }

      const newDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...document,
        status: 'SUBMITTED' as const,
        submittedAt: new Date(),
      };

      const updatedDocuments = [...permit.documents, newDocument];
      await this.updatePermit(permitId, { documents: updatedDocuments });

      console.log('✅ [PermitsService] Documento aggiunto al permesso');
    } catch (error) {
      console.error('❌ [PermitsService] Errore aggiunta documento:', error);
      throw new Error(`Impossibile aggiungere il documento: ${error}`);
    }
  }

  /**
   * Genera un report di compliance
   */
  async generateComplianceReport(projectId: string): Promise<ComplianceReport> {
    try {
      console.log('📊 [PermitsService] Generazione report compliance per progetto:', projectId);

      const permits = await this.getProjectPermits(projectId);

      // Calcola score complessivo
      const overallScore =
        permits.length > 0
          ? Math.round(permits.reduce((total, p) => total + p.complianceScore, 0) / permits.length)
          : 0;

      // Calcola score per categoria
      const categoryScores: Record<string, number> = {};
      const categoryRisks: Record<string, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {};

      const categories = [
        'URBANISTICO',
        'AMBIENTALE',
        'SICUREZZA',
        'ENERGETICO',
        'STRUTTURALE',
        'ANTINCENDIO',
      ];

      categories.forEach(category => {
        const categoryPermits = permits.filter(p => p.permitType.category === category);
        if (categoryPermits.length > 0) {
          categoryScores[category] = Math.round(
            categoryPermits.reduce((total, p) => total + p.complianceScore, 0) /
              categoryPermits.length
          );

          // Determina rischio categoria
          if (categoryScores[category] >= 80) categoryRisks[category] = 'LOW';
          else if (categoryScores[category] >= 60) categoryRisks[category] = 'MEDIUM';
          else if (categoryScores[category] >= 40) categoryRisks[category] = 'HIGH';
          else categoryRisks[category] = 'CRITICAL';
        } else {
          categoryScores[category] = 0;
          categoryRisks[category] = 'CRITICAL';
        }
      });

      // Determina rischio complessivo
      const overallRisk =
        overallScore >= 80
          ? 'LOW'
          : overallScore >= 60
            ? 'MEDIUM'
            : overallScore >= 40
              ? 'HIGH'
              : 'CRITICAL';

      // Identifica documenti mancanti
      const missingDocuments: string[] = [];
      permits.forEach(permit => {
        const requiredDocs = permit.permitType.requiredDocuments;
        const submittedDocs = permit.documents
          .filter(d => d.status === 'SUBMITTED')
          .map(d => d.name);

        requiredDocs.forEach(required => {
          if (!submittedDocs.includes(required)) {
            missingDocuments.push(`${permit.permitType.name}: ${required}`);
          }
        });
      });

      // Identifica permessi in scadenza
      const expiringPermits = permits.filter(
        p => p.expiryDate && p.expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 // 30 giorni
      );

      // Genera raccomandazioni
      const recommendations: string[] = [];
      if (overallScore < 60) {
        recommendations.push('Priorizzare la risoluzione dei permessi con score basso');
      }
      if (missingDocuments.length > 0) {
        recommendations.push(
          `Completare la documentazione mancante (${missingDocuments.length} documenti)`
        );
      }
      if (expiringPermits.length > 0) {
        recommendations.push(`Gestire i permessi in scadenza (${expiringPermits.length} permessi)`);
      }

      const report: ComplianceReport = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        projectId,
        projectName: permits[0]?.projectName || 'Progetto Sconosciuto',
        overallScore,
        categoryScores,
        riskAssessment: {
          overallRisk,
          categoryRisks,
          recommendations,
        },
        missingDocuments,
        expiringPermits,
        criticalIssues: recommendations.filter(r => r.includes('CRITICAL')),
        generatedAt: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
      };

      // Salva il report nel database
      const reportRef = doc(db, this.COMPLIANCE_REPORTS_COLLECTION, report.id);
      await setDoc(reportRef, {
        ...report,
        generatedAt: serverTimestamp(),
        validUntil: serverTimestamp(),
      });

      console.log('✅ [PermitsService] Report compliance generato:', report.id);
      return report;
    } catch (error) {
      console.error('❌ [PermitsService] Errore generazione report compliance:', error);
      throw new Error(`Impossibile generare il report di compliance: ${error}`);
    }
  }

  /**
   * Programma un sopralluogo
   */
  async scheduleInspection(inspectionData: {
    projectId: string;
    projectName: string;
    permitId: string;
    permitType: string;
    inspectionType: InspectionSchedule['inspectionType'];
    scheduledDate: Date;
    estimatedDuration: number;
    inspector: string;
    location: string;
    requirements: string[];
    notes?: string[];
  }): Promise<string> {
    try {
      console.log(
        '📅 [PermitsService] Programmazione sopralluogo per progetto:',
        inspectionData.projectName
      );

      const inspectionId = `inspection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newInspection: InspectionSchedule = {
        id: inspectionId,
        ...inspectionData,
        status: 'SCHEDULED',
        notes: inspectionData.notes || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const inspectionRef = doc(db, this.INSPECTION_SCHEDULES_COLLECTION, inspectionId);
      await setDoc(inspectionRef, {
        ...newInspection,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [PermitsService] Sopralluogo programmato:', inspectionId);
      return inspectionId;
    } catch (error) {
      console.error('❌ [PermitsService] Errore programmazione sopralluogo:', error);
      throw new Error(`Impossibile programmare il sopralluogo: ${error}`);
    }
  }

  /**
   * Recupera statistiche dei permessi
   */
  async getPermitsStats(userId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byRiskLevel: Record<string, number>;
    totalCost: number;
    averageProgress: number;
    criticalAlerts: number;
    expiringSoon: number;
  }> {
    try {
      console.log('📊 [PermitsService] Recupero statistiche permessi');

      const permits = userId ? await this.getUserPermits(userId) : await this.getAllPermits();

      const stats = {
        total: permits.length,
        byStatus: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        byRiskLevel: {} as Record<string, number>,
        totalCost: 0,
        averageProgress: 0,
        criticalAlerts: 0,
        expiringSoon: 0,
      };

      permits.forEach(permit => {
        // Conta per stato
        stats.byStatus[permit.status] = (stats.byStatus[permit.status] || 0) + 1;

        // Conta per categoria
        stats.byCategory[permit.permitType.category] =
          (stats.byCategory[permit.permitType.category] || 0) + 1;

        // Conta per livello rischio
        stats.byRiskLevel[permit.riskLevel] = (stats.byRiskLevel[permit.riskLevel] || 0) + 1;

        // Somma costi
        stats.totalCost += permit.cost.estimated;

        // Somma progresso
        stats.averageProgress += permit.progress;

        // Conta alert critici
        stats.criticalAlerts += permit.alerts.filter(a => !a.isResolved).length;

        // Conta permessi in scadenza
        if (
          permit.expiryDate &&
          permit.expiryDate.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
        ) {
          stats.expiringSoon++;
        }
      });

      // Calcola media progresso
      if (permits.length > 0) {
        stats.averageProgress = Math.round(stats.averageProgress / permits.length);
      }

      console.log('✅ [PermitsService] Statistiche calcolate:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [PermitsService] Errore calcolo statistiche:', error);
      throw new Error(`Impossibile calcolare le statistiche: ${error}`);
    }
  }

  /**
   * Recupera tutti i permessi (per admin)
   */
  private async getAllPermits(): Promise<Permit[]> {
    try {
      const permitsRef = collection(db, this.PERMITS_COLLECTION);
      const q = query(permitsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const permits: Permit[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        permits.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          submissionDate: data.submissionDate?.toDate(),
          approvalDate: data.approvalDate?.toDate(),
          expiryDate: data.expiryDate?.toDate(),
        } as Permit);
      });

      return permits;
    } catch (error) {
      console.error('❌ [PermitsService] Errore recupero tutti i permessi:', error);
      throw new Error(`Impossibile recuperare tutti i permessi: ${error}`);
    }
  }
}

// Esporta un'istanza singleton
export const permitsService = new PermitsService();
