import { ToolManifest } from '@urbanova/types';

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

export const procurementManifest: ToolManifest = {
  id: 'procurement',
  name: 'procurement',
  version: '1.0.0',
  category: 'automation',
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
    {
      name: 'Creazione RDO',
      description: 'Creazione RDO con specifiche tecniche dettagliate',
      enabled: true,
    },
    {
      name: 'Inviti Vendor Sicuri',
      description: 'Inviti vendor sicuri con token JWT',
      enabled: true,
    },
    {
      name: 'Portale Vendor',
      description: 'Portale vendor per compilazione offerte',
      enabled: true,
    },
    {
      name: 'Scoring Automatico',
      description: 'Scoring automatico ponderato (prezzo 70%, tempo 20%, qualità 10%)',
      enabled: true,
    },
    {
      name: 'Outlier Detection',
      description: 'Outlier detection per prezzi anomali',
      enabled: true,
    },
    {
      name: 'Integrazione Doc Hunter',
      description: 'Integrazione Doc Hunter per verifica documenti',
      enabled: true,
    },
    {
      name: 'Pre-check Obbligatorio',
      description: 'Pre-check obbligatorio per aggiudicazione',
      enabled: true,
    },
    {
      name: 'Publication Guard',
      description: 'Publication Guard con override autorizzato',
      enabled: true,
    },
    {
      name: 'Generazione PDF',
      description: 'Generazione PDF di confronto automatica',
      enabled: true,
    },
    {
      name: 'Storage Sicuro',
      description: 'Storage sicuro su Google Cloud Storage',
      enabled: true,
    },
    {
      name: 'Ranking Automatico',
      description: 'Ranking automatico con raccomandazioni',
      enabled: true,
    },
    {
      name: 'Gestione Lifecycle',
      description: 'Gestione completa lifecycle RDO',
      enabled: true,
    },
  ],

  integrations: [
    {
      name: 'Doc Hunter',
      description: 'Verifica automatica DURC, visura e documenti vendor',
      status: 'integrated',
    },
    {
      name: 'Google Cloud Storage',
      description: 'Storage sicuro per PDF di confronto e documenti',
      status: 'integrated',
    },
    {
      name: 'PDF Report Generator',
      description: 'Generazione automatica report di confronto',
      status: 'integrated',
    },
    {
      name: 'JWT Authentication',
      description: 'Accesso sicuro per vendor tramite token',
      status: 'integrated',
    },
  ],

  security: {
    authentication: 'JWT tokens con scadenza automatica',
    authorization: 'Role-based access control per vendor e project manager',



  },

  compliance: {



  },

  performance: {
    responseTime: '< 2 secondi per confronto offerte',
    scalability: 'Supporta fino a 1000 vendor simultanei',


  },

  documentation: {
    api: 'https://docs.urbanova.com/procurement/api',
    userGuide: 'https://docs.urbanova.com/procurement/user-guide',

    examples: 'https://docs.urbanova.com/procurement/examples',
  },

  support: {
    email: 'procurement-support@urbanova.com',

    chat: 'https://support.urbanova.com/procurement',
    responseTime: '< 4 ore per supporto tecnico',
  },
};
