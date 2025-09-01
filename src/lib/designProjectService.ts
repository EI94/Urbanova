import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

import { DesignTemplate } from './designCenterService';
import { db } from './firebase';

export interface DesignProject {
  id: string;
  name: string;
  description: string;
  templateId: string;
  template: DesignTemplate;
  status:
    | 'PLANNING'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'ON_HOLD'
    | 'DRAFT'
    | 'IN_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED';
  userId: string;
  location: string;
  category?: string;
  zone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  timeline: {
    estimated: number; // mesi
    startDate?: Date;
    endDate?: Date;
  };
  customizations: {
    area: number;
    bedrooms: number;
    bathrooms: number;
    floors: number;
    parkingSpaces: number;
    gardenArea: number;
    balconyArea: number;
    customFeatures: string[];
    notes: string;
  };
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  teamMembers?: string[];
  documents?: string[];
  images?: string[];
}

export interface CreateProjectData {
  name: string;
  description: string;
  templateId: string;
  template: DesignTemplate;
  userId: string;
  location: string;
  category?: string;
  zone?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  budget: {
    estimated: number;
    currency: string;
  };
  timeline: {
    estimated: number;
  };
  customizations: {
    area: number;
    bedrooms: number;
    bathrooms: number;
    floors: number;
    parkingSpaces: number;
    gardenArea: number;
    balconyArea: number;
    customFeatures: string[];
    notes: string;
  };
  tags?: string[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export class DesignProjectService {
  private readonly COLLECTION_NAME = 'designProjects';

  /**
   * Crea un nuovo progetto di design
   */
  async createProject(projectData: CreateProjectData): Promise<string> {
    try {
      console.log('🏗️ [DesignProjectService] Creazione nuovo progetto:', projectData.name);

      const projectId = `design-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newProject: DesignProject = {
        id: projectId,
        ...projectData,
        status: 'PLANNING',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        budget: {
          ...projectData.budget,
          actual: 0,
        },
        timeline: {
          ...projectData.timeline,
        },
        tags: projectData.tags || [],
        priority: projectData.priority || 'MEDIUM',
        teamMembers: [],
        documents: [],
        images: [],
      };

      const projectRef = doc(db, this.COLLECTION_NAME, projectId);
      await setDoc(projectRef, {
        ...newProject,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [DesignProjectService] Progetto creato con successo:', projectId);
      return projectId;
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore creazione progetto:', error);
      throw new Error(`Impossibile creare il progetto: ${error}`);
    }
  }

  /**
   * Recupera tutti i progetti di un utente
   */
  async getUserProjects(userId: string): Promise<DesignProject[]> {
    try {
      console.log('📋 [DesignProjectService] Recupero progetti utente:', userId);

      const projectsRef = collection(db, this.COLLECTION_NAME);
      const q = query(projectsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const projects: DesignProject[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        projects.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as DesignProject);
      });

      console.log('✅ [DesignProjectService] Progetti recuperati:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore recupero progetti:', error);
      throw new Error(`Impossibile recuperare i progetti: ${error}`);
    }
  }

  /**
   * Recupera un progetto specifico
   */
  async getProject(projectId: string): Promise<DesignProject | null> {
    try {
      console.log('🔍 [DesignProjectService] Recupero progetto:', projectId);

      const projectRef = doc(db, this.COLLECTION_NAME, projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        console.log('⚠️ [DesignProjectService] Progetto non trovato:', projectId);
        return null;
      }

      const data = projectDoc.data();
      const project: DesignProject = {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as DesignProject;

      console.log('✅ [DesignProjectService] Progetto recuperato:', project.name);
      return project;
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore recupero progetto:', error);
      throw new Error(`Impossibile recuperare il progetto: ${error}`);
    }
  }

  /**
   * Aggiorna un progetto esistente
   */
  async updateProject(projectId: string, updates: Partial<DesignProject>): Promise<void> {
    try {
      console.log('✏️ [DesignProjectService] Aggiornamento progetto:', projectId);

      const projectRef = doc(db, this.COLLECTION_NAME, projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [DesignProjectService] Progetto aggiornato con successo');
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore aggiornamento progetto:', error);
      throw new Error(`Impossibile aggiornare il progetto: ${error}`);
    }
  }

  /**
   * Elimina un progetto
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      console.log('🗑️ [DesignProjectService] Eliminazione progetto:', projectId);

      const projectRef = doc(db, this.COLLECTION_NAME, projectId);
      await deleteDoc(projectRef);

      console.log('✅ [DesignProjectService] Progetto eliminato con successo');
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore eliminazione progetto:', error);
      throw new Error(`Impossibile eliminare il progetto: ${error}`);
    }
  }

  /**
   * Aggiorna il progresso di un progetto
   */
  async updateProgress(projectId: string, progress: number): Promise<void> {
    try {
      console.log('📊 [DesignProjectService] Aggiornamento progresso:', projectId, progress);

      await this.updateProject(projectId, { progress });

      console.log('✅ [DesignProjectService] Progresso aggiornato');
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore aggiornamento progresso:', error);
      throw new Error(`Impossibile aggiornare il progresso: ${error}`);
    }
  }

  /**
   * Cambia lo stato di un progetto
   */
  async changeStatus(projectId: string, status: DesignProject['status']): Promise<void> {
    try {
      console.log('🔄 [DesignProjectService] Cambio stato progetto:', projectId, status);

      await this.updateProject(projectId, { status });

      console.log('✅ [DesignProjectService] Stato aggiornato');
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore cambio stato:', error);
      throw new Error(`Impossibile cambiare lo stato: ${error}`);
    }
  }

  /**
   * Aggiunge un membro del team al progetto
   */
  async addTeamMember(projectId: string, memberId: string): Promise<void> {
    try {
      console.log('👥 [DesignProjectService] Aggiunta membro team:', projectId, memberId);

      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Progetto non trovato');
      }

      const updatedMembers = [...(project.teamMembers || []), memberId];
      await this.updateProject(projectId, { teamMembers: updatedMembers });

      console.log('✅ [DesignProjectService] Membro aggiunto al team');
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore aggiunta membro team:', error);
      throw new Error(`Impossibile aggiungere il membro al team: ${error}`);
    }
  }

  /**
   * Recupera statistiche dei progetti
   */
  async getProjectStats(userId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    totalBudget: number;
    averageProgress: number;
  }> {
    try {
      console.log('📊 [DesignProjectService] Recupero statistiche progetti');

      const projects = await this.getUserProjects(userId);

      const stats = {
        total: projects.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        totalBudget: 0,
        averageProgress: 0,
      };

      projects.forEach(project => {
        // Conta per stato
        stats.byStatus[project.status] = (stats.byStatus[project.status] || 0) + 1;

        // Conta per priorità
        stats.byPriority[project.priority] = (stats.byPriority[project.priority] || 0) + 1;

        // Somma budget
        stats.totalBudget += project.budget.estimated;

        // Somma progresso
        stats.averageProgress += project.progress;
      });

      // Calcola media progresso
      if (projects.length > 0) {
        stats.averageProgress = Math.round(stats.averageProgress / projects.length);
      }

      console.log('✅ [DesignProjectService] Statistiche calcolate:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [DesignProjectService] Errore calcolo statistiche:', error);
      throw new Error(`Impossibile calcolare le statistiche: ${error}`);
    }
  }
}

// Esporta un'istanza singleton
export const designProjectService = new DesignProjectService();
