// Servizio di debug per testare il salvataggio delle analisi di fattibilità
import { db } from './firebase';
import { addDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

export interface DebugFeasibilityProject {
  id?: string;
  name: string;
  address: string;
  status: 'PIANIFICAZIONE' | 'IN_CORSO' | 'COMPLETATO' | 'SOSPESO';
  totalArea: number;
  targetMargin: number;
  createdBy: string;
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
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export class FeasibilityDebugService {
  private readonly COLLECTION = 'feasibilityProjects';

  // Test di connessione Firebase
  async testFirebaseConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔍 [FEASIBILITY DEBUG] Test connessione Firebase...');
      
      // Prova a leggere la collezione
      const testQuery = query(
        collection(db, this.COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(testQuery);
      console.log('✅ [FEASIBILITY DEBUG] Connessione Firebase OK, documenti trovati:', snapshot.size);
      
      return { success: true };
    } catch (error) {
      console.error('❌ [FEASIBILITY DEBUG] Errore connessione Firebase:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      };
    }
  }

  // Test salvataggio progetto semplice
  async testSimpleSave(): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      console.log('🔍 [FEASIBILITY DEBUG] Test salvataggio semplice...');
      
      const testProject: Omit<DebugFeasibilityProject, 'id'> = {
        name: `Test Debug ${new Date().toISOString()}`,
        address: 'Via Test Debug 123, Milano',
        status: 'PIANIFICAZIONE',
        totalArea: 100,
        targetMargin: 25,
        createdBy: 'debug-user',
        costs: {
          land: {
            purchasePrice: 100000,
            purchaseTaxes: 5000,
            intermediationFees: 2000,
            subtotal: 107000,
          },
          construction: {
            excavation: 10000,
            structures: 50000,
            systems: 20000,
            finishes: 30000,
            subtotal: 110000,
          },
          externalWorks: 5000,
          concessionFees: 2000,
          design: 3000,
          bankCharges: 1000,
          exchange: 0,
          insurance: 1000,
          total: 228000,
        },
        revenues: {
          units: 1,
          averageArea: 100,
          pricePerSqm: 3000,
          revenuePerUnit: 300000,
          totalSales: 300000,
          otherRevenues: 0,
          total: 300000,
        },
        results: {
          profit: 72000,
          margin: 24,
          roi: 31.6,
          paybackPeriod: 38,
        },
        isTargetAchieved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: 'Progetto di test per debug salvataggio'
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), testProject);
      console.log('✅ [FEASIBILITY DEBUG] Progetto test salvato con ID:', docRef.id);
      
      return { success: true, projectId: docRef.id };
    } catch (error) {
      console.error('❌ [FEASIBILITY DEBUG] Errore salvataggio test:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      };
    }
  }

  // Test salvataggio con dati reali dalla UI
  async testRealDataSave(projectData: any): Promise<{ success: boolean; projectId?: string; error?: string }> {
    try {
      console.log('🔍 [FEASIBILITY DEBUG] Test salvataggio dati reali...');
      console.log('🔍 [FEASIBILITY DEBUG] Dati progetto ricevuti:', {
        name: projectData.name,
        address: projectData.address,
        hasCosts: !!projectData.costs,
        hasRevenues: !!projectData.revenues,
        hasResults: !!projectData.results,
        createdBy: projectData.createdBy
      });

      // Validazione dati
      if (!projectData.name || !projectData.address) {
        throw new Error('Nome e indirizzo sono obbligatori');
      }

      if (!projectData.createdBy) {
        throw new Error('Utente non autenticato');
      }

      const project: Omit<DebugFeasibilityProject, 'id'> = {
        name: projectData.name,
        address: projectData.address,
        status: projectData.status || 'PIANIFICAZIONE',
        totalArea: projectData.totalArea || 0,
        targetMargin: projectData.targetMargin || 30,
        createdBy: projectData.createdBy,
        costs: projectData.costs || {
          land: { purchasePrice: 0, purchaseTaxes: 0, intermediationFees: 0, subtotal: 0 },
          construction: { excavation: 0, structures: 0, systems: 0, finishes: 0, subtotal: 0 },
          externalWorks: 0, concessionFees: 0, design: 0, bankCharges: 0, exchange: 0, insurance: 0, total: 0
        },
        revenues: projectData.revenues || {
          units: 0, averageArea: 0, pricePerSqm: 0, revenuePerUnit: 0, totalSales: 0, otherRevenues: 0, total: 0
        },
        results: projectData.results || {
          profit: 0, margin: 0, roi: 0, paybackPeriod: 0
        },
        isTargetAchieved: projectData.isTargetAchieved || false,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: projectData.notes || ''
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), project);
      console.log('✅ [FEASIBILITY DEBUG] Progetto dati reali salvato con ID:', docRef.id);
      
      return { success: true, projectId: docRef.id };
    } catch (error) {
      console.error('❌ [FEASIBILITY DEBUG] Errore salvataggio dati reali:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Errore sconosciuto' 
      };
    }
  }

  // Verifica progetti esistenti
  async checkExistingProjects(): Promise<{ count: number; projects: any[] }> {
    try {
      console.log('🔍 [FEASIBILITY DEBUG] Verifica progetti esistenti...');
      
      const querySnapshot = await getDocs(collection(db, this.COLLECTION));
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ [FEASIBILITY DEBUG] Trovati ${projects.length} progetti esistenti`);
      
      return { count: projects.length, projects };
    } catch (error) {
      console.error('❌ [FEASIBILITY DEBUG] Errore verifica progetti:', error);
      return { count: 0, projects: [] };
    }
  }

  // Test completo del sistema
  async runFullTest(): Promise<{
    firebaseConnection: { success: boolean; error?: string };
    simpleSave: { success: boolean; projectId?: string; error?: string };
    existingProjects: { count: number; projects: any[] };
  }> {
    console.log('🚀 [FEASIBILITY DEBUG] Avvio test completo sistema...');
    
    const firebaseConnection = await this.testFirebaseConnection();
    const simpleSave = await this.testSimpleSave();
    const existingProjects = await this.checkExistingProjects();

    console.log('📊 [FEASIBILITY DEBUG] Risultati test completo:', {
      firebaseConnection: firebaseConnection.success ? 'OK' : 'FAILED',
      simpleSave: simpleSave.success ? 'OK' : 'FAILED',
      existingProjects: existingProjects.count
    });

    return {
      firebaseConnection,
      simpleSave,
      existingProjects
    };
  }
}

export const feasibilityDebugService = new FeasibilityDebugService();
