import { db, auth } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

export class FirebaseDebugService {
  private static instance: FirebaseDebugService;

  private constructor() {}

  public static getInstance(): FirebaseDebugService {
    if (!FirebaseDebugService.instance) {
      FirebaseDebugService.instance = new FirebaseDebugService();
    }
    return FirebaseDebugService.instance;
  }

  // Test connessione Firestore
  async testFirestoreConnection(): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Test connessione Firestore...');
      
      // Test 1: Lettura collezione
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      console.log('✅ Test lettura collezione OK');
      
      // Test 2: Scrittura documento
      const testDoc = await addDoc(collection(db, 'test'), {
        test: true,
        timestamp: serverTimestamp(),
        message: 'Test connessione Firestore'
      });
      console.log('✅ Test scrittura documento OK:', testDoc.id);
      
      // Test 3: Lettura documento
      const readDoc = await getDoc(doc(db, 'test', testDoc.id));
      if (readDoc.exists()) {
        console.log('✅ Test lettura documento OK');
      } else {
        throw new Error('Documento non trovato dopo scrittura');
      }
      
      return {
        success: true,
        details: {
          testDocId: testDoc.id,
          collections: ['test'],
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      console.error('❌ Test connessione Firestore fallito:', error);
      return {
        success: false,
        error: error.message || 'Errore sconosciuto',
        details: {
          code: error.code,
          stack: error.stack,
          timestamp: new Date()
        }
      };
    }
  }

  // Test autenticazione Firebase
  async testAuthConnection(): Promise<{
    success: boolean;
    error?: string;
    user?: User | null;
    details?: any;
  }> {
    try {
      console.log('🔍 Test connessione Auth...');
      
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          
          if (user) {
            console.log('✅ Test Auth OK - Utente autenticato:', user.email);
            resolve({
              success: true,
              user,
              details: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                timestamp: new Date()
              }
            });
          } else {
            console.log('✅ Test Auth OK - Nessun utente autenticato');
            resolve({
              success: true,
              user: null,
              details: {
                timestamp: new Date()
              }
            });
          }
        });
        
        // Timeout dopo 5 secondi
        setTimeout(() => {
          unsubscribe();
          resolve({
            success: false,
            error: 'Timeout connessione Auth',
            details: {
              timestamp: new Date()
            }
          });
        }, 5000);
      });
    } catch (error: any) {
      console.error('❌ Test Auth fallito:', error);
      return {
        success: false,
        error: error.message || 'Errore sconosciuto',
        details: {
          code: error.code,
          stack: error.stack,
          timestamp: new Date()
        }
      };
    }
  }

  // Test completo Firebase
  async runFullDiagnostic(): Promise<{
    timestamp: Date;
    firestore: any;
    auth: any;
    overall: 'success' | 'partial' | 'failed';
    recommendations: string[];
  }> {
    console.log('🔍 Avvio diagnostica completa Firebase...');
    
    const timestamp = new Date();
    const results = {
      timestamp,
      firestore: await this.testFirestoreConnection(),
      auth: await this.testAuthConnection(),
      overall: 'success' as 'success' | 'partial' | 'failed',
      recommendations: [] as string[]
    };
    
    // Determina risultato complessivo
    if (results.firestore.success && results.auth.success) {
      results.overall = 'success';
      results.recommendations.push('Tutte le connessioni Firebase funzionano correttamente');
    } else if (results.firestore.success || results.auth.success) {
      results.overall = 'partial';
      results.recommendations.push('Alcune connessioni Firebase hanno problemi');
    } else {
      results.overall = 'failed';
      results.recommendations.push('Tutte le connessioni Firebase hanno problemi');
    }
    
    // Aggiungi raccomandazioni specifiche
    if (!results.firestore.success) {
      results.recommendations.push('Verificare configurazione Firestore e regole di sicurezza');
      results.recommendations.push('Controllare che il progetto Firebase sia attivo');
    }
    
    if (!results.auth.success) {
      results.recommendations.push('Verificare configurazione Auth e dominio autorizzato');
      results.recommendations.push('Controllare che Auth sia abilitato nel progetto Firebase');
    }
    
    // Aggiungi raccomandazioni generali
    results.recommendations.push('Verificare variabili d\'ambiente Firebase');
    results.recommendations.push('Controllare console Firebase per errori');
    results.recommendations.push('Verificare regole di sicurezza Firestore e Storage');
    
    console.log('🔍 Diagnostica completata:', results);
    return results;
  }

  // Test specifico per progetti fattibilità
  async testFeasibilityProjectCreation(): Promise<{
    success: boolean;
    error?: string;
    projectId?: string;
    details?: any;
  }> {
    try {
      console.log('🔍 Test creazione progetto fattibilità...');
      
      const testProject = {
        name: 'Test Progetto Fattibilità',
        address: 'Via Test 123, Roma',
        status: 'PIANIFICAZIONE' as const,
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
            subtotal: 115000
          },
          construction: {
            excavation: 20000,
            structures: 150000,
            systems: 80000,
            finishes: 120000,
            subtotal: 370000
          },
          externalWorks: 30000,
          concessionFees: 15000,
          design: 25000,
          bankCharges: 10000,
          exchange: 5000,
          insurance: 8000,
          total: 668000
        },
        revenues: {
          units: 2,
          averageArea: 144,
          pricePerSqm: 1700,
          revenuePerUnit: 244800,
          totalSales: 489600,
          otherRevenues: 0,
          total: 489600
        },
        results: {
          profit: -178400,
          margin: -36.4,
          roi: -26.7,
          paybackPeriod: 0
        },
        isTargetAchieved: false,
        createdBy: 'test-user',
        notes: 'Progetto di test per diagnostica'
      };
      
      const docRef = await addDoc(collection(db, 'feasibilityProjects'), {
        ...testProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Test creazione progetto fattibilità OK:', docRef.id);
      
      // Pulisci il documento di test
      setTimeout(async () => {
        try {
          await getDoc(doc(db, 'feasibilityProjects', docRef.id));
          console.log('🧹 Documento di test mantenuto per debug');
        } catch (error) {
          console.log('🧹 Errore pulizia documento di test:', error);
        }
      }, 1000);
      
      return {
        success: true,
        projectId: docRef.id,
        details: {
          testProject,
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      console.error('❌ Test creazione progetto fattibilità fallito:', error);
      return {
        success: false,
        error: error.message || 'Errore sconosciuto',
        details: {
          code: error.code,
          stack: error.stack,
          timestamp: new Date()
        }
      };
    }
  }

  // Log dettagliato errori Firebase
  logFirebaseError(error: any, context: string): void {
    console.error(`❌ Firebase Error in ${context}:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error.details,
      timestamp: new Date()
    });
    
    // Log aggiuntivo per errori comuni
    if (error.code === 'permission-denied') {
      console.error('🔒 Errore permessi - Verificare regole di sicurezza Firestore');
    } else if (error.code === 'unavailable') {
      console.error('🌐 Errore connessione - Verificare connessione internet e stato Firebase');
    } else if (error.code === 'unauthenticated') {
      console.error('👤 Errore autenticazione - Verificare login utente');
    }
  }
}

export const firebaseDebugService = FirebaseDebugService.getInstance();
