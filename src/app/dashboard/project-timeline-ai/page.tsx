'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import {
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  BuildingIcon,
  UserIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  RocketIcon,
} from '@/components/icons';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  projectTimelineService,
  ProjectTask,
  ProjectMilestone,
} from '@/lib/projectTimelineService';

export default function ProjectTimelineAIPage() {
  const authContext = useAuth();
  const user = authContext?.currentUser || null;
  const [activeView, setActiveView] = useState<'gantt' | 'kanban' | 'milestone' | 'risorse'>(
    'gantt'
  );
  const [activeFilter, setActiveFilter] = useState<string>('Tutte');
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('1Y');

  // Stati principali
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stati per modali e azioni
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewMilestoneModal, setShowNewMilestoneModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  // Stati per nuovo task
  const [newTaskData, setNewTaskData] = useState({
    projectId: 'project-1',
    projectName: 'Villa Moderna Roma',
    name: '',
    description: '',
    category: 'PROGETTAZIONE' as const,
    priority: 'MEDIUM' as const,
    assignedTo: {
      id: '',
      name: '',
      role: '',
      company: '',
    },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    estimatedDuration: 30,
    dependencies: [] as string[],
    milestone: false,
    criticalPath: false,
    budget: {
      estimated: 0,
      currency: 'EUR',
    },
    tags: [] as string[],
  });

  // Stati per progetti disponibili
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [availableResources, setAvailableResources] = useState<any[]>([]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simula progetti disponibili (in produzione verrebbero da un servizio progetti)
      setAvailableProjects([
        { id: 'project-1', name: 'Villa Moderna Roma', location: 'Roma, Italia' },
        { id: 'project-2', name: 'Appartamento Centro Milano', location: 'Milano, Italia' },
        { id: 'project-3', name: 'Uffici Commerciali Torino', location: 'Torino, Italia' },
      ]);

      // Simula risorse disponibili
      setAvailableResources([
        {
          id: 'arch-1',
          name: 'Arch. Marco Rossi',
          role: 'Architetto Capo',
          company: 'Studio Architettura Rossi',
        },
        {
          id: 'ing-1',
          name: 'Ing. Laura Bianchi',
          role: 'Ingegnere Civile',
          company: 'Studio Tecnico Bianchi',
        },
        {
          id: 'imp-1',
          name: 'Impresa Costruzioni SRL',
          role: 'Impresa Edile',
          company: 'Impresa Costruzioni SRL',
        },
        {
          id: 'imp-2',
          name: 'Ditta Impianti Tech',
          role: 'Installatore Impianti',
          company: 'Ditta Impianti Tech',
        },
        {
          id: 'mark-1',
          name: 'Agenzia Marketing Solutions',
          role: 'Agenzia Marketing',
          company: 'Agenzia Marketing Solutions',
        },
      ]);

      // Inizializza timeline di esempio se non esistono task
      await projectTimelineService.initializeSampleTimeline('project-1', 'Villa Moderna Roma');

      // Carica dati in parallelo
      const [projectTasks, projectMilestones, timelineStats] = await Promise.all([
        projectTimelineService.getProjectTasks('project-1'),
        projectTimelineService.getProjectMilestones('project-1'),
        projectTimelineService.getTimelineStats('project-1'),
      ]);

      setTasks(projectTasks);
      setMilestones(projectMilestones);
      setStats(timelineStats);

      console.log('✅ [ProjectTimeline] Dati caricati:', {
        tasks: projectTasks.length,
        milestones: projectMilestones.length,
        stats: timelineStats,
      });
    } catch (error) {
      console.error('❌ [ProjectTimeline] Errore caricamento dati:', error);
      setError('Impossibile caricare i dati della timeline');
    } finally {
      setLoading(false);
    }
  };

  const createNewTask = async () => {
    try {
      if (!newTaskData.name || !newTaskData.assignedTo.id) {
        toast('❌ Compila tutti i campi obbligatori', { icon: '❌' });
        return;
      }

      const taskId = await projectTimelineService.createTask(newTaskData);
      console.log('✅ [ProjectTimeline] Nuovo task creato:', taskId);

      toast('✅ Task creato con successo!', { icon: '✅' });
      setShowNewTaskModal(false);

      // Reset form e ricarica dati
      setNewTaskData({
        projectId: 'project-1',
        projectName: 'Villa Moderna Roma',
        name: '',
        description: '',
        category: 'PROGETTAZIONE',
        priority: 'MEDIUM',
        assignedTo: { id: '', name: '', role: '', company: '' },
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedDuration: 30,
        dependencies: [],
        milestone: false,
        criticalPath: false,
        budget: { estimated: 0, currency: 'EUR' },
        tags: [],
      });

      await loadData();
    } catch (error) {
      console.error('❌ [ProjectTimeline] Errore creazione task:', error);
      toast('❌ Errore durante la creazione del task', { icon: '❌' });
    }
  };

  const createNewMilestone = async () => {
    try {
      if (!newTaskData.name || !newTaskData.projectId) {
        toast('❌ Compila tutti i campi obbligatori', { icon: '❌' });
        return;
      }

      const milestoneData = {
        projectId: newTaskData.projectId,
        projectName: newTaskData.projectName,
        name: newTaskData.name,
        description: newTaskData.description,
        date: newTaskData.startDate,
        type: 'PROJECT_START' as const,
        importance: 'MEDIUM' as const,
        dependencies: newTaskData.dependencies,
        notes: [],
      };

      const milestoneId = await projectTimelineService.createMilestone(milestoneData);
      console.log('✅ [ProjectTimeline] Nuovo milestone creato:', milestoneId);

      toast('✅ Milestone creato con successo!', { icon: '✅' });
      setShowNewMilestoneModal(false);

      await loadData();
    } catch (error) {
      console.error('❌ [ProjectTimeline] Errore creazione milestone:', error);
      toast('❌ Errore durante la creazione del milestone', { icon: '❌' });
    }
  };

  const updateTaskProgress = async (taskId: string, progress: number) => {
    try {
      await projectTimelineService.updateTaskProgress(taskId, progress);
      console.log('✅ [ProjectTimeline] Progresso task aggiornato:', taskId, progress);

      // Ricarica dati per aggiornare UI
      await loadData();
    } catch (error) {
      console.error('❌ [ProjectTimeline] Errore aggiornamento progresso:', error);
      toast("❌ Errore durante l'aggiornamento del progresso", { icon: '❌' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DELAYED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PROGETTAZIONE':
        return 'bg-blue-100 text-blue-800';
      case 'PERMESSI':
        return 'bg-purple-100 text-purple-800';
      case 'COSTRUZIONE':
        return 'bg-green-100 text-green-800';
      case 'MARKETING':
        return 'bg-orange-100 text-orange-800';
      case 'FINANZIARIO':
        return 'bg-yellow-100 text-yellow-800';
      case 'LEGALE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getFilteredTasks = () => {
    if (activeFilter === 'Tutte') return tasks;
    return tasks.filter(task => task.category === activeFilter);
  };

  const getMonthLabel = (month: number) => {
    const months = [
      'gen',
      'feb',
      'mar',
      'apr',
      'mag',
      'giu',
      'lug',
      'ago',
      'set',
      'ott',
      'nov',
      'dic',
    ];
    return months[month];
  };

  const getTimeRangeMonths = () => {
    const months = [];
    const now = new Date();
    let count = 0;

    if (timeRange === '3M') count = 3;
    else if (timeRange === '6M') count = 6;
    else count = 12;

    for (let i = 0; i < count; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push({
        month: month.getMonth(),
        year: month.getFullYear(),
        label: getMonthLabel(month.getMonth()),
      });
    }

    return months;
  };

  if (loading) {
    return (
      <DashboardLayout title="Project Timeline AI">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento timeline progetto...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Project Timeline AI">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-red-600 text-xl">❌ {error}</div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Riprova
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Project Timeline AI">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Timeline AI</h1>
            <p className="text-gray-600 mt-2">
              Gestione intelligente timeline con diagrammi Gantt e milestone
            </p>
          </div>

          {/* Azioni principali */}
          <div className="flex space-x-3">
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2 inline" />
              Nuovo Task
            </button>

            <button
              onClick={() => setShowNewMilestoneModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CalendarDaysIcon className="h-4 w-4 mr-2 inline" />
              Nuovo Milestone
            </button>
          </div>
        </div>

        {/* Riepilogo Progetto */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Totale Task</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completate</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Corso</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.inProgressTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Ritardo</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.delayedTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project View Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'gantt', label: 'Gantt Chart', icon: <ChartBarIcon className="h-4 w-4" /> },
              { id: 'kanban', label: 'Kanban Board', icon: <BuildingIcon className="h-4 w-4" /> },
              {
                id: 'milestone',
                label: 'Milestone Timeline',
                icon: <CalendarDaysIcon className="h-4 w-4" />,
              },
              { id: 'risorse', label: 'Risorse', icon: <UserIcon className="h-4 w-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Task Filter Tabs */}
        <div className="flex space-x-2">
          {['Tutte', 'PROGETTAZIONE', 'PERMESSI', 'COSTRUZIONE', 'MARKETING'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Contenuto Gantt Chart */}
        {activeView === 'gantt' && (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-end">
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                {(['3M', '6M', '1Y'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Header Timeline */}
                  <div className="flex border-b border-gray-200">
                    <div className="w-64 p-4 bg-gray-50 font-medium text-gray-700">
                      Task / Assegnato
                    </div>
                    {getTimeRangeMonths().map((month, index) => (
                      <div
                        key={index}
                        className="flex-1 p-4 bg-gray-50 text-center font-medium text-gray-700 min-w-[120px]"
                      >
                        {month.label}
                      </div>
                    ))}
                  </div>

                  {/* Task Rows */}
                  {getFilteredTasks().map(task => (
                    <div key={task.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                      {/* Task Info */}
                      <div className="w-64 p-4 flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {task.status === 'COMPLETED' ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          ) : task.category === 'PERMESSI' ? (
                            <BuildingIcon className="h-5 w-5 text-purple-600" />
                          ) : (
                            <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{task.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {task.assignedTo.name} - {task.assignedTo.company}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Bars */}
                      {getTimeRangeMonths().map((month, monthIndex) => {
                        const monthStart = new Date(month.year, month.month, 1);
                        const monthEnd = new Date(month.year, month.month + 1, 0);

                        // Calcola se il task è attivo in questo mese
                        const taskStart = new Date(task.startDate);
                        const taskEnd = new Date(task.endDate);

                        const isActive = taskStart <= monthEnd && taskEnd >= monthStart;
                        const progress = task.progress;

                        if (!isActive) {
                          return <div key={monthIndex} className="flex-1 p-4 min-w-[120px]"></div>;
                        }

                        // Calcola larghezza e posizione della barra
                        const monthWidth = 120; // px
                        let barWidth = monthWidth;
                        let barOffset = 0;

                        if (taskStart > monthStart) {
                          const daysInMonth = monthEnd.getDate();
                          const daysFromStart =
                            (taskStart.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24);
                          barOffset = (daysFromStart / daysInMonth) * monthWidth;
                        }

                        if (taskEnd < monthEnd) {
                          const daysInMonth = monthEnd.getDate();
                          const daysToEnd =
                            (monthEnd.getTime() - taskEnd.getTime()) / (1000 * 60 * 60 * 24);
                          const endOffset = (daysToEnd / daysInMonth) * monthWidth;
                          barWidth = monthWidth - endOffset;
                        }

                        return (
                          <div key={monthIndex} className="flex-1 p-4 min-w-[120px] relative">
                            <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                              <div
                                className={`absolute top-0 left-0 h-full rounded-lg transition-all duration-300 ${
                                  task.status === 'COMPLETED'
                                    ? 'bg-green-500'
                                    : task.status === 'IN_PROGRESS'
                                      ? 'bg-blue-500'
                                      : task.status === 'DELAYED'
                                        ? 'bg-red-500'
                                        : 'bg-gray-400'
                                }`}
                                style={{
                                  width: `${barWidth}px`,
                                  left: `${barOffset}px`,
                                }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-medium text-white drop-shadow">
                                  {progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenuto Kanban Board */}
        {activeView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map(status => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4 capitalize">
                  {status.replace('_', ' ')} (
                  {getFilteredTasks().filter(t => t.status === status).length})
                </h3>
                <div className="space-y-3">
                  {getFilteredTasks()
                    .filter(task => task.status === status)
                    .map(task => (
                      <div key={task.id} className="bg-white rounded-lg p-3 shadow-sm">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{task.name}</h4>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{task.assignedTo.name}</span>
                          <span
                            className={`px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}
                          >
                            {task.category}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contenuto Milestone Timeline */}
        {activeView === 'milestone' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {milestones.map(milestone => (
                  <div key={milestone.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            milestone.status === 'ACHIEVED'
                              ? 'bg-green-100 text-green-800'
                              : milestone.status === 'DELAYED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {milestone.status}
                        </span>
                        <span className="text-sm text-gray-500">{formatDate(milestone.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Contenuto Risorse */}
        {activeView === 'risorse' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Gestione Risorse</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risorsa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ruolo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azienda
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Assegnati
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {availableResources.map(resource => {
                      const assignedTasks = tasks.filter(t => t.assignedTo.id === resource.id);
                      return (
                        <tr key={resource.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {resource.name}
                                </div>
                                <div className="text-sm text-gray-500">{resource.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {resource.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {resource.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {assignedTasks.length} task
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <EditIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modale Nuovo Task */}
        {showNewTaskModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nuovo Task</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Task
                    </label>
                    <input
                      type="text"
                      value={newTaskData.name}
                      onChange={e => setNewTaskData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={newTaskData.category}
                      onChange={e =>
                        setNewTaskData(prev => ({ ...prev, category: e.target.value as any }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PROGETTAZIONE">PROGETTAZIONE</option>
                      <option value="PERMESSI">PERMESSI</option>
                      <option value="COSTRUZIONE">COSTRUZIONE</option>
                      <option value="MARKETING">MARKETING</option>
                      <option value="FINANZIARIO">FINANZIARIO</option>
                      <option value="LEGALE">LEGALE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assegnato a
                    </label>
                    <select
                      value={newTaskData.assignedTo.id}
                      onChange={e => {
                        const resource = availableResources.find(r => r.id === e.target.value);
                        setNewTaskData(prev => ({
                          ...prev,
                          assignedTo: {
                            id: e.target.value,
                            name: resource?.name || '',
                            role: resource?.role || '',
                            company: resource?.company || '',
                          },
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleziona risorsa</option>
                      {availableResources.map(resource => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name} - {resource.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durata Stimata (giorni)
                    </label>
                    <input
                      type="number"
                      value={newTaskData.estimatedDuration}
                      onChange={e =>
                        setNewTaskData(prev => ({
                          ...prev,
                          estimatedDuration: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Stimato (€)
                    </label>
                    <input
                      type="number"
                      value={newTaskData.budget.estimated}
                      onChange={e =>
                        setNewTaskData(prev => ({
                          ...prev,
                          budget: { ...prev.budget, estimated: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewTaskModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={createNewTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crea Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale Nuovo Milestone */}
        {showNewMilestoneModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Nuovo Milestone</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Milestone
                    </label>
                    <input
                      type="text"
                      value={newTaskData.name}
                      onChange={e => setNewTaskData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={newTaskData.startDate.toISOString().split('T')[0]}
                      onChange={e =>
                        setNewTaskData(prev => ({
                          ...prev,
                          startDate: new Date(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrizione
                    </label>
                    <textarea
                      value={newTaskData.description}
                      onChange={e =>
                        setNewTaskData(prev => ({ ...prev, description: e.target.value }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewMilestoneModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={createNewMilestone}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crea Milestone
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
