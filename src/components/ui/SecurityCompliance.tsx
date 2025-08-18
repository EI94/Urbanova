'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from './Badge';
import {
  SecurityPolicy,
  SecurityThreat,
  SecurityIncident,
  ComplianceFramework,
  SecurityAudit,
  SecurityMetrics,
  SecurityAlert,
  VulnerabilityAssessment,
  SecurityTraining,
  SecurityLevel,
  ThreatType,
  ComplianceStandard,
  IncidentStatus,
  IncidentSeverity,
  RiskLevel
} from '@/types/security';
import { securityService } from '@/lib/securityService';
import { TeamRole } from '@/types/team';

interface SecurityComplianceProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function SecurityCompliance({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar
}: SecurityComplianceProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'incidents' | 'compliance' | 'policies' | 'training'>('dashboard');
  
  // Stati per i dati
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [trainings, setTrainings] = useState<SecurityTraining[]>([]);
  const [threats, setThreats] = useState<SecurityThreat[]>([]);

  // Stati per i modal
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [showAlertDetails, setShowAlertDetails] = useState(false);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework | null>(null);

  // Form states
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    type: 'unauthorized_access' as ThreatType,
    severity: 'medium' as IncidentSeverity
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<SecurityLevel | ''>('');
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | ''>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setSecurityStats(securityService.generateSecurityStats());
    setAlerts(securityService.getSecurityAlerts());
    setIncidents(securityService.getSecurityIncidents());
    setPolicies(securityService.getSecurityPolicies());
    setFrameworks(securityService.getComplianceFrameworks());
    setTrainings(securityService.getSecurityTrainings());
    setThreats(securityService.getSecurityThreats());
  };

  const handleCreateIncident = () => {
    try {
      const incident = securityService.createSecurityIncident(
        newIncident.title,
        newIncident.description,
        newIncident.type,
        newIncident.severity,
        currentUserId
      );

      setIncidents(prev => [...prev, incident]);
      setNewIncident({
        title: '',
        description: '',
        type: 'unauthorized_access',
        severity: 'medium'
      });
      setShowCreateIncident(false);

      console.log('Incidente creato con successo!');
    } catch (error) {
      console.error('Errore nella creazione dell\'incidente:', error);
    }
  };

  const handleUpdateAlertStatus = (alertId: string, status: 'open' | 'investigating' | 'acknowledged' | 'resolved' | 'false_positive') => {
    const success = securityService.updateAlertStatus(alertId, status, currentUserId);
    if (success) {
      loadData(); // Ricarica i dati
      console.log('Status alert aggiornato con successo!');
    }
  };

  const handleUpdateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    const success = securityService.updateIncidentStatus(incidentId, status);
    if (success) {
      loadData(); // Ricarica i dati
      console.log('Status incidente aggiornato con successo!');
    }
  };

  const getSeverityColor = (severity: SecurityLevel | IncidentSeverity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      contained: 'bg-purple-100 text-purple-800',
      false_positive: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: RiskLevel) => {
    const colors = {
      very_low: 'bg-green-100 text-green-800',
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      very_high: 'bg-red-100 text-red-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[risk] || 'bg-gray-100 text-gray-800';
  };

  const getThreatTypeIcon = (type: ThreatType) => {
    const icons = {
      malware: '🦠',
      phishing: '🎣',
      data_breach: '💥',
      unauthorized_access: '🚫',
      ddos: '⚡',
      social_engineering: '🎭',
      insider_threat: '👤',
      compliance_violation: '⚖️'
    };
    return icons[type] || '⚠️';
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

  const filteredAlerts = alerts.filter(alert => {
    const matchesQuery = searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = filterSeverity === '' || alert.severity === filterSeverity;
    
    return matchesQuery && matchesSeverity;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesQuery = searchQuery === '' || 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === '' || incident.status === filterStatus;
    
    return matchesQuery && matchesStatus;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-lg">🔐</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Security & Compliance</h2>
              <p className="text-sm text-gray-500">Centro di controllo sicurezza e conformità</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Security Overview */}
        {securityStats && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Security Score</p>
                    <p className="text-2xl font-bold text-blue-900">{securityStats.overview.securityScore}%</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🛡️</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Alert Aperti</p>
                    <p className="text-2xl font-bold text-red-900">{securityStats.overview.openAlerts}</p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🚨</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  su {securityStats.overview.totalAlerts} totali
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Incidenti Attivi</p>
                    <p className="text-2xl font-bold text-orange-900">{securityStats.overview.openIncidents}</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">⚠️</span>
                  </div>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  su {securityStats.overview.totalIncidents} totali
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Minacce Attive</p>
                    <p className="text-2xl font-bold text-yellow-900">{securityStats.overview.activeThreats}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">⚡</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  su {securityStats.overview.totalThreats} totali
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Compliance</p>
                    <p className="text-2xl font-bold text-green-900">{securityStats.compliance.overallCompliance}%</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {securityStats.compliance.implementedControls}/{securityStats.compliance.totalControls} controlli
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Policy Attive</p>
                    <p className="text-2xl font-bold text-purple-900">{securityStats.overview.activePolicies}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">📋</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  su {securityStats.overview.totalPolicies} totali
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', count: 0 },
              { id: 'alerts', label: 'Alert', icon: '🚨', count: alerts.filter(a => a.status === 'open').length },
              { id: 'incidents', label: 'Incidenti', icon: '⚠️', count: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length },
              { id: 'compliance', label: 'Compliance', icon: '✅', count: frameworks.length },
              { id: 'policies', label: 'Policy', icon: '📋', count: policies.filter(p => p.isActive).length },
              { id: 'training', label: 'Training', icon: '🎓', count: trainings.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="ml-2 bg-red-100 text-red-800">
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && securityStats && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Security Trends */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Trend Sicurezza (30 giorni)</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Incidenti</span>
                        <span className="text-sm font-medium text-gray-900">
                          {securityStats.trends.incidentTrend.reduce((sum: number, item: any) => sum + item.count, 0)} totali
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-red-500 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Minacce</span>
                        <span className="text-sm font-medium text-gray-900">
                          {securityStats.trends.threatTrend.reduce((sum: number, item: any) => sum + item.count, 0)} totali
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Compliance</span>
                        <span className="text-sm font-medium text-gray-900">{securityStats.compliance.overallCompliance}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${securityStats.compliance.overallCompliance}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Threats */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Minacce Recenti</h3>
                  <div className="space-y-3">
                    {threats.slice(0, 5).map((threat) => (
                      <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getThreatTypeIcon(threat.type)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{threat.name}</p>
                            <p className="text-xs text-gray-500">{formatDate(threat.detectedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity}
                          </Badge>
                          <Badge className={getStatusColor(threat.status)}>
                            {threat.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Compliance Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stato Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {frameworks.map((framework) => (
                    <div key={framework.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{framework.name}</h4>
                        <Badge className={framework.compliancePercentage >= 95 ? 'bg-green-100 text-green-800' : 
                                       framework.compliancePercentage >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-red-100 text-red-800'}>
                          {framework.compliancePercentage}%
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Controlli implementati</span>
                          <span>{framework.implementedControls}/{framework.totalControls}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${framework.compliancePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Standard: {framework.standard.toUpperCase()}</p>
                        <p>Stato: {framework.certificationStatus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Alert di Sicurezza</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Cerca alert..."
                  />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as SecurityLevel | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="low">Bassa</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Critica</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Categoria:</span>
                            <span className="ml-2 font-medium">{alert.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sistema:</span>
                            <span className="ml-2 font-medium">{alert.source.system}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Rilevato:</span>
                            <span className="ml-2 font-medium">{formatDate(alert.triggeredAt)}</span>
                          </div>
                          {alert.assignedTo && (
                            <div>
                              <span className="text-gray-500">Assegnato a:</span>
                              <span className="ml-2 font-medium">{alert.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {alert.status === 'open' && (
                          <>
                            <button
                              onClick={() => handleUpdateAlertStatus(alert.id, 'acknowledged')}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              ✅ Riconosci
                            </button>
                            <button
                              onClick={() => handleUpdateAlertStatus(alert.id, 'investigating')}
                              className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              🔍 Investiga
                            </button>
                          </>
                        )}
                        {alert.status !== 'resolved' && (
                          <button
                            onClick={() => handleUpdateAlertStatus(alert.id, 'resolved')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ✅ Risolvi
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setShowAlertDetails(true);
                          }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Incidenti di Sicurezza</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Cerca incidenti..."
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as IncidentStatus | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="open">Aperto</option>
                    <option value="investigating">In investigazione</option>
                    <option value="contained">Contenuto</option>
                    <option value="resolved">Risolto</option>
                    <option value="closed">Chiuso</option>
                  </select>
                  <button
                    onClick={() => setShowCreateIncident(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuovo Incidente
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredIncidents.map((incident) => (
                  <div key={incident.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xl">{getThreatTypeIcon(incident.type)}</span>
                          <h4 className="font-medium text-gray-900">{incident.title}</h4>
                          <Badge className={getSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <span className="ml-2 font-medium">{incident.type}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Categoria:</span>
                            <span className="ml-2 font-medium">{incident.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Riportato:</span>
                            <span className="ml-2 font-medium">{formatDate(incident.reportedAt)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Team:</span>
                            <span className="ml-2 font-medium">{incident.responseTeam.length} membri</span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Confidenzialità:</span>
                              <Badge className={getRiskColor(incident.impact.confidentiality)} size="sm">
                                {incident.impact.confidentiality}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Integrità:</span>
                              <Badge className={getRiskColor(incident.impact.integrity)} size="sm">
                                {incident.impact.integrity}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Disponibilità:</span>
                              <Badge className={getRiskColor(incident.impact.availability)} size="sm">
                                {incident.impact.availability}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        {incident.status === 'open' && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident.id, 'investigating')}
                            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🔍 Investiga
                          </button>
                        )}
                        {incident.status === 'investigating' && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident.id, 'contained')}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            🛡️ Contieni
                          </button>
                        )}
                        {['investigating', 'contained'].includes(incident.status) && (
                          <button
                            onClick={() => handleUpdateIncidentStatus(incident.id, 'resolved')}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ✅ Risolvi
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowIncidentDetails(true);
                          }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Framework di Compliance</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                       onClick={() => {
                         setSelectedFramework(framework);
                         setShowComplianceDetails(true);
                       }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{framework.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{framework.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={framework.compliancePercentage >= 95 ? 'bg-green-100 text-green-800' : 
                                       framework.compliancePercentage >= 80 ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-red-100 text-red-800'}>
                          {framework.compliancePercentage}%
                        </Badge>
                        <Badge className={framework.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {framework.isActive ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Controlli implementati</span>
                          <span>{framework.implementedControls}/{framework.totalControls}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-500 rounded-full" 
                            style={{ width: `${framework.compliancePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Standard:</span>
                          <span className="ml-2 font-medium">{framework.standard.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Versione:</span>
                          <span className="ml-2 font-medium">{framework.version}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Certificazione:</span>
                          <span className="ml-2 font-medium">{framework.certificationStatus}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Prossimo Audit:</span>
                          <span className="ml-2 font-medium">
                            {framework.nextAuditDate ? formatDate(framework.nextAuditDate) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Domini ({framework.domains.length})</h5>
                        <div className="flex flex-wrap gap-2">
                          {framework.domains.slice(0, 3).map((domain) => (
                            <Badge key={domain.id} className="bg-blue-100 text-blue-800 text-xs">
                              {domain.name} ({domain.compliancePercentage}%)
                            </Badge>
                          ))}
                          {framework.domains.length > 3 && (
                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                              +{framework.domains.length - 3} altri
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Policy di Sicurezza</h3>
              </div>

              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{policy.name}</h4>
                          <Badge className={policy.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {policy.isActive ? 'Attiva' : 'Inattiva'}
                          </Badge>
                          <Badge className={policy.enforcement === 'strict' ? 'bg-red-100 text-red-800' : 
                                         policy.enforcement === 'enforced' ? 'bg-yellow-100 text-yellow-800' : 
                                         'bg-blue-100 text-blue-800'}>
                            {policy.enforcement}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Categoria:</span>
                            <span className="ml-2 font-medium">{policy.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Regole:</span>
                            <span className="ml-2 font-medium">{policy.rules.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Compliance:</span>
                            <span className="ml-2 font-medium">{policy.complianceRate}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Violazioni:</span>
                            <span className="ml-2 font-medium">{policy.violationCount}</span>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Standard di Compliance:</h5>
                          <div className="flex flex-wrap gap-2">
                            {policy.complianceStandards.map((standard) => (
                              <Badge key={standard} className="bg-blue-100 text-blue-800 text-xs">
                                {standard.toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-500">Versione: {policy.version}</p>
                          <p className="text-gray-500">Prossima review: {formatDate(policy.nextReviewDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Training di Sicurezza</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trainings.map((training) => (
                  <div key={training.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{training.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={training.isMandatory ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                          {training.isMandatory ? 'Obbligatorio' : 'Opzionale'}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-800">
                          {training.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Durata:</span>
                          <span className="ml-2 font-medium">{training.duration} min</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Moduli:</span>
                          <span className="ml-2 font-medium">{training.modules.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Validità:</span>
                          <span className="ml-2 font-medium">{training.validityPeriod} giorni</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Punteggio min:</span>
                          <span className="ml-2 font-medium">{training.passingScore}%</span>
                        </div>
                      </div>
                      
                      {training.hasAssessment && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800 font-medium">Include valutazione</span>
                            <span className="text-sm text-blue-600">Max {training.maxAttempts} tentativi</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t border-gray-100">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Moduli:</h5>
                        <div className="space-y-2">
                          {training.modules.map((module) => (
                            <div key={module.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-700">{module.title}</span>
                              <span className="text-gray-500">{module.duration} min</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-md text-sm font-medium transition-colors">
                        🎓 Inizia Training
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Creazione Incidente */}
        {showCreateIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crea Nuovo Incidente</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
                  <input
                    type="text"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Titolo dell'incidente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    rows={4}
                    placeholder="Descrizione dettagliata dell'incidente"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={newIncident.type}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, type: e.target.value as ThreatType }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="unauthorized_access">Accesso non autorizzato</option>
                      <option value="data_breach">Violazione dati</option>
                      <option value="malware">Malware</option>
                      <option value="phishing">Phishing</option>
                      <option value="ddos">DDoS</option>
                      <option value="social_engineering">Social Engineering</option>
                      <option value="insider_threat">Minaccia interna</option>
                      <option value="compliance_violation">Violazione compliance</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severità</label>
                    <select
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident(prev => ({ ...prev, severity: e.target.value as IncidentSeverity }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Bassa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Critica</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateIncident(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateIncident}
                  disabled={!newIncident.title || !newIncident.description}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea Incidente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
