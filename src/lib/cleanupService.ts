// Servizio di Pulizia Database - Urbanova AI
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export class CleanupService {
  private readonly COLLECTIONS_TO_CLEAN = [
    'projects',
    'users', 
    'documents',
    'meetings',
    'tasks',
    'feasibilityProjects',
    'feasibilityComparisons',
    'emailConfigs',
    'emailLogs',
    'landSearchResults'
  ];

  async cleanAllCollections(): Promise<{
    success: boolean;
    message: string;
    details: { [collection: string]: { total: number; deleted: number; errors: number } };
  }> {
    console.log('🧹 Iniziando pulizia database Firebase...');
    
    const results: { [collection: string]: { total: number; deleted: number; errors: number } } = {};
    
    try {
      for (const collectionName of this.COLLECTIONS_TO_CLEAN) {
        console.log(`📁 Pulendo collezione: ${collectionName}`);
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`✅ Collezione ${collectionName} già vuota`);
          results[collectionName] = { total: 0, deleted: 0, errors: 0 };
          continue;
        }
        
        console.log(`📊 Trovati ${snapshot.size} documenti da eliminare`);
        
        let deletedCount = 0;
        let errorCount = 0;
        
        const deletePromises = snapshot.docs.map(async (docSnapshot) => {
          try {
            await deleteDoc(doc(db, collectionName, docSnapshot.id));
            console.log(`🗑️ Eliminato documento: ${docSnapshot.id}`);
            deletedCount++;
            return true;
          } catch (error) {
            console.error(`❌ Errore eliminando ${docSnapshot.id}:`, error);
            errorCount++;
            return false;
          }
        });
        
        await Promise.all(deletePromises);
        
        results[collectionName] = {
          total: snapshot.size,
          deleted: deletedCount,
          errors: errorCount
        };
        
        console.log(`✅ Eliminati ${deletedCount}/${snapshot.size} documenti da ${collectionName}`);
      }
      
      const totalDeleted = Object.values(results).reduce((sum, r) => sum + r.deleted, 0);
      const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);
      
      console.log('🎉 Pulizia database completata!');
      
      return {
        success: true,
        message: `Pulizia completata! Eliminati ${totalDeleted} documenti${totalErrors > 0 ? `, ${totalErrors} errori` : ''}`,
        details: results
      };
      
    } catch (error) {
      console.error('❌ Errore durante la pulizia:', error);
      return {
        success: false,
        message: `Errore durante la pulizia: ${error}`,
        details: results
      };
    }
  }

  async cleanSpecificCollection(collectionName: string): Promise<{
    success: boolean;
    message: string;
    deleted: number;
    errors: number;
  }> {
    console.log(`🧹 Pulendo collezione specifica: ${collectionName}`);
    
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        return {
          success: true,
          message: `Collezione ${collectionName} già vuota`,
          deleted: 0,
          errors: 0
        };
      }
      
      let deletedCount = 0;
      let errorCount = 0;
      
      const deletePromises = snapshot.docs.map(async (docSnapshot) => {
        try {
          await deleteDoc(doc(db, collectionName, docSnapshot.id));
          deletedCount++;
          return true;
        } catch (error) {
          console.error(`❌ Errore eliminando ${docSnapshot.id}:`, error);
          errorCount++;
          return false;
        }
      });
      
      await Promise.all(deletePromises);
      
      return {
        success: true,
        message: `Eliminati ${deletedCount}/${snapshot.size} documenti da ${collectionName}`,
        deleted: deletedCount,
        errors: errorCount
      };
      
    } catch (error) {
      console.error('❌ Errore durante la pulizia:', error);
      return {
        success: false,
        message: `Errore durante la pulizia: ${error}`,
        deleted: 0,
        errors: 0
      };
    }
  }

  getCollectionsList(): string[] {
    return [...this.COLLECTIONS_TO_CLEAN];
  }

  async cleanupDatabase(collections?: string[], dryRun: boolean = false): Promise<{
    success: boolean;
    deletedCount: number;
    details: { [collection: string]: { total: number; deleted: number; errors: number } };
    message: string;
  }> {
    console.log(`🧹 Avvio pulizia database${dryRun ? ' (SIMULAZIONE)' : ''}`);
    
    const collectionsToClean = collections || this.COLLECTIONS_TO_CLEAN;
    const results: { [collection: string]: { total: number; deleted: number; errors: number } } = {};
    let totalDeleted = 0;
    
    try {
      for (const collectionName of collectionsToClean) {
        console.log(`📁 Pulendo collezione: ${collectionName}`);
        
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`✅ Collezione ${collectionName} già vuota`);
          results[collectionName] = { total: 0, deleted: 0, errors: 0 };
          continue;
        }
        
        console.log(`📊 Trovati ${snapshot.size} documenti da eliminare`);
        
        let deletedCount = 0;
        let errorCount = 0;
        
        if (!dryRun) {
          const deletePromises = snapshot.docs.map(async (docSnapshot) => {
            try {
              await deleteDoc(doc(db, collectionName, docSnapshot.id));
              deletedCount++;
              return true;
            } catch (error) {
              console.error(`❌ Errore eliminando ${docSnapshot.id}:`, error);
              errorCount++;
              return false;
            }
          });
          
          await Promise.all(deletePromises);
        } else {
          // Simulazione - conta solo i documenti
          deletedCount = snapshot.size;
        }
        
        results[collectionName] = {
          total: snapshot.size,
          deleted: deletedCount,
          errors: errorCount
        };
        
        totalDeleted += deletedCount;
        console.log(`✅ ${dryRun ? 'Simulazione' : 'Eliminati'} ${deletedCount}/${snapshot.size} documenti da ${collectionName}`);
      }
      
      const message = dryRun 
        ? `Simulazione completata! Verrebbero eliminati ${totalDeleted} documenti`
        : `Pulizia completata! Eliminati ${totalDeleted} documenti`;
      
      return {
        success: true,
        deletedCount: totalDeleted,
        details: results,
        message
      };
      
    } catch (error) {
      console.error('❌ Errore durante la pulizia:', error);
      return {
        success: false,
        deletedCount: 0,
        details: results,
        message: `Errore durante la pulizia: ${error}`
      };
    }
  }

  async getDatabaseStats(): Promise<{
    totalCollections: number;
    collections: { [name: string]: { count: number; size: string } };
    totalDocuments: number;
  }> {
    console.log('📊 Recuperando statistiche database...');
    
    const stats: { [name: string]: { count: number; size: string } } = {};
    let totalDocuments = 0;
    
    try {
      for (const collectionName of this.COLLECTIONS_TO_CLEAN) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const count = snapshot.size;
        totalDocuments += count;
        
        // Stima della dimensione (approssimativa)
        const estimatedSize = count * 1024; // 1KB per documento
        const sizeString = estimatedSize > 1024 * 1024 
          ? `${(estimatedSize / (1024 * 1024)).toFixed(2)} MB`
          : `${(estimatedSize / 1024).toFixed(2)} KB`;
        
        stats[collectionName] = {
          count,
          size: sizeString
        };
      }
      
      return {
        totalCollections: this.COLLECTIONS_TO_CLEAN.length,
        collections: stats,
        totalDocuments
      };
      
    } catch (error) {
      console.error('❌ Errore nel recupero statistiche:', error);
      return {
        totalCollections: 0,
        collections: {},
        totalDocuments: 0
      };
    }
  }
}

export const cleanupService = new CleanupService();