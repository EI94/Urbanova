import { Firestore, collection } from 'firebase/firestore';
import { db as firebaseDb } from '@/lib/firebase';

// 🛡️ OS PROTECTION - Carica solo lato client per evitare TDZ
if (typeof window !== 'undefined') {
  import('@/lib/osProtection').catch(() => {});
}

/**
 * Helper PULITO per creare collection reference
 * USA l'istanza Firebase REALE direttamente, senza workaround
 * 
 * @deprecated Usa direttamente `import { db } from '@/lib/firebase'` e `collection(db!, 'name')`
 */
export function safeCollection(collectionName: string) {
  // Controllo client-side
  if (typeof window === 'undefined') {
    throw new Error(`Firebase non disponibile lato server per collezione: ${collectionName}`);
  }
  
  // firebaseDb è null su server, istanza reale Firestore su client
  if (!firebaseDb) {
    throw new Error(`Firebase Firestore non inizializzato per collezione: ${collectionName}`);
  }
  
  try {
    return collection(firebaseDb, collectionName);
  } catch (error: any) {
    console.error(`❌ [safeCollection] Errore collection(${collectionName}):`, error);
    throw error;
  }
}

/**
 * Verifica che Firebase sia completamente inizializzato
 */
export function isFirebaseReady(): boolean {
  return typeof window !== 'undefined' && !!firebaseDb;
}

/**
 * Attende che Firebase sia inizializzato (con timeout)
 */
export function waitForFirebase(timeoutMs: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isFirebaseReady()) {
      resolve();
      return;
    }
    
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isFirebaseReady()) {
        clearInterval(checkInterval);
        resolve();
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        reject(new Error('Timeout inizializzazione Firebase'));
      }
    }, 100);
  });
}
