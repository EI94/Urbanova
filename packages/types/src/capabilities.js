'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zProjectAliasResolution =
  exports.CHAT_INTENT_PATTERNS =
  exports.zSensitivityResult =
  exports.zSensitivityArgs =
  exports.zProjectSummary =
  exports.zProjectSummaryArgs =
    void 0;
// Core Capabilities Types - Urbanova OS
const zod_1 = require('zod');
// ===========================================
// PROJECT GET SUMMARY CAPABILITY
// ===========================================
exports.zProjectSummaryArgs = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
});
exports.zProjectSummary = zod_1.z.object({
  roi: zod_1.z.number().optional(),
  marginPct: zod_1.z.number().optional(),
  paybackYears: zod_1.z.number().optional(),
  docs: zod_1.z.object({
    complete: zod_1.z.number(),
    total: zod_1.z.number(),
    missing: zod_1.z.array(zod_1.z.string()),
  }),
  milestones: zod_1.z.array(
    zod_1.z.object({
      title: zod_1.z.string(),
      due: zod_1.z.string(),
      status: zod_1.z.enum(['due', 'overdue', 'ok']),
    })
  ),
});
// ===========================================
// FEASIBILITY SENSITIVITY CAPABILITY
// ===========================================
exports.zSensitivityArgs = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
  deltas: zod_1.z.array(zod_1.z.number().min(-0.2).max(0.2)).min(1).max(10),
});
exports.zSensitivityResult = zod_1.z.object({
  baseRoi: zod_1.z.number(),
  range: zod_1.z.object({
    min: zod_1.z.number(),
    max: zod_1.z.number(),
  }),
  pdfUrl: zod_1.z.string().url(),
});
exports.CHAT_INTENT_PATTERNS = {
  summary: [
    'riepilogo',
    'summary',
    "com'è messo",
    'stato documenti',
    'kpi',
    'stato progetto',
    'progresso',
    'documenti mancanti',
    'milestone',
  ],
  sensitivity: [
    'sensitivity',
    '±',
    'scenario',
    'variazione costi',
    'variazione prezzi',
    'analisi sensibilità',
    'scenari',
    'variazioni',
    'simulazione',
  ],
};
exports.zProjectAliasResolution = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
  projectName: zod_1.z.string().optional(),
  confidence: zod_1.z.number().min(0).max(1),
});
//# sourceMappingURL=capabilities.js.map
