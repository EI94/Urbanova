import {
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  DocumentData,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';

import { db } from './firebase';


// Collezioni Firestore
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  FEASIBILITY_PROJECTS: 'feasibilityProjects',
  DOCUMENTS: 'documents',
  MEETINGS: 'meetings',
  TASKS: 'tasks',
};

// Tipi per i progetti immobiliari
export interface RealEstateProject {
  id: string;
  name: string;
  description: string;
  status: 'PIANIFICAZIONE' | 'IN_CORSO' | 'IN_ATTESA' | 'COMPLETATO';
  propertyType: 'RESIDENZIALE' | 'COMMERCIALE' | 'MISTO' | 'INDUSTRIALE';
  location: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  expectedROI?: number;
  surface?: number;
  units?: number;
  energyClass?: string;
  manager?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  images?: string[];
}

export type NewProjectData = Omit<RealEstateProject, 'id' | 'createdAt' | 'updatedAt'>;

// Funzione per ottenere tutti i progetti
export async function getProjects(): Promise<RealEstateProject[]> {
  console.log('🔄 Caricamento progetti da Firestore...');

  try {
    const projectsRef = collection(db!, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RealEstateProject[];

    console.log(`✅ Progetti caricati: ${projects.length}`);
    return projects;
  } catch (error) {
    console.error('❌ Errore nel caricamento dei progetti:', error);
    return []; // Restituisci array vuoto in caso di errore
  }
}

// Funzione per ottenere un singolo progetto
export async function getProjectById(id: string): Promise<RealEstateProject | null> {
  console.log(`🔄 Caricamento progetto con ID: ${id}`);

  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const project = {
        id: docSnap.id,
        ...docSnap.data(),
      } as RealEstateProject;

      console.log(`✅ Progetto caricato: ${project.name}`);
      return project;
    } else {
      console.log(`⚠️ Progetto non trovato: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Errore nel caricamento del progetto ${id}:`, error);
    return null;
  }
}

// Funzione per aggiungere un nuovo progetto
export const addProject = async (projectData: NewProjectData): Promise<string> => {
  try {
    console.log('🔄 Aggiunta nuovo progetto:', projectData);

    // Verifica che i dati siano validi
    if (!projectData.name || !projectData.description) {
      throw new Error('Nome e descrizione sono obbligatori');
    }

    const projectRef = await addDoc(collection(db!, COLLECTIONS.PROJECTS), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Progetto creato con ID: ${projectRef.id}`);
    return projectRef.id;
  } catch (error) {
    console.error('❌ Errore nella creazione del progetto:', error);
    throw new Error(
      `Impossibile creare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
  }
};

// Funzione per aggiornare un progetto esistente
export const updateProject = async (
  id: string,
  updates: Partial<NewProjectData>
): Promise<void> => {
  try {
    console.log(`🔄 Aggiornamento progetto ${id}:`, updates);

    const projectRef = doc(db, COLLECTIONS.PROJECTS, id);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ Progetto ${id} aggiornato con successo`);
  } catch (error) {
    console.error(`❌ Errore nell'aggiornamento del progetto ${id}:`, error);
    throw new Error(
      `Impossibile aggiornare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
  }
};

// Funzione per eliminare un progetto (DEPRECATO - usa robustProjectDeletionService)
export const deleteProject = async (id: string): Promise<void> => {
  try {
    console.log(
      `⚠️ DEPRECATO: deleteProject chiamato direttamente - usa robustProjectDeletionService`
    );

    // Reindirizza al servizio robusto
    const { robustProjectDeletionService } = await import('./robustProjectDeletionService');
    const result = await robustProjectDeletionService.robustDeleteProject(id);

    if (!result.success || !result.backendVerified) {
      throw new Error(`Eliminazione fallita: ${result.message}`);
    }

    console.log(`✅ Progetto ${id} eliminato tramite servizio robusto`);
  } catch (error) {
    console.error(`❌ Errore nell'eliminazione del progetto ${id}:`, error);
    throw new Error(
      `Impossibile eliminare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
  }
};

// Funzione per ottenere progetti per utente
export const getProjectsByUser = async (userId: string): Promise<RealEstateProject[]> => {
  try {
    console.log(`🔄 Caricamento progetti per utente: ${userId}`);

    const projectsRef = collection(db!, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RealEstateProject[];

    console.log(`✅ Progetti utente caricati: ${projects.length}`);
    return projects;
  } catch (error) {
    console.error(`❌ Errore nel caricamento progetti utente ${userId}:`, error);
    return [];
  }
};

// Funzione per ottenere progetti per status
export const getProjectsByStatus = async (
  status: RealEstateProject['status']
): Promise<RealEstateProject[]> => {
  try {
    console.log(`🔄 Caricamento progetti per status: ${status}`);

    const projectsRef = collection(db!, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, where('status', '==', status), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RealEstateProject[];

    console.log(`✅ Progetti status ${status} caricati: ${projects.length}`);
    return projects;
  } catch (error) {
    console.error(`❌ Errore nel caricamento progetti status ${status}:`, error);
    return [];
  }
};

// Funzione per cercare progetti
export const searchProjects = async (searchTerm: string): Promise<RealEstateProject[]> => {
  try {
    console.log(`🔄 Ricerca progetti: ${searchTerm}`);

    const projectsRef = collection(db!, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RealEstateProject[];

    // Filtra i risultati localmente
    const filteredProjects = projects.filter(
      project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log(`✅ Ricerca completata: ${filteredProjects.length} risultati`);
    return filteredProjects;
  } catch (error) {
    console.error(`❌ Errore nella ricerca progetti:`, error);
    return [];
  }
};

// Funzione per creare progetto con transazione
export const createProjectWithTransaction = async (
  projectData: NewProjectData
): Promise<string> => {
  try {
    console.log('🔄 Creazione progetto con transazione:', projectData);

    return await runTransaction(db, async transaction => {
      // Verifica che i dati siano validi
      if (!projectData.name || !projectData.description) {
        throw new Error('Nome e descrizione sono obbligatori');
      }

      // Crea il documento
      const projectRef = doc(collection(db!, COLLECTIONS.PROJECTS));

      transaction.set(projectRef, {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Progetto creato con transazione: ${projectRef.id}`);
      return projectRef.id;
    });
  } catch (error) {
    console.error('❌ Errore nella creazione progetto con transazione:', error);
    throw new Error(
      `Impossibile creare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
  }
};

// Funzione per creare progetto con batch
export const createProjectWithBatch = async (projectData: NewProjectData): Promise<string> => {
  try {
    console.log('🔄 Creazione progetto con batch:', projectData);

    const batch = writeBatch(db);

    // Verifica che i dati siano validi
    if (!projectData.name || !projectData.description) {
      throw new Error('Nome e descrizione sono obbligatori');
    }

    // Crea il documento
    const projectRef = doc(collection(db!, COLLECTIONS.PROJECTS));

    batch.set(projectRef, {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Commit del batch
    await batch.commit();

    console.log(`✅ Progetto creato con batch: ${projectRef.id}`);
    return projectRef.id;
  } catch (error) {
    console.error('❌ Errore nella creazione progetto con batch:', error);
    throw new Error(
      `Impossibile creare il progetto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`
    );
  }
};

// Funzione per verificare la connessione Firestore
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Test connessione Firestore...');

    // Prova a leggere un documento di test
    const testRef = doc(db, 'test', 'connection');
    await getDoc(testRef);

    console.log('✅ Connessione Firestore OK');
    return true;
  } catch (error) {
    console.error('❌ Errore connessione Firestore:', error);
    return false;
  }
};

// Funzione per ottenere statistiche progetti
export const getProjectStats = async (): Promise<{
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  averageROI: number;
  projectsByType: {
    RESIDENZIALE: number;
    COMMERCIALE: number;
    MISTO: number;
    INDUSTRIALE: number;
  };
  projectsByStatus: {
    PIANIFICAZIONE: number;
    IN_CORSO: number;
    IN_ATTESA: number;
    COMPLETATO: number;
  };
}> => {
  try {
    console.log('🔄 Caricamento statistiche progetti...');

    const projectsRef = collection(db!, COLLECTIONS.PROJECTS);
    const snapshot = await getDocs(projectsRef);

    const projects = snapshot.docs.map(doc => doc.data()) as RealEstateProject[];

    // Inizializza le statistiche con valori di default sicuri
    const stats = {
      totalProjects: projects.length,
      activeProjects: 0,
      completedProjects: 0,
      totalBudget: 0,
      averageROI: 0,
      projectsByType: {
        RESIDENZIALE: 0,
        COMMERCIALE: 0,
        MISTO: 0,
        INDUSTRIALE: 0,
      },
      projectsByStatus: {
        PIANIFICAZIONE: 0,
        IN_CORSO: 0,
        IN_ATTESA: 0,
        COMPLETATO: 0,
      },
    };

    projects.forEach(project => {
      // Conta per status
      if (project.status) {
        const status = project.status as keyof typeof stats.projectsByStatus;
        if (stats.projectsByStatus[status] !== undefined) {
          stats.projectsByStatus[status]++;
        }
      }

      // Conta per tipo
      if (project.propertyType) {
        const type = project.propertyType.toUpperCase() as keyof typeof stats.projectsByType;
        if (stats.projectsByType[type] !== undefined) {
          stats.projectsByType[type]++;
        }
      }

      // Calcola budget totale
      if (project.budget) {
        stats.totalBudget += project.budget;
      }

      // Conta progetti attivi e completati
      if (project.status === 'IN_CORSO') {
        stats.activeProjects++;
      } else if (project.status === 'COMPLETATO') {
        stats.completedProjects++;
      }
    });

    // Calcola ROI medio se ci sono progetti con ROI
    const projectsWithROI = projects.filter(p => p.expectedROI);
    if (projectsWithROI.length > 0) {
      stats.averageROI =
        projectsWithROI.reduce((sum, p) => sum + (p.expectedROI || 0), 0) / projectsWithROI.length;
    }

    console.log('✅ Statistiche progetti caricate:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Errore nel caricamento statistiche progetti:', error);
    // Restituisci statistiche di default sicure
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalBudget: 0,
      averageROI: 0,
      projectsByType: {
        RESIDENZIALE: 0,
        COMMERCIALE: 0,
        MISTO: 0,
        INDUSTRIALE: 0,
      },
      projectsByStatus: {
        PIANIFICAZIONE: 0,
        IN_CORSO: 0,
        IN_ATTESA: 0,
        COMPLETATO: 0,
      },
    };
  }
};
