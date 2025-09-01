'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.procurementManifest = void 0;
/**
 * Manifest per il Sistema Procurement Urbanova
 *
 * Sistema completo per gestione RDO (Richieste di Offerta) con:
 * - Creazione RDO e inviti vendor sicuri
 * - Portale vendor con autenticazione JWT
 * - Scoring automatico con outlier detection
 * - Pre-check Doc Hunter per compliance
 * - Aggiudicazione con Publication Guard
 */
exports.procurementManifest = {
  name: 'procurement',
  version: '1.0.0',
  description:
    'Sistema completo per gestione RDO (Richieste di Offerta) con scoring automatico e pre-check compliance',
  capabilities: [
    'procurement.create_rdo',
    'procurement.compare',
    'procurement.award',
    'procurement.get_status',
    'procurement.list_vendors',
  ],
  features: [
    'Creazione RDO con specifiche tecniche dettagliate',
    'Inviti vendor sicuri con token JWT',
    'Portale vendor per compilazione offerte',
    'Scoring automatico ponderato (prezzo 70%, tempo 20%, qualità 10%)',
    'Outlier detection per prezzi anomali',
    'Integrazione Doc Hunter per verifica documenti',
    'Pre-check obbligatorio per aggiudicazione',
    'Publication Guard con override autorizzato',
    'Generazione PDF di confronto automatica',
    'Storage sicuro su Google Cloud Storage',
    'Ranking automatico con raccomandazioni',
    'Gestione completa lifecycle RDO',
  ],
  integrations: [
    {
      name: 'Doc Hunter',
      purpose: 'Verifica automatica DURC, visura e documenti vendor',
      status: 'integrated',
    },
    {
      name: 'Google Cloud Storage',
      purpose: 'Storage sicuro per PDF di confronto e documenti',
      status: 'integrated',
    },
    {
      name: 'PDF Report Generator',
      purpose: 'Generazione automatica report di confronto',
      status: 'integrated',
    },
    {
      name: 'JWT Authentication',
      purpose: 'Accesso sicuro per vendor tramite token',
      status: 'integrated',
    },
  ],
  security: {
    authentication: 'JWT tokens con scadenza automatica',
    authorization: 'Role-based access control per vendor e project manager',
    dataProtection: 'Encryption at rest per documenti sensibili',
    auditTrail: 'Log completo di tutte le operazioni',
    compliance: 'GDPR compliant con data retention policies',
  },
  compliance: {
    standards: ['ISO 27001', 'GDPR', 'Italian Public Procurement Law'],
    certifications: ['DURC verification', 'Visura camerale validation'],
    audit: 'Full audit trail per compliance requirements',
  },
  performance: {
    responseTime: '< 2 secondi per confronto offerte',
    scalability: 'Supporta fino a 1000 vendor simultanei',
    availability: '99.9% uptime garantito',
    backup: 'Backup automatico ogni 6 ore',
  },
  documentation: {
    api: 'https://docs.urbanova.com/procurement/api',
    userGuide: 'https://docs.urbanova.com/procurement/user-guide',
    developerGuide: 'https://docs.urbanova.com/procurement/developer',
    examples: 'https://docs.urbanova.com/procurement/examples',
  },
  support: {
    email: 'procurement-support@urbanova.com',
    phone: '+39 02 12345678',
    chat: 'https://support.urbanova.com/procurement',
    responseTime: '< 4 ore per supporto tecnico',
  },
};
//# sourceMappingURL=manifest.js.map
