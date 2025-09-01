import { FeasibilityProject } from './feasibilityService';
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
export declare class ProjectManagerService {
  /**
   * Gestisce il salvataggio intelligente di un progetto
   * Evita duplicati controllando nome e indirizzo
   */
  smartSaveProject(
    projectData: Partial<FeasibilityProject>,
    userId?: string
  ): Promise<ProjectSaveResult>;
  /**
   * Trova un progetto esistente basandosi su nome e indirizzo
   */
  private findExistingProject;
  /**
   * Trova un progetto per ID
   */
  findProjectById(projectId: string): Promise<FeasibilityProject | null>;
  /**
   * Verifica se un progetto è duplicato
   */
  isProjectDuplicate(identifier: ProjectIdentifier): Promise<boolean>;
  /**
   * Ottieni tutti i progetti di un utente
   */
  getUserProjects(userId: string): Promise<FeasibilityProject[]>;
  /**
   * Pulisce progetti duplicati per un utente
   * Mantiene solo il più recente per ogni combinazione nome+indirizzo
   */
  cleanupDuplicateProjects(userId: string): Promise<{
    totalProjects: number;
    duplicatesRemoved: number;
    projectsKept: number;
  }>;
  /**
   * Verifica integrità dei progetti di un utente
   */
  verifyProjectIntegrity(userId: string): Promise<{
    totalProjects: number;
    validProjects: number;
    invalidProjects: number;
    issues: string[];
  }>;
  /**
   * Cancella un progetto in modo sicuro
   */
  safeDeleteProject(
    projectId: string,
    userId?: string
  ): Promise<{
    success: boolean;
    message: string;
    projectId: string;
  }>;
  /**
   * Cancella più progetti in batch
   */
  deleteMultipleProjects(
    projectIds: string[],
    userId?: string
  ): Promise<{
    success: boolean;
    deleted: string[];
    failed: Array<{
      id: string;
      error: string;
    }>;
    total: number;
  }>;
  /**
   * Verifica se un progetto può essere cancellato
   */
  canDeleteProject(
    projectId: string,
    userId?: string
  ): Promise<{
    canDelete: boolean;
    reason?: string;
    project?: FeasibilityProject;
  }>;
}
export declare const projectManagerService: ProjectManagerService;
//# sourceMappingURL=projectManagerService.d.ts.map
