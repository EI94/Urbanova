'use strict';
// Servizio Robusto per Eliminazione Progetti - Urbanova AI
// Risolve definitivamente i problemi di sincronizzazione tra frontend e backend
Object.defineProperty(exports, '__esModule', { value: true });
exports.robustProjectDeletionService = exports.RobustProjectDeletionService = void 0;
const firestore_1 = require('firebase/firestore');
const firebase_1 = require('./firebase');
class RobustProjectDeletionService {
  constructor() {
    this.COLLECTION = 'feasibilityProjects';
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 1000; // 1 secondo
  }
  /**
   * ELIMINAZIONE ROBUSTA E SINCRONIZZATA
   * 1. Elimina dal backend
   * 2. Verifica eliminazione
   * 3. Gestisce retry automatici
   * 4. Log completo per debugging
   */
  async robustDeleteProject(projectId) {
    console.log(`🗑️ ELIMINAZIONE ROBUSTA INIZIATA - Progetto: ${projectId}`);
    let attempt = 1;
    let lastError = null;
    while (attempt <= this.MAX_RETRIES) {
      try {
        console.log(
          `🔄 Tentativo ${attempt}/${this.MAX_RETRIES} - Eliminazione progetto ${projectId}`
        );
        // 1. VERIFICA ESISTENZA PROGETTO
        const projectRef = (0, firestore_1.doc)(firebase_1.db, this.COLLECTION, projectId);
        const projectSnap = await (0, firestore_1.getDoc)(projectRef);
        if (!projectSnap.exists()) {
          console.log(`⚠️ Progetto ${projectId} non esiste più - Eliminazione già completata`);
          return {
            success: true,
            projectId,
            message: 'Progetto già eliminato',
            timestamp: new Date(),
            backendVerified: true,
          };
        }
        // 2. ELIMINAZIONE BACKEND
        console.log(`🔥 Eliminazione backend per progetto ${projectId}`);
        await (0, firestore_1.deleteDoc)(projectRef);
        // 3. VERIFICA IMMEDIATA ELIMINAZIONE
        console.log(`🔍 Verifica immediata eliminazione progetto ${projectId}`);
        const verificationSnap = await (0, firestore_1.getDoc)(projectRef);
        if (verificationSnap.exists()) {
          throw new Error(`Progetto ${projectId} ancora presente dopo eliminazione`);
        }
        console.log(`✅ VERIFICA BACKEND OK - Progetto ${projectId} eliminato definitivamente`);
        // 4. VERIFICA FINALE COMPLETA
        const finalVerification = await this.verifyProjectDeletion(projectId);
        if (finalVerification) {
          console.log(`🎯 ELIMINAZIONE COMPLETATA CON SUCCESSO - Progetto ${projectId}`);
          return {
            success: true,
            projectId,
            message: 'Progetto eliminato definitivamente',
            timestamp: new Date(),
            backendVerified: true,
          };
        } else {
          throw new Error(`Verifica finale fallita per progetto ${projectId}`);
        }
      } catch (error) {
        lastError = error;
        console.error(`❌ Tentativo ${attempt} fallito per progetto ${projectId}:`, error);
        if (attempt < this.MAX_RETRIES) {
          console.log(`⏳ Attendo ${this.RETRY_DELAY}ms prima del retry...`);
          await this.delay(this.RETRY_DELAY);
          attempt++;
        } else {
          console.error(`💥 TUTTI I TENTATIVI FALLITI per progetto ${projectId}`);
          break;
        }
      }
    }
    // Tutti i tentativi falliti
    console.error(`💀 ELIMINAZIONE DEFINITIVAMENTE FALLITA per progetto ${projectId}`);
    return {
      success: false,
      projectId,
      message: `Eliminazione fallita dopo ${this.MAX_RETRIES} tentativi: ${lastError?.message}`,
      timestamp: new Date(),
      backendVerified: false,
    };
  }
  /**
   * VERIFICA COMPLETA ELIMINAZIONE
   * Controlla che il progetto non sia presente in nessuna query
   */
  async verifyProjectDeletion(projectId) {
    try {
      console.log(`🔍 VERIFICA COMPLETA eliminazione progetto ${projectId}`);
      // Verifica 1: Documento singolo
      const projectRef = (0, firestore_1.doc)(firebase_1.db, this.COLLECTION, projectId);
      const projectSnap = await (0, firestore_1.getDoc)(projectRef);
      if (projectSnap.exists()) {
        console.log(`❌ VERIFICA 1 FALLITA - Progetto ${projectId} ancora presente`);
        return false;
      }
      // Verifica 2: Query collezione completa
      const allProjectsQuery = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, this.COLLECTION),
        (0, firestore_1.orderBy)('createdAt', 'desc')
      );
      const allProjectsSnap = await (0, firestore_1.getDocs)(allProjectsQuery);
      const projectStillExists = allProjectsSnap.docs.some(doc => doc.id === projectId);
      if (projectStillExists) {
        console.log(`❌ VERIFICA 2 FALLITA - Progetto ${projectId} presente nella query completa`);
        return false;
      }
      // Verifica 3: Query per utente specifico (se applicabile)
      try {
        const userProjectsQuery = (0, firestore_1.query)(
          (0, firestore_1.collection)(firebase_1.db, this.COLLECTION),
          (0, firestore_1.where)('createdBy', '==', 'test-user'), // Placeholder
          (0, firestore_1.orderBy)('createdAt', 'desc')
        );
        const userProjectsSnap = await (0, firestore_1.getDocs)(userProjectsQuery);
        const projectInUserQuery = userProjectsSnap.docs.some(doc => doc.id === projectId);
        if (projectInUserQuery) {
          console.log(`❌ VERIFICA 3 FALLITA - Progetto ${projectId} presente nella query utente`);
          return false;
        }
      } catch (queryError) {
        // Ignora errori di query (potrebbe non avere indici)
        console.log(`ℹ️ Verifica 3 saltata (query non supportata)`);
      }
      console.log(`✅ VERIFICA COMPLETA OK - Progetto ${projectId} eliminato da tutte le query`);
      return true;
    } catch (error) {
      console.error(`❌ Errore verifica eliminazione progetto ${projectId}:`, error);
      return false;
    }
  }
  /**
   * ELIMINAZIONE MULTIPLA ROBUSTA
   * Per pulizia database completa
   */
  async robustDeleteMultipleProjects(projectIds) {
    console.log(`🗑️ ELIMINAZIONE MULTIPLA ROBUSTA - ${projectIds.length} progetti`);
    const results = [];
    for (const projectId of projectIds) {
      console.log(`\n🔄 Elaborazione progetto ${projectId}`);
      const result = await this.robustDeleteProject(projectId);
      results.push(result);
      // Pausa tra eliminazioni per evitare sovraccarico
      if (projectIds.indexOf(projectId) < projectIds.length - 1) {
        await this.delay(500);
      }
    }
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    console.log(`\n📊 RISULTATO ELIMINAZIONE MULTIPLA:`);
    console.log(`✅ Successi: ${successCount}`);
    console.log(`❌ Fallimenti: ${failureCount}`);
    console.log(`📋 Totale: ${results.length}`);
    return results;
  }
  /**
   * PULIZIA COMPLETA DATABASE
   * Elimina tutti i progetti per reset completo
   */
  async completeDatabaseCleanup() {
    console.log(`🧹 PULIZIA COMPLETA DATABASE INIZIATA`);
    try {
      // 1. Recupera tutti i progetti
      const allProjectsQuery = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, this.COLLECTION),
        (0, firestore_1.orderBy)('createdAt', 'desc')
      );
      const allProjectsSnap = await (0, firestore_1.getDocs)(allProjectsQuery);
      if (allProjectsSnap.empty) {
        console.log(`ℹ️ Database già vuoto - Nessun progetto da eliminare`);
        return {
          success: true,
          projectId: 'ALL',
          message: 'Database già vuoto',
          timestamp: new Date(),
          backendVerified: true,
        };
      }
      const projectIds = allProjectsSnap.docs.map(doc => doc.id);
      console.log(`📋 Trovati ${projectIds.length} progetti da eliminare`);
      // 2. Eliminazione multipla robusta
      const results = await this.robustDeleteMultipleProjects(projectIds);
      // 3. Verifica finale
      const finalVerification = await this.verifyDatabaseEmpty();
      if (finalVerification) {
        console.log(`🎯 PULIZIA COMPLETA COMPLETATA CON SUCCESSO`);
        return {
          success: true,
          projectId: 'ALL',
          message: `Database pulito - ${projectIds.length} progetti eliminati`,
          timestamp: new Date(),
          backendVerified: true,
        };
      } else {
        throw new Error('Verifica finale database vuoto fallita');
      }
    } catch (error) {
      console.error(`💥 ERRORE PULIZIA COMPLETA DATABASE:`, error);
      return {
        success: false,
        projectId: 'ALL',
        message: `Errore pulizia database: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        timestamp: new Date(),
        backendVerified: false,
      };
    }
  }
  /**
   * VERIFICA DATABASE VUOTO
   */
  async verifyDatabaseEmpty() {
    try {
      const allProjectsQuery = (0, firestore_1.query)(
        (0, firestore_1.collection)(firebase_1.db, this.COLLECTION),
        (0, firestore_1.orderBy)('createdAt', 'desc')
      );
      const allProjectsSnap = await (0, firestore_1.getDocs)(allProjectsQuery);
      const isEmpty = allProjectsSnap.empty;
      console.log(
        `🔍 Verifica database vuoto: ${isEmpty ? 'SI' : 'NO'} (${allProjectsSnap.size} progetti)`
      );
      return isEmpty;
    } catch (error) {
      console.error(`❌ Errore verifica database vuoto:`, error);
      return false;
    }
  }
  /**
   * UTILITY: DELAY ASINCRONO
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * STATO SERVIZIO
   */
  getServiceStatus() {
    return {
      name: 'RobustProjectDeletionService',
      version: '1.0.0',
      status: 'ACTIVE',
    };
  }
}
exports.RobustProjectDeletionService = RobustProjectDeletionService;
exports.robustProjectDeletionService = new RobustProjectDeletionService();
//# sourceMappingURL=robustProjectDeletionService.js.map
