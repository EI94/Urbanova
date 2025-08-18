'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BuildingIcon } from '@/components/icons';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Task {
  id: string;
  name: string;
  category: 'PROGETTAZIONE' | 'PERMESSI' | 'COSTRUZIONE' | 'MARKETING' | 'VENDITA' | 'AMMINISTRATIVO';
  status: 'NON_INIZIATO' | 'IN_CORSO' | 'COMPLETATO' | 'IN_RITARDO' | 'BLOCCATO';
  priority: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BASSA';
  startDate: Date;
  endDate: Date;
  duration: number; // giorni
  progress: number; // 0-100
  assignedTo: string;
  dependencies: string[]; // task IDs
  milestones: string[];
  cost: number;
  resources: string[];
  notes?: string;
  risks?: string[];
  aiSuggestions?: string[];
}

interface Milestone {
  id: string;
  name: string;
  date: Date;
  status: 'RAGGIUNTO' | 'IN_CORSO' | 'A_RISCHIO' | 'IN_RITARDO';
  importance: 'CRITICO' | 'IMPORTANTE' | 'NORMALE';
  relatedTasks: string[];
  description: string;
}

interface ProjectTimeline {
  projectName: string;
  startDate: Date;
  plannedEndDate: Date;
  actualEndDate?: Date;
  totalDuration: number;
  progress: number;
  status: 'PIANIFICAZIONE' | 'IN_CORSO' | 'COMPLETATO' | 'IN_RITARDO';
  budget: number;
  actualCost: number;
}

export default function ProjectTimelinePage() {
  const { t, formatCurrency: fmtCurrency, formatDate: fmtDate } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [timeline, setTimeline] = useState<ProjectTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'gantt' | 'kanban' | 'timeline' | 'resources'>('gantt');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y'>('6M');

  useEffect(() => {
    // Mock data
    const mockTasks: Task[] = [
      {
        id: 'task-1',
        name: 'Progetto Architettonico Preliminare',
        category: 'PROGETTAZIONE',
        status: 'COMPLETATO',
        priority: 'CRITICA',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-30'),
        duration: 30,
        progress: 100,
        assignedTo: 'Arch. Marco Rossi',
        dependencies: [],
        milestones: ['Approvazione Cliente'],
        cost: 15000,
        resources: ['CAD License', 'Rendering Software'],
        aiSuggestions: ['Progetto completato nei tempi previsti']
      },
      {
        id: 'task-2',
        name: 'Richiesta Permesso di Costruire',
        category: 'PERMESSI',
        status: 'IN_CORSO',
        priority: 'CRITICA',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-03-15'),
        duration: 60,
        progress: 65,
        assignedTo: 'Ing. Laura Bianchi',
        dependencies: ['task-1'],
        milestones: ['Documentazione Completa', 'Presentazione Pratica'],
        cost: 5000,
        resources: ['Consulente Urbanistico'],
        notes: 'In attesa risposta ufficio tecnico',
        aiSuggestions: ['Sollecitare ufficio tecnico entro 5 giorni', 'Preparare documentazione integrativa']
      },
      {
        id: 'task-3',
        name: 'Scavi e Fondazioni',
        category: 'COSTRUZIONE',
        status: 'NON_INIZIATO',
        priority: 'ALTA',
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-04-30'),
        duration: 40,
        progress: 0,
        assignedTo: 'Impresa Costruzioni SRL',
        dependencies: ['task-2'],
        milestones: ['Inizio Scavi', 'Fondazioni Complete'],
        cost: 85000,
        resources: ['Escavatore', 'Cemento', 'Operai Specializzati'],
        risks: ['Maltempo', 'Problemi geologici'],
        aiSuggestions: ['Verificare condizioni meteo marzo', 'Schedulare indagini geotecniche aggiuntive']
      },
      {
        id: 'task-4',
        name: 'Struttura e Copertura',
        category: 'COSTRUZIONE',
        status: 'NON_INIZIATO',
        priority: 'ALTA',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-07-31'),
        duration: 90,
        progress: 0,
        assignedTo: 'Impresa Costruzioni SRL',
        dependencies: ['task-3'],
        milestones: ['Struttura Completata', 'Copertura Installata'],
        cost: 120000,
        resources: ['Gru', 'Acciaio', 'Calcestruzzo', 'Operai'],
        risks: ['Ritardo forniture acciaio'],
        aiSuggestions: ['Pre-ordinare materiali con anticipo', 'Identificare fornitori alternativi']
      },
      {
        id: 'task-5',
        name: 'Impianti Tecnologici',
        category: 'COSTRUZIONE',
        status: 'NON_INIZIATO',
        priority: 'MEDIA',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        duration: 90,
        progress: 0,
        assignedTo: 'Ditta Impianti Tech',
        dependencies: ['task-4'],
        milestones: ['Impianti Elettrici', 'Impianti Idraulici', 'Climatizzazione'],
        cost: 45000,
        resources: ['Elettricista', 'Idraulico', 'Materiali Impianti'],
        aiSuggestions: ['Coordinare con team strutturale per passaggi']
      },
      {
        id: 'task-6',
        name: 'Campagna Marketing Pre-vendita',
        category: 'MARKETING',
        status: 'IN_CORSO',
        priority: 'MEDIA',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-06-30'),
        duration: 150,
        progress: 30,
        assignedTo: 'Agenzia Marketing Solutions',
        dependencies: ['task-1'],
        milestones: ['Lancio Campagna', 'Showroom Aperto', '50% Pre-vendite'],
        cost: 25000,
        resources: ['Designer Grafico', 'Fotografo', 'Social Media Manager'],
        aiSuggestions: ['Aumentare budget social media', 'Organizzare eventi VIP']
      }
    ];

    const mockMilestones: Milestone[] = [
      {
        id: 'milestone-1',
        name: 'Approvazione Progetto',
        date: new Date('2024-01-30'),
        status: 'RAGGIUNTO',
        importance: 'CRITICO',
        relatedTasks: ['task-1'],
        description: 'Approvazione definitiva del progetto architettonico da parte del cliente'
      },
      {
        id: 'milestone-2',
        name: 'Ottenimento Permessi',
        date: new Date('2024-03-15'),
        status: 'IN_CORSO',
        importance: 'CRITICO',
        relatedTasks: ['task-2'],
        description: 'Rilascio permesso di costruire dal comune'
      },
      {
        id: 'milestone-3',
        name: 'Inizio Costruzione',
        date: new Date('2024-03-20'),
        status: 'A_RISCHIO',
        importance: 'CRITICO',
        relatedTasks: ['task-3'],
        description: 'Avvio ufficiale dei lavori di costruzione'
      },
      {
        id: 'milestone-4',
        name: 'Struttura Completata',
        date: new Date('2024-07-31'),
        status: 'IN_CORSO',
        importance: 'IMPORTANTE',
        relatedTasks: ['task-4'],
        description: 'Completamento della struttura portante dell\'edificio'
      },
      {
        id: 'milestone-5',
        name: 'Pre-vendite Target',
        date: new Date('2024-06-30'),
        status: 'IN_CORSO',
        importance: 'IMPORTANTE',
        relatedTasks: ['task-6'],
        description: 'Raggiungimento del 60% di pre-vendite'
      }
    ];

    const mockTimeline: ProjectTimeline = {
      projectName: 'Residenza Vista Mare',
      startDate: new Date('2024-01-01'),
      plannedEndDate: new Date('2024-12-31'),
      totalDuration: 365,
      progress: 35,
      status: 'IN_CORSO',
      budget: 295000,
      actualCost: 95000
    };

    setTimeout(() => {
      setTasks(mockTasks);
      setMilestones(mockMilestones);
      setTimeline(mockTimeline);
      setLoading(false);
    }, 1200);
  }, []);

  // Helper functions
  const formatCurrency = (value: number) => fmtCurrency(value);
  const formatDate = (date: Date) => fmtDate(date);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETATO': return 'bg-green-100 text-green-800';
      case 'IN_CORSO': return 'bg-blue-100 text-blue-800';
      case 'NON_INIZIATO': return 'bg-gray-100 text-gray-800';
      case 'IN_RITARDO': return 'bg-red-100 text-red-800';
      case 'BLOCCATO': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICA': return 'bg-red-100 text-red-800 border-red-300';
      case 'ALTA': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'BASSA': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'RAGGIUNTO': return 'bg-green-100 text-green-600 border-green-300';
      case 'IN_CORSO': return 'bg-blue-100 text-blue-600 border-blue-300';
      case 'A_RISCHIO': return 'bg-orange-100 text-orange-600 border-orange-300';
      case 'IN_RITARDO': return 'bg-red-100 text-red-600 border-red-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getDaysFromStart = (startDate: Date, targetDate: Date) => {
    const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredTasks = selectedCategory === 'ALL' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'COMPLETATO').length,
    inProgressTasks: tasks.filter(t => t.status === 'IN_CORSO').length,
    delayedTasks: tasks.filter(t => t.status === 'IN_RITARDO').length,
    totalBudget: tasks.reduce((sum, t) => sum + t.cost, 0)
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📅 {t('title', 'projectTimeline')}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle', 'projectTimeline')}</p>
          </div>
        </div>

        {/* Project Summary */}
        {timeline && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('projectSummary', 'projectTimeline')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                <div className="text-sm text-gray-600">{t('totalTasks', 'projectTimeline')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                <div className="text-sm text-gray-600">{t('completed', 'projectTimeline')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
                <div className="text-sm text-gray-600">{t('inProgress', 'projectTimeline')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.delayedTasks}</div>
                <div className="text-sm text-gray-600">{t('delayed', 'projectTimeline')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'gantt', label: t('tabs.ganttChart', 'projectTimeline') },
                { key: 'kanban', label: t('tabs.kanbanBoard', 'projectTimeline') },
                { key: 'timeline', label: t('tabs.milestoneTimeline', 'projectTimeline') },
                { key: 'resources', label: t('tabs.resources', 'projectTimeline') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeView === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {[
                  { key: 'ALL', label: t('filters.all', 'projectTimeline') },
                  { key: 'PROGETTAZIONE', label: t('filters.design', 'projectTimeline') },
                  { key: 'PERMESSI', label: t('filters.permits', 'projectTimeline') },
                  { key: 'COSTRUZIONE', label: t('filters.construction', 'projectTimeline') },
                  { key: 'MARKETING', label: t('filters.marketing', 'projectTimeline') }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedCategory(filter.key)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      selectedCategory === filter.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex space-x-2">
                {['3M', '6M', '1Y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      timeRange === range
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">{t('tabs.ganttChart', 'projectTimeline')}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header Timeline */}
                <div className="flex bg-gray-100 border-b">
                  <div className="w-80 p-4 font-medium text-gray-700 border-r">Task</div>
                  <div className="flex-1 flex">
                    {timeline && Array.from({length: 12}, (_, i) => (
                      <div key={i} className="flex-1 p-2 text-center text-xs text-gray-600 border-r">
                        {new Date(2024, i).toLocaleDateString('it-IT', { month: 'short' })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks */}
                {filteredTasks.map((task) => {
                  const startOffset = getDaysFromStart(timeline?.startDate || new Date(), task.startDate);
                  const taskDuration = getDaysFromStart(task.startDate, task.endDate);
                  const totalDays = 365;
                  
                  return (
                    <div key={task.id} className="flex border-b hover:bg-gray-50">
                      <div className="w-80 p-4 border-r">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status === 'COMPLETATO' ? '✓' : 
                             task.status === 'IN_CORSO' ? '⏳' :
                             task.status === 'NON_INIZIATO' ? '○' : '⚠️'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{task.name}</div>
                            <div className="text-xs text-gray-500">{task.assignedTo}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 relative h-16 flex items-center">
                        <div 
                          className="absolute h-6 rounded flex items-center justify-center text-xs text-white font-medium"
                          style={{
                            left: `${(startOffset / totalDays) * 100}%`,
                            width: `${Math.max((taskDuration / totalDays) * 100, 2)}%`,
                            backgroundColor: task.status === 'COMPLETATO' ? '#10b981' : 
                                           task.status === 'IN_CORSO' ? '#3b82f6' :
                                           task.status === 'IN_RITARDO' ? '#ef4444' : '#6b7280'
                          }}
                        >
                          {task.progress > 0 && `${task.progress}%`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board View */}
        {activeView === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['NON_INIZIATO', 'IN_CORSO', 'COMPLETATO', 'BLOCCATO'].map((status) => {
              const statusTasks = tasks.filter(t => t.status === status);
              
              return (
                <div key={status} className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    <span>{status.replace('_', ' ')}</span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">{statusTasks.length}</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {statusTasks.map((task) => (
                      <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm border">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{task.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-3">
                          <p>{task.assignedTo}</p>
                          <p>{formatDate(task.startDate)} - {formatDate(task.endDate)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{task.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Milestone Timeline View */}
        {activeView === 'timeline' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{milestone.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="mb-2">{milestone.description}</p>
                    <p className="font-medium">{formatDate(milestone.date)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Importanza: {milestone.importance}</span>
                    <span>Task correlate: {milestone.relatedTasks.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources View */}
        {activeView === 'resources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team Members */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Team e Assegnazioni</h3>
                
                <div className="space-y-4">
                  {Array.from(new Set(tasks.map(t => t.assignedTo))).map((person) => {
                    const personTasks = tasks.filter(t => t.assignedTo === person);
                    const completedTasks = personTasks.filter(t => t.status === 'COMPLETATO').length;
                    const workload = personTasks.reduce((sum, t) => sum + (t.status !== 'COMPLETATO' ? 1 : 0), 0);
                    
                    return (
                      <div key={person} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{person}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            workload === 0 ? 'bg-green-100 text-green-800' :
                            workload <= 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {workload === 0 ? 'Libero' : `${workload} task attive`}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Task totali: {personTasks.length}</p>
                          <p>Completate: {completedTasks}</p>
                          <p>Budget gestito: {formatCurrency(personTasks.reduce((sum, t) => sum + t.cost, 0))}</p>
                        </div>
                        
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(completedTasks / personTasks.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Budget Tracking */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Budget per Categoria</h3>
                
                <div className="space-y-4">
                  {['PROGETTAZIONE', 'PERMESSI', 'COSTRUZIONE', 'MARKETING'].map((category) => {
                    const categoryTasks = tasks.filter(t => t.category === category);
                    const categoryBudget = categoryTasks.reduce((sum, t) => sum + t.cost, 0);
                    const totalBudget = stats.totalBudget;
                    const percentage = totalBudget > 0 ? (categoryBudget / totalBudget) * 100 : 0;
                    
                    return (
                      <div key={category} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{category}</h4>
                          <span className="font-bold text-gray-900">{formatCurrency(categoryBudget)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          {categoryTasks.length} task - {categoryTasks.filter(t => t.status === 'COMPLETATO').length} complete
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 