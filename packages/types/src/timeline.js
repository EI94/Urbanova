"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zRePlanResponse = exports.zRePlanRequest = exports.zGenerateTimelineResponse = exports.zGenerateTimelineRequest = exports.zProjectTimeline = exports.zRePlanPreview = exports.zRePlanProposal = exports.zTimelineRiskAssessment = exports.zCostImpact = exports.zResourceChange = exports.zTaskShift = exports.zRePlanTrigger = exports.zWBS = exports.zWBSDependency = exports.zWBSTask = exports.zFact = exports.zListingFact = exports.zSALFact = exports.zProcurementFact = exports.zDocHunterFact = void 0;
const zod_1 = require("zod");
exports.zDocHunterFact = zod_1.z.object({
    vendorId: zod_1.z.string(),
    documentType: zod_1.z.enum(['DURC', 'visura', 'certification']),
    status: zod_1.z.enum(['pending', 'valid', 'expired', 'invalid']),
    validUntil: zod_1.z.date(),
    lastChecked: zod_1.z.date(),
    projectId: zod_1.z.string(),
    vendorName: zod_1.z.string(),
    documentNumber: zod_1.z.string(),
    issuingAuthority: zod_1.z.string(),
    notes: zod_1.z.string().optional(),
});
exports.zProcurementFact = zod_1.z.object({
    rdoId: zod_1.z.string(),
    status: zod_1.z.enum(['draft', 'published', 'offers_received', 'comparing', 'awarded', 'cancelled']),
    deadline: zod_1.z.date(),
    offersCount: zod_1.z.number(),
    awardedVendor: zod_1.z.string().optional(),
    projectId: zod_1.z.string(),
    rdoTitle: zod_1.z.string(),
    category: zod_1.z.string(),
    estimatedValue: zod_1.z.number(),
    location: zod_1.z.string(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.zSALFact = zod_1.z.object({
    authorizationType: zod_1.z.enum([
        'CDU',
        'SCIA',
        'permits',
        'building_permit',
        'environmental_clearance',
    ]),
    status: zod_1.z.enum(['pending', 'submitted', 'under_review', 'approved', 'rejected', 'expired']),
    submissionDate: zod_1.z.date(),
    expectedResponseDate: zod_1.z.date(),
    actualResponseDate: zod_1.z.date().optional(),
    projectId: zod_1.z.string(),
    authority: zod_1.z.string(),
    referenceNumber: zod_1.z.string(),
    description: zod_1.z.string(),
    requirements: zod_1.z.array(zod_1.z.string()),
    documents: zod_1.z.array(zod_1.z.string()),
    notes: zod_1.z.string().optional(),
});
exports.zListingFact = zod_1.z.object({
    portalId: zod_1.z.string(),
    status: zod_1.z.enum(['preparing', 'pushed', 'published', 'monitoring', 'expired', 'removed']),
    pushDate: zod_1.z.date(),
    viewsCount: zod_1.z.number(),
    leadsCount: zod_1.z.number(),
    projectId: zod_1.z.string(),
    portalName: zod_1.z.string(),
    listingTitle: zod_1.z.string(),
    price: zod_1.z.number(),
    currency: zod_1.z.string(),
    location: zod_1.z.string(),
    propertyType: zod_1.z.string(),
    features: zod_1.z.array(zod_1.z.string()),
    images: zod_1.z.array(zod_1.z.string()),
    contactInfo: zod_1.z.object({
        phone: zod_1.z.string(),
        email: zod_1.z.string(),
        website: zod_1.z.string().optional(),
    }),
});
exports.zFact = zod_1.z.union([exports.zDocHunterFact, exports.zProcurementFact, exports.zSALFact, exports.zListingFact]);
exports.zWBSTask = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    type: zod_1.z.enum(['milestone', 'task', 'subtask', 'deliverable']),
    status: zod_1.z.enum(['not_started', 'in_progress', 'completed', 'blocked', 'cancelled']),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    estimatedDuration: zod_1.z.number(),
    actualDuration: zod_1.z.number().optional(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    actualStartDate: zod_1.z.date().optional(),
    actualEndDate: zod_1.z.date().optional(),
    dependencies: zod_1.z.array(zod_1.z.string()),
    dependents: zod_1.z.array(zod_1.z.string()),
    assignedTo: zod_1.z.string().optional(),
    resources: zod_1.z.array(zod_1.z.string()),
    progress: zod_1.z.number().min(0).max(100),
    completedWork: zod_1.z.number(),
    totalWork: zod_1.z.number(),
    sourceFact: exports.zFact.optional(),
    factId: zod_1.z.string().optional(),
    projectId: zod_1.z.string(),
    parentTaskId: zod_1.z.string().optional(),
    children: zod_1.z.array(zod_1.z.string()),
    isCritical: zod_1.z.boolean(),
    slack: zod_1.z.number(),
    customFields: zod_1.z.record(zod_1.z.any()),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.zWBSDependency = zod_1.z.object({
    id: zod_1.z.string(),
    fromTaskId: zod_1.z.string(),
    toTaskId: zod_1.z.string(),
    type: zod_1.z.enum(['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish']),
    lag: zod_1.z.number(),
    projectId: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    isCritical: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
});
exports.zWBS = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    tasks: zod_1.z.array(exports.zWBSTask),
    dependencies: zod_1.z.array(exports.zWBSDependency),
    criticalPath: zod_1.z.array(zod_1.z.string()),
    criticalPathDuration: zod_1.z.number(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    actualStartDate: zod_1.z.date().optional(),
    actualEndDate: zod_1.z.date().optional(),
    overallProgress: zod_1.z.number().min(0).max(100),
    completedTasks: zod_1.z.number(),
    totalTasks: zod_1.z.number(),
    version: zod_1.z.number(),
    generatedAt: zod_1.z.date(),
    generatedBy: zod_1.z.string(),
    sourceFacts: zod_1.z.array(exports.zFact),
    status: zod_1.z.enum(['draft', 'active', 'completed', 'archived']),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.zRePlanTrigger = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum([
        'document_expiry',
        'sal_delay',
        'procurement_delay',
        'resource_conflict',
        'scope_change',
        'risk_materialized',
    ]),
    projectId: zod_1.z.string(),
    cause: zod_1.z.string(),
    details: zod_1.z.any(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    detectedAt: zod_1.z.date(),
    impact: zod_1.z.object({
        affectedTasks: zod_1.z.array(zod_1.z.string()),
        delayDays: zod_1.z.number(),
        costImpact: zod_1.z.number(),
        riskLevel: zod_1.z.enum(['low', 'medium', 'high']),
        description: zod_1.z.string(),
    }),
    status: zod_1.z.enum(['detected', 'analyzing', 'proposed', 'approved', 'rejected', 'applied']),
    sourceFact: exports.zFact.optional(),
    detectedBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
exports.zTaskShift = zod_1.z.object({
    taskId: zod_1.z.string(),
    originalStartDate: zod_1.z.date(),
    originalEndDate: zod_1.z.date(),
    newStartDate: zod_1.z.date(),
    newEndDate: zod_1.z.date(),
    shiftDays: zod_1.z.number(),
    reason: zod_1.z.string(),
    impact: zod_1.z.object({
        dependencies: zod_1.z.array(zod_1.z.string()),
        resources: zod_1.z.array(zod_1.z.string()),
        cost: zod_1.z.number(),
    }),
});
exports.zResourceChange = zod_1.z.object({
    taskId: zod_1.z.string(),
    originalResources: zod_1.z.array(zod_1.z.string()),
    newResources: zod_1.z.array(zod_1.z.string()),
    reason: zod_1.z.string(),
    impact: zod_1.z.object({
        cost: zod_1.z.number(),
        availability: zod_1.z.boolean(),
        skills: zod_1.z.array(zod_1.z.string()),
    }),
});
exports.zCostImpact = zod_1.z.object({
    originalCost: zod_1.z.number(),
    newCost: zod_1.z.number(),
    difference: zod_1.z.number(),
    breakdown: zod_1.z.object({
        labor: zod_1.z.number(),
        materials: zod_1.z.number(),
        overhead: zod_1.z.number(),
        contingency: zod_1.z.number(),
    }),
    currency: zod_1.z.string(),
});
exports.zTimelineRiskAssessment = zod_1.z.object({
    overallRisk: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    risks: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        probability: zod_1.z.number().min(0).max(100),
        impact: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
        mitigation: zod_1.z.string(),
    })),
    recommendations: zod_1.z.array(zod_1.z.string()),
});
exports.zRePlanProposal = zod_1.z.object({
    id: zod_1.z.string(),
    triggerId: zod_1.z.string(),
    projectId: zod_1.z.string(),
    currentTimeline: exports.zWBS,
    proposedTimeline: exports.zWBS,
    changes: zod_1.z.object({
        shiftedTasks: zod_1.z.array(exports.zTaskShift),
        newDependencies: zod_1.z.array(exports.zWBSDependency),
        resourceChanges: zod_1.z.array(exports.zResourceChange),
        costImpact: exports.zCostImpact,
    }),
    impact: zod_1.z.object({
        totalDelay: zod_1.z.number(),
        criticalPathChanges: zod_1.z.array(zod_1.z.string()),
        riskAssessment: exports.zTimelineRiskAssessment,
        recommendations: zod_1.z.array(zod_1.z.string()),
    }),
    confirmation: zod_1.z.object({
        required: zod_1.z.boolean(),
        approver: zod_1.z.string().optional(),
        deadline: zod_1.z.date().optional(),
        autoApply: zod_1.z.boolean(),
    }),
    status: zod_1.z.enum(['draft', 'proposed', 'approved', 'rejected', 'applied']),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    appliedAt: zod_1.z.date().optional(),
});
exports.zRePlanPreview = zod_1.z.object({
    id: zod_1.z.string(),
    proposalId: zod_1.z.string(),
    beforeAfter: zod_1.z.object({
        before: zod_1.z.string(),
        after: zod_1.z.string(),
    }),
    changes: zod_1.z.object({
        summary: zod_1.z.string(),
        details: zod_1.z.array(zod_1.z.string()),
        affectedTasks: zod_1.z.number(),
        totalDelay: zod_1.z.number(),
        costImpact: zod_1.z.number(),
    }),
    impact: zod_1.z.object({
        summary: zod_1.z.string(),
        risks: zod_1.z.array(zod_1.z.string()),
        benefits: zod_1.z.array(zod_1.z.string()),
        recommendations: zod_1.z.array(zod_1.z.string()),
    }),
    actions: zod_1.z.object({
        approve: zod_1.z.boolean(),
        reject: zod_1.z.boolean(),
        modify: zod_1.z.boolean(),
        autoApply: zod_1.z.boolean(),
    }),
    createdAt: zod_1.z.date(),
});
exports.zProjectTimeline = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    wbs: exports.zWBS,
    rePlanHistory: zod_1.z.array(exports.zRePlanProposal),
    activeTriggers: zod_1.z.array(exports.zRePlanTrigger),
    status: zod_1.z.enum(['draft', 'active', 'completed', 'archived']),
    version: zod_1.z.number(),
    createdBy: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    lastRegeneratedAt: zod_1.z.date().optional(),
});
exports.zGenerateTimelineRequest = zod_1.z.object({
    projectId: zod_1.z.string(),
    options: zod_1.z
        .object({
        includeHistory: zod_1.z.boolean().optional(),
        forceRegenerate: zod_1.z.boolean().optional(),
        includeFacts: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.zGenerateTimelineResponse = zod_1.z.object({
    success: zod_1.z.boolean(),
    timeline: exports.zProjectTimeline,
    generatedAt: zod_1.z.date(),
    duration: zod_1.z.number(),
    factsUsed: zod_1.z.number(),
    tasksGenerated: zod_1.z.number(),
    criticalPathLength: zod_1.z.number(),
});
exports.zRePlanRequest = zod_1.z.object({
    projectId: zod_1.z.string(),
    cause: zod_1.z.string(),
    details: zod_1.z.any(),
    options: zod_1.z
        .object({
        autoApply: zod_1.z.boolean().optional(),
        includePreview: zod_1.z.boolean().optional(),
        notifyStakeholders: zod_1.z.boolean().optional(),
    })
        .optional(),
});
exports.zRePlanResponse = zod_1.z.object({
    success: zod_1.z.boolean(),
    trigger: exports.zRePlanTrigger,
    proposal: exports.zRePlanProposal,
    preview: exports.zRePlanPreview.optional(),
    applied: zod_1.z.boolean(),
    appliedAt: zod_1.z.date().optional(),
});
//# sourceMappingURL=timeline.js.map