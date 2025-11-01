import {addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
  runTransaction } from 'firebase/firestore';

import { db } from './firebase';


export interface TestProject {
  name: string;
  address: string;
  status: 'PIANIFICAZIONE';
  startDate: Date;
  constructionStartDate: Date;
  duration: number;
  targetMargin: number;
  totalArea: number;
  costs: {
    land: {
      purchasePrice: number;
      purchaseTaxes: number;
      intermediationFees: number;
      subtotal: number;
    };
    construction: {
      excavation: number;
      structures: number;
      systems: number;
      finishes: number;
      subtotal: number;
    };
    externalWorks: number;
    concessionFees: number;
    design: number;
    bankCharges: number;
    exchange: number;
    insurance: number;
    total: number;
  };
  revenues: {
    units: number;
    averageArea: number;
    pricePerSqm: number;
    revenuePerUnit: number;
    totalSales: number;
    otherRevenues: number;
    total: number;
  };
  results: {
    profit: number;
    margin: number;
    roi: number;
    paybackPeriod: number;
  };
  isTargetAchieved: boolean;
  createdBy: string;
  notes: string;
}

export class FeasibilityTestService {
  private static instance: FeasibilityTestService;
  private readonly COLLECTION = 'feasibilityProjects';

  private constructor() {}

  public static getInstance(): FeasibilityTestService {
    if (!FeasibilityTestService.instance) {
      FeasibilityTestService.instance = new FeasibilityTestService();
    }
    return FeasibilityTestService.instance;
  }

  // Test 1: Creazione semplice
  async testSimpleCreation(): Promise<{
    success: boolean;
    projectId?: string;
    error?: string;
    method: string;
  }> {
    try {
      console.log('🧪 Test 1: Creazione semplice progetto...');

      const testProject: TestProject = {
        name: 'Test Progetto Semplice',
        address: 'Via Test 123, Roma',
        status: 'PIANIFICAZIONE',
        startDate: new Date(),
        constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        duration: 18,
        targetMargin: 30,
        totalArea: 500,
        costs: {
          land: {
            purchasePrice: 100000,
            purchaseTaxes: 10000,
            intermediationFees: 5000,
            subtotal: 115000,
          },
          construction: {
            excavation: 20000,
            structures: 150000,
            systems: 80000,
            finishes: 120000,
            subtotal: 370000,
          },
          externalWorks: 30000,
          concessionFees: 15000,
          design: 25000,
          bankCharges: 10000,
          exchange: 5000,
          insurance: 8000,
          total: 668000,
        },
        revenues: {
          units: 2,
          averageArea: 144,
          pricePerSqm: 1700,
          revenuePerUnit: 244800,
          totalSales: 489600,
          otherRevenues: 0,
          total: 489600,
        },
        results: {
          profit: -178400,
          margin: -36.4,
          roi: -26.7,
          paybackPeriod: 0,
        },
        isTargetAchieved: false,
        createdBy: 'test-user',
        notes: 'Progetto di test per verifica creazione',
      };

      const docRef = await addDoc(collection(db!, this.COLLECTION), {
        ...testProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Test 1 completato con successo:', docRef.id);
      return {
        success: true,
        projectId: docRef.id,
        method: 'addDoc semplice',
      };
    } catch (error: any) {
      console.error('❌ Test 1 fallito:', error);
      return {
        success: false,
        error: error.message || 'Errore sconosciuto',
        method: 'addDoc semplice',
      };
    }
  }

  // Test 2: Creazione con transazione
  async testTransactionCreation(): Promise<{
    success: boolean;
    projectId?: string;
    error?: string;
    method: string;
  }> {
    try {
      console.log('🧪 Test 2: Creazione con transazione...');

      const testProject: TestProject = {
        name: 'Test Progetto Transazione',
        address: 'Via Transazione 456, Milano',
        status: 'PIANIFICAZIONE',
        startDate: new Date(),
        constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        duration: 24,
        targetMargin: 25,
        totalArea: 800,
        costs: {
          land: {
            purchasePrice: 200000,
            purchaseTaxes: 20000,
            intermediationFees: 10000,
            subtotal: 230000,
          },
          construction: {
            excavation: 40000,
            structures: 300000,
            systems: 160000,
            finishes: 240000,
            subtotal: 740000,
          },
          externalWorks: 60000,
          concessionFees: 30000,
          design: 50000,
          bankCharges: 20000,
          exchange: 10000,
          insurance: 16000,
          total: 1196000,
        },
        revenues: {
          units: 4,
          averageArea: 200,
          pricePerSqm: 2000,
          revenuePerUnit: 400000,
          totalSales: 1600000,
          otherRevenues: 50000,
          total: 1650000,
        },
        results: {
          profit: 454000,
          margin: 27.5,
          roi: 37.9,
          paybackPeriod: 7.6,
        },
        isTargetAchieved: true,
        createdBy: 'test-user',
        notes: 'Progetto di test con transazione',
      };

      const projectId = await runTransaction(db, async transaction => {
        const docRef = doc(collection(db!, this.COLLECTION));
        transaction.set(docRef, {
          ...testProject,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return docRef.id;
      });

      console.log('✅ Test 2 completato con successo:', projectId);
      return {
        success: true,
        projectId,
        method: 'runTransaction',
      };
    } catch (error: any) {
      console.error('❌ Test 2 fallito:', error);
      return {
        success: false,
        error: error.message || 'Errore sconosciuto',
        method: 'runTransaction',
      };
    }
  }

  // Test 3: Creazione con batch
  async testBatchCreation(): Promise<{
    success: boolean;
    projectId?: string;
    error?: string;
    method: string;
  }> {
    try {
      console.log('🧪 Test 3: Creazione con batch...');

      const testProject: TestProject = {
        name: 'Test Progetto Batch',
        address: 'Via Batch 789, Napoli',
        status: 'PIANIFICAZIONE',
        startDate: new Date(),
        constructionStartDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        duration: 12,
        targetMargin: 35,
        totalArea: 300,
        costs: {
          land: {
            purchasePrice: 80000,
            purchaseTaxes: 8000,
            intermediationFees: 4000,
            subtotal: 92000,
          },
          construction: {
            excavation: 15000,
            structures: 120000,
            systems: 60000,
            finishes: 90000,
            subtotal: 285000,
          },
          externalWorks: 20000,
          concessionFees: 10000,
          design: 20000,
          bankCharges: 8000,
          exchange: 4000,
          insurance: 6000,
          total: 445000,
        },
        revenues: {
          units: 1,
          averageArea: 300,
          pricePerSqm: 1800,
          revenuePerUnit: 540000,
          totalSales: 540000,
          otherRevenues: 10000,
          total: 550000,
        },
        results: {
          profit: 105000,
          margin: 19.1,
          roi: 23.6,
          paybackPeriod: 6.1,
        },
        isTargetAchieved: false,
        createdBy: 'test-user',
        notes: 'Progetto di test con batch',
      };

      const batch = writeBatch(db);
      const docRef = doc(collection(db!, this.COLLECTION));

      batch.set(docRef, {
        ...testProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      console.log('✅ Test 3 completato con successo:', docRef.id);
      return {
        success: true,
        projectId: docRef.id,
        method: 'writeBatch',
      };
    } catch (error: any) {
      console.error('❌ Test 3 fallito:', error);
      return {
        success: false,
        error: error.message || 'Errore sconosciuto',
        method: 'writeBatch',
      };
    }
  }

  // Test completo di tutti i metodi
  async runAllTests(): Promise<{
    timestamp: Date;
    results: Array<{
      method: string;
      success: boolean;
      projectId?: string;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      recommendations: string[];
    };
  }> {
    console.log('🧪 Avvio test completi per progetti fattibilità...');

    const timestamp = new Date();
    const results = [
      await this.testSimpleCreation(),
      await this.testTransactionCreation(),
      await this.testBatchCreation(),
    ];

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    const recommendations: string[] = [];

    if (successful === 0) {
      recommendations.push('❌ Tutti i metodi di creazione sono falliti');
      recommendations.push('🔍 Verificare configurazione Firebase e regole di sicurezza');
      recommendations.push('🌐 Controllare connessione internet e stato progetto Firebase');
    } else if (successful < results.length) {
      recommendations.push(`⚠️ Solo ${successful}/${results.length} metodi funzionano`);
      recommendations.push('🔧 Usare il metodo che funziona come fallback');
    } else {
      recommendations.push('✅ Tutti i metodi di creazione funzionano correttamente');
    }

    if (failed > 0) {
      const failedMethods = results.filter(r => !r.success).map(r => r.method);
      recommendations.push(`❌ Metodi falliti: ${failedMethods.join(', ')}`);
    }

    const summary = {
      total: results.length,
      successful,
      failed,
      recommendations,
    };

    console.log('🧪 Test completi terminati:', summary);
    return {
      timestamp,
      results,
      summary,
    };
  }

  // Pulisci i progetti di test
  async cleanupTestProjects(): Promise<void> {
    try {
      console.log('🧹 Pulizia progetti di test...');

      const q = collection(db!, this.COLLECTION);
      const snapshot = await getDocs(q);

      const testProjects = snapshot.docs.filter(doc =>
        doc.data().notes?.includes('Progetto di test')
      );

      console.log(`🧹 Trovati ${testProjects.length} progetti di test da eliminare`);

      // Per ora non li eliminiamo per debug
      // const deletePromises = testProjects.map(doc => deleteDoc(doc.ref));
      // await Promise.all(deletePromises);

      console.log('🧹 Pulizia progetti di test completata (mantenuti per debug)');
    } catch (error) {
      console.error('❌ Errore durante pulizia progetti di test:', error);
    }
  }
}

export const feasibilityTestService = FeasibilityTestService.getInstance();
