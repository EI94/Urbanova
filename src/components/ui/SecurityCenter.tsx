'use client';

import React, { useState, useEffect } from 'react';

import { securityService } from '@/lib/securityService';
import {
  ThreatIntelligence,
  SecurityVulnerability,
  SecurityIncident,
  SecurityPolicy,
  SecurityAudit,
  SecurityAlert,
  IdentityAccess,
  SecurityMetrics,
  SecurityConfiguration,
  SecurityThreatLevel,
  VulnerabilityType,
  ThreatCategory,
  AlertSeverity,
  IncidentStatus,
} from '@/types/security';
import { TeamRole } from '@/types/team';

import { Badge } from './Badge';

interface SecurityCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: TeamRole;
  currentUserAvatar: string;
}

export default function SecurityCenter({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: SecurityCenterProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'threats'
    | 'vulnerabilities'
    | 'incidents'
    | 'alerts'
    | 'compliance'
    | 'identity'
    | 'analytics'
    | 'policies'
    | 'configuration'
  >('overview');

  // Stati per i dati
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [audits, setAudits] = useState<SecurityAudit[]>([]);
  const [identities, setIdentities] = useState<IdentityAccess[]>([]);
  const [configuration, setConfiguration] = useState<SecurityConfiguration | null>(null);

  // Stati per filtri e ricerca
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SecurityThreatLevel | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<ThreatCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<AlertSeverity | ''>('');

  // Stati per i modal
  const [showCreateThreat, setShowCreateThreat] = useState(false);
  const [showCreateVulnerability, setShowCreateVulnerability] = useState(false);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedThreat, setSelectedThreat] = useState<ThreatIntelligence | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<SecurityVulnerability | null>(
    null
  );
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);

  // Form states
  const [createThreatForm, setCreateThreatForm] = useState({
    name: '',
    description: '',
    category: 'malware' as ThreatCategory,
    severity: 'medium' as SecurityThreatLevel,
    confidence: 70,
    attackVectors: [] as string[],
    targetedSectors: [] as string[],
  });

  const [createVulnerabilityForm, setCreateVulnerabilityForm] = useState({
    title: '',
    description: '',
    type: 'injection' as VulnerabilityType,
    severity: 'medium' as SecurityThreatLevel,
    cvssScore: 5.0,
    assetName: '',
    environment: 'production' as 'development' | 'staging' | 'production',
  });

  const [createIncidentForm, setCreateIncidentForm] = useState({
    title: '',
    description: '',
    category: 'malware' as ThreatCategory,
    severity: 'medium' as SecurityThreatLevel,
    priority: 'medium' as SecurityThreatLevel,
    affectedSystems: [] as string[],
  });

  const [createAlertForm, setCreateAlertForm] = useState({
    title: '',
    description: '',
    severity: 'warning' as AlertSeverity,
    category: 'malware' as ThreatCategory,
    sourceSystem: '',
    sourceIp: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      // Refresh data ogni 30 secondi
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadData = () => {
    setSecurityMetrics(securityService.generateSecurityMetrics());
    setThreats(securityService.getThreats());
    setVulnerabilities(securityService.getVulnerabilities());
    setIncidents(securityService.getIncidents());
    setAlerts(securityService.getAlerts());
    setPolicies(securityService.getPolicies());
    setAudits(securityService.getAudits());
    setIdentities(securityService.getIdentities());
    setConfiguration(securityService.getConfiguration());
  };

  const handleCreateThreat = () => {
    try {
      const threat = securityService.createThreat({
        name: createThreatForm.name,
        description: createThreatForm.description,
        category: createThreatForm.category,
        severity: createThreatForm.severity,
        confidence: createThreatForm.confidence,
        indicators: [],
        attackVectors: createThreatForm.attackVectors,
        techniques: [],
        targetedSectors: createThreatForm.targetedSectors,
        targetedCountries: [],
        targetedTechnologies: [],
        attribution: {
          confidence: createThreatForm.confidence,
        },
        firstSeen: new Date(),
        lastSeen: new Date(),
        sources: [],
        mitigations: [],
        status: 'active',
        tags: [],
        createdBy: currentUserId,
      });

      setThreats(prev => [threat, ...prev]);
      setCreateThreatForm({
        name: '',
        description: '',
        category: 'malware',
        severity: 'medium',
        confidence: 70,
        attackVectors: [],
        targetedSectors: [],
      });
      setShowCreateThreat(false);
      console.log('Threat creata con successo!', threat);
    } catch (error) {
      console.error('Errore nella creazione threat:', error);
    }
  };

  const handleCreateVulnerability = () => {
    try {
      const vulnerability = securityService.createVulnerability({
        title: createVulnerabilityForm.title,
        description: createVulnerabilityForm.description,
        type: createVulnerabilityForm.type,
        severity: createVulnerabilityForm.severity,
        cvssScore: createVulnerabilityForm.cvssScore,
        cvssVector: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:L`,
        asset: {
          id: `asset-${Date.now()}`,
          name: createVulnerabilityForm.assetName,
          type: 'application',
          environment: createVulnerabilityForm.environment,
          owner: currentUserId,
          criticality: 'medium',
        },
        location: {},
        evidence: [],
        exploitability: 5,
        impact: 5,
        likelihood: 5,
        riskScore: createVulnerabilityForm.cvssScore,
        remediation: {
          effort: 'medium',
          priority: createVulnerabilityForm.severity,
          steps: ['Implementare fix di sicurezza', 'Testare la correzione'],
          estimatedTime: 16,
          resources: ['Security Engineer', 'Developer'],
        },
        patch: {
          available: false,
          tested: false,
        },
        status: 'open',
        complianceImpact: [],
        discoveredAt: new Date(),
        reportedAt: new Date(),
        scanner: {
          name: 'Manual Report',
          version: '1.0.0',
          scanType: 'manual',
          scanDate: new Date(),
          confidence: 95,
        },
        references: [],
        tags: ['manual'],
      });

      setVulnerabilities(prev => [vulnerability, ...prev]);
      setCreateVulnerabilityForm({
        title: '',
        description: '',
        type: 'injection',
        severity: 'medium',
        cvssScore: 5.0,
        assetName: '',
        environment: 'production',
      });
      setShowCreateVulnerability(false);
      console.log('Vulnerabilità creata con successo!', vulnerability);
    } catch (error) {
      console.error('Errore nella creazione vulnerabilità:', error);
    }
  };

  const handleCreateIncident = () => {
    try {
      const incident = securityService.createIncident({
        title: createIncidentForm.title,
        description: createIncidentForm.description,
        category: createIncidentForm.category,
        severity: createIncidentForm.severity,
        priority: createIncidentForm.priority,
        status: 'new',
        impact: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
          affectedSystems: createIncidentForm.affectedSystems,
          affectedUsers: 0,
          dataCompromised: false,
          serviceDisruption: false,
          reputationalImpact: 'low',
          complianceViolation: false,
          regulatoryNotificationRequired: false,
          affectedRegulations: [],
        },
        detectedAt: new Date(),
        reportedAt: new Date(),
        responseTeam: [
          {
            userId: currentUserId,
            name: currentUserName,
            role: 'lead',
            contactInfo: `${currentUserId}@urbanova.com`,
          },
        ],
        investigation: {
          attackTimeline: [],
          iocs: [],
        },
        actions: [],
        communications: [],
        evidence: [],
        related: {
          vulnerabilities: [],
          threats: [],
          incidents: [],
          alerts: [],
        },
        tags: ['manual'],
        createdBy: currentUserId,
      });

      setIncidents(prev => [incident, ...prev]);
      setCreateIncidentForm({
        title: '',
        description: '',
        category: 'malware',
        severity: 'medium',
        priority: 'medium',
        affectedSystems: [],
      });
      setShowCreateIncident(false);
      console.log('Incident creato con successo!', incident);
    } catch (error) {
      console.error('Errore nella creazione incident:', error);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    const success = securityService.resolveAlert(alertId);
    if (success) {
      loadData(); // Ricarica dati per aggiornare UI
      console.log(`Alert ${alertId} risolto con successo`);
    }
  };

  const getSeverityColor = (severity: SecurityThreatLevel | AlertSeverity) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
      emergency: 'bg-purple-100 text-purple-800',
      warning: 'bg-yellow-100 text-yellow-800',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      open: 'bg-red-100 text-red-800',
      confirmed: 'bg-orange-100 text-orange-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-600',
      new: 'bg-blue-100 text-blue-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: ThreatCategory) => {
    const icons = {
      malware: '🦠',
      phishing: '🎣',
      ransomware: '🔒',
      apt: '🎯',
      insider_threat: '👤',
      ddos: '📡',
      data_breach: '💾',
      supply_chain: '🔗',
      social_engineering: '🎭',
      zero_day: '🕳️',
      botnet: '🤖',
      cryptojacking: '⛏️',
    };
    return icons[category] || '⚠️';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toLocaleString('it-IT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const filteredThreats = threats.filter(threat => {
    const matchesQuery =
      searchQuery === '' ||
      threat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      threat.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === '' || threat.severity === severityFilter;
    const matchesCategory = categoryFilter === '' || threat.category === categoryFilter;

    return matchesQuery && matchesSeverity && matchesCategory;
  });

  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesQuery =
      searchQuery === '' ||
      vuln.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vuln.asset.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === '' || vuln.severity === severityFilter;
    const matchesStatus = statusFilter === '' || vuln.status === statusFilter;

    return matchesQuery && matchesSeverity && matchesStatus;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesQuery =
      searchQuery === '' ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === '' || incident.severity === severityFilter;
    const matchesCategory = categoryFilter === '' || incident.category === categoryFilter;

    return matchesQuery && matchesSeverity && matchesCategory;
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesQuery =
      searchQuery === '' ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = alertSeverityFilter === '' || alert.severity === alertSeverityFilter;
    const matchesCategory = categoryFilter === '' || alert.category === categoryFilter;

    return matchesQuery && matchesSeverity && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-red-600 text-lg">🛡️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Security & Threat Intelligence Center
              </h2>
              <p className="text-sm text-gray-500">
                Centro avanzato per sicurezza, threat intelligence e compliance
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Security Stats Overview */}
        {securityMetrics && (
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Threats Active</p>
                    <p className="text-2xl font-bold text-red-900">
                      {securityMetrics.threats.activeThreats}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🎯</span>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {securityMetrics.threats.newThreats} nuove
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Vulnerabilities</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {securityMetrics.vulnerabilities.openVulnerabilities}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600">🔍</span>
                  </div>
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  {securityMetrics.vulnerabilities.bySeverity.critical} critical
                </p>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Open Incidents</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {securityMetrics.incidents.openIncidents}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600">🚨</span>
                  </div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  {formatNumber(securityMetrics.incidents.averageResponseTime)}m avg response
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Security Score</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {securityMetrics.posture.overallScore}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📊</span>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-1">overall posture</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Compliance</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatNumber(securityMetrics.compliance.overallScore)}%
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">✅</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-1">framework score</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Risk Level</p>
                    <p className="text-2xl font-bold text-green-900">
                      {securityMetrics.risk.overallRisk === 'low'
                        ? '🟢'
                        : securityMetrics.risk.overallRisk === 'medium'
                          ? '🟡'
                          : '🔴'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">⚖️</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-1">{securityMetrics.risk.overallRisk}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '🎯', count: 0 },
              { id: 'threats', label: 'Threats', icon: '🎯', count: threats.length },
              {
                id: 'vulnerabilities',
                label: 'Vulnerabilities',
                icon: '🔍',
                count: vulnerabilities.length,
              },
              { id: 'incidents', label: 'Incidents', icon: '🚨', count: incidents.length },
              { id: 'alerts', label: 'Alerts', icon: '⚠️', count: alerts.length },
              { id: 'compliance', label: 'Compliance', icon: '✅', count: audits.length },
              { id: 'identity', label: 'Identity', icon: '👤', count: identities.length },
              { id: 'analytics', label: 'Analytics', icon: '📊', count: 0 },
              { id: 'policies', label: 'Policies', icon: '📋', count: policies.length },
              { id: 'configuration', label: 'Config', icon: '⚙️', count: 0 },
            ].map(tab => (
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
                  <Badge className="ml-2 bg-red-100 text-red-800">{tab.count}</Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && securityMetrics && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Security Posture */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Posture</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {securityMetrics.posture.overallScore}
                        </span>
                        <div className="text-sm text-blue-600">out of 100</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {Object.entries(securityMetrics.posture.components).map(
                        ([component, score]) => (
                          <div key={component} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {component.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${score >= 85 ? 'bg-green-500' : score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium w-8">{score}</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Threat Landscape */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Landscape</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Threats</span>
                      <span className="text-lg font-bold text-red-600">
                        {securityMetrics.threats.activeThreats}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MTTD</span>
                      <span className="text-sm font-medium text-blue-600">
                        {securityMetrics.threats.mttd}m
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">MTTR</span>
                      <span className="text-sm font-medium text-green-600">
                        {securityMetrics.threats.mttr}m
                      </span>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-2">Top Threats</div>
                      <div className="space-y-1">
                        {securityMetrics.threats.topThreats.slice(0, 3).map((threat, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span>{getCategoryIcon(threat.category)}</span>
                              <span className="text-gray-600">{threat.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-500">{threat.count}</span>
                              <span
                                className={`text-xs ${
                                  threat.trend === 'up'
                                    ? 'text-red-600'
                                    : threat.trend === 'down'
                                      ? 'text-green-600'
                                      : 'text-gray-600'
                                }`}
                              >
                                {threat.trend === 'up'
                                  ? '↗'
                                  : threat.trend === 'down'
                                    ? '↘'
                                    : '→'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vulnerability Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vulnerability Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {securityMetrics.vulnerabilities.bySeverity.critical}
                    </div>
                    <div className="text-sm text-gray-600">Critical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {securityMetrics.vulnerabilities.bySeverity.high}
                    </div>
                    <div className="text-sm text-gray-600">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {securityMetrics.vulnerabilities.bySeverity.medium}
                    </div>
                    <div className="text-sm text-gray-600">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {securityMetrics.vulnerabilities.bySeverity.low}
                    </div>
                    <div className="text-sm text-gray-600">Low</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">SLA Compliance</span>
                    <span className="font-medium text-green-600">
                      {formatNumber(securityMetrics.vulnerabilities.slaCompliance)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mean Time to Remediation</span>
                    <span className="font-medium text-blue-600">
                      {formatNumber(securityMetrics.vulnerabilities.mttr)} days
                    </span>
                  </div>
                </div>
              </div>

              {/* Compliance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Status</h3>
                  <div className="space-y-3">
                    {Object.entries(securityMetrics.compliance.byFramework)
                      .filter(([_, data]) => data.totalControls > 0)
                      .map(([framework, data]) => (
                        <div key={framework} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 uppercase">
                            {framework.replace('_', ' ')}
                          </span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${data.score >= 90 ? 'bg-green-500' : data.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${data.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {data.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cost & ROI</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Security Investment</span>
                      <span className="text-sm font-medium text-blue-600">
                        €{securityMetrics.costs.totalSecuritySpend.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost per Incident</span>
                      <span className="text-sm font-medium text-orange-600">
                        €{securityMetrics.costs.costPerIncident.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Prevented Losses</span>
                      <span className="text-sm font-medium text-green-600">
                        €{securityMetrics.costs.roi.preventedLosses.toLocaleString()}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">ROI</span>
                        <span className="text-lg font-bold text-green-600">
                          {securityMetrics.costs.roi.roiPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'threats' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Threat Intelligence</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Cerca threats..."
                  />
                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value as SecurityThreatLevel | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as ThreatCategory | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutte le categorie</option>
                    <option value="malware">Malware</option>
                    <option value="phishing">Phishing</option>
                    <option value="ransomware">Ransomware</option>
                    <option value="apt">APT</option>
                  </select>
                  <button
                    onClick={() => setShowCreateThreat(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuova Threat
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredThreats.map(threat => (
                  <div
                    key={threat.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getCategoryIcon(threat.category)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{threat.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">{threat.category}</p>
                          </div>
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(threat.status)}>{threat.status}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{threat.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <span className="ml-2 font-medium">{threat.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">First Seen:</span>
                            <span className="ml-2 font-medium">{formatDate(threat.firstSeen)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Seen:</span>
                            <span className="ml-2 font-medium">{formatDate(threat.lastSeen)}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Sources:</span>
                            <span className="ml-2 font-medium">{threat.sources.length}</span>
                          </div>
                        </div>

                        {/* Attack Vectors */}
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-sm text-gray-500">Attack Vectors:</span>
                          {threat.attackVectors.slice(0, 3).map((vector, index) => (
                            <Badge key={index} className="bg-orange-100 text-orange-800 text-xs">
                              {vector.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>

                        {/* Targeted Sectors */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Targeted Sectors:</span>
                          {threat.targetedSectors.slice(0, 3).map((sector, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedThreat(threat)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          🛡️ Mitigate
                        </button>
                        <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          📊 Analyze
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Creata: {formatDate(threat.createdAt)}</span>
                      <span>Aggiornata: {formatDate(threat.updatedAt)}</span>
                      <span>Da: {threat.createdBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vulnerabilities' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Vulnerability Management</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Cerca vulnerabilità..."
                  />
                  <select
                    value={severityFilter}
                    onChange={e => setSeverityFilter(e.target.value as SecurityThreatLevel | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutti gli stati</option>
                    <option value="open">Open</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => setShowCreateVulnerability(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    ➕ Nuova Vulnerabilità
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {filteredVulnerabilities.map(vuln => (
                  <div
                    key={vuln.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{vuln.title}</h4>
                          <Badge className={getSeverityColor(vuln.severity)}>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(vuln.status)}>{vuln.status}</Badge>
                          <Badge className="bg-blue-100 text-blue-800">CVSS {vuln.cvssScore}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{vuln.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-500">Asset:</span>
                            <span className="ml-2 font-medium">{vuln.asset.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Environment:</span>
                            <span className="ml-2 font-medium capitalize">
                              {vuln.asset.environment}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Type:</span>
                            <span className="ml-2 font-medium capitalize">
                              {vuln.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Scanner:</span>
                            <span className="ml-2 font-medium">{vuln.scanner.name}</span>
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Risk Assessment
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Exploitability:</span>
                              <span className="ml-2 font-medium">
                                {formatNumber(vuln.exploitability)}/10
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Impact:</span>
                              <span className="ml-2 font-medium">
                                {formatNumber(vuln.impact)}/10
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Risk Score:</span>
                              <span className="ml-2 font-medium">
                                {formatNumber(vuln.riskScore)}/10
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Remediation */}
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-blue-900 mb-1">Remediation</div>
                          <div className="text-sm text-blue-700">
                            Priority: {vuln.remediation.priority.toUpperCase()} • Effort:{' '}
                            {vuln.remediation.effort} • ETA: {vuln.remediation.estimatedTime}h
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => setSelectedVulnerability(vuln)}
                          className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        <button className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          🔧 Fix
                        </button>
                        <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium transition-colors">
                          📋 Assign
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-4">
                      <span>Scoperta: {formatDate(vuln.discoveredAt)}</span>
                      <span>Segnalata: {formatDate(vuln.reportedAt)}</span>
                      {vuln.assignedTo && <span>Assegnata a: {vuln.assignedTo}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Security Alerts</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Cerca alert..."
                  />
                  <select
                    value={alertSeverityFilter}
                    onChange={e => setAlertSeverityFilter(e.target.value as AlertSeverity | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutte le severità</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value as ThreatCategory | '')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Tutte le categorie</option>
                    <option value="malware">Malware</option>
                    <option value="phishing">Phishing</option>
                    <option value="insider_threat">Insider Threat</option>
                    <option value="ddos">DDoS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredAlerts.slice(0, 20).map(alert => (
                  <div
                    key={alert.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span>{getCategoryIcon(alert.category)}</span>
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(alert.response.status)}>
                            {alert.response.status}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Source:</span>
                            <span className="ml-2 font-medium">{alert.source.system}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Asset:</span>
                            <span className="ml-2 font-medium">{alert.context.asset.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Risk Score:</span>
                            <span className="ml-2 font-medium">{alert.risk.score}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <span className="ml-2 font-medium">{alert.source.confidence}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          👁️ Dettagli
                        </button>
                        {alert.response.status === 'new' && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            ✅ Risolvi
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 mt-3">
                      <span>Creato: {formatDate(alert.createdAt)}</span>
                      <span>Evento: {formatDate(alert.event.timestamp)}</span>
                      {alert.event.sourceIp && <span>IP: {alert.event.sourceIp}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Create Threat */}
        {showCreateThreat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crea Nuova Threat Intelligence
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Threat
                  </label>
                  <input
                    type="text"
                    value={createThreatForm.name}
                    onChange={e => setCreateThreatForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    placeholder="Nome della threat"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={createThreatForm.description}
                    onChange={e =>
                      setCreateThreatForm(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Descrizione della threat"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      value={createThreatForm.category}
                      onChange={e =>
                        setCreateThreatForm(prev => ({
                          ...prev,
                          category: e.target.value as ThreatCategory,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="malware">Malware</option>
                      <option value="phishing">Phishing</option>
                      <option value="ransomware">Ransomware</option>
                      <option value="apt">APT</option>
                      <option value="insider_threat">Insider Threat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severità</label>
                    <select
                      value={createThreatForm.severity}
                      onChange={e =>
                        setCreateThreatForm(prev => ({
                          ...prev,
                          severity: e.target.value as SecurityThreatLevel,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confidence (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={createThreatForm.confidence}
                      onChange={e =>
                        setCreateThreatForm(prev => ({
                          ...prev,
                          confidence: parseInt(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateThreat(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleCreateThreat}
                  disabled={!createThreatForm.name || !createThreatForm.description}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Crea Threat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
