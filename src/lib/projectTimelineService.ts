import {doc,
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
  addDoc } from 'firebase/firestore';

import { db } from './firebase';
import { safeCollection } from './firebaseUtils';

// 🛡️ OS PROTECTION - Importa protezione CSS per project timeline service
import '@/lib/osProtection';

export interface ProjectTask {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  category: 'PROGETTAZIONE' | 'PERMESSI' | 'COSTRUZIONE' | 'MARKETING' | 'FINANZIARIO' | 'LEGALE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED' | 'DELAYED';
  assignedTo: {
    id: string;
    name: string;
    role: string;
    company?: string;
    avatar?: string;
  };
  startDate: Date;
  endDate: Date;
  estimatedDuration: number; // giorni
  actualDuration?: number; // giorni
  progress: number; // 0-100
  dependencies: string[]; // ID dei task da cui dipende
  predecessors: string[]; // ID dei task che dipendono da questo
  milestone: boolean;
  criticalPath: boolean;
  budget: {
    estimated: number;
    actual: number;
    currency: string;
  };
  resources: {
    id: string;
    name: string;
    type: 'HUMAN' | 'EQUIPMENT' | 'MATERIAL';
    allocation: number; // percentuale
  }[];
  documents: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
  notes: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  date: Date;
  type:
    | 'PROJECT_START'
    | 'DESIGN_COMPLETE'
    | 'PERMITS_APPROVED'
    | 'CONSTRUCTION_START'
    | 'FOUNDATION_COMPLETE'
    | 'STRUCTURE_COMPLETE'
    | 'MEP_COMPLETE'
    | 'INTERIOR_COMPLETE'
    | 'FINAL_INSPECTION'
    | 'PROJECT_COMPLETE';
  status: 'PENDING' | 'ACHIEVED' | 'DELAYED' | 'CANCELLED';
  importance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dependencies: string[]; // ID dei task che devono essere completati
  achievedAt?: Date;
  delayedReason?: string;
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectResource {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  type: 'HUMAN' | 'EQUIPMENT' | 'MATERIAL';
  category: string;
  availability: {
    startDate: Date;
    endDate: Date;
    allocation: number; // percentuale
    maxAllocation: number; // percentuale massima
  };
  cost: {
    hourly?: number;
    daily?: number;
    unit?: number;
    total: number;
    currency: string;
  };
  skills?: string[];
  specifications?: string;
  status: 'AVAILABLE' | 'ALLOCATED' | 'UNAVAILABLE' | 'MAINTENANCE';
  assignedTasks: string[]; // ID dei task assegnati
  performance: {
    efficiency: number; // 0-100
    quality: number; // 0-100
    reliability: number; // 0-100
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  totalDuration: number; // giorni
  criticalPath: string[]; // ID dei task critici
  phases: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    tasks: string[]; // ID dei task
    milestones: string[]; // ID dei milestone
    progress: number; // 0-100
  }[];
  baseline: {
    startDate: Date;
    endDate: Date;
    tasks: ProjectTask[];
    milestones: ProjectMilestone[];
  };
  actual: {
    startDate?: Date;
    endDate?: Date;
    tasks: ProjectTask[];
    milestones: ProjectMilestone[];
  };
  variance: {
    schedule: number; // giorni di ritardo/anticipo
    cost: number; // differenza budget
    scope: number; // variazione scope
  };
  risks: {
    id: string;
    description: string;
    probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    mitigation: string;
    status: 'OPEN' | 'MITIGATED' | 'CLOSED';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  category: ProjectTask['category'];
  priority: ProjectTask['priority'];
  assignedTo: {
    id: string;
    name: string;
    role: string;
    company?: string;
  };
  startDate: Date;
  endDate: Date;
  estimatedDuration: number;
  dependencies?: string[];
  milestone?: boolean;
  criticalPath?: boolean;
  budget?: {
    estimated: number;
    currency: string;
  };
  tags?: string[];
}

export interface CreateMilestoneData {
  projectId: string;
  projectName: string;
  name: string;
  description: string;
  date: Date;
  type: ProjectMilestone['type'];
  importance: ProjectMilestone['importance'];
  dependencies?: string[];
  notes?: string[];
}

export class ProjectTimelineService {
  private readonly TASKS_COLLECTION = 'projectTasks';
  private readonly MILESTONES_COLLECTION = 'projectMilestones';
  private readonly RESOURCES_COLLECTION = 'projectResources';
  private readonly TIMELINES_COLLECTION = 'projectTimelines';

  /**
   * Crea un nuovo task
   */
  async createTask(taskData: CreateTaskData): Promise<string> {
    try {
      console.log('🏗️ [ProjectTimelineService] Creazione nuovo task:', taskData.name);

      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newTask: ProjectTask = {
        id: taskId,
        ...taskData,
        status: 'NOT_STARTED',
        progress: 0,
        dependencies: taskData.dependencies || [],
        predecessors: [],
        milestone: taskData.milestone || false,
        criticalPath: taskData.criticalPath || false,
        budget: {
          estimated: taskData.budget?.estimated || 0,
          actual: 0,
          currency: taskData.budget?.currency || 'EUR',
        },
        resources: [],
        documents: [],
        notes: [],
        tags: taskData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user', // TODO: Integrare con AuthContext
        lastModifiedBy: 'current-user',
      };

      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      await setDoc(taskRef, {
        ...newTask,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [ProjectTimelineService] Task creato con successo:', taskId);
      return taskId;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore creazione task:', error);
      throw new Error(`Impossibile creare il task: ${error}`);
    }
  }

  /**
   * Crea un nuovo milestone
   */
  async createMilestone(milestoneData: CreateMilestoneData): Promise<string> {
    try {
      console.log('🎯 [ProjectTimelineService] Creazione nuovo milestone:', milestoneData.name);

      const milestoneId = `milestone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newMilestone: ProjectMilestone = {
        id: milestoneId,
        ...milestoneData,
        status: 'PENDING',
        dependencies: milestoneData.dependencies || [],
        notes: milestoneData.notes || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const milestoneRef = doc(db, this.MILESTONES_COLLECTION, milestoneId);
      await setDoc(milestoneRef, {
        ...newMilestone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('✅ [ProjectTimelineService] Milestone creato con successo:', milestoneId);
      return milestoneId;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore creazione milestone:', error);
      throw new Error(`Impossibile creare il milestone: ${error}`);
    }
  }

  /**
   * Recupera tutti i task di un progetto
   */
  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    try {
      console.log('📋 [ProjectTimelineService] Recupero task progetto:', projectId);

      const tasksRef = safeCollection(this.TASKS_COLLECTION);
      const q = query(tasksRef, where('projectId', '==', projectId), orderBy('startDate', 'asc'));

      const querySnapshot = await getDocs(q);
      const tasks: ProjectTask[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ProjectTask);
      });

      console.log('✅ [ProjectTimelineService] Task recuperati:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore recupero task:', error);
      throw new Error(`Impossibile recuperare i task: ${error}`);
    }
  }

  /**
   * Recupera tutti i milestone di un progetto
   */
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    try {
      console.log('🎯 [ProjectTimelineService] Recupero milestone progetto:', projectId);

      const milestonesRef = safeCollection(this.MILESTONES_COLLECTION);
      const q = query(milestonesRef, where('projectId', '==', projectId), orderBy('date', 'asc'));

      const querySnapshot = await getDocs(q);
      const milestones: ProjectMilestone[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        milestones.push({
          ...data,
          date: data.date?.toDate() || new Date(),
          achievedAt: data.achievedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ProjectMilestone);
      });

      console.log('✅ [ProjectTimelineService] Milestone recuperati:', milestones.length);
      return milestones;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore recupero milestone:', error);
      throw new Error(`Impossibile recuperare i milestone: ${error}`);
    }
  }

  /**
   * Recupera tutti i task di un utente
   */
  async getUserTasks(userId: string): Promise<ProjectTask[]> {
    try {
      console.log('📋 [ProjectTimelineService] Recupero task utente:', userId);

      const tasksRef = safeCollection(this.TASKS_COLLECTION);
      const q = query(tasksRef, where('assignedTo.id', '==', userId), orderBy('startDate', 'asc'));

      const querySnapshot = await getDocs(q);
      const tasks: ProjectTask[] = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        tasks.push({
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as ProjectTask);
      });

      console.log('✅ [ProjectTimelineService] Task utente recuperati:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore recupero task utente:', error);
      throw new Error(`Impossibile recuperare i task utente: ${error}`);
    }
  }

  /**
   * Aggiorna un task
   */
  async updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<void> {
    try {
      console.log('✏️ [ProjectTimelineService] Aggiornamento task:', taskId);

      const taskRef = doc(db, this.TASKS_COLLECTION, taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: 'current-user', // TODO: Integrare con AuthContext
      });

      console.log('✅ [ProjectTimelineService] Task aggiornato con successo');
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore aggiornamento task:', error);
      throw new Error(`Impossibile aggiornare il task: ${error}`);
    }
  }

  /**
   * Cambia lo stato di un task
   */
  async changeTaskStatus(taskId: string, status: ProjectTask['status']): Promise<void> {
    try {
      console.log('🔄 [ProjectTimelineService] Cambio stato task:', taskId, status);

      const updates: Partial<ProjectTask> = { status };

      // Aggiorna progresso in base al nuovo stato
      if (status === 'COMPLETED') {
        updates.progress = 100;
        updates.actualDuration = 0; // TODO: Calcola durata effettiva
      } else if (status === 'IN_PROGRESS') {
        updates.progress = Math.max(1, updates.progress || 0);
      }

      await this.updateTask(taskId, updates);

      console.log('✅ [ProjectTimelineService] Stato task aggiornato');
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore cambio stato task:', error);
      throw new Error(`Impossibile cambiare lo stato del task: ${error}`);
    }
  }

  /**
   * Aggiorna il progresso di un task
   */
  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    try {
      console.log('📊 [ProjectTimelineService] Aggiornamento progresso task:', taskId, progress);

      const updates: Partial<ProjectTask> = { progress };

      // Aggiorna stato se necessario
      if (progress === 100) {
        updates.status = 'COMPLETED';
      } else if (progress > 0) {
        updates.status = 'IN_PROGRESS';
      }

      await this.updateTask(taskId, updates);

      console.log('✅ [ProjectTimelineService] Progresso task aggiornato');
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore aggiornamento progresso task:', error);
      throw new Error(`Impossibile aggiornare il progresso del task: ${error}`);
    }
  }

  /**
   * Inizializza timeline di esempio per un progetto
   */
  async initializeSampleTimeline(projectId: string, projectName: string): Promise<void> {
    try {
      console.log(
        '🏗️ [ProjectTimelineService] Inizializzazione timeline esempio per progetto:',
        projectName
      );

      // Crea task di esempio
      const sampleTasks: CreateTaskData[] = [
        {
          projectId,
          projectName,
          name: 'Progetto Architettonico Preliminare',
          description: 'Sviluppo del concept architettonico e planimetrie preliminari',
          category: 'PROGETTAZIONE',
          priority: 'HIGH',
          assignedTo: {
            id: 'arch-1',
            name: 'Arch. Marco Rossi',
            role: 'Architetto Capo',
            company: 'Studio Architettura Rossi',
          },
          startDate: new Date(Date.now()),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 giorni
          estimatedDuration: 30,
          milestone: true,
          criticalPath: true,
          budget: { estimated: 15000, currency: 'EUR' },
          tags: ['design', 'architettura', 'preliminare'],
        },
        {
          projectId,
          projectName,
          name: 'Richiesta Permesso di Costruire',
          description:
            'Preparazione e presentazione della documentazione per il permesso di costruire',
          category: 'PERMESSI',
          priority: 'CRITICAL',
          assignedTo: {
            id: 'ing-1',
            name: 'Ing. Laura Bianchi',
            role: 'Ingegnere Civile',
            company: 'Studio Tecnico Bianchi',
          },
          startDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 giorni da oggi
          endDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000), // 85 giorni da oggi
          estimatedDuration: 60,
          dependencies: ['task-1'], // Dipende dal progetto architettonico
          milestone: true,
          criticalPath: true,
          budget: { estimated: 8000, currency: 'EUR' },
          tags: ['permessi', 'urbanistico', 'burocrazia'],
        },
        {
          projectId,
          projectName,
          name: 'Scavi e Fondazioni',
          description: "Esecuzione degli scavi e realizzazione delle fondazioni dell'edificio",
          category: 'COSTRUZIONE',
          priority: 'HIGH',
          assignedTo: {
            id: 'imp-1',
            name: 'Impresa Costruzioni SRL',
            role: 'Impresa Edile',
            company: 'Impresa Costruzioni SRL',
          },
          startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 giorni da oggi
          endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 giorni da oggi
          estimatedDuration: 30,
          dependencies: ['task-2'], // Dipende dall'approvazione permessi
          milestone: false,
          criticalPath: true,
          budget: { estimated: 45000, currency: 'EUR' },
          tags: ['fondazioni', 'scavi', 'strutture'],
        },
        {
          projectId,
          projectName,
          name: 'Struttura e Copertura',
          description: "Realizzazione della struttura portante e della copertura dell'edificio",
          category: 'COSTRUZIONE',
          priority: 'HIGH',
          assignedTo: {
            id: 'imp-1',
            name: 'Impresa Costruzioni SRL',
            role: 'Impresa Edile',
            company: 'Impresa Costruzioni SRL',
          },
          startDate: new Date(Date.now() + 125 * 24 * 60 * 60 * 1000), // 125 giorni da oggi
          endDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000), // 185 giorni da oggi
          estimatedDuration: 60,
          dependencies: ['task-3'], // Dipende dalle fondazioni
          milestone: false,
          criticalPath: true,
          budget: { estimated: 120000, currency: 'EUR' },
          tags: ['struttura', 'copertura', 'cemento armato'],
        },
        {
          projectId,
          projectName,
          name: 'Impianti Tecnologici',
          description: 'Installazione di impianti elettrici, idraulici e di climatizzazione',
          category: 'COSTRUZIONE',
          priority: 'MEDIUM',
          assignedTo: {
            id: 'imp-2',
            name: 'Ditta Impianti Tech',
            role: 'Installatore Impianti',
            company: 'Ditta Impianti Tech',
          },
          startDate: new Date(Date.now() + 190 * 24 * 60 * 60 * 1000), // 190 giorni da oggi
          endDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000), // 240 giorni da oggi
          estimatedDuration: 50,
          dependencies: ['task-4'], // Dipende dalla struttura
          milestone: false,
          criticalPath: false,
          budget: { estimated: 35000, currency: 'EUR' },
          tags: ['impianti', 'elettrico', 'idraulico', 'climatizzazione'],
        },
        {
          projectId,
          projectName,
          name: 'Campagna Marketing Pre-vendita',
          description: 'Strategia di marketing e promozione per la vendita degli immobili',
          category: 'MARKETING',
          priority: 'MEDIUM',
          assignedTo: {
            id: 'mark-1',
            name: 'Agenzia Marketing Solutions',
            role: 'Agenzia Marketing',
            company: 'Agenzia Marketing Solutions',
          },
          startDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000), // 200 giorni da oggi
          endDate: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000), // 270 giorni da oggi
          estimatedDuration: 70,
          dependencies: ['task-2'], // Può iniziare dopo l'approvazione permessi
          milestone: false,
          criticalPath: false,
          budget: { estimated: 25000, currency: 'EUR' },
          tags: ['marketing', 'vendite', 'promozione'],
        },
      ];

      // Crea i task
      for (const taskData of sampleTasks) {
        await this.createTask(taskData);
      }

      // Crea milestone di esempio
      const sampleMilestones: CreateMilestoneData[] = [
        {
          projectId,
          projectName,
          name: 'Inizio Progetto',
          description: 'Avvio ufficiale del progetto edilizio',
          date: new Date(Date.now()),
          type: 'PROJECT_START',
          importance: 'CRITICAL',
        },
        {
          projectId,
          projectName,
          name: 'Progetto Architettonico Completato',
          description: 'Completamento della fase di progettazione architettonica',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          type: 'DESIGN_COMPLETE',
          importance: 'HIGH',
          dependencies: ['task-1'],
        },
        {
          projectId,
          projectName,
          name: 'Permessi Approvati',
          description: 'Approvazione di tutti i permessi necessari per la costruzione',
          date: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
          type: 'PERMITS_APPROVED',
          importance: 'CRITICAL',
          dependencies: ['task-2'],
        },
        {
          projectId,
          projectName,
          name: 'Inizio Costruzione',
          description: 'Avvio dei lavori di costruzione in cantiere',
          date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          type: 'CONSTRUCTION_START',
          importance: 'HIGH',
          dependencies: ['task-3'],
        },
        {
          projectId,
          projectName,
          name: 'Struttura Completata',
          description: "Completamento della struttura portante dell'edificio",
          date: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
          type: 'STRUCTURE_COMPLETE',
          importance: 'HIGH',
          dependencies: ['task-4'],
        },
        {
          projectId,
          projectName,
          name: 'Progetto Completato',
          description: 'Completamento di tutte le fasi del progetto',
          date: new Date(Date.now() + 270 * 24 * 60 * 60 * 1000),
          type: 'PROJECT_COMPLETE',
          importance: 'CRITICAL',
          dependencies: ['task-5', 'task-6'],
        },
      ];

      // Crea i milestone
      for (const milestoneData of sampleMilestones) {
        await this.createMilestone(milestoneData);
      }

      console.log(
        '✅ [ProjectTimelineService] Timeline esempio inizializzata per progetto:',
        projectName
      );
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore inizializzazione timeline esempio:', error);
      throw new Error(`Impossibile inizializzare la timeline di esempio: ${error}`);
    }
  }

  /**
   * Recupera statistiche della timeline
   */
  async getTimelineStats(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
    totalMilestones: number;
    achievedMilestones: number;
    overallProgress: number;
    criticalPathProgress: number;
    estimatedCompletion: Date;
  }> {
    try {
      console.log('📊 [ProjectTimelineService] Recupero statistiche timeline progetto:', projectId);

      const [tasks, milestones] = await Promise.all([
        this.getProjectTasks(projectId),
        this.getProjectMilestones(projectId),
      ]);

      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'COMPLETED').length,
        inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        delayedTasks: tasks.filter(t => t.status === 'DELAYED').length,
        totalMilestones: milestones.length,
        achievedMilestones: milestones.filter(m => m.status === 'ACHIEVED').length,
        overallProgress: 0,
        criticalPathProgress: 0,
        estimatedCompletion: new Date(),
      };

      // Calcola progresso complessivo
      if (tasks.length > 0) {
        stats.overallProgress = Math.round(
          tasks.reduce((total, t) => total + t.progress, 0) / tasks.length
        );
      }

      // Calcola progresso critical path
      const criticalTasks = tasks.filter(t => t.criticalPath);
      if (criticalTasks.length > 0) {
        stats.criticalPathProgress = Math.round(
          criticalTasks.reduce((total, t) => total + t.progress, 0) / criticalTasks.length
        );
      }

      // Stima completamento basata su task critici
      const remainingCriticalTasks = criticalTasks.filter(t => t.status !== 'COMPLETED');
      if (remainingCriticalTasks.length > 0) {
        const maxEndDate = new Date(
          Math.max(...remainingCriticalTasks.map(t => t.endDate.getTime()))
        );
        stats.estimatedCompletion = maxEndDate;
      }

      console.log('✅ [ProjectTimelineService] Statistiche timeline calcolate:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore calcolo statistiche timeline:', error);
      throw new Error(`Impossibile calcolare le statistiche della timeline: ${error}`);
    }
  }

  /**
   * Genera dati per Gantt chart
   */
  async getGanttData(projectId: string): Promise<{
    tasks: ProjectTask[];
    milestones: ProjectMilestone[];
    dependencies: Array<{ from: string; to: string }>;
    timeline: {
      startDate: Date;
      endDate: Date;
      phases: Array<{
        name: string;
        startDate: Date;
        endDate: Date;
        tasks: string[];
      }>;
    };
  }> {
    try {
      console.log('📊 [ProjectTimelineService] Generazione dati Gantt per progetto:', projectId);

      const [tasks, milestones] = await Promise.all([
        this.getProjectTasks(projectId),
        this.getProjectMilestones(projectId),
      ]);

      // Genera dipendenze
      const dependencies: Array<{ from: string; to: string }> = [];
      tasks.forEach(task => {
        task.dependencies.forEach(depId => {
          dependencies.push({ from: depId, to: task.id });
        });
      });

      // Organizza in fasi
      const phases = [
        {
          name: 'PROGETTAZIONE',
          startDate: new Date(
            Math.min(
              ...tasks.filter(t => t.category === 'PROGETTAZIONE').map(t => t.startDate.getTime())
            )
          ),
          endDate: new Date(
            Math.max(
              ...tasks.filter(t => t.category === 'PROGETTAZIONE').map(t => t.endDate.getTime())
            )
          ),
          tasks: tasks.filter(t => t.category === 'PROGETTAZIONE').map(t => t.id),
        },
        {
          name: 'PERMESSI',
          startDate: new Date(
            Math.min(
              ...tasks.filter(t => t.category === 'PERMESSI').map(t => t.startDate.getTime())
            )
          ),
          endDate: new Date(
            Math.max(...tasks.filter(t => t.category === 'PERMESSI').map(t => t.endDate.getTime()))
          ),
          tasks: tasks.filter(t => t.category === 'PERMESSI').map(t => t.id),
        },
        {
          name: 'COSTRUZIONE',
          startDate: new Date(
            Math.min(
              ...tasks.filter(t => t.category === 'COSTRUZIONE').map(t => t.startDate.getTime())
            )
          ),
          endDate: new Date(
            Math.max(
              ...tasks.filter(t => t.category === 'COSTRUZIONE').map(t => t.endDate.getTime())
            )
          ),
          tasks: tasks.filter(t => t.category === 'COSTRUZIONE').map(t => t.id),
        },
        {
          name: 'MARKETING',
          startDate: new Date(
            Math.min(
              ...tasks.filter(t => t.category === 'MARKETING').map(t => t.startDate.getTime())
            )
          ),
          endDate: new Date(
            Math.max(...tasks.filter(t => t.category === 'MARKETING').map(t => t.endDate.getTime()))
          ),
          tasks: tasks.filter(t => t.category === 'MARKETING').map(t => t.id),
        },
      ].filter(phase => phase.tasks.length > 0);

      const timeline = {
        startDate: new Date(Math.min(...tasks.map(t => t.startDate.getTime()))),
        endDate: new Date(Math.max(...tasks.map(t => t.endDate.getTime()))),
        phases,
      };

      const ganttData = {
        tasks,
        milestones,
        dependencies,
        timeline,
      };

      console.log('✅ [ProjectTimelineService] Dati Gantt generati:', {
        tasks: tasks.length,
        milestones: milestones.length,
        dependencies: dependencies.length,
        phases: phases.length,
      });

      return ganttData;
    } catch (error) {
      console.error('❌ [ProjectTimelineService] Errore generazione dati Gantt:', error);
      throw new Error(`Impossibile generare i dati per il Gantt chart: ${error}`);
    }
  }
}

// Esporta un'istanza singleton
export const projectTimelineService = new ProjectTimelineService();
