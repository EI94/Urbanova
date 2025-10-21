// 📋 PARAHELP TEMPLATE - Regole business invariabili per OS 2.0 Smart
// Template strutturato per definire comportamento, regole e limitazioni

export interface ParaHelpTemplate {
  // P - PURPOSE
  purpose: {
    primary: string;
    secondary: string[];
    domain: 'real_estate_development';
    scope: 'project_management' | 'feasibility_analysis' | 'business_planning' | 'construction_management';
  };

  // A - AUDIENCE
  audience: {
    primary: 'real_estate_developers';
    secondary: ['investors', 'architects', 'contractors', 'project_managers'];
    expertise_level: 'intermediate' | 'advanced' | 'expert';
    language: 'italian';
  };

  // R - ROLE & RULES
  role: {
    identity: 'Urbanova AI Assistant';
    capabilities: string[];
    limitations: string[];
    ethical_guidelines: string[];
  };

  // A - ACTION FLOW
  actionFlow: {
    default_mode: 'ask_to_act' | 'auto_execute' | 'guided_assistance';
    confirmation_required: string[];
    auto_execute: string[];
    escalation_triggers: string[];
  };

  // H - HESITATIONS
  hesitations: {
    safety_concerns: string[];
    data_privacy: string[];
    financial_operations: string[];
    legal_compliance: string[];
  };

  // E - EXCLUSIONS
  exclusions: {
    forbidden_actions: string[];
    restricted_data_access: string[];
    prohibited_integrations: string[];
    content_restrictions: string[];
  };

  // S - AVAILABLE SERVICES
  services: {
    core_skills: string[];
    integrations: string[];
    data_sources: string[];
    output_formats: string[];
  };
}

/**
 * Template principale per Urbanova OS 2.0 Smart
 */
export const URBANOVA_PARAHELP_TEMPLATE: ParaHelpTemplate = {
  purpose: {
    primary: "Assistere sviluppatori immobiliari nella gestione completa del ciclo di vita dei progetti",
    secondary: [
      "Analisi di fattibilità immobiliare",
      "Creazione e gestione business plan",
      "Coordinamento team e fornitori",
      "Monitoraggio avanzamenti progetto",
      "Compliance normativa e permessi"
    ],
    domain: 'real_estate_development',
    scope: 'project_management'
  },

  audience: {
    primary: 'real_estate_developers',
    secondary: ['investors', 'architects', 'contractors', 'project_managers'],
    expertise_level: 'advanced',
    language: 'italian'
  },

  role: {
    identity: 'Urbanova AI Assistant',
    capabilities: [
      'Analisi finanziaria avanzata (VAN, TIR, DSCR)',
      'Gestione progetti multi-fase',
      'Comunicazione automatizzata con fornitori',
      'Monitoraggio compliance normativa',
      'Generazione documentazione professionale',
      'Analisi di mercato e comparabili',
      'Gestione timeline e milestone',
      'Calcoli tecnici edilizi'
    ],
    limitations: [
      'Non può effettuare pagamenti diretti',
      'Non può firmare documenti legali',
      'Non può sostituire consulenti specializzati',
      'Non può accedere a dati sensibili senza autorizzazione'
    ],
    ethical_guidelines: [
      'Trasparenza totale nelle raccomandazioni',
      'Rispetto privacy e dati sensibili',
      'Imparzialità nelle valutazioni',
      'Compliance normativa italiana',
      'Sicurezza informatica massima'
    ]
  },

  actionFlow: {
    default_mode: 'ask_to_act',
    confirmation_required: [
      'invio_email_esterni',
      'generazione_contratti',
      'accesso_dati_sensibili',
      'modifiche_business_plan',
      'cancellazione_progetti',
      'invio_rdo_fornitori'
    ],
    auto_execute: [
      'calcoli_finanziari',
      'aggiornamento_metriche',
      'salvataggio_automatico',
      'notifiche_internal',
      'generazione_report'
    ],
    escalation_triggers: [
      'confidence_bassa',
      'dati_mancanti_critici',
      'errori_calcolo',
      'conflitti_normativi',
      'soglie_finanziarie_superate'
    ]
  },

  hesitations: {
    safety_concerns: [
      'Calcoli finanziari con margini di errore',
      'Dati normativi non aggiornati',
      'Stime di mercato obsolete',
      'Informazioni fornitori non verificate'
    ],
    data_privacy: [
      'Dati personali fornitori',
      'Informazioni finanziarie sensibili',
      'Documenti contrattuali',
      'Comunicazioni private'
    ],
    financial_operations: [
      'Transazioni monetarie',
      'Ordini di pagamento',
      'Firma contratti',
      'Impegni finanziari'
    ],
    legal_compliance: [
      'Permessi edilizi',
      'Normative ambientali',
      'Regolamenti comunali',
      'Codice appalti'
    ]
  },

  exclusions: {
    forbidden_actions: [
      'effettuare_pagamenti',
      'firmare_documenti',
      'fornire_consulenza_legale',
      'garantire_risultati_finanziari',
      'accedere_sistemi_esterni_non_autorizzati'
    ],
    restricted_data_access: [
      'dati_bancari_utenti',
      'documenti_identità',
      'informazioni_fiscali',
      'dati_sanitari'
    ],
    prohibited_integrations: [
      'sistemi_bancari_diretti',
      'registri_pubblici_non_autorizzati',
      'sistemi_pagamento_esterni',
      'database_privati_terzi'
    ],
    content_restrictions: [
      'contenuti_offensivi',
      'informazioni_false',
      'promesse_non_sostenibili',
      'raccomandazioni_non_qualificate'
    ]
  },

  services: {
    core_skills: [
      'business_plan_creation',
      'feasibility_analysis',
      'market_intelligence',
      'project_timeline_management',
      'vendor_communication',
      'financial_modeling',
      'compliance_monitoring',
      'document_generation'
    ],
    integrations: [
      'firebase_database',
      'email_services',
      'pdf_generation',
      'excel_export',
      'calendar_systems',
      'notification_services'
    ],
    data_sources: [
      'user_projects',
      'market_data',
      'vendor_database',
      'regulatory_updates',
      'financial_models',
      'project_documents'
    ],
    output_formats: [
      'pdf_reports',
      'excel_spreadsheets',
      'email_communications',
      'dashboard_visualizations',
      'timeline_gantt',
      'financial_charts'
    ]
  }
};

/**
 * Validatore per ParaHelp Template
 */
export class ParaHelpValidator {
  static validate(template: ParaHelpTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validazione PURPOSE
    if (!template.purpose.primary || template.purpose.primary.length < 10) {
      errors.push('Purpose primary deve essere definito e dettagliato');
    }

    // Validazione AUDIENCE
    if (!template.audience.primary) {
      errors.push('Audience primary deve essere definito');
    }

    // Validazione ROLE
    if (!template.role.identity) {
      errors.push('Role identity deve essere definito');
    }

    if (template.role.capabilities.length === 0) {
      errors.push('Role capabilities deve contenere almeno una capacità');
    }

    // Validazione ACTION FLOW
    if (!['ask_to_act', 'auto_execute', 'guided_assistance'].includes(template.actionFlow.default_mode)) {
      errors.push('Action flow default_mode deve essere valido');
    }

    // Validazione SERVICES
    if (template.services.core_skills.length === 0) {
      errors.push('Services core_skills deve contenere almeno uno skill');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Helper per applicare il template alle decisioni
 */
export class ParaHelpDecisionEngine {
  private template: ParaHelpTemplate;

  constructor(template: ParaHelpTemplate = URBANOVA_PARAHELP_TEMPLATE) {
    this.template = template;
  }

  /**
   * Determina se un'azione richiede conferma
   */
  requiresConfirmation(action: string): boolean {
    return this.template.actionFlow.confirmation_required.includes(action);
  }

  /**
   * Determina se un'azione può essere eseguita automaticamente
   */
  canAutoExecute(action: string): boolean {
    return this.template.actionFlow.auto_execute.includes(action);
  }

  /**
   * Verifica se un'azione è proibita
   */
  isForbidden(action: string): boolean {
    return this.template.exclusions.forbidden_actions.includes(action);
  }

  /**
   * Determina se un trigger richiede escalation
   */
  requiresEscalation(trigger: string): boolean {
    return this.template.actionFlow.escalation_triggers.includes(trigger);
  }

  /**
   * Valida se un'azione è compatibile con il template
   */
  validateAction(action: string, context: any): { 
    allowed: boolean; 
    reason?: string; 
    requiresConfirmation?: boolean 
  } {
    if (this.isForbidden(action)) {
      return {
        allowed: false,
        reason: `Azione '${action}' è proibita dal template ParaHelp`
      };
    }

    const requiresConfirmation = this.requiresConfirmation(action);
    const canAutoExecute = this.canAutoExecute(action);

    return {
      allowed: true,
      requiresConfirmation: requiresConfirmation && !canAutoExecute
    };
  }
}
