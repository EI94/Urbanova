import {
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { safeCollection } from './firebaseUtils';

// Define types inline since @/types/project doesn't exist
type ProjectStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold';
type ProjectType = 'residential' | 'commercial' | 'industrial' | 'mixed_use' | 'infrastructure';

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  type: ProjectType;
  budget: number;
  roi?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  averageROI: number;
  projectsByType: Record<ProjectType, number>;
  projectsByStatus: Record<ProjectStatus, number>;
  recentActivities: DashboardActivity[];
  topPerformers: Project[];
  financialSummary: FinancialSummary;
}

export interface DashboardActivity {
  id: string;
  type: 'project_created' | 'project_updated' | 'analysis_completed' | 'milestone_reached';
  projectId: string;
  projectName: string;
  description: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface FinancialSummary {
  totalInvestment: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  roiByProject: Record<string, number>;
  budgetUtilization: number;
}

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  type: ProjectType;
  investment: number;
  revenue: number;
  profit: number;
  margin: number;
  roi: number;
  progress: number;
  lastUpdated: Date;
}

class DashboardService {
  private readonly PROJECTS_COLLECTION = 'feasibilityProjects';
  private readonly ACTIVITIES_COLLECTION = 'dashboard_activities';
  private readonly METRICS_COLLECTION = 'project_metrics';

  /**
   * Ottiene le statistiche complete della dashboard in tempo reale
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 [DashboardService] Recupero statistiche dashboard...');

      const [projects, activities, metrics] = await Promise.all([
        this.getAllProjects(),
        this.getRecentActivities(10),
        this.getAllProjectMetrics(),
      ]);

      const stats = this.calculateDashboardStats(projects, activities, metrics);

      console.log('✅ [DashboardService] Statistiche dashboard calcolate:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [DashboardService] Errore recupero statistiche:', error);
      throw new Error('Impossibile recuperare le statistiche della dashboard');
    }
  }

  /**
   * Sottoscrive ai cambiamenti della dashboard in tempo reale
   */
  subscribeToDashboardUpdates(callback: (stats: DashboardStats) => void, userId?: string): () => void {
    console.log('🔄 [DashboardService] Sottoscrizione aggiornamenti dashboard...');

    // 🔒 CONTROLLO AUTENTICAZIONE: Solo se l'utente è autenticato
    if (!userId) {
      console.warn('⚠️ [DashboardService] Utente non autenticato, skip sottoscrizione real-time');
      // Restituisce callback vuoto per evitare errori
      return () => {};
    }

    const projectsRef = safeCollection(this.PROJECTS_COLLECTION);
    const activitiesRef = safeCollection(this.ACTIVITIES_COLLECTION);

    // Sottoscrizione ai progetti con gestione errori
    const projectsUnsubscribe = onSnapshot(
      projectsRef, 
      async snapshot => {
        console.log('🔄 [DashboardService] Progetti aggiornati, ricalcolo statistiche...');

        try {
          const projects = this.parseProjectsSnapshot(snapshot);
          const activities = await this.getRecentActivities(10);
          const metrics = await this.getAllProjectMetrics();

          const stats = this.calculateDashboardStats(projects, activities, metrics);
          callback(stats);
        } catch (error) {
          console.error('❌ [DashboardService] Errore aggiornamento dashboard:', error);
        }
      },
      error => {
        console.error('❌ [DashboardService] Errore listener progetti:', error);
        // Non propagare l'errore per evitare loop infiniti
      }
    );

    // Sottoscrizione alle attività con gestione errori
    const activitiesUnsubscribe = onSnapshot(
      activitiesRef, 
      async snapshot => {
        console.log('🔄 [DashboardService] Attività aggiornate, ricalcolo statistiche...');

        try {
          const projects = await this.getAllProjects();
          const activities = this.parseActivitiesSnapshot(snapshot);
          const metrics = await this.getAllProjectMetrics();

          const stats = this.calculateDashboardStats(projects, activities, metrics);
          callback(stats);
        } catch (error) {
          console.error('❌ [DashboardService] Errore aggiornamento dashboard:', error);
        }
      },
      error => {
        console.error('❌ [DashboardService] Errore listener attività:', error);
        // Non propagare l'errore per evitare loop infiniti
      }
    );

    return () => {
      projectsUnsubscribe();
      activitiesUnsubscribe();
      console.log('🔌 [DashboardService] Sottoscrizioni dashboard disconnesse');
    };
  }

  /**
   * Ottiene tutti i progetti attivi
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const projectsRef = safeCollection(this.PROJECTS_COLLECTION);
      const q = query(projectsRef, orderBy('updatedAt', 'desc'));

      const snapshot = await getDocs(q);
      return this.parseProjectsSnapshot(snapshot);
    } catch (error) {
      console.error('❌ [DashboardService] Errore recupero progetti:', error);
      return [];
    }
  }

  /**
   * Ottiene le metriche di tutti i progetti
   */
  async getAllProjectMetrics(): Promise<ProjectMetrics[]> {
    try {
      const metricsRef = safeCollection(this.METRICS_COLLECTION);
      const q = query(metricsRef, orderBy('lastUpdated', 'desc'));

      const snapshot = await getDocs(q);
      const metrics: ProjectMetrics[] = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        metrics.push({
          projectId: data.projectId,
          projectName: data.projectName,
          status: data.status,
          type: data.type,
          investment: data.investment || 0,
          revenue: data.revenue || 0,
          profit: data.profit || 0,
          margin: data.margin || 0,
          roi: data.roi || 0,
          progress: data.progress || 0,
          lastUpdated: data.lastUpdated?.toDate() || new Date(),
        });
      });

      return metrics;
    } catch (error) {
      console.error('❌ [DashboardService] Errore recupero metriche:', error);
      return [];
    }
  }

  /**
   * Ottiene le attività recenti della dashboard
   */
  async getRecentActivities(limitCount: number = 10): Promise<DashboardActivity[]> {
    try {
      const activitiesRef = safeCollection(this.ACTIVITIES_COLLECTION);
      const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(limitCount));

      const snapshot = await getDocs(q);
      return this.parseActivitiesSnapshot(snapshot);
    } catch (error) {
      console.error('❌ [DashboardService] Errore recupero attività:', error);
      return [];
    }
  }

  /**
   * Registra una nuova attività nella dashboard
   */
  async logDashboardActivity(activity: Omit<DashboardActivity, 'id'>): Promise<void> {
    try {
      const activitiesRef = safeCollection(this.ACTIVITIES_COLLECTION);
      await setDoc(doc(activitiesRef), {
        ...activity,
        timestamp: Timestamp.fromDate(activity.timestamp),
      });

      console.log('✅ [DashboardService] Attività dashboard registrata:', activity.type);
    } catch (error) {
      console.error('❌ [DashboardService] Errore registrazione attività:', error);
    }
  }

  /**
   * Aggiorna le metriche di un progetto
   */
  async updateProjectMetrics(projectId: string, metrics: Partial<ProjectMetrics>): Promise<void> {
    try {
      const metricsRef = doc(db, this.METRICS_COLLECTION, projectId);
      await setDoc(metricsRef, {
        ...metrics,
        lastUpdated: serverTimestamp(),
      }, { merge: true });

      console.log('✅ [DashboardService] Metriche progetto aggiornate:', projectId);
    } catch (error) {
      console.error('❌ [DashboardService] Errore aggiornamento metriche:', error);
    }
  }

  /**
   * Calcola le statistiche della dashboard dai dati grezzi
   */
  private calculateDashboardStats(
    projects: Project[],
    activities: DashboardActivity[],
    metrics: ProjectMetrics[]
  ): DashboardStats {
    // Calcolo progetti totali e attivi
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      p => p.status !== 'completed' && p.status !== 'cancelled'
    ).length;

    // Calcolo budget totale
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

    // Calcolo ROI medio dai progetti (i progetti di fattibilità hanno già il ROI calcolato)
    const projectsWithROI = projects.filter(p => p.roi && p.roi > 0);
    const totalROI = projectsWithROI.reduce((sum, p) => sum + (p.roi || 0), 0);
    const averageROI = projectsWithROI.length > 0 ? totalROI / projectsWithROI.length : 0;

    // Calcolo progetti per tipo
    const projectsByType: Record<ProjectType, number> = {
      residential: 0,
      commercial: 0,
      mixed_use: 0,
      industrial: 0,
      infrastructure: 0,
    };

    projects.forEach(project => {
      if (project.type && projectsByType[project.type as ProjectType] !== undefined) {
        projectsByType[project.type as ProjectType]++;
      }
    });

    // Calcolo progetti per status
    const projectsByStatus: Record<ProjectStatus, number> = {
      draft: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      on_hold: 0,
    };

    projects.forEach(project => {
      if (project.status && projectsByStatus[project.status as ProjectStatus] !== undefined) {
        projectsByStatus[project.status as ProjectStatus]++;
      }
    });

    // Top performers (progetti con ROI più alto)
    const topPerformers = projects
      .filter(p => p.status !== 'cancelled')
      .sort((a, b) => {
        const roiA = metrics.find(m => m.projectId === a.id)?.roi || 0;
        const roiB = metrics.find(m => m.projectId === b.id)?.roi || 0;
        return roiB - roiA;
      })
      .slice(0, 5);

    // Riepilogo finanziario
    const financialSummary: FinancialSummary = {
      totalInvestment: totalBudget,
      totalRevenue: metrics.reduce((sum, m) => sum + m.revenue, 0),
      totalProfit: metrics.reduce((sum, m) => sum + m.profit, 0),
      averageMargin:
        metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.margin, 0) / metrics.length : 0,
      roiByProject: metrics.reduce(
        (acc, m) => {
          acc[m.projectId] = m.roi;
          return acc;
        },
        {} as Record<string, number>
      ),
      budgetUtilization:
        totalBudget > 0
          ? (metrics.reduce((sum, m) => sum + m.investment, 0) / totalBudget) * 100
          : 0,
    };

    return {
      totalProjects,
      activeProjects,
      totalBudget,
      averageROI,
      projectsByType,
      projectsByStatus,
      recentActivities: activities,
      topPerformers,
      financialSummary,
    };
  }

  /**
   * Parsing dello snapshot dei progetti
   */
  private parseProjectsSnapshot(snapshot: any): Project[] {
    const projects: Project[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      
      // Mappa i dati del progetto di fattibilità alla struttura Project
      const project: Project = {
        id: doc.id,
        name: data.name || 'Progetto senza nome',
        budget: data.costs?.total || 0,
        roi: data.results?.roi || 0,
        type: this.mapFeasibilityTypeToProjectType(data),
        status: this.mapFeasibilityStatusToProjectStatus(data.status),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
      
      projects.push(project);
    });

    return projects;
  }

  /**
   * Mappa il tipo di progetto di fattibilità al tipo di progetto dashboard
   */
  private mapFeasibilityTypeToProjectType(data: any): ProjectType {
    // Per ora mappiamo tutto a 'residential' dato che i progetti di fattibilità
    // non hanno un campo type esplicito
    return 'residential';
  }

  /**
   * Mappa lo status del progetto di fattibilità allo status del progetto dashboard
   */
  private mapFeasibilityStatusToProjectStatus(feasibilityStatus: string): ProjectStatus {
    switch (feasibilityStatus) {
      case 'PIANIFICAZIONE':
        return 'draft';
      case 'IN_CORSO':
        return 'active';
      case 'COMPLETATO':
        return 'completed';
      case 'SOSPESO':
        return 'on_hold';
      default:
        return 'draft';
    }
  }

  /**
   * Parsing dello snapshot delle attività
   */
  private parseActivitiesSnapshot(snapshot: any): DashboardActivity[] {
    const activities: DashboardActivity[] = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      activities.push({
        id: doc.id,
        type: data.type,
        projectId: data.projectId,
        projectName: data.projectName,
        description: data.description,
        timestamp: data.timestamp?.toDate() || new Date(),
        userId: data.userId,
        userName: data.userName,
      });
    });

    return activities;
  }

  /**
   * Inizializza i dati della dashboard se non esistono
   */
  async initializeDashboardData(): Promise<void> {
    try {
      console.log('🚀 [DashboardService] Inizializzazione dati dashboard...');

      // Verifica se esistono già progetti
      const existingProjects = await this.getAllProjects();

      if (existingProjects.length === 0) {
        console.log(
          '📝 [DashboardService] Nessun progetto esistente, creazione dati di esempio...'
        );

        // Crea progetti di esempio basati sui dati reali che hai
        const sampleProjects = [
          {
            id: 'ciliegie-project',
            name: 'Ciliegie',
            description: 'Progetto residenziale Via delle Ciliegie, 157 Roma',
            location: 'Via delle Ciliegie, 157 Roma',
            type: 'RESIDENTIAL' as ProjectType,
            status: 'PLANNING' as ProjectStatus,
            totalInvestment: 200000,
            expectedRevenue: 622000,
            startDate: new Date('2024-01-01'),
            isActive: true,
            createdAt: new Date('2024-01-01'),
            lastUpdated: new Date(),
            ownerId: 'current-user',
            teamMembers: [],
            documents: [],
            milestones: [],
          },
          {
            id: 'morena-editoriale-project',
            name: 'Morena Editoriale',
            description: 'Progetto commerciale Via Campo Romano, 66 Roma',
            location: 'Via Campo Romano, 66 Roma',
            type: 'COMMERCIAL' as ProjectType,
            status: 'PLANNING' as ProjectStatus,
            totalInvestment: 1000000,
            expectedRevenue: 1608000,
            startDate: new Date('2024-02-01'),
            isActive: true,
            createdAt: new Date('2024-02-01'),
            lastUpdated: new Date(),
            ownerId: 'current-user',
            teamMembers: [],
            documents: [],
            milestones: [],
          },
        ];

        // Salva i progetti di esempio
        for (const project of sampleProjects) {
          const projectRef = doc(db, this.PROJECTS_COLLECTION, project.id);
          await setDoc(projectRef, {
            ...project,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });

          // Crea le metriche del progetto
          const margin =
            ((project.expectedRevenue - project.totalInvestment) / project.expectedRevenue) * 100;
          const roi =
            ((project.expectedRevenue - project.totalInvestment) / project.totalInvestment) * 100;

          await this.updateProjectMetrics(project.id, {
            projectId: project.id,
            projectName: project.name,
            status: project.status,
            type: project.type,
            investment: project.totalInvestment,
            revenue: project.expectedRevenue,
            profit: project.expectedRevenue - project.totalInvestment,
            margin: Math.round(margin * 100) / 100,
            roi: Math.round(roi * 100) / 100,
            progress: 25, // 25% per progetti in pianificazione
            lastUpdated: new Date(),
          });

          // Registra l'attività di creazione
          await this.logDashboardActivity({
            type: 'project_created',
            projectId: project.id,
            projectName: project.name,
            description: `Progetto ${project.name} creato`,
            timestamp: new Date(),
            userId: 'current-user',
            userName: 'Sistema',
          });
        }

        console.log('✅ [DashboardService] Dati dashboard inizializzati con successo');
      } else {
        console.log(
          '✅ [DashboardService] Progetti esistenti trovati, dashboard già inizializzata'
        );
      }
    } catch (error) {
      console.error('❌ [DashboardService] Errore inizializzazione dashboard:', error);
    }
  }
}

export const dashboardService = new DashboardService();
