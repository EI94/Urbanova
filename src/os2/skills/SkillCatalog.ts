// 🎓 SKILL CATALOG - Registrazione e gestione Skills per OS 2.0
// Sistema di skill modulari ed estensibili

/**
 * Metadata di una Skill
 */
export interface SkillMeta {
  /** ID univoco della skill */
  id: string;
  
  /** Summary descrittivo della skill */
  summary: string;
  
  /** Visibilità della skill (global o context-specific) */
  visibility: 'global' | { context: string };
  
  /** JSON Schema per validazione inputs */
  inputsSchema: Record<string, unknown>;
  
  /** Precondizioni necessarie per esecuzione */
  preconditions?: string[];
  
  /** Latency budget in ms */
  latencyBudgetMs?: number;
  
  /** Se true, la skill è idempotente */
  idempotent?: boolean;
  
  /** Se true, richiede conferma utente */
  requiresConfirm?: boolean;
  
  /** Side effects della skill */
  sideEffects?: string[];
  
  /** Telemetry key per monitoring */
  telemetryKey: string;
  
  /** RBAC: ruoli che possono eseguire questa skill */
  rbac?: Array<'viewer' | 'editor' | 'admin'>;
  
  /** Category per raggruppamento */
  category?: 'business_plan' | 'feasibility' | 'market' | 'design' | 'compliance' | 'communication' | 'general';
  
  /** Tags per ricerca */
  tags?: string[];
}

/**
 * Interfaccia per implementare una Skill
 */
export interface Skill<TInput = unknown, TOutput = unknown> {
  /** Metadata della skill */
  meta: SkillMeta;
  
  /**
   * Esegue la skill
   * @param inputs Input validati
   * @param context Context di esecuzione
   * @returns Output della skill
   */
  execute(inputs: TInput, context: SkillExecutionContext): Promise<TOutput>;
  
  /**
   * Valida gli inputs (opzionale, usa inputsSchema se non implementato)
   * @param inputs Input da validare
   * @returns true se validi, string con errore altrimenti
   */
  validateInputs?(inputs: unknown): Promise<boolean | string>;
}

/**
 * Context di esecuzione per una skill
 */
export interface SkillExecutionContext {
  /** User ID */
  userId: string;
  
  /** Session ID */
  sessionId: string;
  
  /** Project ID corrente */
  projectId?: string;
  
  /** User roles */
  userRoles: Array<'viewer' | 'editor' | 'admin'>;
  
  /** Environment */
  environment: 'development' | 'staging' | 'production';
  
  /** Metadata aggiuntivo */
  metadata?: Record<string, unknown>;
}

/**
 * Catalog di Skills registrate
 */
export class SkillCatalog {
  private static instance: SkillCatalog;
  private skills: Map<string, Skill> = new Map();
  
  private constructor() {
    this.registerCoreSkills();
  }
  
  /**
   * Ottiene l'istanza singleton del catalog
   */
  public static getInstance(): SkillCatalog {
    if (!SkillCatalog.instance) {
      SkillCatalog.instance = new SkillCatalog();
    }
    return SkillCatalog.instance;
  }
  
  /**
   * Registra una skill nel catalog
   */
  public register(skill: Skill): void {
    if (this.skills.has(skill.meta.id)) {
      console.warn(`⚠️ [SkillCatalog] Skill ${skill.meta.id} già registrata, sovrascritta`);
    }
    
    this.skills.set(skill.meta.id, skill);
    console.log(`✅ [SkillCatalog] Skill registrata: ${skill.meta.id}`);
  }
  
  /**
   * Ottiene una skill dal catalog
   */
  public get(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }
  
  /**
   * Lista tutte le skill registrate
   */
  public list(filters?: {
    visibility?: 'global' | { context: string };
    category?: SkillMeta['category'];
    tags?: string[];
    rbac?: Array<'viewer' | 'editor' | 'admin'>;
  }): SkillMeta[] {
    let skills = Array.from(this.skills.values());
    
    if (filters) {
      if (filters.visibility) {
        skills = skills.filter(s => {
          if (filters.visibility === 'global') {
            return s.meta.visibility === 'global';
          } else {
            return typeof s.meta.visibility === 'object' && 
                   s.meta.visibility.context === filters.visibility.context;
          }
        });
      }
      
      if (filters.category) {
        skills = skills.filter(s => s.meta.category === filters.category);
      }
      
      if (filters.tags) {
        skills = skills.filter(s => 
          s.meta.tags?.some(tag => filters.tags?.includes(tag))
        );
      }
      
      if (filters.rbac) {
        skills = skills.filter(s => 
          s.meta.rbac?.some(role => filters.rbac?.includes(role))
        );
      }
    }
    
    return skills.map(s => s.meta);
  }
  
  /**
   * Verifica se una skill esiste
   */
  public has(skillId: string): boolean {
    return this.skills.has(skillId);
  }
  
  /**
   * Rimuove una skill dal catalog
   */
  public unregister(skillId: string): boolean {
    return this.skills.delete(skillId);
  }
  
  /**
   * Registra le skill core del sistema
   */
  private registerCoreSkills(): void {
    // Registra mock/placeholder skills
    // Le skill reali saranno caricate manualmente da OS2 bootstrap
    this.register(new BusinessPlanCalculateSkill());
    this.register(new BusinessPlanSensitivitySkill());
    this.register(new BusinessPlanExportSkill());
    this.register(new FeasibilityAnalysisSkill());
    this.register(new FeasibilitySaveSkill());
    this.register(new RdoSendSkill());
    this.register(new EmailSendSkill());
    this.register(new ProjectQuerySkill());
    this.register(new ProjectListSkill());
    
    console.log(`✅ [SkillCatalog] ${this.skills.size} skill core registrate`);
  }
  
  /**
   * Carica skill reali (chiamato da OS2 bootstrap)
   */
  public loadRealSkills(skills: Skill[]): void {
    skills.forEach(skill => {
      this.skills.set(skill.meta.id, skill);
    });
    
    console.log(`✅ [SkillCatalog] ${skills.length} skill reali caricate`);
  }
}

// ============================================================================
// CORE SKILLS IMPLEMENTATION
// ============================================================================

/**
 * Business Plan Calculate Skill
 */
class BusinessPlanCalculateSkill implements Skill<BusinessPlanInput, BusinessPlanOutput> {
  public meta: SkillMeta = {
    id: 'business_plan.calculate',
    summary: 'Calcola Business Plan completo con VAN, TIR, DSCR e scenari multipli',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['projectName', 'units', 'salePrice', 'constructionCost', 'landScenarios'],
      properties: {
        projectName: { type: 'string' },
        units: { type: 'number', minimum: 1 },
        salePrice: { type: 'number', minimum: 0 },
        constructionCost: { type: 'number', minimum: 0 },
        landScenarios: { type: 'array', minItems: 1 },
      },
    },
    preconditions: [],
    latencyBudgetMs: 5000,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: ['write.db'],
    telemetryKey: 'bp.calculate',
    rbac: ['viewer', 'editor', 'admin'],
    category: 'business_plan',
    tags: ['business-plan', 'finance', 'calculation'],
  };
  
  public async execute(inputs: BusinessPlanInput, context: SkillExecutionContext): Promise<BusinessPlanOutput> {
    console.log(`🎯 [Skill:BP.Calculate] Esecuzione per ${context.userId}`);
    
    // Simula calcolo (in produzione, chiamerebbe businessPlanService)
    const mockResult: BusinessPlanOutput = {
      projectName: inputs.projectName,
      scenarios: inputs.landScenarios.map((scenario, idx) => ({
        id: `s${idx + 1}`,
        name: scenario.name || `Scenario ${idx + 1}`,
        npv: Math.random() * 500000,
        irr: Math.random() * 0.3,
        dscr: 1 + Math.random() * 0.5,
        payback: 2 + Math.random() * 3,
      })),
      bestScenario: 's1',
      calculatedAt: new Date(),
    };
    
    return mockResult;
  }
}

/**
 * Business Plan Sensitivity Skill
 */
class BusinessPlanSensitivitySkill implements Skill<SensitivityInput, SensitivityOutput> {
  public meta: SkillMeta = {
    id: 'business_plan.sensitivity',
    summary: 'Esegue analisi di sensitivity su prezzi e costi',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['projectId', 'variable', 'range'],
      properties: {
        projectId: { type: 'string' },
        variable: { type: 'string', enum: ['price', 'cost'] },
        range: { type: 'number' },
      },
    },
    latencyBudgetMs: 3000,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: [],
    telemetryKey: 'bp.sensitivity',
    rbac: ['viewer', 'editor', 'admin'],
    category: 'business_plan',
    tags: ['business-plan', 'sensitivity', 'analysis'],
  };
  
  public async execute(inputs: SensitivityInput, context: SkillExecutionContext): Promise<SensitivityOutput> {
    console.log(`🎯 [Skill:BP.Sensitivity] Esecuzione per progetto ${inputs.projectId}`);
    
    return {
      variable: inputs.variable,
      range: inputs.range,
      breakeven: -12.8,
      scenarios: [
        { delta: -15, npv: 124000 },
        { delta: 0, npv: 892000 },
        { delta: 15, npv: 1642000 },
      ],
    };
  }
}

/**
 * Business Plan Export Skill
 */
class BusinessPlanExportSkill implements Skill<ExportInput, ExportOutput> {
  public meta: SkillMeta = {
    id: 'business_plan.export',
    summary: 'Esporta Business Plan in PDF',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['businessPlanId', 'format'],
      properties: {
        businessPlanId: { type: 'string' },
        format: { type: 'string', enum: ['pdf', 'excel'] },
      },
    },
    latencyBudgetMs: 8000,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: ['write.storage'],
    telemetryKey: 'bp.export',
    rbac: ['editor', 'admin'],
    category: 'business_plan',
    tags: ['business-plan', 'export', 'pdf'],
  };
  
  public async execute(inputs: ExportInput, context: SkillExecutionContext): Promise<ExportOutput> {
    console.log(`🎯 [Skill:BP.Export] Esecuzione export ${inputs.format}`);
    
    return {
      format: inputs.format,
      url: `https://storage.example.com/${inputs.businessPlanId}.${inputs.format}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni
    };
  }
}

/**
 * Feasibility Analysis Skill
 */
class FeasibilityAnalysisSkill implements Skill<FeasibilityInput, FeasibilityOutput> {
  public meta: SkillMeta = {
    id: 'feasibility.analyze',
    summary: 'Esegue analisi di fattibilità immobiliare',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['landArea', 'constructionCostPerSqm', 'salePrice'],
    },
    latencyBudgetMs: 3000,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: ['write.db'],
    telemetryKey: 'feasibility.analyze',
    rbac: ['viewer', 'editor', 'admin'],
    category: 'feasibility',
    tags: ['feasibility', 'analysis'],
  };
  
  public async execute(inputs: FeasibilityInput, context: SkillExecutionContext): Promise<FeasibilityOutput> {
    console.log(`🎯 [Skill:Feasibility] Esecuzione analisi`);
    
    return {
      roi: 0.285,
      margin: 2000000,
      payback: 3.2,
      npv: 1800000,
    };
  }
}

/**
 * Feasibility Save Skill
 */
class FeasibilitySaveSkill implements Skill<SaveInput, SaveOutput> {
  public meta: SkillMeta = {
    id: 'feasibility.save',
    summary: 'Salva analisi di fattibilità su Firestore',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['data'],
    },
    latencyBudgetMs: 2000,
    idempotent: false, // Write to DB
    requiresConfirm: false,
    sideEffects: ['write.db'],
    telemetryKey: 'feasibility.save',
    rbac: ['editor', 'admin'],
    category: 'feasibility',
    tags: ['feasibility', 'save'],
  };
  
  public async execute(inputs: SaveInput, context: SkillExecutionContext): Promise<SaveOutput> {
    console.log(`🎯 [Skill:Feasibility.Save] Salvataggio per ${context.userId}`);
    
    return {
      id: `fs_${Date.now()}`,
      savedAt: new Date(),
    };
  }
}

/**
 * RDO Send Skill
 */
class RdoSendSkill implements Skill<RdoInput, RdoOutput> {
  public meta: SkillMeta = {
    id: 'rdo.send',
    summary: 'Invia Richiesta di Offerta a fornitori',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['projectId', 'vendors'],
    },
    latencyBudgetMs: 5000,
    idempotent: false, // Send email
    requiresConfirm: true, // ⚠️ Richiede conferma
    sideEffects: ['email.send', 'write.db'],
    telemetryKey: 'rdo.send',
    rbac: ['editor', 'admin'],
    category: 'communication',
    tags: ['rdo', 'email', 'vendors'],
  };
  
  public async execute(inputs: RdoInput, context: SkillExecutionContext): Promise<RdoOutput> {
    console.log(`🎯 [Skill:RDO.Send] Invio RDO a ${inputs.vendors.length} fornitori`);
    
    return {
      sentCount: inputs.vendors.length,
      sentAt: new Date(),
      rdoIds: inputs.vendors.map((_, idx) => `rdo_${Date.now()}_${idx}`),
    };
  }
}

/**
 * Email Send Skill
 */
class EmailSendSkill implements Skill<EmailInput, EmailOutput> {
  public meta: SkillMeta = {
    id: 'email.send',
    summary: 'Invia email generica',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      required: ['to', 'subject', 'body'],
    },
    latencyBudgetMs: 3000,
    idempotent: false,
    requiresConfirm: true, // ⚠️ Richiede conferma
    sideEffects: ['email.send'],
    telemetryKey: 'email.send',
    rbac: ['editor', 'admin'],
    category: 'communication',
    tags: ['email', 'communication'],
  };
  
  public async execute(inputs: EmailInput, context: SkillExecutionContext): Promise<EmailOutput> {
    console.log(`🎯 [Skill:Email] Invio email a ${inputs.to}`);
    
    return {
      messageId: `msg_${Date.now()}`,
      sentAt: new Date(),
    };
  }
}

/**
 * Project Query Skill
 */
class ProjectQuerySkill implements Skill<QueryInput, QueryOutput> {
  public meta: SkillMeta = {
    id: 'project.query',
    summary: 'Interroga progetti esistenti con filtri',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      properties: {
        filters: { type: 'object' },
      },
    },
    latencyBudgetMs: 2000,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: [],
    telemetryKey: 'project.query',
    rbac: ['viewer', 'editor', 'admin'],
    category: 'general',
    tags: ['project', 'query'],
  };
  
  public async execute(inputs: QueryInput, context: SkillExecutionContext): Promise<QueryOutput> {
    console.log(`🎯 [Skill:Project.Query] Query progetti per ${context.userId}`);
    
    return {
      projects: [],
      count: 0,
    };
  }
}

/**
 * Project List Skill
 */
class ProjectListSkill implements Skill<Record<string, never>, ListOutput> {
  public meta: SkillMeta = {
    id: 'project.list',
    summary: 'Lista tutti i progetti dell\'utente',
    visibility: 'global',
    inputsSchema: {
      type: 'object',
      properties: {},
    },
    latencyBudgetMs: 1500,
    idempotent: true,
    requiresConfirm: false,
    sideEffects: [],
    telemetryKey: 'project.list',
    rbac: ['viewer', 'editor', 'admin'],
    category: 'general',
    tags: ['project', 'list'],
  };
  
  public async execute(inputs: Record<string, never>, context: SkillExecutionContext): Promise<ListOutput> {
    console.log(`🎯 [Skill:Project.List] Lista progetti per ${context.userId}`);
    
    return {
      projects: [],
      count: 0,
    };
  }
}

// ============================================================================
// TYPE DEFINITIONS FOR SKILLS
// ============================================================================

interface BusinessPlanInput {
  projectName: string;
  units: number;
  salePrice: number;
  constructionCost: number;
  landScenarios: Array<{ name?: string; cost: number }>;
}

interface BusinessPlanOutput {
  projectName: string;
  scenarios: Array<{
    id: string;
    name: string;
    npv: number;
    irr: number;
    dscr: number;
    payback: number;
  }>;
  bestScenario: string;
  calculatedAt: Date;
}

interface SensitivityInput {
  projectId: string;
  variable: 'price' | 'cost';
  range: number;
}

interface SensitivityOutput {
  variable: string;
  range: number;
  breakeven: number;
  scenarios: Array<{ delta: number; npv: number }>;
}

interface ExportInput {
  businessPlanId: string;
  format: 'pdf' | 'excel';
}

interface ExportOutput {
  format: string;
  url: string;
  expiresAt: Date;
}

interface FeasibilityInput {
  landArea: number;
  constructionCostPerSqm: number;
  salePrice: number;
}

interface FeasibilityOutput {
  roi: number;
  margin: number;
  payback: number;
  npv: number;
}

interface SaveInput {
  data: Record<string, unknown>;
}

interface SaveOutput {
  id: string;
  savedAt: Date;
}

interface RdoInput {
  projectId: string;
  vendors: string[];
}

interface RdoOutput {
  sentCount: number;
  sentAt: Date;
  rdoIds: string[];
}

interface EmailInput {
  to: string;
  subject: string;
  body: string;
}

interface EmailOutput {
  messageId: string;
  sentAt: Date;
}

interface QueryInput {
  filters?: Record<string, unknown>;
}

interface QueryOutput {
  projects: Array<Record<string, unknown>>;
  count: number;
}

interface ListOutput {
  projects: Array<Record<string, unknown>>;
  count: number;
}

