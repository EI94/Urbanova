'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.leadsActions = exports.leadsManifest = void 0;
exports.leadsManifest = {
  id: 'leads',
  name: 'Lead/Chat Unifier',
  description:
    'Sistema unificato per la gestione dei lead da portali immobiliari e conversazioni multi-canale',
  version: '1.0.0',
  author: 'Urbanova Team',
  capabilities: [
    'lead_ingestion',
    'conversation_unification',
    'multi_channel_reply',
    'sla_tracking',
    'assignment_management',
    'template_system',
    'gdpr_compliance',
    'audit_logging',
  ],
  features: [
    'SendGrid Inbound Parse integration',
    'Twilio WhatsApp integration',
    'SendGrid Mail Send integration',
    'Real-time SLA monitoring',
    'Automatic lead assignment',
    'Template-based messaging',
    'GDPR compliant data handling',
    'Comprehensive audit trail',
  ],
  integrations: [
    'Firestore (database)',
    'Google Cloud Storage (attachments)',
    'Twilio (WhatsApp/SMS)',
    'SendGrid (email)',
    'Gmail API (optional)',
    'Portal Connectors (Puppeteer)',
  ],
  security: {
    authentication: 'JWT-based',
    authorization: 'Role-based access control',
    dataEncryption: 'AES-256',
    auditLogging: 'Comprehensive',
    gdprCompliance: 'Full compliance',
  },
  compliance: {
    gdpr: true,
    dataRetention: 'Configurable (default: 2 years)',
    consentManagement: true,
    dataMinimization: true,
    auditTrail: true,
  },
  performance: {
    slaTarget: '15 minutes first response',
    concurrentUsers: 100,
    messageThroughput: '1000/hour',
    uptime: '99.9%',
  },
  documentation: {
    apiDocs: '/docs/leads-api',
    userGuide: '/docs/leads-user-guide',
    adminGuide: '/docs/leads-admin-guide',
  },
};
exports.leadsActions = {
  'leads.list': {
    description: 'Lista tutti i lead con filtri opzionali',
    parameters: {
      projectId: { type: 'string', optional: true, description: 'ID del progetto' },
      source: {
        type: 'string',
        optional: true,
        description: 'Fonte del lead (immobiliare, idealista, etc.)',
      },
      status: {
        type: 'string',
        optional: true,
        description: 'Stato del lead (new, contacted, qualified, lost, won)',
      },
      limit: { type: 'number', optional: true, description: 'Numero massimo di risultati' },
    },
    handler: 'listLeads',
  },
  'leads.get': {
    description: 'Ottiene i dettagli di un lead specifico',
    parameters: {
      leadId: { type: 'string', required: true, description: 'ID del lead' },
    },
    handler: 'getLead',
  },
  'leads.create': {
    description: 'Crea un nuovo lead',
    parameters: {
      projectId: { type: 'string', required: true, description: 'ID del progetto' },
      source: { type: 'string', required: true, description: 'Fonte del lead' },
      name: { type: 'string', required: true, description: 'Nome del lead' },
      email: { type: 'string', optional: true, description: 'Email del lead' },
      phone: { type: 'string', optional: true, description: 'Telefono del lead' },
      message: { type: 'string', optional: true, description: 'Messaggio del lead' },
      listingId: { type: 'string', optional: true, description: "ID dell'annuncio" },
    },
    handler: 'createLead',
  },
  'leads.update': {
    description: 'Aggiorna un lead esistente',
    parameters: {
      leadId: { type: 'string', required: true, description: 'ID del lead' },
      status: { type: 'string', optional: true, description: 'Nuovo stato' },
      assignedUserId: { type: 'string', optional: true, description: 'ID utente assegnato' },
      priority: { type: 'string', optional: true, description: 'Priorità (low, medium, high)' },
    },
    handler: 'updateLead',
  },
  'leads.assign': {
    description: 'Assegna un lead a un utente',
    parameters: {
      leadId: { type: 'string', required: true, description: 'ID del lead' },
      userId: { type: 'string', required: true, description: "ID dell'utente" },
    },
    handler: 'assignLead',
  },
  'conversations.list': {
    description: 'Lista tutte le conversazioni',
    parameters: {
      leadId: { type: 'string', optional: true, description: 'ID del lead' },
      projectId: { type: 'string', optional: true, description: 'ID del progetto' },
      channel: {
        type: 'string',
        optional: true,
        description: 'Canale (whatsapp, email, portal:*)',
      },
      slaStatus: {
        type: 'string',
        optional: true,
        description: 'Stato SLA (on_track, at_risk, breached)',
      },
    },
    handler: 'listConversations',
  },
  'conversations.get': {
    description: 'Ottiene i dettagli di una conversazione',
    parameters: {
      convId: { type: 'string', required: true, description: 'ID della conversazione' },
    },
    handler: 'getConversation',
  },
  'conversations.messages': {
    description: 'Lista i messaggi di una conversazione',
    parameters: {
      convId: { type: 'string', required: true, description: 'ID della conversazione' },
      limit: { type: 'number', optional: true, description: 'Numero massimo di messaggi' },
    },
    handler: 'getConversationMessages',
  },
  'messages.send': {
    description: 'Invia un messaggio',
    parameters: {
      convId: { type: 'string', required: true, description: 'ID della conversazione' },
      text: { type: 'string', required: true, description: 'Testo del messaggio' },
      channel: {
        type: 'string',
        optional: true,
        description: 'Canale (whatsapp/email, auto-detect se non specificato)',
      },
      templateId: { type: 'string', optional: true, description: 'ID del template da usare' },
      variables: { type: 'object', optional: true, description: 'Variabili per il template' },
    },
    handler: 'sendMessage',
  },
  'templates.list': {
    description: 'Lista tutti i template disponibili',
    parameters: {
      category: { type: 'string', optional: true, description: 'Categoria del template' },
      active: { type: 'boolean', optional: true, description: 'Solo template attivi' },
    },
    handler: 'listTemplates',
  },
  'templates.get': {
    description: 'Ottiene un template specifico',
    parameters: {
      templateId: { type: 'string', required: true, description: 'ID del template' },
    },
    handler: 'getTemplate',
  },
  'templates.render': {
    description: 'Renderizza un template con le variabili',
    parameters: {
      templateId: { type: 'string', required: true, description: 'ID del template' },
      variables: { type: 'object', required: true, description: 'Variabili per il template' },
    },
    handler: 'renderTemplate',
  },
  'sla.check': {
    description: 'Controlla lo stato SLA di una conversazione',
    parameters: {
      convId: { type: 'string', required: true, description: 'ID della conversazione' },
    },
    handler: 'checkSLA',
  },
  'sla.list': {
    description: 'Lista tutte le conversazioni con SLA a rischio',
    parameters: {
      status: { type: 'string', optional: true, description: 'Stato SLA (at_risk, breached)' },
    },
    handler: 'listSLAAlerts',
  },
  'stats.overview': {
    description: 'Statistiche generali dei lead',
    parameters: {
      projectId: { type: 'string', optional: true, description: 'ID del progetto' },
      period: { type: 'string', optional: true, description: 'Periodo (today, week, month)' },
    },
    handler: 'getStats',
  },
  'stats.sla': {
    description: 'Statistiche SLA',
    parameters: {
      projectId: { type: 'string', optional: true, description: 'ID del progetto' },
      period: { type: 'string', optional: true, description: 'Periodo (today, week, month)' },
    },
    handler: 'getSLAStats',
  },
};
//# sourceMappingURL=manifest.js.map
