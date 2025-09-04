"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimelineTool = exports.timelineActions = exports.timelineManifest = void 0;
const timelineTool_1 = require("./timelineTool");
Object.defineProperty(exports, "TimelineTool", { enumerable: true, get: function () { return timelineTool_1.TimelineTool; } });
/**
 * Timeline Tool Manifest
 *
 * Sistema di timeline reale basato su fatti reali:
 * - Auto WBS da stati reali (Doc Hunter, Procurement, SAL, Listing)
 * - Re-Plan automatico con trigger reali
 * - Critical path dinamico
 * - Preview→Confirm workflow
 */
exports.timelineManifest = {
    id: 'timeline',
    name: 'Timeline Management',
    description: 'Sistema di timeline reale basato su fatti reali con Auto WBS e Re-Plan automatico',
    version: '1.0.0',
    category: 'project_management',
    capabilities: [
        'auto_wbs_generation',
        'real_time_updates',
        'critical_path_calculation',
        'replan_trigger_detection',
        'impact_analysis',
        'preview_confirmation_workflow',
        'gantt_visualization',
        'fact_integration',
    ],
    features: [
        {
            name: 'Auto WBS',
            description: 'Generazione automatica WBS da fatti reali',
            enabled: true,
        },
        {
            name: 'Re-Plan',
            description: 'Ripianificazione automatica con trigger reali',
            enabled: true,
        },
        {
            name: 'Critical Path',
            description: 'Calcolo dinamico percorso critico',
            enabled: true,
        },
        {
            name: 'Fact Integration',
            description: 'Integrazione con Doc Hunter, Procurement, SAL, Listing',
            enabled: true,
        },
        {
            name: 'Preview→Confirm',
            description: 'Workflow di conferma per ripianificazioni',
            enabled: true,
        },
        {
            name: 'Gantt Visualization',
            description: 'Visualizzazione Gantt SVG con critical path',
            enabled: true,
        },
    ],
    integrations: [
        {
            service: 'doc_hunter',
            description: 'Fatti documenti vendor',
            status: 'integrated',
        },
        {
            service: 'procurement',
            description: 'Fatti RDO e offerte',
            status: 'integrated',
        },
        {
            service: 'sal',
            description: 'Fatti autorizzazioni',
            status: 'integrated',
        },
        {
            service: 'listing',
            description: 'Fatti pubblicazione',
            status: 'integrated',
        },
        {
            service: 'firestore',
            description: 'Persistenza timeline',
            status: 'integrated',
        },
    ],
    security: {
        authentication: 'required',
        authorization: 'project_based',
        dataEncryption: 'enabled',
        auditLogging: 'enabled',
    },
    compliance: {
        gdpr: 'compliant',
        dataRetention: 'configurable',
        accessControl: 'enabled',
    },
    performance: {
        responseTime: '< 2s',
        throughput: '1000 req/min',
        scalability: 'horizontal',
    },
    documentation: {
        api: 'https://docs.urbanova.com/timeline',
        examples: 'https://docs.urbanova.com/timeline/examples',
        tutorials: 'https://docs.urbanova.com/timeline/tutorials',
    },
    support: {
        email: 'timeline@urbanova.com',
        slack: '#timeline-support',
        documentation: 'https://docs.urbanova.com/timeline',
    },
};
/**
 * Timeline Actions
 */
exports.timelineActions = [
    {
        id: 'timeline.generate',
        name: 'Generate Timeline',
        description: 'Genera timeline da fatti reali con Auto WBS',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
            options: {
                type: 'object',
                description: 'Opzioni di generazione',
                required: false,
                properties: {
                    includeHistory: {
                        type: 'boolean',
                        description: 'Includi storico re-plan',
                        default: false,
                    },
                    forceRegenerate: {
                        type: 'boolean',
                        description: 'Forza rigenerazione',
                        default: false,
                    },
                    includeFacts: {
                        type: 'boolean',
                        description: 'Includi fatti sorgente',
                        default: true,
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new timelineTool_1.TimelineTool();
            return await tool.generateTimeline(params.projectId, params.options);
        },
    },
    {
        id: 'timeline.replan',
        name: 'Re-Plan Timeline',
        description: 'Ripianifica timeline con trigger reali',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
            cause: {
                type: 'string',
                description: 'Causa del re-plan',
                required: true,
            },
            details: {
                type: 'object',
                description: 'Dettagli del trigger',
                required: true,
            },
            options: {
                type: 'object',
                description: 'Opzioni re-plan',
                required: false,
                properties: {
                    autoApply: {
                        type: 'boolean',
                        description: 'Applica automaticamente',
                        default: false,
                    },
                    includePreview: {
                        type: 'boolean',
                        description: 'Includi preview',
                        default: true,
                    },
                    notifyStakeholders: {
                        type: 'boolean',
                        description: 'Notifica stakeholder',
                        default: true,
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new timelineTool_1.TimelineTool();
            return await tool.replanTimeline(params.projectId, params.cause, params.details, params.options);
        },
    },
    {
        id: 'timeline.get_status',
        name: 'Get Timeline Status',
        description: 'Ottieni status timeline corrente',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
        },
        handler: async (params, context) => {
            const tool = new timelineTool_1.TimelineTool();
            return await tool.getTimelineStatus(params.projectId);
        },
    },
    {
        id: 'timeline.get_critical_path',
        name: 'Get Critical Path',
        description: 'Ottieni percorso critico corrente',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
        },
        handler: async (params, context) => {
            const tool = new timelineTool_1.TimelineTool();
            return await tool.getCriticalPath(params.projectId);
        },
    },
    {
        id: 'timeline.detect_triggers',
        name: 'Detect Re-Plan Triggers',
        description: 'Rileva trigger per re-plan',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
        },
        handler: async (params, context) => {
            const tool = new timelineTool_1.TimelineTool();
            return await tool.detectTriggers(params.projectId);
        },
    },
    {
        id: 'timeline.generate_gantt',
        name: 'Generate Gantt Chart',
        description: 'Genera Gantt SVG con critical path',
        parameters: {
            projectId: {
                type: 'string',
                description: 'ID del progetto',
                required: true,
            },
            options: {
                type: 'object',
                description: 'Opzioni Gantt',
                required: false,
                properties: {
                    showCriticalPath: {
                        type: 'boolean',
                        description: 'Mostra critical path',
                        default: true,
                    },
                    showProgress: {
                        type: 'boolean',
                        description: 'Mostra progresso',
                        default: true,
                    },
                    showDependencies: {
                        type: 'boolean',
                        description: 'Mostra dipendenze',
                        default: true,
                    },
                    width: {
                        type: 'number',
                        description: 'Larghezza SVG',
                        default: 1200,
                    },
                    height: {
                        type: 'number',
                        description: 'Altezza SVG',
                        default: 600,
                    },
                },
            },
        },
        handler: async (params, context) => {
            const tool = new timelineTool_1.TimelineTool();
            return await tool.generateGanttChart(params.projectId, params.options);
        },
    },
];
//# sourceMappingURL=index.js.map