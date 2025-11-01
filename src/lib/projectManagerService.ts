import { query, where, getDocs, limit , collection } from 'firebase/firestore';

import { feasibilityService, FeasibilityProject } from './feasibilityService';
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
      console.log('🧠 [ProjectManagerService] INIZIO salvataggio intelligente progetto...', {
        name: projectData.name,
        address: projectData.address,
        userId,
        totalArea: projectData.totalArea,
        hasCosts: !!projectData.costs
      });

      // Verifica se esiste già un progetto con lo stesso nome e indirizzo
      const identifier: ProjectIdentifier = {
        name: projectData.name || '',
        address: projectData.address || '',
      };
      
      if (userId) {
        identifier.userId = userId;
      }
      
      const existingProject = await this.findExistingProject(identifier);

      if (existingProject) {
        console.log('🔄 Progetto esistente trovato, aggiornamento in corso...', existingProject.id);

        // Aggiorna il progetto esistente
        const updatedProject = {
          ...existingProject,
          ...projectData,
          updatedAt: new Date(),
        };

        if (existingProject.id) {
          await feasibilityService.updateProject(existingProject.id, updatedProject);

          return {
            success: true,
            projectId: existingProject.id,
            isNew: false,
            message: 'Progetto aggiornato con successo',
          };
        } else {
          throw new Error('ID progetto non valido');
        }
      } else {
        console.log('🆕 Nuovo progetto, creazione in corso...');

        // Crea un nuovo progetto
        const newProjectId = await feasibilityService.createProject(
          projectData as Omit<FeasibilityProject, 'id' | 'createdAt' | 'updatedAt'>
        );

        return {
          success: true,
          projectId: newProjectId,
          isNew: true,
          message: 'Nuovo progetto creato con successo',
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
  private async findExistingProject(
    identifier: ProjectIdentifier
  ): Promise<FeasibilityProject | null> {
    try {
      console.log('🔍 Ricerca progetto esistente...', identifier);

      // Query per trovare progetti con lo stesso nome e indirizzo
      const projectsRef = collection(db!, 'feasibilityProjects');
      const q = query(
        projectsRef,
        where('name', '==', identifier.name),
        where('address', '==', identifier.address),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        if (doc) {
          const projectData = doc.data() as FeasibilityProject;

          console.log('✅ Progetto esistente trovato:', {
            id: doc.id,
            name: projectData.name,
            address: projectData.address,
          });

          return {
            ...projectData,
            id: doc.id,
          };
        }
      }

      console.log('❌ Nessun progetto esistente trovato');
      return null;
    } catch (error) {
      console.error('❌ Errore ricerca progetto esistente:', error);
      return null;
    }
  }

  /**
   * Trova un progetto per ID
   */
  async findProjectById(projectId: string): Promise<FeasibilityProject | null> {
    try {
      console.log('🔍 Ricerca progetto per ID:', projectId);

      // Usa il servizio esistente per trovare il progetto
      const project = await feasibilityService.getProjectById(projectId);

      if (project) {
        console.log('✅ Progetto trovato per ID:', {
          id: project.id,
          name: project.name,
          address: project.address,
        });
        return project;
      }

      console.log('❌ Nessun progetto trovato per ID:', projectId);
      return null;
    } catch (error) {
      console.error('❌ Errore ricerca progetto per ID:', error);
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
      const projectsRef = collection(db!, 'feasibilityProjects');
      const q = query(
        projectsRef,
        where('userId', '==', userId)
        // where('deleted', '==', false) // Se implementi soft delete
      );

      const querySnapshot = await getDocs(q);
      const projects: FeasibilityProject[] = [];

      querySnapshot.forEach(doc => {
        projects.push({
          ...(doc.data() as FeasibilityProject),
          id: doc.id,
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
      projectGroups.forEach((groupProjects, key) => {
        if (groupProjects.length > 1) {
          // Ordina per data di aggiornamento (più recente prima)
          groupProjects.sort((a: any, b: any) => {
            const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
            const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
          });

          // Mantieni il primo (più recente) e rimuovi gli altri
          const [keepProject, ...duplicates] = groupProjects;
          projectsKept++;

          duplicates.forEach(async (duplicate) => {
            try {
              if (!duplicate.id) {
                console.error('❌ Progetto duplicato senza ID valido');
                return;
              }
              
              // Importa il servizio robusto per eliminazione
              const { robustProjectDeletionService } = await import(
                './robustProjectDeletionService'
              );
              const result = await robustProjectDeletionService.robustDeleteProject(duplicate.id);

              if (result.success && result.backendVerified) {
                duplicatesRemoved++;
                console.log(`🗑️ Rimosso progetto duplicato: ${duplicate.id}`);
              } else {
                console.error(
                  `❌ Eliminazione progetto duplicato fallita: ${duplicate.id} - ${result.message}`
                );
              }
            } catch (error) {
              console.error(`❌ Errore rimozione progetto duplicato ${duplicate.id}:`, error);
            }
          });
        } else {
          projectsKept++;
        }
      });

      const result = {
        totalProjects: projects.length,
        duplicatesRemoved,
        projectsKept,
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
        issues,
      };
    } catch (error) {
      console.error('❌ Errore verifica integrità progetti:', error);
      throw error;
    }
  }

  /**
   * Cancella un progetto in modo sicuro
   */
  async safeDeleteProject(
    projectId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    projectId: string;
  }> {
    try {
      console.log('🗑️ Cancellazione sicura progetto:', projectId);

      // Verifica che il progetto esista usando la ricerca per ID
      const project = await this.findProjectById(projectId);
      if (!project) {
        throw new Error('Progetto non trovato');
      }

      // Verifica che l'utente sia autorizzato (se userId è fornito)
      // TODO: Implementare controllo autorizzazione quando FeasibilityProject avrà userId
      // if (userId && project.userId && project.userId !== userId) {
      //   throw new Error('Non autorizzato a cancellare questo progetto');
      // }

      // Importa il servizio robusto per eliminazione
      const { robustProjectDeletionService } = await import('./robustProjectDeletionService');
      const result = await robustProjectDeletionService.robustDeleteProject(projectId);

      if (!result.success || !result.backendVerified) {
        throw new Error(`Eliminazione fallita: ${result.message}`);
      }

      console.log('✅ Progetto cancellato con successo:', projectId);

      return {
        success: true,
        message: 'Progetto cancellato con successo',
        projectId,
      };
    } catch (error) {
      console.error('❌ Errore cancellazione progetto:', error);

      let errorMessage = 'Errore durante la cancellazione';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage,
        projectId,
      };
    }
  }

  /**
   * Cancella più progetti in batch
   */
  async deleteMultipleProjects(
    projectIds: string[],
    userId?: string
  ): Promise<{
    success: boolean;
    deleted: string[];
    failed: Array<{ id: string; error: string }>;
    total: number;
  }> {
    try {
      console.log('🗑️ Cancellazione multipla progetti:', projectIds.length);

      const deleted: string[] = [];
      const failed: Array<{ id: string; error: string }> = [];

      for (const projectId of projectIds) {
        try {
          const result = await this.safeDeleteProject(projectId, userId);
          if (result.success) {
            deleted.push(projectId);
          } else {
            failed.push({ id: projectId, error: result.message });
          }
        } catch (error) {
          failed.push({
            id: projectId,
            error: error instanceof Error ? error.message : 'Errore sconosciuto',
          });
        }
      }

      const result = {
        success: failed.length === 0,
        deleted,
        failed,
        total: projectIds.length,
      };

      console.log('✅ Cancellazione multipla completata:', result);
      return result;
    } catch (error) {
      console.error('❌ Errore cancellazione multipla:', error);
      throw error;
    }
  }

  /**
   * Verifica se un progetto può essere cancellato
   */
  async canDeleteProject(
    projectId: string,
    userId?: string
  ): Promise<{
    canDelete: boolean;
    reason?: string;
    project?: FeasibilityProject;
  }> {
    try {
      const project = await this.findProjectById(projectId);
      if (!project) {
        return {
          canDelete: false,
          reason: 'Progetto non trovato',
        };
      }

      // Verifica autorizzazioni
      // TODO: Implement proper authorization check when FeasibilityProject includes userId
      // if (userId && project.userId && project.userId !== userId) {
      //   return {
      //     canDelete: false,
      //     reason: 'Non autorizzato a cancellare questo progetto',
      //   };
      // }

      // Verifica se il progetto è in uno stato che permette la cancellazione
      if (project.status === 'COMPLETATO') {
        return {
          canDelete: false,
          reason: 'Non è possibile cancellare un progetto completato',
        };
      }

      return {
        canDelete: true,
        project,
      };
    } catch (error) {
      console.error('❌ Errore verifica cancellazione progetto:', error);
      return {
        canDelete: false,
        reason: 'Errore durante la verifica',
      };
    }
  }
}

export const projectManagerService = new ProjectManagerService();
