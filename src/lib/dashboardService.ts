import {
  collection,
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
} from 'firebase/firestore';

import { db } from './firebase';

import { Project, ProjectStatus, ProjectType } from '@/types/project';

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
  private readonly PROJECTS_COLLECTION = 'projects';
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
  subscribeToDashboardUpdates(callback: (stats: DashboardStats) => void): () => void {
    console.log('🔄 [DashboardService] Sottoscrizione aggiornamenti dashboard...');

    const projectsRef = collection(db, this.PROJECTS_COLLECTION);
    const activitiesRef = collection(db, this.ACTIVITIES_COLLECTION);

    // Sottoscrizione ai progetti
    const projectsUnsubscribe = onSnapshot(projectsRef, async snapshot => {
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
    });

    // Sottoscrizione alle attività
    const activitiesUnsubscribe = onSnapshot(activitiesRef, async snapshot => {
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
    });

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
      const projectsRef = collection(db, this.PROJECTS_COLLECTION);
      const q = query(projectsRef, where('isActive', '==', true), orderBy('lastUpdated', 'desc'));

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
      const metricsRef = collection(db, this.METRICS_COLLECTION);
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
      const activitiesRef = collection(db, this.ACTIVITIES_COLLECTION);
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
      const activitiesRef = collection(db, this.ACTIVITIES_COLLECTION);
      await doc(activitiesRef).set({
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
      await metricsRef.set(
        {
          ...metrics,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

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
      p => p.status !== 'COMPLETED' && p.status !== 'CANCELLED'
    ).length;

    // Calcolo budget totale
    const totalBudget = projects.reduce((sum, p) => sum + (p.totalInvestment || 0), 0);

    // Calcolo ROI medio
    const totalROI = metrics.reduce((sum, m) => sum + m.roi, 0);
    const averageROI = metrics.length > 0 ? totalROI / metrics.length : 0;

    // Calcolo progetti per tipo
    const projectsByType: Record<ProjectType, number> = {
      RESIDENTIAL: 0,
      COMMERCIAL: 0,
      MIXED: 0,
      INDUSTRIAL: 0,
    };

    projects.forEach(project => {
      if (project.type && projectsByType[project.type] !== undefined) {
        projectsByType[project.type]++;
      }
    });

    // Calcolo progetti per status
    const projectsByStatus: Record<ProjectStatus, number> = {
      PLANNING: 0,
      IN_PROGRESS: 0,
      PENDING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    projects.forEach(project => {
      if (project.status && projectsByStatus[project.status] !== undefined) {
        projectsByStatus[project.status]++;
      }
    });

    // Top performers (progetti con ROI più alto)
    const topPerformers = projects
      .filter(p => p.status !== 'CANCELLED')
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

    snapshot.forEach(doc => {
      const data = doc.data();
      projects.push({
        id: doc.id,
        name: data.name || 'Progetto senza nome',
        description: data.description || '',
        location: data.location || '',
        type: data.type || 'RESIDENTIAL',
        status: data.status || 'PLANNING',
        totalInvestment: data.totalInvestment || 0,
        expectedRevenue: data.expectedRevenue || 0,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate(),
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
        ownerId: data.ownerId || '',
        teamMembers: data.teamMembers || [],
        documents: data.documents || [],
        milestones: data.milestones || [],
      });
    });

    return projects;
  }

  /**
   * Parsing dello snapshot delle attività
   */
  private parseActivitiesSnapshot(snapshot: any): DashboardActivity[] {
    const activities: DashboardActivity[] = [];

    snapshot.forEach(doc => {
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
          await projectRef.set({
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
