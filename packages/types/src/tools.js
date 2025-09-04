"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zToolExecutionResult = exports.zTool = exports.zToolRun = exports.zToolRunSubStep = exports.zToolInstall = exports.zToolActionSpec = exports.zToolManifest = void 0;
// Urbanova Tool OS Types
const zod_1 = require("zod");
exports.zToolManifest = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    version: zod_1.z.string().regex(/^\d+\.\d+\.\d+$/),
    icon: zod_1.z.string().url().optional(),
    category: zod_1.z.enum([
        'feasibility',
        'scraping',
        'analysis',
        'integration',
        'automation',
        'reporting',
        'other',
    ]),
    description: zod_1.z.string().min(10),
    author: zod_1.z.string().optional(),
    website: zod_1.z.string().url().optional(),
    intents: zod_1.z.array(zod_1.z.string()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    dependencies: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.zToolActionSpec = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(10),
    zArgs: zod_1.z.any(), // Zod schema
    requiredRole: zod_1.z.enum(['owner', 'pm', 'sales', 'vendor', 'admin']),
    confirm: zod_1.z.boolean().optional(),
    longRunning: zod_1.z.boolean().optional(),
    timeout: zod_1.z.number().positive().optional(),
    retryPolicy: zod_1.z
        .object({
        maxRetries: zod_1.z.number().min(0),
        backoffMs: zod_1.z.number().positive(),
        maxBackoffMs: zod_1.z.number().positive(),
    })
        .optional(),
    // Extended fields for PlanExecutionEngine
    onFailure: zod_1.z.enum(['stop', 'continue']).optional(),
    rollback: zod_1.z
        .object({
        toolId: zod_1.z.string(),
        action: zod_1.z.string(),
        args: zod_1.z.record(zod_1.z.unknown()),
    })
        .optional(),
});
exports.zToolInstall = zod_1.z.object({
    workspaceId: zod_1.z.string().min(1),
    toolId: zod_1.z.string().min(1),
    enabled: zod_1.z.boolean(),
    config: zod_1.z.record(zod_1.z.unknown()).optional(),
    secrets: zod_1.z.record(zod_1.z.string()).optional(),
    installedAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    installedBy: zod_1.z.string().min(1),
    version: zod_1.z.string().min(1),
});
exports.zToolRunSubStep = zod_1.z.object({
    stepId: zod_1.z.string().min(1),
    status: zod_1.z.enum(['pending', 'running', 'succeeded', 'failed', 'cancelled']),
    startedAt: zod_1.z.date(),
    finishedAt: zod_1.z.date().optional(),
    outputRef: zod_1.z.string().optional(),
    error: zod_1.z.string().optional(),
    retryCount: zod_1.z.number().min(0),
    maxRetries: zod_1.z.number().min(1),
});
exports.zToolRun = zod_1.z.object({
    id: zod_1.z.string().min(1),
    toolId: zod_1.z.string().min(1),
    action: zod_1.z.string().min(1),
    projectId: zod_1.z.string().min(1).optional(),
    workspaceId: zod_1.z.string().min(1),
    userId: zod_1.z.string().min(1),
    status: zod_1.z.enum([
        'pending',
        'running',
        'completed',
        'succeeded',
        'failed',
        'cancelled',
        'timeout',
    ]),
    startedAt: zod_1.z.date(),
    finishedAt: zod_1.z.date().optional(),
    args: zod_1.z.record(zod_1.z.unknown()),
    output: zod_1.z.unknown().optional(),
    error: zod_1.z.string().optional(),
    logs: zod_1.z.array(zod_1.z.string()),
    progress: zod_1.z.number().min(0).max(100).optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    cancelledAt: zod_1.z.date().optional(),
    cancelledBy: zod_1.z.string().optional(),
    // Extended fields for PlanExecutionEngine
    sessionId: zod_1.z.string().optional(),
    planId: zod_1.z.string().optional(),
    subRuns: zod_1.z.array(exports.zToolRunSubStep).optional(),
    outputs: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.zTool = zod_1.z.object({
    manifest: exports.zToolManifest,
    actions: zod_1.z.array(exports.zToolActionSpec),
    uiExtensions: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z.enum(['button', 'form', 'widget']),
        location: zod_1.z.enum(['project-header', 'project-sidebar', 'dashboard', 'chat']),
        component: zod_1.z.string(),
        props: zod_1.z.record(zod_1.z.unknown()).optional(),
    }))
        .optional(),
});
exports.zToolExecutionResult = zod_1.z.object({
    success: zod_1.z.boolean(),
    data: zod_1.z.unknown().optional(),
    error: zod_1.z.string().optional(),
    executionTime: zod_1.z.number().positive(),
    toolId: zod_1.z.string().min(1),
    action: zod_1.z.string().min(1),
    runId: zod_1.z.string().min(1),
    logs: zod_1.z.array(zod_1.z.string()),
    // Support for PlanExecutionEngine
    outputRef: zod_1.z.string().optional(),
});
//# sourceMappingURL=tools.js.map