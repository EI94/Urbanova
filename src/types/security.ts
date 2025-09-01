// Tipi per il sistema di Advanced Security & Threat Intelligence

export type SecurityThreatLevel = 'info' | 'low' | 'medium' | 'high' | 'critical' | 'emergency';

export type VulnerabilityType =
  | 'injection'
  | 'broken_auth'
  | 'sensitive_data'
  | 'xxe'
  | 'broken_access'
  | 'security_misconfig'
  | 'xss'
  | 'insecure_deserialization'
  | 'components'
  | 'logging_monitoring'
  | 'buffer_overflow'
  | 'race_condition'
  | 'privilege_escalation'
  | 'denial_service'
  | 'code_injection';

export type ComplianceFramework =
  | 'soc2'
  | 'gdpr'
  | 'hipaa'
  | 'pci_dss'
  | 'iso27001'
  | 'nist'
  | 'fedramp'
  | 'cis'
  | 'cobit'
  | 'fisma'
  | 'sox'
  | 'glba';

export type AccessControlType =
  | 'rbac'
  | 'abac'
  | 'dac'
  | 'mac'
  | 'zero_trust'
  | 'just_in_time'
  | 'privileged_access'
  | 'conditional_access';

export type EncryptionMethod =
  | 'aes256'
  | 'rsa4096'
  | 'ecdsa'
  | 'chacha20'
  | 'twofish'
  | 'blowfish'
  | 'post_quantum'
  | 'homomorphic'
  | 'format_preserving';

export type AuthenticationMethod =
  | 'password'
  | 'mfa'
  | 'biometric'
  | 'certificate'
  | 'token'
  | 'saml'
  | 'oauth2'
  | 'oidc'
  | 'kerberos'
  | 'ldap'
  | 'smart_card'
  | 'hardware_key';

export type SecurityScanType =
  | 'sast'
  | 'dast'
  | 'iast'
  | 'rasp'
  | 'dependency'
  | 'container'
  | 'infrastructure'
  | 'network'
  | 'web_app'
  | 'mobile'
  | 'api'
  | 'database'
  | 'cloud_config';

export type ThreatCategory =
  | 'malware'
  | 'phishing'
  | 'ransomware'
  | 'apt'
  | 'insider_threat'
  | 'ddos'
  | 'data_breach'
  | 'supply_chain'
  | 'social_engineering'
  | 'zero_day'
  | 'botnet'
  | 'cryptojacking';

export type SecurityEventType =
  | 'login_attempt'
  | 'access_denied'
  | 'privilege_escalation'
  | 'data_access'
  | 'configuration_change'
  | 'policy_violation'
  | 'anomaly_detected'
  | 'threat_detected';

export type RiskLevel = 'negligible' | 'low' | 'medium' | 'high' | 'critical' | 'catastrophic';

export type SecurityStatus =
  | 'secure'
  | 'at_risk'
  | 'compromised'
  | 'under_attack'
  | 'investigating'
  | 'remediating'
  | 'monitoring'
  | 'unknown';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export type IncidentStatus =
  | 'new'
  | 'assigned'
  | 'investigating'
  | 'analyzing'
  | 'containing'
  | 'eradicating'
  | 'recovering'
  | 'resolved'
  | 'closed';

export type AuditResult = 'pass' | 'fail' | 'warning' | 'not_applicable' | 'manual_review';

export type IdentityProvider =
  | 'active_directory'
  | 'azure_ad'
  | 'okta'
  | 'auth0'
  | 'ping_identity'
  | 'onelogin'
  | 'google_workspace'
  | 'aws_iam'
  | 'custom';

export interface ThreatIntelligence {
  id: string;
  name: string;
  description: string;

  // Threat Classification
  category: ThreatCategory;
  severity: SecurityThreatLevel;
  confidence: number; // 0-100

  // Threat Details
  indicators: Array<{
    type: 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'file_path' | 'registry_key' | 'user_agent';
    value: string;
    confidence: number;
    context?: string;
  }>;

  // Attack Information
  attackVectors: string[];
  techniques: Array<{
    id: string; // MITRE ATT&CK ID
    name: string;
    tactic: string;
    description: string;
  }>;

  // Target Information
  targetedSectors: string[];
  targetedCountries: string[];
  targetedTechnologies: string[];

  // Attribution
  attribution: {
    actor?: string;
    group?: string;
    country?: string;
    motivation?: string;
    confidence: number;
  };

  // Timeline
  firstSeen: Date;
  lastSeen: Date;

  // Sources
  sources: Array<{
    name: string;
    url?: string;
    reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    credibility: number;
  }>;

  // Mitigation
  mitigations: Array<{
    technique: string;
    description: string;
    effectiveness: number;
  }>;

  // Status
  status: 'active' | 'inactive' | 'monitoring' | 'historical';

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;

  // Classification
  type: VulnerabilityType;
  severity: SecurityThreatLevel;
  cvssScore: number;
  cvssVector: string;

  // Identification
  cve?: string;
  cwe?: string;
  owasp?: string;

  // Asset Information
  asset: {
    id: string;
    name: string;
    type: 'application' | 'system' | 'network' | 'database' | 'container' | 'cloud' | 'mobile';
    environment: 'development' | 'staging' | 'production';
    owner: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
  };

  // Technical Details
  location: {
    file?: string;
    line?: number;
    function?: string;
    url?: string;
    parameter?: string;
    component?: string;
  };

  // Evidence
  evidence: Array<{
    type: 'screenshot' | 'log' | 'code' | 'request' | 'response' | 'report';
    data: string;
    description?: string;
  }>;

  // Risk Assessment
  exploitability: number; // 0-10
  impact: number; // 0-10
  likelihood: number; // 0-10
  riskScore: number; // 0-10

  // Remediation
  remediation: {
    effort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
    steps: string[];
    estimatedTime: number; // hours
    resources: string[];
  };

  // Patch Information
  patch: {
    available: boolean;
    version?: string;
    url?: string;
    releaseDate?: Date;
    tested: boolean;
  };

  // Status Tracking
  status: 'open' | 'confirmed' | 'in_progress' | 'resolved' | 'accepted_risk' | 'false_positive';
  assignedTo?: string;

  // Compliance Impact
  complianceImpact: Array<{
    framework: ComplianceFramework;
    control: string;
    impact: 'low' | 'medium' | 'high';
  }>;

  // Timeline
  discoveredAt: Date;
  reportedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;

  // Scanning Information
  scanner: {
    name: string;
    version: string;
    scanType: SecurityScanType;
    scanDate: Date;
    confidence: number;
  };

  // References
  references: Array<{
    type: 'vendor' | 'exploit' | 'advisory' | 'article' | 'cve' | 'documentation';
    url: string;
    title?: string;
  }>;

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;

  // Classification
  category: ThreatCategory;
  severity: SecurityThreatLevel;
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Status
  status: IncidentStatus;

  // Impact Assessment
  impact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high';
    integrity: 'none' | 'low' | 'medium' | 'high';
    availability: 'none' | 'low' | 'medium' | 'high';

    // Business Impact
    affectedSystems: string[];
    affectedUsers: number;
    dataCompromised: boolean;
    serviceDisruption: boolean;
    financialImpact?: number;
    reputationalImpact: 'none' | 'low' | 'medium' | 'high';

    // Compliance Impact
    complianceViolation: boolean;
    regulatoryNotificationRequired: boolean;
    affectedRegulations: ComplianceFramework[];
  };

  // Timeline
  detectedAt: Date;
  reportedAt: Date;
  acknowledgedAt?: Date;
  containedAt?: Date;
  eradicatedAt?: Date;
  recoveredAt?: Date;
  resolvedAt?: Date;

  // Response Team
  assignedTo?: string;
  responseTeam: Array<{
    userId: string;
    name: string;
    role: 'lead' | 'analyst' | 'technical' | 'legal' | 'communications' | 'management';
    contactInfo: string;
  }>;

  // Investigation
  investigation: {
    rootCause?: string;
    attackVector?: string;
    attackTimeline: Array<{
      timestamp: Date;
      event: string;
      evidence?: string;
    }>;

    // Attribution
    attribution?: {
      actor?: string;
      group?: string;
      motivation?: string;
      confidence: number;
    };

    // Indicators of Compromise
    iocs: Array<{
      type: 'ip' | 'domain' | 'hash' | 'email' | 'file' | 'registry' | 'process';
      value: string;
      confidence: number;
      context?: string;
    }>;
  };

  // Response Actions
  actions: Array<{
    id: string;
    type: 'containment' | 'eradication' | 'recovery' | 'investigation' | 'communication' | 'legal';
    description: string;
    assignedTo: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: Date;
    completedAt?: Date;
    notes?: string;
  }>;

  // Communication
  communications: Array<{
    timestamp: Date;
    type: 'internal' | 'external' | 'regulatory' | 'media' | 'customer';
    audience: string;
    message: string;
    channel: 'email' | 'phone' | 'meeting' | 'portal' | 'press_release';
    sentBy: string;
  }>;

  // Evidence
  evidence: Array<{
    id: string;
    type: 'log' | 'screenshot' | 'file' | 'network_capture' | 'memory_dump' | 'disk_image';
    name: string;
    path: string;
    hash: string;
    size: number;
    collectedAt: Date;
    collectedBy: string;
    chainOfCustody: Array<{
      timestamp: Date;
      action: 'collected' | 'transferred' | 'analyzed' | 'stored';
      person: string;
      notes?: string;
    }>;
  }>;

  // Lessons Learned
  lessonsLearned?: {
    whatWorked: string[];
    whatDidntWork: string[];
    improvements: string[];
    preventionMeasures: string[];
    trainingNeeds: string[];
  };

  // Metrics
  metrics: {
    detectionTime: number; // minutes
    responseTime: number; // minutes
    containmentTime?: number; // minutes
    recoveryTime?: number; // minutes
    totalCost?: number;
  };

  // Related Items
  related: {
    vulnerabilities: string[];
    threats: string[];
    incidents: string[];
    alerts: string[];
  };

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;

  // Policy Details
  type:
    | 'access_control'
    | 'data_protection'
    | 'network_security'
    | 'endpoint_security'
    | 'application_security'
    | 'incident_response'
    | 'business_continuity'
    | 'risk_management';

  category: 'technical' | 'administrative' | 'physical';

  // Scope
  scope: {
    environments: Array<'development' | 'staging' | 'production' | 'all'>;
    systems: string[];
    users: string[];
    applications: string[];
  };

  // Policy Rules
  rules: Array<{
    id: string;
    name: string;
    description: string;
    condition: string;
    action: 'allow' | 'deny' | 'alert' | 'log' | 'quarantine';
    parameters: Record<string, any>;
    enabled: boolean;
  }>;

  // Enforcement
  enforcement: {
    mode: 'monitor' | 'enforce' | 'disabled';
    automated: boolean;
    exceptions: Array<{
      reason: string;
      approver: string;
      expiresAt?: Date;
      conditions: string[];
    }>;
  };

  // Compliance Mapping
  complianceMapping: Array<{
    framework: ComplianceFramework;
    control: string;
    requirement: string;
    mappingType: 'full' | 'partial' | 'supporting';
  }>;

  // Risk Assessment
  riskReduction: number; // 0-100
  implementationComplexity: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';

  // Lifecycle
  status: 'draft' | 'review' | 'approved' | 'active' | 'deprecated' | 'retired';
  version: string;
  approvedBy?: string;
  approvedAt?: Date;
  effectiveDate?: Date;
  reviewDate?: Date;
  nextReviewDate?: Date;

  // Documentation
  documentation: {
    procedures: string[];
    guidelines: string[];
    templates: string[];
    training: string[];
  };

  // Monitoring
  monitoring: {
    enabled: boolean;
    metrics: string[];
    alerts: string[];
    reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  };

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SecurityAudit {
  id: string;
  name: string;
  description: string;

  // Audit Details
  type:
    | 'internal'
    | 'external'
    | 'regulatory'
    | 'compliance'
    | 'penetration_test'
    | 'vulnerability_assessment';
  framework: ComplianceFramework;

  // Scope
  scope: {
    systems: string[];
    applications: string[];
    processes: string[];
    controls: string[];
    timeframe: {
      start: Date;
      end: Date;
    };
  };

  // Auditor Information
  auditor: {
    name: string;
    organization?: string;
    credentials: string[];
    contactInfo: string;
  };

  // Audit Plan
  plan: {
    objectives: string[];
    methodology: string;
    timeline: Array<{
      phase: string;
      startDate: Date;
      endDate: Date;
      activities: string[];
    }>;
    resources: string[];
  };

  // Findings
  findings: Array<{
    id: string;
    title: string;
    description: string;
    severity: SecurityThreatLevel;
    category: string;

    // Control Information
    control: {
      id: string;
      name: string;
      requirement: string;
      framework: ComplianceFramework;
    };

    // Assessment
    result: AuditResult;
    evidence: string[];

    // Risk
    risk: {
      likelihood: 'low' | 'medium' | 'high';
      impact: 'low' | 'medium' | 'high';
      rating: RiskLevel;
    };

    // Remediation
    recommendation: string;
    managementResponse?: string;
    remediation: {
      plan: string;
      owner: string;
      targetDate: Date;
      status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
      actualDate?: Date;
    };
  }>;

  // Overall Results
  results: {
    totalControls: number;
    passedControls: number;
    failedControls: number;
    warningControls: number;
    overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'inadequate';
    compliancePercentage: number;
  };

  // Status
  status: 'planned' | 'in_progress' | 'fieldwork_complete' | 'reporting' | 'final' | 'closed';

  // Timeline
  plannedStartDate: Date;
  actualStartDate?: Date;
  plannedEndDate: Date;
  actualEndDate?: Date;
  reportDate?: Date;

  // Documentation
  documents: Array<{
    name: string;
    type: 'plan' | 'workpaper' | 'evidence' | 'report' | 'response';
    path: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;

  // Follow-up
  followUp: {
    required: boolean;
    scheduledDate?: Date;
    completedDate?: Date;
    findings: string[];
  };

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;

  // Classification
  type: SecurityEventType;
  severity: AlertSeverity;
  category: ThreatCategory;

  // Source Information
  source: {
    system: string;
    sensor: string;
    rule: string;
    confidence: number;
  };

  // Event Details
  event: {
    timestamp: Date;
    sourceIp?: string;
    destinationIp?: string;
    sourcePort?: number;
    destinationPort?: number;
    protocol?: string;
    user?: string;
    process?: string;
    command?: string;
    file?: string;
    url?: string;
    userAgent?: string;
  };

  // Context
  context: {
    asset: {
      id: string;
      name: string;
      type: string;
      criticality: 'low' | 'medium' | 'high' | 'critical';
    };

    environment: 'development' | 'staging' | 'production';

    // Threat Intelligence Context
    threatIntelligence?: {
      matchedIndicators: Array<{
        type: string;
        value: string;
        source: string;
        confidence: number;
      }>;
      attribution?: string;
    };
  };

  // Risk Assessment
  risk: {
    score: number; // 0-100
    level: RiskLevel;
    factors: Array<{
      factor: string;
      weight: number;
      value: number;
    }>;
  };

  // Response
  response: {
    status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'false_positive' | 'suppressed';
    assignedTo?: string;
    acknowledgedAt?: Date;
    resolvedAt?: Date;

    actions: Array<{
      type: 'block_ip' | 'quarantine_file' | 'disable_user' | 'isolate_system' | 'collect_evidence';
      description: string;
      automated: boolean;
      executedAt?: Date;
      executedBy?: string;
      result?: string;
    }>;
  };

  // Correlation
  correlation: {
    relatedAlerts: string[];
    incidentId?: string;
    pattern?: string;
    count: number;
    timeWindow: number; // minutes
  };

  // Evidence
  evidence: Array<{
    type: 'log' | 'packet_capture' | 'file_hash' | 'screenshot' | 'memory_dump';
    data: string;
    metadata?: Record<string, any>;
  }>;

  // Suppression
  suppression: {
    suppressed: boolean;
    reason?: string;
    suppressedBy?: string;
    suppressedAt?: Date;
    expiresAt?: Date;
  };

  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IdentityAccess {
  id: string;

  // Identity Information
  identity: {
    type: 'user' | 'service_account' | 'device' | 'application';
    identifier: string;
    displayName: string;
    email?: string;
    department?: string;
    manager?: string;
    location?: string;
  };

  // Authentication
  authentication: {
    methods: AuthenticationMethod[];
    lastLogin?: Date;
    loginCount: number;
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    accountLocked: boolean;
    passwordLastChanged?: Date;
    mfaEnabled: boolean;
    mfaDevices: Array<{
      id: string;
      type: 'sms' | 'email' | 'app' | 'hardware_token' | 'biometric';
      name: string;
      registeredAt: Date;
      lastUsed?: Date;
      verified: boolean;
    }>;
  };

  // Authorization
  authorization: {
    roles: Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      assignedAt: Date;
      assignedBy: string;
      expiresAt?: Date;
    }>;

    permissions: Array<{
      resource: string;
      action: string;
      condition?: string;
      granted: boolean;
      grantedAt: Date;
      grantedBy: string;
      expiresAt?: Date;
    }>;

    groups: Array<{
      id: string;
      name: string;
      type: 'security' | 'distribution' | 'application';
      joinedAt: Date;
    }>;
  };

  // Access Patterns
  accessPatterns: {
    usualLocations: string[];
    usualDevices: string[];
    usualHours: Array<{
      dayOfWeek: number;
      startHour: number;
      endHour: number;
    }>;
    riskScore: number; // 0-100
  };

  // Privileged Access
  privilegedAccess: {
    hasPrivilegedAccess: boolean;
    privilegedRoles: string[];
    lastPrivilegedAccess?: Date;
    privilegedSessions: Array<{
      sessionId: string;
      startTime: Date;
      endTime?: Date;
      resource: string;
      actions: string[];
      approved: boolean;
      approver?: string;
    }>;
  };

  // Compliance
  compliance: {
    backgroundCheckCompleted: boolean;
    trainingCompleted: boolean;
    agreementsAccepted: Array<{
      type: 'nda' | 'acceptable_use' | 'code_of_conduct' | 'privacy_policy';
      acceptedAt: Date;
      version: string;
    }>;

    accessReviews: Array<{
      reviewDate: Date;
      reviewer: string;
      result: 'approved' | 'modified' | 'revoked';
      comments?: string;
      nextReviewDate: Date;
    }>;
  };

  // Risk Assessment
  risk: {
    riskScore: number; // 0-100
    riskLevel: RiskLevel;
    riskFactors: Array<{
      factor: string;
      weight: number;
      score: number;
      description: string;
    }>;
    lastAssessment: Date;
  };

  // Status
  status: 'active' | 'inactive' | 'suspended' | 'terminated' | 'pending_activation';

  // Lifecycle
  createdAt: Date;
  activatedAt?: Date;
  lastModified: Date;
  deactivatedAt?: Date;
  terminatedAt?: Date;

  // Provider Information
  provider: {
    type: IdentityProvider;
    id: string;
    syncedAt?: Date;
    attributes: Record<string, any>;
  };

  // Metadata
  tags: string[];
  notes: string[];
}

export interface SecurityMetrics {
  // Time Period
  period: {
    start: Date;
    end: Date;
    granularity: 'hour' | 'day' | 'week' | 'month';
  };

  // Threat Metrics
  threats: {
    totalThreats: number;
    newThreats: number;
    activeThreats: number;
    blockedThreats: number;

    // By Severity
    bySeverity: Record<SecurityThreatLevel, number>;

    // By Category
    byCategory: Record<ThreatCategory, number>;

    // Top Threats
    topThreats: Array<{
      name: string;
      category: ThreatCategory;
      count: number;
      trend: 'up' | 'down' | 'stable';
    }>;

    // Mean Time to Detection/Response
    mttd: number; // minutes
    mttr: number; // minutes
  };

  // Vulnerability Metrics
  vulnerabilities: {
    totalVulnerabilities: number;
    newVulnerabilities: number;
    resolvedVulnerabilities: number;
    openVulnerabilities: number;

    // By Severity
    bySeverity: Record<SecurityThreatLevel, number>;

    // By Type
    byType: Record<VulnerabilityType, number>;

    // By Asset Type
    byAssetType: Record<string, number>;

    // Mean Time to Remediation
    mttr: number; // days

    // SLA Compliance
    slaCompliance: number; // percentage
  };

  // Incident Metrics
  incidents: {
    totalIncidents: number;
    newIncidents: number;
    resolvedIncidents: number;
    openIncidents: number;

    // By Severity
    bySeverity: Record<SecurityThreatLevel, number>;

    // By Category
    byCategory: Record<ThreatCategory, number>;

    // Response Times
    averageResponseTime: number; // minutes
    averageResolutionTime: number; // hours

    // Cost Impact
    totalCost: number;
    averageCost: number;
  };

  // Compliance Metrics
  compliance: {
    overallScore: number; // percentage

    byFramework: Record<
      ComplianceFramework,
      {
        score: number;
        totalControls: number;
        passedControls: number;
        failedControls: number;
        lastAssessment: Date;
      }
    >;

    // Audit Results
    audits: {
      total: number;
      passed: number;
      failed: number;
      pending: number;
    };
  };

  // Access Metrics
  access: {
    totalIdentities: number;
    activeIdentities: number;
    privilegedIdentities: number;
    suspendedIdentities: number;

    // Authentication
    authentication: {
      totalLogins: number;
      successfulLogins: number;
      failedLogins: number;
      mfaAdoption: number; // percentage
      ssoAdoption: number; // percentage
    };

    // Access Reviews
    accessReviews: {
      total: number;
      completed: number;
      pending: number;
      overdue: number;
    };
  };

  // Security Posture
  posture: {
    overallScore: number; // 0-100

    components: {
      threatProtection: number;
      vulnerabilityManagement: number;
      incidentResponse: number;
      accessControl: number;
      dataProtection: number;
      compliance: number;
    };

    trends: Array<{
      date: Date;
      score: number;
      components: Record<string, number>;
    }>;
  };

  // Risk Metrics
  risk: {
    overallRisk: RiskLevel;
    riskScore: number; // 0-100

    // Risk by Category
    byCategory: Record<
      string,
      {
        level: RiskLevel;
        score: number;
        count: number;
      }
    >;

    // Risk Trends
    trends: Array<{
      date: Date;
      score: number;
      level: RiskLevel;
    }>;
  };

  // Performance Metrics
  performance: {
    // Security Tool Performance
    tools: Array<{
      name: string;
      type: string;
      availability: number; // percentage
      responseTime: number; // milliseconds
      accuracy: number; // percentage
      falsePositives: number;
    }>;

    // Team Performance
    team: {
      alertsProcessed: number;
      incidentsHandled: number;
      averageResponseTime: number; // minutes
      workload: number; // alerts per analyst
    };
  };

  // Cost Metrics
  costs: {
    totalSecuritySpend: number;
    costPerIncident: number;
    costPerEmployee: number;

    // By Category
    byCategory: Record<string, number>;

    // ROI Metrics
    roi: {
      preventedLosses: number;
      securityInvestment: number;
      roiPercentage: number;
    };
  };

  // Generated At
  generatedAt: Date;
  generatedBy: string;
}

export interface SecurityConfiguration {
  // Organization Settings
  organization: {
    name: string;
    domain: string;
    industry: string;
    size: 'small' | 'medium' | 'large' | 'enterprise';
    riskTolerance: 'low' | 'medium' | 'high';
    complianceRequirements: ComplianceFramework[];
  };

  // Security Policies
  policies: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      maxAge: number; // days
      historyCount: number;
      lockoutThreshold: number;
      lockoutDuration: number; // minutes
    };

    sessionPolicy: {
      maxIdleTime: number; // minutes
      maxSessionTime: number; // hours
      concurrentSessions: number;
      requireReauth: boolean;
    };

    accessPolicy: {
      defaultDeny: boolean;
      requireApproval: boolean;
      approvalTimeout: number; // hours
      emergencyAccess: boolean;
      privilegedAccessTimeout: number; // minutes
    };
  };

  // Threat Intelligence
  threatIntelligence: {
    enabled: boolean;
    sources: Array<{
      name: string;
      type: 'commercial' | 'open_source' | 'government' | 'community';
      url: string;
      apiKey?: string;
      updateFrequency: number; // hours
      enabled: boolean;
    }>;

    confidence: {
      minimumConfidence: number; // 0-100
      autoBlock: boolean;
      autoBlockThreshold: number; // 0-100
    };
  };

  // Vulnerability Management
  vulnerabilityManagement: {
    scanFrequency: {
      critical: number; // days
      high: number;
      medium: number;
      low: number;
    };

    sla: {
      critical: number; // days
      high: number;
      medium: number;
      low: number;
    };

    riskAcceptance: {
      requireApproval: boolean;
      maxRiskScore: number;
      approvers: string[];
      reviewFrequency: number; // days
    };
  };

  // Incident Response
  incidentResponse: {
    escalation: {
      autoEscalate: boolean;
      escalationTime: number; // minutes
      escalationSeverity: SecurityThreatLevel;
    };

    notification: {
      channels: Array<{
        type: 'email' | 'sms' | 'slack' | 'teams' | 'webhook';
        config: Record<string, any>;
        severities: SecurityThreatLevel[];
        enabled: boolean;
      }>;

      external: {
        regulatoryNotification: boolean;
        customerNotification: boolean;
        mediaResponse: boolean;
        lawEnforcement: boolean;
      };
    };

    retention: {
      incidents: number; // days
      evidence: number; // days
      logs: number; // days
    };
  };

  // Monitoring & Alerting
  monitoring: {
    realTimeMonitoring: boolean;

    alerting: {
      enabled: boolean;
      deduplicate: boolean;
      deduplicationWindow: number; // minutes
      rateLimit: number; // alerts per minute

      rules: Array<{
        name: string;
        condition: string;
        severity: AlertSeverity;
        enabled: boolean;
      }>;
    };

    logging: {
      centralizedLogging: boolean;
      logRetention: number; // days
      logEncryption: boolean;
      logIntegrityChecking: boolean;
    };
  };

  // Compliance
  compliance: {
    frameworks: Array<{
      framework: ComplianceFramework;
      enabled: boolean;
      assessmentFrequency: number; // days
      autoRemediation: boolean;
    }>;

    reporting: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      recipients: string[];
      format: 'pdf' | 'html' | 'json' | 'csv';
      includeEvidence: boolean;
    };
  };

  // Integration
  integrations: {
    siem: {
      enabled: boolean;
      vendor: string;
      endpoint: string;
      apiKey?: string;
      format: 'cef' | 'leef' | 'json' | 'syslog';
    };

    soar: {
      enabled: boolean;
      vendor: string;
      endpoint: string;
      apiKey?: string;
      autoResponse: boolean;
    };

    ticketing: {
      enabled: boolean;
      system: string;
      endpoint: string;
      apiKey?: string;
      autoCreate: boolean;
    };
  };

  // Automation
  automation: {
    enabled: boolean;

    rules: Array<{
      name: string;
      trigger: string;
      condition: string;
      actions: Array<{
        type: string;
        parameters: Record<string, any>;
      }>;
      enabled: boolean;
    }>;

    orchestration: {
      enabled: boolean;
      workflows: Array<{
        name: string;
        trigger: string;
        steps: Array<{
          name: string;
          type: string;
          parameters: Record<string, any>;
          condition?: string;
        }>;
        enabled: boolean;
      }>;
    };
  };

  // Data Protection
  dataProtection: {
    encryption: {
      atRest: {
        enabled: boolean;
        algorithm: EncryptionMethod;
        keyRotation: number; // days
      };

      inTransit: {
        enabled: boolean;
        minTlsVersion: string;
        cipherSuites: string[];
      };
    };

    dlp: {
      enabled: boolean;
      policies: Array<{
        name: string;
        dataTypes: string[];
        actions: string[];
        enabled: boolean;
      }>;
    };

    backup: {
      enabled: boolean;
      frequency: number; // hours
      retention: number; // days
      encryption: boolean;
      offsite: boolean;
    };
  };

  // Metadata
  version: string;
  lastUpdated: Date;
  updatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}
