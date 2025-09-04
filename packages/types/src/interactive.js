"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = exports.zPlanPreview = exports.zPlanValidation = exports.zTaskSession = exports.zUserReply = exports.zInteractivePlan = exports.zRisk = exports.zAssumption = exports.zRequirement = exports.zPlanStep = exports.SessionStatus = void 0;
const zod_1 = require("zod");
// Session status enum
exports.SessionStatus = {
    COLLECTING: 'collecting',
    AWAITING_CONFIRM: 'awaiting_confirm',
    RUNNING: 'running',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
};
// Plan step with tool action
exports.zPlanStep = zod_1.z.object({
    id: zod_1.z.string(),
    toolId: zod_1.z.string(),
    action: zod_1.z.string(),
    description: zod_1.z.string(),
    zArgs: zod_1.z.record(zod_1.z.unknown()).optional(), // Will be validated against ToolActionSpec.zArgs later
    requiredRole: zod_1.z.string(),
    confirm: zod_1.z.boolean().optional(),
    longRunning: zod_1.z.boolean().optional(),
    order: zod_1.z.number(),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(), // IDs of steps this depends on
    onFailure: zod_1.z.enum(['stop', 'continue']).optional(),
    rollback: zod_1.z
        .object({
        toolId: zod_1.z.string(),
        action: zod_1.z.string(),
        args: zod_1.z.record(zod_1.z.unknown()),
    })
        .optional(),
});
// Requirements and assumptions
exports.zRequirement = zod_1.z.object({
    id: zod_1.z.string(),
    field: zod_1.z.string(),
    description: zod_1.z.string(),
    type: zod_1.z.enum(['text', 'number', 'select', 'date', 'boolean']),
    required: zod_1.z.boolean(),
    currentValue: zod_1.z.unknown().optional(),
    options: zod_1.z.array(zod_1.z.string()).optional(), // For select fields
});
exports.zAssumption = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string(),
    confidence: zod_1.z.enum(['low', 'medium', 'high']),
    source: zod_1.z.string().optional(),
});
exports.zRisk = zod_1.z.object({
    id: zod_1.z.string(),
    description: zod_1.z.string(),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    mitigation: zod_1.z.string().optional(),
});
// Plan structure
exports.zInteractivePlan = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    steps: zod_1.z.array(exports.zPlanStep),
    requirements: zod_1.z.array(exports.zRequirement),
    assumptions: zod_1.z.array(exports.zAssumption),
    risks: zod_1.z.array(exports.zRisk),
    estimatedDuration: zod_1.z.number().optional(), // in minutes
    totalCost: zod_1.z.number().optional(), // if applicable
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// User replies to plan
exports.zUserReply = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(['confirm', 'edit', 'dryrun', 'cancel', 'provide_value']),
    timestamp: zod_1.z.date(),
    userId: zod_1.z.string(),
    data: zod_1.z.record(zod_1.z.unknown()).optional(), // For edit/provide_value replies
});
// Task session
exports.zTaskSession = zod_1.z.object({
    id: zod_1.z.string(),
    projectId: zod_1.z.string().optional(),
    userId: zod_1.z.string(),
    status: zod_1.z.nativeEnum(exports.SessionStatus),
    plan: exports.zInteractivePlan,
    replies: zod_1.z.array(exports.zUserReply),
    currentStep: zod_1.z.number().optional(),
    startedAt: zod_1.z.date().optional(),
    completedAt: zod_1.z.date().optional(),
    error: zod_1.z.string().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
// Plan validation result
exports.zPlanValidation = zod_1.z.object({
    missing: zod_1.z.array(exports.zRequirement),
    ready: zod_1.z.boolean(),
    warnings: zod_1.z.array(zod_1.z.string()),
    errors: zod_1.z.array(zod_1.z.string()),
});
// Plan preview for chat rendering
exports.zPlanPreview = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    steps: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        description: zod_1.z.string(),
        toolId: zod_1.z.string(),
        action: zod_1.z.string(),
        status: zod_1.z.enum(['pending', 'ready', 'running', 'completed', 'failed']).optional(),
    })),
    missing: zod_1.z.array(exports.zRequirement),
    assumptions: zod_1.z.array(exports.zAssumption),
    risks: zod_1.z.array(exports.zRisk),
    estimatedDuration: zod_1.z.number().optional(),
    totalCost: zod_1.z.number().optional(),
    ctas: zod_1.z.array(zod_1.z.enum(['confirm', 'edit', 'dryrun', 'cancel'])),
});
// ToolRun types are now defined in tools.ts to avoid conflicts
// Export all schemas
exports.schemas = {
    zPlanStep: exports.zPlanStep,
    zRequirement: exports.zRequirement,
    zAssumption: exports.zAssumption,
    zRisk: exports.zRisk,
    zInteractivePlan: exports.zInteractivePlan,
    zUserReply: exports.zUserReply,
    zTaskSession: exports.zTaskSession,
    zPlanValidation: exports.zPlanValidation,
    zPlanPreview: exports.zPlanPreview,
};
//# sourceMappingURL=interactive.js.map