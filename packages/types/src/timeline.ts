import { z } from 'zod';

/**
 * Timeline Types - Sistema Timeline Reale Urbanova
 *
 * Definisce tutti i tipi per:
 * - Auto WBS (Work Breakdown Structure)
 * - Re-Plan (Ripianificazione automatica)
 * - Critical Path (Percorso critico)
 * - Real-time Updates (Aggiornamenti real-time)
 */

// ============================================================================
// FACT TYPES - Fatti reali dai servizi
// ============================================================================

/**
 * Fatti Doc Hunter
 */
export interface DocHunterFact {
  vendorId: string;
  documentType: 'DURC' | 'visura' | 'certification';
  status: 'pending' | 'valid' | 'expired' | 'invalid';
  validUntil: Date;
  lastChecked: Date;
  projectId: string;
  vendorName: string;
  documentNumber: string;
  issuingAuthority: string;
  notes?: string;
}

export const zDocHunterFact = z.object({
  vendorId: z.string(),
  documentType: z.enum(['DURC', 'visura', 'certification']),
  status: z.enum(['pending', 'valid', 'expired', 'invalid']),
  validUntil: z.date(),
  lastChecked: z.date(),
  projectId: z.string(),
  vendorName: z.string(),
  documentNumber: z.string(),
  issuingAuthority: z.string(),
  notes: z.string().optional(),
});

/**
 * Fatti Procurement
 */
export interface ProcurementFact {
  rdoId: string;
  status: 'draft' | 'published' | 'offers_received' | 'comparing' | 'awarded' | 'cancelled';
  deadline: Date;
  offersCount: number;
  awardedVendor?: string;
  projectId: string;
  rdoTitle: string;
  category: string;
  estimatedValue: number;
  location: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const zProcurementFact = z.object({
  rdoId: z.string(),
  status: z.enum(['draft', 'published', 'offers_received', 'comparing', 'awarded', 'cancelled']),
  deadline: z.date(),
  offersCount: z.number(),
  awardedVendor: z.string().optional(),
  projectId: z.string(),
  rdoTitle: z.string(),
  category: z.string(),
  estimatedValue: z.number(),
  location: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Fatti SAL (Autorizzazioni)
 */
export interface SALFact {
  authorizationType: 'CDU' | 'SCIA' | 'permits' | 'building_permit' | 'environmental_clearance';
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired';
  submissionDate: Date;
  expectedResponseDate: Date;
  actualResponseDate?: Date;
  projectId: string;
  authority: string;
  referenceNumber: string;
  description: string;
  requirements: string[];
  documents: string[];
  notes?: string;
}

export const zSALFact = z.object({
  authorizationType: z.enum([
    'CDU',
    'SCIA',
    'permits',
    'building_permit',
    'environmental_clearance',
  ]),
  status: z.enum(['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired']),
  submissionDate: z.date(),
  expectedResponseDate: z.date(),
  actualResponseDate: z.date().optional(),
  projectId: z.string(),
  authority: z.string(),
  referenceNumber: z.string(),
  description: z.string(),
  requirements: z.array(z.string()),
  documents: z.array(z.string()),
  notes: z.string().optional(),
});

/**
 * Fatti Listing
 */
export interface ListingFact {
  portalId: string;
  status: 'preparing' | 'pushed' | 'published' | 'monitoring' | 'expired' | 'removed';
  pushDate: Date;
  viewsCount: number;
  leadsCount: number;
  projectId: string;
  portalName: string;
  listingTitle: string;
  price: number;
  currency: string;
  location: string;
  propertyType: string;
  features: string[];
  images: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
}

export const zListingFact = z.object({
  portalId: z.string(),
  status: z.enum(['preparing', 'pushed', 'published', 'monitoring', 'expired', 'removed']),
  pushDate: z.date(),
  viewsCount: z.number(),
  leadsCount: z.number(),
  projectId: z.string(),
  portalName: z.string(),
  listingTitle: z.string(),
  price: z.number(),
  currency: z.string(),
  location: z.string(),
  propertyType: z.string(),
  features: z.array(z.string()),
  images: z.array(z.string()),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string(),
    website: z.string().optional(),
  }),
});

/**
 * Union type per tutti i fatti
 */
export type Fact = DocHunterFact | ProcurementFact | SALFact | ListingFact;

export const zFact = z.union([zDocHunterFact, zProcurementFact, zSALFact, zListingFact]);

// ============================================================================
// WBS TYPES - Work Breakdown Structure
// ============================================================================

/**
 * Task WBS
 */
export interface WBSTask {
  id: string;
  name: string;
  description: string;
  type: 'milestone' | 'task' | 'subtask' | 'deliverable';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Timing
  estimatedDuration: number; // days
  actualDuration?: number; // days
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;

  // Dependencies
  dependencies: string[]; // task IDs
  dependents: string[]; // task IDs

  // Resources
  assignedTo?: string;
  resources: string[];

  // Progress
  progress: number; // 0-100
  completedWork: number;
  totalWork: number;

  // Metadata
  sourceFact?: Fact;
  factId?: string;
  projectId: string;
  parentTaskId?: string;
  children: string[]; // task IDs

  // Critical path
  isCritical: boolean;
  slack: number; // days

  // Custom fields
  customFields: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const zWBSTask = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['milestone', 'task', 'subtask', 'deliverable']),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  estimatedDuration: z.number(),
  actualDuration: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
  actualStartDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  dependencies: z.array(z.string()),
  dependents: z.array(z.string()),
  assignedTo: z.string().optional(),
  resources: z.array(z.string()),
  progress: z.number().min(0).max(100),
  completedWork: z.number(),
  totalWork: z.number(),
  sourceFact: zFact.optional(),
  factId: z.string().optional(),
  projectId: z.string(),
  parentTaskId: z.string().optional(),
  children: z.array(z.string()),
  isCritical: z.boolean(),
  slack: z.number(),
  customFields: z.record(z.any()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Dipendenza tra task
 */
export interface WBSDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // days
  projectId: string;
  description?: string;
  isCritical: boolean;
  createdAt: Date;
}

export const zWBSDependency = z.object({
  id: z.string(),
  fromTaskId: z.string(),
  toTaskId: z.string(),
  type: z.enum(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish']),
  lag: z.number(),
  projectId: z.string(),
  description: z.string().optional(),
  isCritical: z.boolean(),
  createdAt: z.date(),
});

/**
 * Work Breakdown Structure completa
 */
export interface WBS {
  id: string;
  projectId: string;
  name: string;
  description: string;

  // Tasks e dipendenze
  tasks: WBSTask[];
  dependencies: WBSDependency[];

  // Critical path
  criticalPath: string[]; // task IDs
  criticalPathDuration: number; // days

  // Timeline
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;

  // Progress
  overallProgress: number; // 0-100
  completedTasks: number;
  totalTasks: number;

  // Metadata
  version: number;
  generatedAt: Date;
  generatedBy: string;
  sourceFacts: Fact[];

  // Status
  status: 'draft' | 'active' | 'completed' | 'archived';

  createdAt: Date;
  updatedAt: Date;
}

export const zWBS = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string(),
  tasks: z.array(zWBSTask),
  dependencies: z.array(zWBSDependency),
  criticalPath: z.array(z.string()),
  criticalPathDuration: z.number(),
  startDate: z.date(),
  endDate: z.date(),
  actualStartDate: z.date().optional(),
  actualEndDate: z.date().optional(),
  overallProgress: z.number().min(0).max(100),
  completedTasks: z.number(),
  totalTasks: z.number(),
  version: z.number(),
  generatedAt: z.date(),
  generatedBy: z.string(),
  sourceFacts: z.array(zFact),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// RE-PLAN TYPES - Ripianificazione automatica
// ============================================================================

/**
 * Trigger per re-plan
 */
export interface RePlanTrigger {
  id: string;
  type:
    | 'document_expiry'
    | 'sal_delay'
    | 'procurement_delay'
    | 'resource_conflict'
    | 'scope_change'
    | 'risk_materialized';
  projectId: string;
  cause: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;

  // Impact analysis
  impact: {
    affectedTasks: string[];
    delayDays: number;
    costImpact: number;
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
  };

  // Status
  status: 'detected' | 'analyzing' | 'proposed' | 'approved' | 'rejected' | 'applied';

  // Metadata
  sourceFact?: Fact;
  detectedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const zRePlanTrigger = z.object({
  id: z.string(),
  type: z.enum([
    'document_expiry',
    'sal_delay',
    'procurement_delay',
    'resource_conflict',
    'scope_change',
    'risk_materialized',
  ]),
  projectId: z.string(),
  cause: z.string(),
  details: z.any(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  detectedAt: z.date(),
  impact: z.object({
    affectedTasks: z.array(z.string()),
    delayDays: z.number(),
    costImpact: z.number(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    description: z.string(),
  }),
  status: z.enum(['detected', 'analyzing', 'proposed', 'approved', 'rejected', 'applied']),
  sourceFact: zFact.optional(),
  detectedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Shift di un task
 */
export interface TaskShift {
  taskId: string;
  originalStartDate: Date;
  originalEndDate: Date;
  newStartDate: Date;
  newEndDate: Date;
  shiftDays: number;
  reason: string;
  impact: {
    dependencies: string[];
    resources: string[];
    cost: number;
  };
}

export const zTaskShift = z.object({
  taskId: z.string(),
  originalStartDate: z.date(),
  originalEndDate: z.date(),
  newStartDate: z.date(),
  newEndDate: z.date(),
  shiftDays: z.number(),
  reason: z.string(),
  impact: z.object({
    dependencies: z.array(z.string()),
    resources: z.array(z.string()),
    cost: z.number(),
  }),
});

/**
 * Cambio risorse
 */
export interface ResourceChange {
  taskId: string;
  originalResources: string[];
  newResources: string[];
  reason: string;
  impact: {
    cost: number;
    availability: boolean;
    skills: string[];
  };
}

export const zResourceChange = z.object({
  taskId: z.string(),
  originalResources: z.array(z.string()),
  newResources: z.array(z.string()),
  reason: z.string(),
  impact: z.object({
    cost: z.number(),
    availability: z.boolean(),
    skills: z.array(z.string()),
  }),
});

/**
 * Impatto costi
 */
export interface CostImpact {
  originalCost: number;
  newCost: number;
  difference: number;
  breakdown: {
    labor: number;
    materials: number;
    overhead: number;
    contingency: number;
  };
  currency: string;
}

export const zCostImpact = z.object({
  originalCost: z.number(),
  newCost: z.number(),
  difference: z.number(),
  breakdown: z.object({
    labor: z.number(),
    materials: z.number(),
    overhead: z.number(),
    contingency: z.number(),
  }),
  currency: z.string(),
});

/**
 * Valutazione rischi per timeline
 */
export interface TimelineRiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  risks: {
    id: string;
    description: string;
    probability: number; // 0-100
    impact: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
  }[];
  recommendations: string[];
}

export const zTimelineRiskAssessment = z.object({
  overallRisk: z.enum(['low', 'medium', 'high', 'critical']),
  risks: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      probability: z.number().min(0).max(100),
      impact: z.enum(['low', 'medium', 'high', 'critical']),
      mitigation: z.string(),
    })
  ),
  recommendations: z.array(z.string()),
});

/**
 * Proposta di re-plan
 */
export interface RePlanProposal {
  id: string;
  triggerId: string;
  projectId: string;

  // Timelines
  currentTimeline: WBS;
  proposedTimeline: WBS;

  // Changes
  changes: {
    shiftedTasks: TaskShift[];
    newDependencies: WBSDependency[];
    resourceChanges: ResourceChange[];
    costImpact: CostImpact;
  };

  // Impact
  impact: {
    totalDelay: number;
    criticalPathChanges: string[];
    riskAssessment: TimelineRiskAssessment;
    recommendations: string[];
  };

  // Confirmation
  confirmation: {
    required: boolean;
    approver?: string;
    deadline?: Date;
    autoApply: boolean;
  };

  // Status
  status: 'draft' | 'proposed' | 'approved' | 'rejected' | 'applied';

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  appliedAt?: Date;
}

export const zRePlanProposal = z.object({
  id: z.string(),
  triggerId: z.string(),
  projectId: z.string(),
  currentTimeline: zWBS,
  proposedTimeline: zWBS,
  changes: z.object({
    shiftedTasks: z.array(zTaskShift),
    newDependencies: z.array(zWBSDependency),
    resourceChanges: z.array(zResourceChange),
    costImpact: zCostImpact,
  }),
  impact: z.object({
    totalDelay: z.number(),
    criticalPathChanges: z.array(z.string()),
    riskAssessment: zTimelineRiskAssessment,
    recommendations: z.array(z.string()),
  }),
  confirmation: z.object({
    required: z.boolean(),
    approver: z.string().optional(),
    deadline: z.date().optional(),
    autoApply: z.boolean(),
  }),
  status: z.enum(['draft', 'proposed', 'approved', 'rejected', 'applied']),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  appliedAt: z.date().optional(),
});

/**
 * Preview del re-plan
 */
export interface RePlanPreview {
  id: string;
  proposalId: string;

  // Visual comparison
  beforeAfter: {
    before: string; // SVG Gantt
    after: string; // SVG Gantt
  };

  // Summary
  changes: {
    summary: string;
    details: string[];
    affectedTasks: number;
    totalDelay: number;
    costImpact: number;
  };

  // Impact
  impact: {
    summary: string;
    risks: string[];
    benefits: string[];
    recommendations: string[];
  };

  // Actions
  actions: {
    approve: boolean;
    reject: boolean;
    modify: boolean;
    autoApply: boolean;
  };

  createdAt: Date;
}

export const zRePlanPreview = z.object({
  id: z.string(),
  proposalId: z.string(),
  beforeAfter: z.object({
    before: z.string(),
    after: z.string(),
  }),
  changes: z.object({
    summary: z.string(),
    details: z.array(z.string()),
    affectedTasks: z.number(),
    totalDelay: z.number(),
    costImpact: z.number(),
  }),
  impact: z.object({
    summary: z.string(),
    risks: z.array(z.string()),
    benefits: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  actions: z.object({
    approve: z.boolean(),
    reject: z.boolean(),
    modify: z.boolean(),
    autoApply: z.boolean(),
  }),
  createdAt: z.date(),
});

// ============================================================================
// TIMELINE TYPES - Timeline principale
// ============================================================================

/**
 * Timeline principale del progetto
 */
export interface ProjectTimeline {
  id: string;
  projectId: string;
  name: string;
  description: string;

  // WBS
  wbs: WBS;

  // Re-plan history
  rePlanHistory: RePlanProposal[];
  activeTriggers: RePlanTrigger[];

  // Status
  status: 'draft' | 'active' | 'completed' | 'archived';
  version: number;

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastRegeneratedAt?: Date;
}

export const zProjectTimeline = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string(),
  wbs: zWBS,
  rePlanHistory: z.array(zRePlanProposal),
  activeTriggers: z.array(zRePlanTrigger),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  version: z.number(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastRegeneratedAt: z.date().optional(),
});

// ============================================================================
// REQUEST/RESPONSE TYPES - API
// ============================================================================

/**
 * Request per generazione timeline
 */
export interface GenerateTimelineRequest {
  projectId: string;
  options?: {
    includeHistory?: boolean;
    forceRegenerate?: boolean;
    includeFacts?: boolean;
  };
}

export const zGenerateTimelineRequest = z.object({
  projectId: z.string(),
  options: z
    .object({
      includeHistory: z.boolean().optional(),
      forceRegenerate: z.boolean().optional(),
      includeFacts: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Response generazione timeline
 */
export interface GenerateTimelineResponse {
  success: boolean;
  timeline: ProjectTimeline;
  generatedAt: Date;
  duration: number; // ms
  factsUsed: number;
  tasksGenerated: number;
  criticalPathLength: number;
}

export const zGenerateTimelineResponse = z.object({
  success: z.boolean(),
  timeline: zProjectTimeline,
  generatedAt: z.date(),
  duration: z.number(),
  factsUsed: z.number(),
  tasksGenerated: z.number(),
  criticalPathLength: z.number(),
});

/**
 * Request per re-plan
 */
export interface RePlanRequest {
  projectId: string;
  cause: string;
  details: any;
  options?: {
    autoApply?: boolean;
    includePreview?: boolean;
    notifyStakeholders?: boolean;
  };
}

export const zRePlanRequest = z.object({
  projectId: z.string(),
  cause: z.string(),
  details: z.any(),
  options: z
    .object({
      autoApply: z.boolean().optional(),
      includePreview: z.boolean().optional(),
      notifyStakeholders: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Response re-plan
 */
export interface RePlanResponse {
  success: boolean;
  trigger: RePlanTrigger;
  proposal: RePlanProposal;
  preview?: RePlanPreview;
  applied: boolean;
  appliedAt?: Date;
}

export const zRePlanResponse = z.object({
  success: z.boolean(),
  trigger: zRePlanTrigger,
  proposal: zRePlanProposal,
  preview: zRePlanPreview.optional(),
  applied: z.boolean(),
  appliedAt: z.date().optional(),
});
