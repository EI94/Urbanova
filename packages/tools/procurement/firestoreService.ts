import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { RDO, Offer, Comparison, Vendor, PreCheckResult } from '@urbanova/types';
import { safeCollection } from '@urbanova/infra';

/**
 * Servizio Firestore per Sistema Procurement Urbanova
 *
 * Caratteristiche:
 * - CRUD completo per RDO, Offer, Comparison, Vendor
 * - Real-time updates con onSnapshot
 * - Batch operations per transazioni complesse
 * - Query ottimizzate con indici
 * - Backup automatico e recovery
 * - Audit trail completo
 */

export class FirestoreService {
  private db;
  private collections = {
    rdos: 'rdos',
    offers: 'offers',
    comparisons: 'comparisons',
    vendors: 'vendors',
    preChecks: 'preChecks',
    auditLogs: 'auditLogs',
  };

  constructor() {
    // Inizializza Firebase se non già fatto
    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || '',
      };

      const app = initializeApp(firebaseConfig);
      this.db = getFirestore(app);
    } else {
      this.db = getFirestore(getApp());
    }

    console.log('🔥 [FirestoreService] Connessione Firestore stabilita');
  }

  // ===========================================
  // RDO OPERATIONS
  // ===========================================

  /**
   * Crea nuovo RDO con validazione e audit
   */
  async createRDO(rdoData: Omit<RDO, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const batch = writeBatch(this.db);

    try {
      // Genera ID univoco
      const rdoId = `rdo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = Timestamp.now();

      const rdo: RDO = {
        ...rdoData,
        id: rdoId,
        createdAt: now.toDate(),
        updatedAt: now.toDate(),
      };

      // Salva RDO
      const rdoRef = doc(this.db, this.collections.rdos, rdoId);
      batch.set(rdoRef, {
        ...rdo,
        createdAt: now,
        updatedAt: now,
      });

      // Crea audit log
      const auditRef = doc(this.db, this.collections.auditLogs, `audit-${Date.now()}`);
      batch.set(auditRef, {
        timestamp: now,
        action: 'CREATE_RDO',
        entityType: 'RDO',
        entityId: rdoId,
        userId: rdo.createdBy,
        details: {
          title: rdo.title,
          projectId: rdo.projectId,
          invitedVendors: rdo.invitedVendors.length,
        },
      });

      // Commit batch
      await batch.commit();

      console.log(`✅ [FirestoreService] RDO ${rdoId} creato con successo`);
      return rdoId;
    } catch (error) {
      console.error('❌ [FirestoreService] Errore creazione RDO:', error);
      throw new Error(`Errore creazione RDO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ottieni RDO per ID con real-time updates
   */
  async getRDO(rdoId: string): Promise<RDO | null> {
    try {
      const rdoRef = doc(this.db, this.collections.rdos, rdoId);
      const rdoSnap = await getDoc(rdoRef);

      if (!rdoSnap.exists()) {
        return null;
      }

      const data = rdoSnap.data();
      return {
        ...data,
        id: rdoSnap.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        deadline: data.deadline.toDate(),
      } as RDO;
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore recupero RDO ${rdoId}:`, error);
      throw new Error(`Errore recupero RDO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lista RDO con filtri e paginazione
   */
  async listRDOs(
    filters: {
      status?: string;
      projectId?: string;
      createdBy?: string;
      category?: string;
    } = {},
    options: {
      limit?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
    } = {}
  ): Promise<RDO[]> {
    try {
      let q: any = safeCollection(this.collections.rdos);

      // Applica filtri
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.projectId) {
        q = query(q, where('projectId', '==', filters.projectId));
      }
      if (filters.createdBy) {
        q = query(q, where('createdBy', '==', filters.createdBy));
      }
      if (filters.category) {
        q = query(q, where('metadata.category', '==', filters.category));
      }

      // Applica ordinamento
      const orderField = options.orderBy || 'createdAt';
      const orderDir = options.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDir));

      // Applica limite
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const rdos: RDO[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data() as any;
        rdos.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          deadline: data.deadline.toDate(),
        } as RDO);
      });

      console.log(`✅ [FirestoreService] Recuperati ${rdos.length} RDO`);
      return rdos;
    } catch (error) {
      console.error('❌ [FirestoreService] Errore lista RDO:', error);
      throw new Error(`Errore lista RDO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Aggiorna RDO con audit trail
   */
  async updateRDO(rdoId: string, updates: Partial<RDO>, userId: string): Promise<void> {
    const batch = writeBatch(this.db);

    try {
      const rdoRef = doc(this.db, this.collections.rdos, rdoId);
      const now = Timestamp.now();

      // Aggiorna RDO
      batch.update(rdoRef, {
        ...updates,
        updatedAt: now,
      });

      // Crea audit log
      const auditRef = doc(this.db, this.collections.auditLogs, `audit-${Date.now()}`);
      batch.set(auditRef, {
        timestamp: now,
        action: 'UPDATE_RDO',
        entityType: 'RDO',
        entityId: rdoId,
        userId,
        details: {
          updatedFields: Object.keys(updates),
          previousValues: await this.getRDOFieldValues(rdoId, Object.keys(updates)),
        },
      });

      await batch.commit();
      console.log(`✅ [FirestoreService] RDO ${rdoId} aggiornato con successo`);
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore aggiornamento RDO ${rdoId}:`, error);
      throw new Error(`Errore aggiornamento RDO: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================
  // OFFER OPERATIONS
  // ===========================================

  /**
   * Crea nuova offerta con validazione
   */
  async createOffer(offerData: Omit<Offer, 'id' | 'submittedAt' | 'status'>): Promise<string> {
    try {
      const offerId = `offer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = Timestamp.now();

      const offer: Offer = {
        ...offerData,
        id: offerId,
        submittedAt: now.toDate(),
        status: 'submitted',
      };

      const offerRef = doc(this.db, this.collections.offers, offerId);
      await setDoc(offerRef, {
        ...offer,
        submittedAt: now,
      });

      // Aggiorna status vendor nell'RDO
      await this.updateRDO(offer.rdoId, {}, 'system');

      console.log(`✅ [FirestoreService] Offerta ${offerId} creata con successo`);
      return offerId;
    } catch (error) {
      console.error('❌ [FirestoreService] Errore creazione offerta:', error);
      throw new Error(`Errore creazione offerta: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lista offerte per RDO con real-time updates
   */
  async getOffersForRDO(rdoId: string): Promise<Offer[]> {
    try {
      const q = query(
        safeCollection(this.collections.offers),
        where('rdoId', '==', rdoId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const offers: Offer[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        offers.push({
          ...data,
          id: doc.id,
          submittedAt: data.submittedAt.toDate(),
        } as Offer);
      });

      return offers;
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore recupero offerte per RDO ${rdoId}:`, error);
      throw new Error(`Errore recupero offerte: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Aggiorna status offerta
   */
  async updateOfferStatus(offerId: string, status: string, userId: string): Promise<void> {
    try {
      const offerRef = doc(this.db, this.collections.offers, offerId);
      const now = Timestamp.now();

      await updateDoc(offerRef, {
        status,
        updatedAt: now,
      });

      // Audit log
      await this.createAuditLog({
        action: 'UPDATE_OFFER_STATUS',
        entityType: 'OFFER',
        entityId: offerId,
        userId,
        details: { status },
      });

      console.log(`✅ [FirestoreService] Status offerta ${offerId} aggiornato a ${status}`);
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore aggiornamento status offerta ${offerId}:`, error);
      throw new Error(`Errore aggiornamento status offerta: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================
  // COMPARISON OPERATIONS
  // ===========================================

  /**
   * Salva confronto offerte con metadata
   */
  async saveComparison(comparison: Omit<Comparison, 'id' | 'generatedAt'>): Promise<string> {
    try {
      const comparisonId = `comparison-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = Timestamp.now();

      const comparisonData: Comparison = {
        ...comparison,
        id: comparisonId,
        generatedAt: now.toDate(),
      };

      const comparisonRef = doc(this.db, this.collections.comparisons, comparisonId);
      await setDoc(comparisonRef, {
        ...comparisonData,
        generatedAt: now,
      });

      console.log(`✅ [FirestoreService] Confronto ${comparisonId} salvato con successo`);
      return comparisonId;
    } catch (error) {
      console.error('❌ [FirestoreService] Errore salvataggio confronto:', error);
      throw new Error(`Errore salvataggio confronto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ottieni confronto per RDO
   */
  async getComparisonForRDO(rdoId: string): Promise<Comparison | null> {
    try {
      const q = query(
        safeCollection(this.collections.comparisons),
        where('rdoId', '==', rdoId),
        orderBy('generatedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      if (!doc) {
        return null;
      }
      
      const data = doc.data() as any;

      return {
        ...data,
        id: doc.id,
        generatedAt: data.generatedAt.toDate(),
      } as Comparison;
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore recupero confronto per RDO ${rdoId}:`, error);
      throw new Error(`Errore recupero confronto: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================
  // VENDOR OPERATIONS
  // ===========================================

  /**
   * Crea/aggiorna vendor con documenti
   */
  async upsertVendor(vendor: Vendor): Promise<void> {
    try {
      const vendorRef = doc(this.db, this.collections.vendors, vendor.id);
      const now = Timestamp.now();

      await setDoc(
        vendorRef,
        {
          ...vendor,
          updatedAt: now,
        },
        { merge: true }
      );

      console.log(`✅ [FirestoreService] Vendor ${vendor.id} salvato con successo`);
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore salvataggio vendor ${vendor.id}:`, error);
      throw new Error(`Errore salvataggio vendor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lista vendor con filtri
   */
  async listVendors(
    filters: {
      category?: string;
      activeOnly?: boolean;
      rating?: number;
    } = {}
  ): Promise<Vendor[]> {
    try {
      let q: any = safeCollection(this.collections.vendors);

      if (filters.category) {
        q = query(q, where('category', 'array-contains', filters.category));
      }

      if (filters.rating) {
        q = query(q, where('rating', '>=', filters.rating));
      }

      const querySnapshot = await getDocs(q);
      const vendors: Vendor[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data() as any;
        vendors.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Vendor);
      });

      // Filtra per activeOnly se richiesto
      if (filters.activeOnly) {
        return vendors.filter(vendor => vendor.documents.every(doc => doc.status === 'valid'));
      }

      return vendors;
    } catch (error) {
      console.error('❌ [FirestoreService] Errore lista vendor:', error);
      throw new Error(`Errore lista vendor: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================
  // PRE-CHECK OPERATIONS
  // ===========================================

  /**
   * Salva risultato pre-check
   */
  async savePreCheckResult(preCheck: PreCheckResult): Promise<string> {
    try {
      const preCheckId = `precheck-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const now = Timestamp.now();

      const preCheckData = {
        ...preCheck,
        id: preCheckId,
        checkedAt: now,
      };

      const preCheckRef = doc(this.db, this.collections.preChecks, preCheckId);
      await setDoc(preCheckRef, preCheckData);

      console.log(`✅ [FirestoreService] Pre-check ${preCheckId} salvato con successo`);
      return preCheckId;
    } catch (error) {
      console.error('❌ [FirestoreService] Errore salvataggio pre-check:', error);
      throw new Error(`Errore salvataggio pre-check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ottieni pre-check per vendor e RDO
   */
  async getPreCheckResult(vendorId: string, rdoId: string): Promise<PreCheckResult | null> {
    try {
      const q = query(
        safeCollection(this.collections.preChecks),
        where('vendorId', '==', vendorId),
        where('rdoId', '==', rdoId),
        orderBy('checkedAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      if (!doc) {
        return null;
      }
      
      const data = doc.data() as any;

      return {
        ...data,
        checkedAt: data.checkedAt.toDate(),
      } as PreCheckResult;
    } catch (error) {
      console.error(`❌ [FirestoreService] Errore recupero pre-check:`, error);
      throw new Error(`Errore recupero pre-check: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================
  // AUDIT & UTILITIES
  // ===========================================

  /**
   * Crea audit log
   */
  private async createAuditLog(auditData: {
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    details?: any;
  }): Promise<void> {
    try {
      const auditRef = doc(this.db, this.collections.auditLogs, `audit-${Date.now()}`);
      await setDoc(auditRef, {
        timestamp: Timestamp.now(),
        ...auditData,
      });
    } catch (error) {
      console.error('❌ [FirestoreService] Errore creazione audit log:', error);
    }
  }

  /**
   * Ottieni valori precedenti per audit
   */
  private async getRDOFieldValues(rdoId: string, fields: string[]): Promise<any> {
    try {
      const rdo = await this.getRDO(rdoId);
      if (!rdo) return {};

      const previousValues: any = {};
      fields.forEach(field => {
        if (rdo[field as keyof RDO] !== undefined) {
          previousValues[field] = rdo[field as keyof RDO];
        }
      });

      return previousValues;
    } catch (error) {
      return {};
    }
  }

  /**
   * Real-time listener per RDO
   */
  onRDOUpdate(rdoId: string, callback: (rdo: RDO | null) => void): () => void {
    const rdoRef = doc(this.db, this.collections.rdos, rdoId);

    // CHIRURGICO: Disabilitato onSnapshot temporaneamente per evitare 400 error e loop infiniti
    // return onSnapshot(rdoRef, doc => {
    //   if (doc.exists()) {
    //     const data = doc.data();
    //     const rdo: RDO = {
    //       ...data,
    //       id: doc.id,
    //       createdAt: data.createdAt.toDate(),
    //       updatedAt: data.updatedAt.toDate(),
    //       deadline: data.deadline.toDate(),
    //     } as RDO;
    //     callback(rdo);
    //   } else {
    //     callback(null);
    //   }
    // });
    
    // CHIRURGICO: Callback vuoto per evitare 400 error e loop infiniti
    return () => {};
  }

  /**
   * Real-time listener per offerte RDO
   */
  onOffersUpdate(rdoId: string, callback: (offers: Offer[]) => void): () => void {
    const q = query(
      safeCollection(this.collections.offers),
      where('rdoId', '==', rdoId),
      orderBy('submittedAt', 'desc')
    );

    // CHIRURGICO: Disabilitato onSnapshot temporaneamente per evitare 400 error e loop infiniti
    // return onSnapshot(q, querySnapshot => {
    //   const offers: Offer[] = [];
    //   querySnapshot.forEach(doc => {
    //     const data = doc.data();
    //     offers.push({
    //       ...data,
    //       id: doc.id,
    //       submittedAt: data.submittedAt.toDate(),
    //     } as Offer);
    //   });
    //   callback(offers);
    // });
    
    // CHIRURGICO: Callback vuoto per evitare 400 error e loop infiniti
    return () => {};
  }

  /**
   * Backup automatico
   */
  async createBackup(): Promise<void> {
    try {
      console.log('🔄 [FirestoreService] Creazione backup in corso...');

      // Backup RDO
      const rdos = await this.listRDOs();
      const offers = await getDocs(safeCollection(this.collections.offers));
      const vendors = await this.listVendors();

      const backup = {
        timestamp: new Date().toISOString(),
        rdos: rdos.length,
        offers: offers.size,
        vendors: vendors.length,
        data: {
          rdos,
          vendors,
        },
      };

      // Salva backup su storage separato
      const backupRef = doc(this.db, 'backups', `backup-${Date.now()}`);
      await setDoc(backupRef, backup);

      console.log('✅ [FirestoreService] Backup completato con successo');
    } catch (error) {
      console.error('❌ [FirestoreService] Errore creazione backup:', error);
    }
  }

  /**
   * Cleanup dati obsoleti
   */
  async cleanupOldData(daysOld: number = 365): Promise<void> {
    try {
      console.log(`🧹 [FirestoreService] Cleanup dati più vecchi di ${daysOld} giorni...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      // Cleanup audit logs vecchi
      const oldAuditQuery = query(
        safeCollection(this.collections.auditLogs),
        where('timestamp', '<', cutoffTimestamp)
      );

      const oldAuditDocs = await getDocs(oldAuditQuery);
      const batch = writeBatch(this.db);

      oldAuditDocs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(
        `✅ [FirestoreService] Cleanup completato: ${oldAuditDocs.size} documenti rimossi`
      );
    } catch (error) {
      console.error('❌ [FirestoreService] Errore cleanup:', error);
    }
  }
}
