'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from './Badge';
import {
  MLModel,
  Dataset,
  Prediction,
  TrainingRun,
  MLAlert,
  MLExperiment,
  MLWorkflow,
  MLStats,
  ModelType,
  ModelStatus,
  DatasetType,
  DatasetStatus,
  TrainingStatus,
  DeploymentStatus,
  PredictionStatus,
  ModelFramework,
  AlertType,
  OptimizationMetric
} from '@/types/aiml';
import { aimlService } from '@/lib/aimlService';
import { TeamRole } from '@/types/team';

interface AIMLCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function AIMLCenter({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar
}: AIMLCenterProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'datasets' | 'training' | 'predictions' | 'experiments' | 'workflows' | 'alerts'>('overview');
  
  // Stati per i dati
  const [mlStats, setMLStats] = useState<MLStats | null>(null);
  const [models, setModels] = useState<MLModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [alerts, setAlerts] = useState<MLAlert[]>([]);
  const [experiments, setExperiments] = useState<MLExperiment[]>([]);
  const [workflows, setWorkflows] = useState<MLWorkflow[]>([]);

  // Stati per filtri e ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [modelTypeFilter, setModelTypeFilter] = useState<ModelType | ''>('');
  const [modelStatusFilter, setModelStatusFilter] = useState<ModelStatus | ''>('');
  const [datasetTypeFilter, setDatasetTypeFilter] = useState<DatasetType | ''>('');
  const [alertTypeFilter, setAlertTypeFilter] = useState<AlertType | ''>('');

  // Stati per i modal
  const [showCreateModel, setShowCreateModel] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showDatasetDetails, setShowDatasetDetails] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [showTrainingDetails, setShowTrainingDetails] = useState(false);
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedTraining, setSelectedTraining] = useState<TrainingRun | null>(null);

  // Form states
  const [newModel, setNewModel] = useState({
    name: '',
    description: '',
    type: 'classification' as ModelType,
    framework: 'scikit_learn' as ModelFramework,
    datasetId: ''
  });

  const [predictionInput, setPredictionInput] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Refresh data ogni 30 secondi
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = () => {
    setMLStats(aimlService.generateMLStats());
    setModels(aimlService.getModels());
    setDatasets(aimlService.getDatasets());
    setPredictions(aimlService.getPredictions());
    setTrainingRuns(aimlService.getTrainingRuns());
    setAlerts(aimlService.getMLAlerts());
    setExperiments(aimlService.getExperiments());
    setWorkflows(aimlService.getWorkflows());
  };

  const handleCreateModel = () => {
    try {
      const model = aimlService.createModel(
        newModel.name,
        newModel.description,
        newModel.type,
        newModel.framework,
        newModel.datasetId,
        currentUserId
      );

      setModels(prev => [...prev, model]);
      setNewModel({
        name: '',
        description: '',
        type: 'classification',
        framework: 'scikit_learn',
        datasetId: ''
      });
      setShowCreateModel(false);

      console.log('Modello creato con successo!');
    } catch (error) {
      console.error('Errore nella creazione del modello:', error);
    }
  };

  const handleStartTraining = (modelId: string) => {
    try {
      const trainingRun = aimlService.startTraining(modelId);
      setTrainingRuns(prev => [...prev, trainingRun]);
      loadData(); // Ricarica per aggiornare lo stato del modello
      console.log('Training avviato con successo!');
    } catch (error) {
      console.error('Errore nell\'avvio del training:', error);
    }
  };

  const handleMakePrediction = () => {
    if (!selectedModel) return;
    
    try {
      const prediction = aimlService.createPrediction(
        selectedModel.id,
        predictionInput,
        currentUserId
      );
      
      setPredictions(prev => [...prev, prediction]);
      setPredictionInput({});
      setShowPredictionModal(false);
      console.log('Predizione creata con successo!', prediction);
    } catch (error) {
      console.error('Errore nella creazione della predizione:', error);
    }
  };

  const handleUpdateModelStatus = (modelId: string, status: ModelStatus) => {
    const success = aimlService.updateModelStatus(modelId, status);
    if (success) {
      loadData();
      console.log('Status modello aggiornato con successo!');
    }
  };

  const handleUpdateAlertStatus = (alertId: string, status: 'active' | 'acknowledged' | 'resolved' | 'suppressed') => {
    const success = aimlService.updateAlertStatus(alertId, status);
    if (success) {
      loadData();
      console.log('Status alert aggiornato con successo!');
    }
  };

  const getModelTypeColor = (type: ModelType) => {
    const colors = {
      classification: 'bg-blue-100 text-blue-800',
      regression: 'bg-green-100 text-green-800',
      clustering: 'bg-purple-100 text-purple-800',
      anomaly_detection: 'bg-red-100 text-red-800',
      recommendation: 'bg-yellow-100 text-yellow-800',
      nlp: 'bg-indigo-100 text-indigo-800',
      computer_vision: 'bg-pink-100 text-pink-800',
      time_series: 'bg-teal-100 text-teal-800',
      reinforcement_learning: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: ModelStatus | DatasetStatus | TrainingStatus | DeploymentStatus) => {
    const colors = {
      training: 'bg-yellow-100 text-yellow-800',
      trained: 'bg-blue-100 text-blue-800',
      deployed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      deprecated: 'bg-gray-100 text-gray-800',
      testing: 'bg-purple-100 text-purple-800',
      uploading: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800',
      queued: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paused: 'bg-yellow-100 text-yellow-800',
      deploying: 'bg-yellow-100 text-yellow-800',
      updating: 'bg-blue-100 text-blue-800',
      stopped: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAlertSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('it-IT', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const filteredModels = models.filter(model => {
    const matchesQuery = searchQuery === '' || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = modelTypeFilter === '' || model.type === modelTypeFilter;
    const matchesStatus = modelStatusFilter === '' || model.status === modelStatusFilter;
    
    return matchesQuery && matchesType && matchesStatus;
  });

  const filteredDatasets = datasets.filter(dataset => {
    const matchesQuery = searchQuery === '' || 
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = datasetTypeFilter === '' || dataset.type === datasetTypeFilter;
    
    return matchesQuery && matchesType;
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesType = alertTypeFilter === '' || alert.type === alertTypeFilter;
    return matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI & Machine Learning Center</h2>
              <p className="text-sm text-gray-500">Centro avanzato per gestione AI e Machine Learning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* ML Stats Overview */}
        {mlStats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Modelli Attivi</p>
                    <p className="text-2xl font-bold text-blue-900">{mlStats.models.deployed}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🧠</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  su {mlStats.models.total} totali
                </p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Predizioni Oggi</p>
                    <p className="text-2xl font-bold text-green-900">{mlStats.predictions.today}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">🎯</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {mlStats.predictions.thisMonth} questo mese
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Training Attivi</p>
                    <p className="text-2xl font-bold text-yellow-900">{mlStats.training.activeJobs}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">⚡</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  {formatNumber(mlStats.training.averageTrainingTime, 1)}min media
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Dataset</p>
                    <p className="text-2xl font-bold text-purple-900">{mlStats.datasets.total}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">📊</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {formatNumber(mlStats.datasets.totalSize, 1)}GB totali
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Alert ML</p>
                    <p className="text-2xl font-bold text-red-900">{mlStats.alerts.active}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚨</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  drift e performance
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Esperimenti</p>
                    <p className="text-2xl font-bold text-indigo-900">{mlStats.experiments.active}</p>
                  </div>
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600">🔬</span>
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-1">
                  {mlStats.experiments.completed} completati
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '🎯', count: 0 },
              { id: 'models', label: 'Modelli', icon: '🧠', count: models.length },
              { id: 'datasets', label: 'Dataset', icon: '📊', count: datasets.length },
              { id: 'training', label: 'Training', icon: '⚡', count: trainingRuns.filter(tr => tr.status === 'running').length },
              { id: 'predictions', label: 'Predizioni', icon: '🎯', count: predictions.length },
              { id: 'experiments', label: 'Esperimenti', icon: '🔬', count: experiments.length },
              { id: 'workflows', label: 'Workflow', icon: '🔄', count: workflows.length },
              { id: 'alerts', label: 'Alert', icon: '🚨', count: alerts.filter(a => a.status === 'active').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-purple-100 text-purple-800">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && mlStats && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Model Performance */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Modelli</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Accuracy Media</span>
                        <span className="text-sm font-medium text-gray-900">87.5%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '87.5%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Latenza Media</span>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(mlStats.predictions.averageLatency)}ms</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Success Rate</span>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(100 - mlStats.predictions.errorRate)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${100 - mlStats.predictions.errorRate}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resource Usage */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Utilizzo Risorse</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">CPU</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{mlStats.resourceUsage.cpu.current} cores</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Memory</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{mlStats.resourceUsage.memory.current}GB</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">GPU</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-purple-500 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{mlStats.resourceUsage.gpu?.current}h</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Storage</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full">
                          <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(mlStats.resourceUsage.storage.total)}GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Types Distribution */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuzione Tipi di Modello</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(mlStats.models.byType).map(([type, count]) => (
                    <div key={type} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <Badge className={getModelTypeColor(type as ModelType)}>
                        {type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attività Recenti</h3>
                <div className="space-y-3">
                  {trainingRuns.slice(0, 5).map((training) => (
                    <div key={training.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">⚡</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Training {training.modelId}</p>
                          <p className="text-xs text-gray-500">{formatDate(training.startedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(training.status)}>
                          {training.status}
                        </Badge>
                        {training.progress !== undefined && (
                          <span className="text-sm text-gray-600">{training.progress}%</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Modelli Machine Learning</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Cerca modelli..."
                  />
                  <select
                    value={modelTypeFilter}
                    onChange={(e) => setModelTypeFilter(e.target.value as ModelType | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Tutti i tipi</option>
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                    <option value="clustering">Clustering</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="nlp">NLP</option>
                    <option value="computer_vision">Computer Vision</option>
                  </select>
                  <select
                    value={modelStatusFilter}
                    onChange={(e) => setModelStatusFilter(e.target.value as ModelStatus | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="training">Training</option>
                    <option value="trained">Trained</option>
                    <option value="deployed">Deployed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button
                    onClick={() => setShowCreateModel(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Modello
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredModels.map((model) => (
                  <div key={model.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{model.name}</h4>
                          <Badge className={getModelTypeColor(model.type)}>
                            {model.type}
                          </Badge>
                          <Badge className={getStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Framework:</span>
                            <span className="ml-2 font-medium">{model.framework}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Versione:</span>
                            <span className="ml-2 font-medium">{model.version}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Dataset:</span>
                            <span className="ml-2 font-medium">{model.datasetName}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Owner:</span>
                            <span className="ml-2 font-medium">{model.owner}</span>
                          </div>
                        </div>

                        {/* Metriche modello */}
                        {model.metrics && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Performance</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {model.metrics.accuracy && (
                                <div>Accuracy: <span className="font-medium">{formatNumber(model.metrics.accuracy * 100)}%</span></div>
                              )}
                              {model.metrics.mae && (
                                <div>MAE: <span className="font-medium">{formatNumber(model.metrics.mae)}</span></div>
                              )}
                              {model.metrics.r2Score && (
                                <div>R²: <span className="font-medium">{formatNumber(model.metrics.r2Score)}</span></div>
                              )}
                              {model.metrics.aucRoc && (
                                <div>AUC-ROC: <span className="font-medium">{formatNumber(model.metrics.aucRoc)}</span></div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {model.status === 'trained' && (
                          <button
                            onClick={() => handleUpdateModelStatus(model.id, 'deployed')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🚀 Deploy
                          </button>
                        )}
                        {model.status === 'deployed' && (
                          <button
                            onClick={() => {
                              setSelectedModel(model);
                              setShowPredictionModal(true);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🎯 Predici
                          </button>
                        )}
                        {['training', 'trained'].includes(model.status) && (
                          <button
                            onClick={() => handleStartTraining(model.id)}
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ⚡ Ritraina
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedModel(model);
                            setShowModelDetails(true);
                          }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Creato: {formatDate(model.createdAt)}</span>
                      {model.lastPredictionAt && (
                        <span>Ultima predizione: {formatDate(model.lastPredictionAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Dataset Machine Learning</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Cerca dataset..."
                  />
                  <select
                    value={datasetTypeFilter}
                    onChange={(e) => setDatasetTypeFilter(e.target.value as DatasetType | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Tutti i tipi</option>
                    <option value="structured">Structured</option>
                    <option value="unstructured">Unstructured</option>
                    <option value="time_series">Time Series</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDatasets.map((dataset) => (
                  <div key={dataset.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => {
                         setSelectedDataset(dataset);
                         setShowDatasetDetails(true);
                       }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                          <Badge className={getModelTypeColor(dataset.type as any)}>
                            {dataset.type}
                          </Badge>
                          <Badge className={getStatusColor(dataset.status)}>
                            {dataset.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{dataset.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Righe:</span>
                            <span className="ml-2 font-medium">{dataset.schema.rowCount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Colonne:</span>
                            <span className="ml-2 font-medium">{dataset.schema.columns.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Dimensione:</span>
                            <span className="ml-2 font-medium">{formatBytes(dataset.schema.size)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Versione:</span>
                            <span className="ml-2 font-medium">{dataset.version}</span>
                          </div>
                        </div>

                        {/* Data Quality */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Qualità Dati</h5>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Completezza:</span>
                              <span className="ml-2 font-medium text-green-600">{formatNumber(dataset.quality.completeness)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Validità:</span>
                              <span className="ml-2 font-medium text-blue-600">{formatNumber(dataset.quality.validity)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Consistenza:</span>
                              <span className="ml-2 font-medium text-purple-600">{formatNumber(dataset.quality.consistency)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Accuratezza:</span>
                              <span className="ml-2 font-medium text-orange-600">{formatNumber(dataset.quality.accuracy)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Owner: {dataset.owner}</span>
                      <span>Aggiornato: {formatDate(dataset.updatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Training Jobs</h3>
              
              <div className="space-y-4">
                {trainingRuns.map((training) => (
                  <div key={training.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">Training {training.modelId}</h4>
                          <Badge className={getStatusColor(training.status)}>
                            {training.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Progresso:</span>
                            <span className="ml-2 font-medium">{training.progress?.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Epoca:</span>
                            <span className="ml-2 font-medium">{training.currentEpoch}/{training.totalEpochs}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Durata:</span>
                            <span className="ml-2 font-medium">
                              {training.duration ? formatDuration(training.duration) : 'In corso...'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Avviato:</span>
                            <span className="ml-2 font-medium">{formatDate(training.startedAt)}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {training.progress !== undefined && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-600">Progresso Training</span>
                              <span className="font-medium">{training.progress.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-purple-500 rounded-full transition-all duration-300" 
                                style={{ width: `${training.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Metriche Training */}
                        {training.finalMetrics && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Metriche Finali</h5>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(training.finalMetrics).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-500">{key}:</span>
                                  <span className="ml-2 font-medium">{formatNumber(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedTraining(training);
                            setShowTrainingDetails(true);
                          }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        {training.status === 'running' && (
                          <button
                            className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ⏹️ Stop
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Alert Machine Learning</h3>
                <select
                  value={alertTypeFilter}
                  onChange={(e) => setAlertTypeFilter(e.target.value as AlertType | '')}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Tutti i tipi</option>
                  <option value="model_drift">Model Drift</option>
                  <option value="data_drift">Data Drift</option>
                  <option value="performance_degradation">Performance Degradation</option>
                  <option value="prediction_anomaly">Prediction Anomaly</option>
                  <option value="training_failure">Training Failure</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge className={getAlertSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge className={alert.status === 'active' ? 'bg-red-100 text-red-800' : 
                                         alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-800' :
                                         'bg-green-100 text-green-800'}>
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <span className="ml-2 font-medium">{alert.type}</span>
                          </div>
                          {alert.modelId && (
                            <div>
                              <span className="text-gray-500">Modello:</span>
                              <span className="ml-2 font-medium">{alert.modelId}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Valore:</span>
                            <span className="ml-2 font-medium">{formatNumber(alert.triggerValue)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Soglia:</span>
                            <span className="ml-2 font-medium">{formatNumber(alert.threshold)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Attivato:</span>
                            <span className="ml-2 font-medium">{formatDate(alert.triggeredAt)}</span>
                          </div>
                        </div>

                        {/* Azioni suggerite */}
                        {alert.suggestedActions.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-900 mb-2">Azioni Suggerite</h5>
                            <ul className="text-sm text-blue-800 space-y-1">
                              {alert.suggestedActions.map((action, index) => (
                                <li key={index}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleUpdateAlertStatus(alert.id, 'acknowledged')}
                              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              ✅ Riconosci
                            </button>
                            <button
                              onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}
                              className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              🔧 Risolvi
                            </button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <button
                            onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🔧 Risolvi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Creazione Modello */}
        {showCreateModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Modello ML</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newModel.name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nome del modello"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    placeholder="Descrizione del modello"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={newModel.type}
                      onChange={(e) => setNewModel(prev => ({ ...prev, type: e.target.value as ModelType }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="classification">Classification</option>
                      <option value="regression">Regression</option>
                      <option value="clustering">Clustering</option>
                      <option value="recommendation">Recommendation</option>
                      <option value="nlp">NLP</option>
                      <option value="computer_vision">Computer Vision</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Framework</label>
                    <select
                      value={newModel.framework}
                      onChange={(e) => setNewModel(prev => ({ ...prev, framework: e.target.value as ModelFramework }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="scikit_learn">Scikit-Learn</option>
                      <option value="tensorflow">TensorFlow</option>
                      <option value="pytorch">PyTorch</option>
                      <option value="xgboost">XGBoost</option>
                      <option value="lightgbm">LightGBM</option>
                      <option value="huggingface">HuggingFace</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dataset</label>
                  <select
                    value={newModel.datasetId}
                    onChange={(e) => setNewModel(prev => ({ ...prev, datasetId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Seleziona dataset</option>
                    {datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>{dataset.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModel(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateModel}
                  disabled={!newModel.name || !newModel.datasetId}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea Modello
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Predizione */}
        {showPredictionModal && selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Predizione - {selectedModel.name}</h3>
              
              <div className="space-y-4">
                {selectedModel.features.slice(0, 4).map((feature) => (
                  <div key={feature.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {feature.name} ({feature.type})
                    </label>
                    {feature.type === 'categorical' ? (
                      <select
                        value={predictionInput[feature.name] || ''}
                        onChange={(e) => setPredictionInput(prev => ({ ...prev, [feature.name]: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Seleziona...</option>
                        {feature.name === 'location' && (
                          <>
                            <option value="Milano">Milano</option>
                            <option value="Roma">Roma</option>
                            <option value="Torino">Torino</option>
                            <option value="Napoli">Napoli</option>
                          </>
                        )}
                        {feature.name === 'property_type' && (
                          <>
                            <option value="Apartment">Apartment</option>
                            <option value="House">House</option>
                            <option value="Villa">Villa</option>
                            <option value="Loft">Loft</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={predictionInput[feature.name] || ''}
                        onChange={(e) => setPredictionInput(prev => ({ ...prev, [feature.name]: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                        placeholder={`Inserisci ${feature.name}`}
                        step="0.01"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPredictionModal(false);
                    setPredictionInput({});
                    setSelectedModel(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleMakePrediction}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  🎯 Predici
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
