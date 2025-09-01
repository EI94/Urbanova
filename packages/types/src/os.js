'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.zProjectSemanticIndex =
  exports.zProjectSemanticKPI =
  exports.zQnaAnswer =
  exports.zPlan =
  exports.zCapabilityContext =
  exports.zCapabilitySpec =
    void 0;
// Urbanova OS Types - Capability-based Operating System
const zod_1 = require('zod');
// ===========================================
// ZOD SCHEMAS
// ===========================================
exports.zCapabilitySpec = zod_1.z.object({
  name: zod_1.z.string().min(1),
  description: zod_1.z.string().min(1),
  zArgs: zod_1.z.any(), // Zod schema
  requiredRole: zod_1.z.enum(['owner', 'pm', 'sales', 'vendor']),
  confirm: zod_1.z.boolean().optional(),
  dryRun: zod_1.z.boolean().optional(),
});
exports.zCapabilityContext = zod_1.z.object({
  userId: zod_1.z.string().min(1),
  sender: zod_1.z.string().min(1),
  projectId: zod_1.z.string().optional(),
  now: zod_1.z.date(),
  logger: zod_1.z.any(), // Logger instance
  db: zod_1.z.any(), // Firestore instance
});
exports.zPlan = zod_1.z.object({
  mode: zod_1.z.enum(['QNA', 'ACTION']),
  intent: zod_1.z.string().optional(),
  args: zod_1.z.any().optional(),
  confidence: zod_1.z.number().min(0).max(1),
  projectId: zod_1.z.string().optional(),
});
exports.zQnaAnswer = zod_1.z.object({
  answer: zod_1.z.string().min(1),
  citations: zod_1.z.array(
    zod_1.z.object({
      title: zod_1.z.string().optional(),
      docId: zod_1.z.string().min(1),
      page: zod_1.z.number().optional(),
      url: zod_1.z.string().optional(),
    })
  ),
});
exports.zProjectSemanticKPI = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
  timestamp: zod_1.z.date(),
  metrics: zod_1.z.object({
    totalBudget: zod_1.z.number(),
    currentSpend: zod_1.z.number(),
    progress: zod_1.z.number().min(0).max(100),
    roi: zod_1.z.number(),
    riskLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']),
    status: zod_1.z.string(),
  }),
  lastUpdated: zod_1.z.date(),
});
exports.zProjectSemanticIndex = zod_1.z.object({
  projectId: zod_1.z.string().min(1),
  documents: zod_1.z.array(
    zod_1.z.object({
      docId: zod_1.z.string().min(1),
      title: zod_1.z.string(),
      textSnippet: zod_1.z.string(),
      url: zod_1.z.string().optional(),
      type: zod_1.z.string(),
      lastModified: zod_1.z.date(),
    })
  ),
  lastIndexed: zod_1.z.date(),
});
//# sourceMappingURL=os.js.map
