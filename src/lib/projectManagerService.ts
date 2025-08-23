import { feasibilityService, FeasibilityProject } from './feasibilityService';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface ProjectIdentifier {
  name: string;
  address: string;
  userId?: string;
}

export interface ProjectSaveResult {
  success: boolean;
  projectId: string;
  isNew: boolean;
  message: string;
}

export class ProjectManagerService {
  
  /**
   * Gestisce il salvataggio intelligente di un progetto
   * Evita duplicati controllando nome e indirizzo
   */
  async smartSaveProject(
    projectData: Partial<FeasibilityProject>,
    userId?: string
  ): Promise<ProjectSaveResult> {
    try {
      console.log('🧠 Salvataggio intelligente progetto...', {
        name: projectData.name,
        address: projectData.address,
        userId
      });

      // Verifica se esiste già un progetto con lo stesso nome e indirizzo
      const existingProject = await this.findExistingProject({
        name: projectData.name || '',
        address: projectData.address || '',
        userId
      });

      if (existingProject) {
        console.log('🔄 Progetto esistente trovato, aggiornamento in corso...', existingProject.id);
        
        // Aggiorna il progetto esistente
        const updatedProject = {
          ...existingProject,
          ...projectData,
          updatedAt: new Date()
        };

        await feasibilityService.updateProject(existingProject.id, updatedProject);
        
        return {
          success: true,
          projectId: existingProject.id,
          isNew: false,
          message: 'Progetto aggiornato con successo'
        };
      } else {
        console.log('🆕 Nuovo progetto, creazione in corso...');
        
        // Crea un nuovo progetto
        const newProjectId = await feasibilityService.createProject(projectData as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>);
        
        return {
          success: true,
          projectId: newProjectId,
          isNew: true,
          message: 'Nuovo progetto creato con successo'
        };
      }

    } catch (error) {
      console.error('❌ Errore salvataggio intelligente:', error);
      throw new Error(`Errore nel salvataggio intelligente: ${error}`);
    }
  }

  /**
   * Trova un progetto esistente basandosi su nome e indirizzo
   */
  private async findExistingProject(identifier: ProjectIdentifier): Promise<FeasibilityProject | null> {
    try {
      console.log('🔍 Ricerca progetto esistente...', identifier);

      // Query per trovare progetti con lo stesso nome e indirizzo
      const projectsRef = collection(db, 'feasibilityProjects');
      const q = query(
        projectsRef,
        where('name', '==', identifier.name),
        where('address', '==', identifier.address),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const projectData = doc.data() as FeasibilityProject;
        
        console.log('✅ Progetto esistente trovato:', {
          id: doc.id,
          name: projectData.name,
          address: projectData.address
        });
        
        return {
          ...projectData,
          id: doc.id
        };
      }

      console.log('❌ Nessun progetto esistente trovato');
      return null;

    } catch (error) {
      console.error('❌ Errore ricerca progetto esistente:', error);
      return null;
    }
  }

  /**
   * Verifica se un progetto è duplicato
   */
  async isProjectDuplicate(identifier: ProjectIdentifier): Promise<boolean> {
    const existingProject = await this.findExistingProject(identifier);
    return existingProject !== null;
  }

  /**
   * Ottieni tutti i progetti di un utente
   */
  async getUserProjects(userId: string): Promise<FeasibilityProject[]> {
    try {
      const projectsRef = collection(db, 'feasibilityProjects');
      const q = query(
        projectsRef,
        where('userId', '==', userId),
        // where('deleted', '==', false) // Se implementi soft delete
      );

      const querySnapshot = await getDocs(q);
      const projects: FeasibilityProject[] = [];

      querySnapshot.forEach((doc) => {
        projects.push({
          ...doc.data() as FeasibilityProject,
          id: doc.id
        });
      });

      return projects;
    } catch (error) {
      console.error('❌ Errore recupero progetti utente:', error);
      return [];
    }
  }

  /**
   * Pulisce progetti duplicati per un utente
   * Mantiene solo il più recente per ogni combinazione nome+indirizzo
   */
  async cleanupDuplicateProjects(userId: string): Promise<{
    totalProjects: number;
    duplicatesRemoved: number;
    projectsKept: number;
  }> {
    try {
      console.log('🧹 Pulizia progetti duplicati per utente:', userId);
      
      const projects = await this.getUserProjects(userId);
      const projectGroups = new Map<string, FeasibilityProject[]>();
      
      // Raggruppa progetti per nome+indirizzo
      projects.forEach(project => {
        const key = `${project.name}|${project.address}`;
        if (!projectGroups.has(key)) {
          projectGroups.set(key, []);
        }
        projectGroups.get(key)!.push(project);
      });

      let duplicatesRemoved = 0;
      let projectsKept = 0;

      // Per ogni gruppo, mantieni solo il più recente
      for (const [key, groupProjects] of projectGroups) {
        if (groupProjects.length > 1) {
          // Ordina per data di aggiornamento (più recente prima)
          groupProjects.sort((a, b) => {
            const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
            const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
          });

          // Mantieni il primo (più recente) e rimuovi gli altri
          const [keepProject, ...duplicates] = groupProjects;
          projectsKept++;

          for (const duplicate of duplicates) {
            try {
              await feasibilityService.deleteProject(duplicate.id);
              duplicatesRemoved++;
              console.log(`🗑️ Rimosso progetto duplicato: ${duplicate.id}`);
            } catch (error) {
              console.error(`❌ Errore rimozione progetto duplicato ${duplicate.id}:`, error);
            }
          }
        } else {
          projectsKept++;
        }
      }

      const result = {
        totalProjects: projects.length,
        duplicatesRemoved,
        projectsKept
      };

      console.log('✅ Pulizia progetti completata:', result);
      return result;

    } catch (error) {
      console.error('❌ Errore pulizia progetti duplicati:', error);
      throw error;
    }
  }

  /**
   * Verifica integrità dei progetti di un utente
   */
  async verifyProjectIntegrity(userId: string): Promise<{
    totalProjects: number;
    validProjects: number;
    invalidProjects: number;
    issues: string[];
  }> {
    try {
      const projects = await this.getUserProjects(userId);
      const issues: string[] = [];
      let validProjects = 0;
      let invalidProjects = 0;

      for (const project of projects) {
        let isValid = true;

        // Verifica campi obbligatori
        if (!project.name || !project.address) {
          issues.push(`Progetto ${project.id}: Nome o indirizzo mancanti`);
          isValid = false;
        }

        // Verifica date
        if (project.createdAt && isNaN(new Date(project.createdAt).getTime())) {
          issues.push(`Progetto ${project.id}: Data creazione non valida`);
          isValid = false;
        }

        if (project.updatedAt && isNaN(new Date(project.updatedAt).getTime())) {
          issues.push(`Progetto ${project.id}: Data aggiornamento non valida`);
          isValid = false;
        }

        if (isValid) {
          validProjects++;
        } else {
          invalidProjects++;
        }
      }

      return {
        totalProjects: projects.length,
        validProjects,
        invalidProjects,
        issues
      };

    } catch (error) {
      console.error('❌ Errore verifica integrità progetti:', error);
      throw error;
    }
  }
}

export const projectManagerService = new ProjectManagerService();
