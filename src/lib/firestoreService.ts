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

// Dati di esempio per i progetti
const sampleProjects: RealEstateProject[] = [
  {
    id: 'project1',
    name: 'Residenza Belvedere',
    description: 'Complesso residenziale di lusso con 24 appartamenti e vista panoramica',
    status: 'IN_CORSO',
    propertyType: 'RESIDENZIALE',
    location: 'Milano, Lombardia',
    startDate: new Date('2023-03-15'),
    endDate: new Date('2024-12-31'),
    budget: 4500000,
    surface: 3200,
    units: 24,
    energyClass: 'A+',
    manager: 'Marco Rossi',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-05-20'),
    createdBy: 'user1',
    images: []
  },
  {
    id: 'project2',
    name: 'Centro Commerciale Aurora',
    description: 'Centro commerciale con 45 negozi, food court e cinema multiplex',
    status: 'PIANIFICAZIONE',
    propertyType: 'COMMERCIALE',
    location: 'Roma, Lazio',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-06-30'),
    budget: 12000000,
    surface: 15000,
    units: 45,
    energyClass: 'A',
    manager: 'Laura Bianchi',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-06-05'),
    createdBy: 'user2',
    images: []
  },
  {
    id: 'project3',
    name: 'Parco Industriale Est',
    description: 'Area industriale con 12 capannoni e uffici direzionali',
    status: 'COMPLETATO',
    propertyType: 'INDUSTRIALE',
    location: 'Torino, Piemonte',
    startDate: new Date('2022-05-10'),
    endDate: new Date('2023-07-15'),
    budget: 8500000,
    surface: 25000,
    units: 12,
    energyClass: 'B',
    manager: 'Giovanni Verdi',
    createdAt: new Date('2022-03-01'),
    updatedAt: new Date('2023-07-20'),
    createdBy: 'user3',
    images: []
  },
];

// Funzione per ottenere tutti i progetti
export async function getProjects(): Promise<RealEstateProject[]> {
  console.log("Caricamento progetti...");
  // In ambiente di sviluppo, restituisci dati mock
  return Promise.resolve(sampleProjects);
  
  // In produzione, usa Firestore
  /* 
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
    throw error;
  }
  */
}

// Funzione per ottenere un singolo progetto
export async function getProjectById(id: string): Promise<RealEstateProject | null> {
  console.log(`Caricamento progetto con ID: ${id}`);
  
  // In ambiente di sviluppo, restituisci dati mock
  const project = sampleProjects.find(p => p.id === id);
  return Promise.resolve(project || null);
  
  // In produzione, usa Firestore
  /*
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
    throw error;
  }
  */
}

// Funzione per aggiungere un nuovo progetto
export const addProject = async (projectData: NewProjectData): Promise<string> => {
  try {
    console.log('Aggiunta nuovo progetto:', projectData);
    
    // In produzione, usa Firestore
    /*
    const projectRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return projectRef.id;
    */
    
    // In sviluppo, restituisci un ID simulato
    return Promise.resolve(`project${Math.floor(Math.random() * 10000)}`);
  } catch (error) {
    console.error('Errore durante l\'aggiunta del progetto:', error);
    throw error;
  }
};

// Funzione mock per aggiornare un progetto
export async function updateProject(id: string, projectData: Partial<NewProjectData>): Promise<void> {
  console.log(`Mock: Aggiornamento progetto ${id}:`, projectData);
  
  // Simula l'aggiornamento
  return Promise.resolve();
}

// Funzione mock per eliminare un progetto
export async function deleteProject(id: string): Promise<void> {
  console.log(`Mock: Eliminazione progetto ${id}`);
  
  // Simula l'eliminazione
  return Promise.resolve();
}

// Funzione mock per ottenere statistiche
export async function getProjectStats(): Promise<any> {
  return {
    totalProjects: 4,
    activeProjects: 2,
    completedProjects: 1,
    totalBudget: 54700000,
    averageROI: 18.5,
    projectsByType: {
      RESIDENZIALE: 1,
      COMMERCIALE: 1,
      MISTO: 1,
      INDUSTRIALE: 1
    },
    projectsByStatus: {
      PIANIFICAZIONE: 1,
      IN_CORSO: 1,
      IN_ATTESA: 1,
      COMPLETATO: 1
    },
    recentActivity: [
      {
        id: '1',
        type: 'PROJECT_CREATED',
        message: 'Nuovo progetto "Residenza Milano Centro" creato',
        timestamp: new Date('2024-01-15T10:30:00'),
        projectId: 'project1'
      },
      {
        id: '2',
        type: 'MILESTONE_COMPLETED',
        message: 'Milestone completata: Permessi ottenuti per "Centro Commerciale Roma"',
        timestamp: new Date('2024-01-14T15:45:00'),
        projectId: 'project2'
      },
      {
        id: '3',
        type: 'PROJECT_UPDATED',
        message: 'Aggiornamento budget per "Parco Industriale Est"',
        timestamp: new Date('2024-01-13T09:20:00'),
        projectId: 'project3'
      },
      {
        id: '4',
        type: 'ALERT',
        message: 'Scadenza permesso edificabilità tra 30 giorni',
        timestamp: new Date('2024-01-12T14:15:00'),
        projectId: 'project4'
      },
      {
        id: '5',
        type: 'PROJECT_CREATED',
        message: 'Nuovo progetto "Complesso Misto Torino" avviato',
        timestamp: new Date('2024-01-11T11:00:00'),
        projectId: 'project4'
      }
    ]
  };
} 