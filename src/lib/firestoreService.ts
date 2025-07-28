import { db } from './firebase';
import { 
  collection, 
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
  DocumentData
} from 'firebase/firestore';

// Collezioni Firestore
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
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
  console.log("Caricamento progetti da Firestore...");
  
  try {
    const projectsRef = collection(db, COLLECTIONS.PROJECTS);
    const q = query(projectsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RealEstateProject[];
  } catch (error) {
    console.error('Errore nel caricamento dei progetti:', error);
    return []; // Restituisci array vuoto in caso di errore
  }
}

// Funzione per ottenere un singolo progetto
export async function getProjectById(id: string): Promise<RealEstateProject | null> {
  console.log(`Caricamento progetto con ID: ${id}`);
  
  try {
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as RealEstateProject;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Errore nel caricamento del progetto ${id}:`, error);
    return null;
  }
}

// Funzione per aggiungere un nuovo progetto
export const addProject = async (projectData: NewProjectData): Promise<string> => {
  try {
    console.log('Aggiunta nuovo progetto:', projectData);
    
    const projectRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return projectRef.id;
  } catch (error) {
    console.error('Errore durante l\'aggiunta del progetto:', error);
    throw error;
  }
};

// Funzione per aggiornare un progetto
export async function updateProject(id: string, projectData: Partial<NewProjectData>): Promise<void> {
  try {
    console.log(`Aggiornamento progetto ${id}:`, projectData);
    
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await updateDoc(docRef, {
      ...projectData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Errore durante l'aggiornamento del progetto ${id}:`, error);
    throw error;
  }
}

// Funzione per eliminare un progetto
export async function deleteProject(id: string): Promise<void> {
  try {
    console.log(`Eliminazione progetto ${id}`);
    
    const docRef = doc(db, COLLECTIONS.PROJECTS, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Errore durante l'eliminazione del progetto ${id}:`, error);
    throw error;
  }
}

// Funzione per ottenere statistiche reali
export async function getProjectStats(): Promise<any> {
  try {
    console.log('Calcolo statistiche progetti...');
    
    const projects = await getProjects();
    
    // Calcola statistiche dai dati reali
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'IN_CORSO').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETATO').length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Calcola ROI medio (placeholder - da implementare con dati reali)
    const averageROI = totalProjects > 0 ? 0 : 0;
    
    // Raggruppa per tipo
    const projectsByType = projects.reduce((acc, p) => {
      acc[p.propertyType] = (acc[p.propertyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Raggruppa per status
    const projectsByStatus = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Attività recenti (placeholder - da implementare con collezione separata)
    const recentActivity = [];
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      averageROI,
      projectsByType,
      projectsByStatus,
      recentActivity
    };
  } catch (error) {
    console.error('Errore nel calcolo delle statistiche:', error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalBudget: 0,
      averageROI: 0,
      projectsByType: {},
      projectsByStatus: {},
      recentActivity: []
    };
  }
} 