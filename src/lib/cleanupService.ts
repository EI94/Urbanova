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
}

export const cleanupService = new CleanupService();