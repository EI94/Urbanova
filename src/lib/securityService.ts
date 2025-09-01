// Service per la gestione di Advanced Security & Threat Intelligence
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
} from '@/types/security';

export class SecurityService {
  private threats: Map<string, ThreatIntelligence> = new Map();
  private vulnerabilities: Map<string, SecurityVulnerability> = new Map();
  private incidents: Map<string, SecurityIncident> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();
  private audits: Map<string, SecurityAudit> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();
  private identities: Map<string, IdentityAccess> = new Map();
  private configuration!: SecurityConfiguration;

  constructor() {
    this.initializeConfiguration();
    this.initializeData();
    this.startDataGeneration();
  }

  private initializeConfiguration() {
    this.configuration = {
      organization: {
        name: 'Urbanova',
        domain: 'urbanova.com',
        industry: 'Real Estate Technology',
        size: 'enterprise',
        riskTolerance: 'low',
        complianceRequirements: ['soc2', 'gdpr', 'iso27001'],
      },
      policies: {
        passwordPolicy: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          maxAge: 90,
          historyCount: 12,
          lockoutThreshold: 5,
          lockoutDuration: 30,
        },
        sessionPolicy: {
          maxIdleTime: 30,
          maxSessionTime: 8,
          concurrentSessions: 3,
          requireReauth: true,
        },
        accessPolicy: {
          defaultDeny: true,
          requireApproval: true,
          approvalTimeout: 24,
          emergencyAccess: true,
          privilegedAccessTimeout: 60,
        },
      },
      threatIntelligence: {
        enabled: true,
        sources: [
          {
            name: 'MITRE ATT&CK',
            type: 'open_source',
            url: 'https://attack.mitre.org/api',
            updateFrequency: 24,
            enabled: true,
          },
        ],
        confidence: {
          minimumConfidence: 70,
          autoBlock: true,
          autoBlockThreshold: 90,
        },
      },
      vulnerabilityManagement: {
        scanFrequency: {
          critical: 1,
          high: 3,
          medium: 7,
          low: 30,
        },
        sla: {
          critical: 1,
          high: 7,
          medium: 30,
          low: 90,
        },
        riskAcceptance: {
          requireApproval: true,
          maxRiskScore: 7.0,
          approvers: ['ciso@urbanova.com'],
          reviewFrequency: 90,
        },
      },
      incidentResponse: {
        escalation: {
          autoEscalate: true,
          escalationTime: 60,
          escalationSeverity: 'high',
        },
        notification: {
          channels: [
            {
              type: 'email',
              config: { recipients: ['security@urbanova.com'] },
              severities: ['critical', 'high'],
              enabled: true,
            },
          ],
          external: {
            regulatoryNotification: true,
            customerNotification: false,
            mediaResponse: false,
            lawEnforcement: false,
          },
        },
        retention: {
          incidents: 2555,
          evidence: 2555,
          logs: 365,
        },
      },
      monitoring: {
        realTimeMonitoring: true,
        alerting: {
          enabled: true,
          deduplicate: true,
          deduplicationWindow: 5,
          rateLimit: 100,
          rules: [
            {
              name: 'Multiple Failed Logins',
              condition: 'failed_logins > 5 in 10 minutes',
              severity: 'warning',
              enabled: true,
            },
          ],
        },
        logging: {
          centralizedLogging: true,
          logRetention: 365,
          logEncryption: true,
          logIntegrityChecking: true,
        },
      },
      compliance: {
        frameworks: [
          {
            framework: 'soc2',
            enabled: true,
            assessmentFrequency: 365,
            autoRemediation: true,
          },
        ],
        reporting: {
          frequency: 'monthly',
          recipients: ['compliance@urbanova.com'],
          format: 'pdf',
          includeEvidence: true,
        },
      },
      integrations: {
        siem: {
          enabled: true,
          vendor: 'Splunk',
          endpoint: 'https://siem.urbanova.com:8088',
          format: 'json',
        },
        soar: {
          enabled: true,
          vendor: 'Phantom',
          endpoint: 'https://soar.urbanova.com/api',
          autoResponse: true,
        },
        ticketing: {
          enabled: true,
          system: 'ServiceNow',
          endpoint: 'https://urbanova.service-now.com/api',
          autoCreate: true,
        },
      },
      automation: {
        enabled: true,
        rules: [
          {
            name: 'Auto-block malicious IPs',
            trigger: 'threat_detected',
            condition: 'confidence > 90 AND severity = critical',
            actions: [{ type: 'block_ip', parameters: { duration: 3600 } }],
            enabled: true,
          },
        ],
        orchestration: {
          enabled: true,
          workflows: [
            {
              name: 'Incident Response Workflow',
              trigger: 'security_incident',
              steps: [
                {
                  name: 'Create Ticket',
                  type: 'create_ticket',
                  parameters: { system: 'servicenow' },
                },
              ],
              enabled: true,
            },
          ],
        },
      },
      dataProtection: {
        encryption: {
          atRest: {
            enabled: true,
            algorithm: 'aes256',
            keyRotation: 90,
          },
          inTransit: {
            enabled: true,
            minTlsVersion: '1.3',
            cipherSuites: ['TLS_AES_256_GCM_SHA384'],
          },
        },
        dlp: {
          enabled: true,
          policies: [
            {
              name: 'PII Protection',
              dataTypes: ['ssn', 'credit_card'],
              actions: ['alert', 'block'],
              enabled: true,
            },
          ],
        },
        backup: {
          enabled: true,
          frequency: 6,
          retention: 90,
          encryption: true,
          offsite: true,
        },
      },
      version: '1.0.0',
      lastUpdated: new Date(),
      updatedBy: 'security-admin',
    };
  }

  private initializeData() {
    // Initialize sample data for demonstration
    this.initializeThreats();
    this.initializeVulnerabilities();
    this.initializeIncidents();
    this.generateSecurityAlerts(20);
    this.generateVulnerabilities(15);
    this.generateIncidents(5);
  }

  private initializeThreats() {
    const threat: ThreatIntelligence = {
      id: 'apt-001',
      name: 'APT29 (Cozy Bear)',
      description: 'Advanced persistent threat group attributed to Russian SVR',
      category: 'apt',
      severity: 'critical',
      confidence: 95,
      indicators: [
        {
          type: 'domain',
          value: 'cozybearsupply.com',
          confidence: 90,
          context: 'Command and control domain',
        },
      ],
      attackVectors: ['spear_phishing'],
      techniques: [
        {
          id: 'T1566.001',
          name: 'Spearphishing Attachment',
          tactic: 'Initial Access',
          description: 'Adversaries may send spearphishing emails',
        },
      ],
      targetedSectors: ['government', 'technology'],
      targetedCountries: ['US', 'EU'],
      targetedTechnologies: ['Windows', 'Office365'],
      attribution: {
        actor: 'APT29',
        confidence: 90,
      },
      firstSeen: new Date('2023-01-15'),
      lastSeen: new Date(),
      sources: [
        {
          name: 'MITRE ATT&CK',
          reliability: 'A',
          credibility: 95,
        },
      ],
      mitigations: [
        {
          technique: 'Email Security',
          description: 'Implement advanced email filtering',
          effectiveness: 85,
        },
      ],
      status: 'active',
      tags: ['apt', 'russia'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      createdBy: 'threat-intel-team',
    };
    this.threats.set(threat.id, threat);
  }

  private initializeVulnerabilities() {
    const vuln: SecurityVulnerability = {
      id: 'vuln-001',
      title: 'SQL Injection in User Authentication',
      description: 'SQL injection vulnerability in login form',
      type: 'injection',
      severity: 'critical',
      cvssScore: 9.8,
      cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
      asset: {
        id: 'app-001',
        name: 'Urbanova Web Application',
        type: 'application',
        environment: 'production',
        owner: 'dev-team@urbanova.com',
        criticality: 'critical',
      },
      location: {
        file: '/src/auth/login.php',
        line: 45,
      },
      evidence: [],
      exploitability: 9.5,
      impact: 10.0,
      likelihood: 9.0,
      riskScore: 9.8,
      remediation: {
        effort: 'low',
        priority: 'critical',
        steps: ['Replace with parameterized queries'],
        estimatedTime: 8,
        resources: ['Senior Developer'],
      },
      patch: {
        available: true,
        tested: true,
      },
      status: 'confirmed',
      complianceImpact: [],
      discoveredAt: new Date('2024-01-18'),
      reportedAt: new Date('2024-01-18'),
      scanner: {
        name: 'OWASP ZAP',
        version: '2.14.0',
        scanType: 'dast',
        scanDate: new Date('2024-01-18'),
        confidence: 95,
      },
      references: [],
      tags: ['sql-injection'],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date(),
    };
    this.vulnerabilities.set(vuln.id, vuln);
  }

  private initializeIncidents() {
    const incident: SecurityIncident = {
      id: 'inc-001',
      title: 'Suspected Data Breach',
      description: 'Unauthorized database access detected',
      category: 'data_breach',
      severity: 'high',
      priority: 'critical',
      status: 'investigating',
      impact: {
        confidentiality: 'high',
        integrity: 'medium',
        availability: 'low',
        affectedSystems: ['customer-db-prod'],
        affectedUsers: 15000,
        dataCompromised: true,
        serviceDisruption: false,
        reputationalImpact: 'high',
        complianceViolation: true,
        regulatoryNotificationRequired: true,
        affectedRegulations: ['gdpr'],
      },
      detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      responseTeam: [
        {
          userId: 'ciso-001',
          name: 'CISO',
          role: 'lead',
          contactInfo: 'ciso@urbanova.com',
        },
      ],
      investigation: {
        attackTimeline: [],
        iocs: [],
      },
      actions: [],
      communications: [],
      evidence: [],
      metrics: {
        detectionTime: 120,
        responseTime: 60,
      },
      related: {
        vulnerabilities: [],
        threats: [],
        incidents: [],
        alerts: [],
      },
      tags: ['data-breach'],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(),
      createdBy: 'security-monitoring',
    };
    this.incidents.set(incident.id, incident);
  }

  private generateSecurityAlerts(count: number) {
    for (let i = 0; i < count; i++) {
      const alert: SecurityAlert = {
        id: `alert-${Date.now()}-${i}`,
        title: `Security Alert ${i + 2}`,
        description: 'Automated security alert',
        type: 'login_attempt',
        severity: 'warning',
        category: 'insider_threat',
        source: {
          system: 'Security Monitoring',
          sensor: 'SIEM',
          rule: `Rule-${i}`,
          confidence: 85,
        },
        event: {
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        },
        context: {
          asset: {
            id: `asset-${i}`,
            name: `System ${i}`,
            type: 'server',
            criticality: 'medium',
          },
          environment: 'production',
        },
        risk: {
          score: Math.floor(Math.random() * 100),
          level: 'medium',
          factors: [],
        },
        response: {
          status: 'new',
          actions: [],
        },
        correlation: {
          relatedAlerts: [],
          count: 1,
          timeWindow: 15,
        },
        evidence: [],
        suppression: {
          suppressed: false,
        },
        tags: ['automated'],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      this.alerts.set(alert.id, alert);
    }
  }

  private generateVulnerabilities(count: number) {
    for (let i = 0; i < count; i++) {
      const vuln: SecurityVulnerability = {
        id: `vuln-${Date.now()}-${i}`,
        title: `Vulnerability ${i + 2}`,
        description: 'Security vulnerability',
        type: 'injection',
        severity: 'medium',
        cvssScore: 5.5,
        cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:L',
        asset: {
          id: `app-${i}`,
          name: `Application ${i}`,
          type: 'application',
          environment: 'development',
          owner: 'dev-team@urbanova.com',
          criticality: 'medium',
        },
        location: {},
        evidence: [],
        exploitability: 5,
        impact: 5,
        likelihood: 5,
        riskScore: 5.5,
        remediation: {
          effort: 'medium',
          priority: 'medium',
          steps: ['Apply patch'],
          estimatedTime: 16,
          resources: ['Developer'],
        },
        patch: {
          available: true,
          tested: false,
        },
        status: 'open',
        complianceImpact: [],
        discoveredAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        reportedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        scanner: {
          name: 'Scanner',
          version: '1.0.0',
          scanType: 'sast',
          scanDate: new Date(),
          confidence: 80,
        },
        references: [],
        tags: ['automated'],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      this.vulnerabilities.set(vuln.id, vuln);
    }
  }

  private generateIncidents(count: number) {
    for (let i = 0; i < count; i++) {
      const incident: SecurityIncident = {
        id: `inc-${Date.now()}-${i}`,
        title: `Incident ${i + 2}`,
        description: 'Security incident',
        category: 'malware',
        severity: 'medium',
        priority: 'medium',
        status: 'new',
        impact: {
          confidentiality: 'low',
          integrity: 'low',
          availability: 'low',
          affectedSystems: [],
          affectedUsers: 0,
          dataCompromised: false,
          serviceDisruption: false,
          reputationalImpact: 'none',
          complianceViolation: false,
          regulatoryNotificationRequired: false,
          affectedRegulations: [],
        },
        detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        responseTeam: [],
        investigation: {
          attackTimeline: [],
          iocs: [],
        },
        actions: [],
        communications: [],
        evidence: [],
        metrics: {
          detectionTime: 60,
          responseTime: 30,
        },
        related: {
          vulnerabilities: [],
          threats: [],
          incidents: [],
          alerts: [],
        },
        tags: ['automated'],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        createdBy: 'security-monitoring',
      };
      this.incidents.set(incident.id, incident);
    }
  }

  private startDataGeneration() {
    setInterval(() => {
      this.generateSecurityAlerts(1);
    }, 30000);
  }

  // Public API methods
  createThreat(
    threat: Omit<ThreatIntelligence, 'id' | 'createdAt' | 'updatedAt'>
  ): ThreatIntelligence {
    const newThreat: ThreatIntelligence = {
      ...threat,
      id: `threat-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.threats.set(newThreat.id, newThreat);
    return newThreat;
  }

  createVulnerability(
    vulnerability: Omit<SecurityVulnerability, 'id' | 'createdAt' | 'updatedAt'>
  ): SecurityVulnerability {
    const newVulnerability: SecurityVulnerability = {
      ...vulnerability,
      id: `vuln-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vulnerabilities.set(newVulnerability.id, newVulnerability);
    return newVulnerability;
  }

  createIncident(
    incident: Omit<SecurityIncident, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>
  ): SecurityIncident {
    const newIncident: SecurityIncident = {
      ...incident,
      id: `inc-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        detectionTime: 0,
        responseTime: 0,
      },
    };
    this.incidents.set(newIncident.id, newIncident);
    return newIncident;
  }

  resolveAlert(id: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    alert.response.status = 'resolved';
    alert.updatedAt = new Date();
    return true;
  }

  generateSecurityMetrics(): SecurityMetrics {
    const alerts = Array.from(this.alerts.values());
    const vulnerabilities = Array.from(this.vulnerabilities.values());
    const incidents = Array.from(this.incidents.values());

    return {
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
        granularity: 'day',
      },
      threats: {
        totalThreats: this.threats.size,
        newThreats: 1,
        activeThreats: this.threats.size,
        blockedThreats: 0,
        bySeverity: {
          info: 0,
          low: 0,
          medium: 0,
          high: 0,
          critical: 1,
          emergency: 0,
        },
        byCategory: {
          malware: 0,
          phishing: 0,
          ransomware: 0,
          apt: 1,
          insider_threat: 0,
          ddos: 0,
          data_breach: 0,
          supply_chain: 0,
          social_engineering: 0,
          zero_day: 0,
          botnet: 0,
          cryptojacking: 0,
        },
        topThreats: [{ name: 'APT29', category: 'apt', count: 1, trend: 'stable' }],
        mttd: 45,
        mttr: 120,
      },
      vulnerabilities: {
        totalVulnerabilities: vulnerabilities.length,
        newVulnerabilities: vulnerabilities.length,
        resolvedVulnerabilities: 0,
        openVulnerabilities: vulnerabilities.length,
        bySeverity: {
          info: 0,
          low: 0,
          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
          high: 0,
          critical: vulnerabilities.filter(v => v.severity === 'critical').length,
          emergency: 0,
        },
        byType: {
          injection: vulnerabilities.filter(v => v.type === 'injection').length,
          broken_auth: 0,
          sensitive_data: 0,
          xxe: 0,
          broken_access: 0,
          security_misconfig: 0,
          xss: 0,
          insecure_deserialization: 0,
          components: 0,
          logging_monitoring: 0,
          buffer_overflow: 0,
          race_condition: 0,
          privilege_escalation: 0,
          denial_service: 0,
          code_injection: 0,
        },
        byAssetType: {
          application: vulnerabilities.length,
        },
        mttr: 7.5,
        slaCompliance: 92.5,
      },
      incidents: {
        totalIncidents: incidents.length,
        newIncidents: incidents.length,
        resolvedIncidents: 0,
        openIncidents: incidents.length,
        bySeverity: {
          info: 0,
          low: 0,
          medium: incidents.filter(i => i.severity === 'medium').length,
          high: incidents.filter(i => i.severity === 'high').length,
          critical: 0,
          emergency: 0,
        },
        byCategory: {
          malware: incidents.filter(i => i.category === 'malware').length,
          phishing: 0,
          ransomware: 0,
          apt: 0,
          insider_threat: 0,
          ddos: 0,
          data_breach: incidents.filter(i => i.category === 'data_breach').length,
          supply_chain: 0,
          social_engineering: 0,
          zero_day: 0,
          botnet: 0,
          cryptojacking: 0,
        },
        averageResponseTime: 45,
        averageResolutionTime: 240,
        totalCost: 50000,
        averageCost: 25000,
      },
      compliance: {
        overallScore: 87.5,
        byFramework: {
          soc2: {
            score: 92,
            totalControls: 25,
            passedControls: 23,
            failedControls: 2,
            lastAssessment: new Date('2024-01-15'),
          },
          gdpr: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          hipaa: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          pci_dss: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          iso27001: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          nist: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          fedramp: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          cis: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          cobit: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          fisma: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          sox: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
          glba: {
            score: 0,
            totalControls: 0,
            passedControls: 0,
            failedControls: 0,
            lastAssessment: new Date('2024-01-01'),
          },
        },
        audits: {
          total: 1,
          passed: 1,
          failed: 0,
          pending: 0,
        },
      },
      access: {
        totalIdentities: 1,
        activeIdentities: 1,
        privilegedIdentities: 0,
        suspendedIdentities: 0,
        authentication: {
          totalLogins: 1247,
          successfulLogins: 1247,
          failedLogins: 0,
          mfaAdoption: 100,
          ssoAdoption: 75,
        },
        accessReviews: {
          total: 1,
          completed: 1,
          pending: 0,
          overdue: 0,
        },
      },
      posture: {
        overallScore: 82,
        components: {
          threatProtection: 85,
          vulnerabilityManagement: 78,
          incidentResponse: 88,
          accessControl: 90,
          dataProtection: 80,
          compliance: 75,
        },
        trends: [],
      },
      risk: {
        overallRisk: 'medium',
        riskScore: 65,
        byCategory: {
          Technical: {
            level: 'medium',
            score: 60,
            count: vulnerabilities.length,
          },
        },
        trends: [],
      },
      performance: {
        tools: [
          {
            name: 'SIEM',
            type: 'monitoring',
            availability: 99.5,
            responseTime: 250,
            accuracy: 92,
            falsePositives: 8,
          },
        ],
        team: {
          alertsProcessed: alerts.length,
          incidentsHandled: incidents.length,
          averageResponseTime: 45,
          workload: alerts.length,
        },
      },
      costs: {
        totalSecuritySpend: 500000,
        costPerIncident: 25000,
        costPerEmployee: 1250,
        byCategory: {
          Tools: 200000,
          Personnel: 250000,
        },
        roi: {
          preventedLosses: 2000000,
          securityInvestment: 500000,
          roiPercentage: 300,
        },
      },
      generatedAt: new Date(),
      generatedBy: 'security-service',
    };
  }

  // Getters
  getThreats(): ThreatIntelligence[] {
    return Array.from(this.threats.values());
  }

  getVulnerabilities(): SecurityVulnerability[] {
    return Array.from(this.vulnerabilities.values());
  }

  getIncidents(): SecurityIncident[] {
    return Array.from(this.incidents.values());
  }

  getPolicies(): SecurityPolicy[] {
    return Array.from(this.policies.values());
  }

  getAudits(): SecurityAudit[] {
    return Array.from(this.audits.values());
  }

  getAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values());
  }

  getIdentities(): IdentityAccess[] {
    return Array.from(this.identities.values());
  }

  getConfiguration(): SecurityConfiguration {
    return this.configuration;
  }
}

// Singleton instance
export const securityService = new SecurityService();
